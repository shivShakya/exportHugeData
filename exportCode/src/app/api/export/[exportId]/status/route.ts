import { exportQueue } from "@/app/lib/redis";

export async function GET(
  req: Request,
  context: { params: Promise<{ exportId: string }> }
) {
  const { exportId } = await context.params;
  console.log({exportId});
  const job = await exportQueue.getJob(exportId);

  if (!job) {
    return Response.json({ status: "not_found" });
  }

  const state = await job.getState();


  const progress = job.progress;
  console.log({progress});

  return Response.json({
    status: state,
    progress: progress ?? 0,
    filePath:
      state === "completed"
        ? job.returnvalue?.filePath
        : null,
  });
}