import { NextResponse } from "next/server";
import { RpcProvider, Account } from "starknet";
import { formatCall } from "@avnu/gasless-sdk";
import { decryptSecretWithPin } from "@/app/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { toBeHex } from "ethers";

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

export async function POST(req: Request) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/v1/external/execute endpoint hit, START.`
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Authorization failed: missing or invalid Bearer token");
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase
      .from("org")
      .select("id, hash_secret, active")
      .eq("secret", token);

    const org = data?.[0];
    if (!org || error) {
      console.warn(
        "Authorization failed: Supabase returned no org or an error:",
        error
      );
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid Bearer token", error: error?.message || error },
        { status: 401 }
      );
    }

    console.log(`Organization authorized with ID: ${org.id}`);

    let { network, calls, address, hashedPk } = await req.json();
    console.log("Received request data:", { network, address });

    if (!network) {
      return NextResponse.json(
        { message: "Network is required" },
        { status: 400 }
      );
    }

    if (network !== "sepolia" && network !== "mainnet") {
      console.warn("Unsupported network received:", network);
      return NextResponse.json(
        { message: "Network is not supported" },
        { status: 400 }
      );
    }

    if (network === "mainnet" && !org.active) {
      console.warn("Org is not active");
      return NextResponse.json(
        { message: "Org is not active to execute on mainnet, please contact sales." },
        { status: 400 }
      );
    }

    const provider = new RpcProvider({
      nodeUrl:
        network === "sepolia" ? process.env.SEPOLIA_RPC : process.env.RPC,
    });
    const avnuPaymasterUrl =
      network === "sepolia"
        ? "https://sepolia.api.avnu.fi"
        : "https://starknet.api.avnu.fi";

    try {
      console.log("Formatting call data for AVNU...");
      const cavosCalls = formatCall(calls);
      console.log("Formatted calls:", JSON.stringify(cavosCalls));

      console.log("Requesting typed data from AVNU paymaster");
      const typeDataResponse = await fetch(
        `${avnuPaymasterUrl}/paymaster/v1/build-typed-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.AVNU_API_KEY || "",
          },
          body: JSON.stringify({
            userAddress: address,
            calls: cavosCalls,
          }),
        }
      );

      if (!typeDataResponse.ok) {
        const errorText = await typeDataResponse.text();
        console.error("Failed to build typed data from AVNU:", errorText);
        throw new Error(`Failed to build typed data: ${errorText}`);
      }

      const account = new Account(
        provider,
        address,
        decryptSecretWithPin(hashedPk, org.hash_secret)
      );
      console.log("Account successfully initialized for signing");

      const typeData = await typeDataResponse.json();
      console.log("Typed data received from AVNU");

      let userSignature = await account.signMessage(typeData);
      console.log("User signature generated");

      if (Array.isArray(userSignature)) {
        userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
      } else if (userSignature.r && userSignature.s) {
        userSignature = [
          toBeHex(BigInt(userSignature.r)),
          toBeHex(BigInt(userSignature.s)),
        ];
      }
      console.log("User signature formatted:", userSignature);

      console.log("Sending signed transaction to AVNU for execution");
      const executeResponse = await fetch(
        `${avnuPaymasterUrl}/paymaster/v1/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.AVNU_API_KEY || "",
          },
          body: JSON.stringify({
            userAddress: address,
            typedData: JSON.stringify(typeData),
            signature: userSignature,
            deploymentData: null,
          }),
        }
      );

      if (!executeResponse.ok) {
        const errorText = await executeResponse.text();
        console.error("AVNU execution error:", errorText);
        throw new Error(`Failed to execute deployment: ${errorText}`);
      }

      const executeResult = await executeResponse.json();
      console.log(
        "Transaction executed successfully. Response:",
        executeResult
      );
      console.log(
        `[${new Date().toISOString()}] [POST] /api/v1/external/exexcute endpoint, FINISH.`
      );

      return NextResponse.json({
        result: executeResult,
      });
    } catch (error) {
      console.error("Error during execution logic:", error);
      return NextResponse.json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Unhandled server error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error", stack: error.stack },
      { status: 500 }
    );
  }
}
