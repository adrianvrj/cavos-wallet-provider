import { NextResponse } from "next/server";
import { RpcProvider, Call, Account, TypedData, cairo } from "starknet";
import { formatCall } from "@avnu/gasless-sdk";
import {
  decryptPin,
  decryptSecretWithPin,
  formatAmount,
  parseResponse,
} from "@/app/lib/utils";
import { toBeHex, toBigInt } from "ethers";
import axios from "axios";

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/vesu/positions/claim endpoint hit, START.`
  );
  try {
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
      console.warn("Invalid bearer token received");
      return NextResponse.json(
        { message: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }

    let { address, hashedPk, hashedPin } = await req.json();
    console.log("Received request for address:", address);

    let pin = decryptPin(hashedPin, SECRET_TOKEN);
    let pk = decryptSecretWithPin(hashedPk, pin);
    const provider = new RpcProvider({ nodeUrl: process.env.RPC });

    // Get reward claim calldata
    console.log("Fetching claim calldata...");
    const calldataResponse = await axios.get(
      `https://api.vesu.xyz/users/${address}/strk-rewards/calldata`
    );
    const calldata = calldataResponse.data.data;
    console.log("Claim calldata fetched:", calldata);

    // Get AVNU quote
    console.log("Fetching AVNU quote...");
    const quotesResponse = await axios.get(
      `https://starknet.api.avnu.fi/internal/swap/quotes-with-prices?sellTokenAddress=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d&buyTokenAddress=0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8&sellAmount=${calldata.amount}&takerAddress=${address}&size=1&integratorName=AVNU%20Portal`
    );
    const quotes = quotesResponse.data.quotes;
    console.log("Quote received:", quotes[0]);

    const account = new Account(provider, address, pk);
    let calls: Call[] = [
      {
        contractAddress:
          "0x0387f3eb1d98632fbe3440a9f1385aec9d87b6172491d3dd81f1c35a7c61048f",
        entrypoint: "claim",
        calldata: [calldata.amount, calldata.proof],
      },
    ];

    calls = formatCall(calls);
    console.log("Formatted calls:", calls);

    // Build typed data
    console.log("Building typed data for claim...");
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
      console.error("Error building typed data:", errorText);
      throw new Error(`API error typedata: ${errorText}`);
    }

    let typeData: TypedData = await parseResponse(typeDataResponse);
    console.log("Typed data built successfully");

    // Sign typed data
    let userSignature = await account.signMessage(typeData);
    userSignature = Array.isArray(userSignature)
      ? userSignature.map((sig) => toBeHex(BigInt(sig)))
      : [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
    console.log("Claim message signed");

    // Execute transaction
    console.log("Executing claim transaction...");
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
      console.error("Error executing claim transaction:", errorText);
      throw new Error(`Execution API error: ${errorText}`);
    }

    const result = await executeTransaction.json();
    console.log("Claim transaction sent. Hash:", result.transactionHash);

    if (!result.transactionHash) {
      throw new Error("Claim transaction missing hash in response");
    }

    await provider.waitForTransaction(result.transactionHash);
    console.log("Claim transaction confirmed");

    // Swap process
    console.log("Building typed data for swap...");
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
      console.error("Error building swap typed data:", errorText);
      throw new Error(`API error swap typedata: ${errorText}`);
    }

    const swapTypedData: TypedData = await parseResponse(swapTypedDataResponse);
    console.log("Swap typed data built");

    // Sign swap data
    userSignature = await account.signMessage(swapTypedData);
    userSignature = Array.isArray(userSignature)
      ? userSignature.map((sig) => toBeHex(BigInt(sig)))
      : [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
    console.log("Swap message signed");

    // Execute swap
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
      console.error("Error executing swap transaction:", errorText);
      return NextResponse.json({ result: false });
    }

    const swapResult = await swapExecuteTransaction.json();
    console.log("Swap executed successfully:", swapResult);

    if (!swapResult.transactionHash) {
      console.error("Swap result missing transactionHash");
      throw new Error("Missing transaction hash in swap response");
    }
    console.log(
      `[${new Date().toISOString()}] [POST] /api/vesu/positions/claim endpoint, FINISH.`
    );
    return NextResponse.json({
      result: swapResult.transactionHash,
      amount: toBigInt(calldata.amount),
    });
  } catch (error: any) {
    console.error("Fatal error during operation:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
