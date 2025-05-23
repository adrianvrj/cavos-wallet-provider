import { NextResponse } from 'next/server';
import { RpcProvider, Call, Account, TypedData, cairo } from 'starknet';
import { formatCall } from "@avnu/gasless-sdk";
import { decryptPin, decryptSecretWithPin, formatAmount, parseResponse } from '@/app/lib/utils';
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
        let { address, hashedPk, hashedPin, poolId } = await req.json();
        let pin = decryptPin(hashedPin, SECRET_TOKEN);
        let pk = decryptSecretWithPin(hashedPk, pin);
        const provider = new RpcProvider({ nodeUrl: process.env.RPC });
        try {
            const userPositions = (
                await axios.get(`https://api.vesu.xyz/positions?walletAddress=${address}&type=earn`)
            ).data.data;
            const positions = userPositions.filter(
                (item: { type: string; pool: { id: string } }) =>
                    item.pool.id === poolId
            )[0];

            const account = new Account(
                provider,
                address,
                pk
            );

            let calls: Call[] = [
                {
                    contractAddress: "0x028795e04b2abaf61266faa81cc02d4d1a6ef8574fef383cdf6185ca580648aa",
                    entrypoint: 'redeem',
                    calldata: [
                        positions.collateralShares.value,
                        "0",
                        address,
                        address,
                    ],
                },
            ];

            calls = formatCall(calls);

            console.log("Calls: ", calls);  

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
                throw new Error('TxHash not found');
            }

            return NextResponse.json({
                result: result.transactionHash,
                amount: positions.collateral.value / 10 ** 6,
            });
        } catch (error) {
            console.log("Error closing position: " + error);
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
