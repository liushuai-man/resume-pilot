import jwt from 'jsonwebtoken'
import { authConfig } from '../config/auth'

export function generateToken(payload: object): string {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
  })
}

export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, authConfig.jwt.secret) as object
  } catch {
    return null
  }
}

export function decodeToken(token: string): object | null {
  try {
    return jwt.decode(token) as object
  } catch {
    return null
  }
}
