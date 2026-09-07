export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  group: 'general' | 'contact' | 'social';
  updated_at: string;
}
