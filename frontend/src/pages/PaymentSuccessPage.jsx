import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus("error");
      return;
    }

    try {
      const res = await axios.get(`${API}/payments/status/${sessionId}`);
      setPaymentData(res.data);

      if (res.data.payment_status === "paid") {
        setStatus("success");
        return;
      } else if (res.data.status === "expired") {
        setStatus("error");
        return;
      }

      // Continue polling
      setAttempts(prev => prev + 1);
      setTimeout(pollPaymentStatus, pollInterval);
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" data-testid="payment-success-page">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div className="animate-fade-in">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
            <h1 className="text-2xl font-bold mb-2">{t("payment.pending")}</h1>
            <p className="text-muted-foreground">Vérification du paiement en cours...</p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-slide-up">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("payment.success")}</h1>
            <p className="text-muted-foreground mb-6">
              Votre paiement a été traité avec succès.
            </p>
            
            {paymentData && (
              <div className="card p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-semibold">{(paymentData.amount_total / 100).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="text-emerald-600 font-medium">Payé</span>
                </div>
              </div>
            )}
            
            <Link to="/">
              <Button className="btn-primary w-full">
                Retour à l'accueil
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Erreur de paiement</h1>
            <p className="text-muted-foreground mb-6">
              Nous n'avons pas pu vérifier votre paiement. Veuillez réessayer.
            </p>
            
            <Link to="/">
              <Button className="btn-secondary w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
