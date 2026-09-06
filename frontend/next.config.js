/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Los productos placeholder son SVG propios (no de terceros), seguros de renderizar
    dangerouslyAllowSVG: true,
  },
};

module.exports = nextConfig;
