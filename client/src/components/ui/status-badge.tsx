import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      status: {
        active: "bg-primary/10 text-primary",
        inactive: "bg-muted text-muted-foreground",
        pending: "bg-muted text-muted-foreground",
        upcoming: "bg-primary/10 text-primary",
        expired: "bg-destructive/10 text-destructive",
        completed: "bg-primary/10 text-primary",
        overdue: "bg-destructive/10 text-destructive",
        warning: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "inactive",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "active" | "inactive" | "pending" | "upcoming" | "expired" | "completed" | "overdue" | "warning";
}

export function StatusBadge({
  className,
  status,
  ...props
}: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {status === "active" && "Active"}
      {status === "inactive" && "Inactive"}
      {status === "pending" && "Pending"}
      {status === "upcoming" && "Upcoming"}
      {status === "expired" && "Expired"}
      {status === "completed" && "Completed"}
      {status === "overdue" && "Overdue"}
      {status === "warning" && "Warning"}
    </div>
  );
}