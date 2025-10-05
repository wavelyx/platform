module.exports = {
  apps: [{
    name: 'client-app',
    cwd: '/var/www/client',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/client-app-error.log',
    out_file: '/var/log/pm2/client-app-out.log',
    log_file: '/var/log/pm2/client-app-combined.log',
    time: true
  }]
}
