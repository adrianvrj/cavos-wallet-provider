import { NextResponse } from "next/server";
import axios from "axios";

import { formatVesuPool } from "@/lib/utils";
import { VesuEarnPosition, VesuPool, VesuPosition } from "@/types/vesu";

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (token !== CAVOS_TOKEN) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }

    const { address, pool } = await req.json();

    if (!address || !pool) {
      return NextResponse.json(
        {
          message:
            "Missing required parameters: 'pool' and 'address' must be provided in the request.",
        },
        { status: 400 }
      );
    }

    // --- USER POSITIONS ---
    const userPositions = (
      await axios.get(`https://api.vesu.xyz/positions?walletAddress=${address}&type=earn`)
    ).data.data;
    const positions = userPositions.filter(
      (item: { type: string; pool: { name: string } }) =>
        item.pool.name === pool
    );
    if (!positions || positions.length === 0) {
      return NextResponse.json(
        {
          message: "No positions found for the specified pool.",
        },
        { status: 404 }
      );
    }

    const tokenPrice =
      Number(BigInt(positions[0].collateral.usdPrice.value)) /
      10 ** positions[0].collateral.usdPrice.decimals;

    if (positions && positions.length > 0) {
      return NextResponse.json({
        poolid: positions[0].pool.id,
        total_supplied:
          (Number(positions[0].collateral.value) / 10 ** positions[0].collateral.decimals) *
            tokenPrice,
      });
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
