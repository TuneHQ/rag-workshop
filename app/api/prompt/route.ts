import { llmStream } from "@/utils";
import { streamText } from "@/utils/bonus";
import { StreamingTextResponse } from "ai";
import e from "express";

export async function POST(req: Request) {
  const { messages, temperature, max_tokens, stream } = await req.json();
  let response = await llmStream({
    messages,
    temperature,
    max_tokens,
    stream,
  });
  console.log(response, typeof response, response.id, "test");
  if (response.id && !stream) {
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (response.id && response.choices?.[0]?.message?.content) {
    response = await streamText(
      response.id && response.choices?.[0]?.message?.content
    );
  }
  return new StreamingTextResponse(response);
}
