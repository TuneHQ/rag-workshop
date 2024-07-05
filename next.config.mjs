/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: [
    {
      key: "ngrok-skip-browser-warning",
      value: "ngrok-skip-browser-warning",
    },
  ],
};

export default nextConfig;
