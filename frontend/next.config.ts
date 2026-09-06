import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Los productos placeholder son SVG propios (no de terceros), seguros de renderizar
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
