import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food items

const addFood = async (req, res) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  if (!req.file) return res.status(400).json({ success: false, message: "A PNG, JPEG, or WebP image is required" });
  const price = Number(req.body.price);
  if (!req.body.name?.trim() || !req.body.description?.trim() || !req.body.category?.trim() || !Number.isFinite(price) || price <= 0) return res.status(400).json({ success: false, message: "Valid item details are required" });
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price,
    category: req.body.category,
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

export { addFood, listFood, removeFood };
