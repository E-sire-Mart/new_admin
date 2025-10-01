export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:8003";
  // eslint-disable-next-line no-console
  // console.log(url, "-------------------")
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export function getBESiteURL(): string {
  let url = API_URL;
  // eslint-disable-next-line no-console
  // console.log('API_URL from env:', API_URL);
  // Ensure protocol is present
  url = url.startsWith('http') ? url : `https://${url}`;
  // Remove trailing slashes to avoid double slashes when appending api prefix
  url = url.replace(/\/+$/, '');
  // Append API prefix if missing
  if (!/\/api\/v1$/.test(url)) {
    url = `${url}/api/v1`;
  }
  // Ensure trailing slash for axios baseURL consistency
  url = `${url}/`;
  // eslint-disable-next-line no-console
  // console.log('Final backend URL:', url);
  return url;
}
