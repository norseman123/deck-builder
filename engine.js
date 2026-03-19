let selectedClass = "";
let masterDeck = []; let playerRelics = [];
let floor = 1;

// New State Variables
let p = { maxHealth: 80, health: 80, block: 0, time: 0, drawPile: [], discardPile: [], hand: [], cardsPlayedThisTurn: 0, anchored: 0, inAltTimeline: false };
let e = { health: 60, maxHealth: 60, block: 0, time: 2, isBoss: false, rooted: 0, intent: {}, altIntent: {} };
let traps = [];

function getElem(id) { return document.getElementById(id); }
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function initGame() {
    selectedClass = getElem('class-select').value;
    let clsData = CLASSES[selectedClass];
    playerRelics.push(clsData.relic);
    
    // FIX: Just copy the starter deck! No need for manual pushes anymore.
    masterDeck = clone(clsData.starterDeck); 
    
    showMap(); 
}

function showMap() {
    showScreen('screen-map');
    getElem('map-floor-number').innerText = floor;
    let container = getElem('map-choices');
    container.innerHTML = ''; // Clear out the old buttons

    let options = [];

    // The Structured Floor Plan: Dictating exactly what spawns when
    if (floor === 1 || floor === 2) {
        options = ['Enemy', 'Enemy']; // Easy start, force them to fight
    } else if (floor === 4) {
        options = ['Enemy', 'Campfire']; // First chance to heal/upgrade
    } else if (floor === 5) {
        options = ['Chest']; // Guaranteed Mid-Act Loot! (Only 1 option)
    } else if (floor === 9) {
        options = ['Campfire']; // The guaranteed pre-boss rest
    } else if (floor === 10) {
        options = ['Boss']; // The climax!
    } else {
        // Standard randomized floors (Floors 3, 6, 7, 8)
        let rand = Math.random();
        if (rand < 0.6) options = ['Enemy', 'Enemy'];
        else if (rand < 0.9) options = ['Enemy', 'Campfire'];
        else options = ['Enemy', 'Chest']; 
    }

    // Render the actual buttons based on the array we just built
    options.forEach(type => {
        let btn = document.createElement('button');
        btn.style = "padding: 15px 30px; font-size: 18px; cursor: pointer;"; 
        
        if (type === 'Enemy') {
            btn.innerText = "⚔️ Combat";
            btn.onclick = () => {
                startCombat(); 
            };
        } else if (type === 'Chest') {
            btn.innerText = "💎 Treasure Room";
            btn.onclick = () => showRelicDraft();
        } else if (type === 'Campfire') {
            btn.innerText = "🔥 Campfire";
            btn.onclick = () => showUpgradeScreen();
        } else if (type === 'Boss') {
            btn.innerText = "☠️ BOSS";
            btn.style.backgroundColor = "darkred";
            btn.style.color = "white";
            btn.onclick = () => {
                startCombat(true, true); 
            };
        }
        
        container.appendChild(btn);
    });
}

function showRelicDraft() {
    showScreen('screen-relic');
    let choices = getElem('relic-choices');
    choices.innerHTML = '';
    
    // Grab 3 random relics the player doesn't already own
    let available = RELICS.filter(r => !playerRelics.find(pr => pr.name === r.name))
                          .sort(() => Math.random() - 0.5).slice(0, 3);
    
    if (available.length === 0) {
        choices.innerHTML = "<p>You have found every relic!</p>";
        let b = document.createElement('button'); b.innerText = "Continue"; b.onclick = () => { floor++; showMap(); }; choices.appendChild(b);
        return;
    }

    available.forEach(relic => {
        let btn = document.createElement('button');
        btn.innerHTML = `<b>${relic.name}</b><br><br>${relic.desc}`;
        btn.onclick = () => {
            playerRelics.push(relic);
            floor++; // Advance the floor!
            showMap(); // Send them back to the map after claiming
        };
        choices.appendChild(btn);
    });
}

