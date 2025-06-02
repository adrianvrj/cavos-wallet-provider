import { NextResponse } from "next/server";
import {
  RpcProvider,
  stark,
  ec,
  CairoCustomEnum,
  CairoOption,
  CallData,
  Account,
  hash,
} from "starknet";
import { decryptPin, encryptSecretWithPin } from "@/app/lib/utils";

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export async function POST(req: Request) {
  try {
    console.log(
      `[${new Date().toISOString()}] [POST] /api/wallet endpoint hit, START.`
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
      console.warn(`Invalid token: received ${token}, expected ${CAVOS_TOKEN}`);
      return NextResponse.json(
        { message: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    let { pin } = body;
    console.log("Received request with encrypted PIN");

    pin = decryptPin(pin, SECRET_TOKEN);
    console.log("Decrypted PIN successfully");

    const provider = new RpcProvider({ nodeUrl: process.env.RPC });
    console.log("Initialized Starknet provider");

    const argentXaccountClassHash =
      "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

    console.log("Generated Starknet key pair");

    const axSigner = new CairoCustomEnum({
      Starknet: { pubkey: starkKeyPubAX },
    });
    const axGuardian = new CairoOption(1);
    const ArgentAAConstructorCallData = CallData.compile({
      owner: axSigner,
      guardian: axGuardian,
    });

    const AXcontractAddress = hash.calculateContractAddressFromHash(
      argentXaccountClassHash,
      argentXaccountClassHash,
      ArgentAAConstructorCallData,
      0
    );

    console.log("Computed contract address:", AXcontractAddress);

    const deploymentData = {
      class_hash: argentXaccountClassHash,
      salt: argentXaccountClassHash,
      unique: "0x0",
      calldata: ArgentAAConstructorCallData.map((x) => {
        const hex = BigInt(x).toString(16);
        return `0x${hex}`;
      }),
    };

    const account = new Account(provider, AXcontractAddress, privateKeyAX);
    console.log("Created Account instance for deployment");

    console.log("Sending request to build typed data...");
    const typeDataResponse = await fetch(
      "https://starknet.api.avnu.fi/paymaster/v1/build-typed-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AVNU_API_KEY || "",
        },
        body: JSON.stringify({
          userAddress: AXcontractAddress,
          accountClassHash: argentXaccountClassHash,
          deploymentData,
          calls: [],
        }),
      }
    );

    if (!typeDataResponse.ok) {
      console.error("Failed to build typed data:", typeDataResponse.statusText);
      return NextResponse.json(
        { data: typeDataResponse.statusText },
        { status: 500 }
      );
    }

    console.log("Typed data built successfully");

    const encryptedPK = encryptSecretWithPin(pin, privateKeyAX);
    console.log("Private key encrypted with PIN");

    console.log("Sending request to deploy account...");
    const executeResponse = await fetch(
      "https://starknet.api.avnu.fi/paymaster/v1/deploy-account",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AVNU_API_KEY || "",
        },
        body: JSON.stringify({
          userAddress: AXcontractAddress,
          deploymentData: deploymentData,
        }),
      }
    );

    if (!executeResponse.ok) {
      console.error("Failed to deploy account:", executeResponse.statusText);
      return NextResponse.json(
        { data: executeResponse.statusText },
        { status: 500 }
      );
    }

    console.log("Account deployed successfully");
    console.log(
      `[${new Date().toISOString()}] [POST] /api/wallet endpoint hit, FINISH.`
    );
    return NextResponse.json({
      public_key: starkKeyPubAX,
      private_key: encryptedPK,
      address: AXcontractAddress,
    });
  } catch (error: any) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
