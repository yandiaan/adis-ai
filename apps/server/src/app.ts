import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { join } from 'path';
import router from '@/routes/index';
import nodeRoutes from '@/routes/nodeRoutes';
import uploadRoutes from '@/routes/uploadRoutes';
import pipelineRoutes from '@/routes/pipelineRoutes';
import aiTemplateRoutes from '@/routes/aiTemplateRoutes';
import { errorHandler } from '@/middleware/errorHandler';
import { requestTimingGate } from '@/middleware/requestTimingGate';
import { ipRateLimiter } from '@/middleware/ipRateLimiter';
import { compositeIdentityMiddleware } from '@/middleware/compositeIdentity';
import { budgetCircuitBreaker } from '@/middleware/budgetCircuitBreaker';

const app: Application = express();

// Security & utility middleware
// Configure helmet to allow images from same origin and data URLs
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads directory with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(join(process.cwd(), 'uploads')));

// Routes
app.use('/api', router);
// AI routes — protected by layered middleware: timingGate → ipLimit → compositeIdentity → budgetBreaker
const aiProtection = [requestTimingGate, ipRateLimiter, compositeIdentityMiddleware, budgetCircuitBreaker] as const;
app.use('/api/node', ...aiProtection, nodeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pipeline', ...aiProtection, pipelineRoutes);
app.use('/api/ai', ...aiProtection, aiTemplateRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
