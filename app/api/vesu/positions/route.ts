import { NextResponse } from "next/server";
import { getEarnPositionsByPool } from "../vesuApi";

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(authHeader, CAVOS_TOKEN);
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (token !== CAVOS_TOKEN) {
      console.log(token, CAVOS_TOKEN);
      return NextResponse.json(
        { message: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }
    const { address, pool } = await req.json();

    const earnPositions = await getEarnPositionsByPool(address, pool);
    if (earnPositions) {
      return NextResponse.json({ earnPositions });
    }
    return NextResponse.json({});
  } catch (error: any) {
    console.error("Error fetching vesu positions:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
