/** The curve between two stages; `useFlowScroll` draws it and moves the dot along it. */
export const ROW_PATH = "M6 60 C 70 6, 138 114, 202 60";

type RowConnectorProps = {
  pathRef: (node: SVGPathElement | null) => void;
  dotRef: (node: SVGGElement | null) => void;
};

/**
 * Connector between two stages in the row. The line is drawn by scroll and a
 * glowing dot rides its leading edge, so the message visibly travels from one
 * person to the next.
 */
export function RowConnector({ pathRef, dotRef }: RowConnectorProps) {
  return (
    <div
      aria-hidden
      className="flex w-24 shrink-0 items-center self-center xl:w-32"
    >
      <svg viewBox="0 0 208 120" className="h-auto w-full overflow-visible">
        <path
          d={ROW_PATH}
          fill="none"
          stroke="var(--color-brand-300)"
          strokeWidth="2"
          strokeDasharray="2 7"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          ref={pathRef}
          d={ROW_PATH}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        />
        <g ref={dotRef} transform="translate(6 60)" opacity="0">
          <circle r="11" fill="var(--color-brand-400)" opacity="0.25" />
          <circle
            r="5.5"
            fill="var(--color-brand-600)"
            stroke="white"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}
