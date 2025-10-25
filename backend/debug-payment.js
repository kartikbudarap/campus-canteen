require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkPayment() {
  try {
    // List recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 5,
    });
    
    console.log('🔍 Recent Payment Intents:');
    paymentIntents.data.forEach((pi, index) => {
      console.log(`${index + 1}. ID: ${pi.id}`);
      console.log(`   Status: ${pi.status}`);
      console.log(`   Amount: ${pi.amount}`);
      console.log(`   Created: ${new Date(pi.created * 1000).toLocaleString()}`);
      console.log(`   Last Payment Error: ${pi.last_payment_error?.message || 'None'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPayment();