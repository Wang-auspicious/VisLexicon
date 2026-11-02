import t from"/data/component-code/shared/react.mjs";var ke=t.Activity,Le=t.Children,Z=t.Component,Me=t.Fragment,Ne=t.Profiler,Pe=t.PureComponent,De=t.StrictMode,Ue=t.Suspense,Ie=t.ViewTransition,Oe=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Be=t.__COMPILER_RUNTIME,Fe=t.act,ze=t.addTransitionType,We=t.cache,He=t.cacheSignal,Xe=t.captureOwnerStack,Ve=t.cloneElement,Ge=t.createContext,$e=t.createElement,je=t.createRef,qe=t.forwardRef,Ye=t.isValidElement,Ke=t.lazy,Je=t.memo,Qe=t.startTransition,Ze=t.unstable_useCacheRefresh,et=t.use,tt=t.useActionState,ot=t.useCallback,nt=t.useContext,rt=t.useDebugValue,st=t.useDeferredValue,ee=t.useEffect,at=t.useEffectEvent,it=t.useId,ct=t.useImperativeHandle,ut=t.useInsertionEffect,dt=t.useLayoutEffect,lt=t.useMemo,ft=t.useOptimistic,pt=t.useReducer,A=t.useRef,mt=t.useState,xt=t.useSyncExternalStore,ht=t.useTransition,vt=t.version,T=t;import O from"/data/component-code/shared/react-dom-client.mjs";var te=O.createRoot,Rt=O.hydrateRoot,Tt=O.version;import{clsx as le}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as fe}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function oe(...e){return fe(le(e))}import B from"/data/component-code/shared/react-jsx-runtime.mjs";var ne=B.Fragment,f=B.jsx,b=B.jsxs;var C=12,pe=150,me=16,xe=30,he=7,ve=.25,Ee=70,we=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Re=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uRipples[${C}];
uniform sampler2D uMask;
uniform vec3 uWater;
uniform vec3 uLight;
uniform vec2 uShadow;

