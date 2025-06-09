import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WalletState, Token, Transaction, Currency } from "../types/wallet";
import { mockTokens, mockTransactions } from "../utils/mockData";

interface WalletStore extends WalletState {
  unlockWallet: (password: string) => void;
  lockWallet: () => void;
  selectToken: (tokenId: string | null) => void;
  sortTokens: (key: "name" | "balance" | "value") => void;
  setCurrency: (currency: Currency) => void;
  sendTransaction: (
    transaction: Omit<Transaction, "id" | "timestamp" | "status">
  ) => void;
  refreshBalances: () => void;
  setWalletTokens: (tokens: Token[]) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      walletTokens: mockTokens,
      currency: "USD",
      transactions: mockTransactions,
      totalBalance: mockTokens.reduce(
        (sum, token) => sum + token.balance * token.price,
        0
      ),
      address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      isUnlocked: true, // Start unlocked for demo
      selectedToken: "",

      unlockWallet: (password: string) => {
        console.log(`Unlocking wallet with password: ${password}`);
        set({ isUnlocked: true });
      },

      lockWallet: () => {
        set({ isUnlocked: false });
      },

      selectToken: (tokenId: string | null) => {
        set({ selectedToken: tokenId });
      },

      sortTokens: (key: "name" | "balance" | "value") => {
        const sortedTokens = [...get().walletTokens];

        switch (key) {
          case "name":
            sortedTokens.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "balance":
            sortedTokens.sort((a, b) => b.balance - a.balance);
            break;
          case "value":
            sortedTokens.sort(
              (a, b) => b.balance * b.price - a.balance * a.price
            );
            break;
        }

        set({ walletTokens: sortedTokens });
      },

      setCurrency: (currency: Currency) => {
        set({ currency });
      },

      sendTransaction: (transaction) => {
        const newTransaction: Transaction = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          status: "pending",
          ...transaction,
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        // Simulate confirmation
        setTimeout(() => {
          const updatedTokens = get().walletTokens.map((token) =>
            token.symbol === transaction.token
              ? {
                  ...token,
                  balance:
                    token.balance -
                    (transaction.type === "send"
                      ? transaction.amount
                      : -transaction.amount),
                }
              : token
          );

          const updatedTransactions = get().transactions.map((tx) =>
            tx.id === newTransaction.id
              ? { ...tx, status: "completed" as "completed" }
              : tx
          );

          const totalBalance = updatedTokens.reduce(
            (sum, token) => sum + token.balance * token.price,
            0
          );

          set({
            transactions: updatedTransactions,
            walletTokens: updatedTokens,
            totalBalance,
          });
        }, 2000);
      },

      refreshBalances: () => {
        const updatedTokens = get().walletTokens.map((token) => ({
          ...token,
          price: token.price * (1 + (Math.random() * 0.06 - 0.03)), // ±3%
        }));

        const totalBalance = updatedTokens.reduce(
          (sum, token) => sum + token.balance * token.price,
          0
        );

        set({ walletTokens: updatedTokens, totalBalance });
      },

      setWalletTokens: (tokens: Token[]) => {
        set({ walletTokens: tokens });
      },
    }),
    {
      name: "wallet-storage", // key in localStorage
      partialize: (state) => ({
        walletTokens: state.walletTokens,
        currency: state.currency,
        transactions: state.transactions,
        totalBalance: state.totalBalance,
        address: state.address,
        isUnlocked: state.isUnlocked,
        selectedToken: state.selectedToken,
      }),
    }
  )
);
