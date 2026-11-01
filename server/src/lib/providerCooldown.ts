/**
 * Tracks a short pause on an upstream provider after it fails, so a rate-limited
 * or down provider is not hit again by every incoming request.
 */
export class ProviderCooldown {
  private openUntil = 0;
  private consecutiveFailures = 0;

  constructor(
    private readonly baseMs: number,
    private readonly maxMs: number,
  ) {}

  /** Milliseconds remaining in the cooldown, or 0 when requests may proceed. */
  remaining(now = Date.now()): number {
    return Math.max(0, this.openUntil - now);
  }

  isOpen(now = Date.now()): boolean {
    return this.remaining(now) > 0;
  }

  /** Starts (or extends) a cooldown; each consecutive failure doubles it up to maxMs. */
  recordFailure(now = Date.now()): number {
    const duration = Math.min(this.maxMs, this.baseMs * 2 ** this.consecutiveFailures);
    this.consecutiveFailures += 1;
    this.openUntil = now + duration;
    return duration;
  }

  recordSuccess() {
    this.consecutiveFailures = 0;
    this.openUntil = 0;
  }
}
