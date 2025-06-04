import { Token } from "../types/wallet";
import { supabase } from "../store/authStore";

export async function fetchUserTokens(
  ethAddress: string,
  btcAddress: string,
  currency: string
): Promise<{ tokens: Token[]; totalValue: number }> {
  try {
    const { data } = await supabase.functions.invoke("quick-handler", {
      body: JSON.stringify({ ethAddress, btcAddress, currency }),
    });

    const btcToken = {
      id: btcAddress,
      name: "Bitcoin",
      symbol: "BTC",
      logo: data.btcToken.logo,
      balance: Number(data.btcToken.incoming) - Number(data.btcToken.outgoing),
      price: data.btcToken.priceUSD,
      priceChange24h: 0,
    };

    const ethTokenList = data.enrichedTokens || [];

    const erc20Tokens: Token[] = ethTokenList
      .filter((t: any) => t.tokenBalance !== "0x0")
      .map((t: any) => {
        const balance = Number(t.balance);
        const price = Number(t.priceUSD);

        return {
          id: t.tokenAddress ?? "",
          name: t.name || "Unknown",
          symbol: t.symbol || "",
          logo: t.logo || "",
          balance,
          price,
          priceChange24h: 0,
        };
      });

    const tokens = [...erc20Tokens, btcToken];
    const totalValue = tokens.reduce((sum, t) => sum + t.balance * t.price, 0);

    return { tokens, totalValue };
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    throw new Error("Failed to fetch user tokens");
  }
}
