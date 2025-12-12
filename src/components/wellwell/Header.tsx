import { cn } from "@/lib/utils";
import wellwellLogo from "@/assets/wellwell-logo.png";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showLogo?: boolean;
  className?: string;
}

export function Header({ showLogo = true, className }: HeaderProps) {
  return (
    <header className={cn("flex items-center justify-between py-4 px-1", className)}>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Menu className="w-5 h-5" />
      </Button>
      
      {showLogo && (
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          className="h-8 w-auto"
        />
      )}
      
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <User className="w-5 h-5" />
      </Button>
    </header>
  );
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <img 
      src={wellwellLogo} 
      alt="WellWell" 
      className={cn("h-10 w-auto", className)}
    />
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img 
      src={wellwellIcon} 
      alt="WellWell" 
      className={cn("h-10 w-auto", className)}
    />
  );
}
