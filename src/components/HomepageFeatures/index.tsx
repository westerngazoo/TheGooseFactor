import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string; // path relative to static/img
  alt: string;
  caption?: string;
  link?: {
    url: string;
    external?: boolean;
  };
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'The Blog',
    image: 'laptopgoose.png',
    alt: 'Laptop goose typing blog posts',
    caption: 'Fresh posts & experiments',
    link: {url: '/blog'},
    description: (
      <>
        Thoughts, experiments, and updates from <strong>The Goose Factor</strong>.{' '}
        <Link to="/blog">Read the latest posts →</Link>
      </>
    ),
  },
  {
  title: 'C++ Algorithms',
    image: 'bookgoose.png',
    alt: 'Goose reading and writing a C++ algorithms book',
    caption: 'Modern C++ DS & Algos',
    link: {url: '/book'},
    description: (
      <>
        A living manuscript on modern C++ data structures, performance patterns,
        and algorithmic thinking. Benchmarks, invariants, and design trade‑offs
        included. <Link to="/book">Open draft →</Link>
      </>
    ),
  },
  {
    title: 'Embedded C++/Rust',
    image: 'gooseFactor.png',
    alt: 'Goose working with embedded hardware',
    caption: 'Dual-language embedded',
    link: {url: '/embedded-book'},
    description: (
      <>
        Side‑by‑side C++ and Rust on the same STM32 hardware. Drivers, RTOS,
        protocols, and real‑world projects compared.{' '}
        <Link to="/embedded-book">Explore →</Link>
      </>
    ),
  },
  {
    title: 'Systems Interview',
    image: 'sharpgoose.png',
    alt: 'Goose preparing for embedded systems interviews',
    caption: 'Interview prep & drills',
    link: {url: '/systems-interview'},
    description: (
      <>
        Targeted drills, labs, and checklists for embedded systems roles.
        C, C++, and Rust with side‑by‑side guidance.{' '}
        <Link to="/systems-interview">Start prep →</Link>
      </>
    ),
  },
  {
    title: 'Math & Physics',
    image: 'mathgoose.png',
    alt: 'Analytical goose surrounded by equations',
    caption: 'Derivations & intuition',
    link: {url: '/math'},
    description: (
      <>
        High‑impact notes: discrete math, combinatorics, probability, linear
        algebra, modeling & physical intuition feeding algorithm design.{' '}
        <Link to="/math">Dive in →</Link>
      </>
    ),
  },
  {
  title: 'Sci‑Fi Novel',
    image: 'newtongoose.png',
    alt: 'Goose exploring a neon techno sci-fi world',
    caption: 'Worldbuilding & lore',
    link: {url: '/scifi'},
    description: (
      <>
        Experimental sci‑fi universe: fragments, character sketches, and tech
        lore drops. Separate from the C++ book—storytelling in progress.
        <br />
        <em>Coming soon.</em>
      </>
    ),
  },
  {
    title: 'Poems',
    image: 'surprisedgoose.png',
    alt: 'Goose writing poetry',
    caption: 'Verse & experiments',
    link: {url: '/poems'},
    description: (
      <>
        A small corner for verse—short pieces, drafts, and experiments.{' '}
        <Link to="/poems">Read →</Link>
      </>
    ),
  },
  {
    title: 'Collaboration',
    image: 'surfingoose.png',
    alt: 'Surfing goose navigating collaborative open source waves',
    caption: 'Contribute & connect',
    link: {url: 'https://github.com/westerngazoo', external: true},
    description: (
      <>
        Explore & contribute: {' '}
        <Link href="https://github.com/westerngazoo" rel="noopener noreferrer" target="_blank">GitHub @westerngazoo</Link>. Updates on{' '}
        <Link href="https://x.com/theg00sefactor" rel="noopener noreferrer" target="_blank">X @theg00sefactor</Link>.
      </>
    ),
  },
];

function Feature({title, image, alt, caption, link, description}: FeatureItem) {
  const figure = (
    <figure className={styles.figure}>
      <img
        src={`img/${image}`}
        alt={alt}
        className={styles.featureImg}
        loading="lazy"
      />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );

  const cardContent = (
    <div className={clsx('card', styles.featureCard)}>
      <div className={clsx('card__image', 'text--center', styles.imageWrap)}>
        {figure}
      </div>
      <div className={clsx('card__body', 'text--center', styles.cardBody)}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );

  return (
    <div className={clsx('col col--3 col--6--md col--12--sm')}>
      {link ? (
        link.external ? (
          <a href={link.url} rel="noopener noreferrer" target="_blank" className={styles.cardLink}>
            {cardContent}
          </a>
        ) : (
          <Link to={link.url} className={styles.cardLink}>
            {cardContent}
          </Link>
        )
      ) : (
        cardContent
      )}
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
