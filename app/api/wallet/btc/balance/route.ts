import { ERC20_ABI } from '@/abis/ERC20_ABI';
import { NextResponse } from 'next/server';
import { RpcProvider, Contract, constants } from 'starknet';

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;

const WBTC_CONTRACT_ADDRESS =
    '0x03Fe2b97C1Fd336E750087D68B9b867997Fd64a2661fF3ca5A7C771641e8e7AC';

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
        const { address, tokenAddress = WBTC_CONTRACT_ADDRESS } = await req.json();
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

        const decimals = 8;
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
