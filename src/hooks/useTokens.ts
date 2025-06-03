import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export const useTokens = () => {
  const { wallets } = useAuthStore();
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokenList = async () => {
    const res = await fetch("https://ipfs.io/ipns/tokens.uniswap.org");
    const data = await res.json();

    return data.tokens; // Array of tokens with { address, symbol, name, decimals, chainId, logoURI }
  };

  useEffect(() => {
    const load = async () => {
      if (!wallets?.ethereum.address) return;

      setIsLoading(true);
      try {
        const tokens = await fetchTokenList();

        // Filter out tokens missing essential fields
        const filtered = tokens.filter(
          (token: any) =>
            token.name && token.symbol && token.address && token.chainId === 1
        );
        const ethToken = {
          name: "Ethereum",
          symbol: "ETH",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
          decimals: 18,
          balance: "",
          logoURI: "/eth-logo.png", // Optional
          isNative: true,
        };
        const withEth = [ethToken, ...filtered];

        setTokens(withEth);
      } catch (err) {
        console.error("Failed to fetch tokens:", err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [wallets?.ethereum.address]);

  return { tokens, isLoading };
};
