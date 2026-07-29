const FoodItem = require('../models/FoodItem');

const MINIMUM_ORDER_PAISE = 5000;

const priceOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Order must contain at least one item');
  const normalized = items.map((item) => {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new Error('Each item quantity must be an integer between 1 and 50');
    }
    return { id: item.foodItemId || item.foodItem || item.id || item._id, quantity };
  });
  if (normalized.some((item) => !item.id)) throw new Error('Every order item must include a food item ID');

  const ids = [...new Set(normalized.map((item) => String(item.id)))];
  const foodItems = await FoodItem.find({ _id: { $in: ids } });
  const byId = new Map(foodItems.map((item) => [String(item._id), item]));
  const pricedItems = normalized.map(({ id, quantity }) => {
    const foodItem = byId.get(String(id));
    if (!foodItem) throw new Error(`Food item ${id} not found`);
    if (!foodItem.isAvailable) throw new Error(`${foodItem.name} is not available`);
    return { foodItem: foodItem._id, name: foodItem.name, price: foodItem.price, quantity };
  });
  const totalPaise = pricedItems.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  if (totalPaise < MINIMUM_ORDER_PAISE) throw new Error('Minimum order amount is ₹50');
  return { items: pricedItems, totalPaise, total: totalPaise / 100 };
};

module.exports = { MINIMUM_ORDER_PAISE, priceOrderItems };
