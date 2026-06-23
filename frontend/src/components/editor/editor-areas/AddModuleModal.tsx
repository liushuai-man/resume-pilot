import { Modal, Button, Card } from '@mantine/core';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderOpen,
  Wrench,
  Award,
  Target,
  Users,
  X,
} from 'lucide-react';

interface AddModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (moduleId: string) => void;
}

interface ModuleItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const modules: ModuleItem[] = [
  {
    id: 'basic',
    label: '基础信息',
    description: '姓名、联系方式、个人简介等基本信息',
    icon: <User size={24} />,
  },
  {
    id: 'education',
    label: '教育经历',
    description: '学历背景、在校成绩、主修课程等',
    icon: <GraduationCap size={24} />,
  },
  {
    id: 'experience',
    label: '工作经历',
    description: '工作经验、岗位职责、工作成果等',
    icon: <Briefcase size={24} />,
  },
  {
    id: 'projects',
    label: '项目经验',
    description: '项目经历、技术栈、项目成果等',
    icon: <FolderOpen size={24} />,
  },
  {
    id: 'skills',
    label: '专业技能',
    description: '专业技能、语言能力、工具掌握等',
    icon: <Wrench size={24} />,
  },
  {
    id: 'certifications',
    label: '证书荣誉',
    description: '职业资格证书、获奖经历等',
    icon: <Award size={24} />,
  },
  {
    id: 'campus',
    label: '校园经历',
    description: '社团活动、学生会工作、社会实践等',
    icon: <Users size={24} />,
  },
  {
    id: 'objective',
    label: '职业目标',
    description: '职业规划、发展方向等',
    icon: <Target size={24} />,
  },
];

export default function AddModuleModal({
  isOpen,
  onClose,
  onSelect,
}: AddModuleModalProps) {
  const handleSelect = (moduleId: string) => {
    onSelect(moduleId);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">添加模块</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      }
      size="lg"
      className="max-w-2xl"
      overlayProps={{ opacity: 0.5 }}
    >
      <div className="grid grid-cols-2 gap-3 mt-4">
        {modules.map((module) => (
          <Card
            key={module.id}
            onClick={() => handleSelect(module.id)}
            className="cursor-pointer border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 p-4 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                {module.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-1">
                  {module.label}
                </h3>
                <p className="text-sm text-gray-500">{module.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
      </div>
    </Modal>
  );
}
