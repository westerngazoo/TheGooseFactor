import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// Mirror of the books array in docusaurus.config.ts.
// Keep in sync when adding/removing a book.
const BOOKS = [
  {label: 'C++ Algorithms',     to: '/book'},
  {label: 'C Algorithms',       to: '/c-algorithms'},
  {label: 'Embedded C++/Rust',  to: '/embedded-book'},
  {label: 'GooseOS',            to: '/goose-os'},
  {label: 'OS Compared',        to: '/os-compared'},
  {label: 'Systems Interview',  to: '/systems-interview'},
  {label: 'Math Basics',        to: '/math'},
  {label: 'Physics Basics',     to: '/physics'},
  {label: 'Geometric Algebra',  to: '/geometric-algebra'},
  {label: 'Sci-Fi Novel',       to: '/scifi'},
  {label: 'Poems',              to: '/poems'},
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={clsx('hero__title', styles.heroTitleHacker)}>
          Entering The Goose zone
        </Heading>
  <p className={clsx('hero__subtitle', styles.heroSubtitleAdjust)} aria-label="Beware of the quack!">
          <span className={styles.typingWrapper}>
      <span className={styles.typingText}>Beware of the ...</span>
          </span>
          <span className={styles.impactQuack} aria-hidden="true">QUACK!</span>
        </p>
        <div className={styles.buttons}>
          <Link className={clsx('button button--lg', styles.heroButton)} to="/blog">
            Read the Blog
          </Link>
          <a className={clsx('button button--lg margin--sm', styles.heroButton)} href="#books">
            Books
          </a>
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/math">
            Math & Physics
          </Link>
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/apps">
            Goose Apps
          </Link>
        </div>
      </div>
    </header>
  );
}

function BooksMenu() {
  return (
    <section id="books" className={styles.booksSection}>
      <div className="container">
        <Heading as="h2" className={styles.booksTitle}>
          The Books
        </Heading>
        <p className={styles.booksSubtitle}>
          Living manuscripts. Algorithms, systems, math, hardware, fiction.
        </p>
        <div className={styles.booksGrid}>
          {BOOKS.map(b => (
            <Link key={b.to} to={b.to} className={clsx('button', styles.bookButton)}>
              {b.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="The Goose Zone"
      description="You're entering the Goose Zone – beware of the quack.">
      <HomepageHeader />
      <main>
        <BooksMenu />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
