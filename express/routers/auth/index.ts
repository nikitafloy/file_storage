import express from "express";

import { signIn, updateToken, signUp, logout } from "./router";
import { checkAccessToken, validation } from "../../helpers";
import { SignupDto } from "../../../common/dtos/auth/signup.dto";
import { SigninDto } from "../../../common/dtos/auth/signin.dto";
import { getInfo } from "../user/router";

const router = express.Router();

router.post(
  "/signin",
  validation([{ Dto: SigninDto, reqType: "body" }]),
  signIn,
);
router.post("/signin/new_token", updateToken);
router.post(
  "/signup",
  validation([{ Dto: SignupDto, reqType: "body" }]),
  signUp,
);
router.get("/info", checkAccessToken, getInfo);
router.get("/logout", checkAccessToken, logout);

export { router };
