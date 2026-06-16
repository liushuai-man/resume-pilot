export interface ResumeBlock {
  id: string;
  type: string;
  data: object;
}

export interface ResumeContent {
  blocks: ResumeBlock[];
}

export interface Resume {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface TemplateSchema {
  blocks: ResumeBlock[];
}

export interface StyleConfig {
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  fontFamily: string;
  backgroundColor?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  preview_image: string;
  schema: TemplateSchema;
  style_config: StyleConfig;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
