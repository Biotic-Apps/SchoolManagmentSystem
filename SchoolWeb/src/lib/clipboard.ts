/**
 * Copies text. The Clipboard API only exists on secure origins (https or
 * localhost), so on a LAN address like http://192.168.x.x we fall back to a
 * hidden textarea + execCommand. The textarea goes next to the focused
 * element so it stays inside an open dialog's focus trap.
 */
export async function copyText(text: string): Promise<void> {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission denied or document not focused: try the fallback.
    }
  }
  const active = document.activeElement as HTMLElement | null;
  const host = active?.parentElement ?? document.body;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
  host.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  active?.focus();
  if (!ok) throw new Error("copy failed");
}
