// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";


contract Svqt is ERC721Enumerable, Ownable, PaymentSplitter {
    using Strings for uint256;

    uint256 public tokenPrice = 0.01 ether;
    uint256 public whitelistPrice = 0.005 ether;
    uint256 public worldWidth = 10;
    uint256 public worldHeight = 10;

    mapping(uint256 => string) public images;
    mapping(address => uint) public balanceReceived;

    bool public saleStarted = false;
    bool public presaleStarted = false;
    address public verifier = 0x5FD6eB55D12E759a21C09eF703fe0CBa1DC9d88D;

    uint256[] private _teamShares = [50, 50];
    address[] private _team = [
        0x4f36b54816a59e999D2Ca2281F194C69f90d302e,
        0x740f557dFC7b4648d82417bA6F587124FBB20236
    ];

    modifier isWhitelisted(address target, bytes32[] memory proof) {
        (bool success, bytes memory result) = verifier.call(abi.encodeWithSignature("isWhitelisted(address,bytes32[])", msg.sender, proof));
        require(success, "Problem with whitelist verification");
        (bool verified) = abi.decode(result, (bool));
        require(verified, "Address not whitelisted");
        _;
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    constructor() 
        ERC721("NFT Svqt", "SVQT") 
        PaymentSplitter(_team, _teamShares) 
    { }

    function setSaleStarted(bool val) external onlyOwner {
        saleStarted = val;
    }

    function setPresaleStarted(bool val) external onlyOwner {
        presaleStarted = val;
    }

    function setPrice(uint256 val) external onlyOwner {
        tokenPrice = val;
    }

    function setWorldWidth(uint256 val) external onlyOwner {
        worldWidth = val;
    }

    function setWorldHeight(uint256 val) external onlyOwner {
        worldHeight = val;
    }

    function getTokenId(uint256 x, uint256 y) public pure returns (uint256) {
        return (x << 128) | y;
    }
    function getXY(uint256 tokenId) public pure returns (uint256 x, uint256 y) {
        return (tokenId >> 128, tokenId & ((1 << 128) - 1));
    }

    function mint(uint256 x, uint256 y) external payable callerIsUser {
        uint256 tokenId = getTokenId(x, y);
        require(saleStarted, "Sale not started");
        require(msg.value >= tokenPrice, "Incorrect ETH sent");
        require(!_exists(tokenId), "Land already minted");
        _safeMint(msg.sender, tokenId);
    }

    function whitelistMint(uint256 x, uint256 y, bytes32[] memory proof) external payable isWhitelisted(msg.sender, proof) callerIsUser {
        uint256 tokenId = getTokenId(x, y);
        require(presaleStarted, "Pesale not started");
        require(msg.value >= whitelistPrice, "Incorrect ETH sent");
        require(!_exists(tokenId), "Land already minted");
        _safeMint(msg.sender, tokenId);
    }

    function setImage(uint256 x, uint256 y, string calldata image) external callerIsUser {
        uint256 tokenId = getTokenId(x, y);
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the land can set the image");
        images[tokenId] = image;
    }

    function getImage(uint256 x, uint256 y) public view returns (string memory, address) {
        uint256 id = getTokenId(x, y);

        return (images[id], _exists(id) ? ownerOf(id) : address(0));
    }

    function getImages(uint256 fromX, uint256 toX, uint256 fromY, uint256 toY) external view returns (string[] memory, address[] memory) {
        string[] memory urls = new string[]((toX - fromX) * (toY - fromY));
        address[] memory owners = new address[]((toX - fromX) * (toY - fromY));
        uint256 i = 0;
        for (uint256 x = fromX; x < toX; x++) {
            for (uint256 y = fromY; y < toY; y++) {
                (urls[i], owners[i]) = getImage(x, y);
                i++;
            }
        }
        return (urls, owners);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        (uint256 x, uint256 y) = getXY(tokenId);

        string memory json = string(abi.encodePacked(
        '{',
            '"name":"', 'Svqt (', Strings.toString(x), ", ", Strings.toString(y), ')', '",',
            '"description":"', '', '",'
            '"image": "', images[tokenId], '"',
        '}'
        ));

        return string(abi.encodePacked('data:application/json;utf8,', json));
    }


    function withdraw() external onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }

    function setVerifier(address addr) external onlyOwner {
        verifier = addr;
    }

    receive() external payable override {
        require(balanceReceived[msg.sender] + msg.value >= balanceReceived[msg.sender]);
        balanceReceived[msg.sender] += msg.value;
    }

    fallback() external {
        require(false, "Invalid calldata.");
    }
}