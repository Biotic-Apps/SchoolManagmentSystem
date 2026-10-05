const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows/, "Windows"],
  [/Android/, "Android"],
  [/iPhone|iPad/, "iOS"],
  [/Mac OS X/, "macOS"],
  [/Linux/, "Linux"],
];

function pick(source: string, table: [RegExp, string][]): string | null {
  return table.find(([pattern]) => pattern.test(source))?.[1] ?? null;
}

/** Short label such as "Chrome on Windows" for the device sessions list. */
export function deviceName(userAgent: string | null): string {
  if (!userAgent) return "Web browser";
  const browser = pick(userAgent, BROWSERS) ?? "Web browser";
  const system = pick(userAgent, SYSTEMS);
  return system ? `${browser} on ${system}` : browser;
}
