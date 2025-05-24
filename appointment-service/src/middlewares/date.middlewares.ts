import { Request, Response, NextFunction } from "express";

export const validateDate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { day, month, year } = req.query;

  const parsedDay = parseInt(day as string, 10);
  const parsedMonth = parseInt(month as string, 10);
  const parsedYear = parseInt(year as string, 10);
  if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
    return res
      .status(400)
      .json({ message: "Invalid date. It must be in arrange 1 to 31." });
  }
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res
      .status(400)
      .json({ message: "Invalid month. It must be in arrange 1 to 12." });
  }
  if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
    return res
      .status(400)
      .json({ message: "Invalid year. It must be in arrange 1900 to 2100." });
  }
  // Assign parsed numbers safely
  req.query.day = parsedDay as unknown as string;
  req.query.month = parsedMonth as unknown as string;
  req.query.year = parsedYear as unknown as string;

  next();
};
