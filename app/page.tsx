"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehype from "rehype-raw";
import "chainfury/dist/esm/index.css";
import { Pause, Send, TextArea } from "chainfury";
import React, { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<
    {
      role: string;
      content: string;
    }[]
  >([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState("");

  const handleSendMessage = async () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: search,
      },
    ]);
    setLoading(true);

    setSearch("");
    let currentMessages = [
      ...messages,
      {
        role: "user",
        content: search,
      },
    ];

    const response = await fetch("/api/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: true,
        messages: currentMessages,
      }),
    });

    if (!response.ok) {
      alert("Something went wrong, please try again later.");
      setLoading(false);
      return;
    }
    currentMessages.push({
      role: "assistant",
      content: "",
    });
    const reader = response?.body?.getReader();
    let decoder = new TextDecoder();
    while (true && reader) {
      const chunkReader = await reader.read();

      const { done, value } = chunkReader;
      if (done) {
        break;
      }

      const text = decoder.decode(value);
      const textDatas = text?.split?.("data: ");
      try {
        textDatas?.forEach((textData) => {
          if (!textData) return;

          let content =
            (currentMessages[currentMessages.length - 1].content || "") +
            (JSON.parse(textData)?.choices?.[0]?.delta?.content || "");
          currentMessages[currentMessages.length - 1].content = content;
          setStream(content);
        });
      } catch (e) {
        console.error(e);
      }
      setMessages(currentMessages);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col prose-nbx items-center p-[32px] bg-light-background-app">
      <div className="px-[16px] flex flex-col w-full max-w-[700px] gap-[32px] h-full overflow-scroll pb-[64px]">
        {messages?.map((message, i) => (
          <div
            key={i}
            className="flex flex-col bg-light-background-surfaceLow p-[8px] rounded-md shadow-sm"
          >
            <span className="mini text-light-text-muted">{message?.role}</span>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehype]}
              className={`markdownHolder`}
              urlTransform={(value: string) => value}
              components={{
                table: (props: any) => (
                  <div className="overflow-x-auto w-full">
                    <table {...props} className="table-auto w-full" />
                  </div>
                ),
              }}
            >
              {message?.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>
      <div className="max-w-[700px] w-full">
        <TextArea
          value={search}
          onKeyDown={(e) => {
            if (search?.trim() === "") return;
            if (e.key === "Enter" && e.shiftKey) return;
            if (e.key === "Enter" && !loading) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ask anything"
          className="min-h-[40px!important] pb-[8px] pr-[8px] max-h-[200px] outline-none w-full"
          endIcon={
            <div
              className={`${
                loading ? "opacity-70 cursor-not-allowed" : ""
              } flex gap-[18px] mb-[8px] w-[100px] relative`}
            >
              <div className="w-[16px]">
                {loading ? (
                  <Pause />
                ) : (
                  <Send className="fill-light-icon-base dark:fill-dark-icon-base hover:dark:fill-dark-icon-hover hover:fill-light-icon-hover" />
                )}
              </div>
            </div>
          }
          onEndClick={() => {
            if (search?.trim() === "") return;
            if (loading) return;
            handleSendMessage();
          }}
        />
      </div>
    </div>
  );
}
