import React, { useEffect, useState } from "react";
import { Send, QrCode, Copy, CheckCircle, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TokenIcon from "../components/ui/TokenIcon";
import { useWalletStore } from "../store/walletStore";
import QRCode from "qrcode.react";
import { useParams } from "react-router-dom";
import { supabase, useAuthStore } from "../store/authStore";
import RecipientAddressInput from "../components/common/RecipientInput";
import { sendErc20Token, sendEth, sendBTC } from "../utils/sendCrypto";
import { Toaster } from "react-hot-toast";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "react-i18next";

type FeeLevel = "Slow" | "Medium" | "Fast";
const SendReceive: React.FC = () => {
  const params = useParams();
  const { wallets } = useAuthStore();
  const { walletTokens, selectedToken, selectToken } = useWalletStore();
  const [receiveAddress, setReceiveAddress] = useState("");
  const [activeTab, setActiveTab] = useState<"send" | "receive">(
    params.action === "receive" ? "receive" : "send"
  );
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [addressCopied, setAddressCopied] = useState(false);
  const [network, setNetwork] = useState<"ethereum" | "bitcoin">("ethereum");
  const [feeLevel, setFeeLevel] = useState<FeeLevel>("Medium");
  const [fees, setFees] = useState<Record<string, string | number>>({});
  const [inputInFiat, setInputInFiat] = useState(false); // false = crypto, true = fiat
  const [fiatInput, setFiatInput] = useState(""); // string for fiat input

  const { currency } = useSettingsStore();
  const { t } = useTranslation();

  const receiveData = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      address: wallets?.bitcoin.address,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      address: wallets?.ethereum.address,
    },
    {
      name: "Wrapped Ether",
      symbol: "WETH",
      address: wallets?.ethereum.address,
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      address: wallets?.ethereum.address,
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      address: wallets?.ethereum.address,
    },
    {
      name: "Shiba Inu",
      symbol: "SHIB",
      address: wallets?.ethereum.address,
    },
    {
      name: "USDS",
      symbol: "USDS",
      address: wallets?.ethereum.address,
    },
  ];
  const currentToken = receiveAddress
    ? receiveData.find((t) => t.address === receiveAddress)
    : receiveData[0];

  const toSendToken = walletTokens.find((t) => t.id === selectedToken);

  const handleSend = () => {
    if (!recipientAddress || !amount) return;
    if (toSendToken?.id.startsWith("0x")) {
      // sendErc20Token()
      sendErc20Token(
        recipientAddress,
        amount,
        toSendToken.id,
        wallets?.ethereum.privateKey || "",
        String(fees[feeLevel.toLowerCase()])
      );
    } else if (!toSendToken?.id) {
      sendEth(
        recipientAddress,
        amount,
        wallets?.ethereum.privateKey || "",
        String(fees[feeLevel.toLowerCase()])
      );
    } else {
      sendBTC({
        privateKeyWIF: wallets?.bitcoin.privateKey || "",
        senderAddress: wallets?.bitcoin.address || "",
        recipientAddress,
        amountSats: Number(amount),
        feeSats: Number(fees[feeLevel.toLowerCase()]),
      });
    }
  };
  const copyAddress = () => {
    navigator.clipboard.writeText(receiveAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };
  const gweiToEth = (wei: number) => wei / 1e18;
  const satToBtc = (sat: number) => sat / 1e8;
  const formatToThreeNonZeroDigits = (value: number) => {
    const str = value.toFixed(12); // ensure enough decimal precision
    const [intPart, decPart] = str.split(".");

    let result = "";
    let count = 0;
    for (const digit of decPart) {
      result += digit;
      if (digit !== "0") count++;
      if (count === 3) break;
    }

    return `${intPart}.${result}`;
  };
  const formatFeeAmount = (level: string) => {
    const raw = fees[level.toLowerCase()];
    if (!raw) return "N/A";

    if (network === "ethereum") {
      const ethAmount = gweiToEth(Number(raw));
      return `${formatToThreeNonZeroDigits(ethAmount)} ETH`;
    } else {
      const satoshis = Number(raw);
      const btcAmount = satToBtc(satoshis);
      return `${formatToThreeNonZeroDigits(btcAmount)} BTC`;
    }
  };

  useEffect(() => {
    setReceiveAddress(wallets?.bitcoin.address || "");
  }, [wallets?.bitcoin.address]);

  useEffect(() => {
    if (
      !toSendToken?.id ||
      toSendToken.id.startsWith("0x") ||
      toSendToken.symbol !== "BTC"
    ) {
      setNetwork("ethereum");
    } else {
      setNetwork("bitcoin");
    }
  }, [toSendToken?.id]);

  useEffect(() => {
    const fetchFees = async () => {
      const { data } = await supabase.functions.invoke("get-gas-prices", {
        body: JSON.stringify({
          network: network === "ethereum" ? "ETH" : "BTC",
        }),
      });
      setFees(data.gasData);
    };
    fetchFees();
  }, [network]);

  return (
    <div className="max-w-xl mx-auto pb-8">
      {/* Tabs */}
      <div className="flex bg-[rgb(var(--background-light))] rounded-lg mb-6 p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-md transition-all ${
            activeTab === "send"
              ? "bg-primary text-white"
              : "text-neutral-500 hover:text-[rgb(var(--text))]"
          }`}
          onClick={() => setActiveTab("send")}
        >
          <div className="flex items-center justify-center space-x-2">
            <Send size={18} />
            <span>{t("sendReceive.tabs.send")}</span>
          </div>
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md transition-all ${
            activeTab === "receive"
              ? "bg-secondary text-white"
              : "text-neutral-500 hover:hover:text-[rgb(var(--text))]"
          }`}
          onClick={() => setActiveTab("receive")}
        >
          <div className="flex items-center justify-center space-x-2">
            <QrCode size={18} />
            <span>{t("sendReceive.tabs.receive")}</span>
          </div>
        </button>
      </div>

      <Card className="w-full animate-fade-in p-[10px] md:p-6">
        {activeTab === "send" ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">
              {t("sendReceive.send.title", { symbol: toSendToken?.symbol })}
            </h2>

            {/* Token Selector */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                {t("sendReceive.send.selectAsset")}
              </label>
              <select
                className="input w-full"
                value={selectedToken || ""}
                onChange={(e) => selectToken(e.target.value)}
              >
                {walletTokens.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Address */}
            <div>
              <RecipientAddressInput
                recipientAddress={recipientAddress}
                setRecipientAddress={setRecipientAddress}
                senderAddress={toSendToken?.id}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                {t("sendReceive.send.amount")}
              </label>

              {/* Input + Token */}
              <div className="relative">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.0"
                    className="input w-full pr-20 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={inputInFiat ? fiatInput : amount}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (!toSendToken) return;

                      if (inputInFiat) {
                        // Update fiat string input
                        setFiatInput(val);

                        // Convert and store in crypto
                        const parsed = parseFloat(val);
                        if (!isNaN(parsed)) {
                          setAmount((parsed / toSendToken.price).toString());
                        }
                      } else {
                        // Crypto mode
                        setAmount(val);
                      }
                    }}
                  />
                </div>

                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setInputInFiat(!inputInFiat);
                    if (!inputInFiat && toSendToken) {
                      // Switching TO fiat mode — compute fiat input display
                      const fiat =
                        parseFloat(amount || "0") * toSendToken.price;
                      setFiatInput(fiat ? fiat.toFixed(2) : "");
                    }
                    setAmount("");
                  }}
                  title={`Switch to ${
                    inputInFiat ? toSendToken?.symbol : currency.toUpperCase()
                  }`}
                >
                  {toSendToken && (
                    <div className="flex items-center space-x-1 text-sm text-neutral-400">
                      {/* Currency Label */}
                      {/* 2-way Arrow Icon */}
                      <span className="text-lg">⇄</span>
                      <span>
                        {inputInFiat
                          ? currency.toUpperCase()
                          : toSendToken.symbol}
                      </span>

                      {/* Token Icon */}
                      <TokenIcon symbol={toSendToken.symbol} size="sm" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                {toSendToken && (
                  <p className="text-sm text-neutral-400 mt-1">
                    {t("sendReceive.send.balance", {
                      balance: toSendToken.balance,
                      symbol: toSendToken.symbol,
                      value: (toSendToken.balance * toSendToken.price).toFixed(
                        2
                      ),
                      currency,
                    })}
                  </p>
                )}
                {/* Quick % Buttons */}
                {toSendToken && (
                  <div className="flex items-center gap-0 mt-1">
                    {[0.25, 0.5, 1].map((percent) => (
                      <button
                        key={percent}
                        type="button"
                        className="px-1 text-sm text-blue-400 bg-[rgb(var(--background-light))] rounded"
                        onClick={() =>
                          setAmount((toSendToken.balance * percent).toString())
                        }
                      >
                        {percent * 100}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning */}
              {toSendToken &&
                parseFloat(amount || "0") > toSendToken.balance && (
                  <p className="text-sm text-red-500 mt-1">
                    {t("sendReceive.send.warning")}
                  </p>
                )}
            </div>

            {/* Fee Options */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                {t("sendReceive.send.transactionFee")}
              </label>
              <div className="flex flex-wrap gap-2 w-full">
                {["Slow", "Medium", "Fast"].map((level) => (
                  <label
                    key={level}
                    className={`flex-1 min-w-[120px] sm:min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors text-sm
                  ${
                    feeLevel === level
                      ? "bg-primary text-white border-primary"
                      : "bg-[rgb(var(--background))] text-[rgb(var(--text))] "
                  }`}
                  >
                    <input
                      type="radio"
                      name="fee"
                      value={level}
                      checked={feeLevel === level}
                      onChange={() => setFeeLevel(level as FeeLevel)}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center text-center w-full truncate">
                      <span className="font-medium">
                        {t(`sendReceive.send.feeLevels.${level.toLowerCase()}`)}
                      </span>
                      <span className="text-xs">{formatFeeAmount(level)}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <Button
              variant="primary"
              fullWidth
              onClick={handleSend}
              disabled={!recipientAddress || !amount}
            >
              {t("sendReceive.send.sendButton", {
                symbol: toSendToken?.symbol,
              })}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">
              {t("sendReceive.receive.title", { symbol: currentToken?.symbol })}
            </h2>

            {/* Token Selector */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                {t("sendReceive.receive.selectAsset")}
              </label>
              <select
                className="input w-full"
                onChange={(e) => {
                  const selectedSymbol = e.target.value;
                  const selectedNetwork = receiveData.find(
                    (network) => network.symbol === selectedSymbol
                  );
                  if (selectedNetwork) {
                    setReceiveAddress(selectedNetwork.address || "");
                  }
                }}
              >
                {receiveData.map((network) => (
                  <option key={network.symbol} value={network.symbol}>
                    {network.name} ({network.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-white p-3 rounded-lg mb-4">
                <QRCode
                  value={receiveAddress}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Wallet Address */}
              <div className="w-full">
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  {t("sendReceive.receive.walletAddress")}
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="input flex-1"
                    value={receiveAddress}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={copyAddress}
                  >
                    {addressCopied ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-neutral-400 mt-2">
                  {t("sendReceive.receive.shareMessage", {
                    symbol: currentToken?.symbol,
                  })}
                </p>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 text-warning rounded-lg p-4 flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                {t("sendReceive.receive.warning", {
                  assetType:
                    currentToken?.name === "Bitcoin"
                      ? t("sendReceive.assetTypes.bitcoin")
                      : t("sendReceive.assetTypes.ethereum"),
                })}
              </p>
            </div>
          </div>
        )}
      </Card>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default SendReceive;
