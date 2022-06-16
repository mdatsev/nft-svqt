const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

let whitelistedAddresses = [
    '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
    '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'
];

const leafNodes = whitelistedAddresses.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

console.log(merkleTree.getHexRoot());
console.log(merkleTree.getHexProof(leafNodes[0]));