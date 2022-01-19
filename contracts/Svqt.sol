// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Svqt is ERC721Enumerable, Ownable {
  using Strings for uint256;

  uint256 public tokenPrice = 0.01 ether;
  uint256 public worldWidth = 10;
  uint256 public worldHeight = 10;

  mapping(uint256 => string) public images;

  constructor() ERC721("NFT Svqt", "SVQT") {
      
  }

  function getTokenId(uint256 x, uint256 y) public pure returns (uint256) {
    return (x << 128) | y;
  }
  function getXY(uint256 tokenId) public pure returns (uint256 x, uint256 y) {
    return (tokenId >> 128, tokenId & ((1 << 128) - 1));
  }

  function mint(uint256 x, uint256 y) external payable {
    uint256 tokenId = getTokenId(x, y);
    require(msg.value >= tokenPrice, "Incorrect ETH sent");
    require(!_exists(tokenId), "Land already minted");
    _safeMint(msg.sender, tokenId);
  }

  function setImage(uint256 x, uint256 y, string calldata image) external {
    uint256 tokenId = getTokenId(x, y);
    require(ownerOf(tokenId) == msg.sender, "Only the owner of the land can set the image");
    images[tokenId] = image;
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
}