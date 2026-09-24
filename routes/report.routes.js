import express from "express";
import { createReport, filterReport, getAll, singleReport } from "../controllers/report.controller.js";
import authMW from "../middleware/authMiddleware.js";

const report_Router= express.Router();

report_Router.get("/all", getAll);
report_Router.post("/reports/:pg_no",  filterReport);
report_Router.post("/reports",authMW,  createReport);
report_Router.get("/report/:id", singleReport);



export default report_Router;