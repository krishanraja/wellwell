import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showGreeting?: boolean;
  scrollable?: boolean;
  className?: string;
}

export function Layout({ 
  children, 
  showHeader = true, 
  showNav = true,
  showGreeting = false,
  scrollable = false,
  className,
}: LayoutProps) {
  return (
    <div className="app-container">
      {/* Subtle background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />
      
      <div className="app-wrapper">
        {/* Header - fixed height */}
        {showHeader && <Header showGreeting={showGreeting} />}
        
        {/* Main content - fills available space */}
        <main 
          className={cn(
            "app-content",
            showNav && "app-content-with-nav",
            scrollable && "app-content-scrollable",
            className
          )}
        >
          {children}
        </main>
        
        {/* Bottom nav - fixed at bottom with safe area */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
