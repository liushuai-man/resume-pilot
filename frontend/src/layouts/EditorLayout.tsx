import { useState } from 'react';
import { Tooltip } from '@mantine/core';
import {
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
} from 'lucide-react';

interface EditorLayoutProps {
  children: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  toolbar: React.ReactNode;
  formatToolbar: React.ReactNode;
}

export default function EditorLayout({
  children,
  leftPanel,
  rightPanel,
  toolbar,
  formatToolbar,
}: EditorLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* 顶部工具栏 - 第一层 */}
      <header className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between ">
        {/* 左侧区域：logo + 标题 + 工具栏 */}
        <div className="flex items-center gap-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
              Resume Pilot
            </span>
          </div>
          <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
          {toolbar}
        </div>

        {/* 右侧区域：开关按钮 */}
        <div className="flex items-center gap-2">
          {/* 左侧面板开关 */}
          <Tooltip label={leftCollapsed ? '展开编辑区' : '收起编辑区'}>
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className={`p-1.5 rounded-lg transition-colors ${
                leftCollapsed
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {leftCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </button>
          </Tooltip>

          {/* 右侧面板开关 */}
          <Tooltip label={rightCollapsed ? '展开AI会话' : '收起AI会话'}>
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className={`p-1.5 rounded-lg transition-colors ${
                rightCollapsed
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {rightCollapsed ? (
                <PanelRightOpen size={16} />
              ) : (
                <PanelRightClose size={16} />
              )}
            </button>
          </Tooltip>
        </div>
      </header>

      {/* 格式化工具栏 - 第二层 */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 px-4 flex items-center flex-shrink-0">
        {formatToolbar}
      </div>

      {/* 主体内容区 - 使用 flex 布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧编辑区 - 固定宽度320px */}
        <aside
          className={`flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
            leftCollapsed ? 'w-0 border-r-0 overflow-hidden' : 'w-80'
          }`}
        >
          <div
            className={`h-full overflow-y-auto ${leftCollapsed ? 'w-0' : 'w-80'}`}
          >
            {leftPanel}
          </div>
        </aside>

        {/* 中间预览区 - 居中显示，固定宽度的简历预览 */}
        <main className="flex-1 overflow-y-auto bg-gray-100 flex items-start justify-center py-6">
          {/* 简历预览容器 - 固定宽度800px，确保PDF导出效果一致 */}
          <div className="w-[800px] min-w-[800px] max-w-[800px]">
            {children}
          </div>
        </main>

        {/* 右侧AI会话区 - 固定宽度384px */}
        <aside
          className={`flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
            rightCollapsed ? 'w-0 border-l-0 overflow-hidden' : 'w-96'
          }`}
        >
          <div
            className={`h-full overflow-y-auto ${rightCollapsed ? 'w-0' : 'w-96'}`}
          >
            {rightPanel}
          </div>
        </aside>
      </div>
    </div>
  );
}
