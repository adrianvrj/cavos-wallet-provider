import { NextResponse } from 'next/server';
import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CallData, Account, num, hash, Call } from 'starknet';
import { formatCall, type DeploymentData } from "@avnu/gasless-sdk";
import { decryptPin, encryptSecretWithPin, formatAmount } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import { toBeHex } from 'ethers';

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export const supabase = createClient(
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

        let { network } = await req.json();
        if (!network) {
            return NextResponse.json(
                { message: 'Network is required' },
                { status: 400 }
            );
        }
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });
        try {

            let calls: Call[] = [
                {
                    entrypoint: 'approve',
                    contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
                    calldata: ['0x0498E484Da80A8895c77DcaD5362aE483758050F22a92aF29A385459b0365BFE', '0xf', '0x0'],
                },
            ];

            calls = formatCall(calls);

            const argentXaccountClassHash =
                '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

            const privateKeyAX = stark.randomAddress();
            const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

            const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
            const axGuardian = new CairoOption(1);
            const AXConstructorCallData = CallData.compile({
                owner: axSigner,
                guardian: axGuardian,
            });
            const AXcontractAddress = hash.calculateContractAddressFromHash(
                starkKeyPubAX,
                argentXaccountClassHash,
                AXConstructorCallData,
                0
            );

            const account = new Account(provider, AXcontractAddress, privateKeyAX);

            const ArgentAAConstructorCallData = CallData.compile({
                owner: starkKeyPubAX,
                guardian: axGuardian,
            });

            const deploymentData: DeploymentData = {
                class_hash: argentXaccountClassHash,
                salt: starkKeyPubAX,
                unique: `${num.toHex(1)}`,
                calldata: ArgentAAConstructorCallData.map(x => {
                    const hex = BigInt(x).toString(16);
                    return `0x${hex}`;
                })
            };

            const typeDataResponse = await fetch("https://starknet.api.avnu.fi/paymaster/v1/build-typed-data", {
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

            const typedData = await typeDataResponse.json();
            let userSignature = (await account.signMessage(typedData));
            if (Array.isArray(userSignature)) {
                userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
            } else if (userSignature.r && userSignature.s) {
                userSignature = [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
            }

            const executeResponse = await fetch('https://starknet.api.avnu.fi/paymaster/v1/deploy-account', {
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

            const encryptedPK = encryptSecretWithPin(org.hash_secret, privateKeyAX);

            const { error: txError } = await supabase
                .from('external_wallet')
                .insert([
                    {
                        org_id: org.id,
                        public_key: starkKeyPubAX,
                        private_key: encryptedPK,
                        address: AXcontractAddress,
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
