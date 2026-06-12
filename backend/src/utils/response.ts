export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

export function success<T>(data?: T, message = 'success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  }
}

export function error(code: number, message: string): ApiResponse {
  return {
    code,
    message,
  }
}

export function badRequest(message: string): ApiResponse {
  return error(400, message)
}

export function unauthorized(message: string = 'Unauthorized'): ApiResponse {
  return error(401, message)
}

export function forbidden(message: string = 'Forbidden'): ApiResponse {
  return error(403, message)
}

export function notFound(message: string = 'Not Found'): ApiResponse {
  return error(404, message)
}

export function internalError(message: string = 'Internal Server Error'): ApiResponse {
  return error(500, message)
}
