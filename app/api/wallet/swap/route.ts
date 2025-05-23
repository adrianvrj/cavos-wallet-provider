import { NextResponse } from 'next/server';
import { RpcProvider, Call, Account, TypedData, cairo } from 'starknet';
import { decryptPin, decryptSecretWithPin, formatAmount, parseResponse } from '@/lib/utils';
import { toBeHex } from 'ethers';
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
        let { address, hashedPk, hashedPin, sellTokenAddress, buyTokenAddress, amount } = await req.json();
        let pin = decryptPin(hashedPin, SECRET_TOKEN);
        let pk = decryptSecretWithPin(hashedPk, pin);
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });
        try {
            const quotes = (await axios.get(`https://starknet.api.avnu.fi/internal/swap/quotes-with-prices?sellTokenAddress=${sellTokenAddress}&buyTokenAddress=${buyTokenAddress}&sellAmount=${toBeHex(amount)}&takerAddress=${address}&size=1&integratorName=AVNU%20Portal`)).data.quotes;
            const account = new Account(
                provider,
                address,
                pk
            );

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
            let userSignature = (await account.signMessage(swapTypedData));
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
            });
        } catch (error) {
            console.log("Error swapping tokens: " + error);
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
