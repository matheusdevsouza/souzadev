import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  projectType: z.string().min(2),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = contactSchema.parse(payload);

    await prisma.contactLead.create({
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: error.flatten() },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { message: "Erro ao enviar contato" },
      { status: 500 },
    );
  }
}















