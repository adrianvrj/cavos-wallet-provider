import { validateRequest, withCORS } from "@/app/lib/authUtils";
import { NextResponse } from "next/server";
import axios from "axios";
import { formatVesuPool } from "@/app/lib/utils";
import { VesuPool } from "@/types/vesu";

export async function POST(req: Request) {
  const auth = validateRequest(req);
  if (!auth.valid) return auth.response;

  try {
    const { poolName, assetSymbol } = await req.json();

    if (!poolName) {
      return withCORS(
        NextResponse.json(
          { message: "Missing required parameter: 'poolName'" },
          { status: 400 }
        )
      );
    }
    if (!assetSymbol) {
      return withCORS(
        NextResponse.json(
          { message: "Missing required parameter: 'assetSymbol'" },
          { status: 400 }
        )
      );
    }

    const response = await axios.get("https://api.vesu.xyz/pools");
    const allVesuPools: VesuPool[] = response.data?.data || [];

    // Filtrar pools verificados y formatearlos
    const verifiedPools = allVesuPools
      .filter((pool) => pool.isVerified)
      .map(formatVesuPool);

    const foundPool = verifiedPools.find((pool) => pool.name === poolName);

    if (!foundPool) {
      return withCORS(
        NextResponse.json(
          { message: `Pool "${poolName}" not found` },
          { status: 404 }
        )
      );
    }

    const usdcAsset = foundPool.assets.find((asset) => asset.symbol === assetSymbol);

    if (!usdcAsset) {
      return withCORS(
        NextResponse.json(
          { message: `USDC asset not found in pool "${poolName}"` },
          { status: 404 }
        )
      );
    }

    const apy = Number(usdcAsset.apy || 0);
    const defiSpringApy = Number(usdcAsset.defiSpringApy || 0);
    const poolAPY = apy + defiSpringApy;

    return withCORS(
      NextResponse.json({
        poolAPY: poolAPY || 0,
      })
    );
  } catch (error: any) {
    console.error("Error fetching pool APY:", error);
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
