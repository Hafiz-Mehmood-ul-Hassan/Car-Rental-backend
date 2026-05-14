import multer from "multer";
import path from "path";

export const createUpload = (folder: string) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `uploads/${folder}`);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    }),

    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
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