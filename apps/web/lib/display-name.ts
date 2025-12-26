export function getDisplayName(
  profile:
    | { callsign?: string | null; display_name?: string | null }
    | null
    | undefined,
  fallback: string = "User"
): string {
  if (!profile) return fallback;

  if (profile.display_name) {
    return profile.callsign
      ? `${profile.display_name} (${profile.callsign})`
      : profile.display_name;
  }

  return profile.callsign || fallback;
}
