import express from "express";

import { signIn, updateToken, signUp, logout } from "./router";
import { checkAccessToken, validation } from "../../helpers";
import { SignupDto } from "../../../common/dtos/auth/signup.dto";
import { SigninDto } from "../../../common/dtos/auth/signin.dto";

const router = express.Router();

router.post("/signin", validation(SigninDto), signIn);
router.post("/signin/new_token", updateToken);
router.post("/signup", validation(SignupDto), signUp);
router.get("/logout", checkAccessToken, logout);

export { router };
