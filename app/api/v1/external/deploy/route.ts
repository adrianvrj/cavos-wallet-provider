import { NextResponse } from "next/server";
import {
  RpcProvider,
  stark,
  ec,
  CairoCustomEnum,
  CairoOption,
  CallData,
  hash,
} from "starknet";
import { encryptSecretWithPin } from "@/app/lib/utils";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

const ARGENT_ACCOUNT_CLASS_HASH =
  "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/v1/external/deploy endpoint hit, START.`
  );
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Authorization header missing or malformed");
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    console.log("Received request with token:", token);

    const { data, error } = await supabase
      .from("org")
      .select("id, hash_secret")
      .eq("secret", token);

    if (error) {
      console.error("Supabase query error:", error);
    }

    const org = data?.[0];
    if (!org) {
      console.warn("No org found matching token");
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    let { network } = await req.json();
    console.log("Network requested:", network);

    if (!network) {
      console.warn('Missing "network" in request body');
      return NextResponse.json(
        { message: "Network is required" },
        { status: 400 }
      );
    }

    if (network !== "sepolia" && network !== "mainnet") {
      console.warn(`Unsupported network received: ${network}`);
      return NextResponse.json(
        { message: "Network is not supported" },
        { status: 400 }
      );
    }

    const rpcUrl =
      network === "sepolia" ? process.env.SEPOLIA_RPC : process.env.RPC;
    const provider = new RpcProvider({ nodeUrl: rpcUrl });
    console.log(`Using ${network} provider`);

    const avnuPaymasterUrl =
      network === "sepolia"
        ? "https://sepolia.api.avnu.fi"
        : "https://starknet.api.avnu.fi";

    try {
      console.log("Generating new ArgentX wallet...");
      const argentXaccountClassHash =
        "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
      const privateKeyAX = stark.randomAddress();
      const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

      console.log("Generated stark key:", starkKeyPubAX);

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

      console.log("Calculated ArgentX contract address:", AXcontractAddress);

      const deploymentData = {
        class_hash: argentXaccountClassHash,
        salt: argentXaccountClassHash,
        unique: "0x0",
        calldata: ArgentAAConstructorCallData.map((x) => {
          const hex = BigInt(x).toString(16);
          return `0x${hex}`;
        }),
      };

      console.log("Sending request to build typed data...");
      const typeDataResponse = await fetch(
        `${avnuPaymasterUrl}/paymaster/v1/build-typed-data`,
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
        const errText = await typeDataResponse.text();
        console.error("Error building typed data:", errText);
        throw new Error("Failed to build typed data");
      }
      console.log("Typed data built successfully");

      console.log("Sending deployment transaction...");
      const executeResponse = await fetch(
        `${avnuPaymasterUrl}/paymaster/v1/deploy-account`,
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
        const errorText = await executeResponse.text();
        console.error("Error executing deployment:", errorText);
        throw new Error("Failed to execute deployment");
      }

      const executeResult = await executeResponse.json();
      console.log("Deployment response:", executeResult);

      console.log("Encrypting private key...");
      const encryptedPK = encryptSecretWithPin(org.hash_secret, privateKeyAX);

      console.log("Storing new wallet in database...");
      const { error: txError } = await supabase.from("external_wallet").insert([
        {
          org_id: org.id,
          public_key: starkKeyPubAX,
          private_key: encryptedPK,
          address: AXcontractAddress,
          network: network,
        },
      ]);

      if (txError) {
        console.error("Error inserting data into Supabase:", txError);
      } else {
        console.log("Wallet successfully stored in Supabase");
      }

      console.log(
        `[${new Date().toISOString()}] [POST] /api/v1/external/deploy endpoint, FINISH.`
      );
      return NextResponse.json({
        public_key: starkKeyPubAX,
        private_key: encryptedPK,
        address: AXcontractAddress,
      });
    } catch (error) {
      console.error("Error generating wallet:", error);
      return NextResponse.json({ data: error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Unhandled error in POST handler:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
