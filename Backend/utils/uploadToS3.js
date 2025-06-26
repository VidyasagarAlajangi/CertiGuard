import fs from 'fs';
import s3 from '../lib/s3.js';
import { ensureBucketExists } from './ensureBucket.js';

async function uploadFileToS3(localFilePath, s3Key) {
  const bucketName = process.env.AWS_S3_BUCKET;
  console.log('Using bucket:', bucketName);
  await ensureBucketExists(bucketName);

  const fileContent = fs.readFileSync(localFilePath);

  const params = {
    Bucket: bucketName,
    Key: s3Key,
    Body: fileContent,
    ContentType: 'application/pdf',
  };

  return s3.upload(params).promise();
}

export default uploadFileToS3;