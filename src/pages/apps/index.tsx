import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

type AppCard = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  link: string;
  tags: string[];
};

// Strings are wrapped in translate() at call time so the current locale resolves
// per render. The English `message` is the source string.
function getApps(): AppCard[] {
  return [
    {
      id: 'calorie-calculator',
      title: translate({id: 'apps.index.calorieCalculator.title', message: 'Calorie Calculator'}),
      emoji: '\u{1F525}',
      description: translate({
        id: 'apps.index.calorieCalculator.desc',
        message: 'TDEE, macros by time window, Keto and Mixed Diet modes. Synced with the Goose Method.',
      }),
      link: '/apps/calorie-calculator',
      tags: [
        translate({id: 'apps.index.tag.nutrition', message: 'Nutrition'}),
        translate({id: 'apps.index.tag.macros', message: 'Macros'}),
        translate({id: 'apps.index.tag.tdee', message: 'TDEE'}),
      ],
    },
    {
      id: 'routine-generator',
      title: translate({id: 'apps.index.routineGenerator.title', message: 'Routine Generator'}),
      emoji: '\u{1F4AA}',
      description: translate({
        id: 'apps.index.routineGenerator.desc',
        message: 'Generate your week under the Goose Method constraints: CNS cost, PAP supersets, undulating recovery.',
      }),
      link: '/apps/routine-generator',
      tags: [
        translate({id: 'apps.index.tag.training', message: 'Training'}),
        translate({id: 'apps.index.tag.gooseMethod', message: 'Goose Method'}),
        translate({id: 'apps.index.tag.pap', message: 'PAP'}),
      ],
    },
    {
      id: 'session-builder',
      title: translate({id: 'apps.index.sessionBuilder.title', message: 'Session Builder'}),
      emoji: '\u{1F3AF}',
      description: translate({
        id: 'apps.index.sessionBuilder.desc',
        message: "Cherry-pick today's workout — pick muscle groups and intensity on the fly, with live Goose Method validation.",
      }),
      link: '/apps/session-builder',
      tags: [
        translate({id: 'apps.index.tag.training', message: 'Training'}),
        translate({id: 'apps.index.tag.today', message: 'Today'}),
        translate({id: 'apps.index.tag.adhoc', message: 'Ad-hoc'}),
      ],
    },
    {
      id: 'phased-builder',
      title: translate({id: 'apps.index.phasedBuilder.title', message: 'Phased Builder'}),
      emoji: '\u{1F525}',
      description: translate({
        id: 'apps.index.phasedBuilder.desc',
        message: 'Build your session in 5 phases — warm-up circuit, multi-joint compound, heavy strength, hypertrophy, pump. Each phase narrows the next.',
      }),
      link: '/apps/phased-builder',
      tags: [
        translate({id: 'apps.index.tag.training', message: 'Training'}),
        translate({id: 'apps.index.tag.phased', message: 'Phased'}),
        translate({id: 'apps.index.tag.adaptive', message: 'Adaptive'}),
      ],
    },
    {
      id: 'progress-tracker',
      title: translate({id: 'apps.index.progressTracker.title', message: 'Progress Tracker'}),
      emoji: '\u{1F4C8}',
      description: translate({
        id: 'apps.index.progressTracker.desc',
        message: 'Daily log for workouts, diet, and body metrics. Sign in with Google; data is private to your account.',
      }),
      link: '/apps/progress-tracker',
      tags: [
        translate({id: 'apps.index.tag.logging', message: 'Logging'}),
        translate({id: 'apps.index.tag.googleAuth', message: 'Google Auth'}),
        translate({id: 'apps.index.tag.supabase', message: 'Supabase'}),
      ],
    },
    {
      id: 'exercise-library',
      title: translate({id: 'apps.index.exerciseLibrary.title', message: 'Exercise Library'}),
      emoji: '\u{1F4DA}',
      description: translate({
        id: 'apps.index.exerciseLibrary.desc',
        message: 'Every exercise in the database — search and filter by muscle, category, phase, equipment. Anatomy preview + YouTube tutorial per move.',
      }),
      link: '/apps/exercise-library',
      tags: [
        translate({id: 'apps.index.tag.reference', message: 'Reference'}),
        translate({id: 'apps.index.tag.filterable', message: 'Filterable'}),
        translate({id: 'apps.index.tag.anatomy', message: 'Anatomy'}),
      ],
    },
  ];
}

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
  const apps = getApps();
  return (
    <Layout
      title={translate({id: 'apps.index.layout.title', message: 'Apps'})}
      description={translate({id: 'apps.index.layout.description', message: 'Interactive tools from the Goose Method'})}>
      <header className={styles.header}>
        <div className="container">
          <img
            src="/img/weightliftinggoose.png"
            alt={translate({id: 'apps.index.heroAlt', message: 'Goose lifting weights'})}
            className={styles.heroImg}
          />
          <Heading as="h1" className={styles.heroTitle}>
            <Translate id="apps.index.heroTitle">Goose Apps</Translate>
          </Heading>
          <p className={styles.heroSub}>
            <Translate
              id="apps.index.heroSub"
              values={{methodName: <strong key="m">{translate({id: 'apps.index.gooseMethod', message: 'Goose Method'})}</strong>}}
            >
              {'Interactive tools powered by the {methodName}. Calorie calculator, routine generator and more.'}
            </Translate>
          </p>
        </div>
      </header>
      <main className="container">
        <div className={clsx('row', styles.grid)}>
          {apps.map((app) => (
            <AppCardComponent key={app.id} {...app} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
