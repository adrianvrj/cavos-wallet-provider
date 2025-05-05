import { Position, VesuEarnPosition } from "@/types/vesuEarnPosition";
import axios from "axios";
import { fetchCryptoPrice } from "../pragma/pragmaApi";

export const getEarnPositionsByPool = async (
  address: string,
  poolName: string
): Promise<VesuEarnPosition[]> => {
  if (!address) return [];

  try {
    const allPositions = await fetchPositions(address);
    const filteredPositions = allPositions.filter(
      (item) => item.type === "earn" && item.pool.name === poolName
    );

    const pools = await getVesuPools();

    const earnPositions = await Promise.all(
      filteredPositions.map((position) => mapPositionToEarn(position, pools))
    );

    return earnPositions;
  } catch (error: any) {
    console.error("Error in getEarnPositionsByPool:", error.message || error);
    return [];
  }
};

const fetchPositions = async (address: string): Promise<Position[]> => {
  const response = await axios.get(
    `https://api.vesu.xyz/positions?walletAddress=${address}`
  );
  return response.data.data;
};

const evaluateRisk = (utilization: number): string => {
  if (utilization > 80) return "High";
  if (utilization > 50) return "Medium";
  return "Low";
};

const mapPositionToEarn = async (
  position: Position,
  pools: Awaited<ReturnType<typeof getVesuPools>>
): Promise<VesuEarnPosition> => {
  const poolData = pools.find(
    (pool: { id: string }) => pool.id === position.pool.id
  );
  let poolApy = 0;
  let rewardsApy = 0;
  let risk = "Low";

  const tokenPrice = await fetchCryptoPrice(position.collateral.symbol);

  if (poolData) {
    const asset = poolData.assets.find(
      (a: { symbol: string }) => a.symbol === position.collateral.symbol
    );
    if (asset) {
      poolApy = asset.apy;
      rewardsApy = asset.defiSpringApy;
      risk = evaluateRisk(asset.currentUtilization);
    }
  }

  return {
    poolId: position.pool.id,
    pool: position.pool.name,
    type: position.type,
    collateral: position.collateral.symbol,
    total_supplied:
      (Number(position.collateral.value) / 10 ** position.collateral.decimals) *
      tokenPrice,
    risk,
    poolApy,
    rewardsApy,
  };
};

export const getVesuPools = async () => {
  try {
    const response = await axios.get("https://api.vesu.xyz/pools");
    const pools = response.data.data;

    return pools.filter((pool: any) => pool.isVerified).map(formatVesuPool);
  } catch (error: any) {
    console.error(
      "Error fetching Vesu pools:",
      error?.response?.data || error.message
    );
    return [];
  }
};

const formatVesuPool = (pool: any) => ({
  id: pool.id,
  name: pool.name,
  address: pool.extensionContractAddress,
  assets: pool.assets.map(formatVesuAsset),
});

const formatVesuAsset = (asset: any) => {
  const toNumber = (value: string, decimals: number) =>
    Number(value) / 10 ** decimals;

  return {
    name: asset.name,
    symbol: asset.symbol,
    currentUtilization:
      toNumber(
        asset.stats.currentUtilization.value,
        asset.stats.currentUtilization.decimals
      ) * 100,
    apy:
      toNumber(asset.stats.supplyApy.value, asset.stats.supplyApy.decimals) *
      100,
    defiSpringApy:
      toNumber(
        asset.stats.defiSpringSupplyApr?.value || "0",
        asset.stats.defiSpringSupplyApr?.decimals || 0
      ) * 100,
    decimals: asset.decimals,
    address: asset.address,
    vTokenAddress: asset.vToken.address,
  };
};
