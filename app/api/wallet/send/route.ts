import { NextResponse } from 'next/server';
import { RpcProvider, Call, Account, TypedData } from 'starknet';
import { formatCall } from "@avnu/gasless-sdk";
import { decryptPin, decryptSecretWithPin, formatAmount, parseResponse } from '@/app/lib/utils';
import { toBeHex } from 'ethers';

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const AVNU_API_URL = "https://starknet.api.avnu.fi/paymaster/v1";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("Authorization header is missing or invalid.");
            return NextResponse.json(
                { message: 'Unauthorized: Missing or invalid Bearer token' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        if (token !== CAVOS_TOKEN) {
            console.error("Invalid Bearer token.");
            return NextResponse.json(
                { message: 'Unauthorized: Invalid Bearer token' },
                { status: 401 }
            );
        }

        const { amount, address, hashedPk, hashedPin, receiverAddress } = await req.json();
        if (!amount || !address || !hashedPk || !hashedPin || !receiverAddress) {
            console.error("Missing required parameters in the request body.");
            return NextResponse.json(
                { message: 'Bad Request: Missing required parameters.' },
                { status: 400 }
            );
        }

        const pin = decryptPin(hashedPin, SECRET_TOKEN);
        const pk = decryptSecretWithPin(hashedPk, pin);
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });

        try {
            const account = new Account(provider, address, pk);

            const calls: Call[] = [
                {
                    contractAddress: "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
                    entrypoint: "transfer",
                    calldata: [
                        receiverAddress,
                        formatAmount(amount, 6),
                    ],
                },
            ];
            const formattedCalls = formatCall(calls);

            const typeDataResponse = await fetch(`${AVNU_API_URL}/build-typed-data`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "false",
                },
                body: JSON.stringify({
                    userAddress: address,
                    calls: formattedCalls,
                    accountClassHash: null,
                }),
            });

            if (!typeDataResponse.ok) {
                const errorText = await typeDataResponse.text();
                console.error("Error in build-typed-data API response:", errorText);
                throw new Error(`API error in build-typed-data: ${errorText}`);
            }

            const typeData: TypedData = await parseResponse(typeDataResponse);
            console.log("Typed data successfully built.");

            let userSignature = await account.signMessage(typeData);
            if (Array.isArray(userSignature)) {
                userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
            } else if (userSignature.r && userSignature.s) {
                userSignature = [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
            }

            const executeTransaction = await fetch(`${AVNU_API_URL}/execute`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "false",
                },
                body: JSON.stringify({
                    userAddress: address,
                    typedData: JSON.stringify(typeData),
                    signature: userSignature,
                    deploymentData: null,
                }),
            });

            if (!executeTransaction.ok) {
                const errorText = await executeTransaction.text();
                console.error("Error in execute API response:", errorText);
                throw new Error(`API error in execute: ${errorText}`);
            }

            const result = await executeTransaction.json();
            console.log("Transaction executed successfully:", result);

            if (!result.transactionHash) {
                console.error("Transaction hash is missing in the response.");
                throw new Error('The response does not contain the transaction hash.');
            }

            return NextResponse.json({
                result: result.transactionHash,
            });
        } catch (error: any) {
            console.error("Error during transaction execution:", error);
            return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}