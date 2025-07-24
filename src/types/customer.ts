export interface Customer {
  _id: string;
  id?: string;
  avatar?: string;
  first_name: string;
  // count: number;
  middle_name: string;
  last_name: string;
  publishing_name: string;
  email: string;
  status: boolean;
  phone_number: string;
  created_at?: string;
  [key: string]: unknown;
}
