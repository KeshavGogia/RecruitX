import nodemailer from "nodemailer";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

 const generateJobNumber = async () => {
    const count = await Job.countDocuments();
    return `RecruitX${count + 1}`;
};

export const createJob = async (req, res) => {
    try {
        const { title, description, requirements, location, salary } = req.body;
        const recruiterId = req.user.id;

        const jobNumber = await generateJobNumber();

        const job = new Job({
            title,
            description,
            requirements,
            location,
            salary,
            recruiter: recruiterId,
            jobNumber,
        });

        await job.save();
        res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const applyForJob = async (req, res) => {
    try {
        const { jobNumber } = req.params;
        const candidateId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "Resume file is required" });
        }

        const job = await Job.findOne({ jobNumber });
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const existingApplication = await Application.findOne({ job: job._id, candidate: candidateId });
        if (existingApplication) {
            return res.status(400).json({ error: "You have already applied for this job" });
        }

        const resumeURL = `/uploads/${req.file.filename}`;

        const { firstName, lastName, email, phone } = req.user;

        const application = new Application({
            job: job._id,
            candidate: candidateId,
            firstName,
            lastName,
            email,
            phone,
            resumeURL,
            jobNumber: job.jobNumber,
        });

        await application.save();

        res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate("recruiter", "name email");
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getApplicants = async (req, res) => {
    try {
        const { jobNumber } = req.params;
        const applications = await Application.find({ jobNumber: jobNumber }).populate("candidate", "name email");
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const { jobNumber } = req.params;
        const job = await Job.findOneAndDelete(jobNumber);
        if (!job) return res.status(404).json({ error: "Job not found" });
        await Application.deleteMany({ jobNumber: jobNumber });
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
