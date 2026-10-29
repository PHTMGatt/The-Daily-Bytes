// Shares one pending promise per key so identical concurrent requests
// (e.g. several visitors loading the same feed after a cache expiry) cost a
// single provider call. The entry is removed as soon as the promise settles.
export class InflightRequests<T> {
  private readonly pending = new Map<string, Promise<T>>();

  run(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing;

    const promise = task().finally(() => {
      if (this.pending.get(key) === promise) this.pending.delete(key);
    });
    this.pending.set(key, promise);
    return promise;
  }

  get size() {
    return this.pending.size;
  }
}
