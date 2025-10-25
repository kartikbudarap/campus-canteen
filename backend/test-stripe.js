
require('dotenv').config(); // load .env variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


async function testStripe() {
  try {
    console.log('🧪 Testing Stripe connection...');
    
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

    console.log('✅ Stripe test successful!');
    console.log('💰 Payment Intent ID:', paymentIntent.id);
    console.log('💳 Client Secret:', paymentIntent.client_secret);
    console.log('💵 Amount:', (testAmount / 100).toFixed(2), 'INR');
    
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
  }
}

testStripe();