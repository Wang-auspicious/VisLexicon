import t from"/data/component-code/shared/react.mjs";var se=t.Activity,ce=t.Children,U=t.Component,ie=t.Fragment,ae=t.Profiler,ue=t.PureComponent,le=t.StrictMode,pe=t.Suspense,me=t.ViewTransition,fe=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,de=t.__COMPILER_RUNTIME,ve=t.act,xe=t.addTransitionType,_e=t.cache,ge=t.cacheSignal,he=t.captureOwnerStack,be=t.cloneElement,we=t.createContext,ye=t.createElement,Re=t.createRef,Ee=t.forwardRef,Se=t.isValidElement,Ce=t.lazy,D=t.memo,Ae=t.startTransition,Te=t.unstable_useCacheRefresh,Oe=t.use,Le=t.useActionState,z=t.useCallback,Pe=t.useContext,Ne=t.useDebugValue,Ve=t.useDeferredValue,b=t.useEffect,Fe=t.useEffectEvent,Ie=t.useId,Ue=t.useImperativeHandle,De=t.useInsertionEffect,ze=t.useLayoutEffect,Me=t.useMemo,ke=t.useOptimistic,Be=t.useReducer,l=t.useRef,M=t.useState,He=t.useSyncExternalStore,Ge=t.useTransition,je=t.version,v=t;import A from"/data/component-code/shared/react-dom-client.mjs";var k=A.createRoot,Ye=A.hydrateRoot,Je=A.version;import{clsx as J}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as K}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function B(...o){return K(J(o))}import T from"/data/component-code/shared/react-jsx-runtime.mjs";var et=T.Fragment,H=T.jsx,tt=T.jsxs;var X={default:[[.55,.55,.6],[.7,.7,.75],[.4,.4,.45]],blue:[[.2,.5,1],[.4,.7,1],[.1,.3,.8]],violet:[[.6,.3,1],[.8,.5,1],[.4,.15,.8]],emerald:[[.15,.75,.55],[.3,.9,.7],[.1,.55,.4]]},O={idle:{speed:.15,amplitude:.04,glow:.15,brightness:.55,pulse:0,saturation:.7},connecting:{speed:.5,amplitude:.1,glow:.45,brightness:.75,pulse:1,saturation:.9},listening:{speed:.4,amplitude:.14,glow:.5,brightness:.85,pulse:0,saturation:1},speaking:{speed:1.4,amplitude:.35,glow:.9,brightness:1,pulse:0,saturation:1},muted:{speed:.06,amplitude:.015,glow:.08,brightness:.35,pulse:0,saturation:.2}},Q=`#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,Z=`#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_speed;
uniform float u_amplitude;
uniform float u_glow;
uniform float u_brightness;
uniform float u_pulse;
uniform float u_saturation;
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_dpr;

// Simplex-like noise (3D)
vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x / 289.0) * 289.0; }
vec4 permute(vec4 x) { return mod289((x * 34.0 + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  vec3 i = floor(v + dot(v, vec3(C.y)));
  vec3 x0 = v - i + dot(i, vec3(C.x));
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g, l.zxy);
  vec3 i2 = max(g, l.zxy);
  vec3 x1 = x0 - i1 + C.x;
  vec3 x2 = x0 - i2 + C.y;
  vec3 x3 = x0 - 0.5;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  vec4 j = p - 49.0 * floor(p / 49.0);
  vec4 x_ = floor(j / 7.0);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = (x_ * 2.0 + 0.5) / 7.0 - 1.0;
  vec4 y = (y_ * 2.0 + 0.5) / 7.0 - 1.0;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 g0 = vec3(a0.xy, h.x);
  vec3 g1 = vec3(a0.zw, h.y);
  vec3 g2 = vec3(a1.xy, h.z);
  vec3 g3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3)));
  g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3)));
}

