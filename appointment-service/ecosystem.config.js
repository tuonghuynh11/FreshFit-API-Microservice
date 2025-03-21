// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: "appointment-service",
      script: "dist/server.js",
      env: {
        NODE_ENV: "development", // Riêng NODE_ENV thì có thể dùng process.env.NODE_ENV hoặc process.NODE_ENV, còn lại thì chỉ được dùng process.env.TEN_BIEN
        TEN_BIEN: "Gia tri",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
