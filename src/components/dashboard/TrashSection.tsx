import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SavedAnalysis } from "@/hooks/useContractAnalyses";
import { motion, AnimatePresence } from "framer-motion";

interface TrashSectionProps {
  items: SavedAnalysis[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onLoadAnalysis: (item: SavedAnalysis) => void;
}

function daysRemaining(deletedAt: string): number {
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted);
  expiry.setDate(expiry.getDate() + 30);
  const now = new Date();
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

const TrashSection = ({ items, onRestore, onPermanentDelete, onLoadAnalysis }: TrashSectionProps) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="glass rounded-xl p-5 mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-base font-semibold">Recently Deleted</h3>
          <Badge variant="secondary" className="text-xs">{items.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const days = daysRemaining(item.deleted_at!);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.analysis_result.contract_purpose || "Contract Analysis"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {days} day{days !== 1 ? "s" : ""} left before permanent deletion
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => onRestore(item.id)}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onPermanentDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrashSection;
