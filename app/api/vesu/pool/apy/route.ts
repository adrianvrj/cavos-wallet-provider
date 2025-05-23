import { NextResponse } from "next/server";
import axios from "axios";
import { formatVesuPool } from "@/lib/utils";
import { VesuPool } from "@/types/vesu";

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

    const { poolName } = await req.json();

    if (!poolName) {
      return NextResponse.json(
        {
          message:
            "Missing required parameters: 'poolName' must be provided in the request.",
        },
        { status: 400 }
      );
    }

    // --- VESU POOLS ---
    const allVesuPools = (await axios.get("https://api.vesu.xyz/pools")).data
      .data;
    const verifiedAllVesuPools = allVesuPools
      .filter((pool: VesuPool) => pool.isVerified)
      .map(formatVesuPool);

    const foundPool = verifiedAllVesuPools.find(
      (pool: { name: string }) => pool.name === poolName
    );

    if (!foundPool) {
      return NextResponse.json(
        {
          message: `Pool "${poolName}" not found`,
        },
        { status: 404 }
      );
    }

    const usdcAsset = foundPool.assets.find(
      (asset: { symbol: string }) => asset.symbol === "USDC"
    );

    if (!usdcAsset) {
      return NextResponse.json(
        {
          message: `USDC asset not found in pool "${poolName}"`,
        },
        { status: 404 }
      );
    }

    const apy = Number(usdcAsset.apy || 0);
    const defiSpringApy = Number(usdcAsset.defiSpringApy || 0);
    const poolAPY = apy + defiSpringApy;

    if (poolAPY) {
      return NextResponse.json({ poolAPY: poolAPY });
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
