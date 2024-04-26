import jwt, { JwtPayload } from "jsonwebtoken";

export function createAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS as string, {
    expiresIn: "10m",
  });
}

export function createRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET_REFRESH as string, {
    expiresIn: "1w",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(
    token,
    process.env.JWT_SECRET_ACCESS as string,
  ) as jwt.JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(
    token,
    process.env.JWT_SECRET_REFRESH as string,
  ) as jwt.JwtPayload;
}

export function decodeToken(token: string) {
  return jwt.decode(token) as jwt.JwtPayload;
}
