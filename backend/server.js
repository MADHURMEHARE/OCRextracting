import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/extract", upload.single("file"), async (req, res) => {
  console.log("API HIT");

  try {
    // ✅ check file
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("FILE RECEIVED:", req.file.originalname);

    const result = await Tesseract.recognize(req.file.path, "eng");

    const text = result.data.text;

    // ✅ VERY IMPORTANT: log OCR output
    console.log("OCR TEXT ↓↓↓");
    console.log(text);

    // ✅ flexible extraction
    const data = {
      name: text.match(/name[:\-]?\s*(.*)/i)?.[1]?.trim() || "",
      email: text.match(/email[:\-]?\s*(.*)/i)?.[1]?.trim() || "",
      amount: text.match(/amount[:\-]?\s*(.*)/i)?.[1]?.trim() || "",
      date: text.match(/date[:\-]?\s*(.*)/i)?.[1]?.trim() || ""
    };

    res.json(data);

  } catch (err) {
    console.error("OCR ERROR:", err);
    res.status(500).json({ error: "Extraction failed" });
  }
});

app.listen(5000, () =>
  console.log("Backend running on http://localhost:5000")
);
