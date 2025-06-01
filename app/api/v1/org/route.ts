import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/v1/org?uid=USER_ID
export async function GET(req: NextRequest) {
  console.log(
    `[${new Date().toISOString()}] [GET] /api/v1/org endpoint hit, START.`
  );

  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    console.warn("Missing 'uid' query parameter");
    return NextResponse.json(
      { error: "Missing uid parameter." },
      { status: 400 }
    );
  }

  console.log(`Fetching organization for uid: ${uid}`);
  const { data, error } = await supabase
    .from("org")
    .select("*")
    .eq("uid", uid)
    .single();

  if (error) {
    console.error(`Organization not found for uid ${uid}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  console.log(`Organization found for uid ${uid}:`, data);
  console.log(
    `[${new Date().toISOString()}] [GET] /api/v1/org endpoint, FINISH.`
  );
  return NextResponse.json({ org: data }, { status: 200 });
}

// POST /api/v1/org
export async function POST(req: NextRequest) {
  console.log(
    `[${new Date().toISOString()}] [POST] /api/v1/org endpoint hit, START.`
  );

  try {
    const body = await req.json();
    const { name, email, secret, hash_secret, plan_id, uid } = body;

    if (!name || !email || !secret || !hash_secret || !uid) {
      console.warn("Missing required fields in request body");
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    console.log("Inserting new organization record into 'org' table");
    const { data, error } = await supabase
      .from("org")
      .insert([
        {
          name,
          email,
          secret,
          hash_secret,
          plan_id: plan_id ?? null,
          uid,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting new organization:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Organization created successfully:", data);
    console.log(
      `[${new Date().toISOString()}] [POST] /api/v1/org endpoint, FINISH.`
    );
    return NextResponse.json({ org: data }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error during POST /api/v1/org:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
