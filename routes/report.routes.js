import express from "express";
import { allReports, createReport, filterReport, singleReport } from "../controllers/report.controller.js";
import authMW from "../middleware/authMiddleware.js";

const report_Router= express.Router();

report_Router.get("/all", allReports)
report_Router.post("/reports/filter/:pg_no", filterReport);
report_Router.post("/reports",authMW,  createReport);
report_Router.get("/reports/:id", singleReport);

export default report_Router;