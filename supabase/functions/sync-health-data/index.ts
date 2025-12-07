import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REWARD_THRESHOLD = 10000; // 10,000 steps
const REWARD_AMOUNT = 2.50;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const { steps, date, sleep_hours, heart_rate_avg } = await req.json();
    const metricDate = date || new Date().toISOString().split('T')[0];

    console.log('Received health data:', { steps, date: metricDate, sleep_hours, heart_rate_avg });

    // Upsert daily metrics (insert or update if exists for that date)
    const { error: metricsError } = await supabase
      .from('daily_metrics')
      .upsert({
        user_id: user.id,
        date: metricDate,
        steps_count: steps,
        sleep_hours: sleep_hours || null,
        heart_rate_avg: heart_rate_avg || null,
      }, { onConflict: 'user_id,date' });

    if (metricsError) {
      console.error('Error inserting metrics:', metricsError);
      return new Response(
        JSON.stringify({ error: 'Failed to save metrics', details: metricsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Metrics saved successfully');

    let rewardGranted = false;
    let rewardAmount = 0;

    // Check if steps qualify for reward
    if (steps >= REWARD_THRESHOLD) {
      console.log('Steps qualify for reward:', steps, '>=', REWARD_THRESHOLD);
      
      // Check if reward already granted for this date
      const { data: existingReward } = await supabase
        .from('rewards_ledger')
        .select('id')
        .eq('user_id', user.id)
        .eq('reason', `Steps goal reached on ${metricDate}`)
        .maybeSingle();

      if (!existingReward) {
        // Insert reward
        const { error: rewardError } = await supabase
          .from('rewards_ledger')
          .insert({
            user_id: user.id,
            amount: REWARD_AMOUNT,
            reason: `Steps goal reached on ${metricDate}`,
          });

        if (rewardError) {
          console.error('Error inserting reward:', rewardError);
        } else {
          rewardGranted = true;
          rewardAmount = REWARD_AMOUNT;
          console.log('Reward granted:', REWARD_AMOUNT);

          // Update profile: increment streak and total earnings
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_streak, total_earnings')
            .eq('id', user.id)
            .single();

          if (profile) {
            const newStreak = (profile.current_streak || 0) + 1;
            const newEarnings = parseFloat(profile.total_earnings || 0) + REWARD_AMOUNT;

            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                current_streak: newStreak,
                total_earnings: newEarnings,
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating profile:', updateError);
            } else {
              console.log('Profile updated: streak=', newStreak, 'earnings=', newEarnings);
            }
          }
        }
      } else {
        console.log('Reward already granted for this date');
      }
    }

    // Fetch updated profile
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('current_streak, total_earnings, full_name')
      .eq('id', user.id)
      .single();

    const response = {
      success: true,
      reward_granted: rewardGranted,
      reward_amount: rewardAmount,
      current_streak: updatedProfile?.current_streak || 0,
      total_earnings: parseFloat(updatedProfile?.total_earnings || 0),
      message: rewardGranted 
        ? `Congratulations! You earned $${REWARD_AMOUNT.toFixed(2)} for hitting ${REWARD_THRESHOLD.toLocaleString()} steps!`
        : steps >= REWARD_THRESHOLD 
          ? 'Great job! You already claimed today\'s reward.'
          : `Keep going! ${REWARD_THRESHOLD - steps} more steps to earn $${REWARD_AMOUNT.toFixed(2)}.`,
    };

    console.log('Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
