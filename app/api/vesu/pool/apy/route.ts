import { NextResponse } from "next/server";
import { getVesuPoolUSDCAPYByName } from "../../vesuApi";

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
    const { poolName } = await req.json();

    const poolAPY = await getVesuPoolUSDCAPYByName(poolName);
    if (poolAPY) {
      return NextResponse.json({ poolAPY });
    }
    return NextResponse.json({ poolAPY: 0 });
  } catch (error: any) {
    console.error("Error pool APY positions:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
