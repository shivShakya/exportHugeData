import db from "@/app/lib/db";
import { format } from "@fast-csv/format";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const domain = searchParams.get("domain");
  const location = searchParams.get("location");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const csvStream = format({ headers: true });

      csvStream.on("data", (chunk) => {
        controller.enqueue(encoder.encode(chunk.toString()));
      });

      csvStream.on("end", () => {
        controller.close();
      });

      let lastId = 0;
      const batchSize = 10000;

      while (true) {
        let query = `
          SELECT id, transaction_date, domain, location, value, transaction_count
          FROM transactions
          WHERE id > ?
        `;

        const values: any[] = [lastId];

        if (domain) {
          query += " AND domain = ?";
          values.push(domain);
        }

        if (location) {
          query += " AND location = ?";
          values.push(location);
        }

        if (fromDate && toDate) {
          query += " AND transaction_date BETWEEN ? AND ?";
          values.push(fromDate, toDate);
        }

        query += " ORDER BY id LIMIT ?";
        values.push(batchSize);




        console.time("batch");
        const [rows]: any = await db.query(query, values);
        console.timeEnd("batch");

        if (rows.length === 0) break;

        for (const row of rows) {
          csvStream.write(row);
          lastId = row.id;
        }
      }

      csvStream.end();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=transactions.csv",
    },
  });
}