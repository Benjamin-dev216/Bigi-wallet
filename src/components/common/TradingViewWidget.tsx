import { useEffect, useRef } from "react";
import { useSettingsStore } from "../../store/settingsStore";

const TradingViewWidget = ({ symbol = "BTCUSD" }: { symbol?: string }) => {
  const { theme } = useSettingsStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      new TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}`,
        interval: "60",
        timezone: "Etc/UTC",
        theme: theme,
        style: 3, // Area chart
        locale: "en",
        toolbar_bg: "#1e293b",
        enable_publishing: false,
        hide_top_toolbar: false,
        container_id: "tradingview-chart",
        transparent: false, // important
        overrides: {
          "paneProperties.background": "#1e293b",
          "paneProperties.vertGridProperties.color": "#334155",
          "paneProperties.horzGridProperties.color": "#334155",
          "scalesProperties.textColor": "#94a3b8",
          "mainSeriesProperties.style": 3,
        },
        loading_screen: {
          backgroundColor: "#1e293b",
          foregroundColor: "#64748b",
        },
      });
    };

    containerRef.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div
      id="tradingview-chart"
      ref={containerRef}
      style={{ height: 400, backgroundColor: "#1e293b" }}
    />
  );
};

export default TradingViewWidget;
