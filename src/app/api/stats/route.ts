import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "shifa-super-secret-key-2024-secure";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ diagnoses: 0, reviews: 0 });
    }

    const decoded = verify(token, JWT_SECRET) as { id: string };

    const [diagnoses, reviews] = await Promise.all([
      db.diagnosis.count({ where: { userId: decoded.id } }),
      db.review.count({ where: { userId: decoded.id } }),
    ]);

    return NextResponse.json({ diagnoses, reviews });
  } catch {
    return NextResponse.json({ diagnoses: 0, reviews: 0 });
  }
}
