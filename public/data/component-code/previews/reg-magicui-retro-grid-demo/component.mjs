import t from"/data/component-code/shared/react.mjs";var et=t.Activity,tt=t.Children,le=t.Component,ot=t.Fragment,nt=t.Profiler,rt=t.PureComponent,it=t.StrictMode,at=t.Suspense,st=t.ViewTransition,lt=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ct=t.__COMPILER_RUNTIME,dt=t.act,ft=t.addTransitionType,ut=t.cache,pt=t.cacheSignal,mt=t.captureOwnerStack,vt=t.cloneElement,xt=t.createContext,ht=t.createElement,_t=t.createRef,Lt=t.forwardRef,gt=t.isValidElement,St=t.lazy,Et=t.memo,Rt=t.startTransition,Ct=t.unstable_useCacheRefresh,Pt=t.use,bt=t.useActionState,At=t.useCallback,zt=t.useContext,wt=t.useDebugValue,yt=t.useDeferredValue,D=t.useEffect,Tt=t.useEffectEvent,Ot=t.useId,It=t.useImperativeHandle,Ft=t.useInsertionEffect,Nt=t.useLayoutEffect,Gt=t.useMemo,Mt=t.useOptimistic,Wt=t.useReducer,p=t.useRef,ce=t.useState,Dt=t.useSyncExternalStore,Ut=t.useTransition,kt=t.version,g=t;import U from"/data/component-code/shared/react-dom-client.mjs";var de=U.createRoot,$t=U.hydrateRoot,Yt=U.version;import{clsx as Oe}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as Ie}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function k(...e){return Ie(Oe(e))}import H from"/data/component-code/shared/react-jsx-runtime.mjs";var Jt=H.Fragment,f=H.jsx,P=H.jsxs;var he=15,Fe=3,Ne=.5,Ge=.9,Me=.92,We=-.5,De=6,Ue=-2,fe=89,ke=2,ue=1,_e=200,Le="retro-grid-fallback-scroll",He=`
@keyframes ${Le} {
  from {
    transform: translateY(-50%);
  }

  to {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-retro-grid-scroll="true"] {
    animation: none !important;
    transform: translateY(-50%) !important;
  }
}
`,Be=`
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,$e=`
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 u_container_size;
uniform vec2 u_viewport_size;
uniform vec4 u_line_color;
uniform float u_angle;
uniform float u_cell_size;
uniform float u_device_pixel_ratio;
uniform float u_time;

