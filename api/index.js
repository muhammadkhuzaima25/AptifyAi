import { app, connectDB } from '../server/server.js';

connectDB().catch(() => {});

export default app;
