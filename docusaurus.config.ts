import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import gooseReactions from './src/remark/gooseReactions';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const sharedRemarkPlugins = [gooseReactions, remarkMath];
const sharedRehypePlugins = [rehypeKatex];

// Additional books (beyond the default docs instance)
const extraBooks = [
  {id: 'embedded', path: 'books/embedded', routeBasePath: 'embedded-book', label: 'Embedded C++/Rust'},
  {id: 'systems-interview', path: 'books/systems-interview', routeBasePath: 'systems-interview', label: 'Systems Interview'},
  {id: 'math', path: 'books/math', routeBasePath: 'math', label: 'Math & Physics'},
  {id: 'scifi', path: 'books/scifi', routeBasePath: 'scifi', label: 'Sci-Fi Novel'},
  {id: 'poems', path: 'books/poems', routeBasePath: 'poems', label: 'Poems'},
];

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
        // Default docs instance = C++ Algorithms book
        docs: {
          path: 'books/cpp-algorithms',
          routeBasePath: 'book',
          sidebarPath: './sidebars-autogen.ts',
          remarkPlugins: sharedRemarkPlugins,
          rehypePlugins: sharedRehypePlugins,
          editUrl: 'https://github.com/westerngazoo/TheGooseFactor/edit/main/',
        },
        blog: {
            showReadingTime: true,
            feedOptions: { type: ['rss', 'atom'], xslt: true },
            editUrl: 'https://github.com/westerngazoo/TheGooseFactor/edit/main/',
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
        editUrl: 'https://github.com/westerngazoo/TheGooseFactor/edit/main/',
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
      docsDir: 'books/cpp-algorithms',
    }],
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
        { to: '/scifi', label: 'Sci\u2011Fi Novel', position: 'left' },
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
            { label: 'Sci\u2011Fi Novel', to: '/scifi' },
            { label: 'Math & Physics', to: '/math' },
            { label: 'About', to: '/about' },
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
