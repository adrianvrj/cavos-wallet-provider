import { validateRequest, withCORS } from "@/app/lib/authUtils";
import { NextResponse } from "next/server";
import axios from "axios";
import { formatVesuPool } from "@/app/lib/utils";
import { VesuPool } from "@/types/vesu";

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/vesu/pool/apy endpoint hit, START.`
  );

  const auth = validateRequest(req);
  if (!auth.valid) {
    console.warn("Request failed authentication");
    return auth.response;
  }

  try {
    const { poolName, assetSymbol } = await req.json();
    console.log(
      `Request body: poolName="${poolName}", assetSymbol="${assetSymbol}"`
    );

    if (!poolName) {
      console.warn("Missing required parameter: 'poolName'");
      return withCORS(
        NextResponse.json(
          { message: "Missing required parameter: 'poolName'" },
          { status: 400 }
        )
      );
    }

    if (!assetSymbol) {
      console.warn("Missing required parameter: 'assetSymbol'");
      return withCORS(
        NextResponse.json(
          { message: "Missing required parameter: 'assetSymbol'" },
          { status: 400 }
        )
      );
    }

    console.log("Fetching pools from Vesu API...");
    const response = await axios.get("https://api.vesu.xyz/pools");
    const allVesuPools: VesuPool[] = response.data?.data || [];
    console.log(`Fetched ${allVesuPools.length} pools from Vesu`);

    const verifiedPools = allVesuPools
      .filter((pool) => pool.isVerified)
      .map(formatVesuPool);
    console.log(`Filtered down to ${verifiedPools.length} verified pools`);

    const foundPool = verifiedPools.find((pool) => pool.name === poolName);

    if (!foundPool) {
      console.warn(`No verified pool found with name: "${poolName}"`);
      return withCORS(
        NextResponse.json(
          { message: `Pool "${poolName}" not found` },
          { status: 404 }
        )
      );
    }

    const usdcAsset = foundPool.assets.find(
      (asset) => asset.symbol === assetSymbol
    );

    if (!usdcAsset) {
      console.warn(`Asset "${assetSymbol}" not found in pool "${poolName}"`);
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

    console.log(
      `Computed APY for pool "${poolName}" and asset "${assetSymbol}": ${poolAPY}%`
    );
    console.log(
      `[${new Date().toISOString()}] [POST] /api/vesu/pool/apy endpoint, FINISH.`
    );

    return withCORS(
      NextResponse.json({
        poolAPY: poolAPY || 0,
      })
    );
  } catch (error: any) {
    console.error("Unexpected error while fetching pool APY:", error);
    return withCORS(
      NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS(req: Request) {
  console.log("Received OPTIONS preflight request");
  return withCORS(new NextResponse(null, { status: 204 }));
}
