import n from"/data/component-code/shared/react.mjs";var Xe=n.Activity,We=n.Children,fe=n.Component,He=n.Fragment,$e=n.Profiler,Ye=n.PureComponent,je=n.StrictMode,qe=n.Suspense,Ke=n.ViewTransition,Je=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ge=n.__COMPILER_RUNTIME,Qe=n.act,Ze=n.addTransitionType,et=n.cache,tt=n.cacheSignal,rt=n.captureOwnerStack,nt=n.cloneElement,ot=n.createContext,at=n.createElement,it=n.createRef,st=n.forwardRef,ct=n.isValidElement,ut=n.lazy,ft=n.memo,mt=n.startTransition,dt=n.unstable_useCacheRefresh,lt=n.use,xt=n.useActionState,vt=n.useCallback,pt=n.useContext,Et=n.useDebugValue,Tt=n.useDeferredValue,me=n.useEffect,bt=n.useEffectEvent,Rt=n.useId,yt=n.useImperativeHandle,ht=n.useInsertionEffect,_t=n.useLayoutEffect,wt=n.useMemo,Dt=n.useOptimistic,St=n.useReducer,W=n.useRef,K=n.useState,Lt=n.useSyncExternalStore,Pt=n.useTransition,At=n.version,O=n;import J from"/data/component-code/shared/react-dom-client.mjs";var de=J.createRoot,Mt=J.hydrateRoot,It=J.version;import{clsx as we}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as De}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function g(...e){return De(we(e))}import Q from"/data/component-code/shared/react-jsx-runtime.mjs";var Bt=Q.Fragment,A=Q.jsx,Y=Q.jsxs;var Se=128,be=512,Le=20,Pe=.35,Ae=1.2,Ue=22,le=.06,xe=1200,Ce=5e3,ve=5200,pe=.0018,Ee=.0035,Me=`#version 300 es
in vec2 aPos;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texel;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(texel.x, 0.0);
  vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y);
  vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,C=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 o;
`,Te={splat:`${C}
uniform sampler2D uTarget;
uniform float aspect;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspect;
  vec3 s = exp(-dot(p, p) / radius) * color;
  o = vec4(texture(uTarget, vUv).xyz + s, 1.0);
}`,advect:`${C}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 simTexel;
uniform float dt;
uniform float fade;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * simTexel;
  o = texture(uSource, coord) / (1.0 + fade * dt);
}`,divergence:`${C}
uniform sampler2D uVelocity;
void main() {
  float l = texture(uVelocity, vL).x;
  float r = texture(uVelocity, vR).x;
  float t = texture(uVelocity, vT).y;
  float b = texture(uVelocity, vB).y;
  vec2 c = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { l = -c.x; }
  if (vR.x > 1.0) { r = -c.x; }
  if (vT.y > 1.0) { t = -c.y; }
  if (vB.y < 0.0) { b = -c.y; }
  o = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}`,curl:`${C}
uniform sampler2D uVelocity;
void main() {
  float l = texture(uVelocity, vL).y;
  float r = texture(uVelocity, vR).y;
  float t = texture(uVelocity, vT).x;
  float b = texture(uVelocity, vB).x;
  o = vec4(0.5 * (r - l - t + b), 0.0, 0.0, 1.0);
}`,vorticity:`${C}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main() {
  float l = texture(uCurl, vL).x;
  float r = texture(uCurl, vR).x;
  float t = texture(uCurl, vT).x;
  float b = texture(uCurl, vB).x;
  float c = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  force /= length(force) + 0.0001;
  force *= curl * c;
  force.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + force * dt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,pressure:`${C}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float l = texture(uPressure, vL).x;
  float r = texture(uPressure, vR).x;
  float t = texture(uPressure, vT).x;
  float b = texture(uPressure, vB).x;
  float d = texture(uDivergence, vUv).x;
  o = vec4((l + r + b + t - d) * 0.25, 0.0, 0.0, 1.0);
}`,gradient:`${C}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float l = texture(uPressure, vL).x;
  float r = texture(uPressure, vR).x;
  float t = texture(uPressure, vT).x;
  float b = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(r - l, t - b);
  o = vec4(v, 0.0, 1.0);
}`,scale:`${C}
uniform sampler2D uTarget;
uniform float value;
void main() {
  o = value * texture(uTarget, vUv);
}`,gather:`${C}
uniform sampler2D uDye;
uniform sampler2D uMask;
uniform float rate;
void main() {
  vec4 d = texture(uDye, vUv);
  float m = texture(uMask, vUv).r;
  o = vec4(mix(d.r, m, rate), d.g, 0.0, 1.0);
}`,display:`${C}
uniform sampler2D uDye;
uniform vec3 paper;
uniform vec3 ink;
uniform vec3 accent;
void main() {
  vec4 d = texture(uDye, vUv);
  // A soft knee, so thin washes stay pale and dense ink goes solid.
  float a = smoothstep(0.02, 0.85, d.r);
  float b = smoothstep(0.02, 0.85, d.g);
  vec3 c = mix(paper, ink, a);
  c = mix(c, accent, b * 0.92);
  o = vec4(c, 1.0);
}`};function Re(e,s,m){let l=e.createShader(s);return l?(e.shaderSource(l,m),e.compileShader(l),e.getShaderParameter(l,e.COMPILE_STATUS)?l:(e.deleteShader(l),null)):null}function Ie(e,s,m){let l=Re(e,e.FRAGMENT_SHADER,m),b=e.createProgram();if(!(l&&b)||(e.attachShader(b,s),e.attachShader(b,l),e.bindAttribLocation(b,0,"aPos"),e.linkProgram(b),!e.getProgramParameter(b,e.LINK_STATUS)))return null;let _={},p=e.getProgramParameter(b,e.ACTIVE_UNIFORMS);for(let w=0;w<p;w++){let a=e.getActiveUniform(b,w);a&&(_[a.name]=e.getUniformLocation(b,a.name))}return{program:b,uniforms:_}}function Z(e,s){s.clearRect(0,0,1,1),s.fillStyle=e,s.fillRect(0,0,1,1);let[m,l,b]=s.getImageData(0,0,1,1).data;return[m/255,l/255,b/255]}function Fe(e){if(!e.getExtension("EXT_color_buffer_float"))return null;e.getExtension("OES_texture_float_linear");let s=Re(e,e.VERTEX_SHADER,Me);if(!s)return null;let m={};for(let r of Object.keys(Te)){let i=Ie(e,s,Te[r]);if(!i)return null;m[r]=i}let l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let b=[],_=[],p=(r,i,o,t)=>{let d=e.createTexture();e.bindTexture(e.TEXTURE_2D,d),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,o,r,i,0,t,e.HALF_FLOAT,null);let P=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,P),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,d,0),e.viewport(0,0,r,i),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),b.push(d),_.push(P),{tex:d,fbo:P,w:r,h:i}},w=(r,i,o,t)=>{let d={read:p(r,i,o,t),write:p(r,i,o,t),swap:()=>{let P=d.read;d.read=d.write,d.write=P}};return d},a,E,U,B,G,f=1,L=e.createTexture();e.bindTexture(e.TEXTURE_2D,L),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.R8,1,1,0,e.RED,e.UNSIGNED_BYTE,new Uint8Array([0]));let z=()=>{for(let r of b)e.deleteTexture(r);for(let r of _)e.deleteFramebuffer(r);b.length=0,_.length=0},N=r=>f>=1?[Math.round(r*f),r]:[r,Math.round(r/f)],R=0,y=(r,i)=>{let o=m[r];return e.useProgram(o.program),e.uniform2f(o.uniforms.texel,i[0],i[1]),R=0,o},x=(r,i,o)=>{e.activeTexture(e.TEXTURE0+R),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(r.uniforms[i],R),R++},v=(r,i,o)=>{e.bindFramebuffer(e.FRAMEBUFFER,r?r.fbo:null),e.viewport(0,0,r?r.w:i??1,r?r.h:o??1),e.drawArrays(e.TRIANGLE_STRIP,0,4)},S=[1,1,1],M=[0,0,0],k=[0,0,0],I=1,X=1;return{resize(r,i){I=r,X=i,f=r/i,z();let[o,t]=N(Se),[d,P]=N(be);a=w(o,t,e.RG16F,e.RG),U=w(o,t,e.R16F,e.RED),B=p(o,t,e.R16F,e.RED),G=p(o,t,e.R16F,e.RED),E=w(d,P,e.RGBA16F,e.RGBA)},setMask(r){e.bindTexture(e.TEXTURE_2D,L),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.R8,e.RED,e.UNSIGNED_BYTE,r),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1)},setColors(r,i,o){S=r,M=i,k=o},splat(r,i,o,t,d,P){let H=P*(f>1?f:1),D=y("splat",[1/a.read.w,1/a.read.h]);x(D,"uTarget",a.read.tex),e.uniform1f(D.uniforms.aspect,f),e.uniform2f(D.uniforms.point,r,i),e.uniform3f(D.uniforms.color,o,t,0),e.uniform1f(D.uniforms.radius,H),v(a.write),a.swap(),(d[0]||d[1])&&(D=y("splat",[1/E.read.w,1/E.read.h]),x(D,"uTarget",E.read.tex),e.uniform1f(D.uniforms.aspect,f),e.uniform2f(D.uniforms.point,r,i),e.uniform3f(D.uniforms.color,d[0],d[1],0),e.uniform1f(D.uniforms.radius,H),v(E.write),E.swap())},step(r,i){let o=[1/a.read.w,1/a.read.h],t=y("curl",o);x(t,"uVelocity",a.read.tex),v(G),t=y("vorticity",o),x(t,"uVelocity",a.read.tex),x(t,"uCurl",G.tex),e.uniform1f(t.uniforms.curl,Ue),e.uniform1f(t.uniforms.dt,r),v(a.write),a.swap(),t=y("divergence",o),x(t,"uVelocity",a.read.tex),v(B),t=y("scale",o),x(t,"uTarget",U.read.tex),e.uniform1f(t.uniforms.value,.8),v(U.write),U.swap();for(let d=0;d<Le;d++)t=y("pressure",o),x(t,"uPressure",U.read.tex),x(t,"uDivergence",B.tex),v(U.write),U.swap();t=y("gradient",o),x(t,"uPressure",U.read.tex),x(t,"uVelocity",a.read.tex),v(a.write),a.swap(),t=y("advect",o),x(t,"uVelocity",a.read.tex),x(t,"uSource",a.read.tex),e.uniform2f(t.uniforms.simTexel,o[0],o[1]),e.uniform1f(t.uniforms.dt,r),e.uniform1f(t.uniforms.fade,Ae),v(a.write),a.swap(),t=y("advect",[1/E.read.w,1/E.read.h]),x(t,"uVelocity",a.read.tex),x(t,"uSource",E.read.tex),e.uniform2f(t.uniforms.simTexel,o[0],o[1]),e.uniform1f(t.uniforms.dt,r),e.uniform1f(t.uniforms.fade,Pe),v(E.write),E.swap(),i>0&&(t=y("scale",o),x(t,"uTarget",a.read.tex),e.uniform1f(t.uniforms.value,1-i),v(a.write),a.swap(),t=y("gather",[1/E.read.w,1/E.read.h]),x(t,"uDye",E.read.tex),x(t,"uMask",L),e.uniform1f(t.uniforms.rate,i),v(E.write),E.swap())},draw(){let r=y("display",[1/E.read.w,1/E.read.h]);x(r,"uDye",E.read.tex),e.uniform3fv(r.uniforms.paper,S),e.uniform3fv(r.uniforms.ink,M),e.uniform3fv(r.uniforms.accent,k),v(null,I,X)},destroy(){z(),e.deleteTexture(L),e.deleteBuffer(l);for(let r of Object.values(m))e.deleteProgram(r.program);e.deleteShader(s)}}}function ee(e,s){return{size:Math.max(44,Math.min(e*.13,s*.24,140)),center:s*.4}}function Ne(e,s,m,l,b){let _=be/Math.min(m,l);e.width=Math.round(m*_),e.height=Math.round(l*_);let p=e.getContext("2d");if(!p)return;let{size:w,center:a}=ee(m,l);p.setTransform(_,0,0,_,0,0),p.fillStyle="black",p.fillRect(0,0,m,l),p.font=`650 ${w}px ${b}`,p.letterSpacing=`${-w*.045}px`,p.textAlign="center",p.textBaseline="middle",p.filter=`blur(${Math.max(1,w*.012)}px)`,p.fillStyle="white",p.fillText(s,m/2,a,m-32)}function te({text:e="Write freely.",accent:s,children:m,interactive:l=!0,className:b}){let _=W(null),p=W(null),w=W(null),a=W(null),[E,U]=K(!1),[B,G]=K(null);return me(()=>{let f=_.current,L=p.current,z=L?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,preserveDrawingBuffer:!1}),N=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});if(!(f&&L&&N))return;let R=z?Fe(z):null;if(!R){U(!0);return}let y=window.matchMedia("(prefers-reduced-motion: reduce)").matches,x=document.createElement("canvas"),v=0,S=0,M=0,k=0,I=!0,X="",r=-Number.POSITIVE_INFINITY,i=performance.now(),o=performance.now(),t={x:0,y:0,on:!1,down:!1,moved:0},d=()=>{let c=getComputedStyle(w.current).color,u=getComputedStyle(a.current).color,h=`${c}|${u}|${s}`;if(h===X)return!1;X=h;let T=Z(u,N);return R.setColors(Z(c,N),T,s?Z(s,N):T),!0},P=()=>{let c=f.getBoundingClientRect();if(v=c.width,S=c.height,v<2||S<2)return;let u=Math.min(window.devicePixelRatio||1,2);L.width=Math.round(v*u),L.height=Math.round(S*u),R.resize(L.width,L.height),Ne(x,e,v,S,getComputedStyle(f).fontFamily),R.setMask(x);let{size:h,center:T}=ee(v,S);G(T+h*.62),R.step(1/60,y?1:0),R.draw()},H=()=>{let{size:c,center:u}=ee(v,S),h=1-u/S;for(let T=0;T<9;T++){let F=.2+.6*(T+Math.random()*.6)/9,_e=(Math.random()-.5)*c*.6/S;R.splat(F,h+_e,(Math.random()-.5)*320,(Math.random()-.5)*320,[.45,0],Ee*(.6+Math.random()))}},D=c=>{if(M=0,!I)return;let u=Math.min((c-(k||c-16))/1e3,1/30);k=c,(t.down||t.moved>c-100)&&(i=c);let h=c-r,T=0;h>xe&&(T=le*Math.min(1,(h-xe)/1500));let F=c-o;F<1500&&(T=Math.max(T,.012+F/1500*le)),R.step(u,T),R.draw(),(c-i<Ce||F<4e3)&&(M=requestAnimationFrame(D))},V=()=>{!M&&I&&!y&&(k=0,M=requestAnimationFrame(D))};d(),P(),L.style.opacity="1",y||(H(),V());let ne=new ResizeObserver(()=>{let c=f.getBoundingClientRect();(Math.abs(c.width-v)>1||Math.abs(c.height-S)>1)&&(P(),i=performance.now(),r=-Number.POSITIVE_INFINITY,V())});ne.observe(f);let q=!0,oe=new IntersectionObserver(([c])=>{q=c.isIntersecting,I=q&&document.visibilityState==="visible",V()});oe.observe(f);let ae=()=>{I=q&&document.visibilityState==="visible",V()};document.addEventListener("visibilitychange",ae);let he=window.setInterval(()=>{I&&d()&&!M&&R.draw()},500),ie=c=>{let u=f.getBoundingClientRect();return{x:(c.clientX-u.left)/u.width,y:1-(c.clientY-u.top)/u.height}},se=c=>{let u=ie(c);if(t.on){let h=u.x-t.x,T=u.y-t.y;(h||T)&&(R.splat(u.x,u.y,h*ve,T*ve,t.down?[0,.08]:[0,0],pe),r=performance.now(),t.moved=r)}t.x=u.x,t.y=u.y,t.on=!0,V()},ce=()=>{t.on=!1,t.down=!1},ue=c=>{if(c.target.closest("a, button, input, textarea"))return;let u=ie(c);t.down=!0,t.on=!0,t.x=u.x,t.y=u.y,R.splat(u.x,u.y,0,0,[0,.65],Ee);for(let h=0;h<8;h++){let T=h/8*Math.PI*2,F=.012;R.splat(u.x+Math.cos(T)*F*(S/v),u.y+Math.sin(T)*F,Math.cos(T)*420,Math.sin(T)*420,[0,0],pe*.6)}r=performance.now(),i=r,V()},$=()=>{t.down=!1};return l&&!y&&(f.addEventListener("pointermove",se),f.addEventListener("pointerleave",ce),f.addEventListener("pointerdown",ue),f.addEventListener("pointerup",$),f.addEventListener("pointercancel",$)),()=>{cancelAnimationFrame(M),ne.disconnect(),oe.disconnect(),document.removeEventListener("visibilitychange",ae),window.clearInterval(he),f.removeEventListener("pointermove",se),f.removeEventListener("pointerleave",ce),f.removeEventListener("pointerdown",ue),f.removeEventListener("pointerup",$),f.removeEventListener("pointercancel",$),R.destroy()}},[e,s,l]),Y("div",{className:g("relative min-h-[560px] w-full touch-pan-y overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100",b),ref:_,children:[A("span",{className:"hidden text-white dark:text-zinc-950",ref:w}),A("span",{className:"hidden text-zinc-900 dark:text-zinc-100",ref:a}),A("div",{"aria-hidden":"true",className:"pointer-events-none absolute inset-0",children:A("canvas",{className:"h-full w-full opacity-0 transition-opacity duration-500 ease-out",ref:p})}),A("h2",{className:g(E?"absolute inset-x-0 top-[40%] -translate-y-1/2 text-balance px-6 text-center font-semibold text-5xl tracking-tight sm:text-7xl":"sr-only"),children:e}),A("div",{className:"pointer-events-none absolute inset-x-0 flex justify-center px-6",style:{top:B??"62%"},children:m===void 0?A(ke,{}):m})]})}function ke(){return Y("div",{className:"flex max-w-md flex-col items-center gap-6 text-center",children:[A("p",{className:"text-balance text-base text-zinc-500 leading-relaxed dark:text-zinc-400",children:"A quiet page for first drafts. Nothing to set up, nothing to sync. Stir the ink and it settles back."}),Y("div",{className:"pointer-events-auto flex items-center gap-2",children:[A("a",{className:"inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 font-medium text-sm text-white transition-colors duration-150 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",href:"#start",children:"Start writing"}),A("a",{className:"inline-flex h-10 items-center rounded-full px-4 font-medium text-sm text-zinc-600 transition-colors duration-150 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100",href:"#tour",children:"See how it works"})]})]})}var Oe=te,re=class extends fe{state={error:null};static getDerivedStateFromError(s){return window.__previewError=String(s),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(s)}}render(){return this.state.error?O.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function Be({children:e}){return O.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),e}var j={text:"Write freely.",interactive:!0},Ge=de(document.getElementById("root"));function ye(){window.__previewValues=j,Ge.render(O.createElement(re,{key:JSON.stringify(j)},O.createElement(Be,null,O.createElement(Oe,j))))}ye();addEventListener("message",e=>{if(e.source!==parent||e.data?.type!=="vislexicon:props")return;let s=e.data.values;if(!(!s||typeof s!="object")){for(let m of["text","interactive"])Object.hasOwn(s,m)&&["string","number","boolean"].includes(typeof s[m])&&(j[m]=s[m]);ye()}});window.__previewMounted=!0;
/**
 * @author: @dorianbaffier
 * @description: Ink Background
 * @version: 1.0.0
 * @date: 2026-10-21
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */
