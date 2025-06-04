import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  ExternalLink,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { fetchTransactions } from "../utils/fetchTransactions";
import { NormalizedTransaction } from "../types/wallet";
import { useInView } from "react-intersection-observer";
import {
  formatDateTime,
  formatCrypto,
  formatAddress,
} from "../utils/formatters";
import { useAuthStore } from "../store/authStore";
import Spinner from "../components/common/Spinner";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "react-i18next";

const formatAmount = (amount: string, symbol: string, chain: string) => {
  const parsed = parseFloat(amount);
  if (chain === "ethereum-mainnet")
    return formatCrypto(parsed, symbol ?? "ETH");
  if (chain === "bitcoin-mainnet") return formatCrypto(parsed / 1e8, "BTC");
  return parsed;
};

const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const { wallets } = useAuthStore();
  const { theme } = useSettingsStore();

  const PAGE_SIZE = 20;
  const [ethOffset, setEthOffset] = useState(0);
  const [btcOffset, setBtcOffset] = useState(0);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [filter, setFilter] = useState<
    "all" | "send" | "receive" | "zero-transfer"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  const { ref, inView } = useInView({ threshold: 0 });

  const loadTransactions = useCallback(async () => {
    if (!wallets?.ethereum?.address || !wallets?.bitcoin?.address) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const ethAddress = wallets.ethereum.address;
    const btcAddress = wallets.bitcoin.address;

    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const { transactions: newTxs } = await fetchTransactions(
        ethAddress,
        PAGE_SIZE,
        ethOffset,
        btcAddress,
        PAGE_SIZE,
        btcOffset
      );

      const sortedNewTxs = newTxs.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions((prev) => [...prev, ...sortedNewTxs]);
      setEthOffset((prev) => prev + PAGE_SIZE);
      setBtcOffset((prev) => prev + PAGE_SIZE);
      if (newTxs.length < PAGE_SIZE * 2) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [ethOffset, btcOffset, isLoading, hasMore]);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (inView) loadTransactions();
  }, [inView]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType =
      filter === "all" ||
      (filter === "send" && tx.transactionSubtype === "outgoing") ||
      (filter === "receive" && tx.transactionSubtype === "incoming") ||
      (filter === "zero-transfer" && tx.transactionSubtype === "zero-transfer");

    const matchesSearch =
      tx.tokenAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tokenName?.toLowerCase().includes(searchQuery.toLowerCase());

    const txDate = new Date(tx.timestamp);
    const matchesDate =
      (!dateRange.from || txDate >= dateRange.from) &&
      (!dateRange.to || txDate <= dateRange.to);

    return matchesType && matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 pb-8">
      <Card className="md:p-6 p-2">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t("transactions.title")}</h2>
          <div className="flex flex-col md:flex-wrap lg:flex-row lg:items-center gap-3 md:w-4/6 w-full">
            {/* Search */}
            <div className="relative w-full md:max-w-md lg:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder={t("transactions.searchPlaceholder")}
                className="input py-2 pl-9 pr-3 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date Picker */}
            <div className="relative w-full md:max-w-sm lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setShowCalendar((prev) => !prev)}
              >
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "MMM d")} → ${format(
                      dateRange.to,
                      "MMM d"
                    )}`
                  : t("transactions.filterByDate")}
              </Button>

              {showCalendar && (
                <div className="absolute z-50 mt-2 w-full sm:w-[340px] text-[rgb(var(--text))] bg-[rgb(var(--background-light))] border border-neutral-700 rounded-xl shadow-lg p-4">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range as any)}
                    defaultMonth={dateRange.from}
                    footer={
                      <div className="flex justify-between mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDateRange({ from: undefined, to: undefined });
                            setShowCalendar(false);
                          }}
                        >
                          {t("common.clear")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowCalendar(false)}
                        >
                          {t("common.done")}
                        </Button>
                      </div>
                    }
                    styles={{
                      caption: { color: theme === "dark" ? "black" : "white" },
                      day_selected: {
                        backgroundColor: "#3b82f6",
                        color: theme === "dark" ? "black" : "white",
                      },
                      day_range_middle: {
                        backgroundColor: "#2563eb",
                        color: theme === "dark" ? "black" : "white",
                      },
                      day: { margin: "0.2rem" },
                    }}
                  />
                </div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:max-w-full lg:w-auto">
              {["all", "send", "receive", "zero-transfer"].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "primary" : "outline"}
                  size="sm"
                  className="w-full capitalize"
                  onClick={() => setFilter(type as any)}
                >
                  {type === "zero-transfer"
                    ? t("transactions.swap")
                    : t(`transactions.${type}`)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner size={24} />
          </div>
        )}
        {!isLoading && filteredTransactions.length > 0 ? (
          <div className="space-y-1 animate-fade-in">
            {filteredTransactions.map((tx, idx) => {
              const isReceive = tx.transactionSubtype === "incoming";
              const icon =
                tx.transactionSubtype === "zero-transfer" ? (
                  <Repeat size={20} className="text-warning" />
                ) : isReceive ? (
                  <ArrowDownRight size={20} className="text-success" />
                ) : (
                  <ArrowUpRight size={20} className="text-error" />
                );

              const amount = formatAmount(tx.amount, tx.symbol, tx.chain);

              return (
                <div
                  key={tx.hash + idx}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg transition-all duration-200 border border-transparent hover:border-neutral-700"
                >
                  <div className="flex items-center mb-2 md:mb-0">
                    <div
                      className={`p-2 rounded-full ${
                        tx.transactionSubtype === "zero-transfer"
                          ? "bg-warning/20"
                          : isReceive
                          ? "bg-success/20"
                          : "bg-error/20"
                      }`}
                    >
                      {icon}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <p className="font-medium text-[rgb(var(--text))]">
                          {tx.transactionSubtype === "zero-transfer"
                            ? t("transactions.swap")
                            : isReceive
                            ? t("transactions.received")
                            : t("transactions.sent")}{" "}
                          {tx.tokenAddress
                            ? formatAddress(tx.tokenAddress, 4, 4)
                            : "ETH"}
                        </p>

                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            tx.status === "confirmed"
                              ? "bg-success/20 text-success"
                              : tx.status === "pending"
                              ? "bg-warning/20 text-warning"
                              : "bg-error/20 text-error"
                          }`}
                        >
                          {t(`transactions.status.${tx.status}`)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {formatDateTime(tx.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p
                      className={`font-medium ${
                        isReceive ? "text-success" : "text-error"
                      }`}
                    >
                      {isReceive ? "+" : ""} {amount}
                    </p>
                    <div className="flex items-center text-xs text-neutral-400 float-right">
                      <span>{formatAddress(tx.counterAddress, 6, 6)}</span>
                      {tx.hash && (
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:text-primary-light"
                          aria-label={t("transactions.viewOnExplorer")}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={ref} />
          </div>
        ) : !isLoading ? (
          <div className="text-center py-10 text-neutral-400 animate-fade-in">
            <p className="text-lg">{t("transactions.noTransactions")}</p>
            <p className="text-sm mt-1">{t("transactions.adjustFilters")}</p>
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-400 animate-fade-in">
            <p className="text-lg">{t("transactions.loading")}</p>
            <p className="text-sm mt-1">{t("transactions.pleaseWait")}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;
