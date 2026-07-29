import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getAdminDashboardMetrics,
  getAuditLogs,
} from "../controllers/admin/adminDashboardController.js";
import {
  getAllUsersAdmin,
  toggleUserBlockStatus,
  updateUserRole,
} from "../controllers/admin/adminUserController.js";
import {
  adminDeleteHackathon,
  adminOverrideHackathonStatus,
  getAllHackathonsAdmin,
} from "../controllers/admin/adminHackathonController.js";

const router = Router();

// Protect all admin console routes with admin role guard
router.use(authMiddleware, authorizeRoles("admin"));

// 6A - Metrics & Audit Logs
router.get("/dashboard", getAdminDashboardMetrics);
router.get("/audit-logs", getAuditLogs);

// 6B - User Management
router.get("/users", getAllUsersAdmin);
router.patch("/users/:id/block", toggleUserBlockStatus);
router.patch("/users/:id/role", updateUserRole);

// 6C - Global Hackathons Management
router.get("/hackathons", getAllHackathonsAdmin);
router.patch("/hackathons/:id/status", adminOverrideHackathonStatus);
router.delete("/hackathons/:id", adminDeleteHackathon);

export default router;
