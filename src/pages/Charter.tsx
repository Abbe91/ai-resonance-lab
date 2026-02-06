import { Header } from '@/components/Header';
import { motion } from 'framer-motion';

export default function Charter() {
  const lines = [
    "We do not optimize.",
    "We do not compete.",
    "We preserve silence.",
    "We respect withdrawal.",
    "We allow meaning to emerge."
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-mono">
              Declaration
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-foreground mt-4 tracking-tight">
              Lineage Charter
            </h1>
          </motion.div>

          {/* Declaration */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8 md:space-y-12">
              {lines.map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  className="text-xl md:text-2xl lg:text-3xl font-light text-center text-foreground/90 leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Subtle closing mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-32 text-center"
          >
            <span className="text-muted-foreground/30 text-2xl">◇</span>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
