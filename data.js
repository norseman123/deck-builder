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
            { name: "Time Warp", time: 4, damage: 20, delayEnemy: 2 }, 
            { name: "Haste", time: 0, block: 4, draw: 2 },
            { name: "Paradox", time: 3, damage: 15, delayEnemy: -2 }
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
            { name: "Wild Card", time: 1, draw: 3, randomDiscard: 1 }, 
            { name: "All In", time: 3, damage: 10, hits: 2, randomDamage: [0, 5] },
            { name: "Sleight of Hand", time: 0, block: 5, randomDiscard: 1 }
        ]
    }
};

const ENEMIES = [ 
    { name: "Scavenger", hp: 35 }, 
    { name: "Shadow Fiend", hp: 45 },
    { name: "Time Warden", hp: 120, isBoss: true } 
];

const MAP_LAYOUT = ['combat', 'combat', 'campfire', 'combat', 'boss'];
