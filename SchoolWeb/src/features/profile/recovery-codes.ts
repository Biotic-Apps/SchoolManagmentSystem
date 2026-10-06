export function recoveryCodesText(codes: string[], account: string): string {
  return [
    `eSchool recovery codes for ${account}`,
    "Each code works once. Keep them somewhere safe.",
    "",
    ...codes,
    "",
  ].join("\n");
}

export function downloadTextFile(fileName: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Groups a base32 secret in fours for manual entry. */
export function groupSecret(secret: string): string {
  return secret.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}
