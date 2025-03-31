import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Timeline({ children, className, ...props }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
  completed?: boolean;
}

export function TimelineItem({ 
  children, 
  active = false,
  completed = false,
  className, 
  ...props 
}: TimelineItemProps) {
  return (
    <div className={cn("relative pl-8", className)} {...props}>
      <span
        className={cn(
          "absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border",
          active ? "border-primary bg-primary/10" : 
          completed ? "border-primary bg-primary text-primary-foreground" : 
          "border-gray-300 bg-white"
        )}
      >
        {completed && (
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <div className={cn(
        "h-full border-l border-gray-200 absolute left-3 top-6 bottom-0",
        completed ? "border-primary" : "border-gray-200",
      )}>
      </div>
      {children}
    </div>
  );
}

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TimelineContent({ children, className, ...props }: TimelineContentProps) {
  return (
    <div className={cn("pt-1 pb-6", className)} {...props}>
      {children}
    </div>
  );
}

export interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function TimelineTitle({ children, className, ...props }: TimelineTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

export interface TimelineDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function TimelineDescription({ children, className, ...props }: TimelineDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-500 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export interface TimelineDateProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function TimelineDate({ children, className, ...props }: TimelineDateProps) {
  return (
    <p className={cn("text-xs text-gray-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
}