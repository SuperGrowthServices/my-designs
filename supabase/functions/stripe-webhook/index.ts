import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    );
  } catch (err) {
    console.error(err);
    return new Response(err.message, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        throw new Error('Missing order_id in Stripe session metadata');
      }
      
      console.log(`Processing successful payment for order ${orderId}`);

      // 1. Update the order status to 'ready_for_pickup'
      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'ready_for_pickup', is_paid: true })
        .eq('id', orderId);

      if (orderError) throw orderError;
      
      // 2. Update the associated invoice
      const { error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .update({ 
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent,
        })
        .eq('order_id', orderId);
        
      if (invoiceError) throw invoiceError;

      // 3. Update shipping status for all parts in the order
      const { error: partsError } = await supabaseAdmin
        .from('parts')
        .update({ shipping_status: 'pending_pickup' })
        .eq('order_id', orderId);

      if (partsError) throw partsError;
      
      console.log(`Order ${orderId} successfully updated.`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}); 