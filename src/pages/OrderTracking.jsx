import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import Loader from "../components/common/Loader";
import OrderTimeline from "../components/common/OrderTimeline";
import { showToast } from "../utils/toast";
import api from "../utils/api";
import { RefreshCw } from "lucide-react";

// Modular Components
import TrackingItemsSummary from "../components/orders/TrackingItemsSummary";
import TrackingCustomerInfo from "../components/orders/TrackingCustomerInfo";
import TrackingPaymentDetails from "../components/orders/TrackingPaymentDetails";
import TrackingActions from "../components/orders/TrackingActions";
import useVisiblePolling from "../utils/useVisiblePolling";
import { loadRazorpay } from "../utils/razorpay";

const OrderTracking = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation(["cart", "common", "notifications"]);
  const { user } = useAuth();
  const { setCrumbs } = useBreadcrumbs();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const currentLang = i18n.language || "en";

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch order details";
      showToast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== "history") {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [id, fetchOrderDetails]);

  // Refresh tracking details every 15 seconds while the tab is visible
  useVisiblePolling(fetchOrderDetails, 15000, !!id && id !== "history");

  useEffect(() => {
    if (order) {
      setCrumbs([
        { label: t("common:order_summary"), link: "/orders" },
        {
          label: `${t("common:order_tracking") || "Order Tracking"} #${order.orderId}`,
        },
      ]);
    } else if (id && id !== "history") {
      setCrumbs([
        { label: t("common:order_summary"), link: "/orders" },
        { label: `${t("common:order_tracking") || "Order Tracking"} #${id}` },
      ]);
    }
  }, [order, id, currentLang, setCrumbs, t]);


  const handleRetryPayment = useCallback(async () => {
    if (!order) return;
    setRetrying(true);
    try {
      const response = await api.post(`/orders/retry-payment/${id}`);
      const data = response.data;

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        showToast.error("Razorpay SDK failed to load");
        setRetrying(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId || "rzp_test_dummy_key_id",
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "NITESH COMMUNICATIONS",
        description: "Retry Payment for order " + order.orderId,
        order_id: data.razorpayOrder.id,
        prefill: {
          name: user.name,
          contact: order.customerPhone,
          email: user.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response) => {
          setLoading(true);
          try {
            await api.post("/orders/verify", {
              orderId: order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            showToast.success("Payment Verified! Order confirmed.");
            fetchOrderDetails();
          } catch (err) {
            const errorMessage =
              err.response?.data?.message || "Signature verification failed";
            showToast.error(errorMessage);
          } finally {
            setLoading(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to retry payment";
      showToast.error(errorMessage);
    } finally {
      setRetrying(false);
    }
  }, [order, id, user, fetchOrderDetails]);

  if (loading && !order) return <Loader fullPage />;

  // User Order History redirection fallback
  if (id === "history" || !order) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center bg-white">
        <h2 className="font-heading text-2xl font-extrabold text-slate-800 mb-2">
          Order Tracking & History
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
          To track a specific order, please use the unique tracking link from
          your profile dashboard or order confirmation.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all border-0 shadow-sm inline-block"
        >
          {t("cart:go_shopping")}
        </Link>
      </div>
    );
  }

  const deliveredEntry = order.timeline?.find(
    (entry) => entry.status === "Delivered",
  );
  const deliveryTime = deliveredEntry
    ? new Date(deliveredEntry.timestamp)
    : order.deliveryStatus === "Delivered"
      ? new Date(order.updatedAt)
      : null;
  const isWithin24Hours = deliveryTime
    ? Date.now() - deliveryTime.getTime() < 24 * 60 * 60 * 1000
    : false;
  const hasReturnableItems = order.items?.some(
    (item) => item.product?.returnPolicy === "Return",
  );
  const hasReplaceableItems = order.items?.some(
    (item) => item.product?.returnPolicy === "Replace",
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white relative">
      {loading && <Loader fullPage />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="text-left">
          <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">
            Order ID: {order.orderId}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Tracking Details
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrderDetails}
            className="px-4 py-2 text-xs font-semibold rounded bg-slate-100 text-blue-600 border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer border-0 outline-none"
            title="Refresh Order Status"
            type="button"
          >
            <RefreshCw size={14} /> Refresh Status
          </button>
          <Link
            to="/orders"
            className="px-4 py-2 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 block"
          >
            Orders History
          </Link>
        </div>
      </div>

      {/* Stepper Timeline Panel */}
      <div className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded mb-8 shadow-sm">
        <OrderTimeline
          currentStatus={order.deliveryStatus}
          timeline={order.timeline}
        />
      </div>

      {/* Grid: Order summary & Customer info */}
      <div className="grid gap-1 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <TrackingItemsSummary order={order} currentLang={currentLang} />

        <div className="flex flex-col gap-6">
          <TrackingCustomerInfo order={order} />

          <TrackingPaymentDetails
            order={order}
            handleRetryPayment={handleRetryPayment}
            retrying={retrying}
          />

          <TrackingActions
            order={order}
            isWithin24Hours={isWithin24Hours}
            hasReturnableItems={hasReturnableItems}
            hasReplaceableItems={hasReplaceableItems}
            currentLang={currentLang}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
