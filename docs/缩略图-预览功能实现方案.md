# 缩略图-预览功能实现方案

## 核心原则

**不存储图片，采用 CSS 缩放实时渲染。**

- 缩略图 = 真实简历预览组件 + CSS `transform: scale()` + `overflow: hidden`
- 不生成 Canvas / SVG / 截图，不额外存储缩略图文件
- 任何样式/数据变更实时反映在缩略图上

## 一、我的简历 - 简历卡片缩略图

### 现状

- `HistoryResume.tsx` 已使用 CSS `transform: scale(0.30)` 渲染缩略图
- 使用旧的 `ResumePreview` 组件（旧数据模型 `ResumeContent`）

### 方案

1. **保持 CSS 缩放方式** — 不使用图片，直接渲染组件后缩放
2. **优化缩略图容器** — 统一卡片尺寸 `aspect-[5/6]`，缩略图区域固定宽高比
3. **缩放比例计算** — 基于 A4 比例 (210mm × 297mm ≈ 1:1.414)，缩略图宽度固定，`scale = 缩略图宽度 / 原始宽度(794px)`
4. **限制数量** — 最多显示 7 份简历（占满两行，每行 4 个卡片）

### 实现细节

```
卡片容器 (aspect-[5/6])
├── 标题栏 (标题 + 更新时间)
├── 缩略图区域 (flex-1, overflow: hidden)
│   └── 缩放容器 (transform: scale(0.25), transform-origin: top left)
│       └── ResumePreview 组件 (width: 794px)
└── 操作栏 (预览/编辑/下载/删除)
```

## 二、精选模板 - 模板卡片缩略图

### 现状

- `ResumeTemplate.tsx` 从后端 API 获取旧模板数据
- 使用 `generateThumbnailFromResume()` 生成 SVG 图片作为缩略图
- 有"查看更多"按钮

### 方案

1. **清除旧模板数据** — 不再从后端 API 获取模板列表
2. **基于编辑器的 4 种布局模板** — classic / modern / sidebar / minimal
3. **为每种布局准备 demo 数据** — 包含姓名、职位、一段教育经历、一段工作经历等
4. **CSS 缩放缩略图** — 同"我的简历"方案，渲染 demo 数据 + scale
5. **新建功能** — 点击模板卡片的"新建"按钮，使用该布局创建空白简历
6. **"更多模版开发中"** — 替换"查看更多"按钮

### 布局模板定义

| 布局   | 标识    | 描述                       |
| ------ | ------- | -------------------------- |
| 经典   | classic | 传统单栏布局，标题带下划线 |
| 现代   | modern  | 时尚双栏布局，标题全大写   |
| 侧边栏 | sidebar | 左侧深色侧边栏 + 右侧内容  |
| 简约   | minimal | 极简风格，无边框线条       |

### 模板卡片结构

```
模板卡片 (aspect-[3/4.5])
├── 缩略图区域 (CSS 缩放渲染 demo 数据)
├── 布局名称标签
├── hover 层：预览按钮 + 新建按钮
```

## 三、技术实现

### 组件设计

```
ThumbnailPreview (新增)
├── 接收 ResumeDocument 或 ResumeContent
├── 渲染完整预览组件
├── 外层容器 + CSS scale 缩放
└── 用于：简历卡片 + 模板卡片

TemplateCard (新增/重构)
├── 使用 ThumbnailPreview 渲染 demo 数据
├── 新建按钮 → 创建空白简历
└── 用于：精选模板区域

HistoryResume (重构)
├── 使用 ThumbnailPreview 渲染真实简历数据
├── 操作按钮保持不变
└── 用于：我的简历区域
```

### 数据流

```
编辑器布局模板 → demo 数据 → ThumbnailPreview → 模板卡片
用户简历数据 → ThumbnailPreview → 简历卡片
```

### CSS 缩放公式

```
卡片宽度 = 容器宽度 (grid 列)
缩略图宽度 = 卡片宽度 - padding
原始宽度 = 794px (A4 @ 96dpi)
scale = 缩略图宽度 / 原始宽度
容器高度 = 原始高度(1123px) * scale
```

## 四、文件变更清单

| 文件                                       | 操作 | 说明                      |
| ------------------------------------------ | ---- | ------------------------- |
| `docs/缩略图-预览功能实现方案.md`          | 新建 | 本文档                    |
| `src/components/home/ThumbnailPreview.tsx` | 新建 | CSS缩放预览组件           |
| `src/utils/template-demo-data.ts`          | 新建 | 4种布局的demo数据         |
| `src/components/home/HistoryResume.tsx`    | 修改 | 优化缩略图渲染            |
| `src/components/home/ResumeTemplate.tsx`   | 重写 | 基于布局模板的模板卡片    |
| `src/pages/HomePage.tsx`                   | 修改 | 限制7份简历、替换模板区域 |
| `src/utils/thumbnail.ts`                   | 删除 | 不再需要SVG生成           |