function startCombat(isElite = false, isBoss = false) {
    showScreen('screen-combat');
    
    // NEW: Handle Elite stat scaling
    let eData = isBoss ? ENEMIES[2] : ENEMIES[Math.floor(Math.random() * 2)];
    e.name = isElite ? `Elite ${eData.name}` : eData.name; 
    e.maxHealth = isElite ? Math.floor(eData.hp * 1.5) : eData.hp; 
    e.health = e.maxHealth; 
    e.time = 2; e.block = 0; e.isBoss = isBoss; e.isElite = isElite; e.rooted = 0;
    
    p.block = 0; p.time = 0; p.cardsPlayedThisTurn = 0; p.anchored = 0; traps = [];
    p.inAltTimeline = !!playerRelics.find(r => r.name === "Pocket Dimension");
    
    p.drawPile = masterDeck.map(clone).sort(() => Math.random() - 0.5); p.discardPile = []; p.hand = [];
    
    if (playerRelics.find(r => r.name === "Rusty Bear Trap")) traps.push({ time: 4, damage: 10 });
    if (playerRelics.find(r => r.name === "Adrenaline Spike")) p.cardsPlayedThisTurn += 2;
    if (playerRelics.find(r => r.name === "Heavy Boots")) p.anchored = 1;

    getElem('player-class-name').innerText = selectedClass; getElem('enemy-name').innerText = e.name;
    getElem('player-relics').innerHTML = playerRelics.map(r => `<div class="relic-icon" title="${r.desc}">${r.name}</div>`).join('');

    renderTimeline(); 
    drawCards(5); 
    generateEnemyIntent(); 
    checkTimeline(); 
}

function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); getElem(id).classList.add('active'); }

function drawCards(amount) {
    for (let i = 0; i < amount; i++) {
        if (p.drawPile.length === 0) { p.drawPile = p.discardPile.sort(() => Math.random() - 0.5); p.discardPile = []; }
        if (p.drawPile.length > 0 && p.hand.length < 10) p.hand.push(p.drawPile.pop());
    }
    updateCombatUI();
}

function renderTimeline() {
    let c = getElem('timeline-container'); 
    c.innerHTML = '<div id="player-marker" class="timeline-marker">P</div><div id="enemy-marker" class="timeline-marker">E</div>';
    
    // Draw Ticks (-10 to +10 relative to Now)
    for(let i=-10; i<=10; i++) { 
        let t = document.createElement('div'); let percent = ((i + 10) / 20) * 100;
        t.style = `position:absolute; height:12px; width:2px; background:#555; top:14px; left:${percent}%; z-index:1;`; 
        if (i === 0) { t.style.height='30px'; t.style.top='5px'; t.style.background='var(--color-time)'; t.style.width='4px'; t.style.zIndex='2'; } 
        c.appendChild(t); 
    }
}

function updateCombatUI() {
    let bT = Math.min(p.time, e.time); // Anchor to Now
    let pOffset = (p.time - bT) * 5; let eOffset = (e.time - bT) * 5;
    
    getElem('player-marker').style.left = `${Math.min(100, Math.max(0, 50 + pOffset))}%`; 
    getElem('enemy-marker').style.left = `${Math.min(100, Math.max(0, 50 + eOffset))}%`;
    
    // Draw Traps visually
    document.querySelectorAll('.trap-marker').forEach(el => el.remove());
    traps.forEach(trap => {
        let tOffset = (trap.time - bT) * 5;
        if (50 + tOffset >= 0 && 50 + tOffset <= 100) {
            let tm = document.createElement('div'); tm.className = 'trap-marker';
            tm.style.left = `${50 + tOffset}%`; tm.title = `${trap.damage} DMG Trap`;
            getElem('timeline-container').appendChild(tm);
        }
    });
    
    // Phase Shift Visuals
    if (p.inAltTimeline) document.body.classList.add('alt-timeline'); else document.body.classList.remove('alt-timeline');
    
    getElem('player-hp-text').innerText = `${Math.max(0,p.health)}/${p.maxHealth}`; getElem('player-hp-fill').style.width = `${Math.max(0,(p.health/p.maxHealth)*100)}%`; getElem('player-block').innerText = p.block;
    getElem('enemy-hp-text').innerText = `${Math.max(0,e.health)}/${e.maxHealth}`; getElem('enemy-hp-fill').style.width = `${Math.max(0,(e.health/e.maxHealth)*100)}%`; getElem('enemy-block').innerText = e.block;
    
    // Status Trackers
    let pStatus = []; if(p.anchored > 0) pStatus.push(`Anchored (${p.anchored})`); if(p.cardsPlayedThisTurn > 0) pStatus.push(`Momentum: ${p.cardsPlayedThisTurn}`);
    getElem('player-status').innerText = pStatus.join(" | ");
    getElem('enemy-status').innerText = e.rooted > 0 ? `Rooted (${e.rooted})` : "";
    
    let hc = getElem('hand-container'); hc.innerHTML = ''; let isP = p.time <= e.time;
    p.hand.forEach((card, i) => { let c = renderCardHTML(card); if(!isP) c.classList.add('disabled'); if(isP) c.onclick = () => playCard(i); hc.appendChild(c); });
}

