import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/common/Loader";
import api from "../utils/api";

// Modular components
import ProfileSidebar from "../components/profile/ProfileSidebar";
import RepairBookingsTab from "../components/profile/RepairBookingsTab";

const RepairBookings = () => {
  const { i18n } = useTranslation(["cart", "common"]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [repairs, setRepairs] = useState(() => {
    const cached = localStorage.getItem("my_repairs_cache");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);
  const [repairsLoading, setRepairsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currentLang = i18n.language || "en";
  const isHindi = currentLang === "hi";

  const fetchMyRepairs = useCallback(async () => {
    if (!user || (!user.mobile && !user.phone)) {
      setRepairsLoading(false);
      setLoading(false);
      return;
    }
    setRepairsLoading(true);
    try {
      const userPhone = user.mobile || user.phone;
      const response = await api.get(`/repairs/my/${userPhone}`);
      setRepairs(response.data || []);
      localStorage.setItem(
        "my_repairs_cache",
        JSON.stringify(response.data || []),
      );
    } catch (err) {
      console.error("Error fetching repairs:", err);
      showToast.error(
        isHindi
          ? "रिपेयर बुकिंग लोड करने में विफल"
          : "Failed to load repair bookings",
      );
    } finally {
      setRepairsLoading(false);
      setLoading(false);
    }
  }, [user, isHindi]);

  useEffect(() => {
    if (user) {
      fetchMyRepairs();

      // Poll user repairs silently in the background every 30 seconds
      const pollInterval = setInterval(() => {
        const userPhone = user.mobile || user.phone;
        if (userPhone) {
          api
            .get(`/repairs/my/${userPhone}`)
            .then((response) => {
              setRepairs(response.data || []);
              localStorage.setItem(
                "my_repairs_cache",
                JSON.stringify(response.data || []),
              );
            })
            .catch((err) =>
              console.error("Silent background repairs refresh failed:", err),
            );
        }
      }, 30000);

      return () => clearInterval(pollInterval);
    }
  }, [user, fetchMyRepairs]);

  const handleCancelRepair = useCallback(
    async (rep) => {
      if (rep.paymentMethod === "Online" && rep.paymentStatus === "Paid") {
        navigate(`/repairs/${rep._id}/cancel`);
      } else {
        const confirmCancel = window.confirm(
          isHindi
            ? "क्या आप सचमुच इस रिपेयर बुकिंग को रद्द करना चाहते हैं?"
            : "Are you sure you want to cancel this repair booking?",
        );
        if (!confirmCancel) return;

        setActionLoading(true);
        try {
          await api.post(`/repairs/${rep._id}/cancel`);
          showToast.success(
            isHindi
              ? "रिपेयर बुकिंग सफलतापूर्वक रद्द की गई!"
              : "Repair booking cancelled successfully!",
          );
          fetchMyRepairs();
        } catch (err) {
          showToast.error(err.response?.data?.message || "Cancellation failed");
        } finally {
          setActionLoading(false);
        }
      }
    },
    [navigate, isHindi, fetchMyRepairs],
  );

  if (loading && !user) return <Loader fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
      {actionLoading && <Loader fullPage />}
      <RepairBookingsTab
        repairs={repairs}
        repairsLoading={repairsLoading}
        isHindi={isHindi}
        handleCancelRepair={handleCancelRepair}
      />
    </div>
  );
};

export default RepairBookings;
