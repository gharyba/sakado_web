import { gsap } from "gsap";

type QueryFactory = (query: string) => MediaQueryList;

/** Own native subscriptions explicitly; GSAP still owns every animation/revert. */
export function createMediaContext(
  matchMedia: QueryFactory = (query) => window.matchMedia(query),
) {
  const disposers = new Set<() => void>();
  let reverted = false;
  const owner = {
    add<Key extends string>(
      queries: Record<Key, string>,
      setup: (match: {
        conditions: Record<Key, boolean>;
      }) => void | (() => void),
      scope?: Element,
    ) {
      if (reverted)
        throw new Error("A disposed media context cannot register queries.");
      const keys = Object.keys(queries) as Key[];
      const lists = new Map<Key, MediaQueryList>();
      const unsubscribe: (() => void)[] = [];
      let conditions: Record<Key, boolean> | undefined;
      let context: gsap.Context | undefined;
      let closed = false;
      const dispose = () => {
        if (closed) return;
        closed = true;
        unsubscribe.splice(0).forEach((remove) => remove());
        lists.clear();
        context?.revert();
        context = undefined;
        disposers.delete(dispose);
      };
      const refresh = () => {
        if (closed) return;
        const next = Object.fromEntries(
          keys.map((key) => [key, key === "all" || lists.get(key)!.matches]),
        ) as Record<Key, boolean>;
        if (conditions && keys.every((key) => conditions![key] === next[key]))
          return;
        conditions = next;
        context?.revert();
        context = undefined;
        if (!keys.some((key) => next[key])) return;
        let failed = false;
        let failure: unknown;
        gsap.context((current) => {
          context = current;
          // Let GSAP restore its current-context stack even when setup throws.
          try {
            return setup({ conditions: next });
          } catch (error) {
            failed = true;
            failure = error;
          }
        }, scope);
        if (failed) {
          dispose();
          throw failure;
        }
      };
      disposers.add(dispose);
      try {
        for (const key of keys) {
          if (key === "all") continue;
          const list = matchMedia(queries[key]);
          lists.set(key, list);
          if (typeof list.addEventListener === "function") {
            list.addEventListener("change", refresh);
            unsubscribe.push(() => list.removeEventListener("change", refresh));
          } else {
            list.addListener(refresh);
            unsubscribe.push(() => list.removeListener(refresh));
          }
        }
        refresh();
      } catch (error) {
        dispose();
        throw error;
      }
      return owner;
    },
    revert() {
      if (reverted) return;
      reverted = true;
      [...disposers].forEach((dispose) => dispose());
    },
  };
  return owner;
}
