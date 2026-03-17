let selectedClass = "Masochist";
let masterDeck = []; let playerRelics = [];
let currentFloor = 0; 
// Added 'powers' array to both player and enemy
let p = { maxHealth:80, health:80, block:0, time:0, drawPile:[], discardPile:[], hand:[], powers:[] };
let e = { health:60, maxHealth:60, block:0, time:2, isBoss:false, powers:[] };

function getElem(id) { return document.getElementById(id); }
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); getElem(id).classList.add('active'); }

function startGame() {
    let c = CLASS_DATA[selectedClass];
    p.maxHealth = c.maxHp; p.health = c.maxHp; 
    playerRelics = [...c.relics]; 
    masterDeck = c.starter.map(clone);
    currentFloor = 0; generateMap(); updateMapUI(); showScreen('screen-map');
}

function switchClass(className) { selectedClass = className; startGame(); }

function generateMap() {
    let mc = getElem('map-container'); mc.innerHTML = '<div class="map-line"></div>';
    for(let i = MAP_LAYOUT.length - 1; i >= 0; i--) {
        let row = document.createElement('div'); row.className = 'map-floor';
        let node = document.createElement('div'); node.id = `node-${i}`;
        let type = MAP_LAYOUT[i];
        if (type === 'boss') { node.className = 'map-node boss'; node.innerText = 'B'; node.onclick = () => startCombat(true); } 
        else if (type === 'campfire') { node.className = 'map-node campfire'; node.innerText = 'C'; node.onclick = () => openCampfire(); }
        else { node.className = 'map-node'; node.innerText = `F${i+1}`; node.onclick = () => startCombat(false); }
        row.appendChild(node); mc.appendChild(row);
    }
}

function updateMapUI() {
    getElem('map-hp').innerText = `${p.health}/${p.maxHealth}`; getElem('map-deck-size').innerText = masterDeck.length;
    for(let i=0; i<MAP_LAYOUT.length; i++) {
        let node = getElem(`node-${i}`); node.className = 'map-node ' + MAP_LAYOUT[i];
        if (i < currentFloor) node.classList.add('completed'); else if (i > currentFloor) node.classList.add('locked');
    }
}

function returnToMap() { updateMapUI(); showScreen('screen-map'); }

function openCampfire() {
    showScreen('screen-campfire');
    let cc = getElem('campfire-container'); cc.innerHTML = '';
    masterDeck.forEach((card, index) => {
        let cDiv = renderCardHTML(card);
        if (card.isUpgraded) { cDiv.classList.add('disabled'); } 
        else {
            cDiv.onclick = () => {
                let uCard = masterDeck[index]; uCard.isUpgraded = true; uCard.name = uCard.name + "+";
                if(uCard.damage) uCard.damage += 3; if(uCard.block) uCard.block += 3;
                if(uCard.poison) uCard.poison += 2; if(uCard.time > 1) uCard.time -= 1; 
                if(uCard.randomDamage) uCard.randomDamage[1] += 5;
                currentFloor++; returnToMap();
            };
        }
        cc.appendChild(cDiv);
    });
}
function restAtCampfire() { p.health = Math.min(p.maxHealth, p.health + 20); currentFloor++; returnToMap(); }

function startCombat(isBoss) {
    showScreen('screen-combat');
    let eData = isBoss ? ENEMIES[2] : ENEMIES[Math.floor(Math.random() * 2)];
    e.name = eData.name; e.maxHealth = eData.hp; e.health = eData.hp; e.time = 2; e.block = 0; e.isBoss = isBoss;
    p.block = 0; p.time = 0; p.drawPile = masterDeck.map(clone).sort(() => Math.random() - 0.5); p.discardPile = []; p.hand = [];
    
    if (playerRelics.find(r => r.name === "Holy Symbol")) p.block += 5;

    getElem('player-class-name').innerText = selectedClass; getElem('enemy-name').innerText = e.name;
    getElem('player-relics').innerHTML = playerRelics.map(r => `<div class="relic-icon" title="${r.desc}">${r.name}</div>`).join('');

    drawCards(5); generateEnemyIntent(); renderTimeline(); checkTimeline();
}

