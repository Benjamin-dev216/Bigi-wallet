import React, { useState, useEffect } from "react";
import { ArrowDownUp, Settings } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useTokens } from "../hooks/useTokens";
import { TokenSelect } from "../components/common/TokenSelect";
import { ethers, formatUnits, parseUnits } from "ethers";
import { provider } from "../utils/sendCrypto";
import { erc20ABI } from "../utils/tokenAbi";
import { supabase, useAuthStore } from "../store/authStore";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import { MoonLoader } from "react-spinners";
import { concat, numberToHex, size } from "viem";
import { createWalletClient, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "react-i18next";

const uniswapRouterAddress = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

const MAX_APPROVE_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const Swap: React.FC = () => {
  const { t } = useTranslation();
  const { tokens, isLoading: tokensLoading } = useTokens();
  const { wallets } = useAuthStore();
  const { data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const [fromToken, setFromToken] = useState<any | null>(null);
  const [toToken, setToToken] = useState<any | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approve, setApprove] = useState(false);
  const PRIVATE_KEY = wallets?.ethereum.privateKey;

  const { theme } = useSettingsStore();

  const account = privateKeyToAccount(PRIVATE_KEY as any);
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  useEffect(() => {
    if (tokens.length > 0) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  }, [tokens]);

  useEffect(() => {
    if (!fromToken || !wallets?.ethereum?.address) return;

    const loadBalance = async () => {
      try {
        const contract =
          fromToken.symbol === "ETH"
            ? null
            : new ethers.Contract(fromToken.address, erc20ABI, provider);

        const rawBalance = contract
          ? await contract.balanceOf(wallets.ethereum.address)
          : await provider.getBalance(wallets.ethereum.address);

        const formatted = formatUnits(rawBalance, fromToken.decimals);
        setFromToken((prev: any) => ({ ...prev, balance: formatted }));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    loadBalance();
  }, [fromToken, wallets?.ethereum?.address]);

  const handleSwap = async () => {
    setLoading(true);
    try {
      const userAddress = wallets?.ethereum?.address;
      if (!userAddress) {
        toast.error(t("swap.errors.connectWallet"));
        return;
      }
      const safeValue = truncateDecimals(fromAmount, fromToken.decimals);
      const parsedAmountIn = parseUnits(safeValue, fromToken.decimals);

      // 1. Check balance
      const balance = fromToken.balance;
      if (parseFloat(fromAmount || "0") > parseFloat(balance || "0")) {
        toast.error(t("swap.errors.insufficientBalance"));
        return;
      }

      // 2. Approve if not ETH
      if (fromToken.symbol !== "ETH") {
        const allowance: any = await publicClient.readContract({
          address: fromToken.address,
          abi: erc20ABI,
          functionName: "allowance",
          args: [userAddress, uniswapRouterAddress],
        });

        if (BigInt(allowance) < BigInt(parsedAmountIn)) {
          setApprove(true);
          const approveTx = await walletClient.writeContract({
            address: fromToken.address,
            abi: erc20ABI,
            functionName: "approve",
            args: [uniswapRouterAddress, MAX_APPROVE_AMOUNT],
          });

          await publicClient.waitForTransactionReceipt({
            hash: approveTx,
            confirmations: 1,
          });
          setApprove(false);
        }
      }

      // 3. Get quote
      const slippagePct = parseFloat(slippage) * 10000;
      const quoteRes = await supabase.functions.invoke("fetch-swap-quote", {
        body: JSON.stringify({
          sellToken: fromToken.address,
          buyToken: toToken.address,
          sellAmount: parsedAmountIn,
          taker: userAddress,
          slippage: slippagePct,
          chainId: 1,
        }),
      });

      const quote = quoteRes.data;
      if (!quote || !quote.transaction?.to || !quote.transaction?.data) {
        throw new Error(t("swap.errors.invalidQuote"));
      }

      // 4. Permit2 if applicable
      let signature: `0x${string}` | undefined;
      if (quote.permit2?.eip712) {
        try {
          signature = await walletClient.signTypedData(quote.permit2.eip712);
          console.log("✅ Permit2 signature generated");

          // Append signature and length to transaction data
          const sigLengthHex = numberToHex(size(signature), {
            signed: false,
            size: 32,
          });
          quote.transaction.data = concat([
            quote.transaction.data as `0x${string}`,
            sigLengthHex as `0x${string}`,
            signature,
          ]);
        } catch (err) {
          console.error("❌ Permit2 signature error", err);
          throw new Error(t("swap.errors.permit2Failed"));
        }
      }

      // 5. Send transaction
      const tx = {
        to: quote.transaction.to,
        data: quote.transaction.data,
        value: quote.transaction.value
          ? BigInt(quote.transaction.value)
          : undefined,
        gas: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
      };

      const ethBalance = await publicClient.getBalance({
        address: userAddress as `0x${string}`,
      });
      const gas = BigInt(quote.transaction.gas ?? "210000"); // fallback
      const gasPrice = await publicClient.getGasPrice();
      const estimatedFee = gas * gasPrice;
      const txValue = tx.value ?? 0n;

      if (ethBalance < txValue + estimatedFee) {
        toast.error(t("swap.errors.insufficientEth"));
        setLoading(false);
        return;
      }
      const txHash = await walletClient.sendTransaction(tx);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (receipt.status === "success") {
        toast.success(t("swap.success"));
        setFromAmount("");
        setToAmount("");
      } else {
        toast.error(t("swap.errors.failed"));
      }
    } catch (err: any) {
      console.error("Swap error:", err);
      toast.error(t("swap.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
  };

  function truncateDecimals(value: string, decimals: number): string {
    const [intPart, decPart = ""] = value.split(".");
    const truncatedDec = decPart.slice(0, decimals);
    return truncatedDec.length > 0 ? `${intPart}.${truncatedDec}` : intPart;
  }

  if (tokensLoading || !fromToken || !toToken) {
    return (
      <div className="max-w-xl mx-auto pt-10">
        <Card className="w-full p-6 h-[526px] flex flex-col items-center justify-center">
          <MoonLoader color={theme === "dark" ? "white" : "black"} />
          <div className="text-[rgb(var(--text))]">
            {t("swap.loadingTokens")}
          </div>
        </Card>
      </div>
    );
  }

  const fetchQuote = async (value: any) => {
    if (!fromToken || !toToken || !value) return;
    try {
      const sellAmount = parseUnits(value, fromToken.decimals).toString();

      const res = await supabase.functions.invoke("fetch-swap-price", {
        body: JSON.stringify({
          sellToken: fromToken.address,
          buyToken: toToken.address,
          sellAmount,
          chainId: 1,
        }),
      });

      const amount = formatUnits(res.data.buyAmount, toToken.decimals);
      setToAmount(amount);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFromAmountChange = async (value: any) => {
    setFromAmount(value);
    try {
      fetchQuote(value);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-8 pt-10">
      <Card className="w-full p-3 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t("swap.title")}</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg transition-colors"
            aria-label={t("swap.settings")}
          >
            <Settings size={20} className="text-neutral-400" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-6 p-4 bg-[rgb(var(--background-light))] rounded-lg">
            <h3 className="text-sm font-medium mb-3">
              {t("swap.slippageTolerance")}
            </h3>
            <div className="flex space-x-2 bg-[rgb(var(--background-light))]">
              {["0.1", "0.5", "1.0"].map((value, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    slippage === value
                      ? "bg-primary text-white"
                      : "text-neutral-500 hover:text-[rgb(var(--text))]"
                  }`}
                >
                  {value}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="input w-full pr-8 text-sm"
                  placeholder={t("swap.custom")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                  %
                </span>
              </div>
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
            {t("swap.from")}
          </label>
          <TokenSelect
            tokens={tokens}
            selectedToken={fromToken}
            onChange={setFromToken}
          />
          <div className="relative">
            <input
              type="number"
              className="input pr-20 w-full appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              {fromToken.symbol}
            </div>
          </div>
          <p className="text-sm text-[rgb(var(--text))] mt-1">
            {t("swap.balance")}: {fromToken.balance ? fromToken.balance : "0.0"}
            {" " + fromToken.symbol}
          </p>
        </div>

        <div className="flex justify-center my-4">
          <button
            onClick={switchTokens}
            className="p-2 rounded-full bg-[rgb(var(--background-light))] hover:bg-[rgb(var(--background))] transition-colors"
            aria-label={t("swap.switchTokens")}
          >
            <ArrowDownUp size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
            {t("swap.to")}
          </label>
          <TokenSelect
            tokens={tokens}
            selectedToken={toToken}
            onChange={setToToken}
          />
          <div className="relative">
            <input
              type="number"
              className="input pr-20 w-full"
              placeholder="0.0"
              value={toAmount}
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              {toToken.symbol}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          isLoading={loading}
          disabled={
            !fromAmount ||
            !toAmount ||
            loading ||
            toAmount === "NaN" ||
            isConfirming ||
            isPending
          }
          onClick={handleSwap}
        >
          {isConfirming || isPending
            ? t("swap.loading")
            : approve
            ? t("swap.approve")
            : t("swap.swap")}
        </Button>
      </Card>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Swap;
