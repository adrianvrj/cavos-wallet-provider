import { ERC20_ABI } from "@/abis/ERC20_ABI";
import { validateRequest, withCORS } from "@/app/lib/authUtils";
import { mockAddresses } from "@/app/lib/utils";
import { NextResponse } from "next/server";
import { RpcProvider, Contract } from "starknet";

const USDC_CONTRACT_ADDRESS =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/wallet/balance endpoint hit, START.`
  );
  const auth = validateRequest(req);
  if (!auth.valid) {
    console.warn("Unauthorized request");
    return auth.response;
  }

  try {
    const { address, tokenAddress = USDC_CONTRACT_ADDRESS } = await req.json();
    console.log("Received request to fetch balance:", {
      address,
      tokenAddress,
    });

    if (!address) {
      console.warn("Missing wallet address in request body");
      return withCORS(
        NextResponse.json(
          { message: "Missing wallet address" },
          { status: 400 }
        )
      );
    }

    if (mockAddresses.includes(address)) {
      console.log(`Address: ${address} is in the mock test address.`);
      return withCORS(
        NextResponse.json({
          balance: 5000,
          balanceRaw: "0.005",
        })
      );
    }

    const nodeUrl = process.env.RPC;
    if (!nodeUrl) {
      console.error("Missing RPC URL in environment variables");
      return withCORS(
        NextResponse.json(
          { message: "Missing RPC URL configuration" },
          { status: 500 }
        )
      );
    }

    console.log(`Initializing provider with RPC: ${nodeUrl}`);
    const provider = new RpcProvider({ nodeUrl });

    console.log("Instantiating ERC20 contract...");
    const contract = new Contract(ERC20_ABI, tokenAddress, provider);

    console.log(`Fetching balance for address: ${address}`);
    const balanceResult = await contract.balance_of(address);
    console.log(`Raw balance result:`, balanceResult.toString());

    const decimals = 6;
    const balanceInUnits = Number(balanceResult) / 10 ** decimals;
    console.log(`Converted balance: ${balanceInUnits} (decimals: ${decimals})`);
    console.log(
      `[${new Date().toISOString()}] [POST] /api/wallet/balance endpoint, FINISH.`
    );
    return withCORS(
      NextResponse.json({
        balance: balanceInUnits,
        balanceRaw: balanceResult.toString(),
      })
    );
  } catch (error: any) {
    console.error("Error fetching balance:", {
      message: error.message,
      stack: error.stack,
      data: error?.response?.data || null,
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

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [GET] /api/wallet/balance → Start`);

  const auth = validateRequest(request);
  if (!auth.valid) {
    console.warn(`[${timestamp}] [AUTH] Unauthorized request`);
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const assetAddress = searchParams.get("assetAddress");
    const assetDecimals = searchParams.get("assetDecimals");

    if (!userAddress || !assetAddress || !assetDecimals) {
      console.warn(`[${timestamp}] [VALIDATION] Missing query parameters`, {
        userAddress,
        assetAddress,
        assetDecimals,
      });

      return withCORS(
        NextResponse.json(
          {
            message:
              "Missing required parameters: userAddress, assetAddress, assetDecimals",
          },
          { status: 400 }
        )
      );
    }

    const nodeUrl = process.env.RPC;
    if (!nodeUrl) {
      console.error(`[${timestamp}] [CONFIG] Missing RPC URL`);
      return withCORS(
        NextResponse.json(
          { message: "Missing RPC URL configuration" },
          { status: 500 }
        )
      );
    }

    console.log(`[${timestamp}] [RPC] Connecting to: ${nodeUrl}`);
    const provider = new RpcProvider({ nodeUrl });

    console.log(`[${timestamp}] [CONTRACT] Loading ERC20 at ${assetAddress}`);
    const contract = new Contract(ERC20_ABI, assetAddress, provider);

    console.log(`[${timestamp}] [BALANCE] Fetching for: ${userAddress}`);
    const balanceResult = await contract.balance_of(userAddress);
    const raw = balanceResult.toString();
    const balance = Number(raw) / 10 ** Number(assetDecimals);

    console.log(`[${timestamp}] [BALANCE] Raw: ${raw}, Parsed: ${balance}`);
    console.log(`[${timestamp}] [GET] /api/wallet/balance → Success`);

    return withCORS(
      NextResponse.json({
        balance,
        balanceRaw: raw,
      })
    );
  } catch (error: any) {
    console.error(
      `[${timestamp}] [ERROR] Exception during GET /wallet/balance`,
      {
        message: error.message,
        stack: error.stack,
        data: error?.response?.data || null,
      }
    );

    return withCORS(
      NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 500 }
      )
    );
  }
}
