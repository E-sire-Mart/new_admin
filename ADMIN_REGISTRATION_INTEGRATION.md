# Admin Registration Integration

## Overview
This document describes the integration of the admin registration functionality with the backend API.

## Backend Endpoints
The frontend now integrates with the following backend endpoints:

- **POST** `/api/v1/auth/admin-register` - Admin registration
- **POST** `/api/v1/auth/admin-login` - Admin login

## Registration Flow

### 1. Registration Form
The registration form (`src/components/auth/sign-up-form.tsx`) includes:
- First Name (required)
- Last Name (required)
- Email (required)
- Password (required, min 6 characters)
- Phone Number (optional)
- Terms and Conditions acceptance (required)

### 2. Backend Integration
The auth client (`src/lib/auth/client.ts`) sends registration data in the format:
```json
{
  "data": {
    "attributes": {
      "email": "admin@example.com",
      "password": "password123",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+1234567890"
    }
  }
}
```

### 3. Response Handling
- **Success**: Shows success message with email verification instructions
- **Error**: Displays specific error messages from the backend
- **Verification**: Users must verify their email before they can login

## Environment Variables
Make sure to set the following environment variable:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

## Usage
1. Navigate to `/auth/sign-up`
2. Fill out the registration form
3. Submit the form
4. Check email for verification link
5. After verification, use `/auth/sign-in` to login
6. Access the admin dashboard at `/dashboard`

## Features
- ✅ Form validation using Zod
- ✅ Error handling and user feedback
- ✅ Email verification flow
- ✅ JWT token management
- ✅ Admin-only access control
- ✅ Responsive design with Material-UI


