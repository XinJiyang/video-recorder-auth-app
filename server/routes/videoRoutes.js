import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const uploadPath = path.resolve("uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("video"), (req, res) => {
  return res.json({ msg: "Upload successful", filename: req.file.filename });
});

export default router;

const uploadDir = path.resolve("uploads");

router.get("/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ msg: "Error reading uploads" });

    const videoFiles = files.filter(file => file.endsWith(".webm"));
    res.json({ videos: videoFiles });
  });
});

router.delete("/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ msg: "File not found" });

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ msg: "Delete failed" });
    res.json({ msg: "Deleted successfully" });
  });
});

router.put("/:filename", (req, res) => {
  const { newName } = req.body;
  if (!newName) return res.status(400).json({ msg: "Missing newName" });

  const oldPath = path.join(uploadDir, req.params.filename);
  const newPath = path.join(uploadDir, newName + ".webm");

  if (!fs.existsSync(oldPath)) return res.status(404).json({ msg: "Original file not found" });

  fs.rename(oldPath, newPath, (err) => {
    if (err) return res.status(500).json({ msg: "Rename failed" });
    res.json({ msg: "Renamed successfully", newFilename: newName + ".webm" });
  });
});

router.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

  res.download(filePath, req.params.filename);
});