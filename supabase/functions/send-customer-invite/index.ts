import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, firstName, lastName } = await req.json()

    // Create a signup link that will redirect to the customer dashboard
    const { data: { user }, error: signUpError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${req.headers.get('origin')}/customer-dashboard`,
    })

    if (signUpError) {
      throw signUpError
    }

    // Send a welcome email using Supabase's email service
    const { error: emailError } = await supabaseClient
      .from('customer_invites')
      .insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'pending'
        }
      ])

    if (emailError) {
      throw emailError
    }

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
