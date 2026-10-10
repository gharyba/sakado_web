import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Button,
  ButtonLink,
  Container,
  MediaFrame,
  Section,
} from "@/components/ui/foundation";
import { Motion } from "@/components/motion/motion";
import { MotionScene } from "@/components/motion/scene";
import { MotionToggle } from "@/components/motion/preference";
import { motionDemoEnabled } from "@/lib/motion/policy";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Laboratoire de mouvement — développement",
  robots: { index: false, follow: false, noarchive: true },
};

export default function MotionDemo() {
  if (!motionDemoEnabled(process.env.NODE_ENV)) notFound();
  return (
    <main className={`s-foundation ${styles.lab}`} id="motion-lab">
      <a className={styles.skip} href="#experiments">
        Aller aux expériences
      </a>
      <Section>
        <Container className="s-stack">
          <p className="s-eyebrow">SAKADO · laboratoire technique · Phase 01</p>
          <h1 className="s-title">
            Matière, espace
            <br />
            et mouvement.
          </h1>
          <p className="s-lead">
            Une page de développement pour vérifier les primitives visuelles.
            Les formes et images sont des essais, pas des contenus Sakado
            approuvés.
          </p>
          <MotionToggle />
          <nav aria-label="Expériences" className="s-cluster">
            <ButtonLink href="#layers" variant="secondary">
              Profondeur
            </ButtonLink>
            <ButtonLink href="#reveals" variant="secondary">
              Révélations
            </ButtonLink>
            <ButtonLink href="#pin" variant="secondary">
              Séquence fixe
            </ButtonLink>
            <ButtonLink href="/" variant="text">
              Accueil existant
            </ButtonLink>
          </nav>
          <div className="s-cluster" aria-label="Variantes de boutons">
            <Button>Action témoin</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button disabled>Indisponible</Button>
          </div>
        </Container>
      </Section>
      <div id="experiments">
        <Section id="layers" tone="dark">
          <Container className="s-stack">
            <h2 className="s-heading">01 / Plans indépendants</h2>
            <p className="s-lead">
              Fond et premier plan décoratifs. Le texte reste stable et lisible.
            </p>
            <MotionScene>
              <div className={styles.depth}>
                <Motion
                  effect="background"
                  className={`${styles.back} s-motion-layer`}
                  aria-hidden="true"
                >
                  <span />
                </Motion>
                <div className={styles.depthLabel}>
                  <span className="s-eyebrow">Étude abstraite</span>
                  <p className="s-heading">
                    Du relief,
                    <br />
                    sans détour.
                  </p>
                </div>
                <Motion
                  effect="foreground"
                  distance={-100}
                  className={`${styles.front} s-motion-layer`}
                  aria-hidden="true"
                >
                  <span />
                </Motion>
              </div>
            </MotionScene>
          </Container>
        </Section>
        <Section id="reveals">
          <Container>
            <MotionScene className={styles.grid}>
              <div className="s-stack">
                <p className="s-eyebrow">02 / Apparitions mesurées</p>
                <Motion effect="reveal">
                  <h2 className="s-heading">
                    Le contenu
                    <br />
                    précède l’effet.
                  </h2>
                </Motion>
                <Motion effect="reveal">
                  <p className="s-lead">
                    Une entrée courte, une seule fois. Sur mobile, seule
                    l’opacité évolue. Sans JavaScript, tout est déjà présent.
                  </p>
                </Motion>
                <p className="s-caption">
                  Image SVG existante, utilisée comme simple témoin technique.
                </p>
              </div>
              <Motion effect="image">
                <MediaFrame ratio="portrait">
                  <Image
                    src="/images/trail.svg"
                    alt="Illustration de paysage fictif servant uniquement au test visuel"
                    width={800}
                    height={1000}
                    sizes="(min-width: 900px) 45vw, 90vw"
                  />
                </MediaFrame>
              </Motion>
            </MotionScene>
          </Container>
        </Section>
        <Section tone="muted" id="transition">
          <Container className="s-stack">
            <h2 className="s-heading">03 / Transition de section</h2>
            <p className="s-lead">
              Une surface traverse légèrement son cadre. Aucun texte ni contrôle
              ne se déplace avec elle.
            </p>
            <MotionScene>
              <div className={styles.transitionFrame}>
                <Motion
                  effect="transition"
                  aria-hidden="true"
                  className={`${styles.transitionSurface} s-motion-layer`}
                />
              </div>
            </MotionScene>
          </Container>
        </Section>
        <Section id="pin">
          <Container className="s-stack">
            <h2 className="s-heading">04 / Pause dans le récit</h2>
            <p className="s-lead">
              Fixation courte sur grand écran, avec espace réservé. Lecture
              normale sur tablette, mobile, fenêtre basse ou mouvement réduit.
            </p>
            <MotionScene>
              <Motion effect="pin" className={styles.pinPanel}>
                <p className="s-eyebrow">Séquence témoin</p>
                <p className="s-heading">
                  Le défilement
                  <br />
                  vous appartient.
                </p>
              </Motion>
            </MotionScene>
          </Container>
        </Section>
        <Section tone="dark">
          <Container className="s-stack">
            <h2 className="s-heading">Fin des essais.</h2>
            <p className="s-lead">
              Ni héros réel, ni galerie cinématique, ni modification des
              données. Identité visuelle et références officielles : TO BE
              CONFIRMED.
            </p>
            <ButtonLink href="#motion-lab" variant="secondary">
              Retour au début
            </ButtonLink>
          </Container>
        </Section>
      </div>
    </main>
  );
}
