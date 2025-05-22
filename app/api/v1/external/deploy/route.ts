import { NextResponse } from 'next/server';
import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CallData, Account, num, hash, Call, CairoOptionVariant } from 'starknet';
import { formatCall, type DeploymentData } from "@avnu/gasless-sdk";
import { encryptSecretWithPin } from '@/lib/utils';
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

const ARGENT_ACCOUNT_CLASS_HASH = "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

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

        let { network } = await req.json();
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
            const argentXaccountClassHash =
                "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
            const privateKeyAX = stark.randomAddress();
            const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
            const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);
            const ArgentAAConstructorCallData = CallData.compile({
                owner: starkKeyPubAX,
                guardian: axGuardian,
            });
            const AXcontractAddress = hash.calculateContractAddressFromHash(
                argentXaccountClassHash,
                argentXaccountClassHash,
                ArgentAAConstructorCallData,
                0
            );
            console.log("AXcontractAddress", AXcontractAddress);
            const deploymentData = {
                class_hash: argentXaccountClassHash,
                salt: argentXaccountClassHash,
                unique: "0x0",
                calldata: ArgentAAConstructorCallData.map(x => {
                    const hex = BigInt(x).toString(16);
                    return `0x${hex}`;
                })
            };
            const typeDataResponse = await fetch(`${avnuPaymasterUrl}/paymaster/v1/build-typed-data`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.AVNU_API_KEY || "",
                },
                body: JSON.stringify({
                    userAddress: AXcontractAddress,
                    accountClassHash: argentXaccountClassHash,
                    deploymentData,
                    calls: [],
                })
            });
            if (!typeDataResponse.ok) {
                console.error('Error building typed data:', await typeDataResponse.text());
                throw new Error('Failed to build typed data');
            }
            const executeResponse = await fetch(`${avnuPaymasterUrl}/paymaster/v1/deploy-account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.AVNU_API_KEY || "",
                },
                body: JSON.stringify({
                    "userAddress": AXcontractAddress,
                    "deploymentData": deploymentData,
                })
            });
            if (!executeResponse.ok) {
                const errorText = await executeResponse.text();
                console.error('Error executing deployment:', errorText);
                throw new Error('Failed to execute deployment');
            }
            const executeResult = await executeResponse.json();
            console.log('Execute result:', executeResult);
            const encryptedPK = encryptSecretWithPin(org.hash_secret, privateKeyAX);
            const { error: txError } = await supabase
                .from('external_wallet')
                .insert([
                    {
                        org_id: org.id,
                        public_key: starkKeyPubAX,
                        private_key: encryptedPK,
                        address: AXcontractAddress,
                        network: network,
                    },
                ]);

            if (txError) {
                console.error('Error inserting data into Supabase:', txError);
            }

            return NextResponse.json({
                public_key: starkKeyPubAX,
                private_key: encryptedPK,
                address: AXcontractAddress
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
