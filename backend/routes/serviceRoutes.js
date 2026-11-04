const express = require("express");
const Service = require("../models/Service");
const { protectAdmin } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/services
// @desc    Sabhi active services list karo (public - customer ke liye)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/services
// @desc    Naya service add karo (admin only)
router.post("/", protectAdmin, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: "Service create nahi ho paaya", error: error.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Service update karo (admin only)
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ message: "Service nahi mila" });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: "Service update nahi ho paaya", error: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Service delete karo (admin only)
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service nahi mila" });
    res.json({ message: "Service delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
