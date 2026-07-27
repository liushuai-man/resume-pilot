import React from 'react';

export interface SectionEditorProps {
  sectionId: string;
  data: any;
  onChange: (data: any) => void;
}

export function SectionTitleInput({
  title,
  onChange,
}: {
  title: string;
  onChange: (title: string) => void;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 500,
          color: '#6b7280',
          marginBottom: '4px',
        }}
      >
        模块标题
      </label>
      <input
        value={title}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
        }}
      />
    </div>
  );
}

export function FormGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 500,
          color: '#6b7280',
          marginBottom: '4px',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '14px',
      }}
    >
      {children}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        ...props.style,
      }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        minHeight: '80px',
        fontFamily: 'inherit',
        ...props.style,
      }}
    />
  );
}

export function AIActionsBar({
  actions,
  onAction,
}: {
  actions: { id: string; label: string; icon: string }[];
  onAction: (actionId: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '8px',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
            backgroundColor: '#f9fafb',
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
