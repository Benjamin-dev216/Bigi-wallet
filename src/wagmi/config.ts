import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_SECRET}`
      ),
    },

    // Required API Keys
    walletConnectProjectId: "9c88f8f2f859e411c04ea61df8c008f2",

    // Required App Info
    appName: "bigiwallet",

    // Optional App Info
    appDescription: "A simple wallet for Ethereum & Bitcoin",
  })
);
