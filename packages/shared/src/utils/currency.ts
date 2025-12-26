export const formatPrice = (price: number, currency: string): string => {
  if (price === 0) {
    return "FREE";
  }

  const symbol =
    currencySymbols[currency as keyof typeof currencySymbols] || currency;

  return `${symbol}${price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  RSD: "дин",
};
