import t from"/data/component-code/shared/react.mjs";var Be=t.Activity,We=t.Children,ue=t.Component,He=t.Fragment,Ve=t.Profiler,Ye=t.PureComponent,je=t.StrictMode,qe=t.Suspense,Ke=t.ViewTransition,Je=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,$e=t.__COMPILER_RUNTIME,Qe=t.act,Ze=t.addTransitionType,et=t.cache,tt=t.cacheSignal,nt=t.captureOwnerStack,rt=t.cloneElement,ot=t.createContext,at=t.createElement,st=t.createRef,it=t.forwardRef,ct=t.isValidElement,ut=t.lazy,dt=t.memo,mt=t.startTransition,lt=t.unstable_useCacheRefresh,ft=t.use,pt=t.useActionState,ht=t.useCallback,xt=t.useContext,vt=t.useDebugValue,Et=t.useDeferredValue,de=t.useEffect,Tt=t.useEffectEvent,Rt=t.useId,bt=t.useImperativeHandle,wt=t.useInsertionEffect,yt=t.useLayoutEffect,_t=t.useMemo,St=t.useOptimistic,Mt=t.useReducer,g=t.useRef,Ct=t.useState,At=t.useSyncExternalStore,Dt=t.useTransition,It=t.version,D=t;import V from"/data/component-code/shared/react-dom-client.mjs";var me=V.createRoot,Nt=V.hydrateRoot,Ut=V.version;import{clsx as be}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as we}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function le(...e){return we(be(e))}import Y from"/data/component-code/shared/react-jsx-runtime.mjs";var fe=Y.Fragment,M=Y.jsx,U=Y.jsxs;var ye="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1800&q=80&auto=format&fit=crop",I=.75,w=.5,_e=140,ve=7.5,Se=9,Me=.25,Ce=.6,pe=64,Ae=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,De=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uScene;
uniform sampler2D uWater;
uniform sampler2D uClear;
uniform vec4 uCover;
uniform vec2 uRes;
uniform vec3 uFog;
uniform float uFogAmount;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Fine mist on the pane, one droplet per small cell, drawn here so it stays
// sharp at any size.
float mist(vec2 px, out vec2 normal) {
  vec2 cell = floor(px / 7.0);
  if (hash(cell + 7.7).x > 0.55) {
    normal = vec2(0.0);
    return 0.0;
  }
  vec2 h = hash(cell);
  vec2 center = (cell + 0.2 + 0.6 * h) * 7.0;
  float r = 0.6 + 1.7 * pow(hash(cell + 3.1).x, 3.0);
  vec2 d = (px - center) / r;
  normal = d;
  return sqrt(max(0.0, 1.0 - dot(d, d)));
}

vec3 scene(vec2 uv, float lod) {
  return textureLod(uScene, uv * uCover.xy + uCover.zw, lod).rgb;
}

float shine(vec2 n, float thick) {
  vec3 l = normalize(vec3(-0.45, 0.55, 0.7));
  return pow(max(dot(normalize(vec3(n.x, -n.y, thick + 0.15)), l), 0.0), 36.0);
}

