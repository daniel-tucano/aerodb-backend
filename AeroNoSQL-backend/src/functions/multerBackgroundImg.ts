import { Request } from "express";
import multer, { Options, FileFilterCallback } from "multer";

const multerConfig: Options = {
  dest: "/tmp",
  storage: multer.diskStorage({
    destination: (_req, _file, cd) => {
      cd(null, "/tmp");
    },
    filename: (req, file, cb) => {
      const original = req.query.original !== "false";

      const filename = `${req.params.id}${
        original ? "-original" : ""
      }-background-image`;
      cb(null, filename);
    },
  }),
  limits: {
    fieldSize: 3 * 1024 * 1024,
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

/** Express middleware used for uploading background images */
const multerProfileImg = () => {
  const multerMiddleware = multer(multerConfig).single("file");

  return multerMiddleware;
};

export default multerProfileImg;
