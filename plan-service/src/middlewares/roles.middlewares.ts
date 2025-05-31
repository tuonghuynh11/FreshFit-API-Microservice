import { Request, Response, NextFunction } from 'express'
import { UserRole } from '~/constants/enums'
import { TokenPayload } from '~/models/requests/User.requests'

// Middleware to check roles
export const roleValidator = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user_id, role } = req.decoded_authorization as TokenPayload // Assuming `req.user` is set by an authentication middleware

    if (role === undefined || role === null) {
      return res.status(403).json({ message: 'Access denied. No role assigned.' })
    }

    if (!requiredRoles.includes(role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
    }

    next()
  }
}
