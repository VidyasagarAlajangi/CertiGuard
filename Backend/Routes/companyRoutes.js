import { Router } from "express";
import { deleteCompany, getAllCompanies, newCompany, updateCompany } from "../Controllers/companyControllers.js";
import AuthAdmin from "../Middlewares/AuthAdmin.js";

const companyRouter = Router();

// Admin routes
companyRouter.get('/admin/companies', AuthAdmin, getAllCompanies);
companyRouter.post('/companies/new', AuthAdmin, newCompany);
companyRouter.patch('/companies/:id', AuthAdmin, updateCompany);
companyRouter.delete('/companies/:id', AuthAdmin, deleteCompany);

export default companyRouter;