import { NextResponse } from 'next/server';
import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CallData, Account, num, hash } from 'starknet';
import type { DeploymentData } from "@avnu/gasless-sdk";
import { decryptPin, encryptSecretWithPin } from '@/lib/utils';

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log(authHeader, CAVOS_TOKEN);
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
                '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f';

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

            const typeDataResponse = await fetch("https://chipi-back-production.up.railway.app/chipi-wallets/prepare-creation", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.CHIPI_PK}`,
                    'X-API-Key': process.env.CHIPI_API_KEY || "",
                },
                body: JSON.stringify({
                    publicKey: AXcontractAddress,
                    appId: process.env.CHIPI_APP_ID,
                }),
            });
            const { typeData, accountClassHash: accountClassHashResponse } = await typeDataResponse.json();

            const userSignature = await account.signMessage(typeData);

            const deploymentData: DeploymentData = {
                class_hash: accountClassHashResponse,
                salt: starkKeyPubAX,
                unique: `${num.toHex(0)}`,
                calldata: AXConstructorCallData.map((value) => num.toHex(value)),
            };

            const encryptedPK = encryptSecretWithPin(pin, privateKeyAX);

            const executeTransactionResponse = await fetch("https://chipi-back-production.up.railway.app/chipi-wallets", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.CHIPI_PK}`,
                    'X-API-Key': process.env.CHIPI_API_KEY || "",
                },
                body: JSON.stringify({
                    publicKey: AXcontractAddress,
                    userSignature: {
                        r: (userSignature as any).r.toString(),
                        s: (userSignature as any).s.toString(),
                        recovery: (userSignature as any).recovery
                    },
                    typeData,
                    appId: process.env.CHIPI_APP_ID,
                    encryptedPrivateKey: encryptedPK,
                    deploymentData: {
                        ...deploymentData,
                        salt: `${deploymentData.salt}`,
                        calldata: deploymentData.calldata.map(data => `${data}`),
                    }
                }),
            });

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