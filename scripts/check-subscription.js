require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkSubscription() {
  try {
    const subscription = await stripe.subscriptions.retrieve('sub_1SjW0GC9FUAUE2vPEmJ3EWM6');

    console.log('\n=== Subscription Status ===');
    console.log('ID:', subscription.id);
    console.log('Status:', subscription.status);
    console.log('Current Period End:', new Date(subscription.current_period_end * 1000));
    console.log('Customer:', subscription.customer);

    if (subscription.latest_invoice) {
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
      console.log('\n=== Latest Invoice ===');
      console.log('Invoice ID:', invoice.id);
      console.log('Status:', invoice.status);
      console.log('Amount Paid:', invoice.amount_paid);
      console.log('Payment Intent:', invoice.payment_intent);

      if (invoice.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
        console.log('\n=== Payment Intent ===');
        console.log('Status:', paymentIntent.status);
        console.log('Amount:', paymentIntent.amount);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSubscription();
