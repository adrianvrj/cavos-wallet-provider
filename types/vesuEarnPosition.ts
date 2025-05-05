export interface Position {
  type: string;
  pool: { id: string; name: string };
  collateral: { symbol: string; value: string; decimals: number };
}

export interface VesuEarnPosition {
  poolId: string;
  pool: string;
  type: string;
  collateral: string;
  total_supplied: number;
  risk: string;
  poolApy: number;
  rewardsApy: number;
}
