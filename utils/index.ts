import { load } from "cheerio";
import { PrismaClient } from "@prisma/client";
import constants from "@/app/constants";
const { createClient } = require("@supabase/supabase-js");
const prisma = new PrismaClient();

export const llmStream = async ({
  messages,
  stream,
  temperature,
  max_tokens,
  is_recursive = false,
}: {
  stream: boolean;
  messages: {
    role: string;
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  is_recursive?: boolean;
}): Promise<any> => {
  const resp = (await fetch(process.env.CHAT_API_HOST + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CHAT_API_KEY,
    },
    body: JSON.stringify({
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: constants.system,
        },
        ...messages,
      ],
      model: process.env.MODEL,
      stream: Boolean(is_recursive),
      max_tokens: max_tokens,
      tools: is_recursive ? undefined : constants.tools,
    }),
  })) as any;

  if (!is_recursive) {
    const temp = await resp.json();
    if (
      temp?.choices?.[0]?.message?.tool_calls?.[0]?.function?.name ===
      "search_docs"
    ) {
      const functionVals = JSON.parse(
        temp?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
      );
      const docs = await getSimilarDocuments(functionVals.query);
      return llmStream({
        messages: [
          ...messages,
          {
            role: "user",
            content: `Use below sources to answer above question ${docs?.join(
              "\n\n"
            )}`,
          },
        ],
        stream: true,
        is_recursive: true,
        max_tokens: max_tokens,
        temperature: temperature,
      });
    } else {
      console.log({ temp });
      return temp;
    }
  } else return resp.body;
};

export const injestWebPage = async (url: string) => {
  const urlResp = await fetch(url).then((resp) => resp.text());
  const $ = load(urlResp);
  const title = $("title").text();
  const content = $("h1, h2, h3, table, p, span").text();
  console.log(title, content);
  let pageContent = {
    title: title,
    url: url,
    content: content,
  };
  const embedding = await generateEmbeddings(pageContent);
  // const embedding = "";

  saveEmbedding(pageContent, embedding);
};

const generateEmbeddings = async (pageContent: {
  title: string;
  url: string;
  content: string;
}) => {
  const response = await fetch(`${process.env.EMBEDDING_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CHAT_API_KEY || "",
    },
    body: JSON.stringify({
      input: pageContent.content,
      model: process.env.EMBEDDING_MODEL,
    }),
  }).then((res) => res.json());
  return response?.data?.[0]?.embedding;
};

const saveEmbedding = async (
  pageContent: {
    title: string;
    url: string;
    content: string;
  },
  embedding: any
) => {
  await prisma.$queryRaw`Insert into documents (title, url, content, embedding) values (${pageContent.title}, ${pageContent.url}, ${pageContent.content}, ${embedding})`;
};

export const getSimilarDocuments = async (query: string) => {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const embedding = await generateEmbeddings({
    title: "",
    url: "",
    content: query,
  });
  const data = await supabaseClient.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 3,
  });
  return data?.data?.map(
    (doc: { title: string; url: string; content: string; embedding: any }) => {
      return doc.content;
    }
  );
};
