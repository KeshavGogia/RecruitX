import nodemailer from "nodemailer";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config({ path: "config/config.env" });
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

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

        const existingApplication = await Application.findOne({
            job: job._id,
            candidate: candidateId,
        });
        if (existingApplication) {
            return res.status(400).json({ error: "You have already applied for this job" });
        }

        // Wrap upload_stream in a Promise
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "resumes",
                        resource_type: "raw",
                        public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const uploadResult = await uploadToCloudinary();

        const { firstName, lastName, email, phone } = req.user;

        const application = new Application({
            job: job._id,
            candidate: candidateId,
            firstName,
            lastName,
            email,
            phone,
            resumeURL: uploadResult.secure_url,
            jobNumber: job.jobNumber,
        });

        await application.save();

        res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        console.error("Error in applyForJob:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllJobs = async (req, res) => {
    try {
      const recruiterId = req.user._id;
  
      const jobs = await Job.find({ recruiter: recruiterId }).populate("recruiter", "name email");
  
      if (jobs.length === 0) {
        return res.status(200).json({ message: "No job listings available for this recruiter." });
      }
  
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };  

export const getApplicants = async (req, res) => {
    try {
        const { jobNumber } = req.params;
        const applications = await Application.find({ jobNumber }).populate("candidate", "name email");

        if (applications.length === 0) {
            return res.status(200).json({ message: "No applicants have applied for this job yet." });
        }

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const deleteJob = async (req, res) => {
    try {
        const { jobNumber } = req.params;

        const job = await Job.findOneAndDelete({ jobNumber });

        if (!job) {
            return res.status(404).json({ error: "Job with given job number not found" });
        }

        await Application.deleteMany({ job: job._id });

        res.status(200).json({ message: "Job and related applications deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getJob = async (req, res, next) => {
    try {
      const { jobNumber } = req.params;
  
      const job = await Job.findOne({ jobNumber }).populate("recruiter", "name email"); // Optional: populate recruiter details
  
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
  
      return res.status(200).json({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        location: job.location,
        recruiter: job.recruiter, 
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch job details", details: error.message });
    }
  };
