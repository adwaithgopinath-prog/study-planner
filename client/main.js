// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
const S = {
  sessions:[],topics:{},streak:0,hoursThisWeek:0,
  quizData:null,quizIdx:0,quizScore:0,quizAnswers:[],
  quizHistory:[],generatedPlan:'',extractedContent:'',
  activityLog:[],weeklyActivity:[0,0,0,0,0,0,0],
  userName:'Engineer',notes:[],
  flashcards:[],fcIdx:0,fcFlipped:false,fcKnow:0,fcReview:0,
  timerSessions:0,timerTotalMin:0,timerLog:[],
  apiKey:'llama3.2:3b',
  tier:'SOVEREIGN',plansUsed:0,library:[],savedPlans:[],
  formulaVault:[],
  plannedHours:0, actualHours:0, lastStudyDate:null,
  xp:0, level:1, spacedRepQueue:[], activeChecklist:[]
};

// ═══════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async ()=>{
  try {
    console.log('AURA OS [Version 5.1.0] - Neural Intelligence Engine Online.');
    await loadState();
    initCursor();
    init3D();
    initClock();
    renderOverview();
    renderAnalytics();
    renderNotes();
    renderLibrary();
    renderXP();
    renderChecklist();
    renderHeatmap();
    updateBriefing();
    syncUserUI();
    updateUsageUI();
    
    // AI Coach Welcome
    setTimeout(() => {
      triggerCoach();
    }, 2000);

    const dateInput=document.getElementById('pl-date');
    if(dateInput) dateInput.min=new Date().toISOString().split('T')[0];
    
    gsap.from('.hero-badge,.hero h1,.hero-sub,.hero-actions,.hero-cards',{y:48,opacity:0,duration:1.1,stagger:.13,ease:'power4.out',delay:.2});
    updateTimerDisplay();
  } catch (err) {
    console.error('System Failure:', err);
    showToast('⚠️ AURA OS: Critical module failure during initialization.');
  }
});

// ═══════════════════════════════════════════════
//  PERSIST & SYNC
// ═══════════════════════════════════════════════
async function saveState(){
  try {
    localStorage.setItem('sf4_state', JSON.stringify(S));
    // Background sync with server
    await window.AuraAPI.syncData(S.userName, S);
  } catch(e) {
    console.error("Save Error:", e);
  }
}

async function loadState(){
  try {
    // Try to load from server first
    const serverData = await window.AuraAPI.loadData(S.userName);
    if(serverData && serverData.sessions) {
        Object.assign(S, serverData);
        return;
    }
    
    // Fallback to local
    const saved=localStorage.getItem('sf4_state');
    if(saved){const d=JSON.parse(saved);Object.assign(S,d);}
    if(!S.xp) S.xp=0; if(!S.level) S.level=1; if(!S.spacedRepQueue) S.spacedRepQueue=[]; if(!S.activeChecklist) S.activeChecklist=[];
    const k=localStorage.getItem('sf4_apikey');
    if(k) S.apiKey=k;
  } catch(e) {}
}

function saveApiKey(){
  const k=document.getElementById('api-key-input').value.trim();
  if(!k){showToast('⚠️ Enter a valid Ollama model name');return;}
  S.apiKey=k;
  localStorage.setItem('sf4_apikey',k);
  document.getElementById('api-modal').classList.remove('open');
  showToast('✓ AI Config saved!');
  renderOverview();
}

function setTier(t){
  S.tier=t;
  saveState();
  syncUserUI();
  updateUsageUI();
  nav('dashboard');
  showToast(`✓ Node upgraded to ${t}_TIER`);
  if(t==='PRO') confetti({particleCount:150,spread:70,origin:{y:.6},colors:['#7C6EE8','#F5C842']});
}

function updateUsageUI(){
  const lbl=document.getElementById('sb-tier-lbl');
  const cnt=document.getElementById('sb-plans-left');
  const box=document.getElementById('sb-upgrade-box');
  const active=document.getElementById('sb-tier-active');
  if(!lbl) return;
  lbl.textContent=`NEURAL_TIER: ${S.tier}`;
  active.textContent=`${S.tier}_NODE_ACTIVE`;
  if(S.tier==='PRO' || S.tier==='SOVEREIGN'){
    cnt.textContent='∞';
    box.style.background='linear-gradient(135deg,rgba(245,200,66,.15),rgba(124,110,232,.15))';
    box.style.borderColor='rgba(245,200,66,.3)';
    lbl.style.color='var(--gold)';
  } else {
    cnt.textContent=Math.max(0,3-S.plansUsed);
  }
}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
function nav(pageId){
  const cur=document.querySelector('.page.active');
  const tgt=document.getElementById(pageId);
  if(!tgt||cur===tgt) return;
  gsap.to(cur,{opacity:0,y:20,duration:.3,onComplete:()=>{
    cur.classList.remove('active');
    tgt.classList.add('active');
    gsap.fromTo(tgt,{opacity:0,y:-20},{opacity:1,y:0,duration:.5});
  }});
  document.getElementById('navbar').classList.toggle('scrolled',pageId==='dashboard');
}

