import fs from "fs";
import path from "path";
import multer from "multer";

export const createUpload = (folder: string) => {
  const uploadPath = path.join("uploads", folder);

  // ✅ CREATE FOLDER IF NOT EXISTS
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },

      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    }),

    limits: {
      fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only images allowed"));
      }

      cb(null, true);
    },
  });
};