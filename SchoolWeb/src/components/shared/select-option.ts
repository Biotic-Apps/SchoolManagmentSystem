import type { Option } from "./OptionSelect";

/** Option with an optional list-only hint ("24/30 periods") and a muted look (e.g. busy teacher). */
export interface HintedOption extends Option {
  hint?: string;
  muted?: boolean;
}
