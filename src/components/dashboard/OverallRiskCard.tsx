import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface OverallRiskCardProps {
  riskScore: number;
  riskLevel: "high" | "medium" | "low";
}

const levelConfig = {
  high: { label: "HIGH RISK", color: "text-destructive", icon: ShieldAlert, bg: "bg-destructive/20" },
  medium: { label: "MODERATE", color: "text-warning", icon: Shield, bg: "bg-warning/20" },
  low: { label: "LOW RISK", color: "text-success", icon: ShieldCheck, bg: "bg-success/20" },
};

const OverallRiskCard = ({ riskScore, riskLevel }: OverallRiskCardProps) => {
  const config = levelConfig[riskLevel];
  const Icon = config.icon;

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-bold mb-1">Overall Risk Assessment</h2>
          <p className="text-sm text-muted-foreground mb-4">AI-powered comprehensive analysis</p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-display text-4xl font-bold ${config.color}`}
          >
            {config.label}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-1">Risk Level · Score: {riskScore}/100</p>
        </div>
        <div className={`p-4 rounded-xl ${config.bg}`}>
          <Icon className={`h-10 w-10 ${config.color}`} />
        </div>
      </div>
    </div>
  );
};

export default OverallRiskCard;
