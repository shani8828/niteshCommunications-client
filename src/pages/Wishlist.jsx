import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";

// Modular components
import ProfileSidebar from "../components/profile/ProfileSidebar";
import WishlistTab from "../components/profile/WishlistTab";

const Wishlist = () => {
  const { i18n } = useTranslation(["cart", "common"]);
  const { user } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const currentLang = i18n.language || "en";
  const isHindi = currentLang === "hi";

  if (!user) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      <WishlistTab
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        isHindi={isHindi}
        currentLang={currentLang}
        loading={false}
      />
    </div>
  );
};

export default Wishlist;
