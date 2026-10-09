import { Icon } from "./icon";
export function InstagramPreview({
  url,
  handle,
  followers,
  posts,
}: {
  url: string;
  handle: string;
  followers: string | null;
  posts: string | null;
}) {
  return (
    <section className="social-section">
      <div className="container social-inner">
        <div className="social-symbol">
          <Icon name="instagram" size={42} />
        </div>
        <div>
          <p className="eyebrow">LE RENDEZ-VOUS CONTINUE</p>
          <h2>Suivez l’aventure.</h2>
          <p>
            Les nouvelles sorties, les instants partagés et la vie de Sakado.
            <br />
            Retrouvez-nous sur Instagram <strong>{handle}</strong>.
          </p>
          {(followers || posts) && (
            <p>{[followers, posts].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        <a
          className="button button-light"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Suivre sur Instagram <Icon />
        </a>
      </div>
    </section>
  );
}
