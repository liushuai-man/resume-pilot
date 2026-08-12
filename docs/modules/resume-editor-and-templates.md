# 编辑 + 主题模板模块重构方案

## 一、现状分析

### 1.1 当前架构概览

```
用户输入 → Editor组件 → Zustand多个状态 → Preview组件 → PDF导出
                ↓                    ↓
           左侧编辑区           中间预览区
        (模块列表+表单)      (Classic/Sidebar/Minimal)
```

### 1.2 编辑模块问题

| 问题                  | 具体表现                                           | 影响                     |
| --------------------- | -------------------------------------------------- | ------------------------ |
| **布局拥挤**          | 左编辑(25vw) + 中预览 + 右AI(25vw)，预览区域被挤压 | 预览效果差，用户体验不佳 |
| **编辑与预览割裂**    | 用户在左侧修改，右侧预览更新，用户需要两边对照     | 操作不直观，学习成本高   |
| **模块扩展困难**      | 新增模块需要修改类型、store、编辑器、预览等多处    | 维护成本高，迭代慢       |
| **Toolbar状态不同步** | 顶部Toolbar直接操作DOM或独立状态，与store容易脱节  | 功能失效，体验不一致     |
| **AI能力游离**        | AI在右侧聊天框，生成内容需手动复制粘贴             | 效率低，未融入编辑流程   |

### 1.3 模板系统问题

