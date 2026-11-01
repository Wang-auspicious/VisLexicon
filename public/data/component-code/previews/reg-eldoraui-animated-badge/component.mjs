import e from"/data/component-code/shared/react.mjs";var I=e.Activity,T=e.Children,f=e.Component,O=e.Fragment,A=e.Profiler,M=e.PureComponent,L=e.StrictMode,P=e.Suspense,j=e.ViewTransition,V=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,D=e.__COMPILER_RUNTIME,q=e.act,U=e.addTransitionType,$=e.cache,B=e.cacheSignal,F=e.captureOwnerStack,H=e.cloneElement,z=e.createContext,G=e.createElement,W=e.createRef,Y=e.forwardRef,J=e.isValidElement,K=e.lazy,Q=e.memo,X=e.startTransition,Z=e.unstable_useCacheRefresh,ee=e.use,te=e.useActionState,re=e.useCallback,oe=e.useContext,ne=e.useDebugValue,se=e.useDeferredValue,ae=e.useEffect,ie=e.useEffectEvent,ce=e.useId,le=e.useImperativeHandle,ue=e.useInsertionEffect,pe=e.useLayoutEffect,de=e.useMemo,me=e.useOptimistic,fe=e.useReducer,xe=e.useRef,ge=e.useState,he=e.useSyncExternalStore,ve=e.useTransition,Ee=e.version,i=e;import p from"/data/component-code/shared/react-dom-client.mjs";var x=p.createRoot,be=p.hydrateRoot,we=p.version;import y from"/data/component-code/shared/pkg-6259403322ab7ba9.mjs";import{ChevronRight as _}from"/data/component-code/shared/pkg-14a7f5b66e16a893.mjs";import{motion as b}from"/data/component-code/shared/pkg-89fa7494cd639279.mjs";import d from"/data/component-code/shared/react-jsx-runtime.mjs";var g=d.Fragment,o=d.jsx,s=d.jsxs;function h(n,r){let t=n.replace("#","");if(t.length===3){let a=parseInt(t[0]+t[0],16),l=parseInt(t[1]+t[1],16),u=parseInt(t[2]+t[2],16);return`rgba(${a}, ${l}, ${u}, ${r})`}if(t.length===6){let a=parseInt(t.substring(0,2),16),l=parseInt(t.substring(2,4),16),u=parseInt(t.substring(4,6),16);return`rgba(${a}, ${l}, ${u}, ${r})`}return n}var w=({text:n="Introducing Eldoraui",color:r="#22d3ee",href:t})=>{let a=s(b.div,{initial:!1,whileInView:{opacity:1,y:0,filter:"blur(0px)"},transition:{duration:.3,delay:.1,ease:"easeInOut"},viewport:{once:!0},className:"group relative flex max-w-fit items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-neutral-700 transition-colors dark:border-neutral-700/80 dark:bg-black dark:text-zinc-300",children:[o("div",{className:"pointer-events-none absolute inset-x-0 bottom-full h-20 w-[165px]",children:s("svg",{className:"h-full w-full",width:"100%",height:"100%",viewBox:"0 0 50 50",fill:"none",children:[o("g",{mask:"url(#ml-mask-1)",children:o("circle",{className:"multiline ml-light-1",cx:"0",cy:"0",r:"20",fill:"url(#ml-white-grad)"})}),s("defs",{children:[o("mask",{id:"ml-mask-1",children:o("path",{d:"M 69 49.8 h -30 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -23 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -30",strokeWidth:"0.6",stroke:"white"})}),s("radialGradient",{id:"ml-white-grad",fx:"1",children:[o("stop",{offset:"0%",stopColor:r}),o("stop",{offset:"20%",stopColor:r}),o("stop",{offset:"100%",stopColor:"transparent"})]})]})]})}),s("div",{className:"relative flex h-1 w-1 items-center justify-center rounded-full",style:{backgroundColor:h(r,.4)},children:[o("div",{className:"flex h-2 w-2 animate-ping items-center justify-center rounded-full",style:{backgroundColor:r},children:o("div",{className:"flex h-2 w-2 animate-ping items-center justify-center rounded-full",style:{backgroundColor:r}})}),o("div",{className:"absolute top-1/2 left-1/2 flex h-1 w-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",style:{backgroundColor:h(r,.8)}})]}),o("div",{className:"mx-2 h-4 w-px bg-neutral-300 dark:bg-neutral-600/80"}),o("span",{className:"bg-clip-text text-xs font-medium",children:n}),o(_,{className:"ml-1 h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-neutral-500"})]});return s(g,{children:[t?o(y,{href:t,className:"inline-block",children:a}):a,o("style",{children:`    
.multiline {
  offset-anchor: 10px 0px;
  animation: multiline-animation-path;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-duration: 3s;
}

.ml-light-1 {
  offset-path: path(
    "M 69 49.8 h -30 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -23 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -50"
  );
}

@keyframes multiline-animation-path {
  0% {
    offset-distance: 0%;
  }
  50% {
    offset-distance: 100%;
  }
  100% {
    offset-distance: 100%;
  }
}`})]})},v=w;var N=v,m=class extends f{state={error:null};static getDerivedStateFromError(r){return window.__previewError=String(r),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(r)}}render(){return this.state.error?i.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function C({children:n}){return i.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),n}var c={},S=x(document.getElementById("root"));function E(){window.__previewValues=c,S.render(i.createElement(m,{key:JSON.stringify(c)},i.createElement(C,null,i.createElement(N,c))))}E();addEventListener("message",n=>{if(n.source!==parent||n.data?.type!=="vislexicon:props")return;let r=n.data.values;if(!(!r||typeof r!="object")){for(let t of[])Object.hasOwn(r,t)&&["string","number","boolean"].includes(typeof r[t])&&(c[t]=r[t]);E()}});window.__previewMounted=!0;
