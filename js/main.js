/* ── REDUCED MOTION + LOW-PERF DETECTION ── */
const prefersReducedMotion = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const _conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const lowPerf = !!(_conn && (_conn.saveData ||
  _conn.effectiveType === '2g' || _conn.effectiveType === 'slow-2g'));
if(lowPerf){
  window.addEventListener('load', () => {
    const pc = document.getElementById('particle-canvas');
    if(pc) pc.style.display = 'none';
    const oc = document.getElementById('objeta-canvas');
    if(oc){
      const sec = oc.closest('section');
      if(sec) sec.style.background = '#09090F';
    }
  });
}

/* ── FOOTER YEAR ───────────────────────────── */
(function(){
  const y = document.getElementById('footer-year');
  if(y) y.textContent = new Date().getFullYear();
})();

/* ── PSI CURSOR (sadece hover destekleyen cihazlar) ── */
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const psi  = document.getElementById('cursor-psi');
const ring = document.getElementById('cursor-ring');
if(!isTouch && psi && ring){
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    psi.style.left = mx + 'px';
    psi.style.top  = my + 'px';
  });
  (function lerpRing(){
    rx += (mx-rx)*.1;
    ry += (my-ry)*.1;
    ring.style.left = rx+'px';
    ring.style.top  = ry+'px';
    requestAnimationFrame(lerpRing);
  })();
  document.querySelectorAll('a,button,.svc,.pillar,.ti,.pub-card,.ji').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-big'));
  });
}

/* ── NAV ──────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), {passive:true});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if(t) t.scrollIntoView({behavior:'smooth'});
  });
});

/* mobile */
const burger = document.getElementById('burger');
const mob    = document.getElementById('nav-mob');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mob.classList.toggle('open');
});
function closeMob(){ burger.classList.remove('open'); mob.classList.remove('open'); }
document.querySelectorAll('[data-close-mob]').forEach(a => {
  a.addEventListener('click', closeMob);
});

