let selectedClass = "";
let masterDeck = []; let playerRelics = [];
let floor = 1;

// State Variables
let p = { maxHealth: 80, health: 80, block: 0, time: 0, drawPile: [], discardPile: [], hand: [], cardsPlayedThisTurn: 0, anchored: 0, inAltTimeline: false };
let e = { health: 60, maxHealth: 60, block: 0, time: 2, isBoss: false, rooted: 0, intent: {}, altIntent: {} };
let traps = [];

function getElem(id) { return document.getElementById(id); }
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function initGame() {
    selectedClass = getElem('class-select').value;
    let clsData = CLASSES[selectedClass];
    playerRelics.push(clsData.relic);
    masterDeck = clone(clsData.starterDeck); 
    showMap(); 
}

function showMap() {
    showScreen('screen-map');
    getElem('map-floor-number').innerText = floor;
    let container = getElem('map-choices');
    container.innerHTML = '';

    let options = [];
    if (floor === 1 || floor === 2) {
        options = ['Enemy', 'Enemy'];
    } else if (floor === 4) {
        options = ['Enemy', 'Campfire'];
    } else if (floor === 5) {
        options = ['Chest'];
    } else if (floor === 9) {
        options = ['Campfire'];
    } else if (floor === 10) {
        options = ['Boss'];
    } else {
        let rand = Math.random();
        if (rand < 0.6) options = ['Enemy', 'Enemy'];
        else if (rand < 0.9) options = ['Enemy', 'Campfire'];
        else options = ['Enemy', 'Chest']; 
    }

    options.forEach(type => {
        let btn = document.createElement('button');
        btn.style = "padding: 15px 30px; font-size: 18px; cursor: pointer;"; 
        
        if (type === 'Enemy') {
            btn.innerText = "⚔️ Combat";
            btn.onclick = () => { startCombat(); };
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
            btn.onclick = () => { startCombat(true, true); };
        }
        container.appendChild(btn);
    });
}

function showRelicDraft() {
    showScreen('screen-relic');
    let choices = getElem('relic-choices');
    choices.innerHTML = '';
    
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
            floor++; 
            showMap(); 
        };
        choices.appendChild(btn);
    });
}

function startCombat(isElite = false, isBoss = false) {
    showScreen('screen-combat');
    
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
    
    for(let i=-10; i<=10; i++) { 
        let t = document.createElement('div'); let percent = ((i + 10) / 20) * 100;
        t.style = `position:absolute; height:12px; width:2px; background:#555; top:14px; left:${percent}%; z-index:1;`; 
        if (i === 0) { t.style.height='30px'; t.style.top='5px'; t.style.background='var(--color-time)'; t.style.width='4px'; t.style.zIndex='2'; } 
        c.appendChild(t); 
    }
}

function updateCombatUI() {
    let bT = Math.min(p.time, e.time); 
    let pOffset = (p.time - bT) * 5; let eOffset = (e.time - bT) * 5;
    
    getElem('player-marker').style.left = `${Math.min(100, Math.max(0, 50 + pOffset))}%`; 
    getElem('enemy-marker').style.left = `${Math.min(100, Math.max(0, 50 +
