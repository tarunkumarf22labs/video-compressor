const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.port || 4000;

const { uploadToS3 } = require("./s3_storage/aws.s3.storage");

// Enable CORS to allow cross-origin requests (adjust origins as needed)
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/file", (req, res) => {
  res.send("working");
});

app.post("/upload", upload.array("videos", 10), async (req, res) => {
  try {
    const files = req.files;
    const outputDir = "compressed_videos";
    if (files && files.length > 0) {
      if (!fs.existsSync(outputDir)) {
        // directory doesn't exist
        fs.mkdirSync(outputDir);
      }
      // Promisify ffmpeg  compression
      const ffmpegPromise = (inputPath, outputPath) => {
        return new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .outputOptions(["-movflags", "faststart"])
            .on("end", () => {
              console.log(`Compressed: ${path.basename(outputPath)}`);
              resolve(outputPath);
            })
            .on("error", (err) => {
              console.error(
                `Error compressing outputPath :${path.basename(
                  outputPath
                )}, inputPath : ${path.basename(inputPath)}: ${err.message}`
              );
              reject(err);
            })
            .save(outputPath);
        });
      };
      // Using async/await to upload to S3
      for (const file of files) {
        const inputPath = path.join(__dirname, "uploads", file.originalname);
        const outputPath = path.join(__dirname, outputDir, file.originalname);
        console.log("inputPath ,outputPath", inputPath, outputPath);
        if (inputPath && outputPath) {
          await ffmpegPromise(inputPath, outputPath);
          // Read the compressed video file
          const fileData = fs.readFileSync(outputPath);
          let result = await uploadToS3(fileData, file);
          if (result) {
            // Remove the local compressed video file
            fs.unlinkSync(outputPath);
            fs.unlinkSync(inputPath);

            return res.status(200).send(result);
          }
        } else {
          return res.status(200).send("Path is not created");
        }
      }
    } else {
      return res.status(200).send("File is not in correct format");
    }
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .send("An error occurred during video processing and upload", error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
