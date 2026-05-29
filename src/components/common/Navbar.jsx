import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  Menu,
  X,
  ShoppingCart,
  User as UserIcon,
  Globe,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Toggle English <-> Hindi languages
  const toggleLanguage = () => {
    const nextLang = i18n.language === "hi" ? "en" : "hi";
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate("/login");
  };

  const getLinkClass = ({ isActive }) =>
    `font-heading font-medium text-sm transition-all duration-200 relative pb-1 ${
      isActive
        ? "text-blue-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full"
        : "text-slate-600 hover:text-blue-600"
    }`;

  const getMobileLinkClass = ({ isActive }) =>
    `text-base font-semibold transition-all duration-200 px-4 py-2 rounded-xl flex items-center ${
      isActive
        ? "bg-blue-50 text-blue-600 font-bold"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
    }`;

  return (
    <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/branding/logo.png"
            alt="Nitesh Communications"
            className="h-10 w-10 object-contain rounded-lg shadow-sm"
            onError={(e) => {
              e.target.src = "/branding/app-icon.png";
            }}
          />
          <div className="hidden md:flex flex-col">
            <span className="font-heading font-extrabold text-lg text-blue-600 tracking-tight leading-tight">
              {t("brand")}
            </span>
            <span className="font-sans text-[10px] text-slate-500 max-w-[220px] truncate">
              {t("tagline")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8">
          <NavLink to="/" className={getLinkClass}>
            {t("home")}
          </NavLink>
          <NavLink to="/shop" className={getLinkClass}>
            {t("shop")}
          </NavLink>
          <NavLink to="/repairs" className={getLinkClass}>
            {t("repair")}
          </NavLink>
          <NavLink to="/csc" className={getLinkClass}>
            {t("csc")}
          </NavLink>
        </nav>

        {/* Controls Section */}
        <div className="flex items-center gap-5">
          {/* Multilingual Globe Toggle */}
          <button
            onClick={toggleLanguage}
            className="bg-transparent border-0 text-slate-600 hover:text-blue-600 cursor-pointer flex items-center gap-1 text-sm font-semibold"
          >
            <Globe size={18} />
            <span className="text-xs">
              {i18n.language === "hi" ? "EN" : "हिंदी"}
            </span>
          </button>

          {/* Cart Icon Link - Only visible when logged in */}
          {user && (
            <Link
              to="/cart"
              className="text-slate-600 hover:text-blue-600 relative flex items-center"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full px-1.5 py-0.5 text-[9px] font-extrabold">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Auth Profiles Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-slate-700 cursor-pointer flex items-center gap-2 hover:bg-slate-100 transition-all"
              >
                <UserIcon size={16} />
                <span className="hidden sm:inline text-xs font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute top-12 right-0 min-w-[200px] p-4 z-[120] flex flex-col gap-3 bg-white border border-slate-100 shadow-xl rounded-2xl">
                  <div className="text-xs text-slate-500">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] bg-blue-50 text-blue-600 inline-block px-1.5 py-0.5 rounded mt-1 font-semibold uppercase">
                      {user.role}
                    </p>
                  </div>
                  <hr className="border-t border-slate-100" />
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      {t("admin_panel")}
                    </Link>
                  )}
                  {user.role === "partner" && (
                    <Link
                      to="/partner/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      {t("partner_panel")}
                    </Link>
                  )}
                  <Link
                    to="/order-tracking/history"
                    onClick={() => setUserDropdownOpen(false)}
                    className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {t("order_summary")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-transparent border-0 text-rose-600 text-sm cursor-pointer py-1 text-left w-full font-semibold"
                  >
                    <LogOut size={14} />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex gap-3">
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              >
                {t("login")}
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/10"
              >
                {t("register")}
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-transparent border-0 text-slate-700 cursor-pointer block md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-[60px] left-0 right-0 z-[90] flex flex-col gap-3 p-6 bg-white border border-slate-100 shadow-xl rounded-b-2xl md:hidden">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClass}
          >
            {t("home")}
          </NavLink>
          <NavLink
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClass}
          >
            {t("shop")}
          </NavLink>
          <NavLink
            to="/repairs"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClass}
          >
            {t("repair")}
          </NavLink>
          <NavLink
            to="/csc"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClass}
          >
            {t("csc")}
          </NavLink>

          {!user && (
            <>
              <hr className="border-t border-slate-100" />
              <div className="flex flex-col gap-3 mt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold rounded-xl bg-blue-600 text-white"
                >
                  {t("register")}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
