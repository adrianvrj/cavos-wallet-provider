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
  const auth = validateRequest(req);
  if (!auth.valid) return auth.response;

  try {
    const { amount, address, hashedPk, hashedPin } = await req.json();
    if (!amount || !address || !hashedPk || !hashedPin) {
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

    const pin = decryptPin(hashedPin, process.env.SECRET_TOKEN);
    const pk = decryptSecretWithPin(hashedPk, pin);
    console.log(pk);

    const provider = new RpcProvider({ nodeUrl: process.env.RPC });
    const account = new Account(provider, address, pk);

    let calls: Call[] = [
      {
        contractAddress:
          "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", // USDC contract
        entrypoint: "approve",
        calldata: [
          "0x079824ac0f81aa0e4483628c3365c09fa74d86650fadccb2a733284d3a0a8b85", // target contract
          formatAmount(amount, 6),
        ],
      },
      {
        contractAddress:
          "0x079824ac0f81aa0e4483628c3365c09fa74d86650fadccb2a733284d3a0a8b85", // target contract
        entrypoint: "deposit",
        calldata: [formatAmount(amount, 6), address],
      },
    ];

    calls = formatCall(calls);

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
      throw new Error(`API error building typed data: ${errorText}`);
    }

    const typedData: TypedData = await parseResponse(typedDataResponse);

    let userSignature = await account.signMessage(typedData);
    if (Array.isArray(userSignature)) {
      userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
    } else if (userSignature.r && userSignature.s) {
      userSignature = [
        toBeHex(BigInt(userSignature.r)),
        toBeHex(BigInt(userSignature.s)),
      ];
    }

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
      throw new Error(`API error executing transaction: ${errorText}`);
    }

    const result = await executeResponse.json();

    if (!result.transactionHash) {
      throw new Error("Transaction hash missing in response");
    }

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
