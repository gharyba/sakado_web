import test from "node:test";
import assert from "node:assert/strict";
import { gsap } from "gsap";
import { createMediaContext } from "../src/lib/motion/media-context";

class Query extends EventTarget {
  matches = true;
  listeners = new Set<EventListenerOrEventListenerObject>();
  constructor(readonly media: string) {
    super();
  }
  override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === "change" && listener) this.listeners.add(listener);
    super.addEventListener(type, listener, options);
  }
  override removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) {
    if (type === "change" && listener) this.listeners.delete(listener);
    super.removeEventListener(type, listener, options);
  }
  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event("change"));
  }
}
function factory() {
  const queries: Query[] = [];
  return {
    queries,
    create: (media: string) => {
      const query = new Query(media);
      queries.push(query);
      return query as unknown as MediaQueryList;
    },
  };
}

test("media ownership reverts prior animations and ignores redundant query notifications", () => {
  const { queries, create } = factory();
  const media = createMediaContext(create);
  const target = { x: 0 };
  let starts = 0,
    cleanups = 0;
  media.add({ desktop: "desktop", all: "all" }, ({ conditions }) => {
    starts++;
    gsap.to(target, {
      x: conditions.desktop ? 100 : 50,
      duration: 10,
      paused: true,
    });
    return () => {
      cleanups++;
    };
  });
  assert.equal(starts, 1);
  queries[0].change(true);
  assert.equal(starts, 1);
  queries[0].change(false);
  assert.equal(starts, 2);
  assert.equal(cleanups, 1);
  assert.equal(gsap.getTweensOf(target).length, 1);
  media.revert();
  media.revert();
  assert.equal(cleanups, 2);
  assert.equal(queries[0].listeners.size, 0);
  assert.equal(gsap.getTweensOf(target).length, 0);
  assert.equal(target.x, 0);
});

test("disposing one media owner preserves unrelated active animations", () => {
  const firstFactory = factory(),
    secondFactory = factory();
  const first = createMediaContext(firstFactory.create),
    second = createMediaContext(secondFactory.create);
  const a = { x: 0 },
    b = { x: 0 };
  first.add({ desktop: "desktop" }, () => {
    gsap.to(a, { x: 1, paused: true });
  });
  second.add({ desktop: "desktop" }, () => {
    gsap.to(b, { x: 1, paused: true });
  });
  first.revert();
  assert.equal(gsap.getTweensOf(a).length, 0);
  assert.equal(gsap.getTweensOf(b).length, 1);
  assert.equal(firstFactory.queries[0].listeners.size, 0);
  assert.equal(secondFactory.queries[0].listeners.size, 1);
  second.revert();
  assert.equal(gsap.getTweensOf(b).length, 0);
});

test("inactive conditions and failed setup release owned subscriptions and partial tweens", () => {
  const { queries, create } = factory();
  const media = createMediaContext(create);
  const target = { x: 0 };
  assert.throws(
    () =>
      media.add({ desktop: "desktop" }, () => {
        gsap.to(target, { x: 1, paused: true });
        throw new Error("synthetic setup failure");
      }),
    /synthetic setup failure/,
  );
  assert.equal(queries[0].listeners.size, 0);
  assert.equal(gsap.getTweensOf(target).length, 0);
  media.revert();
  const next = factory();
  const inactive = createMediaContext((query) => {
    const list = next.create(query);
    next.queries.at(-1)!.matches = false;
    return list;
  });
  let starts = 0;
  inactive.add({ desktop: "desktop" }, () => {
    starts++;
  });
  assert.equal(starts, 0);
  next.queries[0].change(true);
  assert.equal(starts, 1);
  next.queries[0].change(false);
  assert.equal(gsap.getTweensOf(target).length, 0);
  inactive.revert();
  assert.equal(next.queries[0].listeners.size, 0);
});

test("nested media owners are disposed before their parent rebuilds", () => {
  const outerQueries = factory(),
    innerQueries = factory();
  const outer = createMediaContext(outerQueries.create);
  const targets: { x: number }[] = [];
  outer.add({ desktop: "desktop", all: "all" }, () => {
    const inner = createMediaContext(innerQueries.create);
    const target = { x: 0 };
    targets.push(target);
    inner.add({ tall: "tall", all: "all" }, () => {
      gsap.to(target, { x: 1, paused: true });
    });
    return () => inner.revert();
  });
  outerQueries.queries[0].change(false);
  assert.equal(innerQueries.queries[0].listeners.size, 0);
  assert.equal(innerQueries.queries[1].listeners.size, 1);
  assert.equal(gsap.getTweensOf(targets[0]).length, 0);
  assert.equal(gsap.getTweensOf(targets[1]).length, 1);
  outer.revert();
  assert.equal(innerQueries.queries[1].listeners.size, 0);
  assert.equal(gsap.getTweensOf(targets[1]).length, 0);
});

test("legacy MediaQueryList subscriptions are removed with the same callback", () => {
  const callbacks = new Set<unknown>();
  const media = createMediaContext(
    (query) =>
      ({
        media: query,
        matches: true,
        addListener: (callback: unknown) => callbacks.add(callback),
        removeListener: (callback: unknown) => callbacks.delete(callback),
      }) as unknown as MediaQueryList,
  );
  media.add({ desktop: "desktop" }, () => {});
  assert.equal(callbacks.size, 1);
  media.revert();
  assert.equal(callbacks.size, 0);
});
