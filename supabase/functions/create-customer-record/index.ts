// @ts-nocheck
// This directive disables TypeScript checking for this file
// This is appropriate for Supabase Edge Functions since they run in the Deno environment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the user ID from the request
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // Check if a customer record already exists
    const { data: existingCustomer, error: checkError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single()
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw checkError
    }
    
    // If customer already exists, return it
    if (existingCustomer) {
      return new Response(
        JSON.stringify({ 
          message: 'Customer record already exists',
          customerId: existingCustomer.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // Get user details from auth.users
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId)
      
    if (userError || !userData?.user) {
      throw userError || new Error('User not found')
    }
    
    const user = userData.user
    
    // Create a new customer record
    const { data: newCustomer, error: insertError } = await supabaseAdmin
      .from('customers')
      .insert([
        {
          user_id: userId,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      
    if (insertError) {
      throw insertError
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Customer record created successfully',
        customerId: newCustomer[0].id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Error in create-customer-record function:', error)
    
    // Safely extract error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred'
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
