const test = require('node:test');
const assert = require('node:assert/strict');
const FoodItem = require('../models/FoodItem');
const { priceOrderItems } = require('../utils/orderPricing');

test('calculates the authoritative total from database prices', async (t) => {
  const originalFind = FoodItem.find;
  t.after(() => { FoodItem.find = originalFind; });
  FoodItem.find = async () => [
    { _id: 'item-1', name: 'Samosa', price: 25, isAvailable: true },
    { _id: 'item-2', name: 'Tea', price: 15, isAvailable: true }
  ];

  const result = await priceOrderItems([
    { foodItem: 'item-1', quantity: 2 },
    { foodItem: 'item-2', quantity: 1 }
  ]);

  assert.equal(result.totalPaise, 6500);
  assert.equal(result.total, 65);
  assert.deepEqual(result.items.map(({ price, quantity }) => ({ price, quantity })), [
    { price: 25, quantity: 2 },
    { price: 15, quantity: 1 }
  ]);
});

test('rejects invalid quantities', async () => {
  await assert.rejects(
    priceOrderItems([{ foodItem: 'item-1', quantity: 0 }]),
    /quantity must be an integer/
  );
});

test('rejects unavailable items', async (t) => {
  const originalFind = FoodItem.find;
  t.after(() => { FoodItem.find = originalFind; });
  FoodItem.find = async () => [
    { _id: 'item-1', name: 'Samosa', price: 50, isAvailable: false }
  ];
  await assert.rejects(
    priceOrderItems([{ foodItem: 'item-1', quantity: 1 }]),
    /not available/
  );
});
