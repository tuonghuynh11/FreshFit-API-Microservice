import { Request, Response, NextFunction } from "express";

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { page, limit } = req.query;

  const parsedPage = parseInt(page as string, 10);
  const parsedLimit = parseInt(limit as string, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return res
      .status(400)
      .json({ message: "Invalid page number. It must be a positive integer." });
  }

  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return res
      .status(400)
      .json({ message: "Invalid limit. It must be a positive integer." });
  }

  // Assign parsed numbers safely
  req.query.page = parsedPage as unknown as string;
  req.query.limit = parsedLimit as unknown as string;

  next();
};
