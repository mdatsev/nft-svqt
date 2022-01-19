// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
                                          
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoChrist is ERC721Enumerable, Ownable {
  using Strings for uint256;

  uint256 public tokenPrice = 0.01 ether;
  uint256 public worldWidth = 10;
  uint256 public worldHeight = 10;

  constructor() ERC721("NFT Svqt", "SVQT") {
      
  }

  function getTokenId(uint256 x, uint256 y) public pure returns (uint256) {
    return (x << 128) | y;
  }

  function mint(uint256 x, uint256 y) public payable {
    uint256 tokenId = getTokenId(x, y);
    require(msg.value >= tokenPrice, "Incorrect ETH sent");
    require(!_exists(tokenId), "Land already minted");
    _safeMint(msg.sender, tokenId);
  }

  function withdraw() external onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
  }
}