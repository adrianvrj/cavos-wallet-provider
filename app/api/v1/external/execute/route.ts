import { NextResponse } from 'next/server';
import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CallData, Account, num, hash, Call, CairoOptionVariant } from 'starknet';
import { formatCall, type DeploymentData } from "@avnu/gasless-sdk";
import { decryptSecretWithPin, encryptSecretWithPin } from '@/app/lib/utils';
import { createClient } from '@supabase/supabase-js';
import { toBeHex } from 'ethers';

const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || "",
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized: Missing or invalid Bearer token' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        const { data, error } = await supabase
            .from('org')
            .select('id, hash_secret')
            .eq('secret', token);

        const org = data?.[0];
        if (!org || error) {
            return NextResponse.json(
                { message: 'Unauthorized: Missing or invalid Bearer token' },
                { status: 401 }
            );
        }


        let { network, calls, address, hashedPk } = await req.json();
        if (!network) {
            return NextResponse.json(
                { message: 'Network is required' },
                { status: 400 }
            );
        }

        if (network !== 'sepolia' && network !== 'mainnet') {
            return NextResponse.json(
                { message: 'Network is not supported' },
                { status: 400 }
            );
        }

        let provider = network === 'sepolia' ? new RpcProvider({ nodeUrl: process.env.SEPOLIA_RPC }) : new RpcProvider({ nodeUrl: process.env.RPC });

        const avnuPaymasterUrl = network === 'sepolia' ? 'https://sepolia.api.avnu.fi' : 'https://starknet.api.avnu.fi'

        try {
            const cavosCalls = formatCall(calls);

            const typeDataResponse = await fetch(`${avnuPaymasterUrl}/paymaster/v1/build-typed-data`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.AVNU_API_KEY || "",
                },
                body: JSON.stringify({
                    "userAddress": address,
                    "calls": cavosCalls,
                })
            });
            if (!typeDataResponse.ok) {
                console.error('Error building typed data:', await typeDataResponse.text());
                throw new Error('Failed to build typed data');
            }
            console.log("Decrypted", decryptSecretWithPin(hashedPk, org.hash_secret));
            const account = new Account(
                provider,
                address,
                decryptSecretWithPin(hashedPk, org.hash_secret)
            );
            const typeData = await typeDataResponse.json();
            let userSignature = (await account.signMessage(typeData));
            if (Array.isArray(userSignature)) {
                userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
            } else if (userSignature.r && userSignature.s) {
                userSignature = [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
            }
            const executeResponse = await fetch(`${avnuPaymasterUrl}/paymaster/v1/execute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.AVNU_API_KEY || "",
                },
                body: JSON.stringify({
                    "userAddress": address,
                    "typedData": JSON.stringify(typeData),
                    "signature": userSignature,
                    "deploymentData": null,
                })
            });
            if (!executeResponse.ok) {
                const errorText = await executeResponse.text();
                console.error('Error executing deployment:', errorText);
                throw new Error('Failed to execute deployment');
            }
            const executeResult = await executeResponse.json();
            return NextResponse.json({
                result: executeResult,
            });
        } catch (error) {
            console.log("Error generating wallet:" + error);
            return NextResponse.json({ data: error }, { status: 500 });
        }
    } catch (error: any) {
        console.log(error);
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
