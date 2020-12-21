import { Request, Response, NextFunction } from "express";

const cleanBodyFields = (req: Request, res: Response, next: NextFunction) => {
  const { _id, ...validBodyFields } = req.body;

  req.body = validBodyFields;

  next();
};

export default cleanBodyFields;
