// Paltrow 动画演示（纯前端，无模型、无后端）
// 从 pet_web/static/app.js 抽取动画控制逻辑，去掉登录/聊天/评论等 API 依赖。

const $ = selector => document.querySelector(selector);
const petWrap = $('#petWrap'), room = $('#room'), bubble = $('#bubble');
const layers = [$('#petA'), $('#petB')];
const actions = $('#actions');

// 动画 gif 路径（相对路径，GitHub Pages 可直接托管）
const ANIMATIONS = {
  breathing: 'pet-assets/breathing/pet_breathing.gif',
  painting: 'pet-assets/painting/pet_painting.gif',
  happy: 'pet-assets/happy/pet_happy.gif',
  sad: 'pet-assets/sad/pet_sad.gif',
  angry: 'pet-assets/angry/pet_angry.gif',
  depressed: 'pet-assets/depressed/pet_depressed.gif',
  smirk: 'pet-assets/smirk/pet_smirk.gif',
};

const labels = {painting:'画画', happy:'开心', sad:'难过', breathing:'呼吸', angry:'生气', depressed:'郁闷', smirk:'坏笑'};
const durations = {painting:9000, happy:4300, sad:5000, breathing:6200, angry:4500, depressed:5200, smirk:4200};
const idleWeights = [['breathing',48],['painting',20],['happy',10],['smirk',8],['sad',4],['depressed',10]];

let activeLayer = 0, animationSeq = 0, dizzyUntil = 0, gazeFrame = 0, idleTimer = 0, bubbleTimer = 0;
let mouseState = {x:0, y:0, t:performance.now(), fastHits:0, lastFast:0, pending:null};

function weightedIdle(){
  const total = idleWeights.reduce((sum, item) => sum + item[1], 0);
  let pick = Math.random() * total;
  for (const [name, weight] of idleWeights) { pick -= weight; if (pick <= 0 && ANIMATIONS[name]) return name; }
  return 'breathing';
}
function scheduleChain(delay, seq){
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (seq !== animationSeq || performance.now() < dizzyUntil) return;
    play(weightedIdle(), 0, {interaction:false});
  }, delay);
}
function play(name='breathing', duration=0, options={}){
  if (!ANIMATIONS[name]) name = 'breathing';
  if (!ANIMATIONS[name]) return;
  const interaction = options.interaction !== false;
  const seq = ++animationSeq;
  const nextIndex = 1 - activeLayer;
  const next = layers[nextIndex], previous = layers[activeLayer];
  const reveal = () => {
    if (seq !== animationSeq) return;
    requestAnimationFrame(() => {
      next.classList.add('active'); previous.classList.remove('active'); activeLayer = nextIndex;
    });
  };
  next.onload = reveal;
  next.onerror = () => { if (seq === animationSeq) scheduleChain(1200, seq); };
  next.src = `${ANIMATIONS[name]}?play=${seq}`;
  if (next.complete) reveal();
  const runFor = duration || durations[name] || 5000;
  if (interaction && name !== 'breathing') {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (seq === animationSeq && performance.now() >= dizzyUntil) play('breathing', 0, {interaction:false});
    }, runFor);
  } else scheduleChain(runFor, seq);
}

function say(text){
  bubble.textContent = text.length > 58 ? `${text.slice(0,58)}……` : text;
  bubble.classList.add('show'); clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 4300);
}

function applyGaze(event){
  gazeFrame = 0;
  if (!event) return;
  const rect = petWrap.getBoundingClientRect();
  const nx = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width/2)) / (rect.width * .7)));
  const ny = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height*.44)) / (rect.height * .65)));
  petWrap.style.setProperty('--track-x', `${(nx*4).toFixed(1)}px`);
  petWrap.style.setProperty('--track-y', `${(ny*2).toFixed(1)}px`);
  petWrap.style.setProperty('--track-tilt', `${(nx*.85).toFixed(2)}deg`);
  if (Math.abs(nx) > .24) petWrap.style.setProperty('--face-dir', nx > 0 ? '-1' : '1');
}
function updateGaze(event){
  const now = performance.now(), dt = Math.max(now - mouseState.t, 1);
  const dx = event.clientX - mouseState.x, dy = event.clientY - mouseState.y;
  const distance = Math.hypot(dx, dy), speed = distance / dt;
  mouseState.pending = event;
  if (!gazeFrame) gazeFrame = requestAnimationFrame(() => applyGaze(mouseState.pending));
  if (speed > 1.7 && distance > 45){
    mouseState.fastHits = now - mouseState.lastFast < 480 ? mouseState.fastHits + 1 : 1;
    mouseState.lastFast = now;
    if (mouseState.fastHits >= 3 && now > dizzyUntil) triggerDizzy();
  }
  mouseState = {...mouseState, x:event.clientX, y:event.clientY, t:now};
}
function triggerDizzy(){
  dizzyUntil = performance.now() + 2800; mouseState.fastHits = 0; petWrap.classList.add('dizzy');
  play('depressed', 3000); say('等、等一下……有点晕了 @_@');
  setTimeout(() => {
    petWrap.classList.remove('dizzy');
    if (performance.now() >= dizzyUntil) play('breathing', 0, {interaction:false});
  }, 2800);
}

// 初始化：动作按钮 + 待机呼吸
Object.keys(ANIMATIONS).forEach(name => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = labels[name] || name;
  button.onclick = () => { play(name, durations[name]); say(`${labels[name] || name}动作`); };
  actions.append(button);
});
play('breathing', 0, {interaction:false});
petWrap.addEventListener('click', () => { play('happy', 3600); say('嘿嘿，摸到了！'); });
document.addEventListener('mousemove', updateGaze, {passive:true});
room.addEventListener('mouseleave', () => {
  petWrap.style.setProperty('--track-x','0px');
  petWrap.style.setProperty('--track-y','0px');
  petWrap.style.setProperty('--track-tilt','0deg');
});
