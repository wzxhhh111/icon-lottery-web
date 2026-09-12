# Reel Stopping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让三个老虎机转轮在 5.6 秒内分段减速并依次自然停靠。

**Architecture:** 保留单文件页面结构，仅替换 `script.js` 中的逐帧循环。动画开始前生成足够长的图片轨道，中奖图固定为最后一项，再由 Web Animations API 将轨道准确移动到该项。

**Tech Stack:** HTML、CSS、原生 JavaScript、Web Animations API、Node.js `assert`

---

### Task 1: 修复停靠动画

**Files:**
- Modify: `script.js`
- Test: `animation.test.js`

- [ ] 写入断言：时长为 `[3400, 4500, 5600]`，中奖图预置在轨道末尾，停止时不归零。
- [ ] 运行 `node animation.test.js`，确认旧实现失败。
- [ ] 用原生分段关键帧替换逐帧减速，并让最后一项直接成为中奖图。
- [ ] 运行 `node animation.test.js && node --check script.js`，确认通过。
- [ ] 在浏览器触发一次抽奖，确认依次停靠且最后无换图跳变。

