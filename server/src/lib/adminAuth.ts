import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

export function isAdminConfigured(): boolean {
  return !!process.env.OWNER_EMAIL && !!process.env.OWNER_PASSWORD;
}

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.OWNER_EMAIL ?? "";
  const expectedPassword = process.env.OWNER_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) return false;
  try {
    const emailMatch = timingSafeEqual(Buffer.from(email), Buffer.from(expectedEmail));
    const passMatch = timingSafeEqual(Buffer.from(password), Buffer.from(expectedPassword));
    return emailMatch && passMatch;
  } catch { return false; }
}

export function createToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; iat: number };
    if (Date.now() - data.iat > TOKEN_TTL_MS) return null;
    return { email: data.email };
  } catch { return null; }
}
