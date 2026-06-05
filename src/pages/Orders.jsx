import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";

// Modular components
import ProfileSidebar from "../components/profile/ProfileSidebar";
import OrdersHistoryTab from "../components/profile/OrdersHistoryTab";

const Orders = () => {
  const { i18n } = useTranslation(["cart", "common"]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState(() => {
    const cached = localStorage.getItem("my_orders_cache");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currentLang = i18n.language || "en";
  const isHindi = currentLang === "hi";

  const fetchMyOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data || []);
      localStorage.setItem(
        "my_orders_cache",
        JSON.stringify(response.data || []),
      );
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast.error(
        isHindi
          ? "ऑर्डर इतिहास लोड करने में विफल"
          : "Failed to load order history",
      );
    } finally {
      setOrdersLoading(false);
      setLoading(false);
    }
  }, [isHindi]);

  useEffect(() => {
    if (user) {
      fetchMyOrders();

      // Poll user orders silently in the background every 30 seconds
      const pollInterval = setInterval(() => {
        api
          .get("/orders/my-orders")
          .then((response) => {
            setOrders(response.data || []);
            localStorage.setItem(
              "my_orders_cache",
              JSON.stringify(response.data || []),
            );
          })
          .catch((err) =>
            console.error("Silent background orders refresh failed:", err),
          );
      }, 30000);

      return () => clearInterval(pollInterval);
    }
  }, [user, fetchMyOrders]);

  const handleCancelClick = useCallback(
    async (ord) => {
      if (ord.paymentStatus === "Paid") {
        navigate(`/order-tracking/${ord._id}/return?cancel=true`);
      } else {
        const confirmCancel = window.confirm(
          isHindi
            ? "क्या आप सचमुच इस ऑर्डर को रद्द करना चाहते हैं?"
            : "Are you sure you want to cancel this order?",
        );
        if (!confirmCancel) return;

        setActionLoading(true);
        try {
          await api.post(`/orders/${ord._id}/cancel`);
          showToast.success(
            isHindi
              ? "ऑर्डर सफलतापूर्वक रद्द कर दिया गया!"
              : "Order cancelled successfully!",
          );
          fetchMyOrders();
        } catch (err) {
          showToast.error(err.response?.data?.message || "Cancellation failed");
        } finally {
          setActionLoading(false);
        }
      }
    },
    [navigate, isHindi, fetchMyOrders],
  );

  if (loading && !user) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      {actionLoading && <Loader fullPage />}
      <OrdersHistoryTab
        orders={orders}
        ordersLoading={ordersLoading}
        isHindi={isHindi}
        currentLang={currentLang}
        handleCancelClick={handleCancelClick}
      />
    </div>
  );
};

export default Orders;
