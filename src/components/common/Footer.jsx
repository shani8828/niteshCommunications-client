import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-6 text-slate-600 mt-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-heading font-extrabold text-xl text-blue-600">
            {t("brand")}
          </h3>
          <p className="text-xs text-slate-500">{t("tagline")}</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("desc_banner_1")}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-semibold">
              {currentLang == "hi"
                ? "100% विश्वास और गारंटी"
                : "100% Trust & Guarantee"}
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-blue-600">
            {t("owner")}
          </p>
        </div>

        {/* Quick Links Column (2nd col) */}
        <div className="flex flex-col gap-4">
          <h4 className="font-heading font-bold text-base text-slate-800 mb-2">
            {currentLang == "hi" ? "हमारी सेवाएं" : "Our Services"}
          </h4>
          <Link
            to="/shop"
            className="text-sm hover:text-blue-600 transition-colors"
          >
            {currentLang == "hi" ? "ई-कॉमर्स (दुकान)" : "E-Commerce"}
          </Link>
          <Link
            to="/repairs"
            className="text-sm hover:text-blue-600 transition-colors"
          >
            {currentLang == "hi" ? "मोबाइल रिपेयर" : "Mobile Repair"}
          </Link>
          <Link
            to="/csc"
            className="text-sm hover:text-blue-600 transition-colors"
          >
            {currentLang == "hi" ? "जन सेवा केंद्र" : "CSC Services"}
          </Link>
        </div>

        {/* Quick Contacts (3rd col) */}
        <div className="flex flex-col gap-4">
          <h4 className="font-heading font-bold text-base text-slate-800 mb-2">
            {t("contact_us")}
          </h4>
          <a
            href="tel:+919125949456"
            className="flex items-center gap-3 text-sm"
          >
            <Phone size={16} className="text-blue-600 flex-shrink-0" />
            <span>+91 9125949456</span>
          </a>
          <a
            href="https://maps.app.goo.gl/EFMXBm2RCEf9YNa88"
            className="flex items-start gap-3 text-sm"
          >
            <MapPin size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {currentLang == "hi"
                ? "करमडांडा मोड़, पटखौली चौराहा, अयोध्या"
                : "Karamdanda Mod, Patkhauli Chauraha, Ayodhya"}
            </span>
          </a>
          <a
            href="mailto:info.niteshcommunications@gmail.com"
            className="flex items-center gap-3 text-sm"
          >
            <Mail size={16} className="text-blue-600 flex-shrink-0" />
            <span>info.niteshcommunications@gmail.com</span>
          </a>

          {/* Social Handles */}
          <div className="flex items-center gap-3 mt-2">
            <a
              href="https://instagram.com/nitesh.communications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.facebook.com/share/18r5kc8pKq/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center"
              title="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://whatsapp.com/channel/0029VaDyFpZ9mrGiKnPD0g2c"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center"
              title="WhatsApp Channel"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Legal Policies Links Row */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-x-8 gap-y-3 justify-center md:justify-start items-center text-[11px] text-slate-400 font-semibold border-t border-slate-200/50 pt-8 mt-12 w-full">
        <Link
          to="/terms-conditions"
          className="hover:text-blue-600 transition-colors"
        >
          {t("terms_conditions")}
        </Link>
        <Link
          to="/privacy-policy"
          className="hover:text-blue-600 transition-colors"
        >
          {t("privacy_policy")}
        </Link>
        <Link
          to="/refund-policy"
          className="hover:text-blue-600 transition-colors"
        >
          {t("refund_policy")}
        </Link>
        <Link
          to="/shipping-policy"
          className="hover:text-blue-600 transition-colors"
        >
          {t("shipping_policy")}
        </Link>
      </div>

      <hr className="max-w-6xl mx-auto my-8 border-t border-slate-200" />

      {/* Developer Credits */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p className="margin-0">
          &copy; {new Date().getFullYear()} Nitesh Communications. All Rights
          Reserved.
        </p>
        <a
          href="https://ayodhyaserenity.vercel.app/services/website"
          target="_blank"
          rel="noopener noreferrer"
          className="margin-0 text-blue-600 hover:underline"
        >
          {t("credit")}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
