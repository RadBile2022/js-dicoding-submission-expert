module.exports = {
  apps: [
    {
      name: 'forum-api',
      script: 'src/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
