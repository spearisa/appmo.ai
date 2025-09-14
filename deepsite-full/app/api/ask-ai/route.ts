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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt, model, redesignMarkdown, html, apiKey, baseUrl } = body;

  // If no API key is provided, use mock responses
  const hasValidApiKey = apiKey || process.env.OPENAI_API_KEY;
  
  const openai = hasValidApiKey ? new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || "",
    baseURL: baseUrl || process.env.OPENAI_BASE_URL,
  }) : null;

  if (!model || (!prompt && !redesignMarkdown)) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

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
        if (!openai) {
          // Mock response when no API key is provided
          const mockHTML = generateMockHTML(prompt);
          completeResponse = mockHTML;
          const words = mockHTML.split('');
          for (let i = 0; i < words.length; i++) {
            await writer.write(encoder.encode(words[i]));
            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate streaming
          }
        } else {
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
        }

        if (!completeResponse.trim()) {
          await writer.write(
            encoder.encode("\n[ERROR] Model returned empty response.\n")
          );
        }
      } catch (error: any) {
        await writer.write(
          encoder.encode(
            JSON.stringify({
              ok: false,
              message:
                error.message ||
                "An error occurred while processing your request.",
            })
          )
        );
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
  } = body;

  // If no API key is provided, return mock response
  const hasValidApiKey = apiKey || process.env.OPENAI_API_KEY;
  
  const openai = hasValidApiKey ? new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || "",
    baseURL: baseUrl || process.env.OPENAI_BASE_URL,
  }) : null;

  if (!prompt || !html) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    let chunk = "";
    
    if (!openai) {
      // Mock response when no API key is provided
      chunk = `Here's an updated version of your HTML based on your request: "${prompt}"\n\n${html}`;
    } else {
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
    }

    if (!chunk.trim()) {
      return NextResponse.json(
        { ok: false, message: "Model returned empty response" },
        { status: 400 }
      );
    }

    // aplica os blocos de modificação SEARCH_START...DIVIDER...REPLACE_END
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

// Mock HTML generation function for when no API key is provided
function generateMockHTML(prompt: string): string {
  const isLanding = prompt.toLowerCase().includes('landing') || prompt.toLowerCase().includes('homepage');
  const isPortfolio = prompt.toLowerCase().includes('portfolio') || prompt.toLowerCase().includes('designer');
  const isEcommerce = prompt.toLowerCase().includes('e-commerce') || prompt.toLowerCase().includes('shop') || prompt.toLowerCase().includes('product');
  const isBlog = prompt.toLowerCase().includes('blog') || prompt.toLowerCase().includes('article');
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appmo Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">`;

  if (isLanding) {
    html += `
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="container mx-auto px-4 py-20">
            <div class="text-center">
                <h1 class="text-5xl font-bold mb-6">Welcome to Appmo</h1>
                <p class="text-xl mb-8 max-w-2xl mx-auto">Transform your business with our innovative solutions and cutting-edge technology.</p>
                <div class="flex gap-4 justify-center">
                    <button class="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                        Get Started
                    </button>
                    <button class="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Features Section -->
    <div class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose Appmo?</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">Discover the features that make us the leading choice for businesses worldwide.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-white rounded-lg shadow-md">
                <div class="text-4xl mb-4 text-blue-600">
                    <i class="fas fa-rocket"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Fast & Reliable</h3>
                <p class="text-gray-600">Lightning-fast performance with 99.9% uptime guarantee.</p>
            </div>
            <div class="text-center p-6 bg-white rounded-lg shadow-md">
                <div class="text-4xl mb-4 text-green-600">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Secure</h3>
                <p class="text-gray-600">Enterprise-grade security to protect your data.</p>
            </div>
            <div class="text-center p-6 bg-white rounded-lg shadow-md">
                <div class="text-4xl mb-4 text-purple-600">
                    <i class="fas fa-cogs"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Customizable</h3>
                <p class="text-gray-600">Tailor the platform to your specific needs.</p>
            </div>
        </div>
    </div>`;
  } else if (isPortfolio) {
    html += `
    <!-- Navigation -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="text-2xl font-bold text-gray-900">Appmo Portfolio</div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="text-gray-700 hover:text-blue-600">Home</a>
                    <a href="#about" class="text-gray-700 hover:text-blue-600">About</a>
                    <a href="#work" class="text-gray-700 hover:text-blue-600">Work</a>
                    <a href="#contact" class="text-gray-700 hover:text-blue-600">Contact</a>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section id="home" class="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <div class="max-w-3xl mx-auto">
                <h1 class="text-5xl font-bold mb-6">Creative Designer</h1>
                <p class="text-xl mb-8">Bringing ideas to life through innovative design and creative solutions with Appmo.</p>
                <button class="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                    View My Work
                </button>
            </div>
        </div>
    </section>`;
  } else {
    // Default/Blog layout
    html += `
    <!-- Blog Header -->
    <header class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-900">Appmo Blog</h1>
                <nav class="hidden md:flex space-x-8">
                    <a href="#" class="text-gray-700 hover:text-blue-600">Home</a>
                    <a href="#" class="text-gray-700 hover:text-blue-600">About</a>
                    <a href="#" class="text-gray-700 hover:text-blue-600">Contact</a>
                </nav>
            </div>
        </div>
    </header>
    
    <!-- Featured Post -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div class="container mx-auto px-4">
            <div class="max-w-3xl">
                <div class="inline-block bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Featured Post
                </div>
                <h2 class="text-4xl font-bold mb-4">The Future of Web Development with Appmo</h2>
                <p class="text-xl mb-6">Exploring the latest trends and technologies shaping the future of web development in 2024.</p>
                <div class="flex items-center text-sm">
                    <span>By Appmo Team</span>
                    <span class="mx-2">•</span>
                    <span>January 15, 2024</span>
                    <span class="mx-2">•</span>
                    <span>5 min read</span>
                </div>
            </div>
        </div>
    </section>`;
  }

  html += `
</body>
</html>`;

  return html;
}
