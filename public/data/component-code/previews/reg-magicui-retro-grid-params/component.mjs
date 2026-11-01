import t from"/data/component-code/shared/react.mjs";var et=t.Activity,tt=t.Children,se=t.Component,ot=t.Fragment,nt=t.Profiler,rt=t.PureComponent,it=t.StrictMode,at=t.Suspense,st=t.ViewTransition,lt=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ct=t.__COMPILER_RUNTIME,dt=t.act,ft=t.addTransitionType,ut=t.cache,pt=t.cacheSignal,mt=t.captureOwnerStack,vt=t.cloneElement,xt=t.createContext,ht=t.createElement,Lt=t.createRef,_t=t.forwardRef,gt=t.isValidElement,St=t.lazy,Et=t.memo,Ct=t.startTransition,Rt=t.unstable_useCacheRefresh,Pt=t.use,bt=t.useActionState,zt=t.useCallback,At=t.useContext,yt=t.useDebugValue,wt=t.useDeferredValue,W=t.useEffect,Tt=t.useEffectEvent,Ot=t.useId,It=t.useImperativeHandle,Ft=t.useInsertionEffect,Gt=t.useLayoutEffect,Nt=t.useMemo,Mt=t.useOptimistic,Wt=t.useReducer,p=t.useRef,le=t.useState,Dt=t.useSyncExternalStore,Ut=t.useTransition,kt=t.version,g=t;import D from"/data/component-code/shared/react-dom-client.mjs";var ce=D.createRoot,$t=D.hydrateRoot,Yt=D.version;import{clsx as Oe}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as Ie}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function U(...e){return Ie(Oe(e))}import k from"/data/component-code/shared/react-jsx-runtime.mjs";var Jt=k.Fragment,u=k.jsx,H=k.jsxs;var xe=15,Fe=3,Ge=.5,Ne=.9,Me=.92,We=-.5,De=6,Ue=-2,de=89,ke=2,fe=1,he=200,Le="retro-grid-fallback-scroll",He=`
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

const float animationDurationSeconds = ${xe.toFixed(1)};
const float gridHeightRatio = ${Fe.toFixed(1)};
const float gridStartOffsetRatio = ${We.toFixed(1)};
const float gridWidthRatio = ${De.toFixed(1)};
const float gridXOffsetRatio = ${Ue.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${Ge.toFixed(1)};
const float gridLineAntialiasMultiplier = ${Ne.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${Me.toFixed(2)};
const float perspectivePx = ${he.toFixed(1)};
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
`,O;function ue(e,o,n){return Math.min(Math.max(e,o),n)}function pe(e,o,n){let a=e.createShader(o);return a?(e.shaderSource(a,n),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS)?a:(e.deleteShader(a),null)):null}function Ye(e){let o=pe(e,e.VERTEX_SHADER,Be),n=pe(e,e.FRAGMENT_SHADER,$e);if(!o||!n)return null;let a=e.createProgram();return a?(e.attachShader(a,o),e.attachShader(a,n),e.linkProgram(a),e.deleteShader(o),e.deleteShader(n),e.getProgramParameter(a,e.LINK_STATUS)?a:(e.deleteProgram(a),null)):(e.deleteShader(o),e.deleteShader(n),null)}function Xe(e,o){let n=e.getAttribLocation(o,"a_position"),a=e.getUniformLocation(o,"u_angle"),l=e.getUniformLocation(o,"u_cell_size"),c=e.getUniformLocation(o,"u_container_size"),P=e.getUniformLocation(o,"u_device_pixel_ratio"),b=e.getUniformLocation(o,"u_line_color"),S=e.getUniformLocation(o,"u_time"),E=e.getUniformLocation(o,"u_viewport_size");return n<0||!a||!l||!c||!P||!b||!S||!E?null:{attributeLocation:n,program:o,uniforms:{angle:a,cellSize:l,containerSize:c,devicePixelRatio:P,lineColor:b,time:S,viewportSize:E}}}function Ve(e){let o=document.documentElement;return o.classList.contains("dark")?!0:o.classList.contains("light")?!1:e.matches}function je(){if(O!==void 0)return O;let e=document.createElement("canvas");return e.width=1,e.height=1,O=e.getContext("2d",{willReadFrequently:!0}),O}function me(e,o){let n=document.createElement("span");n.style.color=e,n.style.opacity="0",n.style.pointerEvents="none",n.style.position="absolute",o.appendChild(n);let a=getComputedStyle(n).color;n.remove();let l=je();if(!l)return new Float32Array([.5,.5,.5,1]);l.clearRect(0,0,1,1),l.fillStyle=a,l.fillRect(0,0,1,1);let c=l.getImageData(0,0,1,1).data;return new Float32Array([c[0]/255,c[1]/255,c[2]/255,c[3]/255])}function ve(e,o){return{animation:`${Le} ${xe}s linear infinite`,backgroundImage:`linear-gradient(to right, ${o} 1px, transparent 0), linear-gradient(to bottom, ${o} 1px, transparent 0)`,backgroundRepeat:"repeat",backgroundSize:`${e}px ${e}px`,transform:"translateY(-50%)"}}function _e({className:e,angle:o=65,cellSize:n=60,opacity:a=.5,lightLineColor:l="gray",darkLineColor:c="gray",style:P,...b}){let S=p(null),E=p(null),[$,z]=le(!1),Y=p(o),X=p(n),V=p(c),F=p(l),G=p(null);W(()=>{Y.current=o,X.current=n,V.current=c,F.current=l,G.current?.()},[o,n,c,l]),W(()=>{let d=S.current,m=E.current;if(!d||!m)return;let C=window.matchMedia("(prefers-reduced-motion: reduce)"),N=window.matchMedia("(prefers-color-scheme: dark)"),v=null,x=0,h=0,A=1,i=null,y=!0,R=!1,q=me(F.current,m),L=null,s=null,Ae=()=>{let r=d.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!0});return!r||!r.getExtension("OES_standard_derivatives")?null:r},w=r=>{r&&i&&(L&&i.deleteBuffer(L),s&&i.deleteProgram(s.program)),L=null,s=null,r&&(i=null)},ye=()=>{let r=Ae();if(!r)return w(!1),!1;i=r,w(!0),i=r;let T=Ye(r);if(!T)return!1;let ae=Xe(r,T);if(!ae)return r.deleteProgram(T),!1;let M=r.createBuffer();return M?(r.bindBuffer(r.ARRAY_BUFFER,M),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW),L=M,s=ae,!0):(r.deleteProgram(T),!1)},we=()=>{let r=Ve(N)?V.current:F.current;q=me(r,m)},Te=()=>{x=Math.floor(m.clientWidth),h=Math.floor(m.clientHeight),!(x===0||h===0||!i)&&(A=Math.min(window.devicePixelRatio||1,ke),d.width=Math.floor(x*A),d.height=Math.floor(h*A),d.style.width=`${x}px`,d.style.height=`${h}px`,i.viewport(0,0,d.width,d.height))},K=r=>{x===0||h===0||!i||!L||!s||R||(i.useProgram(s.program),i.bindBuffer(i.ARRAY_BUFFER,L),i.enableVertexAttribArray(s.attributeLocation),i.vertexAttribPointer(s.attributeLocation,2,i.FLOAT,!1,0,0),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.uniform1f(s.uniforms.angle,ue(Y.current,fe,de)),i.uniform1f(s.uniforms.cellSize,Math.max(X.current,1)),i.uniform2f(s.uniforms.containerSize,x,h),i.uniform1f(s.uniforms.devicePixelRatio,A),i.uniform4fv(s.uniforms.lineColor,q),i.uniform1f(s.uniforms.time,C.matches?0:r/1e3),i.uniform2f(s.uniforms.viewportSize,window.innerWidth,window.innerHeight),i.drawArrays(i.TRIANGLES,0,3))},_=()=>{v!==null&&(cancelAnimationFrame(v),v=null)},J=r=>{if(K(r),!C.matches&&y){v=requestAnimationFrame(J);return}v=null},f=()=>{if(R){_(),z(!1);return}if((!i||!L||!s)&&!ye()){_(),z(!1);return}if(Te(),x===0||h===0){_();return}if(we(),K(performance.now()),z(!0),C.matches||!y){_();return}v===null&&(v=requestAnimationFrame(J))};G.current=f;let Q=new ResizeObserver(()=>{f()});Q.observe(m);let Z=()=>{f()},ee=new IntersectionObserver(([r])=>{if(y=r?.isIntersecting??!1,y){f();return}_()});ee.observe(m);let te=new MutationObserver(()=>{f()});te.observe(document.documentElement,{attributeFilter:["class"],attributes:!0});let oe=()=>{f()},ne=()=>{f()},re=r=>{r.preventDefault(),R=!0,_(),w(!1),z(!1)},ie=()=>{R=!1,f()};return C.addEventListener("change",oe),N.addEventListener("change",ne),window.addEventListener("resize",Z),d.addEventListener("webglcontextlost",re),d.addEventListener("webglcontextrestored",ie),f(),()=>{_(),Q.disconnect(),ee.disconnect(),te.disconnect(),C.removeEventListener("change",oe),N.removeEventListener("change",ne),window.removeEventListener("resize",Z),d.removeEventListener("webglcontextlost",re),d.removeEventListener("webglcontextrestored",ie),G.current=null,w(!R)}},[]);let Ee={...P,opacity:a},Ce=ue(o,fe,de),j=Math.max(n,1),Re={perspective:`${he}px`},Pe={transform:`rotateX(${Ce}deg)`},be=ve(j,l),ze=ve(j,c);return H("div",{ref:E,className:U("pointer-events-none absolute size-full overflow-hidden",e),style:Ee,...b,children:[u("style",{children:He}),$?null:u("div",{className:"absolute inset-0",style:Re,children:H("div",{className:"absolute inset-0",style:Pe,children:[u("div",{"data-retro-grid-scroll":"true",className:"absolute inset-[0%_0px] ml-[-200%] h-[300vh] w-[600vw] origin-[100%_0_0] dark:hidden",style:be}),u("div",{"data-retro-grid-scroll":"true",className:"absolute inset-[0%_0px] ml-[-200%] hidden h-[300vh] w-[600vw] origin-[100%_0_0] dark:block",style:ze})]})}),u("canvas",{ref:S,className:U("absolute inset-0 size-full",$?"opacity-100":"opacity-0")}),u("div",{className:"absolute inset-0 bg-linear-to-t from-white to-transparent to-90% dark:from-black"})]})}function ge({angle:e=65,cellSize:o=60,opacity:n=.5,lightLineColor:a="gray",darkLineColor:l="gray"}){return u(_e,{angle:e,cellSize:o,opacity:n,lightLineColor:a,darkLineColor:l})}var Ke=ge,B=class extends se{state={error:null};static getDerivedStateFromError(o){return window.__previewError=String(o),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(o)}}render(){return this.state.error?g.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function Je({children:e}){return g.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),e}var I={angle:65,cellSize:60,opacity:.5,lightLineColor:"gray",darkLineColor:"gray"},Qe=ce(document.getElementById("root"));function Se(){window.__previewValues=I,Qe.render(g.createElement(B,{key:JSON.stringify(I)},g.createElement(Je,null,g.createElement(Ke,I))))}Se();addEventListener("message",e=>{if(e.source!==parent||e.data?.type!=="vislexicon:props")return;let o=e.data.values;if(!(!o||typeof o!="object")){for(let n of["angle","cellSize","opacity","lightLineColor","darkLineColor"])Object.hasOwn(o,n)&&["string","number","boolean"].includes(typeof o[n])&&(I[n]=o[n]);Se()}});window.__previewMounted=!0;
