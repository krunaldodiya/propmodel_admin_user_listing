import { verifyToken } from "propmodel_api_core";

export const tokenVerificationMiddleware = async (req, res, next) => {
  try {
    let apiKey = req.headers.api_key || req.query.api_key;

    let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

    const result = await verifyToken({ apiKey: apiKey, token: token });

    if (!result.success) {
      return res.error(result.message, 401);
    }
    
    next();
  } catch (error) {
    return res.error(error.message, 401);
  }
}; 