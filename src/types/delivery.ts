export interface DeliveryMan {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  phone_number: string;
  created_at: string;
  isDelivery: boolean;
  avatar?: string;
  DeliveryLicense: string;
}
