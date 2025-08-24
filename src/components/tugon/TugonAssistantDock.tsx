import { AnimatePresence, motion } from "framer-motion";
import Character from "./Character";
import HintBubble from "./HintBubble";
import { MessageType } from "../data/message";
import { PropsWithChildren, ReactNode } from "react";

type DockProps = PropsWithChildren<{
  text?: ReactNode;
  show?: boolean;
  bottom?: number; // px offset from bottom
  right?: number;  // px offset from right
}>;

/**
 * Fixed-position assistant dock that keeps the hint bubble attached to the character
 * at the bottom-right corner of the viewport.
 */
export default function TugonAssistantDock({
  text,
  children,
  show = true,
  bottom = 16,
  right = 16,
}: DockProps) {
  const bubble = children ?? text;
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottom}px)`,
        right: `calc(env(safe-area-inset-right, 0px) + ${right}px)`,
      }}
      aria-live="polite"
      aria-atomic
    >
      <div className="flex flex-col items-end gap-2">
        {/* Bubble with animation */}
        <AnimatePresence initial={false}>
          {show && bubble && (
            <motion.div
              key={typeof bubble === "string" ? bubble : undefined}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.6 }}
              className="relative max-w-[min(90vw,28rem)] pointer-events-auto"
            >
              <HintBubble
                message={{
                  type: MessageType.AI,
                  text: typeof bubble === "string" ? bubble : "",
                }}
              />
              {/* Pointer towards character */}
              <div className="absolute -bottom-2 right-10" aria-hidden>
                {/* outer (ring) */}
                <div className="w-0 h-0"
                  style={{
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderTop: "10px solid rgba(0,0,0,0.1)",
                    transform: "translateY(1px)",
                  }}
                />
                {/* inner (fill) */}
                <div className="w-0 h-0 -mt-[9px]"
                  style={{
                    borderLeft: "9px solid transparent",
                    borderRight: "9px solid transparent",
                    borderTop: "9px solid white",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character */}
        <div className="pointer-events-auto">
          <Character className="w-32 h-32" />
        </div>
      </div>
    </div>
  );
}
