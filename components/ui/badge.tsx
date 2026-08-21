import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20 aria-invalid:border-coral aria-invalid:ring-coral/20 dark:aria-invalid:ring-coral/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-petrol text-white",
        secondary: "bg-muted text-muted-foreground",
        success: "bg-green-light text-green",
        warning: "bg-brass-light text-brass",
        destructive: "bg-coral-light text-coral",
        outline: "border-line bg-transparent text-muted-2 hover:bg-muted",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "text-petrol underline-offset-4 hover:text-petrol-2 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = VariantProps<typeof badgeVariants> & {
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }