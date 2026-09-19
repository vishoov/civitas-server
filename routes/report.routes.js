import express from "express";
import { createReport, filterReport } from "../controllers/report.controller.js";
import authMW from "../middleware/authMiddleware.js";

const report_Router= express.Router();

report_Router.get("/reports", authMW,  filterReport);
report_Router.post("/reports",authMW,  createReport);


export default report_Router;