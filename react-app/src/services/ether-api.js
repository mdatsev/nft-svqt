const ethers = require('ethers');
const cache = require('node-cache');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');

const myCache = new cache({ stdTTL: 60000, checkperiod: 0, useClones: false });

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const apiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
const network = process.env.REACT_APP_NETWORK;
console.log(contractAddress);

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
    console.log('Getting images');
    const images = await contract.getImages(fromX, toX, fromY, toY);
    console.log('DONE WITH IMAGES')
    console.log(images);
    return images;
}


export const config = {
    tokenApiUrl: 'http://localhost:5000/',
    chainId: '0x4',
    contractAddress: '0xD7A447D38Eb609409a73075f7aa20f3B1CEf77f6',
    contractABI: [
        'function setImage(uint256 x, uint256 y, string calldata image) external',
        'function mint(uint256 x, uint256 y) external payable',
        'function tokenPrice() external view returns (uint256)',
    ],
    whitelist: [
        "", ""
    ],
};

export async function connectWallet() {
    if (!window.ethereum) {
        alert('Please install MetaMask to interact with this feature');
        return;
    }

    let accounts;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }],
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (window.ethereum.chainId != config.chainId) {
            alert(`Please switch MetaMask network to ${config.chainId}`);
            return;
        }
    } catch (error) {
        if (error.code == -32002) {
            alert('Please open your MetaMask and select an account');
            return;
        } else if (error.code == 4001) {
            alert('Please connect with MetaMask');
            return;
        } else {
            throw error;
        }
    }

    return accounts[0];
}

async function setImage(x, y, image) {
    await connectWallet();

    const iface = new ethers.utils.Interface(config.contractABI);
    const params = iface.encodeFunctionData('setImage', [
        ethers.utils.hexlify(x),
        ethers.utils.hexlify(y),
        image
    ]);

    const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
            {
                from: window.ethereum.selectedAddress,
                to: config.contractAddress,
                value: '0x0',
                data: params,
            },
        ],
    });
}



export async function mint(x, y, isWhitelist=false) {
    await connectWallet();

    try {
        const contract = new ethers.Contract(
            config.contractAddress,
            config.contractABI,
            new ethers.providers.Web3Provider(window.ethereum)
        );

        const iface = new ethers.utils.Interface(config.contractABI);
        let params;
        if (isWhitelist) {
            const claimingAddress = keccak256(window.ethereum.selectedAddress);
            const leaftNodes = config.whitelist.map(addr => keccak256(addr));
            const merkle = new MerkleTree(leaftNodes, keccak256, { sortPairs: true });
            const rootHash = merkle.getHexRoot();
            console.log(rootHash);
            if (await contract.whitelistRoot() != rootHash) {
                return alert('Whitelist does not match.');
            }

            params = iface.encodeFunctionData('whitelistMint', [ ethers.utils.hexlify(x), ethers.utils.hexlify(y), merkle.getHexProof(claimingAddress)]);
        } else {
            params = iface.encodeFunctionData('mint', [
                ethers.utils.hexlify(x),
                ethers.utils.hexlify(y)
            ]);
        }

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    from: window.ethereum.selectedAddress,
                    to: config.contractAddress,
                    value: (await contract.tokenPrice()).toHexString(),
                    data: params,
                },
            ],
        });
        try {
            const tx = await (new ethers.providers.Web3Provider(window.ethereum)).getTransaction(txHash);
            const txReceipt = await tx.wait();
            console.log(txReceipt);
        } catch (err) {
            console.log(err);
            return alert('There was an error with your transaction. Please try again.');
        }
    } catch (e) {
        console.log(e);
        return alert(e.stack);
    }

    return true;
}
const worldSize = 10;
const imgSize = 100;

function makeImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

const imageUrls = [];
const owners = [];

async function getWorld() {
    const values = await getImages(0, worldSize, 0, worldSize);
    const tiles = [];
    for (let i = 0; i < worldSize; i++) {
        tiles.push([]);
        for (let j = 0; j < worldSize; j++) {
            const link = values[0][i * worldSize + j] ? values[0][i * worldSize + j] : 'images/tile.jpg';
            owners.push(values[1][i * worldSize + j]);
            imageUrls.push(link);
            tiles[i].push(makeImage(link));
        }
    }

    return tiles;
}

export {
    getWorld,
    getImage,
    getImages
}
