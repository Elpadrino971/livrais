import { useTranslation } from "react-i18next";
import { Settings, Globe, Bell, Moon, Sun, Monitor, ChevronRight } from "lucide-react";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function SettingsPage({ setTheme, currentTheme }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleThemeChange = (theme) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <div className="pb-24" data-testid="settings-page">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
            <p className="text-muted-foreground">Personnalisez votre expérience</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Language */}
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium">{t("settings.language")}</Label>
          </div>
          
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger data-testid="language-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(({ code, label, flag }) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span>{flag}</span>
                    <span>{label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme */}
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium">{t("settings.theme")}</Label>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", icon: Sun, label: t("settings.themeLight") },
              { value: "dark", icon: Moon, label: t("settings.themeDark") },
              { value: "system", icon: Monitor, label: t("settings.themeAuto") },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                  currentTheme === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                data-testid={`theme-${value}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium">{t("settings.notifications")}</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nouvelles demandes</p>
                <p className="text-sm text-muted-foreground">Recevoir une alerte pour les demandes proches</p>
              </div>
              <Switch defaultChecked data-testid="notif-requests" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Livreurs en déplacement</p>
                <p className="text-sm text-muted-foreground">Quand un livreur annonce un trajet</p>
              </div>
              <Switch defaultChecked data-testid="notif-trips" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Statut de livraison</p>
                <p className="text-sm text-muted-foreground">Mises à jour sur vos demandes</p>
              </div>
              <Switch defaultChecked data-testid="notif-status" />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-4">
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <span>À propos de GuyaneConnect</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <span>Conditions d'utilisation</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <span>Politique de confidentialité</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground">
          GuyaneConnect v1.0.0
        </p>
      </div>
    </div>
  );
}
