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
}

export function Layout({ 
  children, 
  showHeader = true, 
  showNav = true,
  showGreeting = false,
  className,
}: LayoutProps) {
  // Calculate exact content height using dvh units
  // Header: 56px, Nav: 64px + safe area
  const contentHeight = showNav 
    ? 'calc(100dvh - 56px - 64px - env(safe-area-inset-bottom, 0px))' 
    : 'calc(100dvh - 56px)';

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />
      
      <div className="relative flex flex-col max-w-lg mx-auto w-full h-full">
        {/* Header - fixed height */}
        {showHeader && <Header showGreeting={showGreeting} />}
        
        {/* Main content - exact calculated height, no overflow */}
        <main 
          className={cn(
            "flex flex-col px-4 py-2 overflow-hidden",
            className
          )}
          style={{ height: contentHeight }}
        >
          {children}
        </main>
        
        {/* Bottom nav - fixed at bottom */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
