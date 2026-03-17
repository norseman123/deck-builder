const GLOBAL_RELICS = [
    { name: "Whetstone", desc: "Start combat with 2 extra cards." },
    { name: "Anchor", desc: "Start combat with 10 Block." },
    { name: "Odd Coin", desc: "Gain 1 extra random card draft option." }
];

const COMMON = { Strike: { name: "Strike", time: 1, damage: 5 }, Defend: { name: "Defend", time: 1, block: 6 } };

const CLASS_DATA = {
    Masochist: {
        maxHp: 80,
        relics: [{ name: "Spiked Collar", desc: "Self DMG grants 3 Block." }],
        starter: [...Array(5).fill(COMMON.Strike), ...Array(5).fill(COMMON.Defend), { name: "Bloodletting", time: 1, damage: 8, selfDamage: 2 }],
        pool: [ 
            { name: "Agony", time: 3, damage: 28, selfDamage: 6 }, 
            { name: "Iron Skin", time: 2, block: 12 },
            { name: "Frenzy", time: 2, damage: 6, hits: 3, selfDamage: 3 }
        ]
    },
    Alchemist: {
        maxHp: 70,
        relics: [{ name: "Toxic Gland", desc: "Poison applied +1." }],
        starter: [...Array(5).fill(COMMON.Strike), ...Array(5).fill(COMMON.Defend), { name: "Acid Splash", time: 2, poison: 4 }],
        pool: [ 
            { name: "Noxious Fumes", time: 3, poison: 10, selfDamage: 2 }, 
            { name: "Stun Powder", time: 2, delayEnemy: 2 },
            { name: "Healing Salve", time: 2, heal: 8 }
        ]
    },
    Chronomancer: {
        maxHp: 65,
        relics: [{ name: "Pocket Watch", desc: "Cards that cost 3+ Time deal 4 extra damage." }],
        starter: [...Array(5).fill(COMMON.Strike), ...Array(5).fill(COMMON.Defend), { name: "Rewind", time: 0, draw: 1, delayEnemy: -1 }],
        pool: [ 
// A Slay the Spire style Power that fundamentally breaks the game rules in your favor
            { name: "Chronostasis", time: 3, isPower: true },
            
            // Timeline manipulation skills 
            { name: "Rubber Band", time: 1, delayEnemy: 3, selfDamage: 5 },
            { name: "Time Steal", time: 0, damage: 5, delayEnemy: 2 },
            { name: "Flash Forward", time: -2, damage: 4, selfDamage: 2 }, // Actually moves your marker LEFT into the past!
            { name: "Stasis Field", time: 2, block: 15, delayEnemy: 1 }
        ]
    },
    Paladin: {
        maxHp: 85,
        relics: [{ name: "Holy Symbol", desc: "Start every combat with 5 Block." }],
        starter: [...Array(4).fill(COMMON.Strike), ...Array(6).fill(COMMON.Defend), { name: "Shield Bash", time: 2, damageFromBlock: true }],
        pool: [ 
            { name: "Divine Aegis", time: 3, block: 25 }, 
            { name: "Smite", time: 2, damage: 12, heal: 2 },
            { name: "Fortify", time: 1, block: 8, draw: 1 }
        ]
    },
    Gambler: {
        maxHp: 70,
        relics: [{ name: "Loaded Dice", desc: "Random damage cards deal +2 minimum damage." }],
        starter: [...Array(5).fill(COMMON.Strike), ...Array(5).fill(COMMON.Defend), { name: "Coin Toss", time: 1, randomDamage: [1, 15] }],
        pool: [ 
{ name: "Snake Eyes", time: 1, randomDamage: [1, 12] },
            { name: "Jackpot", time: 3, randomDamage: [10, 30], randomDiscard: 1 },
            { name: "Sleight of Hand", time: 0, draw: 2, randomDiscard: 1 },
            { name: "Stacked Deck", time: 2, block: 10, draw: 1 },
            { name: "Double Down", time: 2, randomDamage: [5, 20], selfDamage: 3 },
            { name: "Card Trick", time: 1, damage: 6, draw: 1 },
            { name: "Fold", time: 1, block: 15, randomDiscard: 2 },
            { name: "High Roller", time: 3, randomDamage: [15, 25] },
            { name: "Desperate Bet", time: 0, draw: 3, randomDiscard: 2 },
            { name: "Roulette", time: 2, randomDamage: [0, 40] },
            { name: "Bluff", time: 1, block: 8, delayEnemy: 1 },
            { name: "Card Toss", time: 1, damage: 4, hits: 3 },
            { name: "Lucky Sevens", time: 2, damage: 7, hits: 2, draw: 1 },
            { name: "Ante Up", time: 1, selfDamage: 4, draw: 3 },
            { name: "Cheat", time: 0, delayEnemy: 2, randomDiscard: 1 },
            { name: "Misdirection", time: 2, block: 12, delayEnemy: 1 },
            { name: "Wild Card", time: 1, randomDamage: [1, 15], block: 5 },
            { name: "Royal Flush", time: 4, damage: 35, draw: 1 },
            { name: "Dealer's Choice", time: 2, draw: 4, randomDiscard: 3 },
            { name: "Pocket Aces", time: 2, damage: 14, hits: 2 },
            { name: "Russian Roulette", time: 1, randomDamage: [0, 50], selfDamage: 10 },
            { name: "Hit Me", time: 0, damage: 5, draw: 1 },
            { name: "Crap Shoot", time: 2, randomDamage: [2, 18], block: 8 },
            { name: "Rigged Game", time: 3, block: 20, randomDamage: [5, 15] },
            { name: "Bait and Switch", time: 1, block: 5, randomDiscard: 1 },
            { name: "All In", time: 3, randomDamage: [10, 40], randomDiscard: 2 },
            { name: "House Edge", time: 2, block: 14, selfDamage: 2 },
            { name: "Card Count", time: 1, draw: 2 },
            { name: "Gamble", time: 0, randomDamage: [1, 10] },
            { name: "River Card", time: 2, damage: 10, heal: 3, randomDiscard: 1 }
        ]
    }
};

const ENEMIES = [ 
    { name: "Scavenger", hp: 35 }, 
    { name: "Shadow Fiend", hp: 45 },
    { name: "Time Warden", hp: 120, isBoss: true } 
];

const MAP_LAYOUT = ['combat', 'combat', 'campfire', 'combat', 'boss'];
