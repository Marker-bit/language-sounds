const withPWA = require('next-pwa')({
  dest: 'public'
})

module.exports = withPWA({});

// const withPWA = require("next-pwa");

// module.exports = withPWA({
//   pwa: {
//     dest: "public",
//     register: true,
//     skipWaiting: true,
//   },
// });

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async headers() {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           { key: "Access-Control-Allow-Credentials", value: "true" },
//           { key: "Access-Control-Allow-Origin", value: "*" },
//           {
//             key: "Access-Control-Allow-Methods",
//             value: "GET,HEAD,PUT,PATCH,POST,DELETE",
//           },
//           {
//             key: "Access-Control-Allow-Headers",
//             value: "Content-Type, Authorization",
//           },
//         ],
//       },
//     ];
//   },
// };

// module.exports = {
//   ...nextConfig,
//   ...pwa
// };
