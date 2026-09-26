function readNonNegativeNumber(value: string | undefined, fallback: number, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= maximum ? parsed : fallback;
}

export const storeConfig = {
  taxRate: readNonNegativeNumber(process.env.NEXT_PUBLIC_STORE_TAX_RATE, 0.18, 1),
  freeShippingThreshold: readNonNegativeNumber(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD, 10000),
  standardShippingFee: readNonNegativeNumber(process.env.NEXT_PUBLIC_STANDARD_SHIPPING_FEE, 399),
};

export function taxLabel() {
  return (storeConfig.taxRate * 100).toLocaleString("en-IN") + "%";
}
