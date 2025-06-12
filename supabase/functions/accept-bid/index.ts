// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`🚀 Function 'accept-bid' up and running!`);

// Define the expected request body structure
interface RequestBody {
  bid_id: string;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bid_id }: RequestBody = await req.json();
    console.log(`Processing request for bid_id: ${bid_id}`);

    if (!bid_id) {
      throw new Error("Missing 'bid_id' in request body.");
    }

    // Create a Supabase client with the service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Fetch the winning bid to get its part_id
    const { data: winningBid, error: fetchError } = await supabaseAdmin
      .from('bids')
      .select('part_id, status')
      .eq('id', bid_id)
      .single();

    if (fetchError) {
      console.error(`Error fetching winning bid:`, fetchError);
      throw new Error(`Could not fetch bid with ID: ${bid_id}. ${fetchError.message}`);
    }
    console.log('Found winning bid:', winningBid);

    if (winningBid.status === 'accepted') {
      return new Response(
        JSON.stringify({ message: 'This bid has already been accepted.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const { part_id } = winningBid;

    // Step 2: Update the winning bid's status to 'accepted'
    const { error: acceptError } = await supabaseAdmin
      .from('bids')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', bid_id);

    if (acceptError) {
      console.error('Error accepting winning bid:', acceptError);
      throw new Error(`Failed to accept bid. ${acceptError.message}`);
    }
    console.log(`Successfully accepted bid ${bid_id}`);

    // Step 3: Update all other pending bids for the same part_id to 'rejected'
    const { error: rejectError } = await supabaseAdmin
      .from('bids')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('part_id', part_id)
      .neq('id', bid_id)
      .eq('status', 'pending');

    if (rejectError) {
      // This is a non-critical error. The main action succeeded.
      // We log it for observability but don't fail the entire function.
      console.error(`Warning: Failed to reject other bids for part ${part_id}.`, rejectError);
    } else {
      console.log(`Successfully rejected other pending bids for part ${part_id}`);
    }

    return new Response(
      JSON.stringify({ message: `Successfully accepted bid ${bid_id} and processed other bids.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/accept-bid' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
