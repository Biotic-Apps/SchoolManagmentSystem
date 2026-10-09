import type { SkillScaleLevel } from "../../skill-types";

/** "A Excellent · B Very good …" under the grid and on result cards. */
export function SkillScaleLegend({ scale }: { scale: SkillScaleLevel[] }) {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-fg-muted">
      {scale.map((level) => (
        <span key={level.value}>
          <span className="font-semibold text-fg">{level.code}</span> {level.label}
        </span>
      ))}
    </p>
  );
}
