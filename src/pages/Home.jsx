import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  fetchShopCategories,
  fetchShopProducts,
} from "../utils/shopData";

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
import InstallAppButton from "../components/common/InstallDownloadBtn";

const Home = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

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
      "Nitesh Communications Ayodhya - A leading store providing brand new mobile phones, quality repair services, and digital CSC solutions. नितेश कम्युनिकेशन्स - मोबाइल शॉप, रिपेयरिंग सेवाएं और जन सेवा केंद्र।",
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
    // Uses the same helpers (and cache keys) as the Shop page, so these
    // results are what the Shop shows instantly when the visitor goes there.
    const prefetchShopData = () => {
      const ignore = () => {};
      const firstPage = {
        page: 1,
        sort: "newest",
        minPrice: DEFAULT_MIN_PRICE,
        maxPrice: DEFAULT_MAX_PRICE,
        search: "",
      };

      fetchShopCategories().catch(ignore);
      fetchShopProducts({ ...firstPage, category: "" }).catch(ignore);

      // The 4 featured categories linked from the home page
      for (const category of ["phones", "earphone", "tshirt", "stationary"]) {
        fetchShopProducts({ ...firstPage, category }).catch(ignore);
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
      <div className="w-full flex justify-center items-center my-2">
        <InstallAppButton />
      </div>
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
