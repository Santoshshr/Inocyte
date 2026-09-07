export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at?: string;
}
