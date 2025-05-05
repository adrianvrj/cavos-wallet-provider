import axios from "axios";

export const fetchCryptoPrice = async (symbol: string): Promise<number> => {
  const url = `https://api.dev.pragma.build/node/v1/data/${symbol.toLowerCase()}/usd`;
  const response = await axios.get(url, {
    headers: {
      "x-api-key": process.env.PRAGMA_API_KEY,
      Accept: "application/json",
    },
  });
  return Number(BigInt(response.data.price)) / 10 ** response.data.decimals;
};
