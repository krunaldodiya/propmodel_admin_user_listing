export const verifyTokenFromRequest = async (req) => {
  let tokenVerified;
  let apiKey = req.headers.api_key || req.query.api_key;
  let token = req.headers.authorization;

  if (apiKey) {
    tokenVerified = await verifyToken({ apiKey: apiKey });
  } else if (token) {
    tokenVerified = await verifyToken({ token: token });
  }

  return tokenVerified;
}; 