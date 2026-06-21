import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/adminAuth.js";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" }); return;
  }
  const result = verifyToken(authHeader.slice(7));
  if (!result) { res.status(401).json({ error: "Invalid or expired token" }); return; }
  next();
}
