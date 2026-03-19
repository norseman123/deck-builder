const CLASSES = {
"The Scarred": {
        relic: { name: "Rusty Bear Trap", desc: "Start combat with a 10 DMG trap at +4 Time." },
        // NEW: This is what you actually take into Combat 1
        starterDeck: [
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
        ],
        // NEW: Strike and Defend are removed from here. These are ONLY for post-combat rewards!
        pool: [
            { name: "Tripwire", time: 1, trap: { delay: 2, damage: 12 } },
            { name: "Minefield", time: 3, trap: { delay: 3, damage: 25 } },
            { name: "Shove", time: 1, damage: 4, delayEnemy: 2 },
            { name: "Lure", time: 0, block: 8, delayEnemy: -1 },
            { name: "Tactical Retreat", time: 6, block: 25, draw: 1 },
            { name: "Broken Heart", time: 1, damage: 4, greedDamage: 11},
            { name: "Expell", time: 3, damage: 3, delayEnemy: 5},
        ]
    },
    "The Frenzied": {
        relic: { name: "Adrenaline Spike", desc: "Start combat with +2 Momentum." },
        starterDeck: [
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
        ],
            
        pool: [
            { name: "Flurry", time: 1, damage: 2, momentumDamage: 4 },
            { name: "Sprint", time: -1, draw: 1, selfDamage: 2 },
            { name: "Combo Finisher", time: 2, damage: 5, momentumDamage: 6 },
            { name: "Blur", time: -2, block: 4, randomDiscard: 1 },
            { name: "Unleash", time: 1, damage: 5, momentumDelay: 2},
            { name: "Shatter", time: 1, damage: 3, greedDamage: 10},
        ]
    },
    "The Stoic": {
        relic: { name: "Heavy Boots", desc: "Your first card each combat costs 0 Time." },
        starterDeck: [
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Stand Ground", time: 1, block: 10, anchorPlayer: 2 },
            { name: "Shackles", time: 0, damage: 3, rootEnemy: 1 },
            { name: "Chain Grab", time: 1, damage: 8, pullEnemy: true },
            { name: "Inhuman Suffering", time: 10, damage: 40, upgrade: {damage: 60} },
            { name: "Repent", time:1, damage: 4, repentDamage: 8},
                
                
        ],
            
        pool: [
            { name: "Stand Ground", time: 1, block: 10, anchorPlayer: 2 },
            { name: "Shackles", time: 2, damage: 6, rootEnemy: 1 },
            { name: "Heavy Blow", time: 3, damage: 18 },
            { name: "Immovable", time: 2, block: 20, anchorPlayer: 1 },
            { name: "Chain Grab", time: 1, damage: 8, pullEnemy: true },
            { name: "Inhuman Suffering", time: 10, damage: 40, upgrade: {damage: 60} },
            { name: "Broken Hearted", time:1, damage: 4, greedDelay: 5},
            { name: "In the Name of Greed", time:0, greedDelay: 3, greedDamage: 10, selfDamage: 2},
            { name: "Pain Will Make it Better", time:0, strip: true, upgrade: {enemyStrip: true} },
            { name: "Repent", time:1, damage: 4, repentDamage: 8},
            { name: "Shun", time: 0, repentDelay: 4},
            { name: "Shame", time: 2, enemyStrip: true, upgrade: {damage: 8} },
        ]
    },
    "The Wanderer": {
        relic: { name: "Pocket Dimension", desc: "Start combat in the Alternate Timeline." },
        starterDeck: [
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
        ],
            
        pool: [
            { name: "Phase Shift", time: 0, shiftTimeline: true, draw: 1 },
            { name: "Paradox", time: 1, damage: 10, shiftTimeline: true },
            { name: "Ghost Block", time: 1, block: 12, shiftTimeline: true },
            { name: "Cross-Strike", time: 2, damage: 8, hits: 2 },
            { name: "Reality Crash", time: 2, collapseIntents: true, shiftTimeline: true },
        ]
    },
    "The Gambler": {
        relic: { name: "Loaded Dice", desc: "Minimum random damage increased by 2." },
                    starterDeck: [
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Strike", time: 1, damage: 5, upgrade: {damage: 8} },
            { name: "Roll the Bones", randomTime: [-1, 3], damage: 15 },
            { name: "Jackpot", time: 2, randomDamage: [5, 30] },
            { name: "Sleight of Hand", time: 0, draw: 2, randomDiscard: 1 },
            { name: "Wild Bet", randomTime: [0, 2], block: 15, randomDiscard: 1 },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
            { name: "Defend", time: 1, block: 6, upgrade: {block: 9} },
        ],
        pool: [
            { name: "Roll the Bones", randomTime: [-1, 3], damage: 15 },
            { name: "Jackpot", time: 2, randomDamage: [5, 30] },
            { name: "Sleight of Hand", time: 0, draw: 2, randomDiscard: 1 },
            { name: "Wild Bet", randomTime: [0, 2], block: 15, randomDiscard: 1 },
        ]
    }
};

const ENEMIES = [
    { name: "Goblin Scrapper", hp: 40 },
    { name: "Clockwork Knight", hp: 60 },
    { name: "Time Devourer", hp: 150 },
];

const RELICS = [
    // I removed Heavy Boots, Loaded Dice, etc. from here!
    { name: "Golden Stopwatch", desc: "Draw 1 extra card at the start of combat." },
    { name: "Spiked Pauldrons", desc: "Whenever you take damage, deal 3 damage back to the enemy." },
    { name: "Vampiric Blade", desc: "Heal 2 HP whenever you defeat an enemy." },
    { name: "no", desc: "nothing" }
];
