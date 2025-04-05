import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, minLength: [3, "Title must be at least 3 characters long"] },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobNumber: { type: String, unique: true, required: true }
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);