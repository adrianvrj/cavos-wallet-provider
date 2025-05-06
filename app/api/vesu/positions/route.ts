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
      await axios.get(`https://api.vesu.xyz/positions?walletAddress=${address}`)
    ).data.data;
    const positions = userPositions.filter(
      (item: { type: string; pool: { name: string } }) =>
        item.type === "earn" && item.pool.name === pool
    );
    if (!positions || positions.length === 0) {
      return NextResponse.json(
        {
          message: "No positions found for the specified pool.",
        },
        { status: 404 }
      );
    }

    // --- VESU POOLS ---
    const allVesuPools = (await axios.get("https://api.vesu.xyz/pools")).data
      .data;
    const verifiedAllVesuPools = allVesuPools
      .filter((pool: VesuPool) => pool.isVerified)
      .map(formatVesuPool);

    // -- EARN POSITIONS
    const earnPositions = await Promise.all(
      positions.map((position: VesuPosition) =>
        mapPositionToEarn(position, verifiedAllVesuPools)
      )
    );

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

const mapPositionToEarn = (
  position: VesuPosition,
  pools: VesuPool[]
): VesuEarnPosition => {
  const poolData = pools.find(
    (pool: { id: string }) => pool.id === position.pool.id
  );
  let poolApy = 0;

  const tokenPrice =
    Number(BigInt(position.collateral.usdPrice.value)) /
    10 ** position.collateral.usdPrice.decimals;

  if (poolData) {
    const asset = poolData.assets.find(
      (a: { symbol: string }) => a.symbol === position.collateral.symbol
    );
    if (asset) {
      poolApy = asset.apy + asset.defiSpringApy;
    }
  }

  return {
    poolId: position.pool.id,
    pool: position.pool.name,
    total_supplied:
      (Number(position.collateral.value) / 10 ** position.collateral.decimals) *
      tokenPrice,
    poolApy,
  };
};
