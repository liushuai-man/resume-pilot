import { useDocumentStore } from '@/store/useDocumentStore';
import type { ResumeStyle, ResumeLayout } from '@/types/resume-document';

const FONT_FAMILIES = [
  { value: "'Microsoft YaHei', 'PingFang SC', sans-serif", label: '微软雅黑' },
  { value: "'SimSun', 'Songti SC', serif", label: '宋体' },
  { value: "'KaiTi', 'STKaiti', serif", label: '楷体' },
  { value: "'Helvetica Neue', Arial, sans-serif", label: 'Helvetica' },
];

const FONT_SIZES = [
  { value: 12, label: '小' },
  { value: 14, label: '中' },
  { value: 16, label: '大' },
];

const ACCENT_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#4f46e5',
  '#be185d',
];

const LAYOUTS = [
  { value: 'classic', label: '经典', desc: '传统单栏布局' },
  { value: 'modern', label: '现代', desc: '时尚双栏布局' },
  { value: 'sidebar', label: '侧边栏', desc: '侧边栏导航布局' },
  { value: 'minimal', label: '简约', desc: '极简风格布局' },
];

export function TemplateSettings() {
  const { document, updateStyle, updateLayout } = useDocumentStore();

  if (!document) return null;

  const style: ResumeStyle = document.style;
  const layout: ResumeLayout = document.layout;

  return (
    <div style={{ padding: '16px', overflow: 'auto', height: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '10px',
          }}
        >
          布局模板
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              onClick={() => updateLayout({ template: l.value as any })}
              style={{
                padding: '10px 8px',
                border:
                  layout.template === l.value
                    ? '2px solid #4f46e5'
                    : '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor:
                  layout.template === l.value ? '#eef2ff' : '#ffffff',
                color: layout.template === l.value ? '#4338ca' : '#374151',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: layout.template === l.value ? 600 : 400,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600 }}>{l.label}</div>
              <div
                style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}
              >
                {l.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '16px 0',
        }}
      />

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          字体
        </label>
        <select
          value={style.fontFamily}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          字号
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {FONT_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateStyle({ fontSize: s.value })}
              style={{
                flex: 1,
                padding: '8px',
                border:
                  style.fontSize === s.value
                    ? '2px solid #4f46e5'
                    : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor:
                  style.fontSize === s.value ? '#eef2ff' : '#ffffff',
                color: style.fontSize === s.value ? '#4338ca' : '#374151',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          主题色
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateStyle({ primaryColor: color })}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: color,
                border:
                  style.primaryColor === color
                    ? '2px solid #1f2937'
                    : '2px solid transparent',
                cursor: 'pointer',
                boxShadow:
                  style.primaryColor === color
                    ? '0 0 0 2px white, 0 0 0 4px #1f2937'
                    : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          行间距: {style.lineHeight}
        </label>
        <input
          type="range"
          min="1.2"
          max="2"
          step="0.1"
          value={style.lineHeight}
          onChange={(e) =>
            updateStyle({ lineHeight: parseFloat(e.target.value) })
          }
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          页边距: {style.margin}px
        </label>
        <input
          type="range"
          min="20"
          max="80"
          step="5"
          value={style.margin}
          onChange={(e) => updateStyle({ margin: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
