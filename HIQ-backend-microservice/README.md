# 🚀 Hiq-Queue Microservice

Hiq-Queue is a **Node.js microservice** that manages and processes **report uploads and queue jobs** efficiently using **Express**, **Sequelize**, **BullMQ**, and **AWS S3**.  
It uses **PM2** for process management and a **cron job** to automatically queue pending reports for processing every few minutes.

---

## 🧠 Overview

This microservice performs the following key tasks:

- Uploads files to **AWS S3** using **Multer**.
- Manages queued jobs using **BullMQ** and **Redis**.
- Uses **Sequelize ORM** with a **PostgreSQL** database.
- A **cron job** runs every 5 minutes to:
  - Fetch reports with `stage = 'Pending'` (limit 5).
  - Add them to the BullMQ queue for processing.
- The queue processes each report by calling an external **n8n Webhook** URL.
- Environment variables are managed through a `.env` file.
- Organized with a modular **controller–service–middleware–model** architecture.

---

## 🏗️ Architecture

```

hiq-queue/
├── config/
│   ├── config.js           # Database config (Sequelize)
│   └── redis.js            # Redis connection setup
├── controllers/
│   └── reportController.js # Handles report logic (fetch, upload, etc.)
├── services/
│   ├── reportService.js    # Business logic for report handling
│   └── queueService.js     # BullMQ queue creation & processing
├── middlewares/
│   └── uploadMiddleware.js # Multer setup for S3 upload
├── models/
│   ├── index.js            # Sequelize initialization
│   ├── report.js           # Report model
│   └── user.js             # User model (if applicable)
├── jobs/
│   ├── reportQueue.js      # BullMQ worker & queue configuration
│   └── cronJob.js          # Cron scheduler to fetch & queue reports
├── .env                    # Environment configuration file
├── app.js                  # Express app entry
├── server.js               # Server start with PM2
└── package.json

```

---

## ⚙️ Tech Stack

| Component             | Description                      |
| --------------------- | -------------------------------- |
| **Node.js + Express** | Backend framework                |
| **Sequelize ORM**     | PostgreSQL database integration  |
| **PostgreSQL**        | Relational database              |
| **BullMQ**            | Job/Queue management using Redis |
| **Redis**             | Queue message broker             |
| **AWS S3 + Multer**   | File upload and storage          |
| **Cron (node-cron)**  | Schedules background tasks       |
| **PM2**               | Process manager for Node.js apps |

---

## 🧩 Environment Variables (`.env`)

Example `.env` configuration:

```bash
# Server
PORT=4000
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
DIALECT=postgres

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=hiq-reports-bucket
MAX_FILE_SIZE=104857600   # 100MB
S3_PUBLIC=false

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_MAX_RETRIES=null
REDIS_ENABLE_OFFLINE_QUEUE=true

# Webhook (n8n)
WEBHOOK_URL=https://your-n8n-webhook-url
```

---

## 🧠 Core Logic

### 🕒 Cron Job

- Runs **every 5 minutes**.
- Fetches up to **5 reports** with `stage = 'Pending'`.
- Adds them to the **BullMQ queue** for processing.

### ⚙️ BullMQ Queue

- Worker consumes queued jobs.
- Sends each report to **n8n Webhook** for processing.
- Updates report status in the database once processed.

---

## 🧰 Available Scripts

| Command                    | Description                     |
| -------------------------- | ------------------------------- |
| `npm install`              | Install dependencies            |
| `npm run dev`              | Run the app in development mode |
| `npm start`                | Start the app with PM2          |
| `pm2 logs`                 | View PM2 logs                   |
| `pm2 restart all`          | Restart all PM2 processes       |
| `npx sequelize db:migrate` | Run all database migrations     |

---

## 🧱 PM2 Setup

Start the service using **PM2**:

```bash
pm2 start index.js --name hiq-queue
pm2 save
pm2 startup
```

Monitor logs:

```bash
pm2 logs hiq-queue
```

---

## 📦 Uploads

Uploads are handled via **Multer-S3**:

- Validates file size limit from `FILE_SIZE_LIMIT`.
- Uploads directly to the configured S3 bucket.
- Stores metadata (filename, S3 key, URL) in the `Reports` table.

---

## ✅ Folder Highlights

- **controllers/** → Handle API requests and responses
- **services/** → Business logic and integration with external systems
- **middlewares/** → Request processing (like file uploads)
- **models/** → Sequelize models for DB tables
- **jobs/** → Queue workers and scheduled tasks
- **config/** → Database, Redis, and environment setup
