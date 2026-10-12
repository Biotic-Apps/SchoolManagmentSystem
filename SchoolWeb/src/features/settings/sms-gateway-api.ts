import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { settingsKeys } from "./keys";

export interface SmsGatewayStatus {
  enabled: boolean;
  deviceId: string | null;
  pending: number;
  lastSentAt: string | null;
}

export function useSmsGatewayStatus(schoolId: string) {
  return useQuery({
    queryKey: settingsKeys.smsGateway(schoolId),
    queryFn: async () => (await http.get<SmsGatewayStatus>("/sms-gateway/status")).data,
    refetchInterval: 30_000, // poll every 30s
  });
}
