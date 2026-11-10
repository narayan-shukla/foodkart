export function calculateCartSubtotal(cartItems, foodList) {
  return Object.entries(cartItems).reduce((total, [id, quantity]) => {
    const food = foodList.find((item) => item._id === id);
    const count = Number(quantity);
    return food && Number.isInteger(count) && count > 0 ? total + Number(food.price) * count : total;
  }, 0);
}
