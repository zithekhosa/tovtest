import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      status: {
        active: "bg-green-100 text-green-800",
        inactive: "bg-gray-100 text-gray-800",
        pending: "bg-amber-100 text-amber-800",
        upcoming: "bg-blue-100 text-blue-800",
        expired: "bg-red-100 text-red-800",
        completed: "bg-purple-100 text-purple-800",
        overdue: "bg-red-100 text-red-800",
        warning: "bg-amber-100 text-amber-800",
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