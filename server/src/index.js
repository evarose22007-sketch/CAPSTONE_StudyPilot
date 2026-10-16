const { env, assertEnv } = require('./config/env');
const connectDB = require('./config/db');
const createApp = require('./app');

async function start() {
  try {
    assertEnv();
    await connectDB(env.MONGODB_URI);
    const app = createApp();
    app.listen(env.PORT, () => {
      console.log(`StudyPilot API listening on port ${env.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
