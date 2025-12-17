import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Package, Users, Truck, Settings } from "lucide-react";

export default function BottomNav() {
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/create", icon: Package, label: t("nav.requests") },
    { path: "/community", icon: Users, label: "Forum" },
    { path: "/deliverer", icon: Truck, label: t("nav.deliverer") },
    { path: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-stone-200/50 dark:border-stone-800/50 safe-bottom"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            data-testid={`nav-${path.replace("/", "") || "home"}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
