import {catchAsyncErrors} from "../middleware/cathAsyncErrors.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import {User} from "../models/userSchema.js";
import {genrateToken} from "../utils/jwtToken.js";

export const candidateRegister = catchAsyncErrors(async(req,res,next) => {
    const { firstName, lastName, phone, email, role, dob, password, gender} = req.body;

    if(!firstName || !lastName || !phone || !email || !role || !dob || !password || !gender){
        return next(new ErrorHandler("Please fill all details in the form",400));
    }
    const isRegistered = await  User.findOne({email : email });
    if(isRegistered)
    {
        return next(new ErrorHandler(`${isRegistered.role} with same email already exists`,400));
    }
    const user = await User.create({firstName, lastName, phone, email, role, dob, password, gender});
   
    genrateToken(user, "User Registered",200, res);
   
});

export const login = catchAsyncErrors(async(req,res,next) => {
    const {email, password, role} = req.body;

    if(!email || !password || !role)
    {
        return next(new ErrorHandler("Please fill all the details in the form", 400));
    }

    const user = await User.findOne({email }).select("+password");
    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or Password",400));
    }
    const isPasswordMatched = await user.comparePasswords(password);
    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Invalid Email or Password",400));
    }
    if(role !== user.role)
    {
        return next(new ErrorHandler("User with this role not found",400));
    }
    genrateToken(user, "User Logged In Successfully",200, res);
});

export const addNewRecruiter = catchAsyncErrors(async (req,res,next) => {
    const { firstName, lastName, phone, email, dob, password, gender} = req.body;

    if(!firstName || !lastName || !phone || !email || !dob || !password || !gender){
        return next(new ErrorHandler("Please fill all details in the form",400));
    }

    const isRegistered = await  User.findOne({email : email });
    if(isRegistered)
    {
        return next(new ErrorHandler(`${isRegistered.role} with same email already exists`,400));
    }

    const admin = User.create({firstName, lastName, phone, email, nic, dob, password, gender, role : "Admin"});
    res.status(200).json({
        success : true,
        message : "New Recruiter registered"
    });

});

export const logoutRecruiter = catchAsyncErrors(async(req,res,next) => {
    res.status(200).cookie("recruiterToken","",{
        httpOnly : true,
        expires : new Date(Date.now()),
   }).json({
    success : true,
    message : "Recruiter Logged Out Successfully!"
   });
});

export const logoutCandidate = catchAsyncErrors(async(req,res,next) => {
    res.status(200).cookie("candidateToken","",{
        httpOnly : true,
        expires : new Date(Date.now()),
   }).json({
    success : true,
    message : "Candidate Logged Out Successfully!"
   });
});