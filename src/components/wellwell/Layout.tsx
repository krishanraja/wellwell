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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />
      
      <div className="relative flex-1 flex flex-col max-w-lg mx-auto w-full px-4">
        {showHeader && <Header />}
        
        <main className={cn(
          "flex-1 py-4",
          showNav && "pb-28",
          className
        )}>
          {children}
        </main>
      </div>
      
      {showNav && <BottomNav />}
    </div>
  );
}
