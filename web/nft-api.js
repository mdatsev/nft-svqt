require('dotenv').config();
const ethers = require('ethers');
const cache = require('node-cache');

const myCache = new cache({ stdTTL: 60000, checkperiod: 0, useClones: false });

const contractAddress = process.env.CONTRACT_ADDRESS;
const apiKey = process.env.ALCHEMY_API_KEY;
const network = process.env.NETWORK;

const abi = ['function getImage(uint256 x, uint256 y) external view returns (string memory)'];
const contract = new ethers.Contract(contractAddress, abi, ethers.Wallet.createRandom().connect(new ethers.providers.AlchemyProvider(network, apiKey)));

let backupValue = {};

async function getImage(x, y) {
  const cacheKey = `${x}:${y}`;
  
  const cached = myCache.get(cacheKey);
  if (cached) {
    console.log(`cache hit for ${cacheKey}`);
    return cached;
  }

  try {
    const promiseCacheKey = `${x}:${y}:promise`;
    const promise = myCache.get(promiseCacheKey);

    let image;
    if (promise) {
      console.log(`Promise found for ${promiseCacheKey}`);
      image = await promise;
      console.log(`Awaited promise for ${promiseCacheKey}`);
      myCache.del(promiseCacheKey);
    } else {
      console.log(`Sending request to alchemy for ${cacheKey}`, new Date().toISOString());
      const newPromise = contract.getImage(x, y);
      myCache.set(promiseCacheKey, newPromise);
      image = await newPromise;
      console.log(`Got image for ${cacheKey}`);
    }
    console.log(`Setting cache for ${cacheKey}`);
    myCache.set(cacheKey, image);
    return image;
  } catch (e) {
    console.log(`Setting cache for ${cacheKey} (error - empty)`);
    myCache.set(cacheKey, '');

    console.error(e);
    return '';
  }
}

module.exports = {
  getImage
};