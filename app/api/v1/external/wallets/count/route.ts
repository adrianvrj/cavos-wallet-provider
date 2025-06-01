import { NextResponse } from "next/server";
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

export async function GET() {
  console.log(
    `[${new Date().toISOString()}] [GET] /api/v1/external/wallets/count endpoint hit, START.`
  );
  try {
    console.log("Querying 'external_wallet' table for sepolia network...");
    const { count: sepoliaCount, error: sepoliaError } = await supabase
      .from("external_wallet")
      .select("*", { count: "exact" })
      .eq("network", "sepolia");

    if (sepoliaError) {
      console.error("Failed to fetch wallet count for sepolia:", sepoliaError);
      return NextResponse.json(
        {
          message: "Failed to fetch sepolia wallet count",
          error: sepoliaError.message,
        },
        { status: 500 }
      );
    }

    console.log(`Sepolia wallet count: ${sepoliaCount}`);

    console.log("Querying 'external_wallet' table for mainnet network...");
    const { count: mainnetCount, error: mainnetError } = await supabase
      .from("external_wallet")
      .select("*", { count: "exact", head: true })
      .eq("network", "mainnet");

    if (mainnetError) {
      console.error("Failed to fetch wallet count for mainnet:", mainnetError);
      return NextResponse.json(
        {
          message: "Failed to fetch mainnet wallet count",
          error: mainnetError.message,
        },
        { status: 500 }
      );
    }

    console.log(`Mainnet wallet count: ${mainnetCount}`);

    const data = [
      { network: "sepolia", count: sepoliaCount || 0 },
      { network: "mainnet", count: mainnetCount || 0 },
    ];

    console.log("Returning combined wallet counts:", data);

    console.log(
      `[${new Date().toISOString()}] [GET] /api/v1/external/wallets/count endpoint, FINISH.`
    );
    return NextResponse.json({
      message: "Wallet counts fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Unexpected error while fetching wallet counts:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
