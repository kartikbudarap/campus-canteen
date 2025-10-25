import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader, AlertCircle } from 'lucide-react';

// FIX: Use import.meta.env for Vite instead of process.env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, orderData, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment service not ready');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('🚀 STEP 1: Creating payment intent...');
      
      // 1. Create payment intent
      const paymentResponse = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount, orderData })
      });

      const paymentData = await paymentResponse.json();
      console.log('💰 Payment intent response:', paymentData);
      
      if (!paymentData.success) {
        throw new Error(paymentData.error || 'Failed to create payment');
      }

      console.log('🚀 STEP 2: Getting card element...');
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('🚀 STEP 3: Confirming payment...');
      
      // 2. Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      console.log('📊 Stripe response:', { stripeError, paymentIntent });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ STEP 4: Payment succeeded, creating order...');
        
        // 3. Create order
        const confirmResponse = await fetch('http://localhost:5000/api/payment/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderData: orderData
          })
        });

        const confirmData = await confirmResponse.json();
        console.log('📦 Order creation response:', confirmData);
        
        if (confirmData.success) {
          onSuccess(confirmData.data);
        } else {
          throw new Error(confirmData.error || 'Order creation failed');
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }

    } catch (err) {
      console.error('💥 Payment error:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-red-500">₹{amount}</span>
            </div>
          </div>

          {/* Test Card Info */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
            <div className="text-sm text-yellow-800">
              <div className="font-mono font-bold">4242 4242 4242 4242</div>
              <div className="text-xs mt-1">Any future date | Any CVC | Any ZIP</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <div className="border border-gray-300 rounded-xl p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || processing}
              className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ₹{amount}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const StripePayment = ({ isOpen, onClose, amount, orderData, onSuccess }) => {
  if (!isOpen) return null;
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} orderData={orderData} onSuccess={onSuccess} onClose={onClose} />
    </Elements>
  );
};

export default StripePayment;