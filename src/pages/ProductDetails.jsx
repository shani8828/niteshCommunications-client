import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import Loader from "../components/common/Loader";
import api from "../utils/api";
import { showToast } from "../utils/toast";
import { getCachedData, setCachedData } from "../utils/cache";
import { ArrowLeft } from "lucide-react";

// Child components
import ProductReviews from "../components/shop/ProductReviews";
import RelatedProducts from "../components/shop/RelatedProducts";
import ProductImagesGallery from "../components/shop/ProductImagesGallery";
import ProductSpecs from "../components/shop/ProductSpecs";

const updateMetaTags = ({
  title,
  description,
  image,
  url,
  type = "website",
}) => {
  document.title = title;

  const getOrCreateMetaTag = (attrName, attrValue, contentVal) => {
    let element = document.querySelector(`meta[${attrName}='${attrValue}']`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute("content", contentVal);
  };

  getOrCreateMetaTag("name", "description", description);

  // Open Graph
  getOrCreateMetaTag("property", "og:title", title);
  getOrCreateMetaTag("property", "og:description", description);
  getOrCreateMetaTag("property", "og:type", type);
  if (url) getOrCreateMetaTag("property", "og:url", url);
  if (image) getOrCreateMetaTag("property", "og:image", image);

  // Twitter Card
  getOrCreateMetaTag("name", "twitter:card", "summary_large_image");
  getOrCreateMetaTag("name", "twitter:title", title);
  getOrCreateMetaTag("name", "twitter:description", description);
  if (image) getOrCreateMetaTag("name", "twitter:image", image);
};

const ProductDetails = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation(["product", "common", "notifications"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist, addRecentlyViewed } = useCart();
  const { setCrumbs } = useBreadcrumbs();

  const passedProduct = location.state?.product;

  const [product, setProduct] = useState(() => {
    if (passedProduct) return passedProduct;
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return cached ? cached.product : null;
  });

  const [related, setRelated] = useState(() => {
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return cached ? (cached.related || []) : [];
  });

  const [reviews, setReviews] = useState(() => {
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return cached ? (cached.reviews || []) : [];
  });

  // Track loading states for each section
  const [productLoading, setProductLoading] = useState(() => {
    if (passedProduct) return false;
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return !cached;
  });
  const [relatedLoading, setRelatedLoading] = useState(() => {
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return !cached;
  });
  const [reviewsLoading, setReviewsLoading] = useState(() => {
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return !cached;
  });

  const [activeImage, setActiveImage] = useState(() => {
    if (passedProduct) return passedProduct.images?.[0] || "";
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);
    return cached?.product?.images?.[0] || "";
  });

  const currentLang = i18n.language || "en";

  useEffect(() => {
    const cacheKey = `product_detail_${slug}`;
    const cached = getCachedData(cacheKey);

    // Sync product and active image immediately on slug/passedProduct change
    const initialProduct = passedProduct || (cached ? cached.product : null);
    setProduct(initialProduct);
    setRelated(cached ? (cached.related || []) : []);
    setReviews(cached ? (cached.reviews || []) : []);
    setActiveImage(initialProduct?.images?.[0] || "");

    const fetchDetail = async () => {
      // If we don't have the product info at all, we show product skeleton
      if (!initialProduct) {
        setProductLoading(true);
        setRelatedLoading(true);
        setReviewsLoading(true);
      } else if (!cached) {
        // We have product details but need reviews/related
        setRelatedLoading(true);
        setReviewsLoading(true);
      } else {
        // Everything cached, no skeletons needed
        setProductLoading(false);
        setRelatedLoading(false);
        setReviewsLoading(false);
      }

      try {
        const response = await api.get(`/products/slug/${slug}`);
        const data = response.data;

        setProduct(data.product);
        setRelated(data.related || []);
        setReviews(data.reviews || []);

        // Update active image only if it's currently unset
        if (data.product?.images && (!initialProduct || !initialProduct.images || initialProduct.images.length === 0)) {
          setActiveImage(data.product.images[0]);
        }

        addRecentlyViewed(data.product);
        setCachedData(cacheKey, data, 5 * 60 * 1000); // Cache product details for 5 minutes
      } catch (err) {
        console.error(err);
        // Only error/redirect if we don't have ANY product data
        if (!initialProduct) {
          showToast.error("Product not found");
          navigate("/shop");
        }
      } finally {
        setProductLoading(false);
        setRelatedLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchDetail();
  }, [slug, passedProduct]);

  useEffect(() => {
    if (product) {
      setCrumbs([
        { label: t("common:shop"), link: "/shop" },
        { label: product.name[currentLang] || product.name.en },
      ]);
    }
  }, [product, currentLang, setCrumbs, t]);

  useEffect(() => {
    if (product) {
      const prodNameEn = product.name?.en || "";
      const prodNameHi = product.name?.hi || "";
      const prodName = prodNameHi && prodNameHi !== prodNameEn 
        ? `${prodNameEn} (${prodNameHi})` 
        : prodNameEn;
      const prodDesc = product.description?.[currentLang] || product.description?.en || "";
      const brand = product.brand || "Nitesh Communications";
      const storeName = "Nitesh Communications";

      const title = `${prodName} | ${brand} | ${storeName}`;
      const description = `Buy ${prodNameEn} at best price. ${prodNameHi ? `${prodNameHi} सबसे कम दाम पर खरीदें।` : ''} Check specifications, images, availability and offers. Fast delivery available.`;
      const image = product.images?.[0] || "";
      const url = `${window.location.origin}/products/${product.slug}`;

      // Update meta tags
      updateMetaTags({ title, description, image, url, type: "product" });

      // Update Canonical Link
      let canonicalLink = document.querySelector("link[rel='canonical']");
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", url);

      // JSON-LD Product Schema
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: prodName,
        image: product.images,
        description: prodDesc,
        sku: product.sku || product._id,
        mpn: product._id,
        brand: {
          "@type": "Brand",
          name: brand,
        },
        offers: {
          "@type": "Offer",
          url: url,
          priceCurrency: "INR",
          price: product.price,
          priceValidUntil: "2030-12-31",
          itemCondition: "https://schema.org/NewCondition",
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Nitesh Communications",
          },
        },
      };

      if (reviews.length > 0) {
        productSchema.review = reviews.map((rev) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: rev.rating,
            bestRating: "5",
          },
          author: {
            "@type": "Person",
            name: rev.user?.name || "Customer",
          },
          reviewBody: rev.comment,
          datePublished: rev.createdAt
            ? rev.createdAt.split("T")[0]
            : new Date().toISOString().split("T")[0],
        }));

        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: product.ratingsAverage || 5,
          reviewCount: product.ratingsCount || reviews.length,
        };
      }

      // Breadcrumb Schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: window.location.origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: `${window.location.origin}/shop`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name:
              product.category?.name[currentLang] ||
              product.category?.name?.en ||
              "Category",
            item: `${window.location.origin}/shop?category=${product.category?.slug || product.category?._id}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: prodName,
            item: url,
          },
        ],
      };

      let prodScript = document.getElementById("product-jsonld");
      if (!prodScript) {
        prodScript = document.createElement("script");
        prodScript.id = "product-jsonld";
        prodScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(prodScript);
      }
      prodScript.textContent = JSON.stringify(productSchema);

      let breadcrumbScript = document.getElementById("breadcrumb-jsonld");
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement("script");
        breadcrumbScript.id = "breadcrumb-jsonld";
        breadcrumbScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    }

    return () => {
      const prodScript = document.getElementById("product-jsonld");
      if (prodScript) prodScript.remove();
      const breadcrumbScript = document.getElementById("breadcrumb-jsonld");
      if (breadcrumbScript) breadcrumbScript.remove();
    };
  }, [product, reviews, currentLang]);

  const fallbackCopy = useCallback((url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast.success(
          currentLang === "hi"
            ? "लिंक क्लिपबोर्ड पर कॉपी हो गया!"
            : "Product link copied to clipboard!",
        );
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        showToast.error(
          currentLang === "hi"
            ? "लिंक कॉपी करने में विफल!"
            : "Failed to copy link!",
        );
      });
  }, [currentLang]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    const shareTitle = product.name[currentLang] || product.name.en;
    const fullDesc =
      product.description[currentLang] || product.description.en || "";
    const shareText =
      fullDesc.length > 150 ? `${fullDesc.slice(0, 150)}...` : fullDesc;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
          fallbackCopy(shareUrl);
        }
      }
    } else {
      fallbackCopy(shareUrl);
    }
  }, [product, currentLang, fallbackCopy]);

  if (productLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white animate-fadeIn">
        {/* Back button skeleton */}
        <div className="w-16 h-4 shimmer-bg rounded mb-6" />

        {/* Main product columns skeleton */}
        <div className="grid gap-1 grid-cols-1 md:grid-cols-[1fr_1.2fr]">
          {/* Gallery skeleton */}
          <div className="flex flex-col gap-4">
            <div className="shimmer-bg rounded h-[400px] w-full" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 shimmer-bg rounded" />
              ))}
            </div>
          </div>

          {/* Specs skeleton */}
          <div className="flex flex-col gap-4">
            <div className="w-24 h-3 shimmer-bg rounded" />
            <div className="w-3/4 h-8 shimmer-bg rounded" />
            <div className="w-1/3 h-5 shimmer-bg rounded mt-2" />
            <div className="w-28 h-8 shimmer-bg rounded mt-2" />
            <div className="w-1/2 h-4 shimmer-bg rounded mt-4" />
            <div className="w-full h-24 shimmer-bg rounded mt-2" />
            <div className="w-full h-12 shimmer-bg rounded mt-6" />
          </div>
        </div>

        {/* Related Products skeleton */}
        <div className="mt-16">
          <div className="h-6 w-40 shimmer-bg rounded mb-6" />
          <div className="grid gap-1 grid-cols-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 rounded">
                <div className="h-[110px] shimmer-bg rounded mb-2" />
                <div className="h-3 shimmer-bg rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 shimmer-bg rounded w-1/3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = wishlist.some((p) => p._id === product._id);
  const savings = product.originalPrice - product.price;
  const savingsPercent = Math.round((savings / product.originalPrice) * 100);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline mb-6 bg-transparent border-0 cursor-pointer p-0 text-left outline-none"
        type="button"
      >
        <ArrowLeft size={14} /> {t("common:back")}
      </button>

      {/* Main product columns */}
      <div className="grid gap-1 grid-cols-1 md:grid-cols-[1fr_1.2fr]">
        <ProductImagesGallery
          images={product.images}
          name={product.name}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          handleShare={handleShare}
          currentLang={currentLang}
        />

        <ProductSpecs
          product={product}
          isWishlisted={isWishlisted}
          savingsPercent={savingsPercent}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          navigate={navigate}
          t={t}
          currentLang={currentLang}
        />
      </div>

      {/* Review Section */}
      <ProductReviews
        productId={product._id}
        productSlug={product.slug}
        reviews={reviews}
        onReviewsUpdate={setReviews}
        user={user}
        currentLang={currentLang}
        t={t}
        loading={reviewsLoading}
      />

      {/* Related Products Section */}
      <RelatedProducts
        related={related}
        currentLang={currentLang}
        t={t}
        loading={relatedLoading}
      />
    </div>
  );
};

export default ProductDetails;
