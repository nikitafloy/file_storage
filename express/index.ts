import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { AuthRouter, UserRouter, FileRouter } from "./routers";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/file", FileRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  res.status(400).json({ success: false, message: err.message });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Express server started successfully.");
});
