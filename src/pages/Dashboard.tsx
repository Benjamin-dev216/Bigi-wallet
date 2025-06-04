import React, { useEffect } from "react";
import BalanceCard from "../components/dashboard/BalanceCard";
import TokenList from "../components/dashboard/TokenList";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import PriceChart from "../components/dashboard/PriceChart";
import { useWalletStore } from "../store/walletStore";
import { PriceChartProvider } from "../context/PriceChartContext";

const Dashboard: React.FC = () => {
  const { refreshBalances } = useWalletStore();

  useEffect(() => {
    // Refresh balances when dashboard loads
    refreshBalances();

    // Set up interval to refresh balances every 30 seconds
    const interval = setInterval(() => {
      refreshBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshBalances]);

  return (
    <PriceChartProvider>
      <div className="space-y-6 pb-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Balance Card - Full width on mobile, 1/3 on XL */}
          <div className="xl:col-span-1">
            <BalanceCard />
          </div>

          {/* Price Chart - Full width on mobile, 2/3 on XL */}
          <div className="xl:col-span-2">
            <PriceChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token List */}
          <div>
            <TokenList />
          </div>

          {/* Recent Transactions */}
          <div>
            <RecentTransactions />
          </div>
        </div>
      </div>
    </PriceChartProvider>
  );
};

export default Dashboard;
