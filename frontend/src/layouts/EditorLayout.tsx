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
}

export default function EditorLayout({
  children,
  leftPanel,
  rightPanel,
  toolbar,
}: EditorLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部工具栏 */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        {/* 左侧区域：logo + 标题 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-800"> Resume Pilot</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          {toolbar}
        </div>

        {/* 右侧区域：开关按钮 + 用户信息 */}
        <div className="flex items-center gap-2">
          {/* 左侧面板开关 */}
          <Tooltip label={leftCollapsed ? '展开编辑区' : '收起编辑区'}>
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className={`p-2 rounded-lg transition-colors ${
                leftCollapsed
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {leftCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
          </Tooltip>

          {/* 右侧面板开关 */}
          <Tooltip label={rightCollapsed ? '展开AI会话' : '收起AI会话'}>
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className={`p-2 rounded-lg transition-colors ${
                rightCollapsed
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {rightCollapsed ? (
                <PanelRightOpen size={18} />
              ) : (
                <PanelRightClose size={18} />
              )}
            </button>
          </Tooltip>
        </div>
      </header>

      {/* 主体内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧编辑区 */}
        <div
          className={`flex-shrink-0 border-r border-gray-200 overflow-hidden transition-all duration-300 ${
            leftCollapsed ? 'w-0' : 'w-80'
          }`}
        >
          <div className="h-full overflow-y-auto">{leftPanel}</div>
        </div>

        {/* 中间预览区 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</div>

        {/* 右侧AI会话区 */}
        <div
          className={`flex-shrink-0 border-l border-gray-200 overflow-hidden transition-all duration-300 ${
            rightCollapsed ? 'w-0' : 'w-96'
          }`}
        >
          <div className="h-full overflow-y-auto">{rightPanel}</div>
        </div>
      </div>
    </div>
  );
}
