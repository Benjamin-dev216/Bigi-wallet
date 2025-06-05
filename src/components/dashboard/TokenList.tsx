// components/wallet/TokenList.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Token } from "../../types/wallet";
import Card from "../ui/Card";
import { fetchUserTokens } from "../../utils/fetchUserTokens";
import { formatCurrency, formatCrypto } from "../../utils/formatters";
import { usePriceChart } from "../../context/PriceChartContext";
import { useWalletStore } from "../../store/walletStore";
import TokenIcon from "../ui/TokenIcon";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../store/settingsStore";

type SortBy = "name" | "quantity" | "value";
type SortOrder = "asc" | "desc";

const TokenList: React.FC = () => {
  const { wallets } = useAuthStore();
  const { setTotalBalance } = usePriceChart();
  const { setWalletTokens } = useWalletStore();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("value");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [loading, setLoading] = useState(false);
  const hasLoaded = useRef(false); // to prevent double fetch

  const { t } = useTranslation();
  const { currency } = useSettingsStore();

  useEffect(() => {
    if (
      !wallets?.ethereum?.address ||
      !wallets?.bitcoin?.address ||
      hasLoaded.current
    )
      return;

    hasLoaded.current = true;

    const load = async () => {
      setLoading(true);
      try {
        const fetched = await fetchUserTokens(
          wallets.ethereum.address,
          wallets.bitcoin.address,
          currency
        );

        const requiredTokens: Token[] = [
          {
            id: "eth",
            symbol: "ETH",
            name: "Ethereum",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "weth",
            symbol: "WETH",
            name: "Wrapped Ether",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "btc",
            symbol: "BTC",
            name: "Bitcoin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "usdt",
            symbol: "USDT",
            name: "Tether USD",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "usdc",
            symbol: "USDC",
            name: "USD Coin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "bnb",
            symbol: "BNB",
            name: "Binance Coin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "sol",
            symbol: "SOL",
            name: "Solana",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "xrp",
            symbol: "XRP",
            name: "XRP",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "ada",
            symbol: "ADA",
            name: "Cardano",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "doge",
            symbol: "DOGE",
            name: "Dogecoin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "ton",
            symbol: "TON",
            name: "Toncoin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "avax",
            symbol: "AVAX",
            name: "Avalanche",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "shib",
            symbol: "SHIB",
            name: "Shiba Inu",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "dot",
            symbol: "DOT",
            name: "Polkadot",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "trx",
            symbol: "TRX",
            name: "TRON",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "link",
            symbol: "LINK",
            name: "Chainlink",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "matic",
            symbol: "MATIC",
            name: "Polygon",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "uni",
            symbol: "UNI",
            name: "Uniswap",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "ltc",
            symbol: "LTC",
            name: "Litecoin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "bch",
            symbol: "BCH",
            name: "Bitcoin Cash",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "leo",
            symbol: "LEO",
            name: "UNUS SED LEO",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "atom",
            symbol: "ATOM",
            name: "Cosmos",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "cro",
            symbol: "CRO",
            name: "Cronos",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "near",
            symbol: "NEAR",
            name: "NEAR Protocol",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "xmr",
            symbol: "XMR",
            name: "Monero",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "okb",
            symbol: "OKB",
            name: "OKB",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "etc",
            symbol: "ETC",
            name: "Ethereum Classic",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "fil",
            symbol: "FIL",
            name: "Filecoin",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "steth",
            symbol: "stETH",
            name: "Lido Staked Ether",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "egld",
            symbol: "EGLD",
            name: "MultiversX",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "apt",
            symbol: "APT",
            name: "Aptos",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "arb",
            symbol: "ARB",
            name: "Arbitrum",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "sui",
            symbol: "SUI",
            name: "Sui",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "qnt",
            symbol: "QNT",
            name: "Quant",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "hnt",
            symbol: "HNT",
            name: "Helium",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "ftm",
            symbol: "FTM",
            name: "Fantom",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "gala",
            symbol: "GALA",
            name: "Gala",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "sand",
            symbol: "SAND",
            name: "The Sandbox",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "mana",
            symbol: "MANA",
            name: "Decentraland",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "axs",
            symbol: "AXS",
            name: "Axie Infinity",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "aave",
            symbol: "AAVE",
            name: "Aave",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "rune",
            symbol: "RUNE",
            name: "THORChain",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "xch",
            symbol: "XCH",
            name: "Chia",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "cake",
            symbol: "CAKE",
            name: "PancakeSwap",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "lunc",
            symbol: "LUNC",
            name: "Terra Classic",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "osmo",
            symbol: "OSMO",
            name: "Osmosis",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "zrx",
            symbol: "ZRX",
            name: "0x Protocol",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "yfi",
            symbol: "YFI",
            name: "yearn.finance",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "ens",
            symbol: "ENS",
            name: "Ethereum Name Service",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
          {
            id: "usds",
            symbol: "USDS",
            name: "USDS",
            logo: "",
            balance: 0,
            price: 0,
            priceChange24h: 0,
          },
        ];

        const existingSymbols = new Set(
          fetched.tokens.map((token) => token.symbol.toUpperCase())
        );

        const missingTokens = requiredTokens.filter(
          (token) => !existingSymbols.has(token.symbol.toUpperCase())
        );

        const finalTokens: Token[] = [...fetched.tokens, ...missingTokens];

        setTokens(finalTokens);
        setWalletTokens(finalTokens);
        setTotalBalance(fetched.totalValue);
      } catch (err) {
        console.error("Token fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [wallets?.ethereum?.address, wallets?.bitcoin?.address]);

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredTokens = tokens
    .filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let compare = 0;
      if (sortBy === "name") {
        compare = a.name.localeCompare(b.name);
      } else if (sortBy === "quantity") {
        compare = a.balance - b.balance;
      } else if (sortBy === "value") {
        compare = a.balance * a.price - b.balance * b.price;
      }
      return sortOrder === "asc" ? compare : -compare;
    });

  return (
    <Card className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{t("assets.title")}</h2>
        <input
          type="text"
          className="input py-1 px-3 text-sm"
          placeholder={t("assets.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Scrollable wrapper */}
      <div className="max-h-[190px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[rgb(var(--background-medium))] sticky top-0 text-[rgb(var(--text))] z-10">
            <tr>
              <th
                className="cursor-pointer px-3 py-2"
                onClick={() => handleSort("name")}
                aria-label={t("assets.sortByName")}
              >
                {t("assets.name")}{" "}
                {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right"
                onClick={() => handleSort("quantity")}
                aria-label={t("assets.sortByBalance")}
              >
                {t("assets.balance")}{" "}
                {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right"
                onClick={() => handleSort("value")}
                aria-label={t("assets.sortByValue")}
              >
                {t("assets.value", { currency })}{" "}
                {sortBy === "value" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-neutral-400">
                  {t("assets.loading")}
                </td>
              </tr>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[rgb(var(--background-medium))] cursor-pointer transition-all duration-200"
                >
                  <td className="px-3 py-3 flex items-center space-x-3">
                    <TokenIcon
                      symbol={token.symbol}
                      logo={token.logo}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-[rgb(var(--text))]">
                        {token.symbol}
                      </p>
                      <p className="text-xs text-neutral-400">{token.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-[rgb(var(--text))]">
                    {formatCrypto(token.balance, token.symbol)}
                  </td>
                  <td className="px-3 py-3 text-right text-[rgb(var(--text))]">
                    {formatCurrency(token.balance * token.price, currency)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-neutral-400">
                  {t("assets.noAssetsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TokenList;
