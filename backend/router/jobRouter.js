import express from "express";
import multer from "multer";
import path from "path";
import { upload } from "../middleware/upload.js";
import { createJob, getAllJobs, applyForJob, getApplicants, deleteJob } from "../controller/jobController.js";
import { isRecruiterAuthenticated, isCandidateAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", isRecruiterAuthenticated, createJob);
router.get("/listings", getAllJobs);
router.post("/apply/:jobNumber", isCandidateAuthenticated, upload.single("resume"), applyForJob);
router.get("/applicants/:jobNumber", isRecruiterAuthenticated, getApplicants);
router.delete("/delete/:jobNumber", isRecruiterAuthenticated, deleteJob);

export default router;
