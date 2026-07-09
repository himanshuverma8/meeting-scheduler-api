// src/types/express.d.ts
import "express";                    // ← this line matters (see below)

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}