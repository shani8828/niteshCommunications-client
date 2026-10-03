import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  Menu,
  X,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Heart,
  ShoppingBag,
  Settings,
  Search,
  Wrench,
} from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import InstallAppButton from "./InstallDownloadBtn";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuTriggerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileSearchTriggerRef = useRef(null);

  useEffect(() => {
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // User dropdown
      if (
        userDropdownOpen &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }

      // Mobile menu
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuTriggerRef.current &&
        !mobileMenuTriggerRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }

      // Mobile search
      if (
        mobileSearchOpen &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target) &&
        mobileSearchTriggerRef.current &&
        !mobileSearchTriggerRef.current.contains(event.target)
      ) {
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen, mobileMenuOpen, mobileSearchOpen]);

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
    <header className="sticky top-0 z-[100] bg-white border-b border-slate-100 px-6 py-3 shadow-sm">
      <div className="w-full flex justify-between items-center gap-4">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-3 pl-0">
          <img
            src="/branding/logo-full-80.webp"
            srcSet="/branding/logo-full-80.webp 2x, /branding/logo-full-120.webp 3x"
            alt="Nitesh Communications"
            width="40"
            height="40"
            className="h-10 w-10 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.srcset = "";
              e.target.src = "/branding/logo.png";
            }}
          />
          <div className="hidden md:flex flex-col">
            <span className="font-heading font-extrabold text-lg text-blue-600 tracking-tight leading-tight">
              Nitesh Com.
            </span>
            <span className="font-sans text-[10px] text-slate-500 max-w-[220px] truncate">
              {t("tagline")}
            </span>
          </div>
        </Link>

        {/* Right Section containing Nav, Search, and Controls */}
        <div className="flex items-center justify-end gap-6 md:gap-8 lg:gap-10 flex-1">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-6 lg:gap-8 flex-shrink-0">
            <NavLink to="/home" className={getLinkClass}>
              {t("home")}
            </NavLink>
            <NavLink
              to="/shop"
              className={getLinkClass}
              onMouseEnter={() => import("../../pages/Shop")}
            >
              {t("shop")}
            </NavLink>
            <NavLink
              to="/repairs"
              className={getLinkClass}
              onMouseEnter={() => import("../../pages/RepairService")}
            >
              {t("repair")}
            </NavLink>
            <NavLink
              to="/csc"
              className={getLinkClass}
              onMouseEnter={() => import("../../pages/CscService")}
            >
              {t("csc")}
            </NavLink>
          </nav>

          {/* Global Search Component */}
          <div className="hidden sm:block flex-grow max-w-[280px]">
            <GlobalSearch />
          </div>
          {/* Mobile Search Toggle Icon */}
          <button
            ref={mobileSearchTriggerRef}
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="bg-transparent border-0 text-slate-600 hover:text-blue-600 cursor-pointer flex items-center sm:hidden p-1.5 rounded-full hover:bg-slate-50 transition-colors"
            title="Search"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          {/* Controls Section */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Cart Icon Link - Only visible when logged in */}
            {user && user.role === "user" && (
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
              <div className="relative hidden md:block" ref={userDropdownRef}>
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
                    {user.role === "user" && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {t("profile")}
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {t("order_summary")}
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {t("cart")}
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {t("wishlist")}
                        </Link>
                        <Link
                          to="/repair-bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {t("repairs")}
                        </Link>
                      </>
                    )}

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
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/10"
                >
                  {t("login")}
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              ref={mobileMenuTriggerRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-transparent border-0 text-slate-700 cursor-pointer block md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-[60px] left-0 right-0 z-[90] flex flex-col gap-3 p-6 bg-white border border-slate-100 shadow-xl rounded-b-2xl md:hidden"
        >
          {/* Mobile Global Search input */}
          {/* <div className="sm:hidden w-full pb-2">
            <GlobalSearch />
          </div> */}
          <NavLink
            to="/home"
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

          {user && (
            <>
              <hr className="border-t border-slate-100" />
              {user.role === "admin" && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={getMobileLinkClass}
                >
                  <Settings size={18} className="mr-2" />
                  {t("admin_panel")}
                </NavLink>
              )}
              {user.role === "user" && (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass}
                  >
                    <UserIcon size={18} className="mr-2" />
                    {t("profile")}
                  </NavLink>
                  <NavLink
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass}
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    {t("order_summary")}
                  </NavLink>
                  <NavLink
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass}
                  >
                    <Heart size={18} className="mr-2" />
                    {t("wishlist")}
                  </NavLink>
                  <NavLink
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass}
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    {t("cart")} {cartCount > 0 && `(${cartCount})`}
                  </NavLink>
                  <NavLink
                    to="/repair-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass}
                  >
                    <Wrench size={18} className="mr-2" />
                    {t("repairs")}
                  </NavLink>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 border-0 cursor-pointer transition-all w-full text-sm"
              >
                <LogOut size={16} />
                {t("logout")}
              </button>
            </>
          )}

          {!user && (
            <>
              <hr className="border-t border-slate-100" />
              <div className="mt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-center text-sm font-semibold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/10"
                >
                  {t("login")}
                </Link>
              </div>
            </>
          )}
          <div className="w-full flex justify-center items-center border-t pt-3">
            <InstallAppButton />
          </div>
        </div>
      )}
      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div
          ref={mobileSearchRef}
          className="absolute top-full left-0 right-0 z-[95] bg-white border-b border-slate-200 px-6 py-3.5 shadow-lg sm:hidden flex items-center gap-3 animate-fade-in"
        >
          <div className="flex-1">
            <GlobalSearch />
          </div>
          {/* <button
            onClick={() => setMobileSearchOpen(false)}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-1.5 hover:bg-slate-100 rounded-full flex items-center"
          >
            <X size={18} />
          </button> */}
        </div>
      )}
    </header>
  );
};

export default Navbar;
