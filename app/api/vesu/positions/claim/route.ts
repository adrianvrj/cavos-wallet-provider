import { NextResponse } from 'next/server';
import { RpcProvider, Call, Account, TypedData, cairo } from 'starknet';
import { formatCall } from "@avnu/gasless-sdk";
import { decryptPin, decryptSecretWithPin, formatAmount, parseResponse } from '@/lib/utils';
import { toBeHex, toBigInt } from 'ethers';
import axios from 'axios';

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
        let { address, hashedPk, hashedPin } = await req.json();
        let pin = decryptPin(hashedPin, SECRET_TOKEN);
        let pk = decryptSecretWithPin(hashedPk, pin);
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });
        try {
            const calldata = (await axios.get(`https://api.vesu.xyz/users/${address}/strk-rewards/calldata`)).data
                .data;

            const quotes = (await axios.get(`https://starknet.api.avnu.fi/internal/swap/quotes-with-prices?sellTokenAddress=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d&buyTokenAddress=0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8&sellAmount=${calldata.amount}&takerAddress=${address}&size=1&integratorName=AVNU%20Portal`)).data.quotes;

            const account = new Account(
                provider,
                address,
                pk
            );

            let calls: Call[] = [
                {
                    contractAddress: "0x0387f3eb1d98632fbe3440a9f1385aec9d87b6172491d3dd81f1c35a7c61048f",
                    entrypoint: 'claim',
                    calldata: [
                        calldata.amount,
                        calldata.proof
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

            if (!result.transactionHash) {
                throw new Error('La respuesta no contiene el hash de la transacción');
            }

            await provider.waitForTransaction(result.transactionHash);

            const swapTypedDataResponse = await fetch("https://starknet.api.avnu.fi/swap/v2/build-typed-data", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "false",
                },
                body: JSON.stringify({
                    "quoteId": quotes[0].quoteId,
                    "takerAddress": address,
                    "slippage": 0.05,
                    "includeApprove": true,
                    "gasTokenAddress": "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
                    "maxGasTokenAmount": toBeHex(1000000)
                }),
            });

            if (!swapTypedDataResponse.ok) {
                const errorText = await swapTypedDataResponse.text();
                throw new Error(`API error swap typedata: ${errorText}`);
            }

            const swapTypedData: TypedData = await parseResponse(swapTypedDataResponse);
            // Sign the message
            userSignature = (await account.signMessage(swapTypedData));
            if (Array.isArray(userSignature)) {
                userSignature = userSignature.map((sig) => toBeHex(BigInt(sig)));
            } else if (userSignature.r && userSignature.s) {
                userSignature = [toBeHex(BigInt(userSignature.r)), toBeHex(BigInt(userSignature.s))];
            }

            const swapExecuteTransaction = await fetch("https://starknet.api.avnu.fi/swap/v2/execute", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.AVNU_API_KEY || "",
                    'ask-signature': "false",
                },
                body: JSON.stringify({
                    "quoteId": quotes[0].quoteId,
                    "signature": userSignature
                }),
            });

            if (!swapExecuteTransaction.ok) {
                const errorText = await swapExecuteTransaction.text();
                console.error("Error in execute API swap response:", errorText);
                return NextResponse.json({
                    result: false,
                });
            }

            const swapResult = await swapExecuteTransaction.json();

            console.log("Swap Transaction executed successfully:", swapResult);

            if (!swapResult.transactionHash) {
                console.error("Swap Transaction hash is missing in the response.");
                throw new Error('The response does not contain the transaction hash.');
            }

            return NextResponse.json({
                result: swapResult.transactionHash,
                amount: toBigInt(calldata.amount),
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
