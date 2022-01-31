require('dotenv').config();
const ethers = require('ethers');
const cache = require('node-cache');

const myCache = new cache({ stdTTL: 60, checkperiod: 0, useClones: false });

const contractAddress = process.env.CONTRACT_ADDRESS;
const apiKey = process.env.ALCHEMY_API_KEY;
const network = process.env.NETWORK;

const abi = ['function getImage() external view returns (string memory)'];
const contract = new ethers.Contract(contractAddress, abi, ethers.Wallet.createRandom().connect(new ethers.providers.AlchemyProvider(network, apiKey)));

let backupValue = 'INVALID';

async function getImage(x, y) {
  try {
    const cacheKey = `${x}:${y}`;
    const cached = myCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const promiseCacheKey = `${x}:${y}:promise`;
    const promise = myCache.get(promiseCacheKey);

    let image;
    if (promise) {
      image = await promise;
      myCache.del(promiseCacheKey);
    } else {
      console.log('sending request to alchemy', new Date().toISOString());
      const newPromise = contract.getImage(x, y);
      myCache.set(promiseCacheKey, newPromise);
      image = await newPromise;
    }

    
    myCache.set(cacheKey, image);
    return backupValue = image;
  } catch (e) {
    console.error(e);
    return backupValue;
  }
}

module.exports = {
  getImage
};