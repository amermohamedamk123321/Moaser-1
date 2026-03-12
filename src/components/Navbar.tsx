import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "@/assets/logo.png";

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.services"), href: "/services" },
    { label: t("nav.doctors"), href: "/doctors" },
    { label: t("nav.contact"), href: "/contact" },
    { label: t("nav.appointment"), href: "/appointment" },
  ];

  const allLinks = mainLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const goTo = (href: string) => {
    setMobileOpen(false);
    navigate(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-card/95 backdrop-blur-xl shadow-card py-3 border-b border-border"
          : "bg-card/80 backdrop-blur-md py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <button onClick={() => goTo("/")} className="flex items-center gap-3">
          <img src={logo} alt="Moaser Specialized Dental Hospital" className="h-20 w-20 object-contain" />
          <div>
            <p className="font-heading text-[11px] sm:text-lg font-bold text-primary leading-tight">{t("nav.brandName")}</p>
            {t("nav.brandSub") && (
              <p className="text-xs text-muted-foreground">{t("nav.brandSub")}</p>
            )}
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => goTo(link.href)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground ${
                location.pathname === link.href
                  ? "text-primary font-semibold"
                  : "text-foreground/80"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <a href="tel:0780103030" className="flex items-center gap-2 text-sm font-semibold text-secondary" dir="ltr">
            <Phone className="h-4 w-4" />
            <span dir="ltr">0780 103 030</span>
          </a>
          <Button size="lg" onClick={() => goTo("/appointment")}>
            {t("nav.bookNow")}
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            className="rounded-md p-2 text-foreground hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-card/95 backdrop-blur-xl mt-2 mx-4 rounded-xl p-4 shadow-card border border-border lg:hidden animate-slide-in-bottom">
          {allLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => goTo(link.href)}
              className={`block w-full rounded-md px-4 py-3 text-left text-sm font-medium hover:bg-accent rtl:text-right ${
                location.pathname === link.href
                  ? "text-primary font-semibold"
                  : "text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            <Button className="w-full" size="lg" onClick={() => goTo("/appointment")}>
              {t("nav.bookNow")}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
