import type { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export function success<T>(res: Response, data: T, message = 'Success'): ApiResponse<T> {
  return res.json({
    code: 200,
    message,
    data,
  }) as unknown as ApiResponse<T>;
}

export function error(res: Response, message: string, code = -1): ApiResponse<null> {
  return res.json({
    code,
    message,
    data: null,
  }) as unknown as ApiResponse<null>;
}

export function created<T>(res: Response, data: T, message = 'Created'): ApiResponse<T> {
  return res.status(201).json({
    code: 200,
    message,
    data,
  }) as unknown as ApiResponse<T>;
}

export function notFound(res: Response, message = 'Not found'): ApiResponse<null> {
  return res.status(404).json({
    code: 404,
    message,
    data: null,
  }) as unknown as ApiResponse<null>;
}

export function unauthorized(res: Response, message = 'Unauthorized'): ApiResponse<null> {
  return res.status(401).json({
    code: 401,
    message,
    data: null,
  }) as unknown as ApiResponse<null>;
}

export function forbidden(res: Response, message = 'Forbidden'): ApiResponse<null> {
  return res.status(403).json({
    code: 403,
    message,
    data: null,
  }) as unknown as ApiResponse<null>;
}

export function badRequest(res: Response, message = 'Bad request'): ApiResponse<null> {
  return res.status(400).json({
    code: 400,
    message,
    data: null,
  }) as unknown as ApiResponse<null>;
}
