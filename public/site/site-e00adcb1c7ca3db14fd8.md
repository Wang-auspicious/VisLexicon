---
version: "3"
releaseId: release-f4ac887f17c47614
revision: c3d18aef62ffcdaac9d21f8a1b40142817c7fad22ec8748173560f2dd40a62b3
status: APPROVED
name: vinext
description: "适合把现有 Next.js 应用迁移到 Vite 工具链并部署到 Cloudflare Workers 等目标；兼容性为 94% API 覆盖，仍存在缺口。"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://vinext.dev/
checkedAt: 2026-10-31T04:39:39.427Z
license: unknown
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/site-e00adcb1c7ca3db14fd8"
---

## Overview

vinext 是一个把 Next.js API 重新实现到 Vite 上的开源插件，页面提供 GitHub 与文档入口，并给出 vite.config.ts 配置示例：先引入 vinext() 插件，再按部署目标加入 Cloudflare Workers 适配器或 Nitro。文档站列出安装、迁移现有 Next.js 应用、部署到 Cloudflare Workers 与其他平台、缓存、追踪和 Module Federation 等指南。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
