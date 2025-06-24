import { Router } from "express";
import {
  GetAllUsers,
  GetUser,
  Login,
  SignUp,
  UpdateUser,
  GetUserCertificates,
} from "../Controllers/userControllers.js";
import AuthAdmin from "../Middlewares/AuthAdmin.js";
import userAuth from "../Middlewares/AuthUser.js";

const userRouter = Router();

// Auth routes
userRouter.post("/login", Login);
userRouter.post("/signup", SignUp);
userRouter.get("/me", userAuth, GetUser);

// Admin routes
userRouter.get("/admin/users", AuthAdmin, GetAllUsers);
userRouter.get("/admin/users/:userId/certificates", AuthAdmin, GetUserCertificates);
userRouter.patch("/admin/users/:id", AuthAdmin, UpdateUser);

export default userRouter;
