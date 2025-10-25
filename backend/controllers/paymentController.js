const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentController = {
  // Create Stripe Payment Intent - SIMPLE VERSION
  createPaymentIntent: async (req, res) => {
    try {
      const { amount, orderData } = req.body;
      
      console.log('💰 Creating payment intent for amount:', amount);
      
      if (!amount || amount < 50) {
        return res.status(400).json({
          success: false,
          error: 'Minimum order amount is ₹50'
        });
      }

      // SIMPLE: Create basic payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'inr',
        payment_method_types: ['card'],
        // Remove all advanced options that might cause issues
      });

      console.log('✅ Payment intent created successfully:', paymentIntent.id);
      console.log('🔑 Client secret:', paymentIntent.client_secret);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('❌ Stripe error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Payment service error: ' + error.message 
      });
    }
  },

  // Verify and Create Order
  confirmPayment: async (req, res) => {
    try {
      const { paymentIntentId, orderData } = req.body;

      console.log('✅ Verifying payment intent:', paymentIntentId);

      // Verify the payment intent exists
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      console.log('📊 Payment Intent Status:', paymentIntent.status);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          error: `Payment not completed. Status: ${paymentIntent.status}`
        });
      }

      // Create order
      const order = new Order({
        user: req.user._id,
        items: orderData.items,
        total: orderData.total,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        specialInstructions: orderData.specialInstructions,
        payment: {
          stripe_payment_intent_id: paymentIntentId,
          status: 'completed',
          amount: orderData.total,
          payment_method: 'card'
        },
        status: 'pending'
      });

      await order.save();
      await order.populate('items.foodItem');

      console.log('✅ Order created successfully:', order._id);

      res.json({
        success: true,
        message: 'Order created successfully!',
        data: order
      });
    } catch (error) {
      console.error('❌ Order creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Order creation failed: ' + error.message 
      });
    }
  },

  // Check payment service status
  getPaymentStatus: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          service: 'Stripe',
          configured: !!process.env.STRIPE_SECRET_KEY,
          mode: 'test'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check payment status'
      });
    }
  }
};

module.exports = paymentController;