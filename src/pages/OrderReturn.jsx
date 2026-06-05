import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import Loader from "../components/common/Loader";
import { showToast } from "../utils/toast";
import api from "../utils/api";
import { ArrowLeft, ShieldAlert } from "lucide-react";

// Modular Components
import ReturnItemsSelector from "../components/orders/ReturnItemsSelector";
import ReturnReasonForm from "../components/orders/ReturnReasonForm";
import RefundDestinationForm from "../components/orders/RefundDestinationForm";

const OrderReturn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["cart", "common"]);
  const { setCrumbs } = useBreadcrumbs();

  const queryParams = new URLSearchParams(location.search);
  const isCancelMode = queryParams.get("cancel") === "true";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Return Form State - Managed via Ref to bypass parent keystroke re-renders
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const formValuesRef = React.useRef({
    reason: "",
    comments: "",
    refundMethod: "UPI",
    upiId: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
    },
  });

  const handleUpdateFormValues = useCallback((updates) => {
    formValuesRef.current = {
      ...formValuesRef.current,
      ...updates,
    };
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        const ord = response.data;
        setOrder(ord);

        // Pre-select returnable items
        const initialSelected = {};
        ord.items.forEach((item) => {
          if (isCancelMode || item.product?.returnPolicy === "Return") {
            initialSelected[item.product._id] = item.quantity;
          }
        });
        setSelectedItems(initialSelected);

        setCrumbs([
          { label: t("common:order_summary"), link: "/orders" },
          {
            label: `Order #${ord.orderId}`,
            link: `/order-tracking/${ord._id}`,
          },
          {
            label: isCancelMode
              ? "Order Cancellation Refund"
              : "Request Return",
          },
        ]);
      } catch (err) {
        showToast.error(err.response?.data?.message || "Failed to load order");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, setCrumbs, t, isCancelMode]);

  const toggleItem = useCallback((prodId, maxQty) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[prodId]) {
        delete copy[prodId];
      } else {
        copy[prodId] = maxQty;
      }
      return copy;
    });
  }, []);

  const handleQtyChange = useCallback((prodId, qty) => {
    setSelectedItems((prev) => ({
      ...prev,
      [prodId]: Number(qty),
    }));
  }, []);

  const validateForm = () => {
    const selectedList = Object.keys(selectedItems);
    if (selectedList.length === 0) {
      showToast.error("Please select at least one item to return");
      return false;
    }

    const { reason, refundMethod, upiId, bankDetails } = formValuesRef.current;

    if (!reason) {
      showToast.error("Please select a reason for return");
      return false;
    }

    if (refundMethod === "UPI") {
      if (!upiId.trim() || !upiId.includes("@")) {
        showToast.error("Please enter a valid UPI ID (e.g. name@upi)");
        return false;
      }
    } else {
      if (!bankDetails.accountHolderName.trim()) {
        showToast.error("Please enter account holder name");
        return false;
      }
      if (!bankDetails.accountNumber.trim()) {
        showToast.error("Please enter account number");
        return false;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        showToast.error("Account numbers do not match");
        return false;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bankDetails.ifscCode.trim().toUpperCase())) {
        showToast.error(
          "Please enter a valid 11-digit IFSC code (e.g. SBIN0001234)",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const itemsPayload = Object.entries(selectedItems).map(
        ([productId, quantity]) => ({
          product: productId,
          quantity,
        }),
      );

      const { reason, comments, refundMethod, upiId, bankDetails } = formValuesRef.current;

      const payload = {
        type: "Return",
        reason: `${reason}${comments ? ` - Comments: ${comments}` : ""}`,
        items: itemsPayload,
        refundMethod,
        upiId: refundMethod === "UPI" ? upiId.trim() : undefined,
        bankDetails:
          refundMethod === "Bank"
            ? {
                accountHolderName: bankDetails.accountHolderName.trim(),
                accountNumber: bankDetails.accountNumber.trim(),
                ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
              }
            : undefined,
      };

      if (isCancelMode) {
        await api.post(`/orders/${id}/cancel`, payload);
        showToast.success("Order cancelled and refund requested successfully!");
      } else {
        await api.post(`/orders/${id}/return-replace`, payload);
        showToast.success("Return request submitted successfully!");
      }
      navigate(`/order-tracking/${id}`);
    } catch (err) {
      showToast.error(
        err.response?.data?.message ||
          (isCancelMode
            ? "Failed to cancel order"
            : "Failed to submit return request"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!order) return null;

  const returnableItems = isCancelMode
    ? order.items
    : order.items.filter((item) => item.product?.returnPolicy === "Return");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-20 bg-white">
      <Link
        to={`/order-tracking/${order._id}`}
        className="items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm mb-6 inline-flex font-semibold"
      >
        <ArrowLeft size={16} /> Back to Order Details
      </Link>

      <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 mb-2 text-left">
        {isCancelMode
          ? "Cancel Order & Request Refund"
          : "Request Return & Refund"}
      </h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed text-left">
        {isCancelMode
          ? `Please fill out this form to cancel Order #${order.orderId} and request your online payment refund.`
          : `Please fill out this form to request a return and refund for eligible items in Order #${order.orderId}.`}
      </p>

      {returnableItems.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm mb-6 flex gap-3 text-left">
          <ShieldAlert className="flex-shrink-0 mt-0.5" size={18} />
          <div>
            <strong>No items eligible for return:</strong> There are no products
            in this order that allow returns. Non-returnable products cannot be
            returned.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <ReturnItemsSelector
            returnableItems={returnableItems}
            selectedItems={selectedItems}
            isCancelMode={isCancelMode}
            toggleItem={toggleItem}
            handleQtyChange={handleQtyChange}
          />

          <ReturnReasonForm
            onUpdate={handleUpdateFormValues}
            isCancelMode={isCancelMode}
          />

          <RefundDestinationForm
            onUpdate={handleUpdateFormValues}
          />

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 font-heading font-bold text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-500/10 cursor-pointer border-0 mt-2 disabled:opacity-50 transition-all"
            disabled={submitting}
          >
            {submitting
              ? isCancelMode
                ? "Cancelling Order..."
                : "Submitting Return..."
              : isCancelMode
                ? "Confirm Order Cancellation & Refund"
                : "Confirm Return & Refund"}
          </button>
        </form>
      )}
    </div>
  );
};

export default OrderReturn;
