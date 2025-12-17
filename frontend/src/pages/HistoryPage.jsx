import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Clock } from "lucide-react";
import RequestCard from "../components/RequestCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HistoryPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests`);
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedRequests = requests.filter(r => r.status === "completed");
  const cancelledRequests = requests.filter(r => r.status === "cancelled");
  const activeRequests = requests.filter(r => ["pending", "accepted", "in_progress"].includes(r.status));

  return (
    <div className="pb-24" data-testid="history-page">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("nav.history")}</h1>
            <p className="text-muted-foreground">{requests.length} demandes au total</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="active">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="active" className="flex-1" data-testid="tab-active">
              En cours ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1" data-testid="tab-completed">
              Terminées ({completedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1" data-testid="tab-cancelled">
              Annulées ({cancelledRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-4 h-32 skeleton" />
                ))}
              </div>
            ) : activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune demande en cours</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-3">
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucune demande terminée</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-3">
            {cancelledRequests.length > 0 ? (
              cancelledRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucune demande annulée</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