function switchTab(tabId,el){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(s=>s.classList.remove('active'));
  document.getElementById('tab-'+tabId)?.classList.add('active');
  if(el) el.classList.add('active');
  if(tabId==='overview') renderOverview();
  if(tabId==='analytics') renderAnalytics();
  if(tabId==='notes') renderNotes();
  if(tabId==='library') renderLibrary();
  if(tabId==='quiz') renderQuizHistory();
}

// ═══════════════════════════════════════════════
//  THREE.JS 3D BACKGROUND
// ═══════════════════════════════════════════════
function init3D(){
  const canvas=document.getElementById('three-canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,.1,1000);
  camera.position.z=5;

  const nodeGeo=new THREE.SphereGeometry(.04,8,8);
  const nodeMat=new THREE.MeshBasicMaterial({color:0x7C6EE8,transparent:true,opacity:.7});
  const nodes=[];
  for(let i=0;i<120;i++){
    const m=new THREE.Mesh(nodeGeo,nodeMat.clone());
    m.position.set((Math.random()-.5)*14,(Math.random()-.5)*10,(Math.random()-.5)*8);
    m.userData={vx:(Math.random()-.5)*.005,vy:(Math.random()-.5)*.004,vz:(Math.random()-.5)*.003};
    scene.add(m);
    nodes.push(m);
  }

  const lineMat=new THREE.LineBasicMaterial({color:0x7C6EE8,transparent:true,opacity:.12});
  const lineGroup=new THREE.Group();
  scene.add(lineGroup);

  const shapes=[];
  const shapeGeos=[
    new THREE.IcosahedronGeometry(.3,0),
    new THREE.OctahedronGeometry(.25,0),
    new THREE.TetrahedronGeometry(.28,0)
  ];
  const shapeMat=new THREE.MeshBasicMaterial({color:0x6EE8C4,wireframe:true,transparent:true,opacity:.18});
  for(let i=0;i<8;i++){
    const geo=shapeGeos[i%3];
    const m=new THREE.Mesh(geo,shapeMat.clone());
    m.position.set((Math.random()-.5)*12,(Math.random()-.5)*8,(Math.random()-.5)*6);
    m.userData={rx:Math.random()*.005,ry:Math.random()*.004,rz:Math.random()*.003};
    scene.add(m);
    shapes.push(m);
  }

  const sphereGeo=new THREE.SphereGeometry(1.2,32,32);
  const sphereMat=new THREE.MeshBasicMaterial({color:0x7C6EE8,wireframe:true,transparent:true,opacity:.06});
  const sphere=new THREE.Mesh(sphereGeo,sphereMat);
  scene.add(sphere);

  let frame=0;
  let mouseX=0,mouseY=0;
  document.addEventListener('mousemove',e=>{mouseX=(e.clientX/window.innerWidth-.5)*.5;mouseY=(e.clientY/window.innerHeight-.5)*.5;});
  window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });

  function animate(){
    requestAnimationFrame(animate);
    frame++;
    nodes.forEach(n=>{
      n.position.x+=n.userData.vx;
      n.position.y+=n.userData.vy;
      n.position.z+=n.userData.vz;
      if(Math.abs(n.position.x)>7) n.userData.vx*=-1;
      if(Math.abs(n.position.y)>5) n.userData.vy*=-1;
      if(Math.abs(n.position.z)>4) n.userData.vz*=-1;
      const pulse=Math.sin(frame*.02+n.position.x)*.5+.5;
      n.material.opacity=.3+pulse*.5;
    });
    if(frame%60===0){
      lineGroup.clear();
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const d=nodes[i].position.distanceTo(nodes[j].position);
          if(d<2.5){
            const geo=new THREE.BufferGeometry().setFromPoints([nodes[i].position.clone(),nodes[j].position.clone()]);
            const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xA78BFA,transparent:true,opacity:.06*(1-d/2.5)}));
            lineGroup.add(line);
          }
        }
      }
    }
    shapes.forEach(s=>{s.rotation.x+=s.userData.rx;s.rotation.y+=s.userData.ry;s.rotation.z+=s.userData.rz;});
    sphere.rotation.y+=.001;
    sphere.rotation.x+=.0005;
    camera.position.x+=(mouseX-camera.position.x)*.02;
    camera.position.y+=(-mouseY-camera.position.y)*.02;
    camera.lookAt(scene.position);

    renderer.render(scene,camera);
  }
  animate();
}

