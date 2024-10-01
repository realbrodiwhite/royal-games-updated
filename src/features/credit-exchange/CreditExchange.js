import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './CreditExchange.scss';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY); // Replace public key

const CreditExchange = ({ onClose }) => {
  const [amount, setAmount] = useState(0);
  const [exchangeType, setExchangeType] = useState('buy'); // 'buy' or 'sell'
  const stripe = useStripe();
  const elements = useElements();

  const handleExchange = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('Error creating payment method:', error);
      alert('Payment failed');
      return;
    }

    axios.post('/api/credit-exchange', { amount, exchangeType, paymentMethodId: paymentMethod.id })
      .then(response => {
        alert('Exchange successful');
        onClose(); // Close the modal after successful exchange
      })
      .catch(error => {
        console.error('Error during exchange:', error.message, error.stack);
        alert('Exchange failed');
      });
  };

  return (
    <div className="CreditExchangeModal">
      <div className="modal-content">
        <button className="close" onClick={onClose}>&times;</button>
        <h2>Credit Exchange</h2>
        <div className="exchange-form">
          <select value={exchangeType} onChange={(e) => setExchangeType(e.target.value)}>
            <option value="buy">Buy Credits</option>
            <option value="sell">Sell Credits</option>
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <form onSubmit={handleExchange}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Exchange</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreditExchangeWrapper = (props) => (
  <Elements stripe={stripePromise}>
    <CreditExchange {...props} />
  </Elements>
);

export default CreditExchangeWrapper;