当前模板结构（以 [ClassicLayout.tsx](file:///d:/MyStudy/myProject/ResumePilot/frontend/src/components/editor/resume-preview/ClassicLayout.tsx) 为例）：

```typescript
// 模板直接读取固定字段
{content.education && <EducationSection content={content} ... />}
{content.experience && <ExperienceSection content={content} ... />}
{content.projects && <ProjectsSection content={content} ... />}
{content.skills && <SkillsSection content={content} ... />}
```

| 问题                 | 具体表现                                                  | 影响                         |
| -------------------- | --------------------------------------------------------- | ---------------------------- |
| **模板与数据强耦合** | 模板硬编码读取 `content.education`、`content.projects` 等 | 新增模块需要修改所有模板     |
| **数据结构不统一**   | `ResumeContent` 同时有 `blocks` 数组和扁平化字段          | 状态混乱，容易出错           |
| **无渲染器抽象**     | 每个模板独立实现所有section的渲染逻辑                     | 代码重复，维护成本高         |
| **自定义模块不支持** | 用户无法自由添加"竞赛经历""科研经历"等模块                | 灵活性差，无法满足个性化需求 |

### 1.4 数据结构问题

当前 [resume.ts](file:///d:/MyStudy/myProject/ResumePilot/frontend/src/types/resume.ts) 中 `ResumeContent` 存在双重结构：

```typescript
interface ResumeContent {
  blocks: ResumeBlock[]; // 结构1：Block数组（未完全使用）
  basicInfo: BasicInfo; // 结构2：扁平化字段（实际使用）
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  // ... 更多字段
}
```

**问题**：两套数据结构并存，`blocks` 基本未使用，实际数据走扁平化字段，导致：

- 类型定义冗余
- 无法动态增删模块
- 模板无法通用化

### 1.5 状态管理问题

当前 [useResumeStore.ts](file:///d:/MyStudy/myProject/ResumePilot/frontend/src/store/useResumeStore.ts) 状态分散：

```typescript
interface ResumeState {
  resume: Resume | null;          // 完整简历对象
  content: ResumeContent;         // 单独的内容状态
  template: Template | null;      // 模板
  templateStyle: StyleConfig | null;  // 模板样式
  templateLayout: string;         // 模板布局
  formatConfig: { ... };          // 格式配置（与templateStyle重复）
}
```

**问题**：

- 状态来源不统一（`templateStyle` vs `formatConfig`）
- 更新路径不清晰
- 组件可能读取不同状态导致不一致

---

## 二、重构目标

### 2.1 核心目标

**所有东西围绕 ResumeDocument 展开**

```
                  ResumeDocument
                        |
        ┌───────────────┼───────────────┐
        |               |               |
    Editor          Renderer          AI Agent
        |               |               |
  修改Section     实时预览        修改Section
                        |
                   PDF Export
```

### 2.2 具体目标

| 目标               | 说明                                                    |
| ------------------ | ------------------------------------------------------- |
| **编辑与展示解耦** | Editor 和 Preview 都操作 ResumeDocument，互不依赖       |
| **模板与数据解耦** | 模板通过 SectionRenderer 动态渲染，不关心具体数据字段   |
| **模块可扩展**     | 新增模块只需定义Section类型 + 编辑器 + 渲染器，不改模板 |
| **AI深度集成**     | AI操作结构化Section数据，直接应用到简历                 |
| **状态统一**       | 单一数据源，单向数据流                                  |

### 2.3 预期效果提升

| 指标         | 重构前                                  | 重构后                              | 提升         |
| ------------ | --------------------------------------- | ----------------------------------- | ------------ |
| 新增模块成本 | 修改6+文件（类型/store/编辑器/3个模板） | 新增3个文件（类型/Editor/Renderer） | **-50%**     |
| 状态一致性   | 多状态源，易不同步                      | 单一数据源                          | 大幅提升     |
| 预览区域占比 | ~50%                                    | ~60-70%                             | **+20-40%**  |
| AI操作效率   | 手动复制粘贴                            | 直接应用到Section                   | **大幅提升** |
| 模板维护成本 | 每个模板独立实现                        | 共享SectionRenderer                 | **-60%**     |

---

## 三、数据模型重构

### 3.1 核心设计思想：Section 模块化

**从固定字段模型 → 动态Section模型**

```
重构前（固定字段）：          重构后（Section数组）：
{                            {
  education: [],               sections: [
  projects: [],                  { type: "profile", data: {...} },
  skills: [],                    { type: "education", data: [...] },
  experience: [],                { type: "project", data: [...] },
  ...                            { type: "custom", title: "竞赛经历", data: [...] }
}                              ]
                             }
```

### 3.2 ResumeDocument 类型定义

```typescript
// types/resume-document.ts

export interface ResumeDocument {
  id: string;
  title: string;

  sections: ResumeSection[]; // 核心：Section数组

  style: ResumeStyle; // 样式配置
  layout: ResumeLayout; // 布局配置

  createdAt?: string;
  updatedAt?: string;
}

// Section类型联合
export type ResumeSection =
  | ProfileSection
  | EducationSection
  | ExperienceSection
  | ProjectSection
  | SkillSection
  | CustomSection;

// Section基础类型
interface BaseSection<T = any> {
  id: string; // 唯一标识
  type: string; // Section类型
  title: string; // 显示标题（可修改）
  visible: boolean; // 是否显示
  order: number; // 排序权重
  data: T; // 具体数据
}

// ===== 具体Section类型 =====

export interface ProfileSection extends BaseSection<ProfileData> {
  type: 'profile';
}

export interface EducationSection extends BaseSection<EducationItem[]> {
  type: 'education';
}

export interface ExperienceSection extends BaseSection<ExperienceItem[]> {
  type: 'experience';
}

export interface ProjectSection extends BaseSection<ProjectItem[]> {
  type: 'project';
}

export interface SkillSection extends BaseSection<SkillItem[]> {
  type: 'skill';
}

export interface CustomSection extends BaseSection<CustomItem[]> {
  type: 'custom';
}

// ===== 数据项类型 =====

export interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  website?: string;
  summary?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  techStack?: string[];
  achievements?: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

// ===== 样式 & 布局 =====

export interface ResumeStyle {
  theme: string; // 主题ID
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margin: number;
  sectionSpacing: number;
}

export interface ResumeLayout {
  template: string; // 模板ID: modern/classic/minimal
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}
```

### 3.3 与现有 ResumeContent 的映射

为了平滑迁移，提供转换函数：

```typescript
// utils/resume-migration.ts

export function contentToDocument(
  content: ResumeContent,
  style: StyleConfig,
  layout: string
): ResumeDocument {
  const sections: ResumeSection[] = [];

  if (content.basicInfo) {
    sections.push({
      id: 'section-profile',
      type: 'profile',
      title: '个人信息',
      visible: true,
      order: 0,
      data: {
        name: content.basicInfo.name,
        title: content.basicInfo.title || '',
        email: content.basicInfo.email,
        phone: content.basicInfo.phone,
        location: content.basicInfo.location,
        avatar: content.basicInfo.avatar,
        website: content.basicInfo.website,
        summary: content.basicInfo.summary,
      },
    });
  }

  // ... 其他Section的转换

  return {
    id: '',
    title: '',
    sections: sections.sort((a, b) => a.order - b.order),
    style: {
      theme: style.layout || 'classic',
      primaryColor: style.primaryColor,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      lineHeight: 1.5,
      margin: 20,
      sectionSpacing: 24,
    },
    layout: {
      template: layout,
      pageSize: 'A4',
      orientation: 'portrait',
    },
  };
}
```

---

## 四、状态管理重构

### 4.1 设计原则

1. **单一数据源**：只有一个 `document` 状态
2. **单向数据流**：Editor → Store → Preview
3. **集中操作**：所有修改通过统一方法

### 4.2 Store 设计

```typescript
// store/useDocumentStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeDocument, ResumeSection } from '@/types/resume-document';

interface DocumentStore {
  document: ResumeDocument | null;
  activeSectionId: string | null;

  // 基础操作
  loadDocument: (doc: ResumeDocument) => void;
  updateSection: (sectionId: string, data: any) => void;
  addSection: (section: ResumeSection, afterId?: string) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, targetIndex: number) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  toggleSectionVisible: (sectionId: string) => void;

  // 样式操作
  updateStyle: (style: Partial<ResumeDocument['style']>) => void;
  changeTemplate: (templateId: string) => void;

  // UI状态
  setActiveSection: (sectionId: string | null) => void;

  // 重置
  reset: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      document: null,
      activeSectionId: null,

      loadDocument: (doc) => {
        set({ document: doc });
      },

      updateSection: (sectionId, data) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) =>
            s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s
          );
          return {
            document: { ...state.document, sections },
          };
        });
      },

      addSection: (section, afterId) => {
        set((state) => {
          if (!state.document) return state;
          let sections = [...state.document.sections];
          if (afterId) {
            const index = sections.findIndex((s) => s.id === afterId);
            sections.splice(index + 1, 0, section);
          } else {
            sections.push(section);
          }
          sections = sections.map((s, i) => ({ ...s, order: i }));
          return {
            document: { ...state.document, sections },
          };
        });
      },

      removeSection: (sectionId) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections
            .filter((s) => s.id !== sectionId)
            .map((s, i) => ({ ...s, order: i }));
          return {
            document: { ...state.document, sections },
            activeSectionId:
              state.activeSectionId === sectionId
                ? null
                : state.activeSectionId,
          };
        });
      },

      moveSection: (sectionId, targetIndex) => {
        set((state) => {
          if (!state.document) return state;
          const sections = [...state.document.sections];
          const currentIndex = sections.findIndex((s) => s.id === sectionId);
          if (currentIndex === -1) return state;
          const [section] = sections.splice(currentIndex, 1);
          sections.splice(targetIndex, 0, section);
          const reordered = sections.map((s, i) => ({ ...s, order: i }));
          return {
            document: { ...state.document, sections: reordered },
          };
        });
      },

      updateSectionTitle: (sectionId, title) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) =>
            s.id === sectionId ? { ...s, title } : s
          );
          return {
            document: { ...state.document, sections },
          };
        });
      },

      toggleSectionVisible: (sectionId) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) =>
            s.id === sectionId ? { ...s, visible: !s.visible } : s
          );
          return {
            document: { ...state.document, sections },
          };
        });
      },

      updateStyle: (style) => {
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              style: { ...state.document.style, ...style },
            },
          };
        });
      },

      changeTemplate: (templateId) => {
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              layout: { ...state.document.layout, template: templateId },
            },
          };
        });
      },

      setActiveSection: (sectionId) => {
        set({ activeSectionId: sectionId });
      },

      reset: () => {
        set({ document: null, activeSectionId: null });
      },
    }),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## 五、编辑器重构

### 5.1 编辑模式：Block + 表单混合

**用户体验类似木及简历 / Notion**

```
┌─────────────────────────────────┐
│  个人信息                       │
│  刘帅  前端工程师                │
│  liushuai@...  138-xxxx-xxxx    │
├─────────────────────────────────┤
│  教育经历                       │
│  清华大学  计算机科学  本科      │
│  2018 - 2022                    │
├─────────────────────────────────┤
│  项目经历                       │
│                                 │
│  AI简历助手                     │
│  React + LangGraph              │
│  基于Agent实现多轮面试...        │
│                                 │
├─────────────────────────────────┤
│  + 添加模块                     │
└─────────────────────────────────┘
```

点击某个模块后，进入表单编辑：

```
┌─────────────────────────────────┐
│  项目经历                    [×] │
├─────────────────────────────────┤
│  项目名称                       │
│  [ AI简历助手                  ] │
│                                 │
│  担任角色                       │
│  [ 前端负责人                  ] │
│                                 │
│  技术栈                         │
│  [React] [Node.js] [LangGraph]  │
│  [+ 添加标签]                   │
│                                 │
│  项目描述                       │
│  ┌───────────────────────────┐  │
│  │ 基于React和LangGraph构... │  │
│  └───────────────────────────┘  │
│  [AI优化]  [AI扩写]  [AI简化]   │
│                                 │
│  [ 删除此模块 ]                 │
└─────────────────────────────────┘
```

### 5.2 编辑器组件架构

```
components/editor/
├── SectionEditor.tsx           # Section编辑器容器
├── editors/
│   ├── ProfileEditor.tsx       # 个人信息编辑器
│   ├── EducationEditor.tsx     # 教育经历编辑器
│   ├── ExperienceEditor.tsx    # 工作经历编辑器
│   ├── ProjectEditor.tsx       # 项目经历编辑器
│   ├── SkillEditor.tsx         # 技能编辑器
│   └── CustomEditor.tsx        # 自定义模块编辑器
├── SectionList.tsx             # Section列表
├── AddSectionModal.tsx         # 添加模块弹窗
└── AIActionsBar.tsx            # AI操作栏
```

### 5.3 核心组件实现

#### 5.3.1 SectionList（左侧列表）

```tsx
// components/editor/SectionList.tsx

import { useDocumentStore } from '@/store/useDocumentStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function SectionList() {
  const { document, activeSectionId, setActiveSection, moveSection } =
    useDocumentStore();

  if (!document) return null;

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    moveSection(result.draggableId, result.destination.index);
  };

  return (
    <div className="section-list">
      <div className="section-list-header">
        <span>内容模块</span>
        <button className="add-btn">+ 添加模块</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {document.sections
                .filter((s) => s.visible)
                .map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`section-item ${
                          activeSectionId === section.id ? 'active' : ''
                        }`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <span className="section-title">{section.title}</span>
                        <span className="section-count">
                          {Array.isArray(section.data)
                            ? section.data.length
                            : ''}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
```

#### 5.3.2 SectionEditor（编辑器容器）

```tsx
// components/editor/SectionEditor.tsx

import { useDocumentStore } from '@/store/useDocumentStore';
import { ProfileEditor } from './editors/ProfileEditor';
import { EducationEditor } from './editors/EducationEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { ProjectEditor } from './editors/ProjectEditor';
import { SkillEditor } from './editors/SkillEditor';
import { CustomEditor } from './editors/CustomEditor';

const EDITOR_MAP = {
  profile: ProfileEditor,
  education: EducationEditor,
  experience: ExperienceEditor,
  project: ProjectEditor,
  skill: SkillEditor,
  custom: CustomEditor,
};

export function SectionEditor() {
  const { document, activeSectionId, updateSection, setActiveSection } =
    useDocumentStore();

  if (!document || !activeSectionId) {
    return (
      <div className="section-editor-empty">
        <p>请选择左侧模块进行编辑</p>
      </div>
    );
  }

  const section = document.sections.find((s) => s.id === activeSectionId);
  if (!section) return null;

  const EditorComponent = EDITOR_MAP[section.type as keyof typeof EDITOR_MAP];

  if (!EditorComponent) {
    return <div>不支持的模块类型: {section.type}</div>;
  }

  const handleChange = (data: any) => {
    updateSection(section.id, data);
  };

  return (
    <div className="section-editor">
      <div className="section-editor-header">
        <h3>{section.title}</h3>
        <button onClick={() => setActiveSection(null)}>关闭</button>
      </div>
      <EditorComponent
        data={section.data}
        onChange={handleChange}
        sectionId={section.id}
      />
    </div>
  );
}
```

#### 5.3.3 ProjectEditor（示例：项目编辑器）

```tsx
// components/editor/editors/ProjectEditor.tsx

import { AIActionsBar } from '../AIActionsBar';
import type { ProjectItem } from '@/types/resume-document';

interface ProjectEditorProps {
  data: ProjectItem[];
  onChange: (data: ProjectItem[]) => void;
  sectionId: string;
}

export function ProjectEditor({
  data,
  onChange,
  sectionId,
}: ProjectEditorProps) {
  const addItem = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      techStack: [],
      achievements: [],
    };
    onChange([...data, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ProjectItem>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const removeItem = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="project-editor">
      {data.map((item, index) => (
        <div key={item.id} className="project-item-editor">
          <div className="form-group">
            <label>项目名称</label>
            <input
              value={item.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
              placeholder="例如：AI简历助手"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>担任角色</label>
              <input
                value={item.role}
                onChange={(e) => updateItem(index, { role: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>开始时间</label>
              <input
                type="month"
                value={item.startDate}
                onChange={(e) =>
                  updateItem(index, { startDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>结束时间</label>
              <input
                type="month"
                value={item.endDate}
                onChange={(e) => updateItem(index, { endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>技术栈</label>
            <TagInput
              tags={item.techStack || []}
              onChange={(tags) => updateItem(index, { techStack: tags })}
              placeholder="添加技术栈"
            />
          </div>

          <div className="form-group">
            <label>项目描述</label>
            <textarea
              value={item.description}
              onChange={(e) =>
                updateItem(index, { description: e.target.value })
              }
              rows={4}
              placeholder="描述项目背景、你的职责和主要工作..."
            />
          </div>

          <AIActionsBar
            sectionId={sectionId}
            itemIndex={index}
            field="description"
            actions={['polish', 'expand', 'simplify', 'quantify']}
          />

          <button className="remove-btn" onClick={() => removeItem(index)}>
            删除此项目
          </button>
        </div>
      ))}

      <button className="add-item-btn" onClick={addItem}>
        + 添加项目经历
      </button>
    </div>
  );
}
```

### 5.4 AI操作栏设计

```tsx
// components/editor/AIActionsBar.tsx

interface AIActionsBarProps {
  sectionId: string;
  itemIndex?: number;
  field?: string;
  actions: ('polish' | 'expand' | 'simplify' | 'quantify' | 'complete')[];
}

export function AIActionsBar({
  sectionId,
  itemIndex,
  field,
  actions,
}: AIActionsBarProps) {
  const actionConfig = {
    polish: { label: 'AI润色', icon: '✨' },
    expand: { label: 'AI扩写', icon: '📝' },
    simplify: { label: 'AI简化', icon: '✂️' },
    quantify: { label: '量化成果', icon: '📊' },
    complete: { label: 'AI补全', icon: '🤖' },
  };

  const handleAction = async (action: string) => {
    // 调用AI API
    // 应用结果到store
  };

  return (
    <div className="ai-actions-bar">
      {actions.map((action) => (
        <button
          key={action}
          className="ai-action-btn"
          onClick={() => handleAction(action)}
        >
          <span>{actionConfig[action].icon}</span>
          <span>{actionConfig[action].label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 六、模板系统重构

### 6.1 Renderer 架构设计

**核心思想：模板只负责布局，Section渲染统一管理**

```
Template (Modern/Classic/Minimal)
          |
          ↓
   SectionRenderer（统一渲染器）
          |
    ┌─────┴─────┬─────────┐
    ↓           ↓         ↓
Profile     Project   Education
Renderer    Renderer  Renderer
```

### 6.2 目录结构

```
components/
├── preview/
│   ├── DocumentPreview.tsx      # 预览入口
│   ├── templates/
│   │   ├── ModernTemplate.tsx   # Modern模板
│   │   ├── ClassicTemplate.tsx  # Classic模板
│   │   └── MinimalTemplate.tsx  # Minimal模板
│   └── renderers/               # Section渲染器（共享）
│       ├── index.ts             # 渲染器注册表
│       ├── ProfileRenderer.tsx
│       ├── EducationRenderer.tsx
│       ├── ExperienceRenderer.tsx
│       ├── ProjectRenderer.tsx
│       ├── SkillRenderer.tsx
│       ├── CustomRenderer.tsx
│       └── SectionWrapper.tsx   # 通用Section包装
```

### 6.3 SectionRenderer 注册表

```typescript
// components/preview/renderers/index.tsx

import type { ResumeSection } from '@/types/resume-document';
import { ProfileRenderer } from './ProfileRenderer';
import { EducationRenderer } from './EducationRenderer';
import { ExperienceRenderer } from './ExperienceRenderer';
import { ProjectRenderer } from './ProjectRenderer';
import { SkillRenderer } from './SkillRenderer';
import { CustomRenderer } from './CustomRenderer';

export interface RendererProps {
  section: ResumeSection;
  style: any; // 全局样式
  variant: 'modern' | 'classic' | 'minimal';
  isHighlighted?: boolean;
}

export type SectionRenderer = React.FC<RendererProps>;

export const SECTION_RENDERERS: Record<string, SectionRenderer> = {
  profile: ProfileRenderer,
  education: EducationRenderer,
  experience: ExperienceRenderer,
  project: ProjectRenderer,
  skill: SkillRenderer,
  custom: CustomRenderer,
};

export function getSectionRenderer(type: string): SectionRenderer | null {
  return SECTION_RENDERERS[type] || null;
}
```

### 6.4 模板实现（以Modern为例）

```tsx
// components/preview/templates/ModernTemplate.tsx

import type { ResumeDocument } from '@/types/resume-document';
import { getSectionRenderer } from '../renderers';
import { SectionWrapper } from '../renderers/SectionWrapper';

interface ModernTemplateProps {
  document: ResumeDocument;
  highlightSectionId?: string;
}

export function ModernTemplate({
  document,
  highlightSectionId,
}: ModernTemplateProps) {
  const { sections, style } = document;
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div
      className="resume-template modern"
      style={{
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        padding: `${style.margin}px`,
        lineHeight: style.lineHeight,
      }}
    >
      {visibleSections.map((section) => {
        const Renderer = getSectionRenderer(section.type);
        if (!Renderer) return null;

        return (
          <div key={section.id} className="section-container">
            <SectionWrapper
              title={section.title}
              style={style}
              variant="modern"
              isHighlighted={highlightSectionId === section.id}
            >
              <Renderer
                section={section}
                style={style}
                variant="modern"
                isHighlighted={highlightSectionId === section.id}
              />
            </SectionWrapper>
          </div>
        );
      })}
    </div>
  );
}
```

### 6.5 Section Renderer 实现（以Project为例）

```tsx
// components/preview/renderers/ProjectRenderer.tsx

import type { RendererProps } from './index';
import { TechStackTags, AchievementList, DescriptionText } from './common';

export function ProjectRenderer({
  section,
  style,
  variant,
  isHighlighted,
}: RendererProps) {
  if (section.type !== 'project') return null;

  const items = section.data;
  if (!items || items.length === 0) return null;

  const titleSize = variant === 'minimal' ? '14px' : '15px';
  const dateSize = variant === 'minimal' ? '11px' : '12px';
  const descSize = variant === 'minimal' ? '12px' : '13px';

  return (
    <div className="project-section">
      {items.map((item) => (
        <div key={item.id} className="project-item mb-4 last:mb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="font-medium"
                style={{ fontSize: titleSize, color: '#1f2937' }}
              >
                {item.name}
              </h3>
              <p className="text-gray-500" style={{ fontSize: descSize }}>
                {item.role}
              </p>
            </div>
            <span style={{ fontSize: dateSize, color: '#9ca3af' }}>
              {item.startDate} - {item.endDate || '至今'}
            </span>
          </div>

          {item.techStack && item.techStack.length > 0 && (
            <TechStackTags
              techStack={item.techStack}
              primaryColor={style.primaryColor}
              variant={variant}
            />
          )}

          {item.description && (
            <DescriptionText
              text={item.description}
              fontSize={descSize}
              variant={variant}
            />
          )}

          {item.achievements && item.achievements.length > 0 && (
            <AchievementList
              achievements={item.achievements}
              primaryColor={style.primaryColor}
              fontSize={descSize}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 6.6 预览入口组件

```tsx
// components/preview/DocumentPreview.tsx

import { useDocumentStore } from '@/store/useDocumentStore';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

export function DocumentPreview() {
  const { document, activeSectionId } = useDocumentStore();

  if (!document) {
    return (
      <div className="preview-empty">
        <p>暂无简历内容</p>
      </div>
    );
  }

  const TemplateComponent =
    TEMPLATE_MAP[document.layout.template as keyof typeof TEMPLATE_MAP] ||
    ClassicTemplate;

  return (
    <div className="document-preview">
      <TemplateComponent
        document={document}
        highlightSectionId={activeSectionId || undefined}
      />
    </div>
  );
}
```

---

## 七、UI调整方案

### 7.1 布局调整

**保留三栏结构，但调整职责和宽度**

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  简历名称              [保存] [导出] [AI模型]     │  ← 顶部工具栏
├──────────────────────────────────────────────────────────┤
│  [内容] [模板] [AI] [设置]                               │  ← 功能标签栏
├────────┬───────────────────────────────────┬─────────────┤
│        │                                   │             │
│ 模块列 │          简历预览区               │  AI辅助区   │
│ 表     │          （主区域）                │             │
│        │                                   │             │
│ 个人信 │                                   │             │
│ 教育经 │                                   │  动态内容   │
│ 项目经 │      A4 简历预览                   │  (根据选中  │
│ 技能   │      (点击可定位编辑)              │   模块变化) │
│ +添加  │                                   │             │
│        │                                   │             │
│        │                                   │             │
└────────┴───────────────────────────────────┴─────────────┘
```

### 7.2 各区域职责调整

| 区域             | 宽度               | 职责                                 | 变化                               |
| ---------------- | ------------------ | ------------------------------------ | ---------------------------------- |
| **左侧模块列表** | 240px（可折叠至0） | 展示Section列表、添加模块、拖拽排序  | 从表单改为纯列表 + 点击展开编辑    |
| **中间预览区**   | 自适应（~60-70%）  | 实时预览、点击定位编辑、高亮当前模块 | 增加点击交互、高亮效果             |
| **右侧AI区**     | 300px（可折叠）    | 动态AI辅助面板                       | 从固定聊天框改为上下文相关的AI操作 |

### 7.3 右侧AI区改造

**根据当前选中模块动态变化**

```
未选中任何模块时：
┌─────────────────────┐
│  AI助手             │
│                     │
│  💡 提示：          │
│  选择左侧模块开始编辑│
│                     │
│  常用操作：         │
│  • AI优化整份简历   │
│  • AI生成自我介绍   │
│  • 查看使用指南     │
└─────────────────────┘

选中项目模块时：
┌─────────────────────┐
│  AI - 项目经历优化   │
│                     │
│  ✨ AI润色描述      │
│  📝 AI扩写          │
│  ✂️ AI简化          │
│  📊 量化成果        │
│  🤖 AI补全信息      │
│                     │
│  历史对话：         │
│  ...                │
└─────────────────────┘
```

### 7.4 预览区交互增强

**点击预览中的模块 → 定位编辑**

```tsx
// 在每个SectionRenderer外层添加点击事件
<div
  className={`section-clickable ${isHighlighted ? 'highlighted' : ''}`}
  onClick={() => setActiveSection(section.id)}
>
  <SectionWrapper ...>
    <Renderer ... />
  </SectionWrapper>
</div>
```

---

## 八、AI提示词设计

### 8.1 AI润色（Polish）

```typescript
// ai/prompts/resume/section-polish.prompt.ts

export const SECTION_POLISH_PROMPT = `
你是一名专业的简历优化专家。

请优化以下简历模块的内容，使其更专业、更有说服力。

模块类型：{sectionType}
模块标题：{sectionTitle}

原始内容：
{originalContent}

优化方向：
1. 语言更专业、精炼
2. 使用强行动动词
3. 突出核心价值和成果
4. 保持原意不变

请直接输出优化后的内容，格式与原始内容保持一致。
不要添加任何解释或说明。

优化后的内容：
`;
```

### 8.2 AI补全（Complete）

```typescript
// ai/prompts/resume/section-complete.prompt.ts

export const SECTION_COMPLETE_PROMPT = `
你是一名专业的简历撰写助手。

请根据用户已有的部分信息，帮助补全简历模块内容。

模块类型：{sectionType}
模块标题：{sectionTitle}

已有信息：
{existingContent}

上下文信息：
{context}

请补全完整、专业的内容：
1. 符合行业标准
2. 使用专业术语
3. 突出关键能力
4. 内容真实可信

直接输出补全后的完整内容，格式与输入保持一致。
不要添加任何解释。

补全后的内容：
`;
```

### 8.3 AI量化成果（Quantify）

```typescript
// ai/prompts/resume/quantify.prompt.ts

export const QUANTIFY_PROMPT = `
你是一名资深HR，擅长帮助求职者将工作描述转化为可量化的成果。

请将以下工作内容转化为量化的成果描述。

原始描述：
{description}

岗位类型：{positionType}

请生成3-5条量化成果，遵循：
1. 使用STAR法则
2. 包含具体数字
3. 突出业务价值
4. 使用行动动词
5. 简洁精炼

直接输出成果列表，每条一行，使用"- "开头。
不要添加解释。

成果列表：
`;
```

---

## 九、分阶段实施计划

### Phase 1：数据模型层重构（2-3天）

**目标**：建立 ResumeDocument 数据模型和状态管理

**修改范围**：

- 新增 `types/resume-document.ts` — 类型定义
- 新增 `store/useDocumentStore.ts` — 新的状态管理
- 新增 `utils/resume-migration.ts` — 数据迁移工具
- 不修改现有代码，只新增

**验证方式**：

- 类型检查通过
- Store可正常读写
- 旧数据可正确迁移为新格式

### Phase 2：模板 Renderer 重构（3-4天）

**目标**：建立 SectionRenderer 架构，新模板系统可用

**修改范围**：

- 新增 `components/preview/renderers/` — 所有Section渲染器
- 新增 `components/preview/templates/ModernTemplate.tsx` — 新模板示例
- 新增 `components/preview/DocumentPreview.tsx` — 新预览入口
- 保留旧的 ResumePreview 组件（不删除）

**验证方式**：

- 新模板可正确渲染测试数据
- 所有Section渲染器正常工作
- 样式与旧模板基本一致

### Phase 3：编辑器重构（3-4天）

**目标**：实现基于Section的编辑器

**修改范围**：

- 新增 `components/editor/SectionList.tsx` — Section列表
- 新增 `components/editor/SectionEditor.tsx` — 编辑器容器
- 新增 `components/editor/editors/` — 各模块编辑器
- 新增 `components/editor/AddSectionModal.tsx` — 添加模块弹窗
- 保留旧的编辑器组件

**验证方式**：

- Section列表正常显示
- 点击可进入编辑
- 增删改操作正常
- 数据实时同步到store

### Phase 4：UI集成与切换（2-3天）

**目标**：整合新编辑器和新预览，支持新旧切换

**修改范围**：

- 修改 `ResumeEditorPage.tsx` — 接入新组件
- 修改 `EditorLayout.tsx` — 调整布局
- 添加功能开关（可切换新旧编辑器）
- 右侧AI区改为动态面板

**验证方式**：

- 新编辑器完整流程可用
- 预览实时同步
- 点击预览可定位编辑
- AI区动态变化

### Phase 5：AI能力集成（2-3天）

**目标**：AI操作直接修改Section数据

**修改范围**：

- 新增 `AIActionsBar` 组件
- 新增 AI API 接口（section级别的操作）
- 集成到各编辑器中
- 右侧AI面板优化

**验证方式**：

- AI润色功能正常
- AI补全功能正常
- 结果直接应用到简历
- 无需手动复制粘贴

### Phase 6：清理与优化（1-2天）

**目标**：删除旧代码，优化性能

**修改范围**：

- 删除旧的 ResumePreview 及相关文件
- 删除旧的编辑器组件
- 清理旧的 store 状态
- 性能优化（React.memo 等）

**验证方式**：

- 所有功能正常
- 性能提升
- 代码更简洁

---

## 十、风险评估与应对

| 风险           | 概率 | 影响 | 应对措施                               |
| -------------- | ---- | ---- | -------------------------------------- |
| 数据迁移失败   | 低   | 高   | 保留旧数据格式，提供双向转换，灰度切换 |
| 样式不一致     | 中   | 中   | 建立视觉回归测试，逐模块对比           |
| 功能回退       | 中   | 高   | 功能开关，可随时切回旧版本             |
| 编辑器交互复杂 | 中   | 中   | 渐进式上线，先核心模块后扩展           |
| AI集成不稳定   | 低   | 中   | 降级机制，AI失败时保留原内容           |

---

## 十一、文件变更清单

### 新增文件

```
frontend/src/
├── types/
│   └── resume-document.ts          # 新数据模型类型
├── store/
│   └── useDocumentStore.ts         # 新状态管理
├── utils/
│   └── resume-migration.ts         # 数据迁移工具
├── components/
│   ├── editor/
│   │   ├── SectionList.tsx         # Section列表
│   │   ├── SectionEditor.tsx       # 编辑器容器
│   │   ├── AIActionsBar.tsx        # AI操作栏
│   │   ├── AddSectionModal.tsx     # 添加模块弹窗
│   │   └── editors/                # 各模块编辑器
│   │       ├── ProfileEditor.tsx
│   │       ├── EducationEditor.tsx
│   │       ├── ExperienceEditor.tsx
│   │       ├── ProjectEditor.tsx
│   │       ├── SkillEditor.tsx
│   │       └── CustomEditor.tsx
│   └── preview/
│       ├── DocumentPreview.tsx     # 新预览入口
│       ├── templates/              # 模板组件
│       │   ├── ModernTemplate.tsx
│       │   ├── ClassicTemplate.tsx
│       │   └── MinimalTemplate.tsx
│       └── renderers/              # Section渲染器
│           ├── index.ts
│           ├── SectionWrapper.tsx
│           ├── ProfileRenderer.tsx
│           ├── EducationRenderer.tsx
│           ├── ExperienceRenderer.tsx
│           ├── ProjectRenderer.tsx
│           ├── SkillRenderer.tsx
│           ├── CustomRenderer.tsx
│           └── common.tsx
```

### 修改文件

```
frontend/src/
├── pages/
│   └── ResumeEditorPage.tsx        # 接入新组件
├── layouts/
│   └── EditorLayout.tsx            # 布局调整
└── components/
    └── editor/
        └── AIConversation.tsx      # 改为动态AI面板
```

### 保留文件（暂不删除，用于对比和回退）

```
frontend/src/
├── types/
│   └── resume.ts                   # 旧类型
├── store/
│   └── useResumeStore.ts           # 旧store
└── components/editor/
    ├── ResumePreview.tsx           # 旧预览
    ├── resume-preview/             # 旧预览组件
    └── editor-areas/               # 旧编辑器
```

---

## 十二、总结

### 重构核心收益

1. **架构更清晰**：数据驱动，Editor/Renderer/AI 都操作 ResumeDocument
2. **扩展性更强**：新增模块只需3个文件（类型+Editor+Renderer）
3. **AI深度集成**：直接操作结构化数据，无需手动复制
4. **状态更一致**：单一数据源，单向数据流
5. **模板维护更简单**：共享SectionRenderer，模板只负责布局

### 关键设计决策

| 决策                  | 原因                   |
| --------------------- | ---------------------- |
| Section模块化         | 支持动态增删，模板解耦 |
| 保留旧代码 + 功能开关 | 降低风险，可回退       |
| 共享SectionRenderer   | 减少重复，统一渲染逻辑 |
| Store集中操作         | 状态一致性，可追踪     |

### 下一步行动

1. 确认方案可行性
2. 启动 Phase 1（数据模型层）
3. 逐步推进，每阶段验证后再进入下一阶段
