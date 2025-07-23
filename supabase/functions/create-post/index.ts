// supabase/functions/create-post/index.ts
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Define the shape of the expected request body for type safety
interface PostPayload {
  image_url: string;
  caption?: string;
}

// A type guard to validate the incoming data
function isValidPayload(payload: any): payload is PostPayload {
  return (
    payload &&
    typeof payload === "object" &&
    "image_url" in payload &&
    typeof payload.image_url === "string"
  );
}

serve(async (req) => {
  try {
    // Create a Supabase admin client using the secret we set
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Validate the JSON payload from the request
    const payload: unknown = await req.json();
    if (!isValidPayload(payload)) {
      throw new Error(
        "Invalid request body: 'image_url' (string) is required."
      );
    }

    // Call our secure database function (RPC)
    const { data: newPost, error } = await supabaseAdmin.rpc(
      "create_new_post",
      {
        image_url: payload.image_url,
        caption: payload.caption,
      }
    );

    if (error) throw error;

    // Return the data that the database function gave back
    return new Response(JSON.stringify(newPost), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
