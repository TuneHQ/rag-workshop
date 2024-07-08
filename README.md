NOTE: YOU will see alot of types declared as any, this is done due to time limitations of workshop, you should always use proper types.

# Boilerplate Code

This repository contains prebuilt simple chat interface and Hello World GET and POST API examples.

## What we'll build

An RAG application which can ingest and search through a given documentation and answers questions. The app will be a chat UI that will use the [Marvel Universe wiki](https://marvelcinematicuniverse.fandom.com/wiki/Marvel_Cinematic_Universe_Wiki) as data source.  


## Installation Setup

#### 1. Install Node.js and Next.js

Node.Js (>= v18) : [Installation](https://nodejs.org/en/download/package-manager)  
Next.js: [Installation](https://nextjs.org/docs/getting-started/installation)

If you're using Windows, a WSL setup too may be needed.    


#### 2. Get a free account on Supabase

Link: supabase.com

- We need a Postgresql database with the extension `pgvector` installed. 
- Create account on supabase.com gives us a free Postgresql instance with pg_vector
- Or install the db locally with the extension


## Configuration

Using `.env.example` as a template create a `.env` file with the following values:

`CHAT_API_KEY` - API Key from the Model provider. For Tune AI you can obtain it from `Profile > Access Keys` section (check [docs](https://studio.tune.app/docs/concepts/auth#access-keys) for detailed steps)

`CHAT_API_HOST` - If using Tune Studio, set this to `https://proxy.tune.app` (first value)

`EMBEDDING_ENDPOINT` - If using Tune Studio, set this to `https://proxy.tune.app/v1/embedding` (first value)

`MODEL` - If using Tune Studio, set this to `rohan/tune-gpt-4o` (first value)

`EMBEDDING_MODEL` - If using Tune Studio, set this to `openai/text-embedding-ada-002` (first value)

For the nextsection, you can obtain values from the Supabase dashboard

```env
CHAT_API_KEY=sk-tune-tese
CHAT_API_HOST=https://proxy.tune.app // or https://api.openai.com/v1
EMBEDDING_ENDPOINT=https://proxy.tune.app/v1/embedding // or https://api.openai.com/v1/embeddings
MODEL=rohan/tune-gpt-4o // or gpt-4o
EMBEDDING_MODEL=openai/text-embedding-ada-002 // or text-embedding-ada-002
NEXT_PUBLIC_SUPABASE_URL=https://---.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey....
DATABASE_URL=postgresql://postgres.---:---@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

### Checkpoint

1. Install the required dependencies using

    ```bash
    npm install
    ```

1. You should be able to run the Next.js server using

    ```bash
    npm run dev
    ```

  Go to `http://localhost:3000` to see the chat interface.
  There should not be any errors in the console or on the page.

## Database Setup

Run the following SQL commands in Supabase SQL editor to set up the databnse,
and create `documents` table along with the `match_documents` SQL function.

```sql
-- Enable the pg_vector extension, makes the VECTOR data type available
CREATE EXTENSION vector;

-- Create the documents table
CREATE TABLE documents (
    "id" BIGSERIAL PRIMARY KEY,
    "content" TEXT,
    "embedding" VECTOR(1536),
    "url" TEXT,
    "title" TEXT
);

-- Create the match_documents function
-- Starts here
CREATE OR REPLACE FUNCTION match_documents (
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    url TEXT,
    title TEXT,
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        documents.id,
        documents.content,
        documents.url,
        documents.title,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE documents.embedding <=> query_embedding < 1 - match_threshold
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
$$;
-- Ends here
```

### Prisma <-> Next.js Integration

Run `npx prisma init` followed by `npx prisma db pull` to generate the schema files.

## Building Blocks

### Basic Chat Completion

Defines a function, `llmStream` to interact with LLM API.
This function is defined in `utils/index.ts` file, and
used for responding to user queries in the chat interface.

Here is the code for the function:

```javascript
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
  const resp = await fetch(process.env.CHAT_API_HOST + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CHAT_API_KEY,
    },
    body: JSON.stringify({
      temperature: temperature,
      messages: messages,
      model: process.env.MODEL,
      stream: stream,
      max_tokens: max_tokens,
    }),
  });
  console.log(resp);
  return resp.body;
};
```

Use this function for the `api/prompt` endpoint (defined inside the `app/api/prompt/route.ts` file) to interact with the LLM API. The complete code for the file is as follows:

```javascript
import { llmStream } from "@/utils";
import { StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  const { messages, temperature, max_tokens, stream } = await req.json();

  const response = await llmStream({
    messages,
    temperature,
    max_tokens,
    stream,
  });
  console.log(response);

  return new StreamingTextResponse(response);
}
```

### Generating and Saving Embeddings

Defines two functions, `generateEmbeddings` and `saveEmbedding` to generate and save embeddings respectively.

- `generateEmbeddings` function: takes in the page content as input, uses the
embedding model API to generate embeddings, and returns the embeddings.
- `saveEmbedding` function: takes in the page content and the embeddings as input,
and saves the embeddings to the database. Note that the `embedding` column's data type is `VECTOR()`.

```javascript
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
  await prisma.$queryRaw`INSERT INTO documents (title, url, content, embedding) values (${pageContent.title}, ${pageContent.url}, ${pageContent.content}, ${embedding})`;
};
```

### Ingesting Web Page content

For every web page we want, we will

1. Fetch the content of the page
2. Extract the text from relevant sections (paragraphs, headings, etc.)
3. Generate embeddings for the extracted text
4. Save the embeddings to the database

We define a function `injestWebPage` (in the `utils/index.ts` file):

```javascript
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
```

We will now use this function for the `/api/injest` endpoint defined in the `app/api/injest/route.ts` file.
The full contents of the file are as follows:

```javascript
import { injestWebPage } from "@/utils";
import { getSitemapUrls } from "@/utils/bonus";

export async function GET() {
  const urls = (await getSitemapUrls(
    "https://studio.tune.app/docs/sitemap.xml"
  )) as any[];
  for (let i = 0; i < urls.length; i++) {
    await injestWebPage(urls[i]);
  }

  // const url = "https://studio.tune.app/docs/cookbook/supabase-rag";
  // const resp = await injestWebPage(url);
  return new Response(
    JSON.stringify({
      urls,
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
```

### Fetching Similar Documents

Define a function `getSimilarDocuments` (in `utils/index.ts`) to fetch similar documents based on the query.

```javascript
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
```

### Chat completion with Function Call (Putting it all together)

Now, we modify the `llmStream` function to handle function calls and recursive calls.

The `search_docs` function calls' structure is defined in `app/constants/index.ts` file:

The LLM will indicate a function call in the response, and we will handle it by calling the `getSimilarDocuments` function and recursively calling the `llmStream` function with the added information from relevant documents.

```javascript
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

  // New code to handle function calls
  // If the response is a function call, get similar documents and recursively call llmStream with content from top similar documents
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
```
