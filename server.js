const { loadEnv } = require('./src-backend/config/env');
const { connectToDatabase } = require('./src-backend/config/db');
const { createApp } = require('./src-backend/app');

loadEnv();

const app = createApp();
const PORT = Number(process.env.PORT) || 3000;

connectToDatabase();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
