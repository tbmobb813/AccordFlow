export function clsx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(' ');
}

export default { clsx };
