import {
  HoverCard,
  HoverCardContent as ToolkitHoverCardContent,
  HoverCardTrigger,
} from "@agent-native/toolkit/ui/hover-card";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof ToolkitHoverCardContent>,
  React.ComponentPropsWithoutRef<typeof ToolkitHoverCardContent>
>((props, ref) => (
  <HoverCardPrimitive.Portal>
    <ToolkitHoverCardContent ref={ref} {...props} />
  </HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardContent, HoverCardTrigger };
