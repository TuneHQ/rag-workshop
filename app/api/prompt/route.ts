export async function POST(req: Request) {
  const { messages, temperature, max_tokens, stream } = await req.json();

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
