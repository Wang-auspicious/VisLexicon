import e from"/data/component-code/shared/react.mjs";var T=e.Activity,h=e.Children,l=e.Component,C=e.Fragment,N=e.Profiler,O=e.PureComponent,I=e.StrictMode,P=e.Suspense,b=e.ViewTransition,A=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,k=e.__COMPILER_RUNTIME,M=e.act,D=e.addTransitionType,L=e.cache,V=e.cacheSignal,U=e.captureOwnerStack,j=e.cloneElement,F=e.createContext,H=e.createElement,z=e.createRef,W=e.forwardRef,Y=e.isValidElement,B=e.lazy,G=e.memo,J=e.startTransition,X=e.unstable_useCacheRefresh,$=e.use,q=e.useActionState,K=e.useCallback,Q=e.useContext,Z=e.useDebugValue,ee=e.useDeferredValue,m=e.useEffect,te=e.useEffectEvent,oe=e.useId,re=e.useImperativeHandle,ne=e.useInsertionEffect,se=e.useLayoutEffect,ae=e.useMemo,ce=e.useOptimistic,ie=e.useReducer,pe=e.useRef,f=e.useState,ue=e.useSyncExternalStore,le=e.useTransition,me=e.version,n=e;import c from"/data/component-code/shared/react-dom-client.mjs";var x=c.createRoot,xe=c.hydrateRoot,de=c.version;import{Progress as E}from"/data/component-code/shared/pkg-2819b9b4d1a81d1e.mjs";import i from"/data/component-code/shared/react-jsx-runtime.mjs";var Re=i.Fragment,s=i.jsx,d=i.jsxs;function p(){let[o,t]=f(13);return m(()=>{let r=setTimeout(()=>t(66),500);return()=>clearTimeout(r)},[]),d("div",{className:"w-[60%]",children:[s("style",{children:`@keyframes gradient-flow {
            0% { background-position: 100% 0%; }
            100% { background-position: -100% 0%; }
          }
          .gradient-flow {
            background: linear-gradient(
              90deg,
              var(--primary),
              color-mix(in oklch, var(--primary) 40%, transparent),
              var(--primary)
            );
            background-size: 200% 100%;
            animation: gradient-flow 2s linear infinite;
          }
          `}),s(E.Root,{className:"relative h-1 w-full overflow-hidden rounded-full bg-primary/20",children:s(E.Indicator,{className:"gradient-flow relative h-full w-full flex-1 transition-all",style:{transform:`translateX(-${100-(o||0)}%)`}})})]})}var v=p,u=class extends l{state={error:null};static getDerivedStateFromError(t){return window.__previewError=String(t),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(t)}}render(){return this.state.error?n.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function y({children:o}){return n.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),o}var a={},S=x(document.getElementById("root"));function _(){window.__previewValues=a,S.render(n.createElement(u,{key:JSON.stringify(a)},n.createElement(y,null,n.createElement(v,a))))}_();addEventListener("message",o=>{if(o.source!==parent||o.data?.type!=="vislexicon:props")return;let t=o.data.values;if(!(!t||typeof t!="object")){for(let r of[])Object.hasOwn(t,r)&&["string","number","boolean"].includes(typeof t[r])&&(a[r]=t[r]);_()}});window.__previewMounted=!0;
