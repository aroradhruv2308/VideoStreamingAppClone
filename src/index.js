import dotenv from "dotenv";
import { connectToDb } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "../env" });

connectToDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`server started on: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(
      "Starting server error: facing some error while starting the server"
    );
  });
