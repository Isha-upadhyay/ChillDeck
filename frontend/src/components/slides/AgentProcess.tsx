"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

export type AgentStep =
  | "planning"
  | "rag"
  | "research"
  | "writing"
  | "design"
  | "image"
  | "finalizing";

interface AgentProcessProps {
  /** Current step the backend is executing */
  currentStep: AgentStep | null;

  /** Steps completed so far */
  completedSteps: AgentStep[];

  /** Optional: shrink UI */
  compact?: boolean;

  /** Disable animations */
  noAnimation?: boolean;
}

const STEP_LABELS: Record<AgentStep, string> = {
  planning: "Planning Slide Structure",
  rag: "Retrieving Relevant Chunks",
  research: "Running Deep Research",
  writing: "Writing Slide Content",
  design: "Applying Slide Design",
  image: "Generating Images",
  finalizing: "Preparing Final Output",
};

export const AGENT_STEPS: AgentStep[] = [
  "planning",
  "rag",
  "research",
  "writing",
  "design",
  "image",
  "finalizing",
];

export const AgentProcess = memo(function AgentProcess({
  currentStep,
  completedSteps,
  compact = false,
  noAnimation = false,
}: AgentProcessProps) {
  return (
    <div className={cn("flex flex-col gap-3 p-4 rounded-md border bg-muted/40 shadow-sm")}>
      <h3 className="text-sm font-semibold text-muted-foreground tracking-tight">
        AI Slide Generation Progress
      </h3>

      <div className="flex flex-col gap-2">
        {AGENT_STEPS.map((step) => {
          const isActive = currentStep === step;
          const isDone = completedSteps.includes(step);

          return (
            <div
              key={step}
              className={cn(
                "flex items-center justify-between rounded-md border bg-white px-3 py-2 transition-all",
                isActive && "border-primary bg-primary/5",
                isDone && "border-green-500 bg-green-50"
              )}
            >
              {/* LEFT SECTION */}
              <div className="flex items-center gap-2">
                {isDone ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : isActive ? (
                  <Loader2
                    className={cn("h-4 w-4 text-primary", !noAnimation && "animate-spin")}
                  />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-300" />
                )}

                <span
                  className={cn(
                    "text-sm",
                    isDone && "text-green-700 font-medium",
                    isActive && "text-primary font-medium"
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* RIGHT STATUS TEXT */}
              {!compact && (
                <span
                  className={cn(
                    "text-xs",
                    isDone
                      ? "text-green-700"
                      : isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {isDone
                    ? "Completed"
                    : isActive
                    ? "Running..."
                    : "Pending"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
