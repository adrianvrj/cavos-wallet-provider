import { validateRequest, withCORS } from "@/app/lib/authUtils";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const auth = validateRequest(req);
  if (!auth.valid) return auth.response;

  try {
    const { address, pool } = await req.json();

    if (!address) {
      return withCORS(
        NextResponse.json(
          { message: "Missing wallet address" },
          { status: 400 }
        )
      );
    }
    if (!pool) {
      return withCORS(
        NextResponse.json({ message: "Missing pool name" }, { status: 400 })
      );
    }

    const response = await axios.get(
      `https://api.vesu.xyz/positions?walletAddress=${address}&type=earn`
    );

    const userPositions = response.data?.data || [];
    const positions = userPositions.filter(
      (item: { pool: { name: string } }) => item.pool.name === pool
    );

    if (!positions.length) {
      return withCORS(
        NextResponse.json({
          poolid: 0,
          total_supplied: 0,
        })
      );
    }

    const pos = positions[0];
    const totalSupplied =
      Number(pos.collateral.value) / 10 ** pos.collateral.decimals;

    return withCORS(
      NextResponse.json({
        poolid: pos.pool.id,
        total_supplied: totalSupplied,
      })
    );
  } catch (error: any) {
    console.error("Error fetching positions:", error);
    return withCORS(
      NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS(req: Request) {
  return withCORS(new NextResponse(null, { status: 204 }));
}
