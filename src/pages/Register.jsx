import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import Loader from "../components/common/Loader";

// Modular Components
import RegisterForm from "../components/auth/RegisterForm";
import RecoveryCodesView from "../components/auth/RecoveryCodesView";

const Register = () => {
  const { t } = useTranslation(["auth", "common", "notifications"]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [registeredUser, setRegisteredUser] = useState({ name: "", mobile: "" });

  const handleRegisterSubmit = useCallback(async ({ name, mobile, password, address, email, coordinates }) => {
    setLoading(true);
    const result = await register(
      name,
      mobile,
      password,
      address,
      email,
      coordinates,
    );
    setLoading(false);

    if (result.success) {
      setRegisteredUser({ name, mobile });
      if (result.recoveryCodes && result.recoveryCodes.length > 0) {
        setGeneratedCodes(result.recoveryCodes);
      } else {
        navigate("/");
      }
    }
  }, [register, navigate]);

  const handleCopyCodes = useCallback(() => {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    showToast.success("सभी कोड कॉपी हो गए! / All codes copied to clipboard!");
  }, [generatedCodes]);

  const handleDownloadCodes = useCallback(() => {
    const text = `NITESH COMMUNICATIONS RECOVERY CODES\n======================================\nGenerated on: ${new Date().toLocaleString()}\n\nKeep these codes secure. They are the only way to reset your password if you lose it.\n\n${generatedCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n======================================`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nitesh-recovery-codes-${registeredUser.mobile}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast.success("फ़ाइल डाउनलोड हो गई! / File downloaded!");
  }, [generatedCodes, registeredUser.mobile]);

  const handlePrintCodes = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast.error(
        "पॉपअप अवरोधित है! कृपया प्रिंट के लिए पॉपअप की अनुमति दें। / Popup blocked! Please allow popups to print.",
      );
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Nitesh Communications - Recovery Codes</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #2563eb; font-size: 24px; margin-bottom: 5px; }
            .tagline { color: #64748b; font-size: 14px; margin-bottom: 20px; }
            .box { border: 2px dashed #2563eb; padding: 25px; display: inline-block; border-radius: 12px; background: #f8fafc; }
            .code { font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 12px 0; color: #1e293b; }
            .note { color: #dc2626; font-weight: bold; margin-top: 20px; max-width: 500px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Nitesh Communications</h1>
          <div class="tagline">रिकवरी कोड / Security Recovery Codes</div>
          <p><strong>ग्राहक का नाम / Customer:</strong> ${registeredUser.name}</p>
          <p><strong>मोबाइल नंबर / Mobile:</strong> ${registeredUser.mobile}</p>
          <p><strong>तारीख / Date:</strong> ${new Date().toLocaleDateString()}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>कृपया इन कोड्स को सुरक्षित रखें। पासवर्ड भूलने पर केवल इन्हीं से रीसेट हो सकेगा। प्रत्येक कोड केवल एक बार इस्तेमाल किया जा सकता है।</p>
          <p>Please keep these codes safe. If you forget your password, these codes are the only way to recover your account. Each code can only be used once.</p>
          <div class="box">
            ${generatedCodes.map((c, i) => `<div class="code">Code ${i + 1}: ${c}</div>`).join("")}
          </div>
          <div class="note">
            चेतावनी: इन कोडों को दोबारा नहीं देखा जा सकेगा। इन्हें सुरक्षित स्थान पर रखें।<br/>
            WARNING: These codes cannot be viewed again. Store them in a secure place.
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [generatedCodes, registeredUser.name, registeredUser.mobile]);

  const handleContinueClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-12 bg-gradient-to-b from-slate-50 to-white relative">
      {loading && <Loader fullPage />}
      {generatedCodes.length > 0 ? (
        <RecoveryCodesView
          generatedCodes={generatedCodes}
          onCopy={handleCopyCodes}
          onDownload={handleDownloadCodes}
          onPrint={handlePrintCodes}
          onContinue={handleContinueClick}
        />
      ) : (
        <div className="w-full max-w-[450px] p-8 bg-white border border-slate-200/80 shadow-md rounded-2xl">
          <RegisterForm
            t={t}
            onSubmit={handleRegisterSubmit}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default Register;
