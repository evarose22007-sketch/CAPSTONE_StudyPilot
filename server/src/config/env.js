require('dotenv').config({ quiet: true });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list of allowed frontend origins, e.g. "http://localhost:5173,https://studypilot.vercel.app"
  CLIENT_ORIGIN: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

function assertEnv() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { env, assertEnv };
