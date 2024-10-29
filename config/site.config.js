const path = require("path");

const config = {
  title: "Ono | Send AI", //Title
  description: "The future in your pocket.", //Meta Description
  template: path.resolve(__dirname, "../src/index.html"), //Input file
  filename: "index.html", // Output file
  charset: 'utf-8', //Meta tag injected into HTML
  viewport: '<meta name="viewport" content="width=device-width, initial-scale=1">', //Meta tag injected into HTML
  // OG Meta data (Facebook)
  ogType: "website",
  ogTitle: "Ono | Send AI",
  ogDescription: "The future in your pocket.",
  ogImageLink: "https://images.fictiontribe.com/simstim-og.jpg",
  // OG Meta data (Twitter)
  ogTwitterCard: "summary_large_image",
  ogTwitterTitle: "Ono | Send AI",
  ogTwitterDescription: "The future in your pocket.",
  ogTwitterImage: "https://images.fictiontribe.com/simstim-og.jpg",
  // Analytics
  googleAnalyticsId: "", //G-XXXXXXXXXX
  googleTagManagerId: "", //GTM-XXXXXXX

  env: process.env.NODE_ENV, //Development or Production
  productionPublicFolder: "./", //Build script builds dist for relative paths by default


  //Default directories
  paths: {
    src: path.resolve(__dirname, "../src"), // Source files
    dist: path.resolve(__dirname, "../dist"), // Production build files
    public: path.resolve(__dirname, "../public"), // Static files that get copied to build folder
  },

};

module.exports = config;
