from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
import base64
from datetime import datetime, timezone
from geopy.distance import geodesic
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutSessionRequest

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
PLATFORM_COMMISSION = 0.15  # 15% commission

app = FastAPI(title="GuyaneConnect API")
api_router = APIRouter(prefix="/api")

# =============================================================================
# MODELS
# =============================================================================

class Location(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None

class DeliveryRequestCreate(BaseModel):
    request_type: str  # "heavy", "groceries", "transport"
    title: str
    description: Optional[str] = None
    pickup_location: Location
    dropoff_location: Location
    product_type: Optional[str] = None
    photo_url: Optional[str] = None
    proposed_price: float
    desired_time: Optional[str] = None
    vehicle_type: Optional[str] = None  # "car", "pickup", "van"
    needs_helper: bool = False
    client_name: str
    client_phone: Optional[str] = None

class DeliveryRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_type: str
    title: str
    description: Optional[str] = None
    pickup_location: Dict[str, Any]
    dropoff_location: Dict[str, Any]
    product_type: Optional[str] = None
    photo_url: Optional[str] = None
    proposed_price: float
    desired_time: Optional[str] = None
    vehicle_type: Optional[str] = None
    needs_helper: bool = False
    client_name: str
    client_phone: Optional[str] = None
    status: str = "pending"  # pending, accepted, in_progress, completed, cancelled
    deliverer_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    accepted_at: Optional[str] = None
    completed_at: Optional[str] = None
    payment_status: str = "unpaid"  # unpaid, pending, paid

class DelivererCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    vehicle_type: str
    photo_url: Optional[str] = None
    current_location: Location

class Deliverer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: Optional[str] = None
    vehicle_type: str
    photo_url: Optional[str] = None
    current_location: Dict[str, Any]
    status: str = "offline"  # offline, available, busy
    trip_announcement: Optional[str] = None
    rating: float = 5.0
    total_deliveries: int = 0
    is_premium: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DelivererUpdate(BaseModel):
    status: Optional[str] = None
    current_location: Optional[Location] = None
    trip_announcement: Optional[str] = None

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    sender_type: str  # "client" or "deliverer"
    sender_name: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatMessageCreate(BaseModel):
    request_id: str
    sender_type: str
    sender_name: str
    message: str

class Rating(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    deliverer_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RatingCreate(BaseModel):
    request_id: str
    deliverer_id: str
    rating: int
    comment: Optional[str] = None

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    session_id: str
    amount: float
    currency: str = "eur"
    platform_fee: float
    deliverer_payout: float
    payment_status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_type: str  # "deliverer" or "client"
    recipient_id: Optional[str] = None
    title: str
    message: str
    type: str  # "new_request", "request_accepted", "delivery_completed", "trip_announcement"
    data: Optional[Dict[str, Any]] = None
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def calculate_distance(loc1: Dict, loc2: Dict) -> float:
    """Calculate distance in km between two locations"""
    return geodesic((loc1['lat'], loc1['lng']), (loc2['lat'], loc2['lng'])).km

def estimate_price(distance_km: float, request_type: str, needs_helper: bool) -> float:
    """Estimate delivery price based on distance and type"""
    base_prices = {"heavy": 20.0, "groceries": 5.0, "transport": 10.0}
    price_per_km = {"heavy": 2.0, "groceries": 1.0, "transport": 1.5}
    
    base = base_prices.get(request_type, 10.0)
    per_km = price_per_km.get(request_type, 1.5)
    total = base + (distance_km * per_km)
    
    if needs_helper:
        total *= 1.5
    
    return round(total, 2)

# =============================================================================
# API ROUTES
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "GuyaneConnect API", "version": "1.0.0"}

# --- Delivery Requests ---

@api_router.post("/requests", response_model=DeliveryRequest)
async def create_delivery_request(request: DeliveryRequestCreate):
    delivery = DeliveryRequest(
        request_type=request.request_type,
        title=request.title,
        description=request.description,
        pickup_location=request.pickup_location.model_dump(),
        dropoff_location=request.dropoff_location.model_dump(),
        product_type=request.product_type,
        photo_url=request.photo_url,
        proposed_price=request.proposed_price,
        desired_time=request.desired_time,
        vehicle_type=request.vehicle_type,
        needs_helper=request.needs_helper,
        client_name=request.client_name,
        client_phone=request.client_phone
    )
    
    doc = delivery.model_dump()
    await db.delivery_requests.insert_one(doc)
    
    # Create notification for nearby deliverers
    notification = Notification(
        recipient_type="deliverer",
        title="Nouvelle demande de livraison",
        message=f"{request.title} - {request.proposed_price}€",
        type="new_request",
        data={"request_id": delivery.id}
    )
    await db.notifications.insert_one(notification.model_dump())
    
    return delivery

@api_router.get("/requests", response_model=List[DeliveryRequest])
async def get_delivery_requests(status: Optional[str] = None, limit: int = 50):
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.delivery_requests.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return requests

@api_router.get("/requests/{request_id}", response_model=DeliveryRequest)
async def get_delivery_request(request_id: str):
    request = await db.delivery_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@api_router.post("/requests/{request_id}/accept")
async def accept_delivery_request(request_id: str, deliverer_id: str):
    request = await db.delivery_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Request already accepted or not available")
    
    await db.delivery_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "accepted",
            "deliverer_id": deliverer_id,
            "accepted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await db.deliverers.update_one({"id": deliverer_id}, {"$set": {"status": "busy"}})
    
    # Create notification
    notification = Notification(
        recipient_type="client",
        title="Demande acceptée",
        message="Un livreur a accepté votre demande",
        type="request_accepted",
        data={"request_id": request_id, "deliverer_id": deliverer_id}
    )
    await db.notifications.insert_one(notification.model_dump())
    
    return {"message": "Request accepted", "request_id": request_id}

@api_router.post("/requests/{request_id}/complete")
async def complete_delivery_request(request_id: str):
    request = await db.delivery_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.delivery_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if request.get("deliverer_id"):
        await db.deliverers.update_one(
            {"id": request["deliverer_id"]},
            {"$set": {"status": "available"}, "$inc": {"total_deliveries": 1}}
        )
    
    return {"message": "Delivery completed", "request_id": request_id}

@api_router.post("/requests/{request_id}/cancel")
async def cancel_delivery_request(request_id: str):
    request = await db.delivery_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.delivery_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "cancelled"}}
    )
    
    if request.get("deliverer_id"):
        await db.deliverers.update_one({"id": request["deliverer_id"]}, {"$set": {"status": "available"}})
    
    return {"message": "Request cancelled", "request_id": request_id}

