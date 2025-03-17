import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: './.env'
}) // Load environment variables


connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB connection Failed", error);
    process.exit(1); // Exit process if DB fails to connect
  });


// Alternative IIFE Approach
/*
(async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in .env file");
        }

        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

        app.on("error", (error) => {
            console.log("Error occurred", error);
            throw error;
        });

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`App is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error:", error);
        process.exit(1); // Exit the process on error
    }
})();
*/

