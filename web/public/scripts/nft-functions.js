const config = {
  tokenApiUrl: 'http://localhost:3000/',
  chainId: '0x4',
  contractAddress: '0x3e0A69948AE8359d16B50D730f3973E999d84824',
  contractABI: [
    'function setImage(uint256 x, uint256 y, string calldata image) external',
    'function mint(uint256 x, uint256 y) external payable',
    'function tokenPrice() external view returns (uint256)',
  ]
};

async function getImage(x, y) {
  return fetch(`${config.tokenApiUrl}getImage?x=${x}&y=${y}`).then(res => res.json()).then(resp => { 
    return resp.image;
  });
}

async function getImages(fromX, toX, fromY, toY) {
  return fetch(`${config.tokenApiUrl}getImages?fromX=${fromX}&toX=${toX}&fromY=${fromY}&toY=${toY}`).then(res => res.json()).then(resp => { 
    return resp.images;
  });
}

async function connectWallet() {
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

async function mint(x, y) {
  await connectWallet();

  const contract = new ethers.Contract(
    config.contractAddress,
    config.contractABI,
    new ethers.providers.Web3Provider(window.ethereum)
  );

  const iface = new ethers.utils.Interface(config.contractABI);
  const params = iface.encodeFunctionData('mint', [
    ethers.utils.hexlify(x),
    ethers.utils.hexlify(y)
  ]);

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
}

$(() => {
  $('#connect-wallet-form').on('submit', async (e) => {
    e.preventDefault();
    await connectWallet();
  });
  $('#mint-form').on('submit', async (e) => {
    e.preventDefault();
    await mint();
  });
});