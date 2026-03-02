import express from "express"
import multer from "multer"

import {
  getPendingDirectories,
  getDirectoryForReview,
  approveDirectory,
  rejectDirectory,
  adminCreateDirectory,
  adminCreateFullSetup
} from "../controllers/adminDirectoryController.js"

import { 
  bulkCreateFullSetup,
  downloadBulkTemplate
} from "../controllers/adminBulkController.js"

import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
})

router.get("/directories/pending", requireAuth, requireAdmin, getPendingDirectories)
router.get("/directories/:id", requireAuth, requireAdmin, getDirectoryForReview)
router.patch("/directories/:id/approve", requireAuth, requireAdmin, approveDirectory)
router.patch("/directories/:id/reject", requireAuth, requireAdmin, rejectDirectory)

router.post("/create-directory", requireAuth, requireAdmin, adminCreateDirectory)

// ✅ SINGLE FULL SETUP
router.post("/create-full-setup", requireAuth, requireAdmin, adminCreateFullSetup)

// ✅ BULK FULL SETUP (Excel Upload)
router.post(
  "/bulk-full-setup",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  bulkCreateFullSetup
)

// ✅ DOWNLOAD BULK EXCEL TEMPLATE
router.get(
  "/bulk-full-setup/template",
  requireAuth,
  requireAdmin,
  downloadBulkTemplate
)

export default router