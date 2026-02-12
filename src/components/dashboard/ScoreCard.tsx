import { motion } from "framer-motion";

interface ScoreCardProps {
  label: string;
  score: number;
  description: string;
  variant: "risk" | "confidentiality";
}

const ScoreCard = ({ label, score, description, variant }: ScoreCardProps) => {
  const getColor = () => {
    if (variant === "risk") {
      if (score >= 70) return "text-destructive";
      if (score >= 40) return "text-warning";
      return "text-success";
    }
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getTrackColor = () => {
    if (variant === "risk") {
      if (score >= 70) return "stroke-destructive";
      if (score >= 40) return "stroke-warning";
      return "stroke-success";
    }
    if (score >= 70) return "stroke-success";
    if (score >= 40) return "stroke-warning";
    return "stroke-destructive";
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass rounded-xl p-6 flex flex-col items-center text-center">
      <p className="text-sm font-medium text-muted-foreground mb-4">{label}</p>
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            className={getTrackColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`font-display text-3xl font-bold ${getColor()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{description}</p>
    </div>
  );
};

export default ScoreCard;
