// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SkillMenu {
    uint256 public nextSkillId = 1;

    struct SkillCard {
        address creator;
        string skillName;
        string priceNote;
        string deliveryTime;
        string details;
        uint256 createdAt;
    }

    mapping(uint256 => SkillCard) private skills;

    event SkillPublished(
        uint256 indexed skillId,
        address indexed creator,
        string skillName,
        string priceNote,
        string deliveryTime
    );

    function publishSkill(
        string calldata skillName,
        string calldata priceNote,
        string calldata deliveryTime,
        string calldata details
    ) external returns (uint256 skillId) {
        require(bytes(skillName).length > 0 && bytes(skillName).length <= 48, "Invalid skill");
        require(bytes(priceNote).length > 0 && bytes(priceNote).length <= 28, "Invalid price");
        require(bytes(deliveryTime).length > 0 && bytes(deliveryTime).length <= 28, "Invalid delivery");
        require(bytes(details).length > 0 && bytes(details).length <= 220, "Invalid details");

        skillId = nextSkillId++;
        skills[skillId] = SkillCard({
            creator: msg.sender,
            skillName: skillName,
            priceNote: priceNote,
            deliveryTime: deliveryTime,
            details: details,
            createdAt: block.timestamp
        });

        emit SkillPublished(skillId, msg.sender, skillName, priceNote, deliveryTime);
    }

    function getSkill(
        uint256 skillId
    )
        external
        view
        returns (
            address creator,
            string memory skillName,
            string memory priceNote,
            string memory deliveryTime,
            string memory details,
            uint256 createdAt
        )
    {
        SkillCard storage entry = skills[skillId];
        return (
            entry.creator,
            entry.skillName,
            entry.priceNote,
            entry.deliveryTime,
            entry.details,
            entry.createdAt
        );
    }
}
