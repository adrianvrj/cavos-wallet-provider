import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    try {
        // Query for wallets in the "sepolia" network
        const { count: sepoliaCount, error: sepoliaError } = await supabase
            .from('external_wallet')
            .select('*', { count: 'exact'})
            .eq('network', 'sepolia');

        if (sepoliaError) {
            console.error("Error fetching sepolia wallet count:", sepoliaError);
            return NextResponse.json(
                { message: 'Failed to fetch sepolia wallet count', error: sepoliaError.message },
                { status: 500 }
            );
        }
        // Query for wallets in the "mainnet" network
        const { count: mainnetCount, error: mainnetError } = await supabase
            .from('external_wallet')
            .select('*', { count: 'exact', head: true })
            .eq('network', 'mainnet');

        if (mainnetError) {
            console.error("Error fetching mainnet wallet count:", mainnetError);
            return NextResponse.json(
                { message: 'Failed to fetch mainnet wallet count', error: mainnetError.message },
                { status: 500 }
            );
        }

        // Combine the results
        const data = [
            { network: 'sepolia', count: sepoliaCount || 0 },
            { network: 'mainnet', count: mainnetCount || 0 },
        ];

        // Return the combined counts
        return NextResponse.json({
            message: 'Wallet counts fetched successfully',
            data,
        });
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
