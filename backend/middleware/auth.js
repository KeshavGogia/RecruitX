import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./cathAsyncErrors.js";
import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

export const isRecruiterAuthenticated = catchAsyncErrors(async(req,res,next) => {
    // Allow internal requests (e.g., from backend service)
    if (req.headers['x-internal-call'] === 'true') {
        return next();
    }

    const token = req.cookies.recruiterToken;
    if(!token) {
        return next(new ErrorHandler("Recruiter not authenticated", 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id); 

    if(req.user.role !== "Recruiter") {
        return next(new ErrorHandler(`${req.user.role} not authorized for this resource`, 403));
    }

    next();
});

export const isCandidateAuthenticated = catchAsyncErrors(async(req,res,next) => {
    const token = req.cookies.candidateToken;
    if(!token)
    {
        return next(new ErrorHandler("Candidate not authenticated",400));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById( decoded.id ); 
    if(req.user.role !== "Candidate")
    {
        return next( new ErrorHandler(`${req.user.role} not authorized for this resource`,403));
    }
    next();
});