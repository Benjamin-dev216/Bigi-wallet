import React, { useEffect, useRef, useState } from "react";
import Card from "../ui/Card";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  formatDateTime,
  formatCrypto,
  formatAddress,
} from "../../utils/formatters";
import { fetchTransactions } from "../../utils/fetchTransactions";
import { NormalizedTransaction } from "../../types/wallet"; // adjust import path
import { useAuthStore } from "../../store/authStore";
import { useTranslation } from "react-i18next";

const RecentTransactions: React.FC = () => {
  const { wallets } = useAuthStore();
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const navigate = useNavigate();
  const hasLoaded = useRef(false); // to prevent double fetch

  const { t } = useTranslation();

  useEffect(() => {
    if (
      !wallets?.ethereum?.address ||
      !wallets?.bitcoin?.address ||
      hasLoaded.current
    )
      return;

    hasLoaded.current = true;

    const fetchData = async () => {
      try {
        const txs = await fetchTransactions(
          wallets.ethereum.address,
          5,
          0,
          wallets.bitcoin.address,
          5,
          0
        );
        setTransactions(txs.transactions.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };
    fetchData();
  }, [wallets?.ethereum?.address, wallets?.bitcoin?.address]);

  const formatAmount = (amount: string, symbol: string, chain: string) => {
    const parsed = parseFloat(amount);
    if (chain === "ethereum-mainnet") return formatCrypto(parsed, symbol);
    if (chain === "bitcoin-mainnet") return formatCrypto(parsed / 1e8, "BTC");
    return parsed;
  };

  return (
    <Card variant="glass" className="w-full animate-slide-up min-h-[285px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{t("recentTransactions.title")}</h2>
        <button
          onClick={() => navigate("/transactions")}
          className="text-primary hover:text-primary-light text-sm"
        >
          {t("recentTransactions.viewAll")}
        </button>
      </div>

      {transactions.length > 0 ? (
        // Scrollable container with max height
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {transactions.map((tx, idx) => {
            const isReceive = tx.transactionSubtype === "incoming";
            const token = tx.chain === "ethereum-mainnet" ? "ETH" : "BTC";

            return (
              <div key={idx} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      isReceive ? "bg-success/20" : "bg-error/20"
                    }`}
                  >
                    {isReceive ? (
                      <ArrowDownRight size={20} className="text-success" />
                    ) : (
                      <ArrowUpRight size={20} className="text-error" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-[rgb(var(--text))]">
                      {isReceive
                        ? t("recentTransactions.sent")
                        : t("recentTransactions.received")}{" "}
                      {token}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDateTime(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      isReceive ? "text-success" : "text-error"
                    }`}
                  >
                    {isReceive ? "+" : ""}{" "}
                    {formatAmount(tx.amount, tx.symbol, tx.chain)}
                  </p>
                  <p className="flex items-center text-xs text-neutral-400 float-right">
                    {formatAddress(tx.counterAddress)}
                    {tx.hash && (
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:text-primary-light"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-neutral-400">
          No transactions yet
        </div>
      )}
    </Card>
  );
};

export default RecentTransactions;
