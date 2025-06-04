import React, { useState, useEffect } from "react";
import { ScanBarcode, X } from "lucide-react";
import { QrReader } from "react-qr-reader";
import { useTranslation } from "react-i18next";

interface Props {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  senderAddress?: string;
}

const isEthereumAddress = (address: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(address);
const isBitcoinAddress = (address: string) =>
  /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
  /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/i.test(address);

const RecipientAddressInput: React.FC<Props> = ({
  recipientAddress,
  setRecipientAddress,
  senderAddress,
}) => {
  const { t } = useTranslation();
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [network, setNetwork] = useState<"ethereum" | "bitcoin">("ethereum");

  useEffect(() => {
    if (!senderAddress || senderAddress.startsWith("0x")) {
      setNetwork("ethereum");
    } else {
      setNetwork("bitcoin");
    }
  }, [senderAddress]);

  useEffect(() => {
    validateAddress(recipientAddress);
  }, [recipientAddress, network]);

  const validateAddress = (address: string) => {
    if (!address) {
      setValidationError(null);
      return;
    }

    if (network === "ethereum") {
      setValidationError(
        isEthereumAddress(address)
          ? null
          : t("recipientAddress.invalidEthereum")
      );
    } else {
      setValidationError(
        isBitcoinAddress(address) ? null : t("recipientAddress.invalidBitcoin")
      );
    }
  };

  const handleScanResult = (value: string) => {
    setRecipientAddress(value.trim());
    setShowScanner(false);
    setCameraError(null);
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
        {t("recipientAddress.label")} {network}
      </label>

      <div className="relative flex items-center gap-2">
        <input
          type="text"
          placeholder={t("recipientAddress.placeholder", {
            network: t(`common.${network}`),
          })}
          className={`input w-full pr-10 ${
            validationError ? "border-red-500" : "border-neutral-700"
          }`}
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            setCameraError(null);
            setShowScanner(true);
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
          aria-label={t("recipientAddress.scanButton")}
        >
          <ScanBarcode size={20} />
        </button>
      </div>

      {validationError && (
        <p className="text-red-500 text-sm mt-1">{validationError}</p>
      )}

      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-[rgb(var(--background-light))] rounded-2xl p-5 w-[90%] max-w-sm shadow-2xl border border-neutral-700">
            <button
              className="absolute top-3 right-3 text-neutral-400 hover:text-white"
              onClick={() => {
                setShowScanner(false);
                setCameraError(null);
              }}
              aria-label={t("common.close")}
            >
              <X size={18} />
            </button>

            <h2 className="text-[rgb(var(--text))] text-lg font-semibold mb-4 text-center">
              {t("recipientAddress.scanTitle")}
            </h2>

            <div className="rounded-lg overflow-hidden border border-neutral-700">
              <QrReader
                constraints={{ facingMode: "environment" }}
                scanDelay={300}
                onResult={(result, error) => {
                  if (result?.getText()) {
                    handleScanResult(result.getText());
                  } else if (error) {
                    if (
                      error.name === "NotAllowedError" ||
                      error.name === "PermissionDeniedError"
                    ) {
                      setCameraError(t("recipientAddress.cameraDenied"));
                    } else if (error.name === "NotFoundError") {
                      setCameraError(t("recipientAddress.noCamera"));
                    } else {
                      setCameraError(t("recipientAddress.cameraError"));
                    }
                  }
                }}
                containerStyle={{ width: "100%" }}
                videoStyle={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "0.5rem",
                }}
              />
            </div>

            {cameraError && (
              <p className="text-red-500 text-sm mt-3 text-center">
                {cameraError}
              </p>
            )}

            <button
              className="mt-4 w-full text-sm text-blue-400 hover:underline text-center"
              onClick={() => {
                setShowScanner(false);
                setCameraError(null);
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientAddressInput;
