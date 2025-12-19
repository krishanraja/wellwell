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
        
        {/* Main content area - uses CSS calc for exact height fitting */}
        <main 
          className={cn(
            "flex-1 flex flex-col px-4 py-2 overflow-hidden",
            className
          )}
          style={{
            // Calculate exact available height: viewport - header (56px) - nav (64px + safe area) - padding
            paddingBottom: showNav ? 'calc(4rem + env(safe-area-inset-bottom, 0px) + 0.5rem)' : undefined,
          }}
        >
          {children}
        </main>
        
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
