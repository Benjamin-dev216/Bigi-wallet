// Format number as currency
export const formatCurrency = (value: number, currency = "USD", digits = 2) => {
  const currencyMap = {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
  };

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyMap[currency as keyof typeof currencyMap],
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

// Format crypto amount
export const formatCrypto = (
  amount: number,
  symbol: string,
  decimals: number = amount < 0.01 ? 8 : 4
) => {
  const formattedAmount = amount
    .toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .replace(/\.?0+$/, ""); // remove trailing zeros

  const shortSymbol = symbol?.startsWith("0x")
    ? `${symbol.slice(0, 6)}...${symbol.slice(-4)}`
    : symbol ?? "ETH";

  return `${formattedAmount} ${shortSymbol}`;
};

// Abbreviate large numbers
export const abbreviateNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toString();
};

// Format wallet address to show only first and last few characters
export const formatAddress = (address: string, start = 4, end = 4): string => {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.substring(0, start)}...${address.substring(
    address.length - end
  )}`;
};

// Format date

// Format time
// Format time as "10:18 AM"
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Format date as "May 19, 2025"
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Combine date and time as "May 19, 2025 at 10:18 AM"
export const formatDateTime = (timestamp: number) => {
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate1 = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};
