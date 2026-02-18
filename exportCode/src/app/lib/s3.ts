import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.REGION_NAME!, 
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});


export const upload = (BUCKET_NAME: string, key: string, stream: any, type: string) => {
  return new Upload({
    client: s3,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,             
      Body: stream,          
      ContentType: type,     
    },
  });
};

export const s3Object = async(BUCKET_NAME: string, key : string) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
     
    return await s3.send(command);
}
