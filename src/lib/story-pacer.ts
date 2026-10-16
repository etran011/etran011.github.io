/** A bounded visual timeline. It never changes the document's scroll position. */
export function createStoryPacer(steps: number, initial = 0) {
  let value = initial;
  let velocity = 0;
  const maximumSpeed = 2.6 / Math.max(1, steps - 1);
  return {
    snap(target: number) { value = target; velocity = 0; return value; },
    advance(target: number, elapsed: number) {
      // A resumed/background frame must not jump over the entire narrative.
      const seconds = Math.min(48, Math.max(0, elapsed)) / 1000;
      const error = target - value;
      const desired = Math.max(-maximumSpeed, Math.min(maximumSpeed, error * 12));
      velocity += (desired - velocity) * (1 - Math.exp(-seconds / 0.055));
      const next = value + velocity * seconds;
      if ((target - next) * error <= 0 || (Math.abs(error) < 0.0002 && Math.abs(velocity) < 0.002)) return this.snap(target);
      value = Math.max(0, Math.min(1, next));
      return value;
    },
  };
}
