// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CrudCloud',
  tagline: 'Cloud database management, simple and fast',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.cold-brew.crudzaso.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Team-Cold-Brew', // Usually your GitHub org/user name.
  projectName: 'CrudCloud-Documentation-ColdBrew', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  favicon: 'img/favicon.svg',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/Team-Cold-Brew/CrudCloud-Documentation-ColdBrew/tree/main/CrudCloud-Documentation/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'CrudCloud',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://cold-brew.crudzaso.com',
            label: 'Platform',
            position: 'right',
          },
          {
            type: 'dropdown',
            label: 'GitHub',
            position: 'right',
            items: [
              {
                label: 'Backend',
                href: 'https://github.com/Team-Cold-Brew/CrudCloud-Backend-ColdBrew',
              },
              {
                label: 'Frontend',
                href: 'https://github.com/Team-Cold-Brew/CrudCloud-Frontend',
              },
              {
                label: 'Documentation',
                href: 'https://github.com/Team-Cold-Brew/CrudCloud-Documentation-ColdBrew',
              },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Backend',
                to: '/docs/backend/intro',
              },
              {
                label: 'Frontend',
                to: '/docs/frontend/intro',
              },
            ],
          },
          {
            title: 'Platform',
            items: [
              {
                label: 'CrudCloud App',
                href: 'https://cold-brew.crudzaso.com',
              },
              {
                label: 'API Backend',
                href: 'https://api.cold-brew.crudzaso.com',
              },
            ],
          },
          {
            title: 'Repositories',
            items: [
              {
                label: 'Backend',
                href: 'https://github.com/Team-Cold-Brew/CrudCloud-Backend-ColdBrew',
              },
              {
                label: 'Frontend',
                href: 'https://github.com/Team-Cold-Brew/CrudCloud-Frontend',
              },
              {
                label: 'Documentation',
                href: 'https://github.com/Team-Cold-Brew/CrudCloud-Documentation-ColdBrew',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Team Cold Brew. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
