import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import foodModel from '../models/foodModel.js';
import Stripe from 'stripe';

const getStripe = () => process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const placeOrder = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ success: false, message: 'Online payments are not configured' });
    const requested = req.body.items;
    if (!Array.isArray(requested) || requested.length === 0 || requested.length > 50) return res.status(400).json({ success: false, message: 'Cart is empty or invalid' });
    const ids = [...new Set(requested.map((item) => String(item.id || item._id || '')))];
    const foods = await foodModel.find({ _id: { $in: ids } });
    const byId = new Map(foods.map((food) => [food.id, food]));
    const items = requested.map((item) => {
      const food = byId.get(String(item.id || item._id));
      const quantity = Number(item.quantity);
      if (!food || !Number.isInteger(quantity) || quantity < 1 || quantity > 25) throw new Error('Cart contains an invalid item or quantity');
      return { _id: food.id, name: food.name, price: food.price, quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal === 0 ? 0 : 2;
    const amount = subtotal + delivery;
    const address = req.body.address;
    if (!address || typeof address !== 'object' || !address.street || !address.city || !(address.zip || address.zipcode)) return res.status(400).json({ success: false, message: 'Complete delivery address required' });
    const order = await orderModel.create({ userId: req.user.id, items, amount, address, payment: false, status: 'Payment pending' });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', client_reference_id: order.id, metadata: { orderId: order.id, userId: req.user.id },
      line_items: [...items.map((item) => ({ price_data: { currency: process.env.CURRENCY || 'usd', product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) }, quantity: item.quantity })), ...(delivery ? [{ price_data: { currency: process.env.CURRENCY || 'usd', product_data: { name: 'Delivery Charges' }, unit_amount: delivery * 100 }, quantity: 1 }] : [])],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
    });
    order.stripeSessionId = session.id;
    await order.save();
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to create order' });
  }
};
const verifyOrder = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ success: false, message: 'Payments are not configured' });
    const sessionId = req.body.sessionId;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Payment session required' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await orderModel.findOne({ _id: session.metadata?.orderId, userId: req.user.id, stripeSessionId: session.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (session.payment_status !== 'paid' || session.amount_total !== Math.round(order.amount * 100)) return res.status(402).json({ success: false, message: 'Payment is not complete' });
    order.payment = true;
    order.status = 'Food Processing';
    await order.save();
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });
    res.json({ success: true, message: 'Paid' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to verify payment' });
  }
};
const userOrders = async (req, res) => {
  const orders = await orderModel.find({ userId: req.user.id }).sort({ date: -1 });
  res.json({ success: true, data: orders });
};
const listOrders = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  res.json({ success: true, data: await orderModel.find({}).sort({ date: -1 }) });
};
const updateStatus = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const allowed = ['Food Processing', 'Out for delivery', 'Delivered', 'Cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid order status' });
  const order = await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, message: 'Status updated' });
};
export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
