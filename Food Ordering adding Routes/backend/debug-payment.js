require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkPayment() {
  try {
    // List recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 5,
    });
    
    paymentIntents.data.forEach((pi, index) => {
    });
    
  } catch (error) {
  }
}

checkPayment();