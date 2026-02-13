import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is authenticated
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all analyses with user emails
    const { data: analyses, error: analysesError } = await adminClient
      .from("contract_analyses")
      .select("id, created_at, deleted_at, user_id, analysis_result")
      .order("created_at", { ascending: false });

    if (analysesError) throw analysesError;

    // Get unique user ids and fetch emails
    const userIds = [...new Set((analyses || []).map((a: any) => a.user_id))];
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const userMap: Record<string, string> = {};
    (usersData?.users || []).forEach((u: any) => {
      userMap[u.id] = u.email || "unknown";
    });

    // Return sanitized data: only email, title/purpose, dates — everything else encrypted/hidden
    const sanitized = (analyses || []).map((a: any) => {
      const result = a.analysis_result as any;
      return {
        id: a.id,
        user_email: userMap[a.user_id] || "unknown",
        contract_purpose: result?.contract_purpose || "Untitled Contract",
        overall_risk_level: result?.overall_risk_level || "unknown",
        risk_score: result?.risk_score ?? null,
        created_at: a.created_at,
        deleted_at: a.deleted_at,
        // All other details are intentionally excluded (encrypted/hidden)
        encrypted_details: "🔒 Encrypted — Full contract details are not accessible from the admin portal.",
      };
    });

    return new Response(JSON.stringify(sanitized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
