import requests
import sys
import json
from datetime import datetime

class GuyaneConnectAPITester:
    def __init__(self, base_url="https://colivery-guyane.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_ids = {
            "deliverers": [],
            "requests": [],
            "chat_messages": [],
            "ratings": []
        }

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            if success:
                self.log_test(name, True, f"Status: {response.status_code}", response_data)
                return True, response_data
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response_data}", response_data)
                return False, response_data

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Endpoint",
            "GET",
            "",
            200
        )
        if success and isinstance(response, dict):
            if "GuyaneConnect API" in response.get("message", ""):
                return True
        return False

    def test_create_deliverer(self):
        """Test creating a deliverer"""
        deliverer_data = {
            "name": f"Test Deliverer {datetime.now().strftime('%H%M%S')}",
            "phone": "+594694123456",
            "vehicle_type": "car",
            "current_location": {
                "lat": 4.9372,
                "lng": -52.3267,
                "address": "Cayenne, Guyane française"
            }
        }
        
        success, response = self.run_test(
            "Create Deliverer",
            "POST",
            "deliverers",
            200,
            data=deliverer_data
        )
        
        if success and response.get('id'):
            self.created_ids["deliverers"].append(response['id'])
            return response['id']
        return None

    def test_get_deliverers(self):
        """Test getting deliverers"""
        success, response = self.run_test(
            "Get Deliverers",
            "GET",
            "deliverers",
            200
        )
        return success

    def test_update_deliverer_status(self, deliverer_id):
        """Test updating deliverer status"""
        if not deliverer_id:
            self.log_test("Update Deliverer Status", False, "No deliverer ID provided")
            return False
            
        update_data = {
            "status": "available",
            "current_location": {
                "lat": 4.9372,
                "lng": -52.3267
            }
        }
        
        success, response = self.run_test(
            "Update Deliverer Status",
            "PATCH",
            f"deliverers/{deliverer_id}",
            200,
            data=update_data
        )
        return success

    def test_create_delivery_request(self):
        """Test creating a delivery request"""
        request_data = {
            "request_type": "heavy",
            "title": f"Test Delivery {datetime.now().strftime('%H%M%S')}",
            "description": "Test delivery request for API testing",
            "pickup_location": {
                "lat": 4.9372,
                "lng": -52.3267,
                "address": "Cayenne Centre"
            },
            "dropoff_location": {
                "lat": 4.9500,
                "lng": -52.3100,
                "address": "Remire-Montjoly"
            },
            "product_type": "furniture",
            "proposed_price": 25.0,
            "desired_time": "14:00",
            "vehicle_type": "pickup",
            "needs_helper": True,
            "client_name": "Test Client",
            "client_phone": "+594694987654"
        }
        
        success, response = self.run_test(
            "Create Delivery Request",
            "POST",
            "requests",
            200,
            data=request_data
        )
        
        if success and response.get('id'):
            self.created_ids["requests"].append(response['id'])
            return response['id']
        return None

    def test_get_delivery_requests(self):
        """Test getting delivery requests"""
        success, response = self.run_test(
            "Get All Delivery Requests",
            "GET",
            "requests",
            200
        )
        return success

    def test_get_specific_request(self, request_id):
        """Test getting specific request"""
        if not request_id:
            self.log_test("Get Specific Request", False, "No request ID provided")
            return False
            
        success, response = self.run_test(
            "Get Specific Request",
            "GET",
            f"requests/{request_id}",
            200
        )
        return success

    def test_accept_request(self, request_id, deliverer_id):
        """Test accepting a delivery request"""
        if not request_id or not deliverer_id:
            self.log_test("Accept Request", False, "Missing request or deliverer ID")
            return False
            
        success, response = self.run_test(
            "Accept Request",
            "POST",
            f"requests/{request_id}/accept?deliverer_id={deliverer_id}",
            200
        )
        return success

    def test_complete_request(self, request_id):
        """Test completing a delivery request"""
        if not request_id:
            self.log_test("Complete Request", False, "No request ID provided")
            return False
            
        success, response = self.run_test(
            "Complete Request",
            "POST",
            f"requests/{request_id}/complete",
            200
        )
        return success

    def test_price_estimation(self):
        """Test price estimation"""
        estimation_data = {
            "pickup": {
                "lat": 4.9372,
                "lng": -52.3267
            },
            "dropoff": {
                "lat": 4.9500,
                "lng": -52.3100
            },
            "request_type": "heavy",
            "needs_helper": True
        }
        
        success, response = self.run_test(
            "Price Estimation",
            "POST",
            "estimate-price",
            200,
            data=estimation_data
        )
        
        if success and response:
            expected_fields = ["distance_km", "estimated_price", "platform_fee", "deliverer_payout"]
            has_all_fields = all(field in response for field in expected_fields)
            if not has_all_fields:
                self.log_test("Price Estimation Fields", False, f"Missing fields in response: {response}")
                return False
        
        return success

    def test_chat_messages(self, request_id):
        """Test chat functionality"""
        if not request_id:
            self.log_test("Chat Messages", False, "No request ID provided")
            return False
            
        # Send a chat message
        message_data = {
            "request_id": request_id,
            "sender_type": "client",
            "sender_name": "Test Client",
            "message": "Hello, is the delivery still on schedule?"
        }
        
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            "chat",
            200,
            data=message_data
        )
        
        if success:
            # Get chat messages
            success2, response2 = self.run_test(
                "Get Chat Messages",
                "GET",
                f"chat/{request_id}",
                200
            )
            return success2
        
        return False

    def test_rating_system(self, request_id, deliverer_id):
        """Test rating system"""
        if not request_id or not deliverer_id:
            self.log_test("Rating System", False, "Missing request or deliverer ID")
            return False
            
        rating_data = {
            "request_id": request_id,
            "deliverer_id": deliverer_id,
            "rating": 5,
            "comment": "Excellent service, very professional!"
        }
        
        success, response = self.run_test(
            "Create Rating",
            "POST",
            "ratings",
            200,
            data=rating_data
        )
        
        if success:
            # Get deliverer ratings
            success2, response2 = self.run_test(
                "Get Deliverer Ratings",
                "GET",
                f"ratings/{deliverer_id}",
                200
            )
            return success2
        
        return False

def main():
    print("🚀 Starting GuyaneConnect API Tests...")
    print("=" * 50)
    
    tester = GuyaneConnectAPITester()
    
    # Test API root
    if not tester.test_root_endpoint():
        print("❌ API root endpoint failed, stopping tests")
        return 1
    
    # Test deliverer creation and management
    deliverer_id = tester.test_create_deliverer()
    tester.test_get_deliverers()
    tester.test_update_deliverer_status(deliverer_id)
    
    # Test delivery request creation and management
    request_id = tester.test_create_delivery_request()
    tester.test_get_delivery_requests()
    tester.test_get_specific_request(request_id)
    
    # Test price estimation
    tester.test_price_estimation()
    
    # Test request acceptance and completion flow
    if request_id and deliverer_id:
        tester.test_accept_request(request_id, deliverer_id)
        tester.test_complete_request(request_id)
        
        # Test chat and rating
        tester.test_chat_messages(request_id)
        tester.test_rating_system(request_id, deliverer_id)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": tester.tests_passed/tester.tests_run*100,
            "test_results": tester.test_results,
            "created_test_data": tester.created_ids
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())