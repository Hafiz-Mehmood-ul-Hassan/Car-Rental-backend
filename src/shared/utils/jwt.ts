import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || JWT_SECRET;

export const generateToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, REFRESH_JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_JWT_SECRET) as any;
};