// Permutations to ignore. If an ignored permutation is specified inside 'inputBlockPermutations' or 'outputBlockPermutations', it will be forcefully used.
export const excludedPermutations = new Set([
    "wood_type",
    "top_slot_bit",
    "weirdo_direction"
]);

export const entryBlocks = new Map([
    [
        "minecraft:acacia_stairs", // Required: Insert here the same value as 'inputBlock'
        [
            {
                inputBlock: "minecraft:acacia_stairs", // Required: The identifier of the block that will be interacted
                inputBlockPermutations: [
                    { key: "weirdo_direction", value: 1 },
                    { key: "upside_down_bit", value: true }
                ], // Optional: If you want to specify permutations for the 'inputBlock', add them here.
                outputBlock: "minecraft:oak_stairs", // Required: The identifier of the block that will be set after the interaction
                outputBlockPermutations: [
                    { key: "weirdo_direction", value: 2 },
                    { key: "upside_down_bit", value: true }
                ], // Optional: If you don't specify permutations for the 'outputBlock' and the 'outputBlock' shares one or more permutations with the 'inputBlock', their values will be preserved during the interaction.
                interactionParticle: "minecraft:villager_angry", // Optional: The particle identifier, if none leave ""
                interactionSound: "use.stone", // Optional: The sound identifier, if none leave ""
                itemTag: "minecraft:is_sword", // Required: The tag that will be used to indentify the item(s) used in this interaction
                itemType: "Durability" // Optional: The type of consumption of your item, values accepted are "Stackable", "Durability" or ""
            },
            {
                // In case you want the same block to have more than one interaction:
                inputBlock: "minecraft:acacia_stairs",
                inputBlockPermutations: [
                    { key: "weirdo_direction", value: 1 },
                    { key: "upside_down_bit", value: false }
                ],
                outputBlock: "minecraft:oak_stairs",
                outputBlockPermutations: [
                    { key: "weirdo_direction", value: 1 },
                    { key: "upside_down_bit", value: true }
                ],
                interactionParticle: "minecraft:villager_angry",
                interactionSound: "use.stone",
                itemTag: "minecraft:is_sword",
                itemType: "Durability"
            }
        ]
    ],
    // Add more blocks for more interactions:
    [
        "minecraft:oak_slab",
        [
            {
                inputBlock: "minecraft:oak_slab",
                inputBlockPermutations: [
                    { key: "minecraft:vertical_half", value: "bottom" },
                ],
                outputBlock: "minecraft:birch_slab",
                outputBlockPermutations: [],
                interactionParticle: "minecraft:crop_growth_emitter",
                interactionSound: "dig.dirt",
                itemTag: "minecraft:coals",
                itemType: "Stackable"
            },
            {
                inputBlock: "minecraft:oak_slab",
                inputBlockPermutations: [
                    { key: "minecraft:vertical_half", value: "top" },
                ],
                outputBlock: "minecraft:birch_slab",
                outputBlockPermutations: [],
                interactionParticle: "minecraft:crop_growth_emitter",
                interactionSound: "dig.dirt",
                itemTag: "minecraft:coals",
                itemType: "Stackable"
            }
        ]
    ]
]);
