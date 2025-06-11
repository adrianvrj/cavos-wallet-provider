import { NextRequest, NextResponse } from "next/server";
import { extractTokenTransfers } from "@/app/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txHash = searchParams.get("txHash");
    const network = searchParams.get("network") || "mainnet";

    if (!txHash) {
      return NextResponse.json({ error: "txHash is required" }, { status: 400 });
    }
    if (network !== "mainnet" && network !== "sepolia") {
      return NextResponse.json({ error: "network must be 'mainnet' or 'sepolia'" }, { status: 400 });
    }

    const voyagerUrl =
      network === "sepolia"
        ? `https://sepolia.voyager.online/api/txn/${txHash}`
        : `https://voyager.online/api/txn/${txHash}`;

    const voyagerRes = await fetch(voyagerUrl);
    if (!voyagerRes.ok) {
      return NextResponse.json({ error: "Failed to fetch transaction from Voyager" }, { status: 502 });
    }
    const voyagerData = await voyagerRes.json();
    const transfers = extractTokenTransfers(voyagerData);
    return NextResponse.json({ transfers });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
