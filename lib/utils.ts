import { VesuAsset, VesuPool } from "@/types/vesu";

export const formatVesuPool = (pool: VesuPool) => ({
  id: pool.id,
  name: pool.name,
  address: pool.extensionContractAddress,
  assets: pool.assets.map(formatVesuAsset),
});

export const formatVesuAsset = (asset: VesuAsset) => {
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
