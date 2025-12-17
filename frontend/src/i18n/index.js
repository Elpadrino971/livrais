import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Navigation
      "nav.home": "Accueil",
      "nav.requests": "Demandes",
      "nav.deliverer": "Livreur",
      "nav.history": "Historique",
      "nav.settings": "Paramètres",
      
      // Home
      "home.title": "Livraison collaborative en Guyane",
      "home.subtitle": "Envoyez vos colis, faites vos courses, avec l'aide de vos voisins",
      "home.createRequest": "Créer une demande",
      "home.becomeDeliverer": "Devenir livreur",
      "home.nearbyDeliverers": "Livreurs à proximité",
      "home.activeRequests": "Demandes actives",
      
      // Request Types
      "request.heavy": "Livraison lourde",
      "request.groceries": "Courses",
      "request.transport": "Transport",
      "request.heavyDesc": "Frigo, machine à laver, meubles...",
      "request.groceriesDesc": "Supermarché, pharmacie, petits colis...",
      "request.transportDesc": "D'un point A à B",
      
      // Create Request Form
      "create.title": "Nouvelle demande",
      "create.selectType": "Type de demande",
      "create.requestTitle": "Titre",
      "create.description": "Description",
      "create.pickup": "Lieu de départ",
      "create.dropoff": "Lieu d'arrivée",
      "create.productType": "Type de produit",
      "create.price": "Prix proposé",
      "create.estimatedPrice": "Prix estimé",
      "create.desiredTime": "Heure souhaitée",
      "create.vehicleType": "Type de véhicule",
      "create.needsHelper": "Besoin d'aide pour porter",
      "create.yourName": "Votre nom",
      "create.yourPhone": "Votre téléphone",
      "create.submit": "Publier la demande",
      "create.success": "Demande créée avec succès!",
      
      // Vehicle Types
      "vehicle.car": "Voiture",
      "vehicle.pickup": "Pick-up",
      "vehicle.van": "Camionnette",
      "vehicle.any": "Peu importe",
      
      // Status
      "status.pending": "En attente",
      "status.accepted": "Acceptée",
      "status.inProgress": "En cours",
      "status.completed": "Terminée",
      "status.cancelled": "Annulée",
      "status.available": "Disponible",
      "status.busy": "Occupé",
      "status.offline": "Hors ligne",
      
      // Deliverer Mode
      "deliverer.title": "Mode Livreur",
      "deliverer.goOnline": "Passer en ligne",
      "deliverer.goOffline": "Passer hors ligne",
      "deliverer.announceTrip": "Annoncer un trajet",
      "deliverer.tripPlaceholder": "Ex: Je vais à Cayenne...",
      "deliverer.availableRequests": "Demandes disponibles",
      "deliverer.acceptRequest": "Accepter",
      "deliverer.myDeliveries": "Mes livraisons",
      
      // Chat
      "chat.title": "Discussion",
      "chat.placeholder": "Écrire un message...",
      "chat.send": "Envoyer",
      
      // Payment
      "payment.pay": "Payer",
      "payment.total": "Total",
      "payment.platformFee": "Frais de service",
      "payment.delivererPayout": "Revenu livreur",
      "payment.success": "Paiement réussi!",
      "payment.pending": "Paiement en cours...",
      
      // Rating
      "rating.title": "Noter le livreur",
      "rating.comment": "Commentaire (optionnel)",
      "rating.submit": "Envoyer",
      
      // Settings
      "settings.title": "Paramètres",
      "settings.language": "Langue",
      "settings.notifications": "Notifications",
      "settings.theme": "Thème",
      "settings.themeAuto": "Automatique",
      "settings.themeLight": "Clair",
      "settings.themeDark": "Sombre",
      
      // Common
      "common.loading": "Chargement...",
      "common.error": "Une erreur est survenue",
      "common.retry": "Réessayer",
      "common.cancel": "Annuler",
      "common.confirm": "Confirmer",
      "common.save": "Enregistrer",
      "common.close": "Fermer",
      "common.km": "km",
      "common.euro": "€",
    }
  },
  en: {
    translation: {
      "nav.home": "Home",
      "nav.requests": "Requests",
      "nav.deliverer": "Deliverer",
      "nav.history": "History",
      "nav.settings": "Settings",
      
      "home.title": "Collaborative Delivery in French Guiana",
      "home.subtitle": "Send your packages, do your shopping, with the help of your neighbors",
      "home.createRequest": "Create a request",
      "home.becomeDeliverer": "Become a deliverer",
      "home.nearbyDeliverers": "Nearby deliverers",
      "home.activeRequests": "Active requests",
      
      "request.heavy": "Heavy Delivery",
      "request.groceries": "Groceries",
      "request.transport": "Transport",
      "request.heavyDesc": "Fridge, washing machine, furniture...",
      "request.groceriesDesc": "Supermarket, pharmacy, small packages...",
      "request.transportDesc": "From point A to B",
      
      "create.title": "New Request",
      "create.selectType": "Request Type",
      "create.requestTitle": "Title",
      "create.description": "Description",
      "create.pickup": "Pickup Location",
      "create.dropoff": "Dropoff Location",
      "create.productType": "Product Type",
      "create.price": "Proposed Price",
      "create.estimatedPrice": "Estimated Price",
      "create.desiredTime": "Desired Time",
      "create.vehicleType": "Vehicle Type",
      "create.needsHelper": "Need help carrying",
      "create.yourName": "Your Name",
      "create.yourPhone": "Your Phone",
      "create.submit": "Submit Request",
      "create.success": "Request created successfully!",
      
      "vehicle.car": "Car",
      "vehicle.pickup": "Pickup truck",
      "vehicle.van": "Van",
      "vehicle.any": "Any",
      
      "status.pending": "Pending",
      "status.accepted": "Accepted",
      "status.inProgress": "In Progress",
      "status.completed": "Completed",
      "status.cancelled": "Cancelled",
      "status.available": "Available",
      "status.busy": "Busy",
      "status.offline": "Offline",
      
      "deliverer.title": "Deliverer Mode",
      "deliverer.goOnline": "Go Online",
      "deliverer.goOffline": "Go Offline",
      "deliverer.announceTrip": "Announce a trip",
      "deliverer.tripPlaceholder": "Ex: I'm going to Cayenne...",
      "deliverer.availableRequests": "Available Requests",
      "deliverer.acceptRequest": "Accept",
      "deliverer.myDeliveries": "My Deliveries",
      
      "chat.title": "Chat",
      "chat.placeholder": "Write a message...",
      "chat.send": "Send",
      
      "payment.pay": "Pay",
      "payment.total": "Total",
      "payment.platformFee": "Service Fee",
      "payment.delivererPayout": "Deliverer Payout",
      "payment.success": "Payment successful!",
      "payment.pending": "Payment processing...",
      
      "rating.title": "Rate the deliverer",
      "rating.comment": "Comment (optional)",
      "rating.submit": "Submit",
      
      "settings.title": "Settings",
      "settings.language": "Language",
      "settings.notifications": "Notifications",
      "settings.theme": "Theme",
      "settings.themeAuto": "Automatic",
      "settings.themeLight": "Light",
      "settings.themeDark": "Dark",
      
      "common.loading": "Loading...",
      "common.error": "An error occurred",
      "common.retry": "Retry",
      "common.cancel": "Cancel",
      "common.confirm": "Confirm",
      "common.save": "Save",
      "common.close": "Close",
      "common.km": "km",
      "common.euro": "€",
    }
  },
  es: {
    translation: {
      "nav.home": "Inicio",
      "nav.requests": "Solicitudes",
      "nav.deliverer": "Repartidor",
      "nav.history": "Historial",
      "nav.settings": "Ajustes",
      
      "home.title": "Entrega colaborativa en Guayana Francesa",
      "home.subtitle": "Envía tus paquetes, haz tus compras, con la ayuda de tus vecinos",
      "home.createRequest": "Crear solicitud",
      "home.becomeDeliverer": "Ser repartidor",
      "home.nearbyDeliverers": "Repartidores cercanos",
      "home.activeRequests": "Solicitudes activas",
      
      "request.heavy": "Entrega pesada",
      "request.groceries": "Compras",
      "request.transport": "Transporte",
      
      "create.title": "Nueva solicitud",
      "create.submit": "Enviar solicitud",
      
      "status.pending": "Pendiente",
      "status.accepted": "Aceptada",
      "status.completed": "Completada",
      
      "common.loading": "Cargando...",
      "common.cancel": "Cancelar",
      "common.confirm": "Confirmar",
    }
  },
  pt: {
    translation: {
      "nav.home": "Início",
      "nav.requests": "Pedidos",
      "nav.deliverer": "Entregador",
      "nav.history": "Histórico",
      "nav.settings": "Configurações",
      
      "home.title": "Entrega colaborativa na Guiana Francesa",
      "home.subtitle": "Envie suas encomendas, faça suas compras, com a ajuda dos vizinhos",
      "home.createRequest": "Criar pedido",
      "home.becomeDeliverer": "Ser entregador",
      "home.nearbyDeliverers": "Entregadores próximos",
      "home.activeRequests": "Pedidos ativos",
      
      "request.heavy": "Entrega pesada",
      "request.groceries": "Compras",
      "request.transport": "Transporte",
      
      "create.title": "Novo pedido",
      "create.submit": "Enviar pedido",
      
      "status.pending": "Pendente",
      "status.accepted": "Aceito",
      "status.completed": "Concluído",
      
      "common.loading": "Carregando...",
      "common.cancel": "Cancelar",
      "common.confirm": "Confirmar",
    }
  },
  zh: {
    translation: {
      "nav.home": "首页",
      "nav.requests": "请求",
      "nav.deliverer": "配送员",
      "nav.history": "历史",
      "nav.settings": "设置",
      
      "home.title": "法属圭亚那协作配送",
      "home.subtitle": "在邻居的帮助下发送包裹、购物",
      "home.createRequest": "创建请求",
      "home.becomeDeliverer": "成为配送员",
      "home.nearbyDeliverers": "附近的配送员",
      "home.activeRequests": "活动请求",
      
      "request.heavy": "重物配送",
      "request.groceries": "购物",
      "request.transport": "运输",
      
      "create.title": "新请求",
      "create.submit": "提交请求",
      
      "status.pending": "待处理",
      "status.accepted": "已接受",
      "status.completed": "已完成",
      
      "common.loading": "加载中...",
      "common.cancel": "取消",
      "common.confirm": "确认",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
