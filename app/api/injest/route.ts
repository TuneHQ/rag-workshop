export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Hello World",
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
