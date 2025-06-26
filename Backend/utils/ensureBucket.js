import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export async function ensureBucketExists(bucketName, region = process.env.AWS_REGION) {
  try {
    // Check if the bucket exists
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket "${bucketName}" already exists.`);
    return true;
  } catch (err) {
    if (err.statusCode === 404) {
      // Bucket does not exist, create it
      const params = {
        Bucket: bucketName,
        ...(region && region !== 'us-east-1' ? { CreateBucketConfiguration: { LocationConstraint: region } } : {})
      };
      await s3.createBucket(params).promise();
      console.log(`Bucket "${bucketName}" created.`);
      return true;
    } else {
      // Some other error (e.g., forbidden)
      console.error('Error checking/creating bucket:', err);
      throw err;
    }
  }
} 