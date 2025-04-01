import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8", className)}>
      {children}
    </div>
  );
}

export function FeedContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("w-full mx-auto px-4 max-w-[600px]", className)}>
      {children}
    </div>
  );
}

export function SidebarContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("hidden lg:block w-full max-w-xs", className)}>
      {children}
    </div>
  );
}

export function MainContent({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("flex-1 min-w-0", className)}>
      {children}
    </div>
  );
}

export function FlexContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 gap-6", className)}>
      {children}
    </div>
  );
}