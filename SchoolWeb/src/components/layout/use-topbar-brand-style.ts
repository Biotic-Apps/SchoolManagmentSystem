import { useBranding } from "@/features/branding/api";
import { brandStyle } from "@/features/branding/brand-style";
import { useSessionSchoolId } from "@/features/branding/use-session-school-id";

export function useTopbarBrandStyle() {
  const { data: branding } = useBranding(useSessionSchoolId());
  return brandStyle(branding?.primaryColor);
}
