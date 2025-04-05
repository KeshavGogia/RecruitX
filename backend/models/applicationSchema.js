import validator from "validator";
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, validate: [validator.isEmail, "Enter a valid email"] },
    phone: { type: String, required: true },
    resumeURL: { type: String, required: true },
    jobNumber: { type: String, required: true },
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);
