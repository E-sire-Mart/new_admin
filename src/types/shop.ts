export interface Department {
  name: string;
  head: string;
  facultyCount: number;
}

export interface Owner {
  first_name: string;
  last_name: string;
  email: string;
}

export interface Shop {
  _id: string;
  id?: string;
  name: string
  email: string;
  approved: boolean;
  description: string;
  avatar?: string;
  ownerId?: string;
  owner: Owner;
  first_name: string;
  last_name: string;
  phone_number: string;
  created_at?: string;
  updatedAt?: string;
  [key: string]: unknown;
}