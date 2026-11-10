export function buildTrustedOrderItems(requested, foods) {
  if (!Array.isArray(requested) || requested.length === 0 || requested.length > 50) {
    throw new Error('Cart is empty or invalid');
  }
  const byId = new Map(foods.map((food) => [String(food._id), food]));
  return requested.map((item) => {
    const food = byId.get(String(item.id || item._id || ''));
    const quantity = Number(item.quantity);
    if (!food || !Number.isInteger(quantity) || quantity < 1 || quantity > 25) {
      throw new Error('Cart contains an invalid item or quantity');
    }
    return { _id: String(food._id), name: food.name, price: Number(food.price), quantity };
  });
}

export function calculateOrderTotal(items, deliveryCharge = 2) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? deliveryCharge : 0;
  return { subtotal, delivery, amount: subtotal + delivery };
}
