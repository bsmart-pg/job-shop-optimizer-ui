
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReactNode } from "react";

interface TimelineScrollProps {
  children: ReactNode;
  height: string;
}

export function TimelineScroll({ children, height }: TimelineScrollProps) {
  return (
    <ScrollArea className="h-[600px]" type="always">
      {children}
    </ScrollArea>
  );
}
