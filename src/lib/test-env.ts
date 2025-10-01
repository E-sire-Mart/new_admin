// Test environment variables
export function testEnvironmentVariables(): void {
  // eslint-disable-next-line no-console
  console.log('=== Environment Variables Test ===');
  // eslint-disable-next-line no-console
  console.log('NODE_ENV:', process.env.NODE_ENV);
  // eslint-disable-next-line no-console
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  // eslint-disable-next-line no-console
  console.log('NEXT_PUBLIC_USE_REAL_API:', process.env.NEXT_PUBLIC_USE_REAL_API);
  // eslint-disable-next-line no-console
  console.log('===============================');
}
