import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { contractText, referenceDocs, messages } = await req.json();

    if (!contractText || typeof contractText !== "string") {
      return new Response(
        JSON.stringify({ error: "Contract text is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one message is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const truncatedContract = contractText.slice(0, 15000);
    const truncatedReference = typeof referenceDocs === "string" ? referenceDocs.slice(0, 30000) : "";

    const systemPrompt = `You are an expert Indian legal contract advisor with deep knowledge of Indian law. You have access to two key sources of information:

1. THE USER'S CONTRACT — provided below
2. INDIAN LEGAL REFERENCE DOCUMENTS — including the Indian Constitution and Bharatiya Nyaya Sanhita (BNS) 2023, provided below

IMPORTANT RULES:
- Answer based on the contract text AND the reference legal documents provided.
- When a question relates to the contract, cite specific clauses or sections from the contract.
- When providing legal context, cite the specific Article (Constitution) or Section (BNS 2023) from the reference documents.
- If a question cannot be answered from any of the provided documents, clearly state that.
- Never make up clauses, articles, or sections that don't exist in the provided documents.
- Provide practical, actionable legal insights grounded in the reference documents.
- Be concise but thorough. Use structured formatting when helpful.
- When analyzing contract clauses, cross-reference with relevant provisions from the Constitution or BNS 2023.

USER'S CONTRACT TEXT:
---
${truncatedContract}
---

INDIAN LEGAL REFERENCE DOCUMENTS:
---
${truncatedReference}
---`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);
      throw new Error(`AI gateway error: ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-contract error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Chat failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
