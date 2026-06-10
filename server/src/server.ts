import './config/env'; // validates env before anything else runs
import connectDB from './config/db';
import app from './app';
import { env } from './config/env';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`[server] Running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });

    const shutdown = (signal: string) => {
      console.log(`[server] ${signal} received — shutting down gracefully`);
      server.close(() => {
        console.log('[server] HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
};

startServer();
