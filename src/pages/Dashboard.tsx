import { useState } from "react";
import FileUpload from "@/components/dashboard/FileUpload";
import AnalysisResults from "@/components/dashboard/AnalysisResults";
import CompareDialog from "@/components/dashboard/CompareDialog";
import CompareResults from "@/components/dashboard/CompareResults";
import TrashSection from "@/components/dashboard/TrashSection";
import PastAnalyses from "@/components/dashboard/PastAnalyses";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/lib/mock-analysis";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContractAnalyses, type SavedAnalysis } from "@/hooks/useContractAnalyses";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    analyses,
    trashedAnalyses,
    loading: analysesLoading,
    saveAnalysis,
    softDelete,
    restore,
    permanentDelete,
  } = useContractAnalyses();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [contractText, setContractText] = useState("");
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareResult, setCompareResult] = useState<AnalysisResult | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setCompareResult(null);
    setShowCompare(false);
    setProgress(0);
    setContractText(text);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 10;
      });
    }, 400);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { contractText: text },
      });

      clearInterval(interval);
      if (error) throw new Error(error.message || "Analysis failed");
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setTimeout(async () => {
        const analysisResult = data as AnalysisResult;
        setResult(analysisResult);
        setIsAnalyzing(false);

        // Auto-save if logged in
        if (user) {
          const id = await saveAnalysis(text, analysisResult);
          setCurrentAnalysisId(id);
        }

        toast({ title: "Analysis Complete", description: "Your contract has been analyzed by AI." });
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      toast({
        title: "Error",
        description: err?.message || "Analysis failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (currentAnalysisId && user) {
      softDelete(currentAnalysisId);
    }
    setResult(null);
    setCompareResult(null);
    setShowCompare(false);
    setProgress(0);
    setContractText("");
    setCurrentAnalysisId(null);
  };

  const handleReanalyze = async () => {
    if (!contractText) return;
    setIsReanalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 10;
      });
    }, 400);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { contractText },
      });

      clearInterval(interval);
      if (error) throw new Error(error.message || "Analysis failed");
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setTimeout(() => {
        setResult(data as AnalysisResult);
        setIsReanalyzing(false);
        toast({ title: "Re-analysis Complete", description: "Your contract has been re-analyzed." });
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsReanalyzing(false);
      toast({ title: "Error", description: err?.message || "Re-analysis failed.", variant: "destructive" });
    }
  };

  const handleCompareReady = (secondResult: AnalysisResult) => {
    setCompareResult(secondResult);
    setShowCompare(true);
  };

  const handleLoadFromTrash = (item: SavedAnalysis) => {
    restore(item.id);
    setResult(item.analysis_result);
    setContractText(item.contract_text);
    setCurrentAnalysisId(item.id);
  };

  const handleLoadPast = (item: SavedAnalysis) => {
    setResult(item.analysis_result);
    setContractText(item.contract_text);
    setCurrentAnalysisId(item.id);
    setCompareResult(null);
    setShowCompare(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {showCompare && result && compareResult ? (
          <CompareResults
            resultA={result}
            resultB={compareResult}
            onBack={() => setShowCompare(false)}
          />
        ) : (
          <>
            {!result && (
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Contract Analysis</h1>
                <p className="text-muted-foreground text-sm">
                  Upload a contract to get AI-powered risk assessment and legal insights.
                </p>
              </div>
            )}

            {!result && <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />}

            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 glass rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">AI is analyzing your contract...</p>
                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {progress < 30 && "Extracting and chunking text..."}
                      {progress >= 30 && progress < 60 && "Querying Indian legal knowledge base..."}
                      {progress >= 60 && progress < 90 && "AI analyzing clauses and generating report..."}
                      {progress >= 90 && "Finalizing analysis..."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {result && (
              <AnalysisResults
                result={result}
                onDelete={handleDelete}
                onCompare={() => setCompareOpen(true)}
                onReanalyze={handleReanalyze}
                isReanalyzing={isReanalyzing}
                contractText={contractText}
              />
            )}

            {/* Past analyses — shown when no active analysis */}
            {!result && user && (
              <PastAnalyses
                analyses={analyses}
                loading={analysesLoading}
                onLoad={handleLoadPast}
                onDelete={softDelete}
              />
            )}

            {/* Trash section — shown when no active analysis */}
            {!result && user && (
              <TrashSection
                items={trashedAnalyses}
                onRestore={restore}
                onPermanentDelete={permanentDelete}
                onLoadAnalysis={handleLoadFromTrash}
              />
            )}
          </>
        )}

        <CompareDialog
          open={compareOpen}
          onOpenChange={setCompareOpen}
          onCompareReady={handleCompareReady}
        />
      </div>
    </div>
  );
};

export default Dashboard;
