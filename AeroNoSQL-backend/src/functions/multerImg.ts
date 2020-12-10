import { Request } from "express";
import crypto from "crypto";
import multer, { Options, FileFilterCallback } from "multer";

/** Express middleware used for uploading profile images */
const multerImg = (endName: string) => {
  const multerConfig: Options = {
    dest: "/tmp",
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, "/tmp");
      },
      filename: (req, file, cb) => {
        const original = req.query.original !== "false";

        crypto.randomBytes(16, (err, buf) => {
          if (err) cb(err, "");
          const filename = `${buf.toString("hex")}${
            original ? "-original" : ""
          }-${endName}.${file.mimetype.replace("image/", "")}`;
          cb(null, filename);
        });
      },
    }),
    limits: {
      fieldSize: 2 * 1024 * 1024,
    },
    fileFilter: (_req: Request, file, cb: FileFilterCallback) => {
      const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png"];

      allowedMimes.includes(file.mimetype)
        ? cb(null, true)
        : cb(
            new Error(
              "INVALID FILE TYPE! ACCEPTED TYPES ARE: JPEG, PJPEG and PNG"
            )
          );
    },
  };

  const multerMiddleware = multer(multerConfig).single("file");

  return multerMiddleware;
};

export default multerImg;
