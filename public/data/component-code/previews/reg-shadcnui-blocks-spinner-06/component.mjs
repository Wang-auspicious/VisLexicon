import e from"/data/component-code/shared/react.mjs";var v=e.Activity,w=e.Children,u=e.Component,g=e.Fragment,T=e.Profiler,C=e.PureComponent,N=e.StrictMode,k=e.Suspense,O=e.ViewTransition,I=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,A=e.__COMPILER_RUNTIME,M=e.act,b=e.addTransitionType,D=e.cache,L=e.cacheSignal,P=e.captureOwnerStack,V=e.cloneElement,U=e.createContext,j=e.createElement,F=e.createRef,H=e.forwardRef,W=e.isValidElement,z=e.lazy,B=e.memo,Y=e.startTransition,G=e.unstable_useCacheRefresh,J=e.use,q=e.useActionState,K=e.useCallback,Q=e.useContext,X=e.useDebugValue,Z=e.useDeferredValue,$=e.useEffect,ee=e.useEffectEvent,te=e.useId,oe=e.useImperativeHandle,re=e.useInsertionEffect,se=e.useLayoutEffect,ne=e.useMemo,ae=e.useOptimistic,ce=e.useReducer,ie=e.useRef,pe=e.useState,ue=e.useSyncExternalStore,xe=e.useTransition,le=e.version,r=e;import c from"/data/component-code/shared/react-dom-client.mjs";var x=c.createRoot,me=c.hydrateRoot,Ee=c.version;import i from"/data/component-code/shared/react-jsx-runtime.mjs";var l=i.Fragment,n=i.jsx,f=i.jsxs;var E=()=>f(l,{children:[n("style",{children:`@keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        
          @keyframes spin2 {
            0% {
              stroke-dasharray: 1, 800;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 400, 400;
              stroke-dashoffset: -200px;
            }
            100% {
              stroke-dasharray: 800, 1;
              stroke-dashoffset: -800px;
            }
          }
        
          .spin2 {
            transform-origin: center;
            animation: spin2 1.5s ease-in-out infinite,
              spin 2s linear infinite;
            animation-direction: alternate;
          }`}),n("svg",{className:"h-14 w-14",viewBox:"0 0 800 800",xmlns:"http://www.w3.org/2000/svg",children:n("circle",{className:"spin2 stroke-primary",cx:"400",cy:"400",fill:"none",r:"200",strokeDasharray:"700 1400",strokeLinecap:"round",strokeWidth:"50"})})]}),d=E;var y=d,p=class extends u{state={error:null};static getDerivedStateFromError(t){return window.__previewError=String(t),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(t)}}render(){return this.state.error?r.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function R({children:o}){return r.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),o}var a={},S=x(document.getElementById("root"));function m(){window.__previewValues=a,S.render(r.createElement(p,{key:JSON.stringify(a)},r.createElement(R,null,r.createElement(y,a))))}m();addEventListener("message",o=>{if(o.source!==parent||o.data?.type!=="vislexicon:props")return;let t=o.data.values;if(!(!t||typeof t!="object")){for(let s of[])Object.hasOwn(t,s)&&["string","number","boolean"].includes(typeof t[s])&&(a[s]=t[s]);m()}});window.__previewMounted=!0;
