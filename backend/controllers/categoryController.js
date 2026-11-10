import categoryModel from '../models/categoryModel.js';
import foodModel from '../models/foodModel.js';
import { validateCategoryName } from '../utils/category.js';

const listCategories = async (_req, res) => {
  try {
    const legacyNames = await foodModel.distinct('category');
    const normalized = new Map();
    legacyNames.forEach((name) => {
      const cleanName = validateCategoryName(name);
      if (cleanName) normalized.set(cleanName.toLowerCase(), cleanName);
    });
    await Promise.all([...normalized].map(([key, name]) => categoryModel.updateOne(
      { key },
      { $setOnInsert: { name, key } },
      { upsert: true },
    )));
    const categories = await categoryModel.find({}).sort({ name: 1 }).select('_id name');
    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Unable to load categories:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load categories' });
  }
};

const createCategory = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const name = validateCategoryName(req.body?.name);
  if (!name) return res.status(400).json({ success: false, message: 'Use a 2–40 character category name with letters, numbers, spaces, ampersands, or hyphens' });
  const key = name.toLowerCase();
  try {
    if (await categoryModel.exists({ key })) return res.status(409).json({ success: false, message: 'That category already exists' });
    const category = await categoryModel.create({ name, key });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'That category already exists' });
    console.error('Unable to create category:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to create category' });
  }
};

const renameCategory = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const name = validateCategoryName(req.body?.name);
  if (!name) return res.status(400).json({ success: false, message: 'Use a 2–40 character category name with letters, numbers, spaces, ampersands, or hyphens' });
  const key = name.toLowerCase();
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (await categoryModel.exists({ key, _id: { $ne: category._id } })) return res.status(409).json({ success: false, message: 'That category already exists' });
    if (category.name !== name) await foodModel.updateMany({ category: category.name }, { $set: { category: name } });
    category.name = name;
    category.key = key;
    await category.save();
    return res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'That category already exists' });
    console.error('Unable to rename category:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to rename category' });
  }
};

const deleteCategory = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (await foodModel.exists({ category: category.name })) return res.status(409).json({ success: false, message: 'Move or remove menu items in this category before deleting it' });
    await categoryModel.findByIdAndDelete(category.id);
    return res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Unable to delete category:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to delete category' });
  }
};

export { listCategories, createCategory, renameCategory, deleteCategory };
