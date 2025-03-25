import { Request, Response, NextFunction } from "express";

export const validateMonth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { month } = req.query;

  const parsedMonth = parseInt(month as string, 10);

  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res
      .status(400)
      .json({ message: "Invalid month. It must be in arrange 1 to 12." });
  }

  // Assign parsed numbers safely
  req.query.parsedMonth = parsedMonth as unknown as string;
  next();
};
