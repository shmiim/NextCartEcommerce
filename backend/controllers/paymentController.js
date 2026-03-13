const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${(orderId || Date.now()).toString().slice(-10)}`,
      notes: { orderId: orderId || '' },
      // ✅ Explicitly enable UPI and all payment methods
      payment: {
        capture: 'automatic',
        capture_options: {
          automatic_expiry_period: 12,
          manual_expiry_period: 7200,
          refund_speed: 'normal'
        }
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay error:', err);
    res.status(500).json({ message: 'Razorpay order creation failed', error: err.message });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // HMAC SHA256 signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });

    // Update order as paid in DB
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'Processing';
        order.paymentResult = {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'paid'
        };
        await order.save();
      }
    }

    res.json({ success: true, message: 'Payment verified & order updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payment/key
const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// GET /api/payment/methods - return enabled methods info
const getPaymentMethods = (req, res) => {
  res.json({
    methods: ['upi', 'card', 'netbanking', 'wallet', 'emi'],
    upi_apps: ['gpay', 'phonepe', 'paytm', 'bhim'],
    test_upi: 'success@razorpay',
    test_card: '4111 1111 1111 1111'
  });
};

module.exports = { createRazorpayOrder, verifyPayment, getRazorpayKey, getPaymentMethods };
