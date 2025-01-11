import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  try {
    // const user = jwt.verify(token, process.env.JWT_SECRET_KEY || "") as DecodedToken; // Implemented once I get verified with OpenCampus
    const user = jwt.decode(token, { complete: true })?.payload as DecodedToken;
    req.user = {
      username: user.edu_username,
      wallet: user.eth_address,
    };
    next();
  } catch (err) {
    res.status(400).json({ message: "An Error occurred" });
  }
};

export const authenticateUtilityAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // This doesn't contain features as we do not have the Utility NFT verification process ready at the moment.
  console.log("Utility Access Approved");
  next();
};
