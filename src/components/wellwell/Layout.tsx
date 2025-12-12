import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  className?: string;
}

export function Layout({ 
  children, 
  showHeader = true, 
  showNav = true,
  className 
}: LayoutProps) {
  return (
    <div className="viewport-container bg-background">
      {/* Subtle background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />
      
      <div className="relative flex-1 flex flex-col max-w-lg mx-auto w-full overflow-hidden">
        {showHeader && <Header />}
        
        <main className={cn(
          "flex-1 flex flex-col min-h-0 px-4 py-3 overflow-hidden",
          className
        )}>
          {children}
        </main>
        
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
