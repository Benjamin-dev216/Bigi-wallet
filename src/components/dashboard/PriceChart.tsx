import React, { useState } from "react";
import Card from "../ui/Card";
import TradingViewWidget from "../common/TradingViewWidget";
import { useTranslation } from "react-i18next";
const tokens = [
  { id: "1", label: "Bitcoin (BTC)", slug: "bitcoin", symbol: "BTCUSDT" },
  { id: "1027", label: "Ethereum (ETH)", slug: "ethereum", symbol: "ETHUSDT" },
];

const PriceChart: React.FC = () => {
  const [selectedTokenId, setSelectedTokenId] = useState("1");
  const selectedToken = tokens.find((t) => t.id === selectedTokenId)!;
  const { t } = useTranslation();

  return (
    <Card
      variant="glass"
      className="w-full h-[350px] sm:h-[500px] p-4 md:px-4 px-1 animate-slide-up"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{t("priceChart.title")}</h2>
        <select
          className="input py-1 text-sm"
          value={selectedTokenId}
          onChange={(e) => setSelectedTokenId(e.target.value)}
        >
          {tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 text-right">
        <a
          href={`https://coinmarketcap.com/currencies/${selectedToken.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          {t("priceChart.viewOn")}
        </a>
      </div>

      <div>
        <TradingViewWidget symbol={selectedToken.symbol} />
      </div>
    </Card>
  );
};

export default PriceChart;
