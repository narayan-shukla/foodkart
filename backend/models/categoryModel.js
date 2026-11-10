import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
}, { timestamps: true });

export default mongoose.models.category || mongoose.model('category', categorySchema);
