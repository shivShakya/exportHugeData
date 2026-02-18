import { exportQueue } from "@/app/lib/redis";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { domain, location, fromDate, toDate } = await req.json();

  const exportId = uuid();

  await exportQueue.add(
    "export_csv",
    {
      filters: { domain, location, fromDate, toDate },
      jobId: exportId, 
    },
    {
       jobId: exportId, 
    }
  );

  return Response.json({
    exportId,
    status: "queued",
  });
}