function generateEnemyIntent() {
    let types = ["attack", "defend", "buff"];
    e.intent = { type: types[Math.floor(Math.random()*2)], value: Math.floor(Math.random()*10)+5, time: Math.floor(Math.random()*2)+1 };
    e.altIntent = { type: types[Math.floor(Math.random()*2)], value: Math.floor(Math.random()*8)+3, time: Math.floor(Math.random()*3)+1 };
    
    getElem('enemy-intent').innerText = `Main: ${e.intent.type === 'attack' ? '⚔️' : '🛡️'} ${e.intent.value} (${e.intent.time}T)`;
    
    let altElem = getElem('alt-intent');
    if (selectedClass === "The Wanderer") {
        altElem.style.display = 'block';
        altElem.innerText = `Alt: ${e.altIntent.type === 'attack' ? '⚔️' : '🛡️'} ${e.altIntent.value} (${e.altIntent.time}T)`;
    } else { altElem.style.display = 'none'; }
}

function triggerTraps(oldTime, newTime) {
    if (newTime > oldTime) {
        for (let i = traps.length - 1; i >= 0; i--) {
            let t = traps[i];
            if (oldTime < t.time && newTime >= t.time) {
                dealDamage(e, t.damage); traps.splice(i, 1);
            }
        }
    }
}

function checkTimeline() {
    updateCombatUI();
    
    // DEFEAT CONDITION
    if (p.health <= 0) { 
        setTimeout(() => { alert("You died."); location.reload(); }, 500); 
        return; 
    }
    
    // TURN LOGIC
    if (p.time >= e.time) { 
        if (e.rooted > 0) {
            getElem('turn-indicator').innerText = `Player Turn (Enemy Rooted!)`; 
            updateCombatUI(); 
            return; 
        }

        getElem('turn-indicator').innerText = "Enemy Action..."; 
        p.cardsPlayedThisTurn = 0; 
        document.querySelectorAll('.card').forEach(c => c.classList.add('disabled')); 
        setTimeout(() => { executeEnemyAction(); checkTimeline(); }, 600); 
    } else { 
        getElem('turn-indicator').innerText = "Player Turn"; 
        updateCombatUI(); 
    }
// VICTORY CONDITION (Inside checkTimeline)
    if (e.health <= 0) { 
        updateCombatUI(); // Show them at 0 HP
        setTimeout(() => { 
            // If it's a boss/elite, get a relic. Otherwise, get card loot!
            if (e.isElite || e.isBoss) showRelicDraft(); 
            else showRewardScreen(); 
        }, 500); 
        return; 
    }

    
}

function executeEnemyAction() {
    let activeIntent = (selectedClass === "The Wanderer" && p.inAltTimeline) ? e.altIntent : e.intent;
    
    if (activeIntent.type === "attack") dealDamage(p, activeIntent.value); else e.block += activeIntent.value;
    
    let oldTime = e.time;
    e.time += activeIntent.time; 
    
    triggerTraps(oldTime, e.time);
    generateEnemyIntent();
}

function dealDamage(target, amount, bypassBlock = false) {
    if (!bypassBlock) {
        let blockDamage = Math.min(target.block, amount);
        target.block -= blockDamage;
        amount -= blockDamage;
    }
    target.health -= amount;
    if (target.health < 0) target.health = 0;
}

