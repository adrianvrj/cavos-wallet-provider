import { NextResponse } from "next/server";
import { RpcProvider, Account, TypedData } from "starknet";
import {
  decryptPin,
  decryptSecretWithPin,
  parseResponse,
} from "@/app/lib/utils";
import { toBeHex } from "ethers";
import axios from "axios";

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export async function POST(req: Request) {
  try {
    console.log(
      `[${new Date().toISOString()}] [POST] /api/wallet/swap endpoint hit, START.`
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Missing or invalid Authorization header");
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (token !== CAVOS_TOKEN) {
      console.warn("Invalid Bearer token provided");
      return NextResponse.json(
        { message: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Received body:", body);

    const {
      address,
      hashedPk,
      hashedPin,
      sellTokenAddress,
      buyTokenAddress,
      amount,
    } = body;

    console.log("Decrypting PIN and private key...");
    const pin = decryptPin(hashedPin, SECRET_TOKEN);
    const pk = decryptSecretWithPin(hashedPk, pin);
    console.log("Decryption successful");

    const provider = new RpcProvider({ nodeUrl: process.env.RPC });

    console.log("Fetching quotes from AVNU...");
    const quotes = (
      await axios.get(
        `https://starknet.api.avnu.fi/internal/swap/quotes-with-prices?sellTokenAddress=${sellTokenAddress}&buyTokenAddress=${buyTokenAddress}&sellAmount=${toBeHex(
          amount
        )}&takerAddress=${address}&size=1&integratorName=AVNU%20Portal`
      )
    ).data.quotes;

    console.log("Quote received:", quotes[0]);

    const account = new Account(provider, address, pk);

    console.log("Building swap typed data...");
    const swapTypedDataResponse = await fetch(
      "https://starknet.api.avnu.fi/swap/v2/build-typed-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AVNU_API_KEY || "",
          "ask-signature": "false",
        },
        body: JSON.stringify({
          quoteId: quotes[0].quoteId,
          takerAddress: address,
          slippage: 0.05,
          includeApprove: true,
          gasTokenAddress:
            "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          maxGasTokenAmount: toBeHex(1000000),
        }),
      }
    );

    if (!swapTypedDataResponse.ok) {
      const errorText = await swapTypedDataResponse.text();
      console.error("Error from AVNU typed data API:", errorText);
      throw new Error(`API error swap typedata: ${errorText}`);
    }

    const swapTypedData: TypedData = await parseResponse(swapTypedDataResponse);
    console.log("Typed data parsed:", JSON.stringify(swapTypedData));

    console.log("Signing the typed data...");
    let userSignature = await account.signMessage(swapTypedData);

    if (Array.isArray(userSignature)) {
      userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
    } else if (userSignature.r && userSignature.s) {
      userSignature = [
        toBeHex(BigInt(userSignature.r)),
        toBeHex(BigInt(userSignature.s)),
      ];
    }

    console.log("Signature generated:", userSignature);

    console.log("Executing swap transaction...");
    const swapExecuteTransaction = await fetch(
      "https://starknet.api.avnu.fi/swap/v2/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AVNU_API_KEY || "",
          "ask-signature": "false",
        },
        body: JSON.stringify({
          quoteId: quotes[0].quoteId,
          signature: userSignature,
        }),
      }
    );

    if (!swapExecuteTransaction.ok) {
      const errorText = await swapExecuteTransaction.text();
      console.error("Error in execute API swap response:", errorText);
      return NextResponse.json({ result: false });
    }

    const swapResult = await swapExecuteTransaction.json();
    console.log(
      "Swap executed successfully. Transaction hash:",
      swapResult.transactionHash
    );

    if (!swapResult.transactionHash) {
      console.error("Transaction hash missing in the response.");
      throw new Error("Missing transaction hash in AVNU response.");
    }
    console.log(
      `[${new Date().toISOString()}] [POST] /api/wallet/swap endpoint, FINISH.`
    );
    return NextResponse.json({ result: swapResult.transactionHash });
  } catch (error: any) {
    console.error("Unhandled error during swap execution:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
