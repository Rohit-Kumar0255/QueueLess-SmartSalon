const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    stylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stylist",
      required: true,
    },
    // Stored as "YYYY-MM-DD"
    date: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    // Stored as "HH:MM" (24hr, start time of slot)
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ek stylist ek hi date+time par double-book na ho, isliye compound index
appointmentSchema.index({ stylist: 1, date: 1, timeSlot: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
