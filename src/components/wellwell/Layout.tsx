import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showGreeting?: boolean;
  className?: string;
  scrollable?: boolean;
}

export function Layout({ 
  children, 
  showHeader = true, 
  showNav = true,
  showGreeting = false,
  className,
  scrollable = false
}: LayoutProps) {
  return (
    <div className="viewport-container bg-background overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />
      
      <div className="relative flex-1 flex flex-col max-w-lg mx-auto w-full h-full overflow-hidden">
        {showHeader && <Header showGreeting={showGreeting} />}
        
        <main className={cn(
          "flex-1 flex flex-col min-h-0 px-4 py-2 safe-bottom",
          "max-h-[calc(100dvh-var(--nav-height)-var(--header-height)-env(safe-area-inset-bottom,0px))]",
          scrollable ? "overflow-y-auto" : "overflow-hidden",
          className
        )}>
          {children}
        </main>
        
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
