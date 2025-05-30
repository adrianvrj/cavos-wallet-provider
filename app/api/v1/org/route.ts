import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/v1/org?uid=USER_ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid parameter.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('org')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ org: data }, { status: 200 });
}

// POST /api/v1/org
export async function POST(req: NextRequest) {
  try {
    const { name, email, secret, hash_secret, plan_id, uid } = await req.json();

    if (!name || !email || !secret || !hash_secret || !uid) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('org')
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ org: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
