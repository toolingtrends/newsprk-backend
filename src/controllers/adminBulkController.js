import prisma from "../prismaClient.js"
import bcrypt from "bcrypt"
import slugify from "slugify"
import xlsx from "xlsx"
import { sendRecruiterEmail } from "../../utils/resendEmail.js"

/* =====================================================
   🔐 Generate Strong Random Password
===================================================== */
function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!%"

  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    )
  }

  return password
}

/* =====================================================
   🔍 Resolve Industry (Leaf-based)
===================================================== */
async function resolveIndustryPath(tx, industryPath) {
  if (!industryPath) {
    throw new Error("Industry path is required")
  }

  const levels = industryPath.split(">").map(l => l.trim())
  const leafName = levels[levels.length - 1]

  const industry = await tx.industry.findFirst({
    where: { name: leafName },
  })

  if (!industry) {
    throw new Error(`Industry not found: ${leafName}`)
  }

  return industry.id
}

/* =====================================================
   🚀 BULK CREATE FULL SETUP
===================================================== */
export async function bulkCreateFullSetup(req, res) {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin only" })
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Excel file required" })
    }

    const workbook = xlsx.read(req.file.buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet)

    const success = []
    const failed = []

    for (const row of rows) {
      try {
        if (!row.email || !row.companyName || !row.industryPath) {
          throw new Error("Missing required fields")
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: row.email },
        })

        if (existingUser) {
          throw new Error("Email already exists")
        }

        const username = row.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")

        const plainPassword = generateRandomPassword()
        const hashedPassword = await bcrypt.hash(plainPassword, 10)

        await prisma.$transaction(async (tx) => {

          /* 🔍 Resolve Industry */
          const industryId = await resolveIndustryPath(tx, row.industryPath)

          /* 1️⃣ Create Company */
          const companySlug = slugify(row.companyName, {
            lower: true,
            strict: true,
          })

          const company = await tx.company.create({
            data: {
              name: row.companyName,
              slug: companySlug + "-" + Date.now(),
              website: row.website || null,
              location: `${row.city || ""}, ${row.state || ""}, ${row.country || ""}`,
              address: row.address || null,
              industryId: industryId,
              description: row.description || null,
              logoUrl: row.logoUrl || null,
              isVerified: true,
            },
          })

          /* 2️⃣ Create Recruiter */
          const recruiter = await tx.user.create({
            data: {
              email: row.email,
              username,
              password: hashedPassword,
              role: "recruiter",
              companyId: company.id,
              emailVerified: true,
            },
          })

          /* 3️⃣ Create Supplier Directory */
          await tx.supplierDirectory.create({
            data: {
              name: row.companyName,
              slug: companySlug + "-directory-" + Date.now(),
              description: row.directoryDescription || null,
              phoneNumber: row.phoneNumber || null,
              email: row.email,
              website: row.website || null,
              logoUrl: row.logoUrl || null,

              videoGallery: row.videoGallery
                ? row.videoGallery.split(",").map(v => v.trim())
                : [],

              socialLinks: {
                facebook: row.facebook || "",
                linkedin: row.linkedin || "",
                twitter: row.twitter || "",
                youtube: row.youtube || "",
                instagram: row.instagram || "",
              },

              companyId: company.id,
              submittedById: recruiter.id,
              status: "APPROVED",
              isLiveEditable: true,
              approvedById: req.user.id,
              approvedAt: new Date(),
            },
          })
        })

        /* 📧 Send Email */
        await sendRecruiterEmail(
          row.email,
          username,
          plainPassword
        )

        success.push({
          email: row.email,
          company: row.companyName,
        })

      } catch (err) {
        failed.push({
          email: row.email || "Unknown",
          error: err.message,
        })
      }
    }

    res.json({
      message: "Bulk upload completed",
      total: rows.length,
      successCount: success.length,
      failedCount: failed.length,
      success,
      failed,
    })

  } catch (error) {
    console.error("Bulk Upload Error:", error)
    res.status(500).json({ error: "Bulk upload failed" })
  }
}

/* =====================================================
   📥 DOWNLOAD FULL FEATURE TEMPLATE
===================================================== */
export async function downloadBulkTemplate(req, res) {
  try {
    const headers = [
      [
        "companyName",
        "email",
        "phoneNumber",
        "website",
        "country",
        "state",
        "city",
        "address",
        "industryPath",
        "logoUrl",
        "description",
        "directoryDescription",
        "videoGallery",
        "facebook",
        "linkedin",
        "twitter",
        "youtube",
        "instagram",
      ],
      [
        "ABC Moulds Pvt Ltd",
        "info@abcmoulds.com",
        "9876543210",
        "https://abcmoulds.com",
        "India",
        "Karnataka",
        "Bengaluru",
        "Whitefield Tech Park",
        "Binder Jetting",
        "https://example.com/logo.png",
        "Leading mould manufacturer",
        "We specialize in injection moulding solutions",
        "https://youtube.com/video1,https://youtube.com/video2",
        "https://facebook.com/abc",
        "https://linkedin.com/abc",
        "https://twitter.com/abc",
        "https://youtube.com/abc",
        "https://instagram.com/abc",
      ],
    ]

    const worksheet = xlsx.utils.aoa_to_sheet(headers)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template")

    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    })

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bulk_supplier_template.xlsx"
    )
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.send(buffer)

  } catch (error) {
    console.error("Template download error:", error)
    res.status(500).json({ error: "Failed to generate template" })
  }
}