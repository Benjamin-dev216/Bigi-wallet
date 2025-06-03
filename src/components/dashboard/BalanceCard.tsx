import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Send, QrCode, CreditCard } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/formatters";
import ActionButton from "../common/ActionButton";
import { useNavigate } from "react-router-dom";
import BuyCryptoModal from "../common/BuyCryptoModal";
import { usePriceChart } from "../../context/PriceChartContext";
import { useSettingsStore } from "../../store/settingsStore";

const BalanceCard: React.FC = () => {
  const navigate = useNavigate();
  const { totalBalance } = usePriceChart();
  const [isBalanceHidden, setIsBalanceHidden] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleClick = (action: "send" | "receive" | "buy") => {
    if (action === "buy") {
      setShowBuyModal(true);
    } else {
      navigate(`/send-receive/${action}`);
    }
  };

  return (
    <>
      <Card variant="glass" className="w-full animate-fade-in px-2 sm:px-6">
        <Header
          isBalanceHidden={isBalanceHidden}
          isRefreshing={isRefreshing}
          onToggleBalance={() => setIsBalanceHidden(!isBalanceHidden)}
          onRefresh={handleRefresh}
        />

        <div className="flex flex-col">
          <BalanceDisplay
            totalBalance={totalBalance}
            isHidden={isBalanceHidden}
          />
          <ActionButtons onClick={handleClick} />
        </div>
      </Card>

      {showBuyModal && (
        <BuyCryptoModal onClose={() => setShowBuyModal(false)} />
      )}
    </>
  );
};

export default BalanceCard;

const Header: React.FC<{
  isBalanceHidden: boolean;
  isRefreshing: boolean;
  onToggleBalance: () => void;
  onRefresh: () => void;
}> = ({ isBalanceHidden, onToggleBalance }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium text-[rgb(var(--text))]">
        {t("balanceCard.balance.totalBalance")}
      </h2>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleBalance}
          aria-label={
            isBalanceHidden
              ? t("balanceCard.balance.showBalance")
              : t("balanceCard.balance.hideBalance")
          }
        >
          {isBalanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
        </Button>
      </div>
    </div>
  );
};

const BalanceDisplay: React.FC<{
  totalBalance: number;
  isHidden: boolean;
}> = ({ totalBalance, isHidden }) => {
  const { t } = useTranslation();
  const { currency } = useSettingsStore();

  return (
    <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
      {isHidden
        ? t("balanceCard.balance.hiddenBalance")
        : formatCurrency(totalBalance, currency)}
    </h1>
  );
};

const ActionButtons: React.FC<{
  onClick: (type: "send" | "receive" | "buy") => void;
}> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div className="flex space-x-2 mt-4">
      <ActionButton
        icon={Send}
        label={t("balanceCard.actions.send")}
        onClick={() => onClick("send")}
      />
      <ActionButton
        icon={QrCode}
        label={t("balanceCard.actions.receive")}
        onClick={() => onClick("receive")}
      />
      <ActionButton
        icon={CreditCard}
        label={t("balanceCard.actions.buy")}
        primary
        onClick={() => onClick("buy")}
      />
    </div>
  );
};
