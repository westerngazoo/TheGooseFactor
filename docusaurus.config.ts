import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import gooseReactions from './src/remark/gooseReactions';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const sharedRemarkPlugins = [gooseReactions, remarkMath];
const sharedRehypePlugins = [rehypeKatex];

// ──────────────────────────────────────────────
// Single source of truth for all books.
// Add a new entry here → navbar, footer, and
// docs plugin are generated automatically.
// The first entry uses the preset's default docs
// instance (required by the search plugin).
// ──────────────────────────────────────────────
const books = [
  {id: 'default',            path: 'books/cpp-algorithms',     routeBasePath: 'book',              label: 'C++ Algorithms'},
  {id: 'embedded',           path: 'books/embedded',           routeBasePath: 'embedded-book',     label: 'Embedded C++/Rust'},
  {id: 'systems-interview',  path: 'books/systems-interview',  routeBasePath: 'systems-interview', label: 'Systems Interview'},
  {id: 'math',               path: 'books/math',               routeBasePath: 'math',              label: 'Math Basics'},
  {id: 'physics',            path: 'books/physics',            routeBasePath: 'physics',           label: 'Physics Basics'},
  {id: 'scifi',              path: 'books/scifi',              routeBasePath: 'scifi',             label: 'Sci-Fi Novel'},
  {id: 'poems',              path: 'books/poems',              routeBasePath: 'poems',             label: 'Poems'},
  {id: 'goose-os',           path: 'books/goose-os',           routeBasePath: 'goose-os',          label: 'GooseOS'},
  {id: 'geometric-algebra',  path: 'books/geometric-algebra',  routeBasePath: 'geometric-algebra', label: 'Geometric Algebra'},
  {id: 'os-compared',        path: 'books/os-compared',        routeBasePath: 'os-compared',       label: 'OS Compared'},
];

const defaultBook = books[0];
const extraBooks = books.slice(1);

// Generate navbar dropdown items from books array
const bookDropdownItems = books.map(b => ({
  to: `/${b.routeBasePath}`,
  label: b.label,
}));

// Generate footer items from books array
const bookFooterItems = books.map(b => ({
  label: b.label,
  to: `/${b.routeBasePath}`,
}));

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
          path: defaultBook.path,
          routeBasePath: defaultBook.routeBasePath,
          sidebarPath: './sidebars-autogen.ts',
          remarkPlugins: sharedRemarkPlugins,
          rehypePlugins: sharedRehypePlugins,
        },
        blog: {
            showReadingTime: true,
            feedOptions: { type: ['rss', 'atom'], xslt: true },
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
            remarkPlugins: sharedRemarkPlugins,
            rehypePlugins: sharedRehypePlugins,
        },
        pages: { remarkPlugins: sharedRemarkPlugins, rehypePlugins: sharedRehypePlugins },
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],
  plugins: [
    ...extraBooks.map(book => [
      '@docusaurus/plugin-content-docs',
      {
        id: book.id,
        path: book.path,
        routeBasePath: book.routeBasePath,
        sidebarPath: './sidebars-autogen.ts',
        remarkPlugins: sharedRemarkPlugins,
        rehypePlugins: sharedRehypePlugins,
      },
    ]),
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
  themes: [
    ['@easyops-cn/docusaurus-search-local', {
      hashed: true,
      indexDocs: true,
      indexBlog: true,
      indexPages: true,
      docsDir: defaultBook.path,
    }],
  ],
  themeConfig: {
    image: 'img/goosefactorcloseup.png',
    navbar: {
      title: 'The Goose Factor',
      logo: { alt: 'Goose Logo', src: 'img/gooseFactor.png' },
      items: [
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          type: 'dropdown',
          label: 'Books',
          position: 'left',
          items: bookDropdownItems,
        },
        { to: '/apps', label: 'Apps', position: 'left' },
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
      ],
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} The Goose Factor. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
