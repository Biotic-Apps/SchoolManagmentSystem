import type { Option } from "@/components/shared/OptionSelect";
import { useFeeHeads } from "./structure-api";

/** Fee heads of a school as select options, "Tuition (TUITION)". */
export function useFeeHeadOptions(schoolId: string | null): Option[] {
  const heads = useFeeHeads(schoolId);
  return (heads.data ?? []).map((head) => ({ id: head.id, name: `${head.name} (${head.code})` }));
}
