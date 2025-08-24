import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../../constants.js";
import { app } from "../../app.js";
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
};

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Database is connected on ${process.env.PORT}`);
});
  })
  .catch((err) => {
    console.log("Error in index.db.js ", err);
    process.exit(1);
  });
