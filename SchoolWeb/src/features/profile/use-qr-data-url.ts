import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Renders the otpauth:// URL to a PNG data URL in the browser; the secret never leaves the page. */
export function useQrDataUrl(text: string | null) {
  const [result, setResult] = useState<{ text: string; url: string } | null>(null);

  useEffect(() => {
    if (!text) return;
    let active = true;
    QRCode.toDataURL(text, { margin: 1, width: 192, errorCorrectionLevel: "M" })
      .then((url) => active && setResult({ text, url }))
      .catch(() => active && setResult(null));
    return () => {
      active = false;
    };
  }, [text]);

  return result && result.text === text ? result.url : null;
}
