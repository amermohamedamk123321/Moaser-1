import { verifyToken } from "../utils/jwtToken.js";

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "No token provided",
        message: "Authorization header missing"
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: "Invalid token",
      message: error.message 
    });
  }
}

export { authMiddleware };
