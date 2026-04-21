import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

type AppCard = {
  title: string;
  emoji: string;
  description: string;
  link: string;
  tags: string[];
};

const apps: AppCard[] = [
  {
    title: 'Calorie Calculator',
    emoji: '\u{1F525}',
    description:
      'TDEE, macros by time window, Keto and Mixed Diet modes. Synced with the Goose Method.',
    link: '/apps/calorie-calculator',
    tags: ['Nutrition', 'Macros', 'TDEE'],
  },
  {
    title: 'Routine Generator',
    emoji: '\u{1F4AA}',
    description:
      'Generate your week under the Goose Method constraints: CNS cost, PAP supersets, undulating recovery.',
    link: '/apps/routine-generator',
    tags: ['Training', 'Goose Method', 'PAP'],
  },
  {
    title: 'Session Builder',
    emoji: '\u{1F3AF}',
    description:
      "Cherry-pick today's workout — pick muscle groups and intensity on the fly, with live Goose Method validation.",
    link: '/apps/session-builder',
    tags: ['Training', 'Today', 'Ad-hoc'],
  },
  {
    title: 'Progress Tracker',
    emoji: '\u{1F4C8}',
    description:
      'Daily log for workouts, diet, and body metrics. Sign in with Google; data is private to your account.',
    link: '/apps/progress-tracker',
    tags: ['Logging', 'Google Auth', 'Supabase'],
  },
];

function AppCardComponent({title, emoji, description, link, tags}: AppCard) {
  return (
    <div className={clsx('col col--6')}>
      <Link to={link} className={styles.cardLink}>
        <div className={clsx('card', styles.appCard)}>
          <div className={styles.cardEmoji}>{emoji}</div>
          <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
          <p className={styles.cardDesc}>{description}</p>
          <div className={styles.tagRow}>
            {tags.map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function AppsIndex(): ReactNode {
  return (
    <Layout title="Apps" description="Interactive tools from the Goose Method">
      <header className={styles.header}>
        <div className="container">
          <img
            src="/img/weightliftinggoose.png"
            alt="Goose lifting weights"
            className={styles.heroImg}
          />
          <Heading as="h1" className={styles.heroTitle}>
            Goose Apps
          </Heading>
          <p className={styles.heroSub}>
            Interactive tools powered by the <strong>Goose Method</strong>.
            Calorie calculator, routine generator and more.
          </p>
        </div>
      </header>
      <main className="container">
        <div className={clsx('row', styles.grid)}>
          {apps.map((app) => (
            <AppCardComponent key={app.title} {...app} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
