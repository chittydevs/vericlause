import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { contractText, changes } = await req.json();

    if (!contractText || !changes?.length) {
      return new Response(
        JSON.stringify({ error: "Contract text and at least one change are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const changesDescription = changes.map((c: any, i: number) => {
      if (c.type === "suggested_clause") {
        return `${i + 1}. ADD NEW CLAUSE — "${c.label}": ${c.data.clause_text}`;
      }
      if (c.type === "improved_clause") {
        return `${i + 1}. REPLACE CLAUSE in "${c.data.category}" — Original: "${c.data.original}" → Improved: "${c.data.improved}"`;
      }
      return `${i + 1}. ${c.label}`;
    }).join("\n\n");

    const systemPrompt = `You are an expert Indian legal contract drafter. You will be given an original contract and a list of changes to apply. Your task is to produce a complete, updated version of the contract with all requested changes incorporated seamlessly.

Rules:
- Maintain the original contract's structure, formatting, and tone
- For "ADD NEW CLAUSE" changes, insert them in the most appropriate location within the contract
- For "REPLACE CLAUSE" changes, find and replace the original clause with the improved version
- Ensure all clause numbering remains consistent after changes
- Do NOT add commentary or notes — output ONLY the final updated contract text
- Preserve all existing clauses that are not being modified`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `ORIGINAL CONTRACT:\n\n${contractText.slice(0, 15000)}\n\n---\n\nCHANGES TO APPLY:\n\n${changesDescription}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const updatedContract = data.choices?.[0]?.message?.content;

    if (!updatedContract) {
      throw new Error("AI did not return updated contract text");
    }

    return new Response(JSON.stringify({ updatedContract }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-updated-contract error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
