import { Router } from 'express';
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

router.get('/presets', authMiddleware, getPresets);
router.get('/', authMiddleware, listConfigs);
router.get('/:id', authMiddleware, getConfig);
router.post('/', authMiddleware, createConfig);
router.put('/:id', authMiddleware, updateConfig);
router.patch('/:id/default', authMiddleware, setDefault);
router.delete('/:id', authMiddleware, deleteConfig);
router.post('/test', authMiddleware, testConfig);

export default router;
