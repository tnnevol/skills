import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/',
  title: 'Tnnevol 技能库',
  description: '智能技能合集 - 开发和发布技能与命令行工具',
  lang: 'zh-CN',

  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/what-is-skills' },
      {
        text: '技能',
        items: [
          { text: '总览', link: '/skills/' },
        ],
      },
      { text: 'openlist-cli', link: '/cli/openlist-cli' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '项目介绍', link: '/guide/what-is-skills' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '技能开发规范', link: '/guide/skill-structure' },
          ],
        },
      ],
      '/skills/': [
        {
          text: '技能',
          items: [{ text: '总览', link: '/skills/' }],
        },
      ],
      '/cli/': [
        {
          text: '命令行工具',
          items: [
            { text: 'openlist-cli', link: '/cli/openlist-cli' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tnnevol/skills' },
    ],

    footer: {
      message: '基于非商业使用许可证发布',
      copyright: 'Copyright © 2025-present Tnnevol',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/tnnevol/skills/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
})
