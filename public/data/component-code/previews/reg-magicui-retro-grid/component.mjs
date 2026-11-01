import t from"/data/component-code/shared/react.mjs";var Ze=t.Activity,et=t.Children,se=t.Component,tt=t.Fragment,ot=t.Profiler,nt=t.PureComponent,rt=t.StrictMode,it=t.Suspense,at=t.ViewTransition,st=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,lt=t.__COMPILER_RUNTIME,ct=t.act,dt=t.addTransitionType,ft=t.cache,ut=t.cacheSignal,pt=t.captureOwnerStack,mt=t.cloneElement,vt=t.createContext,xt=t.createElement,ht=t.createRef,Lt=t.forwardRef,_t=t.isValidElement,gt=t.lazy,St=t.memo,Et=t.startTransition,Ct=t.unstable_useCacheRefresh,Rt=t.use,Pt=t.useActionState,bt=t.useCallback,At=t.useContext,zt=t.useDebugValue,yt=t.useDeferredValue,W=t.useEffect,Tt=t.useEffectEvent,wt=t.useId,Ot=t.useImperativeHandle,It=t.useInsertionEffect,Ft=t.useLayoutEffect,Nt=t.useMemo,Gt=t.useOptimistic,Mt=t.useReducer,u=t.useRef,le=t.useState,Wt=t.useSyncExternalStore,Dt=t.useTransition,Ut=t.version,g=t;import D from"/data/component-code/shared/react-dom-client.mjs";var ce=D.createRoot,Bt=D.hydrateRoot,$t=D.version;import{clsx as we}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as Oe}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function U(...e){return Oe(we(e))}import k from"/data/component-code/shared/react-jsx-runtime.mjs";var Kt=k.Fragment,_=k.jsx,H=k.jsxs;var xe=15,Ie=3,Fe=.5,Ne=.9,Ge=.92,Me=-.5,We=6,De=-2,de=89,Ue=2,fe=1,he=200,Le="retro-grid-fallback-scroll",ke=`
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
`,He=`
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,Be=`
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
const float gridHeightRatio = ${Ie.toFixed(1)};
const float gridStartOffsetRatio = ${Me.toFixed(1)};
const float gridWidthRatio = ${We.toFixed(1)};
const float gridXOffsetRatio = ${De.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${Fe.toFixed(1)};
const float gridLineAntialiasMultiplier = ${Ne.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${Ge.toFixed(2)};
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
`,O;function ue(e,o,r){return Math.min(Math.max(e,o),r)}function pe(e,o,r){let a=e.createShader(o);return a?(e.shaderSource(a,r),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS)?a:(e.deleteShader(a),null)):null}function $e(e){let o=pe(e,e.VERTEX_SHADER,He),r=pe(e,e.FRAGMENT_SHADER,Be);if(!o||!r)return null;let a=e.createProgram();return a?(e.attachShader(a,o),e.attachShader(a,r),e.linkProgram(a),e.deleteShader(o),e.deleteShader(r),e.getProgramParameter(a,e.LINK_STATUS)?a:(e.deleteProgram(a),null)):(e.deleteShader(o),e.deleteShader(r),null)}function Ye(e,o){let r=e.getAttribLocation(o,"a_position"),a=e.getUniformLocation(o,"u_angle"),l=e.getUniformLocation(o,"u_cell_size"),c=e.getUniformLocation(o,"u_container_size"),P=e.getUniformLocation(o,"u_device_pixel_ratio"),b=e.getUniformLocation(o,"u_line_color"),S=e.getUniformLocation(o,"u_time"),E=e.getUniformLocation(o,"u_viewport_size");return r<0||!a||!l||!c||!P||!b||!S||!E?null:{attributeLocation:r,program:o,uniforms:{angle:a,cellSize:l,containerSize:c,devicePixelRatio:P,lineColor:b,time:S,viewportSize:E}}}function Xe(e){let o=document.documentElement;return o.classList.contains("dark")?!0:o.classList.contains("light")?!1:e.matches}function Ve(){if(O!==void 0)return O;let e=document.createElement("canvas");return e.width=1,e.height=1,O=e.getContext("2d",{willReadFrequently:!0}),O}function me(e,o){let r=document.createElement("span");r.style.color=e,r.style.opacity="0",r.style.pointerEvents="none",r.style.position="absolute",o.appendChild(r);let a=getComputedStyle(r).color;r.remove();let l=Ve();if(!l)return new Float32Array([.5,.5,.5,1]);l.clearRect(0,0,1,1),l.fillStyle=a,l.fillRect(0,0,1,1);let c=l.getImageData(0,0,1,1).data;return new Float32Array([c[0]/255,c[1]/255,c[2]/255,c[3]/255])}function ve(e,o){return{animation:`${Le} ${xe}s linear infinite`,backgroundImage:`linear-gradient(to right, ${o} 1px, transparent 0), linear-gradient(to bottom, ${o} 1px, transparent 0)`,backgroundRepeat:"repeat",backgroundSize:`${e}px ${e}px`,transform:"translateY(-50%)"}}function _e({className:e,angle:o=65,cellSize:r=60,opacity:a=.5,lightLineColor:l="gray",darkLineColor:c="gray",style:P,...b}){let S=u(null),E=u(null),[$,A]=le(!1),Y=u(o),X=u(r),V=u(c),F=u(l),N=u(null);W(()=>{Y.current=o,X.current=r,V.current=c,F.current=l,N.current?.()},[o,r,c,l]),W(()=>{let d=S.current,p=E.current;if(!d||!p)return;let C=window.matchMedia("(prefers-reduced-motion: reduce)"),G=window.matchMedia("(prefers-color-scheme: dark)"),m=null,v=0,x=0,z=1,i=null,y=!0,R=!1,q=me(F.current,p),h=null,s=null,Ae=()=>{let n=d.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!0});return!n||!n.getExtension("OES_standard_derivatives")?null:n},T=n=>{n&&i&&(h&&i.deleteBuffer(h),s&&i.deleteProgram(s.program)),h=null,s=null,n&&(i=null)},ze=()=>{let n=Ae();if(!n)return T(!1),!1;i=n,T(!0),i=n;let w=$e(n);if(!w)return!1;let ae=Ye(n,w);if(!ae)return n.deleteProgram(w),!1;let M=n.createBuffer();return M?(n.bindBuffer(n.ARRAY_BUFFER,M),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW),h=M,s=ae,!0):(n.deleteProgram(w),!1)},ye=()=>{let n=Xe(G)?V.current:F.current;q=me(n,p)},Te=()=>{v=Math.floor(p.clientWidth),x=Math.floor(p.clientHeight),!(v===0||x===0||!i)&&(z=Math.min(window.devicePixelRatio||1,Ue),d.width=Math.floor(v*z),d.height=Math.floor(x*z),d.style.width=`${v}px`,d.style.height=`${x}px`,i.viewport(0,0,d.width,d.height))},K=n=>{v===0||x===0||!i||!h||!s||R||(i.useProgram(s.program),i.bindBuffer(i.ARRAY_BUFFER,h),i.enableVertexAttribArray(s.attributeLocation),i.vertexAttribPointer(s.attributeLocation,2,i.FLOAT,!1,0,0),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.uniform1f(s.uniforms.angle,ue(Y.current,fe,de)),i.uniform1f(s.uniforms.cellSize,Math.max(X.current,1)),i.uniform2f(s.uniforms.containerSize,v,x),i.uniform1f(s.uniforms.devicePixelRatio,z),i.uniform4fv(s.uniforms.lineColor,q),i.uniform1f(s.uniforms.time,C.matches?0:n/1e3),i.uniform2f(s.uniforms.viewportSize,window.innerWidth,window.innerHeight),i.drawArrays(i.TRIANGLES,0,3))},L=()=>{m!==null&&(cancelAnimationFrame(m),m=null)},J=n=>{if(K(n),!C.matches&&y){m=requestAnimationFrame(J);return}m=null},f=()=>{if(R){L(),A(!1);return}if((!i||!h||!s)&&!ze()){L(),A(!1);return}if(Te(),v===0||x===0){L();return}if(ye(),K(performance.now()),A(!0),C.matches||!y){L();return}m===null&&(m=requestAnimationFrame(J))};N.current=f;let Q=new ResizeObserver(()=>{f()});Q.observe(p);let Z=()=>{f()},ee=new IntersectionObserver(([n])=>{if(y=n?.isIntersecting??!1,y){f();return}L()});ee.observe(p);let te=new MutationObserver(()=>{f()});te.observe(document.documentElement,{attributeFilter:["class"],attributes:!0});let oe=()=>{f()},ne=()=>{f()},re=n=>{n.preventDefault(),R=!0,L(),T(!1),A(!1)},ie=()=>{R=!1,f()};return C.addEventListener("change",oe),G.addEventListener("change",ne),window.addEventListener("resize",Z),d.addEventListener("webglcontextlost",re),d.addEventListener("webglcontextrestored",ie),f(),()=>{L(),Q.disconnect(),ee.disconnect(),te.disconnect(),C.removeEventListener("change",oe),G.removeEventListener("change",ne),window.removeEventListener("resize",Z),d.removeEventListener("webglcontextlost",re),d.removeEventListener("webglcontextrestored",ie),N.current=null,T(!R)}},[]);let Se={...P,opacity:a},Ee=ue(o,fe,de),j=Math.max(r,1),Ce={perspective:`${he}px`},Re={transform:`rotateX(${Ee}deg)`},Pe=ve(j,l),be=ve(j,c);return H("div",{ref:E,className:U("pointer-events-none absolute size-full overflow-hidden",e),style:Se,...b,children:[_("style",{children:ke}),$?null:_("div",{className:"absolute inset-0",style:Ce,children:H("div",{className:"absolute inset-0",style:Re,children:[_("div",{"data-retro-grid-scroll":"true",className:"absolute inset-[0%_0px] ml-[-200%] h-[300vh] w-[600vw] origin-[100%_0_0] dark:hidden",style:Pe}),_("div",{"data-retro-grid-scroll":"true",className:"absolute inset-[0%_0px] ml-[-200%] hidden h-[300vh] w-[600vw] origin-[100%_0_0] dark:block",style:be})]})}),_("canvas",{ref:S,className:U("absolute inset-0 size-full",$?"opacity-100":"opacity-0")}),_("div",{className:"absolute inset-0 bg-linear-to-t from-white to-transparent to-90% dark:from-black"})]})}var qe=_e,B=class extends se{state={error:null};static getDerivedStateFromError(o){return window.__previewError=String(o),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(o)}}render(){return this.state.error?g.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function Ke({children:e}){return g.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),e}var I={angle:65,cellSize:60,opacity:.5,lightLineColor:"gray",darkLineColor:"gray"},Je=ce(document.getElementById("root"));function ge(){window.__previewValues=I,Je.render(g.createElement(B,{key:JSON.stringify(I)},g.createElement(Ke,null,g.createElement(qe,I))))}ge();addEventListener("message",e=>{if(e.source!==parent||e.data?.type!=="vislexicon:props")return;let o=e.data.values;if(!(!o||typeof o!="object")){for(let r of["angle","cellSize","opacity","lightLineColor","darkLineColor"])Object.hasOwn(o,r)&&["string","number","boolean"].includes(typeof o[r])&&(I[r]=o[r]);ge()}});window.__previewMounted=!0;