/* ── RADIAL SHADER (hero background) ─────── */
(function initRadialShader(){
  if(prefersReducedMotion) return;
  const canvas = document.getElementById('smoke-canvas');
  if(!canvas) return;
  const gl = canvas.getContext('webgl2', {premultipliedAlpha:false});
  if(!gl) return;

  const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){ v_uv=a_pos*0.5+0.5; gl_Position=vec4(a_pos,0.0,1.0); }`;

  const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
in vec2 v_uv;
uniform vec3  iResolution;
uniform float iTime;
uniform int   iFrame;
uniform vec4  iMouse;
void main(){
  vec2 r=iResolution.xy;
  float t=iTime;
  vec4 o=vec4(0.0);
  vec2 p=gl_FragCoord.xy-r*0.5;
  for(float i=0.0,a=0.0;i++<7.0;){
    a=length(p)/r.y-i*i/50.0;
    float denom=max(a,-a*4.0)+2.0/r.y;
    a=atan(p.y,p.x)*3.0+t*sin(i*i)+i*i;
    float gate=smoothstep(0.0,0.6,cos(a));
    o+=0.02/denom*gate*(1.0+sin(a-i+vec4(0.0,0.2,0.5,0.0)));
  }
  o=tanh(o);
  fragColor=vec4(o.rgb,1.0);
}`;

  function mkSh(type,src){
    const s=gl.createShader(type);
    gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
      console.error('Radial shader:',gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  const vs=mkSh(gl.VERTEX_SHADER,VERT);
  const fs=mkSh(gl.FRAGMENT_SHADER,FRAG);
  if(!vs||!fs) return;
  const prog=gl.createProgram();
  gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){
    console.error('Radial link:',gl.getProgramInfoLog(prog)); return;
  }

  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);

  const uRes  =gl.getUniformLocation(prog,'iResolution');
  const uTime =gl.getUniformLocation(prog,'iTime');
  const uFrame=gl.getUniformLocation(prog,'iFrame');
  const uMouse=gl.getUniformLocation(prog,'iMouse');

  const hero=document.getElementById('hero');
  let cw=0,ch=0;
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    cw=Math.max(1,(hero.offsetWidth*dpr)|0);
    ch=Math.max(1,(hero.offsetHeight*dpr)|0);
    canvas.width=cw; canvas.height=ch;
    gl.viewport(0,0,cw,ch);
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  const mouse={x:0,y:0};
  hero.addEventListener('mousemove',e=>{
    const r=hero.getBoundingClientRect();
    mouse.x=(e.clientX-r.left)*(cw/r.width);
    mouse.y=ch-(e.clientY-r.top)*(ch/r.height);
  },{passive:true});

  const start=performance.now();
  let frame=0;
  function tick(){
    const t=(performance.now()-start)/1000;
    frame++;
    gl.useProgram(prog);
    gl.uniform3f(uRes,cw,ch,Math.min(window.devicePixelRatio||1,2));
    gl.uniform1f(uTime,t);
    gl.uniform1i(uFrame,frame);
    gl.uniform4f(uMouse,mouse.x,mouse.y,0,0);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ── HERO PARTICLE OVERLAY ────────────────── */
(function initPts(){
  if(prefersReducedMotion) return;
  const c   = document.getElementById('hero-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  const hero= document.getElementById('hero');

  function resize(){
    c.width  = hero.offsetWidth;
    c.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  const N = 40;
  const pts = Array.from({length:N}, ()=>({
    x: Math.random()*c.width, y: Math.random()*c.height,
    vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
    r: Math.random()*1.2+.3,  o: Math.random()*.2+.03,
  }));

  (function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>c.width)  p.vx*=-1;
      if(p.y<0||p.y>c.height) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,169,110,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();

/* ── HERO PARALLAX ────────────────────────── */
const pimg = document.getElementById('parallax-img');
const hero = document.getElementById('hero');

window.addEventListener('scroll', ()=>{
  if(!pimg) return;
  const s = window.scrollY;
  if(s < window.innerHeight*1.5) pimg.style.transform = `scale(1.06) translateY(${s*.2}px)`;
},{passive:true});

hero.addEventListener('mousemove', e=>{
  const r = hero.getBoundingClientRect();
  const x = (e.clientX-r.left)/r.width  - .5;
  const y = (e.clientY-r.top) /r.height - .5;
  if(pimg) pimg.style.transform = `scale(1.06) translate(${x*16}px,${y*16}px)`;
});

/* ── SCROLL REVEAL ────────────────────────── */
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.08, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(el=>obs.observe(el));

/* ── SPOTLIGHT EFFECT on .spot ────────────── */
document.querySelectorAll('.spot').forEach(el=>{
  el.addEventListener('mousemove', e=>{
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX-r.left)+'px');
    el.style.setProperty('--my', (e.clientY-r.top )+'px');
  });
});

/* ── DRAG-SCROLL publications ─────────────── */
const ps = document.getElementById('pub-scroll');
if(ps){
  let down=false, startX, sl;
  ps.addEventListener('mousedown', e=>{down=true; startX=e.pageX-ps.offsetLeft; sl=ps.scrollLeft;});
  ps.addEventListener('mouseleave',  ()=>down=false);
  ps.addEventListener('mouseup',     ()=>down=false);
  ps.addEventListener('mousemove', e=>{
    if(!down) return;
    e.preventDefault();
    ps.scrollLeft = sl-(e.pageX-ps.offsetLeft-startX);
  });
}

/* ── TEXT REVEAL CARD ─────────────────────── */
(function initTextReveal(){
  const card  = document.getElementById('tr-card');
  const body  = document.getElementById('tr-body');
  const rw    = document.getElementById('tr-rw');
  const divEl = document.getElementById('tr-div');
  if(!card||!rw||!divEl) return;

  card.addEventListener('mousemove', e => {
    const rect = body.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const pct  = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const rot  = (pct - 50) * 0.06;
    rw.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divEl.style.left      = pct + '%';
    divEl.style.transform = `translateX(-50%) rotate(${rot}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    rw.style.clipPath = 'inset(0 100% 0 0)';
    divEl.style.left  = '0%';
  });
  card.addEventListener('mouseenter', () => {
    divEl.style.opacity = '1';
  });
})();

/* ── STARS in text reveal ─────────────────── */
(function initTrStars(){
  if(prefersReducedMotion) return;
  const c = document.getElementById('tr-stars');
  if(!c) return;
  const ctx = c.getContext('2d');

  function sz(){
    c.width  = c.parentElement.offsetWidth;
    c.height = c.parentElement.offsetHeight;
  }
  sz();
  window.addEventListener('resize', sz, {passive:true});

  const stars = Array.from({length:90}, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * .9 + .2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * .008 + .003,
  }));

  let _st = null;
  function draw(ts){
    if(!_st) _st = ts;
    const t = (ts - _st) * 0.001;
    if(c.width > 0 && c.height > 0){
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s => {
        const o = Math.abs(Math.sin(t * s.speed + s.phase)) * .35;
        ctx.beginPath();
        ctx.arc(s.x * c.width, s.y * c.height, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(138,100,40,${o})`;
        ctx.fill();
      });
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ── TUNNEL — Bilinçdışına Yolculuk (WebGL2) ─── */
(function initTunnel(){
  if(prefersReducedMotion || lowPerf) return;
  const canvas = document.getElementById('tunnel-canvas');
  if(!canvas) return;
  const gl = canvas.getContext('webgl2', { antialias:true, premultipliedAlpha:false });
  if(!gl) return;

  const VERT = `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform float iTime;
uniform vec3  iResolution;

#define TAU 6.2831853071795865
#define TUNNEL_LAYERS 72
#define RING_POINTS 128
#define POINT_SIZE 1.8
#define POINT_COLOR_A vec3(1.0, 0.96, 0.88)
#define POINT_COLOR_B vec3(0.78, 0.59, 0.25)
#define SPEED 0.7

float sq(float x){ return x*x; }

vec2 AngRep(vec2 uv, float angle){
  vec2 polar = vec2(atan(uv.y, uv.x), length(uv));
  polar.x = mod(polar.x + angle*0.5, angle) - angle*0.5;
  return polar.y * vec2(cos(polar.x), sin(polar.x));
}

float sdCircle(vec2 uv, float r){ return length(uv) - r; }

vec3 MixShape(float sd, vec3 fill, vec3 target){
  float blend = smoothstep(0.0, 1.0/iResolution.y, sd);
  return mix(fill, target, blend);
}

vec2 TunnelPath(float x){
  vec2 offs = vec2(
    0.2 * sin(TAU * x * 0.5) + 0.4 * sin(TAU * x * 0.2 + 0.3),
    0.3 * cos(TAU * x * 0.3) + 0.2 * cos(TAU * x * 0.1)
  );
  offs *= smoothstep(1.0, 4.0, x);
  return offs;
}

void main(){
  vec2 res = iResolution.xy / iResolution.y;
  vec2 uv  = gl_FragCoord.xy / iResolution.y - res*0.5;
  vec3 color = vec3(0.0);
  float repAngle = TAU / float(RING_POINTS);
  float pointSize = POINT_SIZE / (2.0 * iResolution.y);
  float camZ = iTime * SPEED;
  vec2 camOffs = TunnelPath(camZ);

  for(int i = 1; i <= TUNNEL_LAYERS; i++){
    float pz = 1.0 - (float(i) / float(TUNNEL_LAYERS));
    pz -= mod(camZ, 4.0 / float(TUNNEL_LAYERS));
    vec2 offs = TunnelPath(camZ + pz) - camOffs;
    float ringRad = 0.15 * (1.0 / sq(pz * 0.8 + 0.4));
    if(abs(length(uv + offs) - ringRad) < pointSize * 1.5){
      vec2 aruv = AngRep(uv + offs, repAngle);
      float pdist = sdCircle(aruv - vec2(ringRad, 0.0), pointSize);
      vec3 ptColor = (mod(float(i/2), 2.0) == 0.0) ? POINT_COLOR_A : POINT_COLOR_B;
      float shade = (1.0 - pz);
      color = MixShape(pdist, ptColor * shade, color);
    }
  }
  fragColor = vec4(color, 1.0);
}`;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.warn('tunnel shader:', gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if(!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.warn('tunnel link:', gl.getProgramInfoLog(prog)); return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'iTime');
  const uRes  = gl.getUniformLocation(prog, 'iResolution');

  let running = false, rafId = null, t0 = performance.now(), pageHidden = false;

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth  * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if(canvas.width !== w || canvas.height !== h){
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform3f(uRes, w, h, 1);
    }
  }

  function render(){
    if(!running) return;
    resize();
    gl.uniform1f(uTime, (performance.now() - t0) * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(render);
  }

  function start(){
    if(running || pageHidden) return;
    running = true;
    rafId = requestAnimationFrame(render);
  }
  function stop(){
    running = false;
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
  }

  // Görünür değilse render etme — boşa GPU kullanma
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      for(const e of entries){
        if(e.isIntersecting) start(); else stop();
      }
    }, { rootMargin: '80px' });
    io.observe(canvas);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    pageHidden = document.hidden;
    if(pageHidden) stop();
  });
})();


/* ── GOOEY TEXT MORPH ─────────────────────── */
(function initGooey(){
  const t1=document.getElementById('gt1');
  const t2=document.getElementById('gt2');
  if(!t1||!t2) return;
  const words=['Arzu','Bilinçdışı','Jouissance','Objet a','Söylem','Gerçek'];
  const morphTime=1.0, coolTime=2.5;
  let idx=0, morph=0, cool=coolTime, prev=Date.now();
  t1.textContent=words[words.length-1];
  t2.textContent=words[0];
  function setM(f){
    t2.style.filter=`blur(${Math.min(8/f-8,100)}px)`;
    t2.style.opacity=(Math.pow(f,.4)*100)+'%';
    f=1-f;
    t1.style.filter=`blur(${Math.min(8/f-8,100)}px)`;
    t1.style.opacity=(Math.pow(f,.4)*100)+'%';
  }
  (function loop(){
    requestAnimationFrame(loop);
    const now=Date.now(),dt=(now-prev)/1000; prev=now;
    const was=cool>0; cool-=dt;
    if(cool<=0){
      if(was){idx=(idx+1)%words.length;t1.textContent=words[idx];t2.textContent=words[(idx+1)%words.length];}
      morph-=cool; cool=0;
      let f=morph/morphTime;
      if(f>1){cool=coolTime;f=1;}
      setM(f);
    } else {morph=0;t2.style.filter='';t2.style.opacity='100%';t1.style.filter='';t1.style.opacity='0%';}
  })();
})();

/* ── PROGRESSIVE BLUR ─────────────────────── */
(function initProgBlur(){
  document.querySelectorAll('.pblur').forEach(el=>{
    const isRight = el.classList.contains('pblur-right');
    const layers = 8;
    for(let i=0; i<layers; i++){
      const d = document.createElement('div');
      const seg = 1/(layers+1);
      const stops = [i*seg,(i+1)*seg,(i+2)*seg,(i+3)*seg].map((p,pi)=>
        `rgba(0,0,0,${pi===1||pi===2?1:0}) ${(p*100).toFixed(1)}%`
      ).join(',');
      const angle = isRight ? 270 : 90;
      d.style.cssText = `
        mask-image:linear-gradient(${angle}deg,${stops});
        -webkit-mask-image:linear-gradient(${angle}deg,${stops});
        backdrop-filter:blur(${i*0.8}px);
        -webkit-backdrop-filter:blur(${i*0.8}px);
      `;
      el.appendChild(d);
    }
  });
})();

/* ── PARTICLE TEXT EFFECT ─────────────────── */
(function initParticleText(){
  if(prefersReducedMotion || lowPerf) return;
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const WORDS = ['ARZU','JOUISSANCE','SÖYLEM','GERÇEK','BİLİNÇDIŞI','ÖZNE','ÖTEKİ','LACAN'];
  const PIXEL_STEPS = 6;
  const COLORS = [
    {r:200,g:169,b:110},
    {r:224,g:192,b:128},
    {r:156,g:122,b:139},
    {r:139,g:157,b:195},
    {r:232,g:232,b:220},
  ];

  function genPos(cx,cy,mag){
    const rx=Math.random()*canvas.width, ry=Math.random()*canvas.height;
    const dx=rx-cx, dy=ry-cy, m=Math.sqrt(dx*dx+dy*dy)||1;
    return {x:cx+dx/m*mag, y:cy+dy/m*mag};
  }

  class P {
    constructor(){
      this.pos={x:0,y:0}; this.vel={x:0,y:0}; this.acc={x:0,y:0};
      this.target={x:0,y:0}; this.closeEnough=100;
      this.maxSpeed=1; this.maxForce=0.1;
      this.isKilled=false;
      this.sc={r:0,g:0,b:0}; this.tc={r:0,g:0,b:0}; this.cw=0; this.cbr=0.01;
    }
    move(){
      const dx=this.target.x-this.pos.x, dy=this.target.y-this.pos.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const pm=dist<this.closeEnough?dist/this.closeEnough:1;
      const m=dist||1;
      const tx=dx/m*this.maxSpeed*pm, ty=dy/m*this.maxSpeed*pm;
      const sx=tx-this.vel.x, sy=ty-this.vel.y;
      const sm=Math.sqrt(sx*sx+sy*sy)||1;
      this.acc.x+=sx/sm*this.maxForce; this.acc.y+=sy/sm*this.maxForce;
      this.vel.x+=this.acc.x; this.vel.y+=this.acc.y;
      this.pos.x+=this.vel.x; this.pos.y+=this.vel.y;
      this.acc.x=0; this.acc.y=0;
    }
    draw(){
      if(this.cw<1) this.cw=Math.min(this.cw+this.cbr,1);
      const r=Math.round(this.sc.r+(this.tc.r-this.sc.r)*this.cw);
      const g=Math.round(this.sc.g+(this.tc.g-this.sc.g)*this.cw);
      const b=Math.round(this.sc.b+(this.tc.b-this.sc.b)*this.cw);
      ctx.fillStyle=`rgb(${r},${g},${b})`;
      ctx.fillRect(this.pos.x,this.pos.y,2,2);
    }
    kill(){
      if(!this.isKilled){
        const rp=genPos(canvas.width/2,canvas.height/2,(canvas.width+canvas.height)/2);
        this.target.x=rp.x; this.target.y=rp.y;
        this.sc={r:this.sc.r+(this.tc.r-this.sc.r)*this.cw,g:this.sc.g+(this.tc.g-this.sc.g)*this.cw,b:this.sc.b+(this.tc.b-this.sc.b)*this.cw};
        this.tc={r:0,g:0,b:0}; this.cw=0; this.isKilled=true;
      }
    }
  }

  let particles=[], frame=0, wIdx=0;

  function setSize(){
    const w=canvas.parentElement.clientWidth||window.innerWidth;
    canvas.width=w; canvas.height=Math.round(w*0.38);
    canvas.style.height=canvas.height+'px';
  }
  setSize();
  window.addEventListener('resize',()=>{setSize();showWord(WORDS[wIdx]);},{passive:true});

  function showWord(word){
    const off=document.createElement('canvas');
    off.width=canvas.width; off.height=canvas.height;
    const oc=off.getContext('2d');
    const fs=Math.min(Math.floor(canvas.width*0.14),130);
    oc.fillStyle='white';
    oc.font=`300 ${fs}px 'Cormorant Garamond',Georgia,serif`;
    oc.textAlign='center'; oc.textBaseline='middle';
    oc.fillText(word,canvas.width/2,canvas.height/2);

    const id=oc.getImageData(0,0,canvas.width,canvas.height).data;
    const nc=COLORS[Math.floor(Math.random()*COLORS.length)];
    let pi=0;
    const coords=[];
    for(let i=0;i<id.length;i+=PIXEL_STEPS*4) coords.push(i);
    for(let i=coords.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[coords[i],coords[j]]=[coords[j],coords[i]];
    }
    for(const ci of coords){
      if(id[ci+3]>0){
        const x=(ci/4)%canvas.width, y=Math.floor(ci/4/canvas.width);
        let p;
        if(pi<particles.length){p=particles[pi];p.isKilled=false;pi++;}
        else{
          p=new P();
          const rp=genPos(canvas.width/2,canvas.height/2,(canvas.width+canvas.height)/2);
          p.pos.x=rp.x; p.pos.y=rp.y;
          p.maxSpeed=Math.random()*6+4; p.maxForce=p.maxSpeed*0.05;
          p.cbr=Math.random()*0.0275+0.0025; particles.push(p);
        }
        p.sc={r:p.sc.r+(p.tc.r-p.sc.r)*p.cw,g:p.sc.g+(p.tc.g-p.sc.g)*p.cw,b:p.sc.b+(p.tc.b-p.sc.b)*p.cw};
        p.tc=nc; p.cw=0; p.target.x=x; p.target.y=y;
      }
    }
    for(let i=pi;i<particles.length;i++) particles[i].kill();
  }

  function animate(){
    ctx.fillStyle='rgba(7,7,14,0.12)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i]; p.move(); p.draw();
      if(p.isKilled&&(p.pos.x<0||p.pos.x>canvas.width||p.pos.y<0||p.pos.y>canvas.height))
        particles.splice(i,1);
    }
    if(++frame%240===0){wIdx=(wIdx+1)%WORDS.length;showWord(WORDS[wIdx]);}
    requestAnimationFrame(animate);
  }

  showWord(WORDS[0]);
  requestAnimationFrame(animate);
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
})();

/* ── OBJET PETIT A SHADER ─────────────────── */
(function initObjetA(){
  if(prefersReducedMotion || lowPerf) return;
  const canvas = document.getElementById('objeta-canvas');
  if(!canvas) return;
  const gl = canvas.getContext('webgl2', {premultipliedAlpha:false});
  if(!gl) return;

  const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main(){ gl_Position=vec4(a_pos,0.0,1.0); }`;

  const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec3 iResolution;
uniform float iTime;

void main(){
  vec2 r=iResolution.xy;
  vec2 uv=(gl_FragCoord.xy-r*0.5)/min(r.x,r.y);
  float t=iTime*0.2;
  float rr=length(uv);
  float ang=atan(uv.y,uv.x);

  vec3 col=vec3(0.04,0.03,0.08);

  /* 5 orbital rings with rotating gaps — the objet a always escapes */
  for(float i=1.0;i<=5.0;i++){
    float orbit=0.1*i+0.05;
    float d=abs(rr-orbit);
    float ring=exp(-d*d*600.0/i);

    float gapCenter=t*0.4/i*6.28318+i*1.2;
    float gapSize=0.55+0.12*sin(t*0.25+i);
    float angDiff=mod(ang-gapCenter+3.14159,6.28318)-3.14159;
    float arc=smoothstep(0.0,gapSize*0.5,abs(angDiff)-gapSize*0.5);

    float voidMask=smoothstep(0.02,0.08,rr);

    float cf=sin(i*0.9+t*0.15)*0.5+0.5;
    vec3 ringCol=mix(
      vec3(0.78,0.66,0.43),
      vec3(0.50,0.40,0.65),
      cf
    );
    col+=ring*arc*voidMask*ringCol*(1.6-i*0.2);
  }

  /* 8 particles orbiting the void */
  for(float k=0.0;k<8.0;k++){
    float orbitR=0.16+k*0.08;
    float pAng=k*0.7854+t*(0.12-k*0.01)*6.28318;
    vec2 pPos=vec2(cos(pAng),sin(pAng))*orbitR;
    float d=length(uv-pPos);
    float particle=exp(-d*d*7000.0);
    float pc=sin(k*1.3+t*0.5)*0.5+0.5;
    vec3 pCol=mix(vec3(0.9,0.75,0.5),vec3(0.7,0.55,0.8),pc);
    col+=particle*pCol*2.2;
  }

  /* center void — manque */
  col*=smoothstep(0.01,0.07,rr);
  /* outer fade */
  col*=1.0-smoothstep(0.45,0.75,rr)*0.8;
  /* tone map */
  col=tanh(col*1.4);

  fragColor=vec4(col,1.0);
}`;

  function mkSh(type,src){
    const s=gl.createShader(type);
    gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
      console.error('ObjetA shader:',gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  const vs=mkSh(gl.VERTEX_SHADER,VERT);
  const fs=mkSh(gl.FRAGMENT_SHADER,FRAG);
  if(!vs||!fs) return;
  const prog=gl.createProgram();
  gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){
    console.error('ObjetA link:',gl.getProgramInfoLog(prog)); return;
  }

  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);

  const uRes =gl.getUniformLocation(prog,'iResolution');
  const uTime=gl.getUniformLocation(prog,'iTime');

  const wrap=canvas.parentElement;
  let cw=0,ch=0;
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    cw=Math.max(1,(wrap.offsetWidth*dpr)|0);
    ch=Math.max(1,(wrap.offsetHeight*dpr)|0);
    canvas.width=cw; canvas.height=ch;
    gl.viewport(0,0,cw,ch);
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  const start=performance.now();
  function tick(){
    const t=(performance.now()-start)/1000;
    gl.useProgram(prog);
    gl.uniform3f(uRes,cw,ch,1.0);
    gl.uniform1f(uTime,t);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

})();

/* ── CALENDAR ─────────────────────────────── */
(function initCal(){
  const grid = document.getElementById('cal-grid');
  const title = document.getElementById('cal-title');
  const display = document.getElementById('cal-display');
  const hiddenInput = document.getElementById('cal-value');
  if(!grid) return;
  const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  let cur = new Date(); cur.setDate(1);
  let selected = null;
  const today = new Date();
  function render(){
    const y = cur.getFullYear(), m = cur.getMonth();
    title.textContent = TR_MONTHS[m] + ' ' + y;
    grid.innerHTML = '';
    const first = new Date(y,m,1).getDay();
    const offset = (first + 6) % 7;
    const days = new Date(y,m+1,0).getDate();
    const prevDays = new Date(y,m,0).getDate();
    for(let i=0;i<offset;i++){
      const d=document.createElement('div');
      d.className='cal-day other-month';
      d.textContent=prevDays-offset+i+1;
      grid.appendChild(d);
    }
    for(let i=1;i<=days;i++){
      const d=document.createElement('div');
      d.className='cal-day';
      d.textContent=i;
      const date=new Date(y,m,i);
      if(date<new Date(today.getFullYear(),today.getMonth(),today.getDate())) d.classList.add('other-month');
      if(today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===i) d.classList.add('today');
      if(selected&&selected.getFullYear()===y&&selected.getMonth()===m&&selected.getDate()===i) d.classList.add('selected');
      d.addEventListener('click',()=>{
        selected=date;
        hiddenInput.value=`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        display.textContent=`${i} ${TR_MONTHS[m]} ${y}`;
        render();
      });
      grid.appendChild(d);
    }
  }
  document.getElementById('cal-prev').addEventListener('click',()=>{cur.setMonth(cur.getMonth()-1);render();});
  document.getElementById('cal-next').addEventListener('click',()=>{cur.setMonth(cur.getMonth()+1);render();});
  render();
})();

/* ── CONTACT FORM ─────────────── */
(function initContactForm(){
  const form = document.getElementById('contact-form');
  const msg  = document.getElementById('cf-msg');
  const btn  = document.getElementById('cf-submit');
  if(!form || !msg) return;

  // Consent içindeki linke tıklayınca checkbox toggle olmasın
  document.querySelectorAll('.cf-link').forEach(a => {
    a.addEventListener('click', e => e.stopPropagation());
  });

  function show(text, type){
    msg.textContent = text;
    msg.classList.remove('err','ok');
    if(type) msg.classList.add(type);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('cf-name').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const subject = (document.getElementById('cf-subject')?.value || '').trim();
    const date    = (document.getElementById('cal-value')?.value || '').trim();
    const message = document.getElementById('cf-message').value.trim();
    const kvkk    = document.getElementById('cf-kvkk');

    if(!name || !email || !message){
      show('Lütfen ad, e-posta ve mesaj alanlarını doldurun.', 'err');
      return;
    }
    if(kvkk && !kvkk.checked){
      show('Devam etmek için aydınlatma metnini onaylayın.', 'err');
      return;
    }

    show('Gönderiliyor…', '');
    if(btn) btn.disabled = true;

    const GFORM = 'https://docs.google.com/forms/d/e/1FAIpQLSevkdxVaWHnYinJFRdNLUoLzXkMtbN48IoEOALzF44mUjbFzQ/formResponse';
    const data = new FormData();
    data.append('entry.352433926', name);     // Ad Soyad
    data.append('entry.1721181518', email);   // E-posta
    data.append('entry.653947926', subject);  // Konu
    data.append('entry.643986528', message);  // Mesaj

    // Tarih (YYYY-MM-DD) → ayrı yıl/ay/gün alanlarına böl
    if(date && /^\d{4}-\d{2}-\d{2}$/.test(date)){
      const [y, m, d] = date.split('-');
      data.append('entry.416434751_year',  y);
      data.append('entry.416434751_month', m);
      data.append('entry.416434751_day',   d);
    }

    fetch(GFORM, { method:'POST', mode:'no-cors', body:data })
      .then(() => {
        show('Mesajınız alındı. En kısa sürede dönüş yapacağım.', 'ok');
        form.reset();
        const disp = document.getElementById('cal-display');
        const hv   = document.getElementById('cal-value');
        if(disp) disp.textContent = 'Tarih seçilmedi';
        if(hv)   hv.value = '';
      })
      .catch(() => show('Bir hata oluştu, lütfen tekrar deneyin.', 'err'))
      .finally(() => { if(btn) btn.disabled = false; });
  });
})();

/* ── KVKK COOKIE BANNER ─────────────────── */
(function initKvkk(){
  if(localStorage.getItem('kvkk_consent')) return;
  const banner = document.createElement('div');
  banner.className = 'kvkk-banner';
  banner.setAttribute('role','dialog');
  banner.setAttribute('aria-label','Çerez Politikası');
  banner.innerHTML = `
    <div class="kvkk-psi" aria-hidden="true">ψ</div>
    <h4 class="kvkk-title">Çerez Politikası</h4>
    <p class="kvkk-body">Bu site yalnızca temel oturum bilgilerini tutar. Veri işleme süreciniz <a href="kvkk.html">KVKK</a> ve <a href="aydinlatma.html">Aydınlatma Metni</a> kapsamındadır.</p>
    <div class="kvkk-actions">
      <button type="button" class="kvkk-btn kvkk-accept">Kabul Et</button>
      <button type="button" class="kvkk-btn kvkk-reject">Reddet</button>
    </div>`;
  document.body.appendChild(banner);
  requestAnimationFrame(()=>banner.classList.add('show'));
  function dismiss(value){
    localStorage.setItem('kvkk_consent', value);
    banner.classList.remove('show');
    setTimeout(()=>banner.remove(), 420);
  }
  banner.querySelector('.kvkk-accept').addEventListener('click', ()=>dismiss('accepted'));
  banner.querySelector('.kvkk-reject').addEventListener('click', ()=>dismiss('rejected'));
})();

/* ── MOBILE GYRO PARALLAX ─────────────── */
(function initGyro(){
  const img  = document.getElementById('parallax-img');
  const hero = document.getElementById('hero');
  if(!img || !hero) return;
  if(typeof DeviceOrientationEvent === 'undefined') return;

  let tx=0, ty=0, cx=0, cy=0, active=false;

  function start(){
    if(active) return;
    active = true;
    window.addEventListener('deviceorientation', e => {
      if(e.gamma == null || e.beta == null) return;
      const g = Math.max(-30, Math.min(30, e.gamma));
      const b = Math.max(-30, Math.min(30, e.beta - 40));
      tx = (g / 30) * 16;
      ty = (b / 30) * 16;
    }, {passive:true});
    (function tick(){
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      img.style.transform = `scale(1.06) translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px)`;
      requestAnimationFrame(tick);
    })();
  }

  if(typeof DeviceOrientationEvent.requestPermission === 'function'){
    hero.addEventListener('touchstart', async () => {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if(perm === 'granted') start();
      } catch(err){}
    }, {once:true, passive:true});
  } else {
    start();
  }
})();

/* ── SIDE RAIL ─────────────────────────────── */
(function initSrail(){
  const rail = document.getElementById('srail');
  if(!rail) return;

  // Yukarı butonu
  const top = document.getElementById('srail-top');
  if(top){
    top.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // İlk scroll'dan sonra göster
  const SHOW_AFTER = 240;
  function onScroll(){
    if(window.scrollY > SHOW_AFTER) rail.classList.add('show');
    else rail.classList.remove('show');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  // Contact veya footer görünüyorsa gizle (formu kapatmasın)
  const contact = document.getElementById('contact');
  const footer  = document.querySelector('footer');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      const anyVisible = entries.some(en => en.isIntersecting);
      rail.classList.toggle('hide', anyVisible);
    }, { threshold: 0.05 });
    if(contact) io.observe(contact);
    if(footer)  io.observe(footer);
  }
})();

/* ── SPARKLES (CTA section) ─────────────── */
(function initSparkles(){
  if(prefersReducedMotion || lowPerf) return;
  const canvas = document.getElementById('sparkles-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  if(!ctx) return;

  const COLOR     = '#c8a96e';    // altın
  const MIN_SIZE  = 0.6;
  const MAX_SIZE  = 2.2;
  const DENSITY   = 110;          // 400×400'lük alanda partikül sayısı
  const MAX_SPEED = 0.35;

  let particles = [], w = 0, h = 0, dpr = 1;
  let running = false, rafId = null, pageHidden = false;

  function makeParticle(){
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
      size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
      op:  0.1 + Math.random() * 0.9,
      dir: Math.random() > 0.5 ? 1 : -1,
      step: 0.004 + Math.random() * 0.012
    };
  }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    if(!w || !h) return;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(40, Math.round((w * h) / (400 * 400) * DENSITY));
    particles = [];
    for(let i = 0; i < count; i++) particles.push(makeParticle());
  }

  function draw(){
    if(!running) return;
    ctx.clearRect(0, 0, w, h);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
      p.op += p.dir * p.step;
      if(p.op <= 0.1){ p.op = 0.1; p.dir =  1; }
      if(p.op >= 1.0){ p.op = 1.0; p.dir = -1; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = COLOR;
      ctx.globalAlpha = p.op;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  function start(){
    if(running || pageHidden) return;
    running = true;
    if(!w || !h) resize();
    rafId = requestAnimationFrame(draw);
  }
  function stop(){
    running = false;
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Sadece görünürken render et — boşa GPU/CPU kullanma
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      for(const e of entries){
        if(e.isIntersecting) start(); else stop();
      }
    }, { rootMargin: '40px' });
    io.observe(canvas);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    pageHidden = document.hidden;
    if(pageHidden) stop();
  });
})();

/* ── MÖBIUS 3D (WebGL2 particles) ─────── */
(function initMobius(){
  if(prefersReducedMotion || lowPerf) return;
  const stage = document.getElementById('mobius-stage');
  if(!stage) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  const gl = canvas.getContext('webgl2', { antialias:true, premultipliedAlpha:false });
  if(!gl){ stage.removeChild(canvas); return; }

  const VERT = `#version 300 es
in vec3 a_pos;
uniform mat4 u_view;
uniform mat4 u_proj;
uniform float u_size;
uniform float u_dpr;
out float v_depth;
void main(){
  vec4 mv = u_view * vec4(a_pos, 1.0);
  gl_Position = u_proj * mv;
  gl_PointSize = u_size * u_dpr * (5.0 / max(0.1, -mv.z));
  v_depth = -mv.z;
}`;

  const FRAG = `#version 300 es
precision highp float;
in float v_depth;
uniform vec3 u_color;
out vec4 fragColor;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float dist = length(d);
  if(dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.05, dist);
  // hafif derinlik solması, çok loşlaştırmasın
  float fog = clamp(1.0 - (v_depth - 1.8) * 0.10, 0.7, 1.0);
  fragColor = vec4(u_color * fog, alpha);
}`;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.warn('mobius shader:', gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if(!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.warn('mobius link:', gl.getProgramInfoLog(prog)); return;
  }
  gl.useProgram(prog);

  // Möbius parametric surface — u in [0, 2π], v in [-0.4, 0.4]
  // x = (1 + (v/2) cos(u/2)) cos(u)
  // y = (v/2) sin(u/2)
  // z = (1 + (v/2) cos(u/2)) sin(u)
  const N_U = 260, N_V = 26;
  const positions = new Float32Array(N_U * N_V * 3);
  let idx = 0;
  for(let i = 0; i < N_U; i++){
    const u = (i / N_U) * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u);
    const ch = Math.cos(u / 2), sh = Math.sin(u / 2);
    for(let j = 0; j < N_V; j++){
      const v = (j / (N_V - 1) - 0.5) * 0.8;
      const r = 1 + v * ch * 0.5;
      positions[idx++] = r * cu;
      positions[idx++] = v * sh * 0.5;
      positions[idx++] = r * su;
    }
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

  const uView  = gl.getUniformLocation(prog, 'u_view');
  const uProj  = gl.getUniformLocation(prog, 'u_proj');
  const uSize  = gl.getUniformLocation(prog, 'u_size');
  const uDpr   = gl.getUniformLocation(prog, 'u_dpr');
  const uColor = gl.getUniformLocation(prog, 'u_color');
  gl.uniform1f(uSize, 4.5);
  gl.uniform3f(uColor, 0.85, 0.72, 0.48); // sıcak altın, biraz daha parlak

  // 4×4 matrix helpers (column-major)
  function mul(a, b){
    const r = new Float32Array(16);
    for(let i = 0; i < 4; i++)
      for(let j = 0; j < 4; j++){
        let s = 0;
        for(let k = 0; k < 4; k++) s += a[k*4+i] * b[j*4+k];
        r[j*4+i] = s;
      }
    return r;
  }
  function rotY(a){
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }
  function rotX(a){
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
  }
  function translate(x, y, z){
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
  }
  function perspective(fov, aspect, near, far){
    const f = 1 / Math.tan(fov / 2);
    return new Float32Array([
      f/aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far+near)/(near-far), -1,
      0, 0, (2*far*near)/(near-far), 0
    ]);
  }

  let tgtX = 0.35, tgtY = 0.0;
  let curX = 0.35, curY = 0.0;
  let dragging = false, lastMx = 0, lastMy = 0;

  function onDown(e){
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    lastMx = p.clientX; lastMy = p.clientY;
    if(e.preventDefault) e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - lastMx;
    const dy = p.clientY - lastMy;
    tgtY += dx * 0.007;
    tgtX = Math.max(-1.3, Math.min(1.3, tgtX + dy * 0.007));
    lastMx = p.clientX; lastMy = p.clientY;
    if(e.preventDefault) e.preventDefault();
  }
  function onUp(){ dragging = false; }

  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup',   onUp);
  canvas.addEventListener('touchstart', onDown, { passive:false });
  window.addEventListener('touchmove',  onMove, { passive:false });
  window.addEventListener('touchend',   onUp);

  let w = 0, h = 0, dpr = 1;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    if(!w || !h) return;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uDpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize, { passive:true });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let running = false, rafId = null, pageHidden = false;

  function render(){
    if(!running) return;
    resize();
    if(!w || !h){ rafId = requestAnimationFrame(render); return; }
    gl.clear(gl.COLOR_BUFFER_BIT);

    if(!dragging) tgtY += 0.0028;
    curX += (tgtX - curX) * 0.09;
    curY += (tgtY - curY) * 0.09;

    const aspect = w / h;
    const view = mul(translate(0, 0, -2.6), mul(rotX(curX), rotY(curY)));
    const proj = perspective(Math.PI / 3.4, aspect, 0.1, 100);

    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix4fv(uProj, false, proj);

    gl.drawArrays(gl.POINTS, 0, N_U * N_V);
    rafId = requestAnimationFrame(render);
  }

  function start(){ if(running || pageHidden) return; running = true; rafId = requestAnimationFrame(render); }
  function stop(){ running = false; if(rafId){ cancelAnimationFrame(rafId); rafId = null; } }

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      for(const e of entries){
        if(e.isIntersecting) start(); else stop();
      }
    }, { rootMargin: '80px' });
    io.observe(canvas);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    pageHidden = document.hidden;
    if(pageHidden) stop();
  });
})();
