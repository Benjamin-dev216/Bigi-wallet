import React, { useEffect, useRef, useState } from "react";
import Card from "../ui/Card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  formatDateTime,
  formatCrypto,
  formatAddress,
} from "../../utils/formatters";
import { fetchTransactions } from "../../utils/fetchTransactions";
import { NormalizedTransaction } from "../../types/wallet"; // adjust import path
import { useAuthStore } from "../../store/authStore";

const RecentTransactions: React.FC = () => {
  const { wallets } = useAuthStore();
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const navigate = useNavigate();
  const hasLoaded = useRef(false); // to prevent double fetch

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
    <Card className="w-full animate-slide-up min-h-[285px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Recent Transactions</h2>
        <button
          onClick={() => navigate("/transactions")}
          className="text-primary hover:text-primary-light text-sm"
        >
          View All
        </button>
      </div>

      {transactions.length > 0 ? (
        // Scrollable container with max height
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {transactions.map((tx) => {
            const isReceive = tx.transactionSubtype === "incoming";
            const token = tx.chain === "ethereum-mainnet" ? "ETH" : "BTC";

            return (
              <div
                key={tx.hash}
                className="flex items-center justify-between py-2"
              >
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
                    <p className="font-medium">
                      {isReceive ? "Received" : "Sent"} {token}
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
                  <p className="text-xs text-neutral-400">
                    {formatAddress(tx.counterAddress)}
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
