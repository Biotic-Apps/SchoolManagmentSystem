/**
 * `From` header: the address of EMAIL_FROM (`Name <addr>` or a bare address)
 * with the school's display name when one is set. Quotes and angle brackets
 * are stripped from the name so it cannot inject another address.
 */
export function emailFrom(
  configured: string,
  fromName?: string | null,
): string {
  const match = /^(.*)<([^<>]+)>\s*$/.exec(configured.trim());
  const address = (match ? match[2] : configured).trim();
  const defaultName = match ? match[1].trim().replace(/^"|"$/g, '') : '';
  const name = (fromName?.trim() || defaultName).replace(/["<>\r\n]/g, '');
  return name ? `"${name}" <${address}>` : address;
}
