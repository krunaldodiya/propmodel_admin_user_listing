import { verifyToken } from "propmodel_api_core";

export const verifyTokenFromRequest = async (req) => {  
  let apiKey = req.headers.api_key || req.query.api_key;

  let token = req.headers.authorization;

  return await verifyToken({ apiKey: apiKey, token: token });
};