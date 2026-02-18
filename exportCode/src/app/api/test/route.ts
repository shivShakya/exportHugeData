import db from "@/app/lib/db";

export async function GET() {
  const [rows] = await db.query(
    "SELECT COUNT(*) as total FROM transactions"
  );

  return Response.json(rows);
}