function playCard(index) {
    // 1. DEFINE CARD FIRST so the browser knows what it is!
    let card = p.hand.splice(index, 1)[0];

    // Now it is safe to check card properties
    if (card.pullEnemy && p.time > e.time) {
        let old = e.time;
        e.time = p.time; 
        triggerTraps(old, e.time); 
    }
    
    if (p.time >= e.time && e.rooted > 0) {
        e.rooted--;
    }

    p.cardsPlayedThisTurn++;
    
    let timeCost = card.time !== undefined ? card.time : (card.randomTime ? Math.floor(Math.random()*(card.randomTime[1]-card.randomTime[0]+1))+card.randomTime[0] : 1);
    if (p.anchored > 0 && timeCost > 0) { timeCost = 0; p.anchored--; }

    let dmg = card.damage || 0;
    if (card.momentumDamage) dmg += (card.momentumDamage * (p.cardsPlayedThisTurn - 1));
    if (card.randomDamage) { let min = card.randomDamage[0] + (playerRelics.find(r=>r.name==="Loaded Dice")?2:0); dmg += Math.floor(Math.random()*(card.randomDamage[1]-min+1))+min; }

    // Strip mechanics
    if (card.strip) p.block = 0;
    if (card.enemyStrip) e.block = 0;
    
    if (card.greedDamage && p.block === 0) dmg += card.greedDamage;
    if (card.greedDelay && p.block === 0) { let old = e.time; e.time += card.greedDelay; triggerTraps(old, e.time); }

    if (card.repentDamage && e.block === 0) dmg += card.repentDamage;
    if (card.repentDelay && e.block === 0) { let old = e.time; e.time += card.repentDelay; triggerTraps(old, e.time); }
    
    if (card.collapseIntents) dmg += e.intent.value + (e.altIntent.value || 0);

    let hits = card.hits || 1;
    for(let i=0; i<hits; i++) { if (dmg > 0) dealDamage(e, dmg); }
    
    if (card.pullEnemy && e.time > p.time) {
        let old = e.time; e.time = p.time; triggerTraps(old, e.time); 
    }

    if (card.momentumDelay) {
        let push = card.momentumDelay * (p.cardsPlayedThisTurn - 1);
        if (push > 0) { let old = e.time; e.time += push; triggerTraps(old, e.time); }
    }

    // Rogue brackets were removed from right here!

    if (card.trap) traps.push({ time: e.time + card.trap.delay, damage: card.trap.damage });
    if (card.block) p.block += card.block; 
    if (card.draw) drawCards(card.draw);
    if (card.anchorPlayer) p.anchored += card.anchorPlayer;
    if (card.rootEnemy) e.rooted += card.rootEnemy;
    if (card.shiftTimeline) p.inAltTimeline = !p.inAltTimeline;
    if (card.selfDamage) dealDamage(p, card.selfDamage, true);
    if (card.delayEnemy) { let old = e.time; e.time += card.delayEnemy; triggerTraps(old, e.time); }
    
    if (card.randomDiscard) { for(let i=0; i<card.randomDiscard; i++) if(p.hand.length>0) p.discardPile.push(p.hand.splice(Math.floor(Math.random()*p.hand.length), 1)[0]); }
    
    p.time += timeCost; p.discardPile.push(card); drawCards(1); checkTimeline();
}

