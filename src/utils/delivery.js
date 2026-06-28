/**
 * Calculates delivery charges based on distance from the shop.
 * Distance tiers:
 * - 0 to 3 km: ₹0
 * - 3 to 8 km: ₹20
 * - 8 to 15 km: ₹30
 * 
 * @param {number} distance 
 * @returns {number} delivery charge
 */
export const getDeliveryCharge = (distance) => {
  const dist = Number(distance);
  if (isNaN(dist) || dist <= 3) return 0;
  if (dist <= 8) return 20;
  if (dist <= 15) return 30;
  return 0;
};
