import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";

export function validation(Dto: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const params = { ...req.query, ...req.params, ...req.body };

    const instanceDto = new Dto();
    for (const key of Object.keys(params)) {
      instanceDto[key] = params[key];
    }

    const errors = await validate(instanceDto);

    if (errors.length > 0) {
      return res.status(400).send({
        success: false,
        errors: errors
          .map((e) => e.constraints && Object.values(e.constraints).join(", "))
          .filter(Boolean)
          .join(", "),
      });
    }

    next();
  };
}
