import db from "@/app/lib/db";
console.log({"url": process.env.REDIS_URL})

export async function GET(req: Request) {
  try {
    const [domains] = await db.query(`
      SELECT DISTINCT domain FROM transactions
    `);

    const [locations] = await db.query(`
      SELECT DISTINCT location FROM transactions
    `);

    return new Response(
      JSON.stringify({ domains, locations }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Database error" }),
      { status: 500 }
    );
  }
}