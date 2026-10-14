import type { ComponentType } from "react";
import { Certificate, CERT_SIZE } from "./Certificate";
import { FeeChallan, CHALLAN_SIZE } from "./FeeChallan";
import { IdCard, ID_SIZE } from "./IdCard";
import { ReportCard, REPORT_SIZE } from "./ReportCard";

export type DocId = "report" | "challan" | "certificate" | "id";

type Pose = { x: number; y: number; rotate: number };

export type DocEntry = {
  id: DocId;
  w: number;
  h: number;
  Doc: ComponentType;
  /** Where it rests while still a loose pile, before the section is seen. */
  stack: Pose;
  /** Where it settles once the pile spreads into a fan. Offsets from the stage centre. */
  fan: Pose;
};

/** The size of the fan stage; it is scaled down as a whole on narrower screens. */
export const FAN_STAGE = { w: 820, h: 640 } as const;

/** Back to front: the order is also the resting stacking order. */
export const DOCS: DocEntry[] = [
  { id: "report", ...REPORT_SIZE, Doc: ReportCard, stack: { x: -14, y: 10, rotate: -4 }, fan: { x: -225, y: 0, rotate: -8 } },
  { id: "challan", ...CHALLAN_SIZE, Doc: FeeChallan, stack: { x: 4, y: -4, rotate: 2 }, fan: { x: 80, y: -140, rotate: 4 } },
  { id: "certificate", ...CERT_SIZE, Doc: Certificate, stack: { x: 10, y: 6, rotate: -1 }, fan: { x: 50, y: 150, rotate: -3 } },
  { id: "id", ...ID_SIZE, Doc: IdCard, stack: { x: -2, y: -8, rotate: 5 }, fan: { x: 300, y: 30, rotate: 8 } },
];
