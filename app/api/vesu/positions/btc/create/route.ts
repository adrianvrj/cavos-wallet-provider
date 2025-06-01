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

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/vesu/positions/btc/create endpoint hit, START.`
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Unauthorized: Missing or malformed Authorization header");
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (token !== CAVOS_TOKEN) {
      console.warn("Unauthorized: Invalid bearer token provided");
      return NextResponse.json(
        { message: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }

    const { amount, address, hashedPk, hashedPin } = await req.json();
    console.log(`Parsed request payload: address=${address}, amount=${amount}`);

    const pin = decryptPin(hashedPin, SECRET_TOKEN);
    const pk = decryptSecretWithPin(hashedPk, pin);
    const provider = new RpcProvider({ nodeUrl: process.env.RPC });

    const account = new Account(provider, address, pk);
    console.log("Initialized Starknet account");

    let calls: Call[] = [
      {
        contractAddress:
          "0x3Fe2b97C1Fd336E750087D68B9b867997Fd64a2661fF3ca5A7C771641e8e7AC",
        entrypoint: "approve",
        calldata: [
          "0x00c452bacd439bab4e39aeea190b4ff81f44b019d4b3a25fa4da04a1cae7b6ff",
          formatAmount(amount, 8),
        ],
      },
      {
        contractAddress:
          "0x00c452bacd439bab4e39aeea190b4ff81f44b019d4b3a25fa4da04a1cae7b6ff",
        entrypoint: "deposit",
        calldata: [formatAmount(amount, 8), address],
      },
    ];

    calls = formatCall(calls);
    console.log("Formatted calls for paymaster");

    console.log("Requesting typed data from AVNU...");
    const typeDataResponse = await fetch(
      "https://starknet.api.avnu.fi/paymaster/v1/build-typed-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AVNU_API_KEY || "",
          "ask-signature": "false",
        },
        body: JSON.stringify({
          userAddress: address,
          calls,
          accountClassHash: null,
        }),
      }
    );

    if (!typeDataResponse.ok) {
      const errorText = await typeDataResponse.text();
      throw new Error(`AVNU typed data API error: ${errorText}`);
    }

    const typeData: TypedData = await parseResponse(typeDataResponse);
    console.log("Received typed data, signing...");

    let userSignature = await account.signMessage(typeData);
    if (Array.isArray(userSignature)) {
      userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
    } else if (userSignature.r && userSignature.s) {
      userSignature = [
        toBeHex(BigInt(userSignature.r)),
        toBeHex(BigInt(userSignature.s)),
      ];
    }

    console.log("Signature complete, sending execute request to AVNU...");
    const executeTransaction = await fetch(
      "https://starknet.api.avnu.fi/paymaster/v1/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AVNU_API_KEY || "",
          "ask-signature": "true",
        },
        body: JSON.stringify({
          userAddress: address,
          typedData: JSON.stringify(typeData),
          signature: userSignature,
          deploymentData: null,
        }),
      }
    );

    if (!executeTransaction.ok) {
      const errorText = await executeTransaction.text();
      throw new Error(`AVNU execute API error: ${errorText}`);
    }

    const result = await executeTransaction.json();
    console.log(
      "BTC position successfully created. Transaction hash:",
      result.transactionHash
    );

    if (!result.transactionHash) {
      throw new Error("Response missing transaction hash");
    }

    console.log(
      `[${new Date().toISOString()}] [POST] /api/vesu/positions/btc/create endpoint, FINISH.`
    );
    return NextResponse.json({ result: result.transactionHash });
  } catch (error: any) {
    console.error("Unhandled error during BTC position creation:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