void main() {
  vec2 uv = v_uv * 2.0 - 1.0;
  float dist = length(uv);
  float t = u_time * u_speed;

  // Perfect circle \u2014 hard boundary, soft anti-aliased edge
  float radius = 0.44;
  float circle = 1.0 - smoothstep(radius - 0.008, radius + 0.008, dist);

  if (circle < 0.001) {
    // Outer glow only
    float glowDist = dist - radius;
    float glow = exp(-glowDist * 12.0) * u_glow * 0.4;
    vec3 glowColor = mix(u_color0, u_color1, 0.5);
    fragColor = vec4(glowColor * glow, glow);
    return;
  }

  float n1 = snoise(vec3(uv * 2.0, t * 0.6)) * 0.5 + 0.5;
  float n2 = snoise(vec3(uv * 3.5 + 7.0, t * 0.9)) * 0.5 + 0.5;
  float n3 = snoise(vec3(uv * 1.5 - 3.0, t * 0.4 + 10.0)) * 0.5 + 0.5;

  vec2 distort = vec2(
    snoise(vec3(uv * 2.0 + 5.0, t * 0.7)),
    snoise(vec3(uv * 2.0 + 15.0, t * 0.7))
  ) * u_amplitude * 2.0;
  float n4 = snoise(vec3((uv + distort) * 3.0, t * 0.5)) * 0.5 + 0.5;

  vec3 col = mix(u_color0, u_color1, n1);
  col = mix(col, u_color2, n2 * 0.5);
  col = mix(col, u_color1 * 1.3, n4 * 0.4);

  float vein = pow(n3, 3.0) * u_amplitude * 6.0;
  col += vein * mix(u_color1, vec3(1.0), 0.3);

  float centerDist = dist / radius;
  float depthShade = 1.0 - centerDist * centerDist * 0.4;
  col *= depthShade;

  float rim = pow(centerDist, 4.0) * 0.6;
  col += rim * mix(u_color0, vec3(1.0), 0.5);

  vec2 lightPos = vec2(-0.15, -0.18);
  float specDist = length(uv - lightPos);
  float spec = exp(-specDist * specDist * 30.0) * 0.7;
  col += spec * vec3(1.0);

  vec2 lightPos2 = vec2(0.2, 0.25);
  float spec2 = exp(-length(uv - lightPos2) * 8.0) * 0.15;
  col += spec2 * u_color1;

  float pulseFactor = 1.0 + u_pulse * sin(u_time * 3.5) * 0.35;

  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, u_saturation);

  col *= u_brightness * pulseFactor;

  fragColor = vec4(col, circle);
}`;function G(o,e,c){let a=o.createShader(e);return a?(o.shaderSource(a,c),o.compileShader(a),o.getShaderParameter(a,o.COMPILE_STATUS)?a:(o.deleteShader(a),null)):null}function $(o){let e=o.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1,antialias:!0});if(!e)return null;let c=G(e,e.VERTEX_SHADER,Q),a=G(e,e.FRAGMENT_SHADER,Z);if(!c||!a)return null;let r=e.createProgram();if(e.attachShader(r,c),e.attachShader(r,a),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))return null;e.useProgram(r);let _=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,_),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);let u=e.getAttribLocation(r,"a_position");e.enableVertexAttribArray(u),e.vertexAttribPointer(u,2,e.FLOAT,!1,0,0),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA);let g={u_time:e.getUniformLocation(r,"u_time"),u_speed:e.getUniformLocation(r,"u_speed"),u_amplitude:e.getUniformLocation(r,"u_amplitude"),u_glow:e.getUniformLocation(r,"u_glow"),u_brightness:e.getUniformLocation(r,"u_brightness"),u_pulse:e.getUniformLocation(r,"u_pulse"),u_saturation:e.getUniformLocation(r,"u_saturation"),u_color0:e.getUniformLocation(r,"u_color0"),u_color1:e.getUniformLocation(r,"u_color1"),u_color2:e.getUniformLocation(r,"u_color2"),u_dpr:e.getUniformLocation(r,"u_dpr")};return{gl:e,uniforms:g}}function x(o,e,c){return o+(e-o)*c}var L=D(({state:o="idle",volume:e=0,variant:c="default",className:a})=>{let r=l(0);r.current=e;let _=l(null),u=l(null),g=l(0),W=l(performance.now()),q=l({...O.idle}),N=l({...O.idle});b(()=>{N.current={...O[o]}},[o]);let h=X[c],[V,F]=M(!1);b(()=>{let p=requestAnimationFrame(()=>F(!0));return()=>{cancelAnimationFrame(p),F(!1)}},[]);let y=z(()=>{let p=u.current;if(!p)return;let{gl:n,uniforms:i}=p,m=_.current;if(!m)return;let s=q.current,f=N.current,d=.045;s.speed=x(s.speed,f.speed,d),s.amplitude=x(s.amplitude,f.amplitude,d),s.glow=x(s.glow,f.glow,d),s.brightness=x(s.brightness,f.brightness,d),s.pulse=x(s.pulse,f.pulse,d),s.saturation=x(s.saturation,f.saturation,d);let Y=(performance.now()-W.current)/1e3,R=window.devicePixelRatio||1,I=m.getBoundingClientRect(),E=Math.round(I.width*R),S=Math.round(I.height*R);(m.width!==E||m.height!==S)&&(m.width=E,m.height=S),n.viewport(0,0,E,S),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT);let C=r.current;n.uniform1f(i.u_time,Y),n.uniform1f(i.u_speed,s.speed+C*.4),n.uniform1f(i.u_amplitude,s.amplitude+C*.12),n.uniform1f(i.u_glow,s.glow+C*.2),n.uniform1f(i.u_brightness,s.brightness),n.uniform1f(i.u_pulse,s.pulse),n.uniform1f(i.u_saturation,s.saturation),n.uniform3fv(i.u_color0,h[0]),n.uniform3fv(i.u_color1,h[1]),n.uniform3fv(i.u_color2,h[2]),n.uniform1f(i.u_dpr,R),n.drawArrays(n.TRIANGLE_STRIP,0,4),g.current=requestAnimationFrame(y)},[h]);return b(()=>{if(!V)return;let p=_.current;if(p&&(u.current=$(p),!!u.current))return g.current=requestAnimationFrame(y),()=>{cancelAnimationFrame(g.current);let n=u.current;n&&n.gl.getExtension("WEBGL_lose_context")?.loseContext(),u.current=null}},[V,y]),H("canvas",{ref:_,className:B("aui-voice-orb size-16 shrink-0",a),"data-state":o})});L.displayName="VoiceOrb";var te=L,P=class extends U{state={error:null};static getDerivedStateFromError(e){return window.__previewError=String(e),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(e)}}render(){return this.state.error?v.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function oe({children:o}){return v.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),o}var w={state:"idle",volume:0,variant:"default"},re=k(document.getElementById("root"));function j(){window.__previewValues=w,re.render(v.createElement(P,{key:JSON.stringify(w)},v.createElement(oe,null,v.createElement(te,w))))}j();addEventListener("message",o=>{if(o.source!==parent||o.data?.type!=="vislexicon:props")return;let e=o.data.values;if(!(!e||typeof e!="object")){for(let c of["state","volume","variant"])Object.hasOwn(e,c)&&["string","number","boolean"].includes(typeof e[c])&&(w[c]=e[c]);j()}});window.__previewMounted=!0;
