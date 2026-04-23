const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    console.log('KEY ID:', process.env.RAZORPAY_KEY_ID);
    console.log('KEY SECRET EXISTS:', !!process.env.RAZORPAY_KEY_SECRET);
    console.log('REQ BODY:', req.body);

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `rcpt_${String(orderId || Date.now()).slice(-10)}`,
      notes: { orderId: String(orderId || '') }
    };

    console.log('RAZORPAY OPTIONS:', options);

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('RAZORPAY CREATE ORDER ERROR:', err?.error || err);
    res.status(500).json({
      message: 'Razorpay order creation failed',
      error: err?.error?.description || err.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

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

const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

const getPaymentMethods = (req, res) => {
  res.json({
    methods: ['upi', 'card', 'netbanking', 'wallet', 'emi'],
    upi_apps: ['gpay', 'phonepe', 'paytm', 'bhim'],
    test_upi: 'Use Razorpay test-mode UPI flow from the checkout popup or QR',
    test_card: '4111 1111 1111 1111',
    test_card_meta: {
      expiry: 'Any future date',
      cvv: 'Any 3 digits',
      otp: '1234'
    }
  });
};

module.exports = { createRazorpayOrder, verifyPayment, getRazorpayKey, getPaymentMethods };
