import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getPresets,
  listConfigs,
  getConfig,
  createConfig,
  updateConfig,
  setDefault,
  deleteConfig,
  testConfig,
} from '../controllers/model-config.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

const connectionTestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id || 'anonymous',
  message: {
    code: 429,
    message: '模型连接测试过于频繁，请稍后再试',
    data: null,
  },
});

router.get('/presets', authMiddleware, getPresets);
router.get('/', authMiddleware, listConfigs);
router.get('/:id', authMiddleware, getConfig);
router.post('/', authMiddleware, connectionTestRateLimit, createConfig);
router.put('/:id', authMiddleware, updateConfig);
router.patch('/:id/default', authMiddleware, setDefault);
router.delete('/:id', authMiddleware, deleteConfig);
router.post('/test', authMiddleware, connectionTestRateLimit, testConfig);

export default router;
