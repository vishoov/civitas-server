import express from "express";
import { createReport, filterReport, singleReport } from "../controllers/report.controller.js";
import authMW from "../middleware/authMiddleware.js";

const report_Router= express.Router();

report_Router.get("/reports/:pg_no", authMW,  filterReport);
report_Router.post("/reports",authMW,  createReport);
report_Router.get("/reports/:id", singleReport);


export default report_Router;