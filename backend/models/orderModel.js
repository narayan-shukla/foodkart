import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true, min: 0 },
  address: { type: Object, required: true },
  status: { type: String, enum: ["Payment pending", "Food Processing", "Out for delivery", "Delivered", "Cancelled"], default: "Payment pending" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  stripeSessionId: { type: String },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
