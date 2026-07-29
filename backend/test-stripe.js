
require('dotenv').config(); // load .env variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


async function testStripe() {
  try {
    // Test with minimum amount for INR (₹50 = ~$0.60 USD)
    const testAmount = 5000; // ₹50.00 in paise
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: testAmount,
      currency: 'inr',
      payment_method_types: ['card'],
      metadata: {
        test: 'true'
      }
    });
    
  } catch (error) {
  }
}

testStripe();