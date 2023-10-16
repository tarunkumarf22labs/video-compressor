const express = require('express');
const ffmpeg = require('fluent-ffmpeg');https://github.com/tarunkumarf22labs/shopclipscsvconverter
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs =  require("fs")
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS to allow cross-origin requests (adjust origins as needed)
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.array('videos', 10), (req, res) => {
  const files = req.files;
  const outputDir = 'compressed_videos';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  files.forEach((file) => {
    const inputPath = path.join(__dirname, 'uploads', file.originalname);
    const outputPath = path.join(__dirname, outputDir, file.originalname);

    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(['-movflags', 'faststart'])
      .on('end', () => {
        console.log(`Compressed: ${file.originalname}`);
      })
      .on('error', (err) => {
        console.error(`Error compressing ${file.originalname}: ${err.message}`);
      })
      .save(outputPath);
  });

  res.send('Video compression in progress');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
