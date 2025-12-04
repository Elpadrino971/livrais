-- Ajouter le champ push_token au profil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON public.profiles(push_token);

-- Fonction pour nettoyer les tokens expirés (appelée périodiquement)
CREATE OR REPLACE FUNCTION clean_expired_push_tokens()
RETURNS void AS $$
BEGIN
  -- Les tokens Expo expirent après 30 jours d'inactivité
  -- On peut nettoyer ici si nécessaire
  NULL;
END;
$$ LANGUAGE plpgsql;
