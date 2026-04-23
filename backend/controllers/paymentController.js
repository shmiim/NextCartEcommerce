const crypto = require('crypto');
const https = require('https');
const Order = require('../models/Order');

const getRazorpayCredentials = () => ({
  keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
  keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim()
});

const createRazorpayOrderRequest = async (options, keyId, keySecret) => new Promise((resolve, reject) => {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const body = JSON.stringify(options);

  const req = https.request(
    'https://api.razorpay.com/v1/orders',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    },
    (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          // Keep `data` null; we'll still surface status + raw body.
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const message = data?.error?.description || raw || 'Razorpay order creation failed';
          const error = new Error(message);
          error.statusCode = res.statusCode;
          error.error = data?.error;
          return reject(error);
        }

        return resolve(data);
      });
    }
  );

  req.on('error', (e) => reject(e));
  req.write(body);
  req.end();
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const numericAmount = Number(amount);
    const { keyId, keySecret } = getRazorpayCredentials();

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (!keyId || !keySecret) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured' });
    }

    console.log('KEY ID:', keyId);
    console.log('KEY SECRET EXISTS:', !!keySecret);
    console.log('REQ BODY:', req.body);

    const options = {
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${String(orderId || Date.now()).slice(-10)}`,
      notes: { orderId: String(orderId || '') }
    };

    console.log('RAZORPAY OPTIONS:', options);

    const razorpayOrder = await createRazorpayOrderRequest(options, keyId, keySecret);

    res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });
  } catch (err) {
    console.error('RAZORPAY CREATE ORDER ERROR:', err?.error || err.message || err);
    res.status(err.statusCode || 500).json({
      message: 'Razorpay order creation failed',
      error: err?.error?.description || err.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const { keySecret } = getRazorpayCredentials();

    if (!keySecret) {
      return res.status(500).json({ success: false, message: 'Razorpay credentials are not configured' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
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
  const { keyId } = getRazorpayCredentials();
  res.json({ key: keyId });
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
