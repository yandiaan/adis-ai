import 'dotenv/config';
import { env } from '@/config/env';
import app from '@/app';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Allow long-running AI requests (120 seconds)
server.timeout = 120_000;
server.keepAliveTimeout = 120_000;
