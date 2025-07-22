import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

serve(async (req) => {
  try {
    // 1. Create a Supabase client with the correct auth headers
    const supabase = createClient(
      Deno.env.get(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}`
      )!,
      Deno.env.get(
        `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      )!,
      {
        global: {
          headers: {
            Authorization:
              req.headers.get("Authorization")!,
          },
        },
      }
    );

    // 2. Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }

    // 3. Get the image_url and caption from the request body
    const { image_url, caption } = await req.json();
    if (!image_url) {
      throw new Error("Image URL is required");
    }

    // 4. Insert the new post into the database
    const { data: newPost, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        image_url: image_url,
        caption: caption,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 5. Return the newly created post data
    return new Response(JSON.stringify(newPost), {
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
