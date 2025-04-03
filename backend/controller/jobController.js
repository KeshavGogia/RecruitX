import nodemailer from "nodemailer";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createJob = async (req, res) => {
    try {
        const { title, description, requirements, location, salary } = req.body;
        const recruiterId = req.user.id;
        const job = new Job({ title, description, requirements, location, salary, recruiter: recruiterId });
        await job.save();
        res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const candidateId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "Resume file is required" });
        }

        // Fetch job details
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Check if the candidate has already applied
        const existingApplication = await Application.findOne({ job: jobId, candidate: candidateId });
        if (existingApplication) {
            return res.status(400).json({ error: "You have already applied for this job" });
        }

        // Get user details from `req.user`
        const { firstName, lastName, email, phone } = req.user;
        const resumeURL = `/uploads/${req.file.filename}`; 

        // Save application
        const application = new Application({
            job: jobId,
            candidate: candidateId,
            firstName,
            lastName,
            email,
            phone,
            resumeURL,
        });

        await application.save();

        // Send Email Notification
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "flirtalertincoming@gmail.com",
                pass: "Keshav@510",
            },
        });

        const mailOptions = {
            from: "flirtalertincoming@gmail.com",
            to: email,
            subject: `Application Received for ${job.title}`,
            text: `Dear ${firstName},\n\nYour application for the position of "${job.title}" has been successfully submitted.\n\nJob Details:\nTitle: ${job.title}\nLocation: ${job.location}\nSalary: ${job.salary}\n\nThank you!\nRecruitment Team`,
        };

        await transporter.sendMail(mailOptions);

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
        const { jobId } = req.params;
        const applications = await Application.find({ job: jobId }).populate("candidate", "name email");
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findByIdAndDelete(jobId);
        if (!job) return res.status(404).json({ error: "Job not found" });
        await Application.deleteMany({ job: jobId });
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
