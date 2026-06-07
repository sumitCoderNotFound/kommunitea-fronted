import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: string; // tailwind text/bg accent classes for the icon chip
}

export function CareerToolCard({ to, icon: Icon, title, description, accent = "bg-coral/10 text-coral" }: Props) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Link to={to}>
        <Card className="group flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-soft">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 font-semibold text-ink">
              {title}
              <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
