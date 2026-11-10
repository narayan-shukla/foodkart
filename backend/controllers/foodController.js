import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food items

const addFood = async (req, res) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  if (!req.file) return res.status(400).json({ success: false, message: "A PNG, JPEG, or WebP image is required" });
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';
  const price = Number(req.body.price);
  if (!name || !description || !category || !Number.isFinite(price) || price <= 0) return res.status(400).json({ success: false, message: "Valid item details are required" });
  const image_filename = req.file.filename;
  const food = new foodModel({
    name,
    description,
    price,
    category,
    image: image_filename,
  });
  try {
    if (req.user.role === "admin") {
      await food.save();
      res.json({ success: true, message: "Food Added" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


const updateFood = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';
  const price = Number(req.body.price);
  if (!name || !description || !category || !Number.isFinite(price) || price <= 0) return res.status(400).json({ success: false, message: 'Valid item details are required' });
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
    const oldImage = food.image;
    food.name = name.trim();
    food.description = description.trim();
    food.category = category.trim();
    food.price = price;
    if (req.file) food.image = req.file.filename;
    await food.save();
    if (req.file && oldImage) fs.unlink(`uploads/${oldImage}`, () => {});
    return res.json({ success: true, message: 'Food updated', data: food });
  } catch (error) {
    if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
    console.error(error.message);
    return res.status(400).json({ success: false, message: 'Unable to update food item' });
  }
};

// all foods
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      if (!food) return res.status(404).json({ success: false, message: "Food item not found" });
      fs.unlink(`uploads/${food.image}`, () => {});
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Food Removed" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, listFood, removeFood, updateFood };
