const express = require("express");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const Stylist = require("../models/Stylist");
const { protectAdmin } = require("../middleware/auth");

const router = express.Router();

// ---------- Helper functions (time maths) ----------
const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// @route   GET /api/appointments/availability
// @desc    Given stylist + date + service -> return list of time slots with availability
// @query   stylistId, serviceId, date (YYYY-MM-DD)
router.get("/availability", async (req, res) => {
  try {
    const { stylistId, serviceId, date } = req.query;
    if (!stylistId || !serviceId || !date) {
      return res.status(400).json({ message: "stylistId, serviceId aur date zaroori hain" });
    }

    const stylist = await Stylist.findById(stylistId);
    const service = await Service.findById(serviceId);
    if (!stylist || !service) {
      return res.status(404).json({ message: "Stylist ya service nahi mila" });
    }

    // Check weekly off day
    const dayOfWeek = new Date(date + "T00:00:00").getDay();
    if (stylist.weeklyOff.includes(dayOfWeek)) {
      return res.json({ slots: [], message: "Stylist is off on this day" });
    }

    const duration = service.durationMinutes;
    const stepMinutes = 30; // slot grid step
    const startMin = timeToMinutes(stylist.workStart);
    const endMin = timeToMinutes(stylist.workEnd);

    // Existing bookings for this stylist on this date (excluding cancelled)
    const existing = await Appointment.find({
      stylist: stylistId,
      date,
      status: { $ne: "cancelled" },
    }).populate("service", "durationMinutes");

    const occupiedRanges = existing.map((appt) => {
      const s = timeToMinutes(appt.timeSlot);
      const d = appt.service ? appt.service.durationMinutes : 30;
      return [s, s + d];
    });

    const now = new Date();
    const isToday = date === now.toISOString().slice(0, 10);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slots = [];
    for (let t = startMin; t + duration <= endMin; t += stepMinutes) {
      const slotEnd = t + duration;
      const overlaps = occupiedRanges.some(([s, e]) => t < e && slotEnd > s);
      const isPast = isToday && t <= nowMinutes;
      slots.push({
        time: minutesToTime(t),
        available: !overlaps && !isPast,
      });
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Naya appointment book karo (public)
router.post("/", async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, service, stylist, date, timeSlot, notes } =
      req.body;

    if (!customerName || !customerPhone || !service || !stylist || !date || !timeSlot) {
      return res.status(400).json({ message: "Sabhi required fields bharein" });
    }

    // Double-booking se bachne ke liye final safety check
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) return res.status(404).json({ message: "Service nahi mila" });

    const duration = serviceDoc.durationMinutes;
    const newStart = timeToMinutes(timeSlot);
    const newEnd = newStart + duration;

    const existing = await Appointment.find({
      stylist,
      date,
      status: { $ne: "cancelled" },
    }).populate("service", "durationMinutes");

    const clash = existing.some((appt) => {
      const s = timeToMinutes(appt.timeSlot);
      const d = appt.service ? appt.service.durationMinutes : 30;
      return newStart < s + d && newEnd > s;
    });

    if (clash) {
      return res.status(409).json({ message: "Ye slot abhi-abhi book ho gaya. Kripya doosra slot chunein." });
    }

    const appointment = await Appointment.create({
      customerName,
      customerPhone,
      customerEmail,
      service,
      stylist,
      date,
      timeSlot,
      notes,
      status: "pending",
    });

    const populated = await appointment.populate([
      { path: "service", select: "name price durationMinutes" },
      { path: "stylist", select: "name specialty" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: "Appointment book nahi ho paaya", error: error.message });
  }
});

// @route   GET /api/appointments/lookup
// @desc    Customer apni booking dekhe phone number se (public)
router.get("/lookup", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: "Phone number zaroori hai" });

    const appointments = await Appointment.find({ customerPhone: phone })
      .populate("service", "name price durationMinutes")
      .populate("stylist", "name specialty")
      .sort({ date: -1, timeSlot: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Customer khud apni booking cancel kare (phone verify karke)
router.put("/:id/cancel", async (req, res) => {
  try {
    const { phone } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment nahi mila" });

    if (phone && appointment.customerPhone !== phone) {
      return res.status(403).json({ message: "Phone number match nahi hua" });
    }

    appointment.status = "cancelled";
    await appointment.save();
    res.json({ message: "Appointment cancel ho gaya", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ---------- Admin only routes ----------

// @route   GET /api/appointments
// @desc    Sabhi appointments dekho, optional filters (admin only)
router.get("/", protectAdmin, async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("service", "name price durationMinutes")
      .populate("stylist", "name specialty")
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Appointment ka status update karo (admin only)
router.put("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("service", "name price durationMinutes")
      .populate("stylist", "name specialty");

    if (!appointment) return res.status(404).json({ message: "Appointment nahi mila" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Appointment permanently delete karo (admin only)
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment nahi mila" });
    res.json({ message: "Appointment delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
