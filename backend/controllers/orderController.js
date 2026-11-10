import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import foodModel from '../models/foodModel.js';
import Stripe from 'stripe';
import { buildTrustedOrderItems, calculateOrderTotal } from '../utils/orderPricing.js';

const getStripe = () => process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const placeOrder = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ success: false, message: 'Online payments are not configured' });
    const requested = req.body.items;
    if (!Array.isArray(requested)) return res.status(400).json({ success: false, message: 'Cart is empty or invalid' });
    const ids = [...new Set(requested.map((item) => String(item.id || item._id || '')))];
    const foods = await foodModel.find({ _id: { $in: ids } });
    const items = buildTrustedOrderItems(requested, foods);
    const { delivery, amount } = calculateOrderTotal(items, Number(process.env.DELIVERY_CHARGE || 2));
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
    if (!order.payment) {
      const settledOrder = await orderModel.findOneAndUpdate(
        { _id: order.id, userId: req.user.id, payment: false },
        { $set: { payment: true, status: 'Food Processing' } },
        { new: true },
      );
      if (settledOrder) await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });
    }
    res.json({ success: true, message: 'Paid' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to verify payment' });
  }
};

const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Webhook is not configured');
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Invalid webhook signature: ${error.message}`);
  }
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid' && session.metadata?.orderId) {
        const orderInfo = await orderModel.findOne({ _id: session.metadata.orderId, userId: session.metadata.userId, stripeSessionId: session.id });
        if (orderInfo && session.amount_total === Math.round(orderInfo.amount * 100)) {
          const order = await orderModel.findOneAndUpdate(
            { _id: orderInfo.id, payment: false },
            { $set: { payment: true, status: 'Food Processing' } },
            { new: true },
          );
          if (order) await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
        }
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error.message);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
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
const adminStats = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  try {
    const [foodCount, orderCount, paidOrderCount, pendingCount, revenueRows] = await Promise.all([
      foodModel.countDocuments(),
      orderModel.countDocuments(),
      orderModel.countDocuments({ payment: true }),
      orderModel.countDocuments({ payment: true, status: { $in: ['Food Processing', 'Out for delivery'] } }),
      orderModel.aggregate([{ $match: { payment: true } }, { $group: { _id: null, revenue: { $sum: '$amount' } } }]),
    ]);
    res.json({ success: true, data: { foodCount, orderCount, paidOrderCount, pendingCount, revenue: revenueRows[0]?.revenue || 0 } });
  } catch (error) {
    console.error('Unable to calculate admin statistics:', error.message);
    res.status(500).json({ success: false, message: 'Unable to load dashboard statistics' });
  }
};
const updateStatus = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const allowed = ['Food Processing', 'Out for delivery', 'Delivered', 'Cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid order status' });
  const currentOrder = await orderModel.findById(req.body.orderId);
  if (!currentOrder) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!currentOrder.payment) return res.status(409).json({ success: false, message: 'Unpaid orders cannot be processed' });
  const order = await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status }, { new: true });
  res.json({ success: true, message: 'Status updated' });
};
export { placeOrder, verifyOrder, stripeWebhook, userOrders, listOrders, updateStatus, adminStats };
