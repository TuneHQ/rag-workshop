const constants = {
  tools: [
    {
      type: "function",
      function: {
        name: "search_docs",
        description: "Search the documentation for a specific question.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query.",
            },
          },
        },
      },
    },
  ],
  system: `You are a chatbot that responds to user queries in proper Markdown format. When applicable, include code snippets and access relevant documentation to provide accurate and comprehensive answers. Ensure your responses are well-structured, informative, and easy to understand. Use provided tools to generate responses unless its very basic question. Try to keep answers short and to the point.`,
  urls: [],
};

export default constants;
