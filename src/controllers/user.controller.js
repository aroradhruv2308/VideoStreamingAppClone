import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler((req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

export default registerUser;
// comment for adding changes to git with current email