const float animationDurationSeconds = ${he.toFixed(1)};
const float gridHeightRatio = ${Fe.toFixed(1)};
const float gridStartOffsetRatio = ${We.toFixed(1)};
const float gridWidthRatio = ${De.toFixed(1)};
const float gridXOffsetRatio = ${Ue.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${Ne.toFixed(1)};
const float gridLineAntialiasMultiplier = ${Ge.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${Me.toFixed(2)};
const float perspectivePx = ${_e.toFixed(1)};
const float gridTravelRatio = 0.5;
const float verticalCompressionEndPx = 2.6;
const float verticalCompressionStartPx = 1.0;
const float verticalEdgeCompressionEnd = 0.95;
const float verticalEdgeCompressionStart = 0.45;
const float verticalLodLevelEnd = 0.64;
const float verticalLodLevelStart = 0.22;
const float verticalTopCompressionEndCells = 6.0;
const float verticalTopCompressionStartCells = 2.0;

float renderGridLine(
  float wrappedCoord,
  float antiAliasWidth,
  float softnessBoost
) {
  return 1.0 - smoothstep(
    lineWidthPx,
    lineWidthPx + (antiAliasWidth * (1.5 + softnessBoost)),
    wrappedCoord
  );
}

void main() {
  float angle = radians(clamp(u_angle, 1.0, 89.0));
  float sinAngle = sin(angle);
  float cosAngle = cos(angle);
  vec2 screen = vec2(
    (gl_FragCoord.x / u_device_pixel_ratio) - (u_container_size.x * 0.5),
    (u_container_size.y * 0.5) - (gl_FragCoord.y / u_device_pixel_ratio)
  );

  vec3 rayOrigin = vec3(0.0, 0.0, perspectivePx);
  vec3 rayDirection = normalize(vec3(screen, -perspectivePx));
  vec3 planeXAxis = vec3(1.0, 0.0, 0.0);
  vec3 planeYAxis = vec3(0.0, cosAngle, sinAngle);
  vec3 planeNormal = normalize(cross(planeXAxis, planeYAxis));
  float denominator = dot(rayDirection, planeNormal);

  if (abs(denominator) < 0.0001) {
    discard;
  }

  float distanceToPlane = dot(-rayOrigin, planeNormal) / denominator;

  if (distanceToPlane <= 0.0) {
    discard;
  }

  vec3 hitPoint = rayOrigin + (rayDirection * distanceToPlane);
  float localX = hitPoint.x;
  float localY = dot(hitPoint, planeYAxis);
  float gridWidth = u_viewport_size.x * gridWidthRatio;
  float gridHeight = u_viewport_size.y * gridHeightRatio;
  float gridScrollSpeed = (gridHeight * gridTravelRatio) / animationDurationSeconds;
  float patternOffsetY = u_time * gridScrollSpeed;
  float gridLeft = (-0.5 * u_container_size.x) + (gridXOffsetRatio * u_container_size.x);
  float gridTop = (-0.5 * u_container_size.y) + (gridStartOffsetRatio * gridHeight);
  vec2 planePosition = vec2(localX - gridLeft, localY - gridTop);

  if (
    planePosition.x < 0.0 ||
    planePosition.y < 0.0 ||
    planePosition.x > gridWidth ||
    planePosition.y > gridHeight
  ) {
    discard;
  }

  vec2 patternPosition = vec2(planePosition.x, planePosition.y - patternOffsetY);
  vec2 wrapped = mod(
    patternPosition + vec2(gridLineAlignmentOffsetPx),
    u_cell_size
  );
  vec2 patternDerivative = max(fwidth(patternPosition), vec2(0.0001));
  vec2 antiAliasWidth = patternDerivative * gridLineAntialiasMultiplier;
  float horizontalCellSpanPx = u_cell_size / patternDerivative.y;
  float horizontalCompression = 1.0 - smoothstep(
    horizontalCompressionStartPx,
    horizontalCompressionEndPx,
    horizontalCellSpanPx
  );
  float verticalCellSpanPx = u_cell_size / patternDerivative.x;
  float sideDistance = abs((planePosition.x / gridWidth) * 2.0 - 1.0);
  float verticalEdgeCompression = smoothstep(
    verticalEdgeCompressionStart,
    verticalEdgeCompressionEnd,
    sideDistance
  );
  float verticalTopCompression = 1.0 - smoothstep(
    u_cell_size * verticalTopCompressionStartCells,
    u_cell_size * verticalTopCompressionEndCells,
    planePosition.y
  );
  float verticalCompression =
    (1.0 - smoothstep(
      verticalCompressionStartPx,
      verticalCompressionEndPx,
      verticalCellSpanPx
    )) * verticalEdgeCompression * verticalTopCompression;
  float horizontalSoftnessBoost = 1.0 + (horizontalCompression * 3.0);
  float verticalSoftnessBoost = 1.0 + (verticalCompression * 3.5);
  float verticalLod = smoothstep(
    verticalLodLevelStart,
    verticalLodLevelEnd,
    verticalCompression
  );
  float verticalLineFine = renderGridLine(
    wrapped.x,
    antiAliasWidth.x,
    verticalSoftnessBoost
  );
  float verticalWrappedLod = mod(
    patternPosition.x + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float verticalLineCoarse = renderGridLine(
    verticalWrappedLod,
    antiAliasWidth.x,
    verticalSoftnessBoost + verticalLod
  );
  float verticalLine = max(
    verticalLineFine * (1.0 - verticalLod),
    verticalLineCoarse * verticalLod
  );
  float horizontalLodLevelOne = 1.0 - smoothstep(
    horizontalLodLevelOneStartPx,
    horizontalLodLevelOneEndPx,
    horizontalCellSpanPx
  );
  float horizontalLodLevelTwo = 1.0 - smoothstep(
    horizontalLodLevelTwoStartPx,
    horizontalLodLevelTwoEndPx,
    horizontalCellSpanPx
  );
  float horizontalLineFine = renderGridLine(
    wrapped.y,
    antiAliasWidth.y,
    horizontalSoftnessBoost
  );
  float horizontalWrappedLodOne = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float horizontalWrappedLodTwo = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 4.0
  );
  float horizontalLineCoarse = renderGridLine(
    horizontalWrappedLodOne,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne
  );
  float horizontalLineExtraCoarse = renderGridLine(
    horizontalWrappedLodTwo,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne + horizontalLodLevelTwo
  );
  float horizontalLineReduced = max(
    horizontalLineFine * (1.0 - horizontalLodLevelOne),
    horizontalLineCoarse * horizontalLodLevelOne
  );
  float horizontalLine = max(
    horizontalLineReduced * (1.0 - horizontalLodLevelTwo),
    horizontalLineExtraCoarse * horizontalLodLevelTwo
  );
  float line = max(verticalLine, horizontalLine);

  if (line <= 0.001) {
    discard;
  }

  float alpha = u_line_color.a * line;
  gl_FragColor = vec4(u_line_color.rgb * alpha, alpha);
}
`,I;function pe(e,o,r){return Math.min(Math.max(e,o),r)}function me(e,o,r){let a=e.createShader(o);return a?(e.shaderSource(a,r),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS)?a:(e.deleteShader(a),null)):null}function Ye(e){let o=me(e,e.VERTEX_SHADER,Be),r=me(e,e.FRAGMENT_SHADER,$e);if(!o||!r)return null;let a=e.createProgram();return a?(e.attachShader(a,o),e.attachShader(a,r),e.linkProgram(a),e.deleteShader(o),e.deleteShader(r),e.getProgramParameter(a,e.LINK_STATUS)?a:(e.deleteProgram(a),null)):(e.deleteShader(o),e.deleteShader(r),null)}function Xe(e,o){let r=e.getAttribLocation(o,"a_position"),a=e.getUniformLocation(o,"u_angle"),l=e.getUniformLocation(o,"u_cell_size"),c=e.getUniformLocation(o,"u_container_size"),b=e.getUniformLocation(o,"u_device_pixel_ratio"),A=e.getUniformLocation(o,"u_line_color"),S=e.getUniformLocation(o,"u_time"),E=e.getUniformLocation(o,"u_viewport_size");return r<0||!a||!l||!c||!b||!A||!S||!E?null:{attributeLocation:r,program:o,uniforms:{angle:a,cellSize:l,containerSize:c,devicePixelRatio:b,lineColor:A,time:S,viewportSize:E}}}function Ve(e){let o=document.documentElement;return o.classList.contains("dark")?!0:o.classList.contains("light")?!1:e.matches}function je(){if(I!==void 0)return I;let e=document.createElement("canvas");return e.width=1,e.height=1,I=e.getContext("2d",{willReadFrequently:!0}),I}function ve(e,o){let r=document.createElement("span");r.style.color=e,r.style.opacity="0",r.style.pointerEvents="none",r.style.position="absolute",o.appendChild(r);let a=getComputedStyle(r).color;r.remove();let l=je();if(!l)return new Float32Array([.5,.5,.5,1]);l.clearRect(0,0,1,1),l.fillStyle=a,l.fillRect(0,0,1,1);let c=l.getImageData(0,0,1,1).data;return new Float32Array([c[0]/255,c[1]/255,c[2]/255,c[3]/255])}function xe(e,o){return{animation:`${Le} ${he}s linear infinite`,backgroundImage:`linear-gradient(to right, ${o} 1px, transparent 0), linear-gradient(to bottom, ${o} 1px, transparent 0)`,backgroundRepeat:"repeat",backgroundSize:`${e}px ${e}px`,transform:"translateY(-50%)"}}function ge({className:e,angle:o=65,cellSize:r=60,opacity:a=.5,lightLineColor:l="gray",darkLineColor:c="gray",style:b,...A}){let S=p(null),E=p(null),[Y,z]=ce(!1),X=p(o),V=p(r),j=p(c),N=p(l),G=p(null);D(()=>{X.current=o,V.current=r,j.current=c,N.current=l,G.current?.()},[o,r,c,l]),D(()=>{let d=S.current,m=E.current;if(!d||!m)return;let R=window.matchMedia("(prefers-reduced-motion: reduce)"),M=window.matchMedia("(prefers-color-scheme: dark)"),v=null,x=0,h=0,w=1,i=null,y=!0,C=!1,K=ve(N.current,m),_=null,s=null,ze=()=>{let n=d.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!0});return!n||!n.getExtension("OES_standard_derivatives")?null:n},T=n=>{n&&i&&(_&&i.deleteBuffer(_),s&&i.deleteProgram(s.program)),_=null,s=null,n&&(i=null)},we=()=>{let n=ze();if(!n)return T(!1),!1;i=n,T(!0),i=n;let O=Ye(n);if(!O)return!1;let se=Xe(n,O);if(!se)return n.deleteProgram(O),!1;let W=n.createBuffer();return W?(n.bindBuffer(n.ARRAY_BUFFER,W),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW),_=W,s=se,!0):(n.deleteProgram(O),!1)},ye=()=>{let n=Ve(M)?j.current:N.current;K=ve(n,m)},Te=()=>{x=Math.floor(m.clientWidth),h=Math.floor(m.clientHeight),!(x===0||h===0||!i)&&(w=Math.min(window.devicePixelRatio||1,ke),d.width=Math.floor(x*w),d.height=Math.floor(h*w),d.style.width=`${x}px`,d.style.height=`${h}px`,i.viewport(0,0,d.width,d.height))},J=n=>{x===0||h===0||!i||!_||!s||C||(i.useProgram(s.program),i.bindBuffer(i.ARRAY_BUFFER,_),i.enableVertexAttribArray(s.attributeLocation),i.vertexAttribPointer(s.attributeLocation,2,i.FLOAT,!1,0,0),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.uniform1f(s.uniforms.angle,pe(X.current,ue,fe)),i.uniform1f(s.uniforms.cellSize,Math.max(V.current,1)),i.uniform2f(s.uniforms.containerSize,x,h),i.uniform1f(s.uniforms.devicePixelRatio,w),i.uniform4fv(s.uniforms.lineColor,K),i.uniform1f(s.uniforms.time,R.matches?0:n/1e3),i.uniform2f(s.uniforms.viewportSize,window.innerWidth,window.innerHeight),i.drawArrays(i.TRIANGLES,0,3))},L=()=>{v!==null&&(cancelAnimationFrame(v),v=null)},Q=n=>{if(J(n),!R.matches&&y){v=requestAnimationFrame(Q);return}v=null},u=()=>{if(C){L(),z(!1);return}if((!i||!_||!s)&&!we()){L(),z(!1);return}if(Te(),x===0||h===0){L();return}if(ye(),J(performance.now()),z(!0),R.matches||!y){L();return}v===null&&(v=requestAnimationFrame(Q))};G.current=u;let Z=new ResizeObserver(()=>{u()});Z.observe(m);let ee=()=>{u()},te=new IntersectionObserver(([n])=>{if(y=n?.isIntersecting??!1,y){u();return}L()});te.observe(m);let oe=new MutationObserver(()=>{u()});oe.observe(document.documentElement,{attributeFilter:["class"],attributes:!0});let ne=()=>{u()},re=()=>{u()},ie=n=>{n.preventDefault(),C=!0,L(),T(!1),z(!1)},ae=()=>{C=!1,u()};return R.addEventListener("change",ne),M.addEventListener("change",re),window.addEventListener("resize",ee),d.addEventListener("webglcontextlost",ie),d.addEventListener("webglcontextrestored",ae),u(),()=>{L(),Z.disconnect(),te.disconnect(),oe.disconnect(),R.removeEventListener("change",ne),M.removeEventListener("change",re),window.removeEventListener("resize",ee),d.removeEventListener("webglcontextlost",ie),d.removeEventListener("webglcontextrestored",ae),G.current=null,T(!C)}},[]);let Ee={...b,opacity:a},Re=pe(o,ue,fe),q=Math.max(r,1),Ce={perspective:`${_e}px`},Pe={transform:`rotateX(${Re}deg)`},be=xe(q,l),Ae=xe(q,c);return P("div",{ref:E,className:k("pointer-events-none absolute size-full overflow-hidden",e),style:Ee,...A,children:[f("style",{children:He}),Y?null:f("div",{className:"absolute inset-0",style:Ce,children:P("div",{className:"absolute inset-0",style:Pe,children:[f("div",{"data-retro-grid-scroll":"true",className:"absolute inset-[0%_0px] ml-[-200%] h-[300vh] w-[600vw] origin-[100%_0_0] dark:hidden",style:be}),f("div",{"data-retro-grid-scroll":"true",className:"absolute inset-[0%_0px] ml-[-200%] hidden h-[300vh] w-[600vw] origin-[100%_0_0] dark:block",style:Ae})]})}),f("canvas",{ref:S,className:k("absolute inset-0 size-full",Y?"opacity-100":"opacity-0")}),f("div",{className:"absolute inset-0 bg-linear-to-t from-white to-transparent to-90% dark:from-black"})]})}function B(){return P("div",{className:"bg-background relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border",children:[f("span",{className:"pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-7xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-transparent",children:"Retro Grid"}),f(ge,{})]})}var Ke=B,$=class extends le{state={error:null};static getDerivedStateFromError(o){return window.__previewError=String(o),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(o)}}render(){return this.state.error?g.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function Je({children:e}){return g.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),e}var F={},Qe=de(document.getElementById("root"));function Se(){window.__previewValues=F,Qe.render(g.createElement($,{key:JSON.stringify(F)},g.createElement(Je,null,g.createElement(Ke,F))))}Se();addEventListener("message",e=>{if(e.source!==parent||e.data?.type!=="vislexicon:props")return;let o=e.data.values;if(!(!o||typeof o!="object")){for(let r of[])Object.hasOwn(o,r)&&["string","number","boolean"].includes(typeof o[r])&&(F[r]=o[r]);Se()}});window.__previewMounted=!0;
