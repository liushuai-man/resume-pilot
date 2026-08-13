import type { Request, Response } from 'express';
import { getUserProfileOverview } from '../services/profile.service';
import { error, success } from '../utils/response';

export async function getProfileOverviewHandler(req: Request, res: Response) {
  try { const userId = (req as any).user?.id; if (!userId) return error(res, '需要登录', 401); return success(res, await getUserProfileOverview(userId), '获取成功'); }
  catch (err) { return err instanceof Error && err.message === 'USER_NOT_FOUND' ? error(res, '用户不存在', 404) : error(res, '获取个人中心数据失败'); }
}
