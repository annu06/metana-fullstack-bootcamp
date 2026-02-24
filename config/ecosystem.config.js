// PM2 Ecosystem Configuration File
// This file defines how PM2 should manage your Node.js application

module.exports = {
  apps: [
    {
      // Application configuration (template)
      name: 'myapp',
      script: './server.js', // or './dist/server.js' for built applications
      cwd: '/var/www/html/myapp',

      // Instance configuration
      instances: 'max',
      exec_mode: 'cluster',

      // Environment selection (values come from system/.env file)
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      // Logging configuration
      log_file: '/var/log/pm2/myapp-combined.log',
      out_file: '/var/log/pm2/myapp-out.log',
      error_file: '/var/log/pm2/myapp-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Process management
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',

      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Node.js options
      node_args: [
        '--max-old-space-size=2048'
      ]
    }
  ]
};

// Alternative configuration for multiple applications
/*
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './api/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'worker-queue',
      script: './workers/queue.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'queue'
      }
    },
    {
      name: 'scheduler',
      script: './workers/scheduler.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 0 * * *', // Restart daily at midnight
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'scheduler'
      }
    }
  ]
};
*/

// Configuration for development environment
/*
module.exports = {
  apps: [
    {
      name: 'myapp-dev',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'logs',
        '*.log',
        'public/uploads'
      ],
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DEBUG: 'app:*'
      }
    }
  ]
};
*/