import { Modal, Button, Group, Text } from '@mantine/core';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'success';
}

export default function ConfirmModal({
  opened,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="flex flex-col items-center text-center py-4">
        {type === 'warning' ? (
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        ) : (
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        )}
        <Text size="sm" className="text-gray-600 mb-6">
          {message}
        </Text>
        <Group gap={4} className="justify-center w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant="filled"
            color={type === 'warning' ? 'red' : 'green'}
            onClick={() => {
              onConfirm();
            }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
