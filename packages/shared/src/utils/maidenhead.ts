// Validate Maidenhead grid locator
export const isValidMaidenhead = (locator: string): boolean => {
  return /^[A-R]{2}[0-9]{2}[A-X]{2}$/i.test(locator);
};

// Convert Maidenhead to lat/lng (approximate center of grid square)
export const maidenheadToLatLng = (
  locator: string
): { lat: number; lng: number } | null => {
  if (!isValidMaidenhead(locator)) return null;

  const upper = locator.toUpperCase();

  const lng =
    (upper.charCodeAt(0) - 65) * 20 -
    180 +
    parseInt(upper[2]) * 2 +
    (upper.charCodeAt(4) - 65) * (2 / 24) +
    1 / 24;

  const lat =
    (upper.charCodeAt(1) - 65) * 10 -
    90 +
    parseInt(upper[3]) +
    (upper.charCodeAt(5) - 65) * (1 / 24) +
    1 / 48;

  return { lat, lng };
};
