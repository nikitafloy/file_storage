import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { getAllConstraints } from "./helpers";

export function validation(
  validateData: { Dto: any; reqType: "query" | "params" | "body" }[],
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for await (const data of validateData) {
      const { Dto, reqType } = data;

      req[reqType] = plainToInstance(Dto, req[reqType]);

      const errs = await validate(req[reqType]);
      if (errs.length) {
        errors.push(getAllConstraints(errs).join(", "));
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        success: false,
        errors: errors.join(", "),
      });
    }

    next();
  };
}
