import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives in a subdirectory of a larger repo; pin the tracing root
  // so Next.js doesn't get confused by the parent project's lockfile.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
