const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  success_url: `${Deno.env.get('SITE_URL')}/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${Deno.env.get('SITE_URL')}/checkout`,
  customer_email: user.email,
  client_reference_id: order_id,
  metadata: {
    order_id: order_id,
  },
});

return new Response( 