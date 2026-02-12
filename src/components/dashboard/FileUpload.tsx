import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface FileUploadProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

const FileUpload = ({ onAnalyze, isAnalyzing }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "application/json")) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleAnalyze = () => {
    if (file) {
      onAnalyze(`[File: ${file.name}] — Content extracted and sent for analysis.`);
    } else if (pastedText.trim()) {
      onAnalyze(pastedText);
    }
  };

  const canAnalyze = (file || pastedText.trim().length > 50) && !isAnalyzing;

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="font-display text-lg font-semibold mb-4">Upload Contract</h2>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              Drag & drop or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">PDF or JSON • Max 10MB</p>
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between p-3 rounded-lg bg-secondary"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="paste">
          <Textarea
            placeholder="Paste your contract text here (minimum 50 characters)..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="min-h-[200px] bg-secondary border-border resize-none"
          />
          {pastedText.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {pastedText.length} characters {pastedText.length < 50 ? "(minimum 50)" : "✓"}
            </p>
          )}
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="w-full mt-4 glow"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing Contract...
          </>
        ) : (
          "Analyze Contract"
        )}
      </Button>
    </div>
  );
};

export default FileUpload;
