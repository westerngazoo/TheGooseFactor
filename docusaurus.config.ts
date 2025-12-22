import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import gooseReactions from './src/remark/gooseReactions';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'The Goose Factor',
  tagline: 'Code, Writing, and Open Source Flight',
  favicon: 'img/goosefactorcloseup.png',
  future: { v4: true },
  url: 'https://thegoosefactor.netlify.app',
  baseUrl: '/',
  trailingSlash: false,
  organizationName: 'westerngazoo',
  projectName: 'the-goose-factor',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          remarkPlugins: [gooseReactions, remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
            showReadingTime: true,
            feedOptions: { type: ['rss', 'atom'], xslt: true },
            editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
            remarkPlugins: [gooseReactions, remarkMath],
            rehypePlugins: [rehypeKatex],
        },
        pages: { remarkPlugins: [gooseReactions, remarkMath], rehypePlugins: [rehypeKatex] },
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],
  plugins: [
    function gooseAll(){
      return {
        name: 'goose-reactions-inline',
        configureMarkdown(md){
          md.remarkPlugins = [...(md.remarkPlugins||[]), gooseReactions, remarkMath];
          md.rehypePlugins = [...(md.rehypePlugins || []), rehypeKatex];
        }
      };
    }
  ],
  themeConfig: {
    image: 'img/goosefactorcloseup.png',
    navbar: {
      title: 'The Goose Factor',
      logo: { alt: 'Goose Logo', src: 'img/gooseFactor.png' },
      items: [
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/book', label: 'C++ Algorithms', position: 'left' },
        { to: '/embedded-book', label: 'Embedded C++/Rust', position: 'left' },
  { to: '/systems-interview', label: 'Embedded Systems Interview', position: 'left' },
  { to: '/poems', label: 'Poems', position: 'left' },
        { to: '/scifi', label: 'Sci‑Fi Novel', position: 'left' },
        { to: '/math', label: 'Math & Physics', position: 'left' },
        { to: '/about', label: 'About', position: 'left' },
        { href: 'https://github.com/westerngazoo', label: 'GitHub', position: 'right' },
        { href: 'https://x.com/techno_goose', label: 'X', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/westerngazoo' },
            { label: 'X', href: 'https://x.com/techno_goose' },
          ],
        },
        {
          title: 'Explore',
          items: [
            { label: 'Blog', to: '/blog' },
            { label: 'C++ Algorithms', to: '/book' },
            { label: 'Embedded C++/Rust', to: '/embedded-book' },
            { label: 'Embedded Systems Interview', to: '/systems-interview' },
            { label: 'Poems', to: '/poems' },
            { label: 'Sci‑Fi Novel', to: '/scifi' },
            { label: 'Math & Physics', to: '/math' },
            { label: 'About', to: '/about' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Goose Factor. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
