import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

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
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/book">
            C++ Algorithms
          </Link>
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/math">
            Math & Physics
          </Link>
        </div>
      </div>
    </header>
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
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