function endCombat(victory) {
    if (!victory) { alert("Died."); startGame(); return; }
    currentFloor++; if (e.isBoss) { alert("VICTORY!"); startGame(); return; }
    
    let pool = CLASS_DATA[selectedClass].pool; let choices = [];
    while(choices.length < 3) { let c = pool[Math.floor(Math.random() * pool.length)]; if(!choices.includes(c)) choices.push(c); }
    
    let dc = getElem('draft-container'); dc.innerHTML = '';
    choices.forEach(card => { let cDiv = renderCardHTML(card); cDiv.onclick = () => { masterDeck.push(clone(card)); returnToMap(); }; dc.appendChild(cDiv); });
    showScreen('screen-reward');
}

function checkTimeline() {
    updateCombatUI();
    if (p.health <= 0) { setTimeout(() => endCombat(false), 500); return; }
    if (e.health <= 0) { setTimeout(() => endCombat(true), 500); return; }
    if (p.time <= e.time) { getElem('turn-indicator').innerText = "Player Turn"; updateCombatUI(); } 
    else { getElem('turn-indicator').innerText = "Enemy Action..."; document.querySelectorAll('.card').forEach(c => c.classList.add('disabled')); setTimeout(() => { executeEnemyAction(); checkTimeline(); }, 600); }
}

function playCard(index) {
    if (p.time > e.time) return; let card = p.hand[index];
    
    let dmgToDeal = card.damage || 0;
    if (card.damageFromBlock) dmgToDeal += p.block;
    if (card.randomDamage) {
        let min = card.randomDamage[0] + (playerRelics.find(r=>r.name==="Loaded Dice") ? 2 : 0);
        dmgToDeal += Math.floor(Math.random() * (card.randomDamage[1] - min + 1)) + min;
    }
    if (dmgToDeal > 0 && card.time >= 3 && playerRelics.find(r => r.name === "Pocket Watch")) dmgToDeal += 4;
    
    let hits = card.hits || 1;
    for(let i=0; i<hits; i++) { if (dmgToDeal > 0) dealDamage(e, dmgToDeal); }
    
    if (card.block) p.block += card.block; 
    if (card.heal) p.health = Math.min(p.maxHealth, p.health + card.heal);
    if (card.draw) drawCards(card.draw);
    if (card.delayEnemy) e.time += card.delayEnemy; 
    if (card.selfDamage) { dealDamage(p, card.selfDamage, true); if (playerRelics.find(r=>r.name==="Spiked Collar")) p.block += 3; }
    if (card.randomDiscard) { for(let i=0; i<card.randomDiscard; i++) if(p.hand.length>1) p.discardPile.push(p.hand.splice(Math.floor(Math.random()*p.hand.length), 1)[0]); }
    
    p.time += card.time; p.discardPile.push(card); p.hand.splice(index, 1); drawCards(1); checkTimeline();
}

function waitTurn() { if(p.time>e.time)return; p.time++; if(p.hand.length>0) { p.discardPile.push(p.hand.splice(Math.floor(Math.random()*p.hand.length), 1)[0]); drawCards(1); } checkTimeline(); }

function executeEnemyAction() {
    if (e.intent.type === "attack") dealDamage(p, e.intent.value); else e.block += e.intent.value;
    e.time += e.intent.time; generateEnemyIntent();
}

function generateEnemyIntent() {
    let r = Math.random(); let dM = e.isBoss ? 2 : 1; 
    if (r < 0.5) { e.intent = { type: "attack", value: 10*dM, time: 3 }; getElem('enemy-intent').innerText = `ATK: ${10*dM} (+3T)`; } 
    else { e.intent = { type: "defend", value: 8*dM, time: 2 }; getElem('enemy-intent').innerText = `DEF: ${8*dM} (+2T)`; }
}

