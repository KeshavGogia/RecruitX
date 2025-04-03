import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
    },
    lastName : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        validate : [validator.isEmail, "Enter a valid email"]
    },
    phone : {
        type : String,
        required : true,
    },
    dob : {
        type : Date,
        required : [true , "DOB is required"]
    },
    gender : {
        type : String,
        required : true,
        enum : ["Male", "Female"]
    },
    password : {
        type : String,
        required : true,
        select : false,
    },
    role : {
        type : String,
        required : true,
        enum : ["Candidate", "Recruiter"]
    }
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password ,10);
});

userSchema.methods.comparePasswords = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id : this._id}, process.env.JWT_SECRET_KEY,{
        expiresIn : process.env.JWT_EXPIRES,
    });
};


export const User = mongoose.model("User", userSchema);