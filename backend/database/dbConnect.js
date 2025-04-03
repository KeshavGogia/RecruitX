import mongoose from "mongoose";
import colors from 'colors';

export const dbConnection = () => {
    mongoose
        .connect(process.env.MONGO_URI,{
            dbName : "RecruitX",
        })
        .then(() => {
            console.log(colors.green("Connected to Database!"));
        })
        .catch(err => {
            console.log(colors.red("Error connecting to database", err));
        })
}