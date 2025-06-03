import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Save,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  QrCode,
  Check,
  Globe2,
  Coins,
  Sun,
  Moon,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { supabase, useAuthStore } from "../store/authStore";
import { useSettingsStore } from "../store/settingsStore";
import toast, { Toaster } from "react-hot-toast";
import { MoonLoader } from "react-spinners";
import { adminSupabase } from "../store/adminStore";
import { useTranslation } from "react-i18next";

export const TotpQr = ({ uri }: { uri: string }) => {
  const [qrSvg, setQrSvg] = useState<string>("");

  useEffect(() => {
    if (!uri) return;
    QRCode.toString(uri, { type: "svg" }).then(setQrSvg);
  }, [uri]);

  return (
    <div
      className="w-[200px] h-[200px] mx-auto mb-4"
      dangerouslySetInnerHTML={{ __html: qrSvg }}
    />
  );
};

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const authStore = useAuthStore();
  const { currency, language, theme, setCurrency, setLanguage, setTheme } =
    useSettingsStore();
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [totpVerified, setTotpVerified] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState("");

  const recoveryPhrase =
    authStore.mnemonic ||
    "valley alien library bread worry brother bundle hammer loyal barely dune brave";

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    (async () => {
      const user = supabase.auth.getUser();
      const { data: userData } = await user;
      const userId = userData?.user?.id;

      if (!userId) {
        toast.error("User not found. Cannot update profile.");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("two_factor_enabled")
        .eq("user_id", userId)
        .single();
      setTotpVerified(profile?.two_factor_enabled);
    })();
  }, []);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error(t("messages.passwordMismatch"));
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });
    if (error) {
      toast.error(t("messages.passwordUpdateFailed", { error: error.message }));
    } else {
      toast.success(t("messages.passwordUpdateSuccess"));
      setPasswords({ new: "", confirm: "" });
    }
  };

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });
    if (error) {
      toast.error("Failed to update password: " + error.message);
    } else {
      toast.success("Password updated successfully!");
      setPasswords({ new: "", confirm: "" });
    }
  };

  const handleStart2FA = async () => {
    setMfaLoading(true);
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const existingTotp = factorsData?.all?.find(
        (factor: any) => factor.factor_type === "totp"
      );

      if (existingTotp) {
        if (existingTotp.status === "unverified") {
          await supabase.auth.mfa.unenroll({ factorId: existingTotp.id });
        } else {
          const user = supabase.auth.getUser();
          const { data: userData } = await user;
          const userId = userData?.user?.id;

          const { error } = await adminSupabase.auth.admin.mfa.deleteFactor({
            id: existingTotp.id,
            userId: userId || "",
          });
          if (error) throw error;
        }
      }

      const { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
        });

      if (enrollError) throw enrollError;
      setTotpUri(enrollData.totp.uri);
    } catch (err) {
      toast.error(t("messages.failed2FASetup"));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.all?.find(
        (factor: any) =>
          factor.factor_type === "totp" && factor.status === "unverified"
      );

      if (!totpFactor) {
        toast.error(t("messages.no2FAFactor"));
        return;
      }

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: codeInput,
      });

      if (verifyError) throw verifyError;
      const user = supabase.auth.getUser();
      const { data: userData } = await user;
      const userId = userData?.user?.id;

      if (!userId) {
        toast.error(t("messages.userNotFound"));
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ two_factor_enabled: true })
        .eq("user_id", userId);
      if (profileError) throw profileError;

      toast.success(t("messages.2FAEnabledSuccess"));
      setTotpVerified(true);
      setTotpUri(null);
      setCodeInput("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("messages.failed2FAVerify")
      );
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.all?.find(
        (factor: any) => factor.factor_type === "totp"
      );

      if (!totpFactor) {
        toast.error(t("messages.noTOTPFactor"));
        return;
      }

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: disable2FACode,
      });

      if (verifyError) throw verifyError;

      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (unenrollError) throw unenrollError;
      const user = supabase.auth.getUser();
      const { data: userData } = await user;
      const userId = userData?.user?.id;

      if (!userId) {
        toast.error(t("messages.userNotFound"));
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ two_factor_enabled: false })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      toast.success(t("messages.2FADisabledSuccess"));
      setTotpVerified(false);
      setDisabling2FA(false);
      setDisable2FACode("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("messages.failed2FADisable")
      );
    }
  };

  const renderRecoveryPhrase = () =>
    showRecoveryPhrase ? (
      <div className="p-4 rounded-lg bg-[rgb(var(--background-light))]">
        <div className="grid grid-cols-3 gap-2">
          {recoveryPhrase.split(" ").map((word, index) => (
            <div key={index} className="flex items-center">
              <span className="mr-2 text-xs text-[rgb(var(--text))] ">
                {index + 1}.
              </span>
              <span className="text-[rgb(var(--text))]">{word}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
          {t("messages.recoveryPhraseWarning")}
        </div>
      </div>
    ) : (
      <div className="p-4 rounded-lg text-center bg-[rgb(var(--background-light))] ">
        <p className="text-sm text-[rgb(var(--text))]">
          {t("messages.recoveryPhraseHidden")}
        </p>
      </div>
    );

  const render2FASection = () => {
    if (disabling2FA) {
      return (
        <div className="space-y-4">
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <h3 className="text-error font-medium mb-2">
              {t("settings.security.disable2FA")}
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              {t("messages.disable2FAConfirm")}
            </p>
            <input
              type="text"
              className="input w-full text-center mb-4"
              value={disable2FACode}
              onChange={(e) => setDisable2FACode(e.target.value)}
              placeholder={t("messages.enter2FACode")}
              maxLength={6}
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisabling2FA(false)}
              >
                {t("settings.security.cancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDisable2FA}
                className="bg-error hover:bg-error/90"
              >
                {t("settings.security.confirmDisable")}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    if (totpVerified) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-success">
            <Check size={18} />
            <span>{t("settings.security.twoFactorEnabled")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-error"
            onClick={() => setDisabling2FA(true)}
          >
            {t("settings.security.disable2FA")}
          </Button>
        </div>
      );
    }

    if (mfaLoading) {
      return (
        <div className="flex justify-center items-center py-4">
          <MoonLoader color="white" />
        </div>
      );
    }

    if (totpUri) {
      return (
        <>
          <TotpQr uri={totpUri} />
          <p className="text-sm text-neutral-400 text-center mb-4">
            {t("messages.scanQRCode")}
          </p>
          <input
            type="text"
            placeholder={t("messages.enterCodeFromApp")}
            className="input w-full mb-2"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <Button variant="primary" onClick={handleVerify2FA}>
            <Check size={16} className="mr-2" />
            {t("settings.security.verifyAndEnable")}
          </Button>
        </>
      );
    }

    return (
      <Button variant="outline" onClick={handleStart2FA}>
        <QrCode size={16} className="mr-2" />
        {t("settings.security.setup2FA")}
      </Button>
    );
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-8 ">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

      {/* Preferences Card */}
      <Card>
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Globe2 size={20} className="mr-2 text-primary" />
          {t("settings.preferences.title")}
        </h2>

        <div className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              {t("settings.preferences.currency")}
            </label>
            <div className="flex items-center space-x-3">
              {["USD", "EUR", "GBP"].map((curr) => {
                const isActive = currency === curr;
                return (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-[rgb(var(--background-light))] text-[rgb(var(--text))] hover:bg-primary/20"
                    }`}
                  >
                    <Coins size={16} />
                    <span>{curr}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium  mb-2 text-[rgb(var(--text))]">
              {t("settings.preferences.language")}
            </label>
            <div className="flex items-center space-x-3">
              {[
                { code: "en", label: t("languages.en") },
                { code: "fr", label: t("languages.fr") },
                { code: "de", label: t("languages.de") },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    language === lang.code
                      ? "bg-primary text-white"
                      : "hover:bg-primary/20 bg-[rgb(var(--background-light))] text-[rgb(var(--text))]"
                  }`}
                >
                  <Globe2 size={16} />
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium  mb-2 text-[rgb(var(--text))]">
              {t("settings.preferences.theme")}
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  theme === "dark"
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20 bg-[rgb(var(--background-light))] text-[rgb(var(--text))]"
                }`}
              >
                <Moon size={16} />
                <span>{t("settings.preferences.themes.dark")}</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20 bg-[rgb(var(--background-light))] text-[rgb(var(--text))]"
                }`}
              >
                <Sun size={16} />
                <span>{t("settings.preferences.themes.light")}</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Card */}
      <Card>
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Shield size={20} className="mr-2 text-primary" />
          {t("settings.security.title")}
        </h2>

        <div className="space-y-6">
          {/* Password Change */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              {t("settings.security.changePassword")}
            </label>
            <div className="space-y-3">
              <input
                type="password"
                name="new"
                className="input w-full"
                placeholder={t("settings.security.newPassword")}
                value={passwords.new}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                name="confirm"
                className="input w-full"
                placeholder={t("settings.security.confirmPassword")}
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          {/* Recovery Phrase */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[rgb(var(--text))]">
                {t("settings.security.recoveryPhrase")}
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}
              >
                {showRecoveryPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {renderRecoveryPhrase()}
          </div>

          {/* 2FA Section */}
          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-sm font-medium  text-[rgb(var(--text))] mb-2">
              {t("settings.security.twoFactor")}
            </label>

            {render2FASection()}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSavePassword}>
              <Save size={16} className="mr-2" />
              {t("settings.security.saveChanges")}
            </Button>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card variant="outline" className="text-center">
        <h2 className="text-lg font-medium mb-2">
          {t("settings.about.title")}
        </h2>
        <p className="text-sm text-neutral-400 mb-4">
          {t("settings.about.version")}
        </p>
        <button className="text-primary hover:text-primary-light text-sm flex items-center justify-center mx-auto">
          <RefreshCw size={14} className="mr-1" />
          {t("settings.about.checkUpdates")}
        </button>
      </Card>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Settings;
