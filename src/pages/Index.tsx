import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, Lock, Zap, Scale, Brain, ArrowRight, ShieldCheck } from "lucide-react";
import ShieldCheckLogo from "@/components/ShieldCheckLogo";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileSearch,
    title: "AI-Powered Analysis",
    description: "Upload PDF, JSON, or paste text. Get comprehensive clause-by-clause risk assessment in seconds.",
  },
  {
    icon: Scale,
    title: "Indian Legal RAG",
    description: "Cross-references Indian Constitution, Contract Act, and IT Act for jurisdiction-specific insights.",
  },
  {
    icon: Lock,
    title: "Zero Data Retention",
    description: "Contracts are never permanently stored. Auto-deletion after 30 days with manual delete anytime.",
  },
  {
    icon: Brain,
    title: "Smart Red Flags",
    description: "Identifies unenforceable clauses, disproportionate liability, and compliance gaps automatically.",
  },
  {
    icon: Zap,
    title: "Profit Optimization",
    description: "AI-generated suggestions to negotiate better commercial terms and protect your margins.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "Row-level isolation, JWT auth, encrypted storage, and SOC 2-ready architecture.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <ShieldCheckLogo size={16} />
              AI-Powered Legal Intelligence
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Analyze Contracts
              <br />
              <span className="gradient-text">Before You Sign</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              VeriClause AI reads your contracts, identifies risks, flags non-compliant clauses under Indian law, and suggests profit-optimizing changes — in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base font-semibold px-8 glow">
                <Link to="/dashboard">
                  Start Analyzing <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <a href="#features">See How It Works</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">De-Risk</span> Contracts
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From upload to actionable insights — built for Indian legal compliance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group glass rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Protect Your Business?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Upload your first contract and get a comprehensive AI analysis in under 30 seconds.
              </p>
              <Button asChild size="lg" className="text-base font-semibold px-8 glow">
                <Link to="/dashboard">
                  Analyze Your Contract <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheckLogo size={20} />
            <span className="font-display text-sm font-semibold">VeriClause AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-generated analysis. Not legal advice. Consult a qualified professional.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
