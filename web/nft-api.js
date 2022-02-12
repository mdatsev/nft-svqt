require('dotenv').config();
const ethers = require('ethers');
const cache = require('node-cache');

const myCache = new cache({ stdTTL: 60000, checkperiod: 0, useClones: false });

const contractAddress = process.env.CONTRACT_ADDRESS;
const apiKey = process.env.ALCHEMY_API_KEY;
const network = process.env.NETWORK;

const abi = [
  'function getImage(uint256 x, uint256 y) external view returns (string memory, address)',
  'function getImages(uint256 fromX, uint256 toX, uint256 fromY, uint256 toY) external view returns (string[] memory, address[] memory)'
];
const contract = new ethers.Contract(contractAddress, abi, ethers.Wallet.createRandom().connect(new ethers.providers.AlchemyProvider(network, apiKey)));

let backupValue = {};

async function getImage(x, y) {
  const cacheKey = `${x}:${y}`;
  
  const cached = myCache.get(cacheKey);
  if (cached || cached == '') {
    return cached;
  }

  try {
    const promiseCacheKey = `${x}:${y}:promise`;
    const promise = myCache.get(promiseCacheKey);

    let image;
    if (promise) {
      image = await promise;
      myCache.del(promiseCacheKey);
    } else {
      const newPromise = contract.getImage(x, y);
      myCache.set(promiseCacheKey, newPromise);
      image = await newPromise;
      image = { img: image[0], addr: image[1] };
    }
    myCache.set(cacheKey, image ? image : '');
    return image;
  } catch (e) {
    myCache.set(cacheKey, '');

   //  console.error(e);
    return '';
  }
}

async function getImages(fromX, toX, fromY, toY) {
  console.log(`getImages(${fromX}, ${toX}, ${fromY}, ${toY})`);
  const images = await contract.getImages(fromX, toX, fromY, toY);
  console.log(images);
  return images;
}

module.exports = {
  getImage,
  getImages
};