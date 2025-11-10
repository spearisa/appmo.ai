/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import {
  DIVIDER,
  FOLLOW_UP_SYSTEM_PROMPT,
  INITIAL_SYSTEM_PROMPT,
  REPLACE_END,
  SEARCH_START,
} from "@/lib/prompts";
import {
  generateWithHuggingFace,
  HF_SUPPORTED_MODELS,
} from "@/lib/huggingface";

const OPENAI_COMPAT_MODELS = new Set<string>(["gpt-4o-mini"]);
const STREAM_CHUNK_SIZE = Math.max(
  64,
  Number(process.env.STREAM_CHUNK_SIZE ?? 600)
);
const STREAM_DELAY_MS = Math.max(
  0,
  Number(process.env.STREAM_DELAY_MS ?? 0)
);

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const resolveProvider = (provider?: string, model?: string) => {
  if (provider && provider !== "auto") {
    return provider;
  }

  if (model && HF_SUPPORTED_MODELS.has(model)) {
    return "hf-inference";
  }

  if (model && OPENAI_COMPAT_MODELS.has(model)) {
    return "openai-compatible";
  }

  return "hf-inference";
};

const createOpenAIClient = (apiKey?: string, baseUrl?: string) => {
  const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
  if (!resolvedKey) {
    throw new Error(
      "OpenAI API key is required to use the selected OpenAI-compatible model."
    );
  }

  return new OpenAI({
    apiKey: resolvedKey,
    baseURL: baseUrl || process.env.OPENAI_BASE_URL,
  });
};

const streamChunkedText = async (
  text: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder
) => {
  if (!text) return;

  for (let i = 0; i < text.length; i += STREAM_CHUNK_SIZE) {
    const slice = text.slice(i, i + STREAM_CHUNK_SIZE);
    await writer.write(encoder.encode(slice));
    if (STREAM_DELAY_MS > 0) {
      await wait(STREAM_DELAY_MS);
    }
  }
};

const streamError = async (
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  error: any
) => {
  const message =
    error?.message || "An error occurred while processing your request.";
  await writer.write(
    encoder.encode(
      JSON.stringify({
        ok: false,
        message,
      })
    )
  );
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    prompt = "",
    model,
    redesignMarkdown,
    html,
    apiKey,
    baseUrl,
    provider,
  } = body;

  if (!model || (!prompt && !redesignMarkdown)) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const resolvedProvider = resolveProvider(provider, model);

  try {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    (async () => {
      let completeResponse = "";
      try {
        if (resolvedProvider === "hf-inference") {
          completeResponse = await generateWithHuggingFace({
            prompt,
            redesignMarkdown,
            html,
            model,
            mode: "generate",
          });

          await streamChunkedText(completeResponse, writer, encoder);
        } else if (resolvedProvider === "openai-compatible") {
          const openai = createOpenAIClient(apiKey, baseUrl);

          const chatCompletion = await openai.chat.completions.create({
            model,
            stream: true,
            messages: [
              { role: "system", content: INITIAL_SYSTEM_PROMPT },
              {
                role: "user",
                content: redesignMarkdown
                  ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
                  : html
                  ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please create a new design based on this HTML.`
                  : prompt,
              },
            ],
          });

          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (!content) continue;
            completeResponse += content;
            await writer.write(encoder.encode(content));
          }
        } else {
          throw new Error(`Unsupported provider "${resolvedProvider}".`);
        }

        if (!completeResponse.trim()) {
          await streamChunkedText(
            "\n[ERROR] Model returned empty response.\n",
            writer,
            encoder
          );
        }
      } catch (error: any) {
        await streamError(writer, encoder, error);
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error?.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const {
    prompt,
    html,
    previousPrompt,
    selectedElementHtml,
    apiKey,
    model,
    baseUrl,
    provider,
  } = body;

  if (!prompt || !html || !model) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const resolvedProvider = resolveProvider(provider, model);

  try {
    let chunk = "";

    if (resolvedProvider === "hf-inference") {
      chunk = await generateWithHuggingFace({
        prompt,
        html,
        previousPrompt,
        selectedElementHtml,
        model,
        mode: "modify",
      });
    } else if (resolvedProvider === "openai-compatible") {
      const openai = createOpenAIClient(apiKey, baseUrl);

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: FOLLOW_UP_SYSTEM_PROMPT },
          {
            role: "user",
            content:
              previousPrompt ||
              "You are modifying the HTML file based on the user's request.",
          },
          {
            role: "assistant",
            content: `The current code is: \n\`\`\`html\n${html}\n\`\`\` ${
              selectedElementHtml
                ? `\n\nYou have to update ONLY the following element, NOTHING ELSE: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\``
                : ""
            }`,
          },
          { role: "user", content: prompt },
        ],
      });

      chunk = response.choices[0]?.message?.content || "";
    } else {
      throw new Error(`Unsupported provider "${resolvedProvider}".`);
    }

    if (!chunk.trim()) {
      return NextResponse.json(
        { ok: false, message: "Model returned empty response" },
        { status: 400 }
      );
    }

    let newHtml = html;
    const updatedLines: number[][] = [];
    let position = 0;
    let moreBlocks = true;

    while (moreBlocks) {
      const searchStartIndex = chunk.indexOf(SEARCH_START, position);
      if (searchStartIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const dividerIndex = chunk.indexOf(DIVIDER, searchStartIndex);
      if (dividerIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const replaceEndIndex = chunk.indexOf(REPLACE_END, dividerIndex);
      if (replaceEndIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const searchBlock = chunk.substring(
        searchStartIndex + SEARCH_START.length,
        dividerIndex
      );
      const replaceBlock = chunk.substring(
        dividerIndex + DIVIDER.length,
        replaceEndIndex
      );

      if (searchBlock.trim() === "") {
        newHtml = `${replaceBlock}\n${newHtml}`;
        updatedLines.push([1, replaceBlock.split("\n").length]);
      } else {
        const blockPosition = newHtml.indexOf(searchBlock);
        if (blockPosition !== -1) {
          const beforeText = newHtml.substring(0, blockPosition);
          const startLineNumber = beforeText.split("\n").length;
          const replaceLines = replaceBlock.split("\n").length;
          const endLineNumber = startLineNumber + replaceLines - 1;

          updatedLines.push([startLineNumber, endLineNumber]);
          newHtml = newHtml.replace(searchBlock, replaceBlock);
        }
      }

      position = replaceEndIndex + REPLACE_END.length;
    }

    return NextResponse.json({
      ok: true,
      html: newHtml,
      updatedLines,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