void main() {
  vec2 uv = vUv;
  vec4 w = texture(uWater, uv);
  vec2 n = w.rg * 2.0 - 1.0;
  float thick = w.b;
  float clear = texture(uClear, uv).r;

  // Fogged glass: the view goes soft and pale. Wiped glass is clear.
  vec3 soft = mix(scene(uv, 5.0), uFog, uFogAmount);
  vec3 glass = mix(soft, scene(uv, 0.6), clear);

  // A drop is a tiny lens: it shows the view sharp and upside down.
  vec2 aspect = vec2(uRes.y / uRes.x, 1.0);
  vec2 bent = uv + vec2(-n.x, n.y) * aspect * 0.07 * (0.5 + thick);
  vec3 drop = mix(scene(bent, 0.4), soft, 0.18);
  drop *= mix(0.8, 1.05, smoothstep(0.0, 0.6, thick));
  drop += shine(n, thick) * 0.55;
  float a = smoothstep(0.02, 0.18, thick);
  vec3 col = mix(glass, drop, a);

  // Fine mist: beads too small to show the view, they just catch light.
  // Wiping takes them off, and they come back with the fog.
  vec2 mn;
  float m = mist(vec2(uv.x, 1.0 - uv.y) * uRes, mn) * (1.0 - clear);
  vec3 bead = mix(glass, scene(uv - mn * 0.004, 1.0), 0.5);
  bead = bead * mix(0.92, 1.06, m) + shine(mn, m) * 0.35;
  col = mix(col, bead, smoothstep(0.05, 0.4, m) * (1.0 - a) * 0.75);

  o = vec4(col, 1.0);
}`;function he(e,r,a){let o=e.createShader(r);return o?(e.shaderSource(o,a),e.compileShader(o),e.getShaderParameter(o,e.COMPILE_STATUS)?o:(e.deleteShader(o),null)):null}function Ie(e,r){r.clearRect(0,0,1,1),r.fillStyle=e,r.fillRect(0,0,1,1);let[a,o,i]=r.getImageData(0,0,1,1).data;return[a/255,o/255,i/255]}function Le(){let r=document.createElement("canvas");r.width=64,r.height=64;let a=r.getContext("2d");if(!a)return r;let o=a.createImageData(64,64);for(let i=0;i<64;i++)for(let n=0;n<64;n++){let f=(n+.5)/64*2-1,h=(i+.5)/64*2-1,y=Math.hypot(f,h),u=(i*64+n)*4,x=Math.min(1,Math.max(0,(1-y)/.12));o.data[u]=128+f*127,o.data[u+1]=128+h*127,o.data[u+2]=Math.sqrt(Math.max(0,1-y*y))*255,o.data[u+3]=x*255}return a.putImageData(o,0,0),r}function j(e,r){let a=e.createTexture();return e.activeTexture(e.TEXTURE0+r),e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([128,128,0,255])),a}function Pe(e){let r=he(e,e.VERTEX_SHADER,Ae),a=he(e,e.FRAGMENT_SHADER,De),o=e.createProgram();if(!(r&&a&&o)||(e.attachShader(o,r),e.attachShader(o,a),e.bindAttribLocation(o,0,"aPos"),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS)))return null;let i=d=>e.getUniformLocation(o,d),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0);let f=j(e,0),h=j(e,1),y=j(e,2),u=1;e.useProgram(o),e.uniform1i(i("uScene"),0),e.uniform1i(i("uWater"),1),e.uniform1i(i("uClear"),2),e.uniform4f(i("uCover"),1,1,0,0);let x=(d,v)=>{let m=d/v/u,_=m>1?1:m,R=m>1?1/m:1;e.uniform4f(i("uCover"),_,R,.5-_/2,.5-R/2)};return{resize:(d,v,m,_)=>{e.viewport(0,0,d,v),e.uniform2f(i("uRes"),m,_)},setScene:(d,v,m)=>{u=d.naturalWidth/d.naturalHeight,e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,f),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,d),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),x(v,m)},setCover:x,setFog:(d,v)=>{e.uniform3f(i("uFog"),d[0],d[1],d[2]),e.uniform1f(i("uFogAmount"),v)},upload:(d,v)=>{e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,h),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,d),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,y),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,v)},draw:()=>{e.drawArrays(e.TRIANGLE_STRIP,0,4)},destroy:()=>{e.deleteTexture(f),e.deleteTexture(h),e.deleteTexture(y),e.deleteBuffer(n),e.deleteProgram(o),e.deleteShader(r),e.deleteShader(a)}}}function xe(e,r){return{x:Math.random()*e,y:Math.random()*r*.95,r:2.5+Math.random()**2*6,vy:0,drift:(Math.random()-.5)*.6,trail:0}}function Ne(e,r){for(let a of r){if(a===e||a.r<=0)continue;let o=(e.r+a.r)*.8;Math.abs(a.x-e.x)<o&&Math.abs(a.y-e.y)<o&&Math.hypot(a.x-e.x,a.y-e.y)<o&&(e.r=Math.min(16,Math.hypot(e.r,a.r*.9)),a.r=0)}}function Ue(e,r,a,o){let i=[];for(let n of e){if(n.r<ve)continue;let f=140+n.r*22;n.vy+=(f-n.vy)*Math.min(1,r*(Math.random()<.06?.4:3));let h=n.vy*r;n.y+=h,n.x+=n.drift*h*.25+(Math.random()-.5)*.4,n.trail+=h,o.beginPath(),o.arc(n.x*w,n.y*w,n.r*.7*w,0,7),o.fill(),n.trail>n.r*3&&(n.trail=-Math.random()*n.r*4,n.r*=.985,i.push({x:n.x+(Math.random()-.5)*2,y:n.y-n.r*1.2,r:n.r*(.14+Math.random()*.14),vy:0,drift:0,trail:0})),Ne(n,e),n.y-n.r>a&&(n.r=0)}return i}function Fe(e,r,a,o,i){e.setTransform(1,0,0,1,0,0),e.fillStyle="rgb(128, 128, 0)",e.fillRect(0,0,o*I,i*I),e.setTransform(I,0,0,I,0,0);for(let n of r){let f=n.vy>20?1.25:1;e.drawImage(a,n.x-n.r,n.y-n.r*f,n.r*2,n.r*2*f)}}function q({src:e=ye,title:r="Stay in when it rains.",children:a,rain:o=.6,interactive:i=!0,className:n}){let f=g(null),h=g(null),y=g(null);return de(()=>{let u=f.current,x=h.current,d=x?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1}),v=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),m=d?Pe(d):null,_=document.createElement("canvas"),R=document.createElement("canvas"),J=_.getContext("2d"),l=R.getContext("2d");if(!(u&&x&&v&&m&&J&&l))return;let F=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Te=Le(),E=[],T=0,p=0,L=0,O=0,P=!0,X=0,z=0,$="",S={down:!1,x:0,y:0},Q=()=>{let s=getComputedStyle(y.current).color;return s===$?!1:($=s,m.setFog(Ie(s,v),Ce),!0)},N=()=>{Fe(J,E,Te,T,p),m.upload(_,R),m.draw()},Z=()=>{let s=u.getBoundingClientRect(),c=Math.abs(s.width-T)>1||Math.abs(s.height-p)>1;if(T=s.width,p=s.height,T<2||p<2)return;let A=Math.min(window.devicePixelRatio||1,1.5);if(x.width=Math.round(T*A),x.height=Math.round(p*A),m.resize(x.width,x.height,T,p),m.setCover(T,p),_.width=Math.round(T*I),_.height=Math.round(p*I),R.width=Math.round(T*w),R.height=Math.round(p*w),l.fillStyle="black",l.fillRect(0,0,R.width,R.height),c||E.length===0){E=[];let b=Math.round(20+o*40);for(let ce=0;ce<b;ce++){let H=xe(T,p);H.r=Math.min(H.r,ve-.5),E.push(H)}}N()},ee=s=>{if(L=0,!P)return;let c=Math.min((s-(O||s-16))/1e3,1/20);for(O=s,X+=c*(4+o*22);X>1;)if(X-=1,E.length<_e)E.push(xe(T,p));else{let b=E[Math.floor(Math.random()*E.length)];b.r=Math.min(14,b.r+1.2)}let A=Ue(E,c,p,l);E=E.filter(b=>b.r>.6).concat(A),z+=c,z>Me&&(l.fillStyle=`rgba(0, 0, 0, ${z/Se*2.4})`,l.fillRect(0,0,R.width,R.height),l.fillStyle="white",z=0),N(),L=requestAnimationFrame(ee)},B=()=>{!L&&P&&!F&&(O=0,L=requestAnimationFrame(ee))};Q(),Z(),x.style.opacity="1",B();let C=new Image;C.crossOrigin="anonymous",C.decoding="async",C.onload=()=>{m.setScene(C,T,p),u.dataset.loaded="true",F&&N()},C.src=e;let te=new ResizeObserver(()=>Z());te.observe(u);let W=!0,ne=new IntersectionObserver(([s])=>{W=s.isIntersecting,P=W&&document.visibilityState==="visible",B()});ne.observe(u);let re=()=>{P=W&&document.visibilityState==="visible",B()};document.addEventListener("visibilitychange",re);let Re=window.setInterval(()=>{P&&Q()&&F&&N()},500),oe=s=>{let c=u.getBoundingClientRect();return{x:s.clientX-c.left,y:s.clientY-c.top}},ae=(s,c)=>{l.strokeStyle="white",l.lineCap="round",l.lineWidth=pe*w,l.filter="blur(3px)",l.beginPath(),l.moveTo(S.x*w,S.y*w),l.lineTo(s*w,c*w),l.stroke(),l.filter="none";let A=pe/2;for(let b of E)Math.hypot(b.x-s,b.y-c)<A+b.r*.5&&(b.r=0);S.x=s,S.y=c,F&&N()},se=s=>{if(s.target.closest("a, button, input, textarea"))return;let c=oe(s);S.down=!0,S.x=c.x,S.y=c.y,ae(c.x,c.y)},ie=s=>{if(S.down){let c=oe(s);ae(c.x,c.y)}},k=()=>{S.down=!1};return i&&(u.addEventListener("pointerdown",se),u.addEventListener("pointermove",ie),window.addEventListener("pointerup",k),window.addEventListener("pointercancel",k)),()=>{cancelAnimationFrame(L),C.onload=null,window.clearInterval(Re),te.disconnect(),ne.disconnect(),document.removeEventListener("visibilitychange",re),u.removeEventListener("pointerdown",se),u.removeEventListener("pointermove",ie),window.removeEventListener("pointerup",k),window.removeEventListener("pointercancel",k),m.destroy()}},[e,o,i]),U("div",{className:le("relative min-h-[560px] w-full touch-pan-y select-none overflow-hidden bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",n),ref:f,children:[M("span",{className:"hidden text-[#e9edef] dark:text-[#14181b]",ref:y}),M("div",{"aria-hidden":"true",className:"pointer-events-none absolute inset-0",children:M("canvas",{className:"h-full w-full opacity-0 transition-opacity duration-700 ease-out",ref:h})}),U("div",{className:"relative flex min-h-[560px] flex-col items-center justify-center gap-6 px-6 py-16 text-center",children:[M("h2",{className:"max-w-3xl text-balance font-semibold text-5xl tracking-[-0.045em] sm:text-7xl",children:r}),a===void 0?M(ze,{}):a]})]})}function ze(){return U(fe,{children:[M("p",{className:"max-w-md text-balance text-base text-zinc-700 leading-relaxed dark:text-zinc-300",children:"Cabins two hours from the city, with a wood stove, a deep bath and no signal. Wipe the glass to look outside."}),U("div",{className:"flex items-center gap-2",children:[M("a",{className:"inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 font-medium text-sm text-white transition-colors duration-150 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",href:"#book",children:"Find a weekend"}),M("a",{className:"inline-flex h-10 items-center rounded-full px-4 font-medium text-sm text-zinc-700 transition-colors duration-150 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-zinc-50",href:"#cabins",children:"See the cabins"})]})]})}var ge=q,K=class extends ue{state={error:null};static getDerivedStateFromError(r){return window.__previewError=String(r),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(r)}}render(){return this.state.error?D.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function Ge({children:e}){return D.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),e}var G={title:"Stay in when it rains.",rain:.6,interactive:!0},Oe=me(document.getElementById("root"));function Ee(){window.__previewValues=G,Oe.render(D.createElement(K,{key:JSON.stringify(G)},D.createElement(Ge,null,D.createElement(ge,G))))}Ee();addEventListener("message",e=>{if(e.source!==parent||e.data?.type!=="vislexicon:props")return;let r=e.data.values;if(!(!r||typeof r!="object")){for(let a of["title","rain","interactive"])Object.hasOwn(r,a)&&["string","number","boolean"].includes(typeof r[a])&&(G[a]=r[a]);Ee()}});window.__previewMounted=!0;
/**
 * @author: @dorianbaffier
 * @description: Rain Glass Background
 * @version: 1.0.0
 * @date: 2026-10-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */
