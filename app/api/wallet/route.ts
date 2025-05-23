import { NextResponse } from 'next/server';
import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CallData, Account, num, hash } from 'starknet';
import type { DeploymentData } from "@avnu/gasless-sdk";
import { decryptPin, encryptSecretWithPin } from '@/app/lib/utils';

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

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
        if (token !== CAVOS_TOKEN) {
            console.log(token, CAVOS_TOKEN);
            return NextResponse.json(
                { message: 'Unauthorized: Invalid Bearer token' },
                { status: 401 }
            );
        }
        let { pin } = await req.json();
        pin = decryptPin(pin, SECRET_TOKEN);
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });
        try {
            const argentXaccountClassHash =
                '0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

            const privateKeyAX = stark.randomAddress();
            const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

            const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
            const axGuardian = new CairoOption(1);
            const AXConstructorCallData = CallData.compile({
                owner: axSigner,
                guardian: axGuardian,
            });

            const AXcontractAddress = hash.calculateContractAddressFromHash(
                argentXaccountClassHash,
                argentXaccountClassHash,
                AXConstructorCallData,
                0
            );

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

            const account = new Account(provider, AXcontractAddress, privateKeyAX);

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
                console.log("Error generating wallet:" + typeDataResponse.statusText);
                return NextResponse.json({ data: typeDataResponse.statusText }, { status: 500 });
            }

            const encryptedPK = encryptSecretWithPin(pin, privateKeyAX);

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
                console.log("Error generating wallet:" + executeResponse.statusText);
                return NextResponse.json({ data: executeResponse.statusText }, { status: 500 });
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