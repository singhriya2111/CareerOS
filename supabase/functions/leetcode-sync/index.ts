import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Auth failed: ' + (authError?.message || 'No user') }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { username } = await req.json()
    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 1. Fetch Recent Submissions
    const leetcodeHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://leetcode.com/'
    };

    const submissionsRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: leetcodeHeaders,
      body: JSON.stringify({
        query: `query userRecentSubmissions($username: String!, $limit: Int!) { 
          recentSubmissionList(username: $username, limit: $limit) { 
            title 
            titleSlug 
            timestamp 
            statusDisplay 
            lang 
          } 
        }`,
        variables: { username, limit: 15 }
      })
    });

    if (!submissionsRes.ok) {
      return new Response(JSON.stringify({ error: `Leetcode API returned ${submissionsRes.status}: ${await submissionsRes.text()}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const submissionsData = await submissionsRes.json();
    const submissions = submissionsData.data?.recentSubmissionList || [];

    // Filter accepted and get unique titleSlugs
    const accepted = submissions.filter((sub: any) => sub.statusDisplay === 'Accepted');
    const uniqueSlugs = new Set();
    const uniqueAccepted = [];
    
    for (const sub of accepted) {
      if (!uniqueSlugs.has(sub.titleSlug)) {
        uniqueSlugs.add(sub.titleSlug);
        uniqueAccepted.push(sub);
      }
    }

    const upsertPayload = [];

    // 2. Fetch Question Data for each unique submission
    for (const sub of uniqueAccepted) {
      const questionRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: leetcodeHeaders,
        body: JSON.stringify({
          query: `query questionData($titleSlug: String!) { 
            question(titleSlug: $titleSlug) { 
              difficulty 
              topicTags { name } 
            } 
          }`,
          variables: { titleSlug: sub.titleSlug }
        })
      });

      const questionData = await questionRes.json();
      const question = questionData.data?.question;
      
      if (!question) continue;

      const difficulty = question.difficulty;
      const topicTags = question.topicTags.map((t: any) => t.name).join(', ');

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + 3);

      upsertPayload.push({
        user_id: user.id,
        title: sub.title,
        difficulty: difficulty,
        pattern: topicTags,
        status: 'Solved',
        next_review: nextReviewDate.toISOString().split('T')[0]
      });
    }

    if (upsertPayload.length === 0) {
      return new Response(JSON.stringify({ message: 'No new accepted submissions found', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 3. Upsert into public.dsa_problems
    const { error: dbError } = await supabaseClient
      .from('dsa_problems')
      .upsert(upsertPayload, { onConflict: 'user_id, title', ignoreDuplicates: true });

    if (dbError) {
      return new Response(JSON.stringify({ error: 'Database Error (Did you add the unique constraint?): ' + JSON.stringify(dbError) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: 'Successfully synced', count: upsertPayload.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    return new Response(JSON.stringify({ error: 'Caught exception: ' + errorMsg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
