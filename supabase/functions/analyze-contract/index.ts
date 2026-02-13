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
    const { contractText } = await req.json();

    if (!contractText || typeof contractText !== "string" || contractText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Contract text must be at least 50 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Truncate to ~15000 chars to stay within context limits
    const truncated = contractText.slice(0, 15000);

    const systemPrompt = `You are an expert Indian legal contract analyst. Analyze the given contract text and return a structured assessment. You MUST call the analyze_contract function with your analysis. Be thorough but concise. Focus on Indian law (Indian Contract Act 1872, IT Act 2000, DPDP Act 2023, etc).`;

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
          { role: "user", content: `Analyze this contract:\n\n${truncated}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_contract",
              description: "Return structured contract analysis results",
              parameters: {
                type: "object",
                properties: {
                  risk_score: {
                    type: "number",
                    description: "Overall risk score 0-100. Higher = more risky.",
                  },
                  confidentiality_score: {
                    type: "number",
                    description: "Confidentiality protection score 0-100. Higher = better protected.",
                  },
                  summary: {
                    type: "string",
                    description: "2-4 sentence summary of the contract's risk profile.",
                  },
                  red_flags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        clause: { type: "string" },
                        severity: { type: "string", enum: ["high", "medium", "low"] },
                        explanation: { type: "string" },
                      },
                      required: ["clause", "severity", "explanation"],
                    },
                  },
                  clause_explanations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        original_text: { type: "string" },
                        explanation: { type: "string" },
                        risk_level: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["title", "original_text", "explanation", "risk_level"],
                    },
                  },
                  profit_suggestions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  legal_compliance_notes: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "risk_score",
                  "confidentiality_score",
                  "summary",
                  "red_flags",
                  "clause_explanations",
                  "profit_suggestions",
                  "legal_compliance_notes",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_contract" } },
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured analysis");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Add disclaimer
    analysis.legal_disclaimer =
      "This analysis is generated by AI and does not constitute legal advice. It is intended for informational purposes only. Please consult a qualified legal professional before making any decisions based on this analysis. VeriClause AI and its creators are not liable for any actions taken based on this report.";

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-contract error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
