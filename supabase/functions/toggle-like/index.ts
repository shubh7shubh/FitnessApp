import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// This is a special type of function in PostgreSQL that lets us run multiple
// commands in a single, safe transaction.
const TOGGLE_LIKE_RPC = "toggle_like_and_notify";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

serve(async (req) => {
  try {
    // 1. Create a service role client. We need this to have admin-level
    //    permissions to perform a transaction across multiple tables securely.
    const supabaseAdmin = createClient(
      Deno.env.get(`${SUPABASE_URL}`)!,
      Deno.env.get(`${SUPABASE_SERVICE_ROLE_KEY}`)!
    );

    // 2. Create a user-context client to get the authenticated user
    const userClient = createClient(
      Deno.env.get(`${SUPABASE_URL}`)!,
      Deno.env.get(`${SUPABASE_ANON_KEY}`)!,
      {
        global: {
          headers: {
            Authorization:
              req.headers.get("Authorization")!,
          },
        },
      }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) throw new Error("User not found");

    // 3. Get the postId from the request body
    const { post_id } = await req.json();
    if (!post_id) throw new Error("post_id is required");

    // 4. Call the PostgreSQL database function (RPC)
    const { data, error } = await supabaseAdmin.rpc(
      TOGGLE_LIKE_RPC,
      {
        p_post_id: post_id,
        p_user_id: user.id,
      }
    );

    if (error) throw error;

    // 5. Return the result (e.g., whether the post is now liked or unliked)
    return new Response(JSON.stringify({ liked: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
