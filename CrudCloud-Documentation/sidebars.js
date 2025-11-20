// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // Sidebar principal de CrudCloud
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Backend',
      items: [
        'backend/intro',
        'backend/setup',
        'backend/architecture',
        'backend/api-reference',
        'backend/deployment',
        {
          type: 'category',
          label: 'Módulos',
          collapsed: false,
          items: [
            'backend/modules/auth',
            'backend/modules/database',
            'backend/modules/mercado-pago',
            'backend/modules/common',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Frontend',
      items: [
        'frontend/intro',
        'frontend/setup',
        'frontend/components',
        'frontend/deployment',
      ],
    },
  ],
};

export default sidebars;
