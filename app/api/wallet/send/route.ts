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
  console.log(
    `[${new Date().toISOString()}] [POST] /api/wallet/send endpoint hit, START.`
  );
  const auth = validateRequest(req);
  if (!auth.valid) {
    console.warn("Unauthorized request");
    return auth.response;
  }

  try {
    const body = await req.json();
    console.info("Received request body:", body);

    const requiredFields = [
      "amount",
      "address",
      "hashedPk",
      "hashedPin",
      "receiverAddress",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.warn("Missing required fields:", missingFields.join(", "));
      return withCORS(
        NextResponse.json(
          { message: `Missing required fields: ${missingFields.join(", ")}` },
          { status: 400 }
        )
      );
    }

    const { amount, address, hashedPk, hashedPin, receiverAddress } = body;

    console.info(`Decrypting pin and private key for address: ${address}`);
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

    console.info("Preparing formatted calls for AVNU:", calls);
    const formattedCalls = formatCall(calls);

    console.info("Calling AVNU /build-typed-data...");
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
    console.info("TypedData built successfully");

    console.info("Signing typedData...");
    let signature = await account.signMessage(typedData);
    if (Array.isArray(signature)) {
      signature = signature.map((sig) => toBeHex(BigInt(sig)));
    } else if (signature.r && signature.s) {
      signature = [toBeHex(BigInt(signature.r)), toBeHex(BigInt(signature.s))];
    }
    console.info("Signature generated:", signature);

    console.info("Sending transaction to AVNU /execute...");
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
    console.info("Transaction executed successfully:", result);

    if (!result.transactionHash) {
      console.error("Missing transactionHash in result:", result);
      throw new Error("Missing transactionHash in response");
    }

    console.log(
      `[${new Date().toISOString()}] [POST] /api/wallet/send endpoint, FINISH.`
    );
    return withCORS(NextResponse.json({ result: result.transactionHash }));
  } catch (error: any) {
    console.error("Unhandled error during POST execution:", {
      message: error.message,
      stack: error.stack,
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
