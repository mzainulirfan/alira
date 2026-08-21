import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-coral aria-invalid:ring-3 aria-invalid:ring-coral/20 dark:aria-invalid:border-coral/50 dark:aria-invalid:ring-coral/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-petrol text-white hover:bg-petrol-2 border-transparent",
        outline: "border-line bg-transparent hover:bg-petrol/3 hover:text-petrol aria-expanded:bg-petrol/5 aria-expanded:text-petrol",
        secondary: "bg-muted text-muted-foreground hover:bg-muted/80 aria-expanded:bg-muted/80 aria-expanded:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-coral/10 text-coral hover:bg-coral/20 focus-visible:border-coral/40 focus-visible:ring-coral/20",
        link: "text-petrol underline-offset-4 hover:text-petrol-2 hover:underline",
        brass: "bg-brass text-white hover:bg-brass/90 border-transparent",
        aqua: "bg-aqua text-white hover:bg-aqua/90 border-transparent",
      },
      size: {
        default: "h-10 gap-1.5 px-3 text-sm",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs",
        sm: "h-9 gap-1 rounded-lg px-2.5 text-sm",
        lg: "h-11 gap-1.5 px-4 text-base",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11",
        "icon-xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }