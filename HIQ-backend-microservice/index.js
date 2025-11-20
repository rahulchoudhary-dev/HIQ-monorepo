require('dotenv').config();
require('./cron');
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const reportsRouter = require('./routes/report.routes');
const uploadRoutes = require('./routes/upload.routes');
const basicAuth = require('express-basic-auth');

const cors = require('cors');

const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { reportQueue } = require('./queue');
const serverAdapter = new ExpressAdapter();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(reportQueue)],
  serverAdapter,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health-check', (req, res) => {
  res.json({ message: 'Welcome to HIQ Backend Microservice 🚀' });
});

app.use('/api/v1/upload-reports', reportsRouter);
app.use('/api/v1/presigned-urls', uploadRoutes);

app.use(
  '/admin/queues',
  basicAuth({
    users: {
      [process.env.BULL_BOARD_USERNAME]: process.env.BULL_BOARD_PASSWORD,
    },
    challenge: true,
  })
);

app.use('/admin/queues', serverAdapter.getRouter());

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 BullMQ dashboard available at http://localhost:${PORT}/admin/queues`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
