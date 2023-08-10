import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model } = body;

    if (!apiKey) {
      return new NextResponse("请填入API Key...", { status: 400 });
    }

    const configuration = new Configuration({ apiKey });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: model ?? "gpt-3.5-turbo",
      messages: [{ role: "user", content: "who are you!" }],
    });

    return NextResponse.json(response.data.choices[0].message?.content);
  } catch (error: any) {
    console.log(error.response);
    if (error?.response?.data?.error?.message) {
      return new NextResponse(error.response.data.error.message, {
        status: 401,
      });
    }
    return new NextResponse("检查服务异常", { status: 500 });
  }
}
