export interface User {
  _id: string;
  name?: string;
  avatar?: string;
  email?: string;
  first_name?:string;
  last_name?:string;
  phone_number?:string;
  [key: string]: unknown;
}

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj
  );
}
