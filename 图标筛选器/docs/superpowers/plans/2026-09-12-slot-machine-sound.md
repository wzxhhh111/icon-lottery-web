# Slot Machine Sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 制作一段与三个转轮依次停止完全同步的 5.8 秒真实机械老虎机音效。

**Architecture:** 下载一段许可明确的机械转动录音作为质感底层，用 Python 标准库生成拉杆、棘轮和停轮瞬态并完成混音。最终只保留一个可直接用于网页的 WAV 文件。

**Tech Stack:** Python 标准库 `wave`、`math`、`random`、`struct`

---

### Task 1: 获取并检查机械底声

**Files:**
- Create: `audio/source-reel.mp3`

- [ ] 从 Pixabay 的 Free for use 机械转轴录音下载源文件。
- [ ] 用 `ffprobe` 检查源文件可解码、时长大于 5.8 秒。

### Task 2: 合成并导出完整音效

**Files:**
- Create: `tools/make_slot_sound.py`
- Create: `audio/slot-machine-spin.wav`

- [ ] 生成 0 秒拉杆撞击、持续减速棘轮，以及 3.4、4.5、5.6 秒三次停轮声。
- [ ] 将机械底声低电平混入，导出 48 kHz、16-bit、立体声 WAV。
- [ ] 运行脚本并用 `ffprobe`、`astats` 检查时长、声道、采样率与峰值。
- [ ] 播放成品并确认无爆音、无突兀尾切。
