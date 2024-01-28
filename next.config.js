/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,HEAD,PUT,PATCH,POST,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = {
  ...nextConfig,
  // module.exports = {
  //   module: {
  //     rules: [
  //       {
  //         test: /\.worker\.js$/,
  //         use: { loader: "worker-loader" },
  //       },
  //     ],
  //   },
  // };
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.worker\.ts$/,
  //     use: { loader: "worker-loader" },
  //   });
  //   return config;
  // }
};
