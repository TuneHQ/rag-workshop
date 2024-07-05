// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

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
  //
};

export const injestWebPage = async (url: string) => {
  let pageContent = {
    title: "",
    url: "",
    content: "",
  };
  const embedding = "";

  saveEmbedding(pageContent, embedding);
};

const generateEmbeddings = async (pageContent: {
  title: string;
  url: string;
  content: string;
}) => {
  //
  return;
};

const saveEmbedding = async (
  pageContent: {
    title: string;
    url: string;
    content: string;
  },
  embedding: any
) => {};
