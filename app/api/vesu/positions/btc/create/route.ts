import { NextResponse } from 'next/server';
import { RpcProvider, Call, Account, wallet, WalletAccount, CairoCustomEnum, CairoOption, CallData, num, TypedData, cairo } from 'starknet';
import { formatCall, type DeploymentData } from "@avnu/gasless-sdk";
import { decryptPin, decryptSecretWithPin, encryptSecretWithPin, formatAmount, parseResponse } from '@/app/lib/utils';
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
                    contractAddress: "0x3Fe2b97C1Fd336E750087D68B9b867997Fd64a2661fF3ca5A7C771641e8e7AC",
                    entrypoint: 'approve',
                    calldata: [
                        "0x00c452bacd439bab4e39aeea190b4ff81f44b019d4b3a25fa4da04a1cae7b6ff",
                        formatAmount(amount, 8)
                    ],
                },
                {
                    contractAddress: "0x00c452bacd439bab4e39aeea190b4ff81f44b019d4b3a25fa4da04a1cae7b6ff",
                    entrypoint: "deposit",
                    calldata: [
                        formatAmount(amount, 8),
                        address,
                    ],
                },
            ];

            calls = formatCall(calls);

            const typeDataResponse = await fetch("https://starknet.api.avnu.fi/paymaster/v1/build-typed-data", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "false",
                },
                body: JSON.stringify({
                    "userAddress": address,
                    "calls": calls,
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
                    'api-key': process.env.AVNU_API_KEY || "",
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
            console.log('BTC position created: ', result);

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