function dealDamage(target, amt, bypass = false) { let d = amt; if (!bypass && target.block > 0) { let b = Math.min(target.block, amt); target.block -= b; d -= b; } if (d > 0) target.health -= d; }

function drawCards(amt) {
    for(let i=0; i<amt; i++) {
        if (p.drawPile.length === 0) { if (p.discardPile.length === 0) return; p.drawPile = p.discardPile.sort(()=>Math.random()-0.5); p.discardPile = []; }
        if (p.hand.length < 5 && p.drawPile.length > 0) p.hand.push(p.drawPile.pop());
    }
}

function renderCardHTML(card) {
    let d = document.createElement('div'); d.className = `card ${card.isUpgraded ? 'upgraded' : ''}`; let desc = [];
    if(card.damage) desc.push(`Deal <span style="color:var(--color-damage)">${card.damage}</span> DMG${card.hits>1?` (x${card.hits})`:''}`);
    if(card.damageFromBlock) desc.push(`Deal DMG equal to your <span style="color:var(--color-block)">Block</span>`);
    if(card.randomDamage) desc.push(`Deal <span style="color:var(--color-damage)">${card.randomDamage[0]}-${card.randomDamage[1]}</span> DMG`);
    if(card.block) desc.push(`Gain <span style="color:var(--color-block)">${card.block}</span> BLK`);
    if(card.heal) desc.push(`Heal <span style="color:var(--color-health)">${card.heal}</span> HP`);
    if(card.selfDamage) desc.push(`Take <span style="color:var(--color-damage)">${card.selfDamage}</span> DMG`);
    if(card.delayEnemy) desc.push(`Delay Enemy <span style="color:var(--color-time)">${card.delayEnemy}T</span>`);
    if(card.draw) desc.push(`Draw ${card.draw} card(s)`);
    if(card.randomDiscard) desc.push(`Discard ${card.randomDiscard} random card(s)`);
    d.innerHTML = `<div class="card-time">${card.time}T</div><div class="card-title">${card.name}</div><div class="card-desc">${desc.join("<br>")}</div>`; return d;
}

function renderTimeline() {
    let c = getElem('timeline-container'); c.innerHTML = '<div id="player-marker" class="timeline-marker">P</div><div id="enemy-marker" class="timeline-marker">E</div>';
    for(let i=0; i<=20; i++) { let t = document.createElement('div'); t.style = `position:absolute; height:12px; width:2px; background:#555; top:14px; left:${(i/20)*100}%;`; if(i%5===0) { t.style.height='20px'; t.style.top='10px'; t.style.background='#888'; } c.appendChild(t); }
}

function updateCombatUI() {
    let bT = Math.min(p.time, e.time);
    getElem('player-marker').style.left = `${Math.min(100, ((p.time-bT)/20)*100)}%`; getElem('enemy-marker').style.left = `${Math.min(100, ((e.time-bT)/20)*100)}%`;
    getElem('player-hp-text').innerText = `${Math.max(0,p.health)}/${p.maxHealth}`; getElem('player-hp-fill').style.width = `${Math.max(0,(p.health/p.maxHealth)*100)}%`; getElem('player-block').innerText = p.block;
    getElem('enemy-hp-text').innerText = `${Math.max(0,e.health)}/${e.maxHealth}`; getElem('enemy-hp-fill').style.width = `${Math.max(0,(e.health/e.maxHealth)*100)}%`; getElem('enemy-block').innerText = e.block;
    let hc = getElem('hand-container'); hc.innerHTML = ''; let isP = p.time <= e.time;
    p.hand.forEach((card, i) => { let c = renderCardHTML(card); if(!isP) c.classList.add('disabled'); if(isP) c.onclick = () => playCard(i); hc.appendChild(c); });
}

startGame(); // Kicks off the game once everything is loaded
