import { MotionScene } from "@/components/motion/scene";
import styles from "./ambient-background.module.css";

/** Decoration only; the shared scene owns preferences, loading and cleanup. */
export function AmbientBackground() {
  return (
    <MotionScene
      className={styles.ambient}
      data-ambient-background
      aria-hidden="true"
    >
      <div className={styles.sapphire} data-ambient-plane="sapphire" />
      <div className={styles.indigo} data-ambient-plane="indigo" />
      <div className={styles.dusk} data-ambient-plane="dusk" />
      <div className={styles.halo} data-ambient-pointer="halo" />
      <div className={styles.spark} data-ambient-pointer="spark" />
    </MotionScene>
  );
}
