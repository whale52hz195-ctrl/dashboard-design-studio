import { Search, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchModal } from "@/components/shared/SearchModal";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

export function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("topbar.search")}
              className="pl-9 bg-secondary border-border h-9 text-sm cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5"
            title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {language === "en" ? "AR" : "EN"}
            </span>
          </button>
        </div>
      </header>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