# --- Deliverers ---

@api_router.post("/deliverers", response_model=Deliverer)
async def create_deliverer(deliverer: DelivererCreate):
    new_deliverer = Deliverer(
        name=deliverer.name,
        phone=deliverer.phone,
        vehicle_type=deliverer.vehicle_type,
        photo_url=deliverer.photo_url,
        current_location=deliverer.current_location.model_dump()
    )
    
    doc = new_deliverer.model_dump()
    await db.deliverers.insert_one(doc)
    return new_deliverer

@api_router.get("/deliverers", response_model=List[Deliverer])
async def get_deliverers(status: Optional[str] = None, vehicle_type: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if vehicle_type:
        query["vehicle_type"] = vehicle_type
    
    deliverers = await db.deliverers.find(query, {"_id": 0}).to_list(100)
    return deliverers

@api_router.get("/deliverers/{deliverer_id}", response_model=Deliverer)
async def get_deliverer(deliverer_id: str):
    deliverer = await db.deliverers.find_one({"id": deliverer_id}, {"_id": 0})
    if not deliverer:
        raise HTTPException(status_code=404, detail="Deliverer not found")
    return deliverer

@api_router.patch("/deliverers/{deliverer_id}", response_model=Deliverer)
async def update_deliverer(deliverer_id: str, update: DelivererUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if "current_location" in update_data:
        update_data["current_location"] = update_data["current_location"]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    await db.deliverers.update_one({"id": deliverer_id}, {"$set": update_data})
    
    deliverer = await db.deliverers.find_one({"id": deliverer_id}, {"_id": 0})
    if not deliverer:
        raise HTTPException(status_code=404, detail="Deliverer not found")
    
    # If trip announcement, create notification
    if update.trip_announcement:
        notification = Notification(
            recipient_type="client",
            title="Livreur en déplacement",
            message=update.trip_announcement,
            type="trip_announcement",
            data={"deliverer_id": deliverer_id}
        )
        await db.notifications.insert_one(notification.model_dump())
    
    return deliverer

@api_router.get("/deliverers/nearby/{lat}/{lng}")
async def get_nearby_deliverers(lat: float, lng: float, radius_km: float = 10.0):
    deliverers = await db.deliverers.find({"status": "available"}, {"_id": 0}).to_list(100)
    
    nearby = []
    for d in deliverers:
        if d.get("current_location"):
            distance = calculate_distance(
                {"lat": lat, "lng": lng},
                d["current_location"]
            )
            if distance <= radius_km:
                d["distance_km"] = round(distance, 2)
                nearby.append(d)
    
    return sorted(nearby, key=lambda x: x.get("distance_km", 999))

# --- Chat ---

@api_router.post("/chat", response_model=ChatMessage)
async def send_chat_message(message: ChatMessageCreate):
    chat_msg = ChatMessage(
        request_id=message.request_id,
        sender_type=message.sender_type,
        sender_name=message.sender_name,
        message=message.message
    )
    
    doc = chat_msg.model_dump()
    await db.chat_messages.insert_one(doc)
    return chat_msg

@api_router.get("/chat/{request_id}", response_model=List[ChatMessage])
async def get_chat_messages(request_id: str):
    messages = await db.chat_messages.find(
        {"request_id": request_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return messages

# --- Ratings ---

@api_router.post("/ratings", response_model=Rating)
async def create_rating(rating: RatingCreate):
    if rating.rating < 1 or rating.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    new_rating = Rating(
        request_id=rating.request_id,
        deliverer_id=rating.deliverer_id,
        rating=rating.rating,
        comment=rating.comment
    )
    
    await db.ratings.insert_one(new_rating.model_dump())
    
    # Update deliverer average rating
    ratings = await db.ratings.find({"deliverer_id": rating.deliverer_id}).to_list(1000)
    if ratings:
        avg_rating = sum(r["rating"] for r in ratings) / len(ratings)
        await db.deliverers.update_one(
            {"id": rating.deliverer_id},
            {"$set": {"rating": round(avg_rating, 1)}}
        )
    
    return new_rating

@api_router.get("/ratings/{deliverer_id}", response_model=List[Rating])
async def get_deliverer_ratings(deliverer_id: str):
    ratings = await db.ratings.find({"deliverer_id": deliverer_id}, {"_id": 0}).to_list(100)
    return ratings

# --- Notifications ---

@api_router.get("/notifications")
async def get_notifications(recipient_type: Optional[str] = None, unread_only: bool = False):
    query = {}
    if recipient_type:
        query["recipient_type"] = recipient_type
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return notifications

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await db.notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
    return {"message": "Notification marked as read"}

# --- Payments ---

@api_router.post("/payments/create-checkout")
async def create_payment_checkout(request_id: str, http_request: Request):
    delivery_request = await db.delivery_requests.find_one({"id": request_id})
    if not delivery_request:
        raise HTTPException(status_code=404, detail="Delivery request not found")
    
    amount = float(delivery_request["proposed_price"])
    platform_fee = round(amount * PLATFORM_COMMISSION, 2)
    deliverer_payout = round(amount - platform_fee, 2)
    
    host_url = str(http_request.headers.get("origin", http_request.base_url))
    webhook_url = f"{str(http_request.base_url)}api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{host_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/request/{request_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "request_id": request_id,
            "platform_fee": str(platform_fee),
            "deliverer_payout": str(deliverer_payout)
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        request_id=request_id,
        session_id=session.session_id,
        amount=amount,
        currency="eur",
        platform_fee=platform_fee,
        deliverer_payout=deliverer_payout,
        payment_status="pending"
    )
    await db.payment_transactions.insert_one(transaction.model_dump())
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, http_request: Request):
    webhook_url = f"{str(http_request.base_url)}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    if status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid"}}
        )
        
        # Update delivery request payment status
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction:
            await db.delivery_requests.update_one(
                {"id": transaction["request_id"]},
                {"$set": {"payment_status": "paid"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    # Process webhook (simplified for MVP)
    return {"received": True}

# --- Price Estimation ---

class PriceEstimationRequest(BaseModel):
    pickup: Location
    dropoff: Location
    request_type: str
    needs_helper: bool = False

@api_router.post("/estimate-price")
async def estimate_delivery_price(request: PriceEstimationRequest):
    distance = calculate_distance(request.pickup.model_dump(), request.dropoff.model_dump())
    price = estimate_price(distance, request.request_type, request.needs_helper)
    
    return {
        "distance_km": round(distance, 2),
        "estimated_price": price,
        "platform_fee": round(price * PLATFORM_COMMISSION, 2),
        "deliverer_payout": round(price * (1 - PLATFORM_COMMISSION), 2)
    }

# --- File Upload ---

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload image file and return URL"""
    try:
        # Generate unique filename
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = UPLOAD_DIR / filename
        
        # Save file
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        
        return {"filename": filename, "url": f"/api/uploads/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/uploads/{filename}")
async def get_upload(filename: str):
    """Serve uploaded file"""
    from fastapi.responses import FileResponse
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

# --- GPS Tracking ---

class LocationUpdate(BaseModel):
    deliverer_id: str
    lat: float
    lng: float
    request_id: Optional[str] = None

@api_router.post("/tracking/update")
async def update_location(update: LocationUpdate):
    """Update deliverer location for real-time tracking"""
    # Update deliverer location
    await db.deliverers.update_one(
        {"id": update.deliverer_id},
        {"$set": {
            "current_location": {"lat": update.lat, "lng": update.lng},
            "last_location_update": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # If tracking a specific delivery, store tracking history
    if update.request_id:
        tracking_point = {
            "id": str(uuid.uuid4()),
            "request_id": update.request_id,
            "deliverer_id": update.deliverer_id,
            "lat": update.lat,
            "lng": update.lng,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.tracking_history.insert_one(tracking_point)
    
    return {"status": "updated"}

@api_router.get("/tracking/{request_id}")
async def get_tracking(request_id: str):
    """Get current location and tracking history for a delivery"""
    request = await db.delivery_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    deliverer = None
    if request.get("deliverer_id"):
        deliverer = await db.deliverers.find_one({"id": request["deliverer_id"]}, {"_id": 0})
    
    # Get recent tracking points
    tracking_points = await db.tracking_history.find(
        {"request_id": request_id}, {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    return {
        "request": request,
        "deliverer": deliverer,
        "current_location": deliverer.get("current_location") if deliverer else None,
        "tracking_history": tracking_points
    }

# =============================================================================
# APP SETUP
# =============================================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