const float TAU = 6.28318530718;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// The bright web of light on a pool floor: the edges between drifting
// cells, where the waves focus the sun.
float caustic(vec2 p, float t) {
  vec2 q = p;
  p += 0.34 * vec2(sin(p.y * 1.3 + t * 0.9), cos(p.x * 1.1 - t * 0.7));
  p += 0.12 * vec2(sin(p.y * 3.1 - t), cos(p.x * 2.7 + t * 1.2));
  vec2 n = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = 0.5 + 0.42 * sin(t + TAU * hash(n + g));
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) {
        f2 = f1;
        f1 = d;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  float edge = sqrt(f2) - sqrt(f1);
  // A sharp core and a soft halo, brighter in some patches than others.
  float line = pow(1.0 - smoothstep(0.0, 0.14, edge), 2.0);
  float halo = 1.0 - smoothstep(0.0, 0.32, edge);
  float glint = 0.6 + 0.4 * sin(q.x * 0.55 + t * 0.6) * cos(q.y * 0.45 - t * 0.5);
  return (line * 0.85 + halo * 0.18) * glint;
}

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec2 bend = vec2(0.0);
  float focus = 0.0;
  for (int k = 0; k < ${C}; k++) {
    vec4 r = uRipples[k];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 4.0) {
      continue;
    }
    vec2 d = px - r.xy;
    float dist = length(d);
    float x = dist - age * 240.0;
    float env = r.w * exp(-age * 0.8) * exp(-x * x / 2600.0) / (1.0 + dist * 0.002);
    bend += (d / max(dist, 1.0)) * sin(x * 0.085) * env * 26.0;
    focus += cos(x * 0.085) * env;
  }
  vec2 uv = (px + bend) / ${pe}.0;
  float t = uTime * 0.5;
  float c = caustic(uv, t);
  // A fainter, finer web drifting under the first gives the floor depth.
  c = max(c, caustic(uv * 1.9 + 7.3, t * 0.8 + 3.0) * 0.22);
  // A ring's crest focuses light like a lens and its trough spreads it, so
  // each ring shows as a bright band with a dim one beside it.
  c = clamp(c * (1.0 + focus * 1.2) + focus * 0.4, 0.0, 1.0);

  // Whatever floats on the surface blocks the light under it. The water
  // bends the shadow the same way it bends the light.
  vec2 sway = vec2(sin(uTime * 0.7), cos(uTime * 0.55)) * 2.5;
  vec2 s = (px - uShadow - bend * 1.4 - sway) / uRes;
  float shade = texture(uMask, s).r;

  vec3 floor = uWater * (1.0 - shade * 0.08);
  vec3 col = mix(floor, uLight, c * (1.0 - shade * 0.9));
  o = vec4(col, 1.0);
}`;function re(e,n,a){let o=e.createShader(n);return o?(e.shaderSource(o,a),e.compileShader(o),e.getShaderParameter(o,e.COMPILE_STATUS)?o:(e.deleteShader(o),null)):null}function se(e,n){n.clearRect(0,0,1,1),n.fillStyle=e,n.fillRect(0,0,1,1);let[a,o,c]=n.getImageData(0,0,1,1).data;return[a/255,o/255,c/255]}function Te(e){let n=re(e,e.VERTEX_SHADER,we),a=re(e,e.FRAGMENT_SHADER,Re),o=e.createProgram();if(!(n&&a&&o)||(e.attachShader(o,n),e.attachShader(o,a),e.bindAttribLocation(o,0,"aPos"),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS)))return null;let c=s=>e.getUniformLocation(o,s),d={res:c("uRes"),time:c("uTime"),ripples:c("uRipples"),mask:c("uMask"),water:c("uWater"),light:c("uLight"),shadow:c("uShadow")},v=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,v),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let x=e.createTexture();return e.bindTexture(e.TEXTURE_2D,x),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.R8,1,1,0,e.RED,e.UNSIGNED_BYTE,new Uint8Array([0])),e.useProgram(o),e.uniform1i(d.mask,0),e.uniform2f(d.shadow,me,xe),{resize:(s,r,l,E)=>{e.viewport(0,0,s,r),e.uniform2f(d.res,l,E)},setMask:s=>{e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,x),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,s)},setColors:(s,r)=>{e.uniform3f(d.water,s[0],s[1],s[2]),e.uniform3f(d.light,r[0],r[1],r[2])},setRipples:s=>{e.uniform4fv(d.ripples,s)},draw:s=>{e.uniform1f(d.time,s),e.drawArrays(e.TRIANGLE_STRIP,0,4)},destroy:()=>{e.deleteTexture(x),e.deleteBuffer(v),e.deleteProgram(o),e.deleteShader(n),e.deleteShader(a)}}}function be(e,n){let a=n.getBoundingClientRect();e.width=Math.max(1,Math.round(a.width)),e.height=Math.max(1,Math.round(a.height));let o=e.getContext("2d");if(o){o.fillStyle="black",o.fillRect(0,0,e.width,e.height),o.filter=`blur(${he}px)`,o.fillStyle="white";for(let c of n.querySelectorAll("[data-shadow]")){let d=c.getBoundingClientRect(),v=d.left-a.left,x=d.top-a.top;if(c.dataset.shadow==="text"){let s=getComputedStyle(c);o.font=`${s.fontWeight} ${s.fontSize} ${s.fontFamily}`,o.letterSpacing=s.letterSpacing,o.textBaseline="alphabetic";let r=c.textContent??"",l=o.measureText(r),E=x+(d.height+l.fontBoundingBoxAscent-l.fontBoundingBoxDescent)/2;o.fillText(r,v,E)}else{let s=Number.parseFloat(getComputedStyle(c).borderRadius)||0;o.beginPath(),o.roundRect(v,x,d.width,d.height,s),o.fill()}}}}function F({title:e="Swim before work.",children:n,interactive:a=!0,className:o}){let c=A(null),d=A(null),v=A(null),x=A(null);ee(()=>{let r=c.current,l=d.current,E=l?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1}),L=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),p=E?Te(E):null;if(!(r&&l&&L&&p))return;let w=window.matchMedia("(prefers-reduced-motion: reduce)").matches,W=document.createElement("canvas"),M=new Float32Array(C*4),ie=performance.now(),g=()=>(performance.now()-ie)/1e3,N=0,R=0,y=!0,H="",S=0,_=0,m={x:0,y:0,t:0,wake:0},P=(u,i,h)=>{M.set([u,i,g(),h],N*4),N=(N+1)%C,p.setRipples(M)},X=()=>{let u=getComputedStyle(v.current).color,i=getComputedStyle(x.current).color,h=`${u}|${i}`;return h===H?!1:(H=h,p.setColors(se(u,L),se(i,L)),!0)},D=()=>{let u=r.getBoundingClientRect();if(S=u.width,_=u.height,S<2||_<2)return;let i=Math.min(window.devicePixelRatio||1,1.5);l.width=Math.round(S*i),l.height=Math.round(_*i),p.resize(l.width,l.height,S,_),be(W,r),p.setMask(W),p.draw(w?8:g())},V=()=>{R=0,y&&(p.draw(g()),R=requestAnimationFrame(V))},U=()=>{!R&&y&&!w&&(R=requestAnimationFrame(V))};X(),p.setRipples(M),D(),l.style.opacity="1",U();let ce=window.setTimeout(()=>{!w&&a&&P(S*.68,_*.3,1.1)},500);document.fonts?.ready.then(()=>{c.current&&D()});let G=new ResizeObserver(()=>D());G.observe(r);let I=!0,$=new IntersectionObserver(([u])=>{I=u.isIntersecting,y=I&&document.visibilityState==="visible",U()});$.observe(r);let j=()=>{y=I&&document.visibilityState==="visible",U()};document.addEventListener("visibilitychange",j);let ue=window.setInterval(()=>{y&&X()&&(w||!R)&&p.draw(w?8:g())},500),q=u=>{let i=r.getBoundingClientRect();return{x:u.clientX-i.left,y:u.clientY-i.top}},Y=u=>{let i=q(u),h=u.timeStamp,de=Math.max(1,h-m.t),Q=Math.hypot(i.x-m.x,i.y-m.y)/de;m.t&&Q>ve&&h-m.wake>Ee&&(P(i.x,i.y,Math.min(.45,Q*.25)),m.wake=h),m.x=i.x,m.y=i.y,m.t=h},K=()=>{m.t=0},J=u=>{if(u.target.closest("a, button, input, textarea"))return;let i=q(u);P(i.x,i.y,1.4)};return a&&!w&&(r.addEventListener("pointermove",Y),r.addEventListener("pointerleave",K),r.addEventListener("pointerdown",J)),()=>{cancelAnimationFrame(R),window.clearTimeout(ce),window.clearInterval(ue),G.disconnect(),$.disconnect(),document.removeEventListener("visibilitychange",j),r.removeEventListener("pointermove",Y),r.removeEventListener("pointerleave",K),r.removeEventListener("pointerdown",J),p.destroy()}},[a]);let s=e.split(" ");return b("div",{className:oe("relative min-h-[560px] w-full touch-pan-y overflow-hidden bg-[#cde5e4] text-zinc-900 dark:bg-[#06201f] dark:text-zinc-50",o),ref:c,children:[f("span",{className:"hidden text-[#cde5e4] dark:text-[#06201f]",ref:v}),f("span",{className:"hidden text-white dark:text-[#3ea89d]",ref:x}),f("div",{"aria-hidden":"true",className:"pointer-events-none absolute inset-0",children:f("canvas",{className:"h-full w-full opacity-0 transition-opacity duration-700 ease-out",ref:d})}),b("div",{className:"relative flex min-h-[560px] flex-col items-center justify-center gap-6 px-6 py-16 text-center",children:[f("h2",{className:"max-w-3xl text-balance font-semibold text-5xl tracking-[-0.045em] sm:text-7xl",children:s.map((r,l)=>b("span",{children:[f("span",{"data-shadow":"text",children:r}),l<s.length-1?" ":null]},`${r}-${l.toString()}`))}),n===void 0?f(ye,{}):n]})]})}function ye(){return b(ne,{children:[f("p",{className:"max-w-md text-balance text-base text-zinc-600 leading-relaxed dark:text-zinc-300",children:"Book a lane at any of 40 city pools. Lanes open at 6am, and the first swim is on us."}),b("div",{className:"flex items-center gap-2",children:[f("a",{className:"inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 font-medium text-sm text-white transition-colors duration-150 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200","data-shadow":"box",href:"#book",children:"Book a lane"}),f("a",{className:"inline-flex h-10 items-center rounded-full px-4 font-medium text-sm text-zinc-700 transition-colors duration-150 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-zinc-50",href:"#pools",children:"Find a pool"})]})]})}var _e=F,z=class extends Z{state={error:null};static getDerivedStateFromError(n){return window.__previewError=String(n),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(n)}}render(){return this.state.error?T.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function Ae({children:e}){return T.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),e}var k={title:"Swim before work.",interactive:!0},ge=te(document.getElementById("root"));function ae(){window.__previewValues=k,ge.render(T.createElement(z,{key:JSON.stringify(k)},T.createElement(Ae,null,T.createElement(_e,k))))}ae();addEventListener("message",e=>{if(e.source!==parent||e.data?.type!=="vislexicon:props")return;let n=e.data.values;if(!(!n||typeof n!="object")){for(let a of["title","interactive"])Object.hasOwn(n,a)&&["string","number","boolean"].includes(typeof n[a])&&(k[a]=n[a]);ae()}});window.__previewMounted=!0;
/**
 * @author: @dorianbaffier
 * @description: Caustics Background
 * @version: 1.0.0
 * @date: 2026-10-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */
