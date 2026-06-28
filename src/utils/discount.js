/**
 * Calculate the discount for paying online based on the base price.
 * 1-100: 1 rupee off
 * 101-200: 2 rupee off
 * 201-300: 3 rupee off
 * ...
 * 901-1000: 9 rupee off
 * beyond 1000: 10 rupee off
 * 
 * @param {number} price 
 * @returns {number} discount
 */
export const getOnlineDiscount = (price) => {
  const p = Number(price);
  if (isNaN(p) || p <= 0) return 0;
  if (p <= 100) return 1;
  if (p <= 200) return 2;
  if (p <= 300) return 3;
  if (p <= 400) return 4;
  if (p <= 500) return 5;
  if (p <= 600) return 6;
  if (p <= 700) return 7;
  if (p <= 800) return 8;
  if (p <= 900) return 9;
  if (p <= 1000) return 9;
  return 10;
};
