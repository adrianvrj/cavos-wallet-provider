import { NextResponse } from "next/server";
import { RpcProvider, Account, Call, TypedData } from "starknet";
import { formatCall } from "@avnu/gasless-sdk";
import {
  decryptPin,
  decryptSecretWithPin,
  formatAmount,
  parseResponse,
} from "@/app/lib/utils";
import { toBeHex } from "ethers";
import { validateRequest, withCORS } from "@/app/lib/authUtils";

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/position endpoint hit, START.`
  );
  const auth = validateRequest(req);
  if (!auth.valid) {
    console.warn("Unauthorized request");
    return auth.response;
  }

  try {
    const { amount, address, hashedPk, hashedPin } = await req.json();
    console.log("Received request:", { amount, address });

    if (!amount || !address || !hashedPk || !hashedPin) {
      console.log("Missing required parameters", {
        amount,
        address,
        hashedPk: !!hashedPk,
        hashedPin: !!hashedPin,
      });

      return withCORS(
        NextResponse.json(
          {
            message:
              "Missing required parameters: amount, address, hashedPk, hashedPin",
          },
          { status: 400 }
        )
      );
    }

    console.log("Decrypting PIN and private key...");
    const pin = decryptPin(hashedPin, process.env.SECRET_TOKEN);
    const pk = decryptSecretWithPin(hashedPk, pin);

    console.log("Initializing provider and account...");
    const provider = new RpcProvider({ nodeUrl: process.env.RPC });
    const account = new Account(provider, address, pk);

    let calls: Call[] = [
      {
        contractAddress:
          "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", // USDC contract
        entrypoint: "approve",
        calldata: [
          "0x048f4e75c12ca9d35d6172b1cb5f1f70b094888003f9c94fe19f12a67947fd6d", // target
          formatAmount(amount, 6),
        ],
      },
      {
        contractAddress:
          "0x048f4e75c12ca9d35d6172b1cb5f1f70b094888003f9c94fe19f12a67947fd6d", // target
        entrypoint: "deposit",
        calldata: [formatAmount(amount, 6), address],
      },
    ];

    calls = formatCall(calls);
    console.log("Formatted calls:", calls);

    console.debug("Requesting typed data from paymaster...");
    const typedDataResponse = await fetch(
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
        }),
      }
    );

    if (!typedDataResponse.ok) {
      const errorText = await typedDataResponse.text();
      console.error("Typed data build failed:", errorText);
      throw new Error(`API error building typed data: ${errorText}`);
    }

    const typedData: TypedData = await parseResponse(typedDataResponse);
    console.debug("Typed data received");

    console.debug("Signing message...");
    let userSignature = await account.signMessage(typedData);

    if (Array.isArray(userSignature)) {
      userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
    } else if (userSignature.r && userSignature.s) {
      userSignature = [
        toBeHex(BigInt(userSignature.r)),
        toBeHex(BigInt(userSignature.s)),
      ];
    }

    console.debug("Sending signed data to execute endpoint...");
    const executeResponse = await fetch(
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
          typedData: JSON.stringify(typedData),
          signature: userSignature,
          deploymentData: null,
        }),
      }
    );

    if (!executeResponse.ok) {
      const errorText = await executeResponse.text();
      console.error("Transaction execution failed:", errorText);
      throw new Error(`API error executing transaction: ${errorText}`);
    }

    const result = await executeResponse.json();
    console.log("Transaction executed. Result:", result);

    if (!result.transactionHash) {
      console.error("Missing transaction hash in response");
      throw new Error("Transaction hash missing in response");
    }
    console.log(
      `[${new Date().toISOString()}] [POST] /api/position endpoint, FINISH.`
    );
    return withCORS(
      NextResponse.json({
        result: result.transactionHash,
      })
    );
  } catch (error: any) {
    console.error("Error processing transaction:", error);
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
