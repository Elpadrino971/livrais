import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, X, Loader2, ZoomIn } from "lucide-react";
import axios from "axios";
import { Dialog, DialogContent } from "./ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PhotoUpload({ onUpload, currentPhoto = null, className = "" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto);
  const [error, setError] = useState(null);
  const [showZoom, setShowZoom] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setError(null);
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const photoUrl = `${API}${res.data.url.replace('/api', '')}`;
      onUpload(photoUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Erreur lors de l'upload");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    disabled: uploading
  });

  const removePhoto = () => {
    setPreview(null);
    onUpload(null);
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative" data-testid="photo-preview">
          {/* Thumbnail container */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-border">
            {/* Small thumbnail */}
            <div 
              className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
              onClick={() => setShowZoom(true)}
            >
              <img 
                src={preview} 
                alt="Aperçu" 
                className="w-full h-full object-cover"
              />
              {/* Zoom overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Info and actions */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Photo ajoutée</p>
              <p className="text-xs text-muted-foreground">Cliquez pour agrandir</p>
            </div>
            
            {/* Zoom button */}
            <button
              onClick={() => setShowZoom(true)}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"
              data-testid="zoom-photo-btn"
            >
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Remove button */}
            <button
              onClick={removePhoto}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
              data-testid="remove-photo-btn"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-stone-900/80 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
          
          {/* Zoom Dialog */}
          <Dialog open={showZoom} onOpenChange={setShowZoom}>
            <DialogContent className="max-w-3xl p-2 bg-black/95">
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Photo agrandie" 
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                <button
                  onClick={() => setShowZoom(false)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          data-testid="photo-dropzone"
        >
          <input {...getInputProps()} data-testid="photo-input" />
          
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
            )}
            
            <div>
              <p className="font-medium text-foreground">
                {isDragActive ? "Déposez l'image ici" : "Ajouter une photo"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {uploading ? "Upload en cours..." : "Glissez-déposez ou cliquez pour sélectionner"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
