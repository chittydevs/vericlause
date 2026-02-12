import { useState } from "react";
import FileUpload from "@/components/dashboard/FileUpload";
import AnalysisResults from "@/components/dashboard/AnalysisResults";
import { Progress } from "@/components/ui/progress";
import { simulateAnalysis, type AnalysisResult } from "@/lib/mock-analysis";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 15;
      });
    }, 300);

    try {
      const data = await simulateAnalysis();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
        toast({ title: "Analysis Complete", description: "Your contract has been analyzed successfully." });
      }, 500);
    } catch {
      clearInterval(interval);
      setIsAnalyzing(false);
      toast({ title: "Error", description: "Analysis failed. Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    setResult(null);
    setProgress(0);
    toast({ title: "Deleted", description: "Analysis data has been removed." });
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Contract Analysis</h1>
          <p className="text-muted-foreground text-sm">
            Upload a contract to get AI-powered risk assessment and legal insights.
          </p>
        </div>

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
                <p className="text-sm font-medium">Analyzing contract...</p>
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

        {result && <AnalysisResults result={result} onDelete={handleDelete} />}
      </div>
    </div>
  );
};

export default Dashboard;
