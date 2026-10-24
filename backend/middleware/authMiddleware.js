import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication token is required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({ error: "Authentication is unavailable" });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    if (error.name !== "TokenExpiredError" &&
        error.name !== "JsonWebTokenError" &&
        error.name !== "NotBeforeError") {
      console.error("Token verification failed:", error);
    }

    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
