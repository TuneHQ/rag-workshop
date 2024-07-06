NOTE: YOU will see alot of types declared as any, this is done due to time limitations of workshop, you should always use proper types.

# Boilerplate Code

This repository contains prebuilt simple chat interface and Hello World GET and POST API examples.

## Configuration

Update the `.env` file with the following values:

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

## Database Setup

Run the following SQL commands to set up your database:

```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
    "id" BIGSERIAL PRIMARY KEY,
    "content" TEXT,
    "embedding" VECTOR(1536),
    "url" TEXT,
    "title" TEXT
);

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
```

## Example Usage

### Supabase RPC Syntax

```javascript
supabaseClient.rpc("match_documents", {
  query_embedding: embedding,
  match_threshold: 0.7,
  match_count: 3,
});
```

### Chat Completion Syntax

```javascript
fetch("https://proxy.tune.app/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer key",
  },
  body: JSON.stringify({
    temperature: 0.8,
    messages: [
      {
        role: "user",
        content: "Hello",
      },
    ],
    model: "model",
    stream: false,
    frequency_penalty: 0,
    max_tokens: 900,
  }),
});
```

### Embedding Generation Syntax

```javascript
await fetch(`${process.env.EMBEDDING_ENDPOINT}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer key",
  },
  body: JSON.stringify({
    input: text,
    model: model,
  }),
}).then((res) => res.json());
```

This README provides essential information to configure, set up, and use the provided boilerplate code effectively.