// ═══════════════════════════════════════════════
//  AMBIENT ENGINE
// ═══════════════════════════════════════════════
const AmbientState = { playing: false, current: 'lofi', audio: null };
const AmbientTracks = {
  lofi: { name: "Deep Focus Lo-Fi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  rain: { name: "Heavy Rain & Thunder", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  forest: { name: "Mystic Forest Birds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  space: { name: "Deep Space Ambience", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
};

function toggleAmbient() {
  if (!AmbientState.audio) {
    AmbientState.audio = new Audio(AmbientTracks[AmbientState.current].url);
    AmbientState.audio.loop = true;
  }
  if (AmbientState.playing) {
    AmbientState.audio.pause();
    AmbientState.playing = false;
    document.getElementById('ambient-status').textContent = 'ENGINE_PAUSED';
  } else {
    AmbientState.audio.play().catch(e => console.log("Audio play blocked."));
    AmbientState.playing = true;
    document.getElementById('ambient-status').textContent = 'ENGINE_LIVE';
    showToast(`🔊 Playing: ${AmbientTracks[AmbientState.current].name}`);
  }
}

function changeAmbient() {
  const val = document.getElementById('ambient-select').value;
  AmbientState.current = val;
  document.getElementById('ambient-name').textContent = AmbientTracks[val].name;
  if (AmbientState.audio) {
    AmbientState.audio.src = AmbientTracks[val].url;
    if (AmbientState.playing) AmbientState.audio.play();
  }
}

// ═══════════════════════════════════════════════
//  AI COACH
// ═══════════════════════════════════════════════
const CoachMessages = [
  "Engineer, your cognitive patterns are showing high focus. Keep it up.",
  "Warning: Session fatigue detected. Consider a 5-minute neural reset.",
  "The current study plan is 84% more efficient than standard methods.",
  "Analyzing your streak... You are becoming an outlier in performance.",
  "Data suggests that revision in 15 minutes will maximize retention.",
  "Focus engine at 100% capacity. You're doing incredible work."
];

function triggerCoach() {
  const panel = document.getElementById('ai-coach');
  const msg = document.getElementById('coach-msg');
  if(!panel) return;
  panel.style.display = 'block';
  gsap.fromTo(panel, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power4.out" });
  const randomMsg = CoachMessages[Math.floor(Math.random() * CoachMessages.length)];
  msg.textContent = `"${randomMsg}"`;
  setTimeout(() => {
    gsap.to(panel, { x: 50, opacity: 0, duration: 0.8, onComplete: () => panel.style.display = 'none' });
  }, 8000);
}

setInterval(() => { if (Math.random() > 0.7 && S.hoursThisWeek > 0) triggerCoach(); }, 60000);

// ═══════════════════════════════════════════════
//  CURSOR & CLOCK
// ═══════════════════════════════════════════════
function initCursor(){
  const c=document.getElementById('cur');
  const r=document.getElementById('cur-ring');
  document.addEventListener('mousemove',e=>{
    gsap.to(c,{x:e.clientX,y:e.clientY,duration:0});
    gsap.to(r,{x:e.clientX,y:e.clientY,duration:.15});
  });
  document.querySelectorAll('button,a,.sb-item,.sess-row,.h-card,.feat,.plan,.topic-chip').forEach(el=>{
    el.addEventListener('mouseenter',()=>r.classList.add('hov'));
    el.addEventListener('mouseleave',()=>r.classList.remove('hov'));
  });
}

function initClock(){
  function update(){
    const el=document.getElementById('clock');
    if(!el) return;
    const now=new Date();
    el.textContent=now.toLocaleString('en-IN',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).toUpperCase()+' — NODE_ACTIVE';
  }
  update();setInterval(update,1000);
}

// ═══════════════════════════════════════════════
//  QUIZ ENGINE
// ═══════════════════════════════════════════════
async function generateQuiz(isSpacedRep = false){
  const input=document.getElementById('quiz-input').value.trim();
  const count=document.getElementById('quiz-count').value;
  const diff=document.getElementById('quiz-diff').value;
  const type=document.getElementById('quiz-type').value;
  if(!input && !isSpacedRep){showToast('⚠️ Enter a topic or paste material');return;}
  const btn=document.getElementById('quiz-gen-btn');
  btn.disabled=true;btn.innerHTML='<span class="spinner"></span> Generating...';
  const mastery = S.topics[input] || 0;
  const adaptiveDiff = mastery > 80 ? 'Expert' : mastery > 50 ? 'Hard' : diff;
  let prompt = `Generate ${count} ${adaptiveDiff} ${type} questions about: ${input}.`;
  if(isSpacedRep && S.spacedRepQueue.length > 0){
     prompt = `Review Session: Generate questions focusing on these concepts I previously struggled with: ${S.spacedRepQueue.slice(-5).map(q=>q.q).join(', ')}. Combine with new material from: ${input}`;
  }
  const sys=`You are StudyForge's Quiz Engine. Respond ONLY with valid JSON: { "questions": [ { "type": "mcq", "question": "...", "options": ["A. ...", "B. ..."], "correct": 0, "explanation": "..." } ] }`;
  try{
    const text=await window.AuraAPI.callAI(sys, prompt + " Return ONLY JSON.");
    const clean=text.replace(/```json|```/g,'').trim();
    const data=JSON.parse(clean);
    S.quizData=data.questions;S.quizIdx=0;S.quizScore=0;S.quizAnswers=[];
    document.getElementById('quiz-setup').style.display='none';
    document.getElementById('quiz-active').style.display='block';
    renderQuizQ();
  }catch(err){showToast('⚠️ '+err.message);}
  finally{btn.disabled=false;btn.innerHTML='🎯 Generate Quiz';}
}

function renderQuizQ(){
  const q=S.quizData[S.quizIdx];
  document.getElementById('quiz-prog-lbl').textContent=`Q${S.quizIdx+1}/${S.quizData.length}`;
  document.getElementById('quiz-score-disp').textContent=`${S.quizScore}/${S.quizIdx}`;
  document.getElementById('quiz-bar').style.width=`${(S.quizIdx/S.quizData.length)*100}%`;
  const isMCQ=q.type==='mcq';
  document.getElementById('quiz-question-area').innerHTML=`
    <div class="quiz-question">${S.quizIdx+1}. ${q.question}</div>
    ${isMCQ?`<div class="quiz-opts">${q.options.map((o,i)=>`<button class="quiz-opt" onclick="answerMCQ(${i})">${o}</button>`).join('')}</div>`:`
    <textarea id="short-ans" placeholder="Type your answer..."></textarea>
    <button class="btn btn-primary" onclick="answerShort()">Submit</button>`}<div id="quiz-expl" class="quiz-expl" style="display:none"></div>`;
}

function answerMCQ(sel){
  const q=S.quizData[S.quizIdx];
  const right=sel===q.correct;
  if(right) S.quizScore++;
  const e=document.getElementById('quiz-expl');
  e.style.display='block'; e.innerHTML=`${right?'✓ Correct!':'✗ Incorrect.'} ${q.explanation||''}`;
  setTimeout(()=>{
    if(S.quizIdx<S.quizData.length-1){S.quizIdx++;renderQuizQ();}
    else showQuizResults();
  },1800);
}

function showQuizResults(){
  const total=S.quizData.length; const pct=Math.round((S.quizScore/total)*100);
  document.getElementById('quiz-active').style.display='none';
  document.getElementById('quiz-results').style.display='block';
  document.getElementById('quiz-result-score').textContent=`${S.quizScore}/${total} (${pct}%)`;
  addXP(pct * 2);
  S.quizHistory.push({date:new Date().toLocaleDateString(),score:S.quizScore,total,pct});
  saveState();
}

function resetQuiz(){
  document.getElementById('quiz-setup').style.display='block';
  document.getElementById('quiz-active').style.display='none';
  document.getElementById('quiz-results').style.display='none';
}

// ═══════════════════════════════════════════════
//  STUDY PLANNER
// ═══════════════════════════════════════════════
async function generateStudyPlan(){
  const exam=document.getElementById('pl-exam').value.trim();
  const date=document.getElementById('pl-date').value;
  const hours=document.getElementById('pl-hours').value;
  const syllabus=document.getElementById('pl-syllabus').value.trim();
  if(!exam||!date||!hours||!syllabus){showToast('⚠️ Fill all fields');return;}
  const btn=document.getElementById('gen-plan-btn');
  btn.disabled=true; btn.innerHTML='⚡ Processing...';
  const out=document.getElementById('plan-output');
  try{
    const sys=`You are a Neural Study Planner. Create a structured schedule.`;
    const res=await window.AuraAPI.callAI(sys,`Create plan for ${exam} on ${date}. Syllabus: ${syllabus}`, p=>out.textContent=p);
    S.generatedPlan=res;
    S.savedPlans.push({id:Date.now(),title:exam,content:res,date:new Date().toLocaleDateString()});
    saveState();
    showToast('✓ Plan Generated!');
  }catch(err){showToast('⚠️ '+err.message);}
  finally{btn.disabled=false; btn.innerHTML='⚡ Generate Plan';}
}

// ═══════════════════════════════════════════════
//  NOTES
// ═══════════════════════════════════════════════
function addNote(){
  const title=document.getElementById('note-title').value.trim();
  const content=document.getElementById('note-content').value.trim();
  if(!content) return;
  S.notes.unshift({id:Date.now(),title,content,date:new Date().toLocaleString()});
  saveState(); renderNotes();
}

function renderNotes(){
  const list=document.getElementById('notes-list');
  list.innerHTML=S.notes.map(n=>`<div class="note-item"><b>${n.title}</b><p>${n.content}</p><small>${n.date}</small></div>`).join('');
}

// ═══════════════════════════════════════════════
//  TIMER
// ═══════════════════════════════════════════════
let timerInterval=null;
let timerSeconds=25*60;
function toggleTimer(){
  if(timerInterval){
    clearInterval(timerInterval); timerInterval=null;
    document.getElementById('timer-start-btn').textContent='▶ Start';
  } else {
    timerInterval=setInterval(()=>{
      timerSeconds--; updateTimerDisplay();
      if(timerSeconds<=0){
        clearInterval(timerInterval); timerInterval=null;
        addXP(250); showToast('Session Complete! +250 XP');
      }
    },1000);
    document.getElementById('timer-start-btn').textContent='⏸ Pause';
  }
}
function updateTimerDisplay(){
  const m=Math.floor(timerSeconds/60); const s=timerSeconds%60;
  document.getElementById('timer-display').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ═══════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════
function addXP(amt){
  S.xp+=amt;
  if(S.xp>=S.level*1000){S.xp-=S.level*1000; S.level++; showToast('LEVEL UP!');}
  renderXP();
}
function renderXP(){
  document.getElementById('sb-xp-fill').style.width=(S.xp/(S.level*1000))*100+'%';
  document.getElementById('sb-lvl').textContent=S.level;
}
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// EXPOSE GLOBALS for HTML onclicks
window.nav=nav; window.switchTab=switchTab; window.toggleAmbient=toggleAmbient; 
window.changeAmbient=changeAmbient; window.saveApiKey=saveApiKey; window.setTier=setTier;
window.generateStudyPlan=generateStudyPlan; window.generateQuiz=generateQuiz;
window.answerMCQ=answerMCQ; window.resetQuiz=resetQuiz; window.toggleTimer=toggleTimer;
window.addNote=addNote; window.triggerCoach=triggerCoach;

// ═══════════════════════════════════════════════
//  PREMIUM FEATURES (v5.2)
// ═══════════════════════════════════════════════

function renderHeatmap() {
    const grid = document.getElementById('streak-heatmap');
    if(!grid) return;
    grid.innerHTML = '';
    // Generate 26 weeks (182 days)
    for(let i=0; i<182; i++) {
        const cell = document.createElement('div');
        cell.className = 'heat-cell';
        // Simulated data for demo (random intensity)
        if(Math.random() > 0.8) {
            const level = Math.floor(Math.random() * 4) + 1;
            cell.classList.add(`heat-${level}`);
        }
        grid.appendChild(cell);
    }
}

async function updateBriefing() {
    const briefingText = document.getElementById('briefing-text');
    if(!briefingText) return;

    if(!S.sessions || S.sessions.length === 0) {
        briefingText.textContent = "Welcome to Aura OS. Generate a study plan to begin your neural journey.";
        return;
    }

    const completed = S.sessions.filter(s => s.done).length;
    const total = S.sessions.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    let msg = `You have completed ${progress}% of your current workload. `;
    
    if(progress < 30) {
        msg += "Neural momentum is low. Data suggests a 25-minute Pomodoro session to jumpstart retention.";
    } else if(progress < 70) {
        msg += "Optimal performance detected. Consider tackling a 'Hard' topic next while cognitive load is stable.";
    } else {
        msg += "Elite performance! Your streak is secure. Review your saved formulas to lock in today's gains.";
    }

    briefingText.textContent = msg;
}
