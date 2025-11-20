#!/bin/bash
set -e

echo "🚀 Starting safe deployment for production..."

# Run database migrations (uses environment variables from ECS)
echo "🔄 Running database migrations..."
if npx sequelize-cli db:migrate --env production; then
  echo "✅ Migration successful!"
else
  echo "❌ Migration failed! Rolling back..."
  npx sequelize-cli db:migrate:undo --env production
  echo "⚠️ Rolled back the last migration."
  exit 1
fi

# Install production dependencies
echo "📦 Installing dependencies..."
npm install --production

# PM2 application name
APP_NAME="HiQ-Queue-Microservice"

# Start or reload the app
if pm2 list | grep -q $APP_NAME; then
  echo "♻️ Reloading existing PM2 app with updated environment..."
  pm2 reload $APP_NAME --update-env
else
  echo "🚀 Starting new PM2 app..."
  pm2 start index.js --name $APP_NAME
fi
