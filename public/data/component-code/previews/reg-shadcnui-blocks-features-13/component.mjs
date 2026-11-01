import e from"/data/component-code/shared/react.mjs";var N=e.Activity,T=e.Children,d=e.Component,I=e.Fragment,O=e.Profiler,M=e.PureComponent,A=e.StrictMode,D=e.Suspense,P=e.ViewTransition,F=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,L=e.__COMPILER_RUNTIME,V=e.act,z=e.addTransitionType,U=e.cache,j=e.cacheSignal,B=e.captureOwnerStack,H=e.cloneElement,W=e.createContext,Y=e.createElement,q=e.createRef,G=e.forwardRef,J=e.isValidElement,Z=e.lazy,K=e.memo,Q=e.startTransition,X=e.unstable_useCacheRefresh,$=e.use,ee=e.useActionState,te=e.useCallback,re=e.useContext,oe=e.useDebugValue,ne=e.useDeferredValue,se=e.useEffect,ae=e.useEffectEvent,ie=e.useId,ce=e.useImperativeHandle,pe=e.useInsertionEffect,le=e.useLayoutEffect,de=e.useMemo,xe=e.useOptimistic,ue=e.useReducer,me=e.useRef,fe=e.useState,ge=e.useSyncExternalStore,be=e.useTransition,ye=e.version,n=e;import i from"/data/component-code/shared/react-dom-client.mjs";var x=i.createRoot,he=i.hydrateRoot,_e=i.version;import{Cable as f,Code as g,Contrast as b,MonitorSmartphone as y,SquareDashedMousePointer as E,Zap as v}from"/data/component-code/shared/pkg-14a7f5b66e16a893.mjs";import c from"/data/component-code/shared/react-jsx-runtime.mjs";var Se=c.Fragment,o=c.jsx,p=c.jsxs;var h=[{title:"Blazing Fast Performance",description:"Optimized for speed with minimal loading times and instant interactions, ensuring a smooth experience across devices.",icon:v},{title:"Fully Customizable",description:"Tailor every component to match your brand or workflow \u2014 with built-in support for themes, layouts, and configurations.",icon:E},{title:"Developer-Friendly",description:"Built with clean, modern code and best practices in mind, making it easy to integrate, extend, and scale.",icon:g},{title:"Responsive by Default",description:"Every component is designed to look great on all screen sizes \u2014 no extra work needed to make things mobile-friendly.",icon:y},{title:"Accessible for Everyone",description:"Built with accessibility best practices in mind to ensure an inclusive experience for all users, regardless of ability.",icon:b},{title:"Seamless Integration",description:"Easily connect with your favorite tools, APIs, and services \u2014 whether it's authentication, databases, or third-party libraries.",icon:f}],_=()=>p("div",{className:"mx-auto flex max-w-7xl flex-col px-6 py-20",children:[o("h2",{className:"text-center text-4xl font-medium tracking-tight text-pretty",children:"Engineered for speed"}),o("p",{className:"mt-3 text-pretty text-center text-muted-foreground text-xl -tracking-[0.01em] sm:text-2xl",children:"Designed for speed, flexibility, and ease of use"}),o("div",{className:"mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",children:h.map((t,r)=>p("div",{className:"relative overflow-hidden rounded-xl border bg-card p-6 dark:border-card-foreground/7",children:[o("div",{className:"flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-primary/10",children:o(t.icon,{})}),o("h3",{className:"mt-5 font-medium text-lg tracking-[-0.005em]",children:t.title}),o("p",{className:"mt-2 text-foreground/80",children:t.description}),o("div",{className:"absolute inset-0 -top-px z-0",style:{backgroundImage:`
        linear-gradient(to right, var(--border) 1px, transparent 1px),
        linear-gradient(to bottom, var(--border) 1px, transparent 1px)
      `,backgroundSize:"20px 20px",backgroundPosition:"0 0, 0 0",maskImage:`
          repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 80% at 100% 0%, #000 50%, transparent 100%)
      `,WebkitMaskImage:`
    repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,maskComposite:"intersect",WebkitMaskComposite:"source-in"}})]},r))})]}),u=_;var R=u,l=class extends d{state={error:null};static getDerivedStateFromError(r){return window.__previewError=String(r),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(r)}}render(){return this.state.error?n.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function S({children:t}){return n.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),t}var a={},w=x(document.getElementById("root"));function m(){window.__previewValues=a,w.render(n.createElement(l,{key:JSON.stringify(a)},n.createElement(S,null,n.createElement(R,a))))}m();addEventListener("message",t=>{if(t.source!==parent||t.data?.type!=="vislexicon:props")return;let r=t.data.values;if(!(!r||typeof r!="object")){for(let s of[])Object.hasOwn(r,s)&&["string","number","boolean"].includes(typeof r[s])&&(a[s]=r[s]);m()}});window.__previewMounted=!0;
