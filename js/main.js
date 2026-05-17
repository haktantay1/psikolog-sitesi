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
  document.querySelectorAll('a,button,.svc,.pillar,.mem-card,.ti,.pub-card,.ji').forEach(el => {
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

/* ── COUNTERS ─────────────────────────────── */
const cobs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const target = +e.target.dataset.count;
    let cur=0; const step=target/48;
    const id=setInterval(()=>{
      cur+=step; if(cur>=target){cur=target;clearInterval(id);}
      e.target.textContent=Math.floor(cur)+'+';
    },28);
    cobs.unobserve(e.target);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cobs.observe(el));

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

/* ── WATER RIPPLE — about photo ───────────── */
(function initRipple(){
  if(prefersReducedMotion) return;
  const canvas = document.getElementById('ripple-canvas');
  if(!canvas) return;

  const gl = canvas.getContext('webgl') ||
             canvas.getContext('experimental-webgl');
  if(!gl){ console.warn('WebGL1 not supported for ripple'); return; }

  /* ── shaders (ported from WaterRippleImage component) ── */
  const VS = `
    precision mediump float;
    varying vec2 vUv;
    attribute vec2 a_position;
    void main(){
      vUv = .5 * (a_position + 1.);
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

  const FS = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D u_image_texture;
    uniform float u_time;
    uniform float u_ratio;
    uniform float u_img_ratio;
    uniform float u_blueish;
    uniform float u_scale;
    uniform float u_illumination;
    uniform float u_surface_distortion;
    uniform float u_water_distortion;

    #define TWO_PI 6.28318530718

    vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
    vec2 mod289(vec2 x){ return x - floor(x*(1./289.))*289.; }
    vec3 permute(vec3 x){ return mod289(((x*34.)+1.)*x); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i = floor(v + dot(v,C.yy));
      vec2 x0 = v - i + dot(i,C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.,i1.y,1.)) + i.x + vec3(0.,i1.x,1.));
      vec3 m = max(0.5 - vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
      m = m*m; m = m*m;
      vec3 x = 2.*fract(p*C.www) - 1.;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x+0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
      vec3 g;
      g.x  = a0.x *x0.x  + h.x *x0.y;
      g.yz = a0.yz*x12.xz + h.yz*x12.yw;
      return 130. * dot(m,g);
    }

    mat2 rotate2D(float r){ return mat2(cos(r),sin(r),-sin(r),cos(r)); }

    float surface_noise(vec2 uv, float t, float scale){
      vec2 n=vec2(.1), N=vec2(.1);
      mat2 m = rotate2D(.5);
      for(int j=0; j<10; j++){
        uv*=m; n*=m;
        vec2 q = uv*scale + float(j) + n + (.5+.5*float(j))*(mod(float(j),2.)-1.)*t;
        n += sin(q);
        N += cos(q)/scale;
        scale *= 1.2;
      }
      return (N.x+N.y+.1);
    }

    void main(){
      vec2 uv = vUv;
      uv.y = 1. - uv.y;
      uv.x *= u_ratio;

      float t = .002 * u_time;
      vec3 color = vec3(0.);
      float opacity = 0.;

      float outer_noise = snoise((.3+.1*sin(t))*uv + vec2(0.,.2*t));
      vec2 surface_noise_uv = 2.*uv + (outer_noise*.2);

      float surf = surface_noise(surface_noise_uv, t, u_scale);
      surf *= pow(uv.y, .3);
      surf  = pow(surf, 2.);

      vec2 img_uv = vUv;
      img_uv -= .5;
      if(u_ratio > u_img_ratio){
        img_uv.x = img_uv.x * u_ratio / u_img_ratio;
      } else {
        img_uv.y = img_uv.y * u_img_ratio / u_ratio;
      }
      img_uv *= 1.4;
      img_uv += .5;
      img_uv.y = 1. - img_uv.y;

      img_uv += (u_water_distortion * outer_noise);
      img_uv += (u_surface_distortion * surf);

      vec4 img = texture2D(u_image_texture, img_uv);
      img *= (1. + u_illumination * surf);

      color += img.rgb;
      color += u_illumination * vec3(1.-u_blueish, 1., 1.) * surf;
      opacity += img.a;

      float ew = .02;
      float ea = smoothstep(0.,ew,img_uv.x)*smoothstep(1.,1.-ew,img_uv.x);
      ea *= smoothstep(0.,ew,img_uv.y)*smoothstep(1.,1.-ew,img_uv.y);
      color *= ea;
      opacity *= ea;

      gl_FragColor = vec4(color, opacity);
    }`;

  function mkSh(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error('Ripple shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }

  const vs = mkSh(gl.VERTEX_SHADER, VS);
  const fs = mkSh(gl.FRAGMENT_SHADER, FS);
  if(!vs||!fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error('Ripple link error:', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  const nU = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for(let i=0; i<nU; i++){
    const info = gl.getActiveUniform(prog, i);
    if(info) U[info.name] = gl.getUniformLocation(prog, info.name);
  }

  /* defaults matching WaterRippleImage props */
  gl.uniform1f(U['u_blueish'],           0.5);
  gl.uniform1f(U['u_scale'],             7.0);
  gl.uniform1f(U['u_illumination'],      0.18);
  gl.uniform1f(U['u_surface_distortion'],0.06);
  gl.uniform1f(U['u_water_distortion'],  0.025);

  /* size the canvas */
  function resize(){
    const w = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    const h = canvas.offsetHeight || Math.round(w * 4 / 3);
    if(!w || !h) return;
    canvas.width  = w;
    canvas.height = h;
    gl.viewport(0,0,w,h);
    gl.uniform1f(U['u_ratio'], w/h);
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  /* load photo into texture */
  const img = new Image();
  img.onload = () => {
    resize();
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(U['u_image_texture'], 0);
    gl.uniform1f(U['u_img_ratio'], img.naturalWidth/img.naturalHeight);
  };
  img.src = 'haktan-tay.jpg';

  /* render loop */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  (function draw(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U['u_time'], performance.now());
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(draw);
  })();
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

/* ── ANIMATED DOCK ────────────────────────── */
(function initDock(){
  const dock=document.getElementById('adock');
  if(!dock) return;
  const items=[...dock.querySelectorAll('.adock-item')];
  dock.addEventListener('mousemove',e=>{
    items.forEach(it=>{
      const r=it.getBoundingClientRect();
      const d=Math.abs(e.clientX-(r.left+r.width/2));
      const s=Math.max(1,1.75-d/65);
      it.style.transform=`scale(${s}) translateY(${-(s-1)*22}px)`;
    });
  });
  dock.addEventListener('mouseleave',()=>items.forEach(it=>it.style.transform=''));
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

/* ── ANIMATED STAT COUNTERS (Component) ───── */
(function initCounters(){
  const els = document.querySelectorAll('.stat-n[data-count]');
  if(!els.length) return;
  function run(el){
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1800;
    const t0 = performance.now();
    (function tick(now){
      const p = Math.min((now-t0)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(eased*target) + (p>=1 ? suffix : '');
      if(p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ run(e.target); io.unobserve(e.target); }
    });
  }, {threshold:0.6});
  els.forEach(el=>io.observe(el));
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

  /* slider */
  const track=document.getElementById('objeta-track');
  if(track){
    const clone=track.cloneNode(true);
    track.parentElement.insertBefore(clone,track.nextSibling);
    let pos=0,paused=false;
    track.parentElement.addEventListener('mouseenter',()=>paused=true);
    track.parentElement.addEventListener('mouseleave',()=>paused=false);
    (function slide(){
      if(!paused){
        pos+=0.35;
        const w=track.offsetWidth;
        if(pos>=w) pos-=w;
        track.style.transform=`translateX(${-pos}px)`;
        clone.style.transform=`translateX(${w-pos}px)`;
      }
      requestAnimationFrame(slide);
    })();
  }
})();

/* ── INFINITE SLIDERS ─────────────────────── */
(function initSliders(){
  document.querySelectorAll('.mq-track').forEach((track, i)=>{
    const reverse = i % 2 === 1;
    const speed = i === 0 ? 0.4 : 0.25;
    let pos = 0;
    let paused = false;
    const wrap = track.parentElement;
    wrap.addEventListener('mouseenter', ()=>paused=true);
    wrap.addEventListener('mouseleave', ()=>paused=false);
    const clone = track.cloneNode(true);
    track.parentElement.insertBefore(clone, track.nextSibling);
    function tick(){
      if(!paused){
        pos += reverse ? -speed : speed;
        const w = track.offsetWidth;
        if(!reverse && pos >= w) pos -= w;
        if(reverse && pos <= -w) pos += w;
        track.style.transform = `translateX(${-pos}px)`;
        clone.style.transform = `translateX(${(reverse ? -w : w) - pos}px)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
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

    // Konu + Tarih + Mesaj — tek mesaj olarak Google Forms'a gönder
    const composed =
      (subject ? `Konu: ${subject}\n` : '') +
      (date    ? `Tercih edilen tarih: ${date}\n` : '') +
      (subject || date ? '\n' : '') +
      message;

    show('Gönderiliyor…', '');
    if(btn) btn.disabled = true;

    const GFORM = 'https://docs.google.com/forms/d/e/1FAIpQLSevkdxVaWHnYinJFRdNLUoLzXkMtbN48IoEOALzF44mUjbFzQ/formResponse';
    const data = new FormData();
    data.append('entry.352433926', name);
    data.append('entry.1721181518', email);
    data.append('entry.643986528', composed);

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
