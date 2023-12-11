import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app
  .get("/", async (req, res, next) => {
    const val = await getDataFromDB(req);
  })
  .then(() => {
    console.log("we got the data");
  })
  .catch(() => {
    console.log("we got the error");
  });
export { app };
