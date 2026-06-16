export interface MyResumeItem {
  resume_id: string;
  title: string;
  thumbnail: Text;
  updated_at: Date;
}

export interface MyResumeList {
  resumes: MyResumeItem[];
}

export interface TemplateResumeItem {
  template_id: string;
  resume_id: string;
  name: string;
  category: string;
  thumbnail: Text;
  preview_image: Text;
}
