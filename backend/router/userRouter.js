import express from "express";
import {candidateRegister,login,addNewRecruiter,logoutRecruiter,logoutCandidate} from "../controller/userController.js";
import {isRecruiterAuthenticated,isCandidateAuthenticated} from "../middleware/auth.js";
const router = express.Router();

router.post("/login",login);
router.post("/candidate/register",candidateRegister);
router.post("/recruiter/addnew", addNewRecruiter);
router.get("/recruiter/logout",isRecruiterAuthenticated,logoutRecruiter);
router.get("/candidate/logout",isCandidateAuthenticated,logoutCandidate);

export default router;