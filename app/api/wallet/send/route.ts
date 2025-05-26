import { NextResponse } from "next/server";
import { RpcProvider, Call, Account, TypedData } from "starknet";
import { formatCall } from "@avnu/gasless-sdk";
import {
  decryptPin,
  decryptSecretWithPin,
  formatAmount,
  parseResponse,
} from "@/app/lib/utils";
import { toBeHex } from "ethers";
import { validateRequest, withCORS } from "@/app/lib/authUtils";

const SECRET_TOKEN = process.env.SECRET_TOKEN!;
const AVNU_API_URL = "https://starknet.api.avnu.fi/paymaster/v1";

export async function POST(req: Request) {
  const auth = validateRequest(req);
  if (!auth.valid) return auth.response;

  try {
    const body = await req.json();
    const requiredFields = [
      "amount",
      "address",
      "hashedPk",
      "hashedPin",
      "receiverAddress",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields.join(", "));
      return withCORS(
        NextResponse.json(
          { message: `Missing required fields: ${missingFields.join(", ")}` },
          { status: 400 }
        )
      );
    }

    const { amount, address, hashedPk, hashedPin, receiverAddress } = body;

    const pin = decryptPin(hashedPin, SECRET_TOKEN);
    const pk = decryptSecretWithPin(hashedPk, pin);
    const provider = new RpcProvider({ nodeUrl: process.env.RPC });

    const account = new Account(provider, address, pk);

    const calls: Call[] = [
      {
        contractAddress:
          "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        entrypoint: "transfer",
        calldata: [receiverAddress, formatAmount(amount, 6)],
      },
    ];

    const formattedCalls = formatCall(calls);

    const buildTypedRes = await fetch(`${AVNU_API_URL}/build-typed-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AVNU_API_KEY || "",
        "ask-signature": "false",
      },
      body: JSON.stringify({
        userAddress: address,
        calls: formattedCalls,
        accountClassHash: null,
      }),
    });

    if (!buildTypedRes.ok) {
      const errorText = await buildTypedRes.text();
      console.error("build-typed-data failed:", errorText);
      throw new Error(`build-typed-data error: ${errorText}`);
    }

    const typedData: TypedData = await parseResponse(buildTypedRes);
    console.log("TypedData built successfully.");

    let signature = await account.signMessage(typedData);
    if (Array.isArray(signature)) {
      signature = signature.map((sig) => toBeHex(BigInt(sig)));
    } else if (signature.r && signature.s) {
      signature = [toBeHex(BigInt(signature.r)), toBeHex(BigInt(signature.s))];
    }

    const executeRes = await fetch(`${AVNU_API_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AVNU_API_KEY || "",
        "ask-signature": "false",
      },
      body: JSON.stringify({
        userAddress: address,
        typedData: JSON.stringify(typedData),
        signature,
        deploymentData: null,
      }),
    });

    if (!executeRes.ok) {
      const errorText = await executeRes.text();
      console.error("execute API error:", errorText);
      throw new Error(`Execute failed: ${errorText}`);
    }

    const result = await executeRes.json();
    console.log("Transaction executed:", result);

    if (!result.transactionHash) {
      throw new Error("Missing transactionHash in response.");
    }

    return withCORS(NextResponse.json({ result: result.transactionHash }));
  } catch (error: any) {
    console.error("Error fetching balance:", error);
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
