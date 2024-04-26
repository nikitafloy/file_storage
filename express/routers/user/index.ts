import express from "express";
import { checkAccessToken } from "../../middleware";
import { getInfo } from "./controller";

const router = express.Router();

router.get("/info", checkAccessToken, getInfo);

export { router };
