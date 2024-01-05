const {
  s3,
  PutObjectCommand,

} = require("../utils/s3.connection");
require("dotenv").config();


const uploadToS3 = async (
  fileData,
  file
) => {
  const fileName =file.filename
  const randomString = Math.random().toString(36).slice(2, 7);
  const Key = `${randomString}_${fileName}`;
  const fileURL = `https://${process.env.bucketname}.s3.${process.env.region}.amazonaws.com/${Key}`;

  const params = {
    ACL: "public-read",
    // Body: selectedFile,
    Body:fileData,
    Bucket: process.env.bucketname,
    Key,
    ContentType: file.mimetype,
  };


  try {
    const data = await s3.send(new PutObjectCommand(params));
    console.log("data: ", data);
    return {key : Key, fileURL : fileURL}
  } catch (err) {
    console.log("error: " + err);
    throw new Error(err);
  }
};


module.exports = {uploadToS3}