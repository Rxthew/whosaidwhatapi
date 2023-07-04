import express from "express";
import adminController from "../controllers/admin";

const router = express.Router();

router.get("/", adminController);

export default router;
