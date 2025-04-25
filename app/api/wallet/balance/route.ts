import { ERC20_ABI } from '@/abis/ERC20_ABI';
import { NextResponse } from 'next/server';
import { RpcProvider, Contract, constants } from 'starknet';

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;

const USDC_CONTRACT_ADDRESS =
    '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8';

// POST handler to get wallet balance
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
        const { address, tokenAddress = USDC_CONTRACT_ADDRESS } = await req.json();
        if (!address) {
            return NextResponse.json(
                { message: 'Missing wallet address' },
                { status: 400 }
            );
        }

        const provider = new RpcProvider({
            nodeUrl:
                process.env.RPC,
        });

        const contract = new Contract(ERC20_ABI, tokenAddress, provider);

        const balanceResult = await contract.balance_of(address);

        const decimals = 6;
        const balanceInUnits = Number(balanceResult) / 10 ** decimals;

        return NextResponse.json({
            balance: balanceInUnits,
            balanceRaw: balanceResult.toString(),
        });
    } catch (error: any) {
        console.error('Error fetching balance:', error);
        return NextResponse.json(
            { message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
