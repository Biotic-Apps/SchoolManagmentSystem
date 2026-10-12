import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { QrScanInput, QrScanLog, QrScanResult } from "./qr-scan-types";

export const qrScanKeys = {
  logs: ["attendance", "qr-scan-logs"] as const,
};

export function useQrScan() {
  return useApiMutation({
    mutationFn: async (input: QrScanInput) =>
      (await http.post<QrScanResult>("/attendance/qr-scan", input)).data,
    invalidate: [["attendance"]],
    toastError: false,
  });
}

export function useQrScanLogs() {
  return useQuery({
    queryKey: qrScanKeys.logs,
    queryFn: async () => (await http.get<QrScanLog[]>("/attendance/qr-scan/logs")).data,
    refetchInterval: 10_000,
  });
}
