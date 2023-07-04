import express from "express";
import signUpController from "../controllers/signup";

const router = express.Router();

router.post("/", signUpController);

export default router;
