const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  HeadBucketCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
  region: process.env.region,
});

module.exports = {
  s3,
  CreateBucketCommand,
  PutObjectCommand,
  HeadBucketCommand,
  GetObjectCommand,
  DeleteObjectCommand,
};
