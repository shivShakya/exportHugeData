
import { s3Object } from "@/app/lib/s3";

export async function GET(
  req: Request,
  context: { params: Promise<{ exportId: string }> }
) {
  const { exportId } = await context.params; 
  const cleanId = exportId.trim();

  const s3Key = `exports/${cleanId}.csv`;

  console.log("Downloading:", s3Key);

  try {

    const object = await s3Object(process.env.BUCKET_NAME! , s3Key);

    if (!object.Body) {
      throw new Error("Empty S3 body");
    }

    return new Response(object.Body as ReadableStream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=transactions-${cleanId}.csv`,
      },
    });

  } catch (err) {
    console.error("S3 download error:", err);

    return Response.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}