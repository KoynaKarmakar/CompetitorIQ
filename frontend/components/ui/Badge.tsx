import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "purple";
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    const variants = {
        default: "bg-surface-3 text-text-secondary border border-border",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        danger: "bg-danger/10 text-danger border border-danger/20",
        purple: "bg-primary/10 text-primary-light border border-primary/20",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
