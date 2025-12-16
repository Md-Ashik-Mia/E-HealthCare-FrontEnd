import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  // Keep Next/Turbopack rooted to this project (avoids wrong root inference from other lockfiles)
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Ensure file tracing is relative to the project folder
  outputFileTracingRoot: path.resolve(__dirname),

};

export default nextConfig;
