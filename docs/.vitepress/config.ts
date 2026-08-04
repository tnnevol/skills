import { defineConfig } from 'vitepress'

export default defineConfig({
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
          { text: '自动保存', link: '/skills/autosave/' },
          { text: '禅道', link: '/skills/chandao/' },
          { text: '钉钉', link: '/skills/ding/' },
          { text: '飞牛文档', link: '/skills/fnnas-docs/' },
          { text: '博客管理', link: '/skills/halo/' },
          { text: '笔记管理', link: '/skills/memos/' },
          { text: '网盘聚合', link: '/skills/openlist/' },
        ],
      },
      { text: '命令行工具', link: '/cli/openlist-cli' },
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '项目介绍', link: '/guide/what-is-skills' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '技能开发规范', link: '/guide/skill-structure' },
        ],
      },
      {
        text: '技能',
        items: [
          {
            text: '总览',
            link: '/skills/',
          },
          {
            text: '自动保存',
            items: [
              { text: '概述', link: '/skills/autosave/' },
              { text: '环境配置', link: '/skills/autosave/setup' },
              { text: '任务管理', link: '/skills/autosave/actions-tasks' },
              { text: '配置管理', link: '/skills/autosave/actions-config' },
              { text: '分享详情', link: '/skills/autosave/actions-detail' },
              { text: '运行任务', link: '/skills/autosave/actions-run' },
              { text: '帮助', link: '/skills/autosave/help' },
            ],
          },
          {
            text: '禅道',
            items: [
              { text: '概述', link: '/skills/chandao/' },
              { text: '环境配置', link: '/skills/chandao/setup' },
              { text: '产品管理', link: '/skills/chandao/commands-product' },
              { text: '项目管理', link: '/skills/chandao/commands-project' },
              { text: '需求管理', link: '/skills/chandao/commands-story' },
              { text: '任务管理', link: '/skills/chandao/commands-task' },
              { text: '迭代管理', link: '/skills/chandao/commands-execution' },
              { text: '缺陷管理', link: '/skills/chandao/commands-bug' },
              { text: '测试用例', link: '/skills/chandao/commands-test' },
              { text: '需求补充', link: '/skills/chandao/commands-requirement' },
              { text: '接口参考', link: '/skills/chandao/api-reference' },
              { text: '踩坑记录', link: '/skills/chandao/pitfalls' },
              { text: '帮助', link: '/skills/chandao/help' },
            ],
          },
          {
            text: '钉钉',
            items: [
              { text: '概述', link: '/skills/ding/' },
              { text: '环境配置', link: '/skills/ding/setup' },
              { text: '联系代理', link: '/skills/ding/actions-contact' },
              { text: '查询代理', link: '/skills/ding/actions-query' },
              { text: '帮助', link: '/skills/ding/help' },
            ],
          },
          {
            text: '飞牛文档',
            items: [
              { text: '概述', link: '/skills/fnnas-docs/' },
              { text: '平台概览', link: '/skills/fnnas-docs/guide' },
              {
                text: '快速开始',
                items: [
                  { text: '准备工作', link: '/skills/fnnas-docs/quick-started/prerequisites' },
                  { text: '创建应用', link: '/skills/fnnas-docs/quick-started/create-application' },
                  { text: '测试应用', link: '/skills/fnnas-docs/quick-started/test-application' },
                  { text: '上架应用', link: '/skills/fnnas-docs/quick-started/publish-application' },
                ],
              },
              {
                text: '核心概念',
                items: [
                  { text: '应用框架', link: '/skills/fnnas-docs/core-concepts/framework' },
                  { text: '应用清单', link: '/skills/fnnas-docs/core-concepts/manifest' },
                  { text: '环境变量', link: '/skills/fnnas-docs/core-concepts/environment-variables' },
                  { text: '权限配置', link: '/skills/fnnas-docs/core-concepts/privilege' },
                  { text: '资源管理', link: '/skills/fnnas-docs/core-concepts/resource' },
                  { text: '应用入口', link: '/skills/fnnas-docs/core-concepts/app-entry' },
                  { text: '轻量入口', link: '/skills/fnnas-docs/core-concepts/index-cgi' },
                  { text: '网关注册', link: '/skills/fnnas-docs/core-concepts/gateway-registration' },
                  { text: '用户向导', link: '/skills/fnnas-docs/core-concepts/wizard' },
                  { text: '依赖管理', link: '/skills/fnnas-docs/core-concepts/dependency' },
                  { text: '中间件', link: '/skills/fnnas-docs/core-concepts/middleware' },
                  { text: '运行时', link: '/skills/fnnas-docs/core-concepts/runtime' },
                  { text: '图标规范', link: '/skills/fnnas-docs/core-concepts/icon' },
                ],
              },
              {
                text: '开放接口',
                items: [
                  { text: '概述', link: '/skills/fnnas-docs/api/overview' },
                  { text: '调用方式', link: '/skills/fnnas-docs/api/calling' },
                  {
                    text: '授权与文件',
                    items: [
                      { text: '授权与文件概览', link: '/skills/fnnas-docs/api/authorization/overview' },
                      { text: '应用共享授权', link: '/skills/fnnas-docs/api/authorization/shared-access' },
                      { text: '用户个人授权', link: '/skills/fnnas-docs/api/authorization/user-access' },
                      { text: '文件权限检查', link: '/skills/fnnas-docs/api/authorization/file-acl' },
                      { text: '路径转换', link: '/skills/fnnas-docs/api/authorization/path-convert' },
                    ],
                  },
                  {
                    text: '页面能力',
                    items: [
                      { text: '页面路由', link: '/skills/fnnas-docs/api/page/routing' },
                      { text: '页面交互', link: '/skills/fnnas-docs/api/page/ui' },
                    ],
                  },
                  { text: '平台配置', link: '/skills/fnnas-docs/api/platform-config' },
                  { text: '错误码', link: '/skills/fnnas-docs/api/error-codes' },
                ],
              },
              {
                text: '命令行工具',
                items: [
                  { text: '应用打包工具', link: '/skills/fnnas-docs/cli/fnpack' },
                  { text: '应用管理工具', link: '/skills/fnnas-docs/cli/appcentercli' },
                ],
              },
              {
                text: '案例',
                items: [
                  { text: '容器应用', link: '/skills/fnnas-docs/examples/docker' },
                  { text: '原生应用', link: '/skills/fnnas-docs/examples/native' },
                ],
              },
              {
                text: '更新日志',
                items: [
                  { text: '2026-07-31', link: '/skills/fnnas-docs/update-log' },
                  { text: '2025-12-16', link: '/skills/fnnas-docs/update-log/20251216' },
                  { text: '2025-12-31', link: '/skills/fnnas-docs/update-log/20251231' },
                  { text: '2026-05-09', link: '/skills/fnnas-docs/update-log/20260509' },
                  { text: '2026-07-05', link: '/skills/fnnas-docs/update-log/20260705' },
                ],
              },
            ],
          },
          {
            text: '博客管理',
            items: [
              { text: '概述', link: '/skills/halo/' },
              { text: '环境配置', link: '/skills/halo/setup' },
              { text: '文章管理', link: '/skills/halo/posts' },
              { text: '分类管理', link: '/skills/halo/categories' },
              { text: '标签管理', link: '/skills/halo/tags' },
              { text: '单页管理', link: '/skills/halo/singlepage' },
            ],
          },
          {
            text: '笔记管理',
            items: [
              { text: '概述', link: '/skills/memos/' },
              { text: '环境配置', link: '/skills/memos/setup' },
              { text: '笔记管理', link: '/skills/memos/actions-memo' },
              { text: '标签管理', link: '/skills/memos/actions-tag' },
              { text: '评论管理', link: '/skills/memos/actions-comment' },
              { text: '用户信息', link: '/skills/memos/actions-user' },
              { text: '分享管理', link: '/skills/memos/actions-share' },
              { text: '附件管理', link: '/skills/memos/actions-attachment' },
              { text: '表情回应', link: '/skills/memos/actions-reaction' },
              { text: '关联关系', link: '/skills/memos/actions-relation' },
              { text: '已知问题', link: '/skills/memos/known-issues' },
              { text: '帮助', link: '/skills/memos/help' },
            ],
          },
          {
            text: '网盘聚合',
            items: [
              { text: '概述', link: '/skills/openlist/' },
              { text: '环境配置', link: '/skills/openlist/setup' },
              { text: '命令参考', link: '/skills/openlist/commands' },
              { text: '踩坑记录', link: '/skills/openlist/pitfalls' },
            ],
          },
        ],
      },
      {
        text: '命令行工具',
        items: [
          { text: '网盘命令行工具', link: '/cli/openlist-cli' },
        ],
      },
    ],

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
