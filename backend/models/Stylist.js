const mongoose = require("mongoose");

const stylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Stylist name is required"],
      trim: true,
    },
    specialty: {
      type: String,
      default: "Hair Stylist",
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: "",
    },
    // Working hours in 24hr "HH:MM" format
    workStart: {
      type: String,
      default: "10:00",
    },
    workEnd: {
      type: String,
      default: "19:00",
    },
    // 0 = Sunday ... 6 = Saturday. Days stylist is OFF.
    weeklyOff: {
      type: [Number],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stylist", stylistSchema);
