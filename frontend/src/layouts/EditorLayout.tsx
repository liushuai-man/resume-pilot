import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen } from 'lucide-react';

const RESUME_WIDTH = 850;
const MIN_SCALE = 0.4;
const LEFT_MIN_WIDTH = 240;
const LEFT_MAX_WIDTH = 480;
const RIGHT_MIN_WIDTH = 320;
const RIGHT_MAX_WIDTH = 680;
const PREVIEW_MIN_WIDTH = 420;

type ResizeSide = 'left' | 'right' | null;

interface EditorLayoutProps { children: React.ReactNode; leftPanel: React.ReactNode; rightPanel: React.ReactNode; toolbar: React.ReactNode; }

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

export default function EditorLayout({ children, leftPanel, rightPanel, toolbar }: EditorLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(440);
  const [resizing, setResizing] = useState<ResizeSide>(null);
  const [scale, setScale] = useState(1);
  const layoutRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resumeContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const updateScale = () => setScale(Math.min(Math.max(container.offsetWidth / RESUME_WIDTH, MIN_SCALE), 1));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [leftCollapsed, rightCollapsed]);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current && resumeContentRef.current) contentRef.current.style.height = `${resumeContentRef.current.offsetHeight * scale}px`;
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (resumeContentRef.current) observer.observe(resumeContentRef.current);
    return () => observer.disconnect();
  }, [children, scale]);

  useEffect(() => {
    if (!resizing) return;
    const resize = (event: MouseEvent) => {
      const bounds = layoutRef.current?.getBoundingClientRect();
      if (!bounds) return;
      if (resizing === 'left') {
        const available = bounds.width - (rightCollapsed ? 0 : rightWidth) - PREVIEW_MIN_WIDTH;
        const maximum = Math.max(LEFT_MIN_WIDTH, Math.min(LEFT_MAX_WIDTH, available));
        setLeftWidth(clamp(event.clientX - bounds.left, LEFT_MIN_WIDTH, maximum));
      } else {
        const available = bounds.width - (leftCollapsed ? 0 : leftWidth) - PREVIEW_MIN_WIDTH;
        const maximum = Math.max(RIGHT_MIN_WIDTH, Math.min(RIGHT_MAX_WIDTH, available));
        setRightWidth(clamp(bounds.right - event.clientX, RIGHT_MIN_WIDTH, maximum));
      }
    };
    const stop = () => setResizing(null);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stop);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stop);
    };
  }, [leftCollapsed, leftWidth, resizing, rightCollapsed, rightWidth]);

  const panelButtonClass = 'absolute top-2 z-40 border border-[#D8E1DD] bg-white text-[#52615B] shadow-sm hover:bg-[#F3F7F5] hover:text-[#176B52]';
  const transitionClass = resizing ? '' : 'transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none';

  return <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#EEF3F1]">
    <div ref={layoutRef} className="relative flex min-w-0 flex-1 overflow-hidden">
      {leftCollapsed && <Tooltip label="展开编辑区"><ActionIcon variant="outline" color="teal" radius="md" aria-label="展开编辑区" onClick={() => setLeftCollapsed(false)} className={`${panelButtonClass} left-2 !top-14`}><PanelLeftOpen size={16} /></ActionIcon></Tooltip>}
      {rightCollapsed && <Tooltip label="展开 AI 助手"><ActionIcon variant="outline" color="teal" radius="md" aria-label="展开 AI 助手" onClick={() => setRightCollapsed(false)} className={`${panelButtonClass} right-2 !top-14`}><PanelRightOpen size={16} /></ActionIcon></Tooltip>}

      <aside style={{ width: leftCollapsed ? 0 : leftWidth }} className={`relative shrink-0 overflow-hidden border-r border-[#D8E1DD] bg-white ${transitionClass} ${leftCollapsed ? 'border-r-0 opacity-0' : 'opacity-100'}`}>
        {!leftCollapsed && <Tooltip label="收起编辑区"><ActionIcon variant="outline" color="teal" radius="md" aria-label="收起编辑区" onClick={() => setLeftCollapsed(true)} className={`${panelButtonClass} left-2`}><PanelLeftClose size={16} /></ActionIcon></Tooltip>}
        <div style={{ width: leftWidth }} className="h-full overflow-y-auto">{leftPanel}</div>
      </aside>
      {!leftCollapsed && <div role="separator" aria-label="调整编辑区宽度" onMouseDown={() => setResizing('left')} className={`group relative z-30 w-1 shrink-0 cursor-col-resize bg-[#D8E1DD] hover:bg-[#176B52] ${resizing === 'left' ? 'bg-[#176B52]' : ''}`}><span className="absolute left-1/2 top-1/2 h-12 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full group-hover:bg-[#176B52]/15" /></div>}

      <main className="flex min-w-0 flex-1 flex-col bg-gray-100">
        <header className="flex h-12 shrink-0 items-center border-b border-[#D8E1DD] bg-white px-4">{toolbar}</header>
        <div ref={previewContainerRef} className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-4">
          <div ref={contentRef} className="shrink-0 transition-transform duration-300 ease-out" style={{ width: RESUME_WIDTH }}><div ref={resumeContentRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>{children}</div></div>
        </div>
      </main>

      {!rightCollapsed && <div role="separator" aria-label="调整 AI 助手宽度" onMouseDown={() => setResizing('right')} className={`group relative z-30 w-1 shrink-0 cursor-col-resize bg-[#D8E1DD] hover:bg-[#176B52] ${resizing === 'right' ? 'bg-[#176B52]' : ''}`}><span className="absolute left-1/2 top-1/2 h-12 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full group-hover:bg-[#176B52]/15" /></div>}
      <aside style={{ width: rightCollapsed ? 0 : rightWidth }} className={`relative shrink-0 overflow-hidden border-l border-[#D8E1DD] bg-white ${transitionClass} ${rightCollapsed ? 'border-l-0 opacity-0' : 'opacity-100'}`}>
        {!rightCollapsed && <Tooltip label="收起 AI 助手"><ActionIcon variant="outline" color="teal" radius="md" aria-label="收起 AI 助手" onClick={() => setRightCollapsed(true)} className={`${panelButtonClass} right-2`}><PanelRightClose size={16} /></ActionIcon></Tooltip>}
        <div style={{ width: rightWidth }} className="h-full overflow-y-auto">{rightPanel}</div>
      </aside>
    </div>
  </div>;
}
