"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import { useQrScan, useQrScanLogs, qrScanKeys } from "../qr-scan-api";
import type { QrScanResult, QrScanResultCode } from "../qr-scan-types";

type ScanType = "IN" | "OUT";

const RESULT_CONFIG: Record<QrScanResultCode, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  MARKED: { label: "Marked", color: "text-green-600", Icon: CheckCircle2 },
  ALREADY_MARKED: { label: "Already marked", color: "text-amber-600", Icon: Clock },
  NOT_FOUND: { label: "Not found", color: "text-red-600", Icon: XCircle },
  OUTSIDE_HOURS: { label: "Outside hours", color: "text-red-600", Icon: AlertCircle },
};

export function QrScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanType, setScanType] = useState<ScanType>("IN");
  const [lastResult, setLastResult] = useState<QrScanResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const scanMutation = useQrScan();
  const { data: logs } = useQrScanLogs();
  const queryClient = useQueryClient();

  // Cooldown to avoid duplicate scans of the same QR
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const processQrCode = useCallback(
    async (code: string) => {
      // UUID pattern check
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(code)) return;

      // Cooldown: skip if we just scanned this code
      if (lastScannedRef.current === code) return;
      lastScannedRef.current = code;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        lastScannedRef.current = "";
      }, 3000);

      setProcessing(true);
      try {
        const result = await scanMutation.mutateAsync({
          publicId: code,
          type: scanType,
        });
        setLastResult(result);
        void queryClient.invalidateQueries({ queryKey: qrScanKeys.logs });
      } catch {
        setLastResult({
          result: "NOT_FOUND",
          resolvedType: null,
          name: null,
          photoUrl: null,
          classLabel: null,
          designation: null,
          admissionNo: null,
          employeeNo: null,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setProcessing(false);
      }
    },
    [scanType, scanMutation, queryClient],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      scanningRef.current = true;

      // Use BarcodeDetector API if available
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const scanLoop = async () => {
          if (!scanningRef.current || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              await processQrCode(barcodes[0].rawValue);
            }
          } catch {
            // Detection failed, continue
          }
          if (scanningRef.current) {
            requestAnimationFrame(() => void scanLoop());
          }
        };
        void scanLoop();
      } else {
        // Fallback: use html5-qrcode from CDN
        await loadHtml5QrCodeFallback();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not access camera";
      setCameraError(msg);
    }
  }, [processQrCode]);

  const loadHtml5QrCodeFallback = useCallback(async () => {
    // Load the library dynamically from CDN
    if (!(window as any).Html5Qrcode) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load QR scanner library"));
        document.head.appendChild(script);
      });
    }

    // Use canvas-based scanning as fallback
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scanFrame = async () => {
      if (!scanningRef.current || !video.videoWidth) {
        if (scanningRef.current) requestAnimationFrame(() => void scanFrame());
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Use jsQR if available from the html5-qrcode bundle, otherwise just skip
        if ((window as any).jsQR) {
          const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            await processQrCode(code.data);
          }
        }
      } catch {
        // Detection failed, continue
      }
      if (scanningRef.current) {
        setTimeout(() => requestAnimationFrame(() => void scanFrame()), 200);
      }
    };
    void scanFrame();
  }, [processQrCode]);

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
      }
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const resultConfig = lastResult ? RESULT_CONFIG[lastResult.result] : null;

  return (
    <>
      <PageHeader title="QR Scan Attendance" description="Scan student or staff ID card QR codes to mark attendance." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner column */}
        <div className="space-y-4">
          {/* Scan type toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={scanType === "IN" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setScanType("IN")}
            >
              Check In
            </Button>
            <Button
              variant={scanType === "OUT" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setScanType("OUT")}
            >
              Check Out
            </Button>
          </div>

          {/* Camera area */}
          <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
                style={{ display: cameraActive ? "block" : "none" }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Camera className="size-12 text-muted-foreground" />
                  <Button variant="primary" onClick={() => void startCamera()}>
                    Start Camera
                  </Button>
                  {cameraError && <p className="text-sm text-error px-4 text-center">{cameraError}</p>}
                </div>
              )}

              {cameraActive && (
                <>
                  {/* Scan overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="size-48 rounded-xl border-2 border-white/70 shadow-lg" />
                  </div>
                  {processing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="rounded-lg bg-surface px-4 py-2 text-sm font-medium shadow-lg">Processing...</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {cameraActive && (
              <div className="flex justify-end border-t p-3">
                <Button variant="secondary" size="sm" onClick={stopCamera}>
                  Stop Camera
                </Button>
              </div>
            )}
          </Card>

          {/* Last scan result */}
          {lastResult && resultConfig && (
            <Card className="p-4">
              <div className="flex items-start gap-4">
                {lastResult.photoUrl ? (
                  <img
                    src={lastResult.photoUrl}
                    alt={lastResult.name ?? ""}
                    className="size-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted">
                    <resultConfig.Icon className={`size-8 ${resultConfig.color}`} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <resultConfig.Icon className={`size-5 ${resultConfig.color}`} />
                    <span className={`text-sm font-semibold ${resultConfig.color}`}>{resultConfig.label}</span>
                    {lastResult.resolvedType && (
                      <Badge tone="neutral" className="ml-1">
                        {lastResult.resolvedType}
                      </Badge>
                    )}
                  </div>
                  {lastResult.name && <p className="mt-1 text-base font-medium text-fg">{lastResult.name}</p>}
                  {lastResult.classLabel && <p className="text-sm text-muted-foreground">{lastResult.classLabel}</p>}
                  {lastResult.designation && <p className="text-sm text-muted-foreground">{lastResult.designation}</p>}
                  {lastResult.admissionNo && (
                    <p className="text-sm text-muted-foreground">Admission: {lastResult.admissionNo}</p>
                  )}
                  {lastResult.employeeNo && (
                    <p className="text-sm text-muted-foreground">Employee: {lastResult.employeeNo}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(lastResult.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Scan log column */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-fg">Recent Scans</h3>
          <Card>
            <div className="divide-y">
              {logs && logs.length > 0 ? (
                logs.map((log) => {
                  const cfg = RESULT_CONFIG[log.result as QrScanResultCode] ?? RESULT_CONFIG.NOT_FOUND;
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                      <cfg.Icon className={`size-4 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">
                          {log.resolvedName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.resolvedType ?? "---"} &middot; {cfg.label}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(log.scannedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No scans yet today. Start scanning QR codes to see results here.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
