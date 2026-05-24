import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={clsx('hero__title', styles.heroTitleHacker)}>
          <Translate id="home.hero.title">Entering The Goose zone</Translate>
        </Heading>
        <p
          className={clsx('hero__subtitle', styles.heroSubtitleAdjust)}
          aria-label={translate({id: 'home.hero.aria', message: 'Beware of the quack!'})}
        >
          <span className={styles.typingWrapper}>
            <span className={styles.typingText}>
              <Translate id="home.hero.typing">Beware of the ...</Translate>
            </span>
          </span>
          <span className={styles.impactQuack} aria-hidden="true">QUACK!</span>
        </p>
        <div className={styles.buttons}>
          <Link className={clsx('button button--lg', styles.heroButton)} to="/blog">
            <Translate id="home.hero.readBlog">Read the Blog</Translate>
          </Link>
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/book">
            <Translate id="home.hero.cppAlgorithms">C++ Algorithms</Translate>
          </Link>
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/math">
            <Translate id="home.hero.mathPhysics">Math &amp; Physics</Translate>
          </Link>
          <Link className={clsx('button button--lg margin--sm', styles.heroButton)} to="/apps">
            <Translate id="home.hero.gooseApps">Goose Apps</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({id: 'home.layout.title', message: 'The Goose Zone'})}
      description={translate({id: 'home.layout.description', message: "You're entering the Goose Zone – beware of the quack."})}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
