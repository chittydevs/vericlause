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

    const { contractText } = await req.json();

    if (!contractText || typeof contractText !== "string" || contractText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Contract text must be at least 50 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const truncated = contractText.slice(0, 15000);

    const systemPrompt = `You are an expert Indian legal contract analyst. Analyze the given contract text and return a comprehensive structured assessment. You MUST call the analyze_contract function with your analysis. Be thorough but concise. Focus on Indian law (Indian Contract Act 1872, IT Act 2000, DPDP Act 2023, etc).

Key instructions:
- Identify the contract purpose and all parties involved with their roles and locations.
- Determine overall risk level as high, medium, or low.
- Break down risks into specific categories (e.g., Payment Risk, IP Ownership Risk, Confidentiality Risk, Delivery Timeline Risk, Warranty Risk, Termination Risk, Governing Law Risk, etc.).
- For each risk category, provide issues identified, AI recommendations, and suggest improved clause wording where applicable.
- Suggest 3-5 new protective clauses that should be added to the contract.
- Provide profit optimization suggestions.`;

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
          { role: "user", content: `Analyze this contract:\n\n${truncated}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_contract",
              description: "Return comprehensive structured contract analysis results",
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
                  overall_risk_level: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Overall risk classification.",
                  },
                  contract_purpose: {
                    type: "string",
                    description: "1-2 sentence description of the contract's purpose.",
                  },
                  parties: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        role: { type: "string", description: "e.g. Service Provider, Client, Vendor" },
                        location: { type: "string", description: "City, State" },
                      },
                      required: ["name", "role", "location"],
                    },
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
                  risk_categories: {
                    type: "array",
                    description: "Detailed risk breakdown by category (e.g. Payment Risk, IP Risk, etc.)",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "e.g. Payment Risk, IP Ownership Risk" },
                        level: { type: "string", enum: ["high", "medium", "low"] },
                        score: { type: "number", description: "Risk score 0-100 for this category" },
                        issues: {
                          type: "array",
                          items: { type: "string" },
                          description: "Specific issues identified in this category",
                        },
                        recommendations: {
                          type: "array",
                          items: { type: "string" },
                          description: "AI recommendations to mitigate risks",
                        },
                        original_clause: {
                          type: "string",
                          description: "The problematic original clause text, if applicable",
                        },
                        improved_clause: {
                          type: "string",
                          description: "AI-suggested improved version of the clause",
                        },
                      },
                      required: ["name", "level", "score", "issues", "recommendations"],
                    },
                  },
                  suggested_clauses: {
                    type: "array",
                    description: "3-5 new protective clauses AI recommends adding to the contract",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        category: { type: "string", description: "e.g. Limitation of Liability, Termination, Payment Terms" },
                        description: { type: "string" },
                        clause_type: { type: "string", enum: ["balanced", "protective", "aggressive"] },
                        clause_text: { type: "string", description: "Full suggested clause text" },
                      },
                      required: ["title", "category", "description", "clause_type", "clause_text"],
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
                  "overall_risk_level",
                  "contract_purpose",
                  "parties",
                  "summary",
                  "red_flags",
                  "clause_explanations",
                  "risk_categories",
                  "suggested_clauses",
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
