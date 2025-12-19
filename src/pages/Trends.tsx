import { Layout } from "@/components/wellwell/Layout";
import { VirtueChart } from "@/components/wellwell/VirtueChart";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function Trends() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header with back button */}
        <div className="shrink-0 flex items-center gap-3 py-2 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">
              14-Day Trends
            </h1>
          </div>
        </div>

        {/* Chart - takes all remaining space */}
        <div className="flex-1 min-h-0 p-4 glass-card">
          <VirtueChart days={14} />
        </div>

        {/* Legend / Info */}
        <div className="shrink-0 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Track how your virtue scores change over time based on your daily reflections.
          </p>
        </div>
      </div>
    </Layout>
  );
}
