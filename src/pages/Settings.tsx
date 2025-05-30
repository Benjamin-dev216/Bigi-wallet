import QRCode from "qrcode";
import React, { useState, useEffect } from "react";
import {
  Save,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  QrCode,
  Check,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { supabase, useAuthStore } from "../store/authStore";
import toast, { Toaster } from "react-hot-toast";
import { MoonLoader } from "react-spinners";

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
  const authStore = useAuthStore();
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
    (async () => {
      const user = supabase.auth.getUser(); // get user id
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
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
          toast("TOTP 2FA is already enabled.");
          return;
        }
      }

      const { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
        });

      if (enrollError) throw enrollError;
      setTotpUri(enrollData.totp.uri);
    } catch (err) {
      toast.error("Failed to start 2FA setup");
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
        toast.error("No unverified TOTP factor found.");
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
      const user = supabase.auth.getUser(); // get user id
      const { data: userData } = await user;
      const userId = userData?.user?.id;

      if (!userId) {
        toast.error("User not found. Cannot update profile.");
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ two_factor_enabled: true })
        .eq("user_id", userId);
      if (profileError) throw profileError;

      toast.success("2FA enabled successfully!");
      setTotpVerified(true);
      setTotpUri(null);
      setCodeInput("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to verify 2FA code"
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
        toast.error("No TOTP factor found");
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
      const user = supabase.auth.getUser(); // get user id
      const { data: userData } = await user;
      const userId = userData?.user?.id;

      if (!userId) {
        toast.error("User not found. Cannot update profile.");
        return;
      }
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ two_factor_enabled: false })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      toast.success("2FA disabled successfully");
      setTotpVerified(false);
      setDisabling2FA(false);
      setDisable2FACode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disable 2FA");
    }
  };

  const renderRecoveryPhrase = () =>
    showRecoveryPhrase ? (
      <div className="p-4 bg-neutral-800/50 rounded-lg">
        <div className="grid grid-cols-3 gap-2">
          {recoveryPhrase.split(" ").map((word, index) => (
            <div key={index} className="flex items-center">
              <span className="text-neutral-400 mr-2 text-xs">
                {index + 1}.
              </span>
              <span>{word}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-warning text-sm">
          Never share your recovery phrase with anyone!
        </div>
      </div>
    ) : (
      <div className="p-4 bg-neutral-800/50 rounded-lg text-center">
        <p className="text-sm text-neutral-400">
          Click the eye icon to reveal your recovery phrase
        </p>
      </div>
    );

  const render2FASection = () => {
    if (disabling2FA) {
      return (
        <div className="space-y-4">
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <h3 className="text-error font-medium mb-2">Disable 2FA</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Enter your 2FA code to confirm disabling two-factor authentication
            </p>
            <input
              type="text"
              className="input w-full text-center mb-4"
              value={disable2FACode}
              onChange={(e) => setDisable2FACode(e.target.value)}
              placeholder="Enter 2FA code"
              maxLength={6}
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisabling2FA(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDisable2FA}
                className="bg-error hover:bg-error/90"
              >
                Confirm Disable
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
            <span>2FA is enabled</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-error"
            onClick={() => setDisabling2FA(true)}
          >
            Disable 2FA
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
            Scan this QR code with your authenticator app
          </p>
          <input
            type="text"
            placeholder="Enter code from app"
            className="input w-full mb-2"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <Button variant="primary" onClick={handleVerify2FA}>
            <Check size={16} className="mr-2" />
            Verify & Enable
          </Button>
        </>
      );
    }

    return (
      <Button variant="outline" onClick={handleStart2FA}>
        <QrCode size={16} className="mr-2" />
        Setup 2FA
      </Button>
    );
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Security Card */}
      <Card>
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Shield size={20} className="mr-2 text-primary" />
          Security
        </h2>

        <div className="space-y-6">
          {/* Password Change */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Change Password
            </label>
            <div className="space-y-3">
              <input
                type="password"
                name="new"
                className="input w-full"
                placeholder="New Password"
                value={passwords.new}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                name="confirm"
                className="input w-full"
                placeholder="Confirm New Password"
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          {/* Recovery Phrase */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-neutral-300">
                Recovery Phrase
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
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Two-Factor Authentication
            </label>

            {render2FASection()}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSavePassword}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card variant="outline" className="text-center">
        <h2 className="text-lg font-medium mb-2">BigiWallet</h2>
        <p className="text-sm text-neutral-400 mb-4">Version 1.0.0</p>
        <button className="text-primary hover:text-primary-light text-sm flex items-center justify-center mx-auto">
          <RefreshCw size={14} className="mr-1" />
          Check for updates
        </button>
      </Card>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Settings;
