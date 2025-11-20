#!/bin/bash
set -e

echo "🚀 Starting safe deployment for production..."

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Run database migrations
echo "🔄 Running database migrations..."
if dotenv -e .env.production -- npx sequelize-cli db:migrate --env production; then
  echo "✅ Migration successful!"
else
  echo "❌ Migration failed! Rolling back..."
  dotenv -e .env.production -- npx sequelize-cli db:migrate:undo --env production
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

# Health check with retry logic
echo "🌐 Checking health status..."
HEALTH_URL="https://yljbah96ng.execute-api.us-east-1.amazonaws.com/health-check"

for i in {1..5}; do
  if curl -s -f $HEALTH_URL > /dev/null; then
    echo "✅ Health check passed! Server is running successfully."
    break
  else
    echo "⏳ Attempt $i/5 failed. Retrying in 5 seconds..."
    sleep 5
  fi
done

if [ $i -eq 5 ]; then
  echo "❌ Health check failed after multiple attempts! Please verify the service manually."
  exit 1
fi

echo "✅ Deployment completed successfully!"
