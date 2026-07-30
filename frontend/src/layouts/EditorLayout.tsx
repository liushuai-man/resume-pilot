import { useState, useEffect, useRef } from 'react';
import { Tooltip, Button } from '@mantine/core';
import {
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
} from 'lucide-react';
import ModelSelector from '@/components/common/ModelSelector';

const RESUME_WIDTH = 850;
const MIN_SCALE = 0.4;

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
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resumeContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const updateScale = () => {
      const width = container.offsetWidth;
      const newScale = Math.min(Math.max(width / RESUME_WIDTH, MIN_SCALE), 1);
      setScale(newScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [leftCollapsed, rightCollapsed]);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current && resumeContentRef.current) {
        contentRef.current.style.height = `${resumeContentRef.current.offsetHeight * scale}px`;
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (resumeContentRef.current) {
      observer.observe(resumeContentRef.current);
    }

    return () => observer.disconnect();
  }, [children, scale]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* 顶部工具栏 - 第一层 */}
      <header className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between ">
        {/* 左侧区域：logo + 标题 + 工具栏 */}
        <div className="flex items-center gap-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">RA</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
              AI 简历助手
            </span>
          </div>
          <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
          {toolbar}
        </div>

        {/* 右侧区域：开关按钮 */}
        <div className="flex items-center gap-2">
          <ModelSelector variant="compact" />

          {/* 左侧面板开关 */}
          <Tooltip label={leftCollapsed ? '展开编辑区' : '收起编辑区'}>
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              leftSection={
                leftCollapsed ? (
                  <PanelLeftOpen size={16} />
                ) : (
                  <PanelLeftClose size={16} />
                )
              }
            ></Button>
          </Tooltip>

          {/* 右侧面板开关 */}
          <Tooltip label={rightCollapsed ? '展开AI助手' : '收起AI助手'}>
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              onClick={() => setRightCollapsed(!rightCollapsed)}
              leftSection={
                rightCollapsed ? (
                  <PanelRightOpen size={16} />
                ) : (
                  <PanelRightClose size={16} />
                )
              }
            ></Button>
          </Tooltip>
        </div>
      </header>

      {/* 主体内容区 - 使用 flex 布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧编辑区 - 响应式宽度 */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex-shrink-0 ${
            leftCollapsed
              ? 'w-0 border-r-0 overflow-hidden opacity-0'
              : 'w-[clamp(240px,20vw,360px)]'
          }`}
        >
          <div className="h-full overflow-y-auto">{leftPanel}</div>
        </aside>

        {/* 中间预览区 - flex-1 自适应，内部内容等比缩放 */}
        <main
          ref={previewContainerRef}
          className="flex-1 overflow-y-auto bg-gray-100 flex items-start justify-center p-4"
          style={{ height: '100%' }}
        >
          {/* 缩放容器 - 固定宽度850px，根据可用空间等比缩放 */}
          <div
            ref={contentRef}
            className="transition-transform duration-300 ease-out flex-shrink-0"
            style={{
              width: RESUME_WIDTH,
            }}
          >
            <div
              ref={resumeContentRef}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
              }}
            >
              {children}
            </div>
          </div>
        </main>

        {/* 右侧AI助手区 - 响应式宽度 */}
        <aside
          className={`bg-white border-l border-gray-200 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex-shrink-0 ${
            rightCollapsed
              ? 'w-0 border-l-0 overflow-hidden opacity-0'
              : 'w-[clamp(360px,28vw,520px)]'
          }`}
        >
          <div className="h-full overflow-y-auto">{rightPanel}</div>
        </aside>
      </div>
    </div>
  );
}
