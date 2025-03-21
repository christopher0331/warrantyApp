// Follow Supabase Edge Function conventions
import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing customer invite request');
    
    // Create a Supabase client with the service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://axnahynnegmmowmqlbjz.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    const { email, firstName, lastName } = requestData;
    
    if (!email || !firstName || !lastName) {
      throw new Error('Email, firstName, and lastName are required')
    }

    // Check if a customer with this email already exists
    const { data: existingCustomer, error: lookupError } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();
      
    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking for existing customer:', lookupError);
      throw lookupError;
    }
    
    if (existingCustomer) {
      console.log('Customer already exists in database:', existingCustomer.email);
      
      // Check if this customer already has an auth account
      const { data: authUser, error: _authError } = await supabaseClient.auth.admin.listUsers();
      
      const existingAuthUser = authUser?.users?.find(user => user.email === email);
      
      if (existingAuthUser) {
        console.log('User already exists in auth system:', existingAuthUser.email);
        return new Response(
          JSON.stringify({ 
            message: 'Customer already has an account',
            customer: { id: existingCustomer.id, email: existingCustomer.email },
            auth_user: { id: existingAuthUser.id, email: existingAuthUser.email }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      }
      
      // Customer exists in database but not in auth system, send invitation
      console.log('Customer exists in database but not in auth system. Sending invitation...');
    }

    // Get the site URL for redirection
    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'https://customers.greenviewsolutions.net';
    console.log('Using redirect origin:', origin);
    
    // Create a signup link that will redirect through our auth handler
    console.log('Sending invitation email to:', email);
    const { data, error: signUpError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'customer'
      }
    })

    if (signUpError) {
      console.error('Error sending invitation:', signUpError);
      throw signUpError;
    }
    
    console.log('Invitation sent successfully, auth response:', data);

    // Store the invitation in the customer_invites table
    const { error: dbError } = await supabaseClient
      .from('customer_invites')
      .insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'pending',
          // Store the auth_id instead of user_id
          auth_id: data?.user?.id
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }
    
    // Get the action link if available
    const actionLink = data && 'properties' in data ? 
      (data.properties as { action_link?: string }).action_link : null;
    
    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        user: data?.user ? { 
          id: data.user.id, 
          email: data.user.email 
        } : null,
        inviteUrl: actionLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-customer-invite function:', error)
    
    // Safely extract error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred'
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
