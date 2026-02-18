import dotenv from "dotenv";

dotenv.config();

console.log({"sss": process.env.REDIS_URL})

import { Worker } from "bullmq";
import { format } from "@fast-csv/format";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import IORedis from "ioredis";
import mysql from "mysql2/promise";

console.log("Starting exportWorker...");


export const connection = new IORedis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null, 
  }
);

const db = mysql.createPool({
  host: process.env.AWS_RDS_HOST,
  user:  process.env.AWS_RDS_USER,
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


const s3 = new S3Client({
  region: process.env.REGION_NAME, 
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const worker = new Worker(
  process.env.QUEUE_NAME,
  async (job) => {
    console.log("Job received:", job.data);

    const { jobId, filters } = job.data;

    const csvStream = format({ headers: true });

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.BUCKET_NAME,
        Key: `exports/${jobId}.csv`,
        Body: csvStream,
        ContentType: "text/csv",
      },
    });

    let lastId = 0;
    const batchSize = 10000;
    let totalRows = 0;

    try {
      while (true) {

        let query = `
          SELECT id, transaction_date, domain, location, value, transaction_count
          FROM transactions
          WHERE id > ?
        `;
        const values = [lastId];

        if (filters.domain) {
          query += " AND domain = ?";
          values.push(filters.domain);
        }
        if (filters.location) {
          query += " AND location = ?";
          values.push(filters.location);
        }
        if (filters.fromDate && filters.toDate) {
          query += " AND transaction_date BETWEEN ? AND ?";
          values.push(filters.fromDate, filters.toDate);
        }

        query += " ORDER BY id LIMIT ?";
        values.push(batchSize);

        const [rows] = await db.query(query, values);
        console.log(`Fetched ${rows.length} rows`);

        if (rows.length === 0) break;

        for (const row of rows) {
          csvStream.write(row);
          lastId = row.id;
          totalRows++;
        }

        await job.updateProgress(lastId);
      }

      console.log("Finished writing rows, ending CSV...");
      csvStream.end();

      console.log("Uploading to S3...");
      await upload.done();
      console.log("Upload completed!");

      return { filePath: `exports/${jobId}.csv`, rows: totalRows };
    } catch (err) {
      console.error("Worker execution error:", err);
      throw err;
    }
  },
  { connection }
);

worker.on("completed", (job) => console.log(" Finished:", job.id));
worker.on("failed", (job, err) =>
  console.error("Failed:", job?.id, err)
);
worker.on("error", (err) => console.error(" Worker error:", err));