function renderCardHTML(card) {
    let d = document.createElement('div'); d.className = `card`; let desc = [];
    let tDisp = card.time !== undefined ? card.time : (card.randomTime ? '?' : '1');
    if(card.damage) desc.push(`Deal <span style="color:var(--color-damage)">${card.damage}</span> DMG${card.hits>1?` (x${card.hits})`:''}`);
    if(card.momentumDamage) desc.push(`Deal <span style="color:var(--color-damage)">+${card.momentumDamage} DMG</span> per card played this turn`);
    
    if(card.greedDamage) desc.push(`<b>Greed:</b> If you have 0 BLK, deal <span style="color:var(--color-damage)">+${card.greedDamage} DMG</span>`);
    // NEW: Added the Greed Delay text so you can see it!
    if(card.greedDelay) desc.push(`<b>Greed:</b> If you have 0 BLK, push Enemy <span style="color:var(--color-time)">+${card.greedDelay}T</span>`);
    
    if(card.collapseIntents) desc.push(`Deal DMG equal to the Enemy's combined intents`);
    if(card.pullEnemy) desc.push(`If the Enemy is ahead, drag them to your Time`);
    if(card.momentumDelay) desc.push(`Push Enemy <span style="color:var(--color-time)">+${card.momentumDelay}T</span> per card played this turn`);

    if(card.randomDamage) desc.push(`Deal <span style="color:var(--color-damage)">${card.randomDamage[0]}-${card.randomDamage[1]}</span> DMG`);
    if(card.trap) desc.push(`Place a <span style="color:var(--color-damage)">${card.trap.damage} DMG</span> Trap at <span style="color:var(--color-time)">+${card.trap.delay}T</span>`);
    if(card.block) desc.push(`Gain <span style="color:var(--color-block)">${card.block}</span> BLK`);
    if(card.shiftTimeline) desc.push(`<b>Shift Timelines</b>`);
    if(card.anchorPlayer) desc.push(`Anchor yourself for ${card.anchorPlayer} turn(s)`);
    if(card.rootEnemy) desc.push(`Root enemy for ${card.rootEnemy} turn(s)`);
    if(card.delayEnemy) desc.push(`Push Enemy <span style="color:var(--color-time)">${card.delayEnemy}T</span>`);
    if(card.draw) desc.push(`Draw ${card.draw} card(s)`);
    // NEW: Strip visuals! Feel free to tweak the wording to fit your game's vibe.
    if(card.strip) desc.push(`Lose all BLK`);
    if(card.enemyStrip) desc.push(`Shatter all Enemy BLK`);
    if(card.repentDamage) desc.push(`<b>Greed:</b> If enemy has 0 BLK, deal <span style="color:var(--color-damage)">+${card.repentDamage} DMG</span>`);
    // NEW: Added the Greed Delay text so you can see it!
    if(card.repentDelay) desc.push(`<b>Greed:</b> If enemy has 0 BLK, push Enemy <span style="color:var(--color-time)">+${card.repentDelay}T</span>`);
    d.innerHTML = `<div class="card-time">${tDisp}T</div><div class="card-title">${card.name}</div><div class="card-desc">${desc.join("<br>")}</div>`; return d;
}
function showUpgradeScreen() {
    showScreen('screen-upgrade');
    let container = getElem('upgrade-choices');
    container.innerHTML = '';

    masterDeck.forEach((card, index) => {
        if (card.upgrade && !card.upgraded) {
            let cardElem = document.createElement('div');
            cardElem.className = 'card';
            cardElem.innerHTML = renderCardHTML(card); 
            
            cardElem.onclick = () => {
                applyUpgrade(index);
            };
            container.appendChild(cardElem);
        }
    });

    let skipBtn = document.createElement('button');
    skipBtn.innerText = "Skip Campfire";
    skipBtn.style.marginTop = "30px";
    skipBtn.onclick = () => { floor++; showMap(); };
    container.appendChild(skipBtn);
}

function applyUpgrade(deckIndex) {
    let card = masterDeck[deckIndex];
    Object.assign(card, card.upgrade); 
    card.name = card.name + "+";
    card.upgraded = true;
    
    floor++; // Advance the floor!
    showMap();
}

function showRewardScreen() {
    let pool = CLASSES[selectedClass].pool;
    let choices = [];
    
    // Copy the pool so we don't accidentally delete the master list
    let tempPool = [...pool]; 
    
    // Pick 3 unique random cards (or fewer, if the pool is really small)
    for(let i = 0; i < 3; i++) {
        if(tempPool.length === 0) break;
        let randomIndex = Math.floor(Math.random() * tempPool.length);
        // Splice removes it from the temp pool so we don't get duplicates!
        choices.push(tempPool.splice(randomIndex, 1)[0]); 
    }

    let container = document.getElementById('reward-cards-container');
    container.innerHTML = ''; // Clear out the old rewards

    choices.forEach(card => {
        // We can reuse your awesome existing render function!
        let cardEl = renderCardHTML(card); 
        
        cardEl.onclick = () => {
            // 1. Add to the MASTER deck (not the temporary combat deck)
            masterDeck.push(card); 
            // 2. Finish the combat sequence
            closeRewardScreen();
        };
        
        container.appendChild(cardEl);
    });

    document.getElementById('reward-screen').classList.remove('hidden');
}

function skipReward() {
    // If the player doesn't want any of the cards, they can skip to keep their deck thin
    closeRewardScreen();
}

function closeRewardScreen() {
    document.getElementById('reward-screen').classList.add('hidden');
    floor++;
    showMap();

}
