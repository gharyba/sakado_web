/** Pure spatial math; no media selection, browser APIs or business rules. */
export function wrapPhoto(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

export function photoOffset(index: number, active: number, count: number) {
  const forward = wrapPhoto(index - active, count);
  return forward > count / 2 ? forward - count : forward;
}

/** Unwrap against the journey midpoint so either direction admits its rear edge. */
export function orbitTransitionOffset(
  index: number,
  from: number,
  delta: number,
  count: number,
) {
  return photoOffset(index, from + delta / 2, count) + delta / 2;
}

export function orbitWindow(count: number, active: number, limit = 7) {
  return Array.from({ length: Math.min(count, limit) }, (_, position) =>
    wrapPhoto(
      active + position - Math.floor(Math.min(count, limit) / 2),
      count,
    ),
  );
}

export function orbitPose(offset: number, count: number, limit = 7) {
  const angle = (offset * Math.PI * 2) / Math.min(count || 1, 8);
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);
  // All panels sample one elliptical orbit with a harmonic rise. The front is z=0.
  const x = sine;
  const y = -0.45 * (1 - cosine) + Math.sin(angle * 2) * 0.35;
  const z = cosine - 1;
  const edge =
    count > limit
      ? Math.max(0, Math.min(1, (limit + 1) / 2 - Math.abs(offset)))
      : 1;
  return {
    transform: `translate3d(calc(var(--orbit-radius) * ${x.toFixed(5)}), calc(var(--orbit-rise) * ${y.toFixed(5)}), calc(var(--orbit-depth) * ${z.toFixed(5)})) rotateY(${(-sine * 32).toFixed(3)}deg) rotateX(${(sine * 7).toFixed(3)}deg) rotateZ(${(sine * 4).toFixed(3)}deg)`,
    opacity: edge * (0.48 + 0.52 * ((cosine + 1) / 2)),
  };
}
