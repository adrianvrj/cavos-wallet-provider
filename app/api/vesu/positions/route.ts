import { validateRequest, withCORS } from "@/app/lib/authUtils";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/vesu/positions endpoint hit, START.`
  );
  const auth = validateRequest(req);
  if (!auth.valid) {
    console.warn("Unauthorized request");
    return auth.response;
  }

  try {
    const { address, pool } = await req.json();
    console.log("Incoming request payload:", { address, pool });

    if (!address) {
      console.warn("Missing wallet address in request");
      return withCORS(
        NextResponse.json(
          { message: "Missing wallet address" },
          { status: 400 }
        )
      );
    }
    if (!pool) {
      console.warn("Missing pool name in request");
      return withCORS(
        NextResponse.json({ message: "Missing pool name" }, { status: 400 })
      );
    }

    const url = `https://api.vesu.xyz/positions?walletAddress=${address}&type=earn`;
    console.log(`Fetching user positions from: ${url}`);

    const response = await axios.get(url);
    const userPositions = response.data?.data || [];

    console.log(`Fetched ${userPositions.length} total positions`);

    const positions = userPositions.filter(
      (item: { pool: { name: string } }) => item.pool.name === pool
    );

    console.log(`Filtered ${positions.length} positions for pool "${pool}"`);

    if (!positions.length) {
      console.info(`No matching positions found for pool: ${pool}`);
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

    console.log(
      `Returning position: pool ID = ${pos.pool.id}, total supplied = ${totalSupplied}`
    );
    console.log(
      `[${new Date().toISOString()}] [POST] /api/vesu/positions endpoint, FINISH.`
    );
    return withCORS(
      NextResponse.json({
        poolid: pos.pool.id,
        total_supplied: totalSupplied,
      })
    );
  } catch (error: any) {
    console.error("Error fetching positions:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || null,
    });
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
