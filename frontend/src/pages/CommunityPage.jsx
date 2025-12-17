import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import { 
  MessageSquare, Plus, Car, Truck, Search, HandHelping, 
  MapPin, Calendar, Phone, X, Send, ChevronRight, Users
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import AddressSearch from "../components/AddressSearch";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const postTypes = [
  { value: "carpool", icon: Car, label: "Covoiturage", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" },
  { value: "availability", icon: Truck, label: "Disponibilité", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" },
  { value: "search", icon: Search, label: "Recherche", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" },
  { value: "offer", icon: HandHelping, label: "Proposition", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400" },
  { value: "other", icon: MessageSquare, label: "Autre", color: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400" },
];

const getPostType = (type) => postTypes.find(p => p.value === type) || postTypes[4];

export default function CommunityPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [filter, setFilter] = useState("all");
  
  const [newPost, setNewPost] = useState({
    post_type: "",
    title: "",
    content: "",
    author_name: "",
    author_phone: "",
    location: null,
    destination: null,
    date_info: "",
  });

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  useEffect(() => {
    if (selectedPost) {
      fetchReplies(selectedPost.id);
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    try {
      const params = filter !== "all" ? `?post_type=${filter}` : "";
      const res = await axios.get(`${API}/community/posts${params}`);
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (postId) => {
    try {
      const res = await axios.get(`${API}/community/replies/${postId}`);
      setReplies(res.data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.post_type || !newPost.title || !newPost.content || !newPost.author_name) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await axios.post(`${API}/community/posts`, newPost);
      toast.success("Annonce publiée!");
      setShowNewPost(false);
      setNewPost({
        post_type: "",
        title: "",
        content: "",
        author_name: "",
        author_phone: "",
        location: null,
        destination: null,
        date_info: "",
      });
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Erreur lors de la publication");
    }
  };

  const handleReply = async () => {
    if (!newReply.trim() || !replyAuthor.trim()) {
      toast.error("Veuillez remplir votre nom et message");
      return;
    }

    try {
      await axios.post(`${API}/community/replies`, {
        post_id: selectedPost.id,
        author_name: replyAuthor,
        content: newReply,
      });
      setNewReply("");
      fetchReplies(selectedPost.id);
      fetchPosts(); // Update reply count
      toast.success("Réponse envoyée!");
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="pb-24" data-testid="community-page">
      {/* Header */}
      <header className="bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Communauté
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Covoiturage, disponibilités, entraide
            </p>
          </div>
          <Button 
            onClick={() => setShowNewPost(true)}
            className="bg-white text-blue-900 hover:bg-blue-50 rounded-full"
            data-testid="new-post-btn"
          >
            <Plus className="w-5 h-5" />
            Publier
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "all" ? "bg-white text-blue-900" : "bg-white/20 text-white"
            }`}
            data-testid="filter-all"
          >
            Tout
          </button>
          {postTypes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                filter === value ? "bg-white text-blue-900" : "bg-white/20 text-white"
              }`}
              data-testid={`filter-${value}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Posts List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 h-32 skeleton" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const postType = getPostType(post.post_type);
            const Icon = postType.icon;
            
            return (
              <div
                key={post.id}
                className="card p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPost(post)}
                data-testid={`post-${post.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${postType.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={postType.color}>{postType.label}</Badge>
                      {post.date_info && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date_info}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-foreground line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                    
                    {(post.location || post.destination) && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {post.location?.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {post.location.address}
                          </span>
                        )}
                        {post.destination?.address && (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              {post.destination.address}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {post.author_name} • {formatTime(post.created_at)}
                      </span>
                      <span className="text-xs text-primary flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.replies_count} réponse{post.replies_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune annonce pour le moment</p>
            <Button 
              onClick={() => setShowNewPost(true)}
              className="mt-4"
              variant="outline"
            >
              Publier la première annonce
            </Button>
          </div>
        )}
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle annonce</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Post Type */}
            <div>
              <Label className="mb-2 block">Type d'annonce *</Label>
              <div className="grid grid-cols-2 gap-2">
                {postTypes.map(({ value, icon: Icon, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setNewPost(prev => ({ ...prev, post_type: value }))}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-colors ${
                      newPost.post_type === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`type-${value}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Covoiturage Cayenne → Kourou"
                className="mt-2"
                data-testid="post-title"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Description *</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Décrivez votre annonce en détail..."
                className="mt-2 min-h-[100px]"
                data-testid="post-content"
              />
            </div>

            {/* Date info */}
            <div>
              <Label htmlFor="date">Quand ?</Label>
              <Input
                id="date"
                value={newPost.date_info}
                onChange={(e) => setNewPost(prev => ({ ...prev, date_info: e.target.value }))}
                placeholder="Ex: Cette semaine, Demain, Samedi 20"
                className="mt-2"
                data-testid="post-date"
              />
            </div>

            {/* Location */}
            {(newPost.post_type === "carpool" || newPost.post_type === "availability") && (
              <>
                <div>
                  <Label>Départ / Zone</Label>
                  <AddressSearch
                    onSelect={(loc) => setNewPost(prev => ({ ...prev, location: loc }))}
                    placeholder="Rechercher un lieu..."
                    value={newPost.location}
                    className="mt-2"
                  />
                </div>
                
                {newPost.post_type === "carpool" && (
                  <div>
                    <Label>Destination</Label>
                    <AddressSearch
                      onSelect={(loc) => setNewPost(prev => ({ ...prev, destination: loc }))}
                      placeholder="Rechercher la destination..."
                      value={newPost.destination}
                      className="mt-2"
                    />
                  </div>
                )}
              </>
            )}

            {/* Author info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Votre nom *</Label>
                <Input
                  id="author"
                  value={newPost.author_name}
                  onChange={(e) => setNewPost(prev => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Jean"
                  className="mt-2"
                  data-testid="post-author"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newPost.author_phone}
                  onChange={(e) => setNewPost(prev => ({ ...prev, author_phone: e.target.value }))}
                  placeholder="0694..."
                  className="mt-2"
                  data-testid="post-phone"
                />
              </div>
            </div>

            <Button 
              onClick={handleCreatePost}
              className="w-full btn-primary"
              data-testid="submit-post-btn"
            >
              Publier l'annonce
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Detail Sheet */}
      <Sheet open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          {selectedPost && (
            <div className="flex flex-col h-full">
              <SheetHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {(() => {
                    const postType = getPostType(selectedPost.post_type);
                    const Icon = postType.icon;
                    return (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${postType.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    );
                  })()}
                  <div>
                    <SheetTitle className="text-left">{selectedPost.title}</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedPost.author_name} • {formatTime(selectedPost.created_at)}
                    </p>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {/* Post content */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
                  <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
                  
                  {selectedPost.date_info && (
                    <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedPost.date_info}
                    </p>
                  )}
                  
                  {(selectedPost.location || selectedPost.destination) && (
                    <div className="mt-3 pt-3 border-t border-border space-y-1">
                      {selectedPost.location?.address && (
                        <p className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          {selectedPost.location.address}
                        </p>
                      )}
                      {selectedPost.destination?.address && (
                        <p className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          {selectedPost.destination.address}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedPost.author_phone && (
                    <a 
                      href={`tel:${selectedPost.author_phone}`}
                      className="mt-3 inline-flex items-center gap-2 text-primary text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedPost.author_phone}
                    </a>
                  )}
                </div>

                {/* Replies */}
                <div>
                  <h3 className="font-medium mb-3">
                    Réponses ({selectedPost.replies_count})
                  </h3>
                  
                  {replies.length > 0 ? (
                    <div className="space-y-3">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{reply.author_name}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(reply.created_at)}</span>
                          </div>
                          <p className="text-sm text-foreground">{reply.content}</p>
                          {reply.author_phone && (
                            <a 
                              href={`tel:${reply.author_phone}`}
                              className="mt-2 inline-flex items-center gap-1 text-primary text-xs"
                            >
                              <Phone className="w-3 h-3" />
                              {reply.author_phone}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune réponse pour le moment
                    </p>
                  )}
                </div>
              </div>

              {/* Reply input */}
              <div className="pt-4 border-t border-border space-y-3">
                <Input
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  placeholder="Votre nom"
                  data-testid="reply-author"
                />
                <div className="flex gap-2">
                  <Input
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Écrire une réponse..."
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                    data-testid="reply-input"
                  />
                  <Button onClick={handleReply} size="icon" data-testid="send-reply-btn">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
