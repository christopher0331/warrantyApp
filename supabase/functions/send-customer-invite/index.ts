// @ts-nocheck
// This directive disables TypeScript checking for this file
// This is appropriate for Supabase Edge Functions since they run in the Deno environment
// which has different typings than standard TypeScript

// @ts-ignore: Deno-specific imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create a Supabase client with the service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://axnahynnegmmowmqlbjz.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { email, firstName, lastName } = await req.json()
    
    if (!email || !firstName || !lastName) {
      throw new Error('Email, firstName, and lastName are required')
    }

    // Create a signup link that will redirect through our auth handler
    const origin = req.headers.get('origin') || 'https://customers.greenviewsolutions.net'
    const { data, error: signUpError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        user_type: 'customer'
      }
    })

    if (signUpError) {
      throw signUpError
    }

    // Store the invitation in the customer_invites table
    const { error: dbError } = await supabaseClient
      .from('customer_invites')
      .insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'pending',
          // Store the user ID if available
          user_id: data?.user?.id
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        user: data?.user ? { id: data.user.id, email: data.user.email } : null
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
