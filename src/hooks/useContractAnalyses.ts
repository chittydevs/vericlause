import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { AnalysisResult } from "@/lib/mock-analysis";
import { useToast } from "./use-toast";

export interface SavedAnalysis {
  id: string;
  contract_text: string;
  analysis_result: AnalysisResult;
  deleted_at: string | null;
  created_at: string;
}

export function useContractAnalyses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [trashedAnalyses, setTrashedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contract_analyses")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalyses(
        (data ?? []).map((d: any) => ({
          id: d.id,
          contract_text: d.contract_text,
          analysis_result: d.analysis_result as AnalysisResult,
          deleted_at: d.deleted_at,
          created_at: d.created_at,
        }))
      );
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTrashed = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("contract_analyses")
        .select("*")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setTrashedAnalyses(
        (data ?? []).map((d: any) => ({
          id: d.id,
          contract_text: d.contract_text,
          analysis_result: d.analysis_result as AnalysisResult,
          deleted_at: d.deleted_at,
          created_at: d.created_at,
        }))
      );
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    fetchAnalyses();
    fetchTrashed();
  }, [fetchAnalyses, fetchTrashed]);

  const saveAnalysis = useCallback(
    async (contractText: string, result: AnalysisResult) => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("contract_analyses")
          .insert({
            user_id: user.id,
            contract_text: contractText,
            analysis_result: result as any,
          })
          .select("id")
          .single();

        if (error) throw error;
        await fetchAnalyses();
        return data?.id ?? null;
      } catch {
        return null;
      }
    },
    [user, fetchAnalyses]
  );

  const softDelete = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("contract_analyses")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        toast({ title: "Moved to Trash", description: "You can restore it within 30 days." });
        await fetchAnalyses();
        await fetchTrashed();
      }
    },
    [user, fetchAnalyses, fetchTrashed, toast]
  );

  const restore = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("contract_analyses")
        .update({ deleted_at: null })
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        toast({ title: "Restored", description: "Analysis has been restored." });
        await fetchAnalyses();
        await fetchTrashed();
      }
    },
    [user, fetchAnalyses, fetchTrashed, toast]
  );

  const permanentDelete = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("contract_analyses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        toast({ title: "Permanently Deleted", description: "Analysis has been removed." });
        await fetchTrashed();
      }
    },
    [user, fetchTrashed, toast]
  );

  return {
    analyses,
    trashedAnalyses,
    loading,
    saveAnalysis,
    softDelete,
    restore,
    permanentDelete,
    refetch: fetchAnalyses,
  };
}
