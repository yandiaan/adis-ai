import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cx(
        'glass-surface-strong rounded-lg px-2.5 py-1.5 text-[11px] text-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.45)]',
        'border border-white/10',
        'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
        'data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0',
        'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
