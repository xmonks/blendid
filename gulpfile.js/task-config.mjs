export default {
  html: true,
  images: true,
  cloudflare: false,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: true,
  stylesheets: true,
  esbuild: true,

  production: {
    rev: {
      exclude: ["_headers", "_redirects"]
    }
  },

  watch: {
    tasks: []
  }
};
