import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Facebook, Instagram, Settings } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = [
  { key: "linkAbout", href: "/about" },
  { key: "linkServices", href: "/services" },
  { key: "linkDoctors", href: "/doctors" },
  { key: "linkVision", href: "/vision" },
  { key: "linkContact", href: "/contact" },
];

const serviceKeys = ["sMaxillofacial", "sImplants", "sDigital", "sOrthodontics", "sCosmetic"];

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goTo = (href: string) => {
    navigate(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center lg:items-start">
            <div className="bg-primary-foreground rounded-lg p-0.5 mb-4">
              <img src={logo} alt="Moaser Dental Hospital" className="h-40 w-40 lg:h-56 lg:w-56 object-contain" />
            </div>
            <p className="font-heading text-lg font-bold text-center lg:text-left mb-3">{t("footer.brandName")}</p>
            <p className="text-sm text-primary-foreground/70 leading-relaxed text-center lg:text-right">
              {t("footer.brandDesc")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {footerLinks.map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => goTo(link.href)}
                    className="hover:text-primary-foreground transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">{t("footer.servicesTitle")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {serviceKeys.map((key) => (
                <li key={key}>{t(`footer.${key}`)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">{t("footer.contactTitle")}</h4>
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <a href="tel:0780103030" className="flex items-center gap-2 hover:text-primary-foreground transition-colors" dir="ltr">
                <Phone className="h-4 w-4" />
                <span dir="ltr">0780 10 30 30</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t("contact.address")}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <a href="https://www.facebook.com/dr.sharafyar?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://www.instagram.com/moaser_dental_hospital?igsh=MTI2eWRjZG15eDd0bg==" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-primary-foreground/50">© 2026 {t("footer.brandName")}</p>

            <div className="text-xs text-primary-foreground/50 whitespace-nowrap" dir="ltr">
              Powered by <a href="https://turabroot.com" target="_blank" rel="noopener noreferrer" className="group relative inline-block font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-foreground/40 hover:after:w-full after:transition-all after:duration-300">Turab Root</a>
            </div>

            <div className="flex items-center justify-center gap-4">
              <p className="text-xs text-primary-foreground/50">{t("footer.rights")}</p>
              <button
                onClick={() => goTo("/admin/login")}
                className="flex items-center gap-1 text-xs text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors"
              >
                <Settings className="h-3 w-3" /> Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
