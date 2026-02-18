import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.AWS_RDS_HOST,
  user:  process.env.AWS_RDS_USER,
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;