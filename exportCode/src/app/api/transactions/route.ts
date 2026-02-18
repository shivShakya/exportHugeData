import db from "@/app/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit")) || 1000;
  const cursor = Number(searchParams.get("cursor")) || 0;

  const domain = searchParams.get("domain");
  const location = searchParams.get("location");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  // Base WHERE clause
  let whereClause = "WHERE id > ?";
  const values: any[] = [cursor];

  // Filters
  if (domain) {
    whereClause += " AND domain = ?";
    values.push(domain);
  }

  if (location) {
    whereClause += " AND location = ?";
    values.push(location);
  }

  if (fromDate && toDate) {
    whereClause += " AND transaction_date BETWEEN ? AND ?";
    values.push(fromDate, toDate);
  }

  const dataQuery = `
    SELECT id, transaction_date, domain, location, value, transaction_count
    FROM transactions
    ${whereClause}
    ORDER BY id
    LIMIT ?
  `;

  const dataValues = [...values, limit];

  const [rows]: any = await db.query(dataQuery, dataValues);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM transactions
    ${whereClause}
  `;

  const [countResult]: any = await db.query(countQuery, values);

  const totalCount = countResult[0]?.total || 0;

  const nextCursor =
    rows.length > 0 ? rows[rows.length - 1].id : null;

  return Response.json({
    data: rows,
    nextCursor,
    meta: {
      totalCount
    }
  });
}
