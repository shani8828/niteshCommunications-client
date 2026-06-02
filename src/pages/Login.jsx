import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";

// Modular Components
import LoginForm from "../components/auth/LoginForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

const Login = () => {
  const { t } = useTranslation(["auth", "common", "notifications"]);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const initialPrefilledMobile = location.state?.prefilledMobile || "";

  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLoginSubmit = useCallback(async ({ mobile, password }) => {
    if (!mobile || !password) {
      showToast.error(t("auth:fill_all_fields"));
      return;
    }
    setLoading(true);
    const result = await login(mobile, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  }, [login, navigate, from, t]);

  const handleResetPasswordSubmit = useCallback(async ({ mobile, resetCode, newPassword }) => {
    if (!mobile || !resetCode || !newPassword) {
      showToast.error(t("auth:fill_all_fields"));
      return;
    }
    setLoading(true);
    const success = await resetPassword(
      mobile,
      resetCode.toUpperCase().trim(),
      newPassword,
    );
    setLoading(false);
    if (success) {
      setShowForgotPassword(false);
      showToast.success(
        "पासवर्ड सफलतापूर्वक बदल गया! / Password reset successfully!",
      );
    }
  }, [resetPassword, t]);

  const handleForgotPasswordClick = useCallback(() => {
    setShowForgotPassword(true);
  }, []);

  const handleBackToLoginClick = useCallback(() => {
    setShowForgotPassword(false);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 bg-gradient-to-b from-slate-50 to-white relative">
      {loading && <Loader fullPage />}
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 p-8 shadow-md rounded-2xl">
        {!showForgotPassword ? (
          <LoginForm
            t={t}
            onSubmit={handleLoginSubmit}
            loading={loading}
            onForgotPasswordClick={handleForgotPasswordClick}
            initialMobile={initialPrefilledMobile}
          />
        ) : (
          <ResetPasswordForm
            t={t}
            onSubmit={handleResetPasswordSubmit}
            loading={loading}
            onBackToLoginClick={handleBackToLoginClick}
            initialMobile={initialPrefilledMobile}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
