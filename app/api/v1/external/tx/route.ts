import { NextRequest, NextResponse } from "next/server";
import { extractTokenTransfers } from "@/app/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txHash = searchParams.get("txHash");
    if (!txHash) {
      return NextResponse.json({ error: "txHash is required" }, { status: 400 });
    }
    const voyagerRes = await fetch(`https://voyager.online/api/txn/${txHash}`);
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
