import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCachedData, setCachedData } from "../utils/cache";
import api from "../utils/api";

// Modular Components
import HomeHero from "../components/home/HomeHero";
import HomeCategories from "../components/home/HomeCategories";
import HomePromoBanner from "../components/home/HomePromoBanner";
import HomeCscServices from "../components/home/HomeCscServices";
import HomeTrustReasons from "../components/home/HomeTrustReasons";
import HomeFaq from "../components/home/HomeFaq";
import HomeContact from "../components/home/HomeContact";
import HomeMap from "../components/home/HomeMap";
import HomeSocials from "../components/home/HomeSocials";

const Home = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "hi";

  useEffect(() => {
    document.title =
      "Nitesh Communications | E-Commerce, Mobile Repairing & CSC Services | नितेश कम्युनिकेशन्स";

    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Nitesh Communications Ayodhya - A leading store providing brand new mobile phones, quality repair services, and digital CSC solutions. नितेश कम्युनिकेशन्स - मोबाइल शॉप, रिपेयरिंग सेवाएं और जन सेवा केंद्र।"
    );

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", window.location.origin);
  }, [currentLang]);

  useEffect(() => {
    // Prefetch Shop page data in the background after home renders
    const prefetchShopData = async () => {
      // 1. Categories prefetch
      const catCacheKey = "shop_categories";
      if (!getCachedData(catCacheKey)) {
        try {
          const response = await api.get("/products/categories");
          setCachedData(catCacheKey, response.data, 10 * 60 * 1000);
        } catch (err) {
          console.error("Prefetch categories failed:", err);
        }
      }

      // 2. Products prefetch
      const prodCacheKey =
        "shop_products_p_1_s_newest_min_0_max_100000_k__c__b_";
      if (!getCachedData(prodCacheKey)) {
        try {
          const url = "/products?page=1&sort=newest&minPrice=0&maxPrice=100000";
          const response = await api.get(url);
          setCachedData(
            prodCacheKey,
            { products: response.data.products, pages: response.data.pages },
            5 * 60 * 1000,
          );
        } catch (err) {
          console.error("Prefetch products failed:", err);
        }
      }

      // 3. Category-specific prefetch for the 4 featured categories
      const targetCategories = ["phones", "earphone", "tshirt", "stationary"];
      for (const cat of targetCategories) {
        const catProdCacheKey = `shop_products_p_1_s_newest_min_0_max_100000_k__c_${cat}_b_`;
        if (!getCachedData(catProdCacheKey)) {
          try {
            const url = `/products?page=1&sort=newest&minPrice=0&maxPrice=100000&category=${cat}`;
            const response = await api.get(url);
            setCachedData(
              catProdCacheKey,
              { products: response.data.products, pages: response.data.pages },
              5 * 60 * 1000,
            );
          } catch (err) {
            console.error(`Prefetch products for category ${cat} failed:`, err);
          }
        }
      }
    };

    // Use a small timeout to let the home page load fully first
    const timer = setTimeout(() => {
      prefetchShopData();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-white">
      <HomeHero t={t} currentLang={currentLang} />
      <HomeCategories currentLang={currentLang} />
      <HomePromoBanner t={t} currentLang={currentLang} />
      <HomeCscServices currentLang={currentLang} />
      <HomeTrustReasons currentLang={currentLang} />
      <HomeFaq currentLang={currentLang} />
      <HomeContact currentLang={currentLang} />
      <HomeMap currentLang={currentLang} />
      <HomeSocials currentLang={currentLang} />
    </div>
  );
};

export default Home;
