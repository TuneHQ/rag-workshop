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
  urls: [
    "https://marvelcinematicuniverse.fandom.com/wiki/Marvel_Cinematic_Universe_Wiki",
    "https://marvelcinematicuniverse.fandom.com/wiki/Iron_Man_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/The_Incredible_Hulk",
    "https://marvelcinematicuniverse.fandom.com/wiki/Iron_Man_2",
    "https://marvelcinematicuniverse.fandom.com/wiki/Thor_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Captain_America:_The_First_Avenger",
    "https://marvelcinematicuniverse.fandom.com/wiki/The_Avengers",
    "https://marvelcinematicuniverse.fandom.com/wiki/Iron_Man_3",
    "https://marvelcinematicuniverse.fandom.com/wiki/Thor:_The_Dark_World",
    "https://marvelcinematicuniverse.fandom.com/wiki/Captain_America:_The_Winter_Soldier",
    "https://marvelcinematicuniverse.fandom.com/wiki/Guardians_of_the_Galaxy_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Avengers:_Age_of_Ultron",
    "https://marvelcinematicuniverse.fandom.com/wiki/Ant-Man_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Captain_America:_Civil_War",
    "https://marvelcinematicuniverse.fandom.com/wiki/Doctor_Strange_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Guardians_of_the_Galaxy_Vol._2",
    "https://marvelcinematicuniverse.fandom.com/wiki/Spider-Man:_Homecoming",
    "https://marvelcinematicuniverse.fandom.com/wiki/Thor:_Ragnarok",
    "https://marvelcinematicuniverse.fandom.com/wiki/Black_Panther_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Avengers:_Infinity_War",
    "https://marvelcinematicuniverse.fandom.com/wiki/Ant-Man_and_the_Wasp",
    "https://marvelcinematicuniverse.fandom.com/wiki/Captain_Marvel_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Avengers:_Endgame",
    "https://marvelcinematicuniverse.fandom.com/wiki/Spider-Man:_Far_From_Home",
    "https://marvelcinematicuniverse.fandom.com/wiki/Black_Widow_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Shang-Chi_and_the_Legend_of_the_Ten_Rings",
    "https://marvelcinematicuniverse.fandom.com/wiki/Eternals_(film)",
    "https://marvelcinematicuniverse.fandom.com/wiki/Spider-Man:_No_Way_Home",
  ],
};

export default constants;
