import { world, EquipmentSlot, EntityEquippableComponent, system, ItemDurabilityComponent } from '@minecraft/server';
import { entryBlocks, excludedPermutations } from './blocksList_ame.js';

world.beforeEvents.worldInitialize.subscribe((blockComponentRegistry) => {
    blockComponentRegistry.itemComponentRegistry.registerCustomComponent("ame:swing_animation", {
        onUseOn() { }
    });
});

const processedBlocks = {};
const PROCESS_TIME_WINDOW = 20;
const entryBlocksMap = new Map();

entryBlocks.forEach((blockData, key) => {
    if (blockData.inputBlock) {
        if (!entryBlocksMap.has(blockData.inputBlock)) {
            entryBlocksMap.set(blockData.inputBlock, []);
        }
        entryBlocksMap.get(blockData.inputBlock).push(blockData);
    }
});

world.beforeEvents.itemUseOn.subscribe((eventData) => {
    const block = eventData.block;
    const player = eventData.source;
    const face = eventData.blockFace;
    const mainhand = player.getComponent(EntityEquippableComponent.componentId)?.getEquipmentSlot(EquipmentSlot.Mainhand);
    const item = mainhand?.getItem();
    const { x, y, z } = block.location;
    const blockKey = `${x}, ${y}, ${z}`;
    const lastProcessedTime = processedBlocks[blockKey];
    const blockAbove = block.above();

    if (!mainhand || !item) return;

    if (lastProcessedTime && Date.now() - lastProcessedTime < PROCESS_TIME_WINDOW) {
        return;
    }

    processedBlocks[blockKey] = Date.now();
    const matchingConfigs = entryBlocks.get(block.typeId);

    if (matchingConfigs && face !== "Down") {

        matchingConfigs.forEach((matchingBlock) => {
            if (blockAbove?.typeId != "minecraft:air" && matchingBlock.itemTag == "minecraft:is_shovel") return;
            const expectedStates = Object.fromEntries(matchingBlock.inputBlockPermutations.map(perm => [perm.key, perm.value]));

            if (!block.matches || !block.matches(matchingBlock.inputBlock, expectedStates)) {
                return;
            }

            if (matchingBlock.itemTag && mainhand.hasTag(matchingBlock.itemTag)) {
                system.run(() => {
                    const oldBlock = block;
                    const inputBlockPermutations = oldBlock.permutation.getAllStates();
                    block.setType(matchingBlock.outputBlock);
                    const newBlock = block;

                    if (newBlock) {
                        let newBlockPermutation = newBlock.permutation;
                        const outputBlockPermutations = newBlock.permutation.getAllStates();

                        matchingBlock.outputBlockPermutations.forEach(({ key, value }) => {
                            newBlockPermutation = newBlockPermutation.withState(key, value);
                        });

                        for (let key in inputBlockPermutations) {
                            const outputHasKey = matchingBlock.outputBlockPermutations.some(perm => perm.key === key);

                            if (!outputHasKey && outputBlockPermutations.hasOwnProperty(key) && (!excludedPermutations.has(key) || matchingBlock.inputBlockPermutations.some(perm => perm.key === key) || matchingBlock.outputBlockPermutations.some(perm => perm.key === key))) {
                                newBlockPermutation = newBlockPermutation.withState(key, inputBlockPermutations[key]);
                            }
                        }

                        newBlock.setPermutation(newBlockPermutation);
                    }
                    player.playSound(matchingBlock.interactionSound, { location: block });
                    block.dimension.spawnParticle(matchingBlock.interactionParticle, { x: x + 0.5, y: y + 0.75, z: z + 0.5 });
                    reduceItem(player, mainhand, item, matchingBlock.itemType);
                });
            }
        });
    }
    system.run(() => {
        delete processedBlocks[blockKey];
    });
});

function reduceItem(player, mainhand, item, itemType) {
    if (item.amount < 1) return undefined;
    if (itemType === "Durability") {
        mainhand.setItem(reduceDurability(player, item));
    } else if (itemType === "Stackable") {
        mainhand.setItem(reduceStack(player, item));
    }
}

function reduceStack(player, item) {
    if (player.getGameMode() === "creative") return item;
    item.amount -= 1;
    return item;
}

function reduceDurability(player, item) {
    if (player.getGameMode() === "creative") return item;
    const comp = item.getComponent(ItemDurabilityComponent.componentId);
    if (!comp) return item;
    comp.damage += 1;
    if (comp.damage >= comp.maxDurability) {
        world.playSound("random.break", player.location);
        return undefined;
    }
    return item;
}
