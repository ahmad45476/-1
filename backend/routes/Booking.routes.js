const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const bookingController = require("../controllers/Booking.controller");

// Middleware للتحقق من صحة ObjectId
const validateObjectId = (req, res, next) => {
  const id = req.params.ticketId || req.params.eventId;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'معرف غير صالح' });
  }
  next();
};

// المسارات المحددة
router.get("/my-bookings", authenticate, bookingController.getMyBookings);
router.get("/verify/:ticketId", authenticate, validateObjectId, bookingController.verifyTicket);
router.put("/checkin/:ticketId", authenticate, validateObjectId, bookingController.checkinTicket);
router.get("/event-stats/:eventId", authenticate, validateObjectId, bookingController.getEventStats);

// مسار الحجز
router.post("/:eventId", authenticate, validateObjectId, bookingController.bookEvent);

// ✅ المسار العام - مع التحقق من الصحة
router.get("/:ticketId", validateObjectId, bookingController.getBookingById);

module.exports = router;