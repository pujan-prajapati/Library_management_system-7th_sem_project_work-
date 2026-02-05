import { Router } from "express";
const router = Router();
import {
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.contollers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

router.route("/registerUser").post(registerUser);
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(authMiddleware, logoutUser);
router.route("/").get(getAllUsers);

export const userRoutes = router;
