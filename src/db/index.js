import mongoose, { connect } from "mongoose";
import { DB_NAME } from "../constants.js";
export const connectToDb = async () => {
  try {
    console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  } catch (e) {
    console.log(`Database Connect Error:${e}`);
  }
};
