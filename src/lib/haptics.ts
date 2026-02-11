/** Trigger a short haptic pulse if the device supports it. */
export function haptic(ms = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // Silently ignore — not all environments support vibrate
    }
  }
}

/** Haptic for round completion (longer pulse). */
export function hapticHeavy(): void {
  haptic(50);
}
