import { NextResponse } from 'next/server';
import { RpcProvider, Call, Account, wallet, WalletAccount, CairoCustomEnum, CairoOption, CallData, num, TypedData, cairo } from 'starknet';
import { formatCall, type DeploymentData } from "@avnu/gasless-sdk";
import { decryptPin, decryptSecretWithPin, encryptSecretWithPin, formatAmount, parseResponse } from '@/lib/utils';
import { toBeHex } from 'ethers';

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
            return NextResponse.json(
                { message: 'Unauthorized: Invalid Bearer token' },
                { status: 401 }
            );
        }
        let { amount, address, hashedPk, hashedPin } = await req.json();
        let pin = decryptPin(hashedPin, SECRET_TOKEN);
        let pk = decryptSecretWithPin(hashedPk, pin);
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });
        try {
            const account = new Account(
                provider,
                address,
                pk
            );

            let calls: Call[] = [
                {
                    contractAddress: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
                    entrypoint: 'approve',
                    calldata: [
                        "0x028795e04b2abaf61266faa81cc02d4d1a6ef8574fef383cdf6185ca580648aa",
                        formatAmount(amount, 6)
                    ],
                },
                {
                    contractAddress: "0x028795e04b2abaf61266faa81cc02d4d1a6ef8574fef383cdf6185ca580648aa",
                    entrypoint: "deposit",
                    calldata: [
                        formatAmount(amount, 6),
                        address,
                    ],
                },
            ];

            calls = formatCall(calls);

            const typeDataResponse = await fetch("https://starknet.api.avnu.fi/paymaster/v1/build-typed-data", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "false",
                },
                body: JSON.stringify({
                    "userAddress": address,
                    "calls": calls,
                    "gasTokenAddress": "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
                    "maxGasTokenAmount": toBeHex(BigInt(10000)),
                    "accountClassHash": null
                }),
            });

            if (!typeDataResponse.ok) {
                const errorText = await typeDataResponse.text();
                throw new Error(`API error typedata: ${errorText}`);
            }

            let typeData: TypedData = await parseResponse(typeDataResponse);
            // Sign the message
            let userSignature = (await account.signMessage(typeData));
            if (Array.isArray(userSignature)) {
                userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
            } else if (userSignature.r && userSignature.s) {
                userSignature = [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
            }

            const executeTransaction = await fetch("https://starknet.api.avnu.fi/paymaster/v1/execute", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "true",
                },
                body: JSON.stringify({
                    "userAddress": address,
                    "typedData": JSON.stringify(typeData),
                    "signature": userSignature,
                    "deploymentData": null,
                },),
            });

            if (!executeTransaction.ok) {
                const errorText = await executeTransaction.text();
                throw new Error(`Error en la API de ejecución:` + errorText);
            }

            const result = await executeTransaction.json();
            // console.log('Resultado de la transacción:', result);

            if (!result.transactionHash) {
                throw new Error('La respuesta no contiene el hash de la transacción');
            }

            return NextResponse.json({
                result: result.transactionHash,
            });
        } catch (error) {
            console.log("Error creating position: " + error);
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