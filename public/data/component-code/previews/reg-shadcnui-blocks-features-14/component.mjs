import e from"/data/component-code/shared/react.mjs";var D=e.Activity,z=e.Children,m=e.Component,H=e.Fragment,j=e.Profiler,F=e.PureComponent,W=e.StrictMode,Y=e.Suspense,G=e.ViewTransition,J=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,q=e.__COMPILER_RUNTIME,K=e.act,Q=e.addTransitionType,X=e.cache,Z=e.cacheSignal,$=e.captureOwnerStack,ee=e.cloneElement,te=e.createContext,re=e.createElement,oe=e.createRef,x=e.forwardRef,ne=e.isValidElement,se=e.lazy,ae=e.memo,ie=e.startTransition,ce=e.unstable_useCacheRefresh,pe=e.use,ue=e.useActionState,le=e.useCallback,de=e.useContext,me=e.useDebugValue,xe=e.useDeferredValue,fe=e.useEffect,ge=e.useEffectEvent,ve=e.useId,be=e.useImperativeHandle,he=e.useInsertionEffect,ye=e.useLayoutEffect,Ee=e.useMemo,_e=e.useOptimistic,we=e.useReducer,ke=e.useRef,Re=e.useState,Se=e.useSyncExternalStore,Ne=e.useTransition,Ce=e.version,s=e;import c from"/data/component-code/shared/react-dom-client.mjs";var f=c.createRoot,Ie=c.hydrateRoot,Me=c.version;import{ArrowUpRightIcon as N,BinocularsIcon as C,CogIcon as T,ShieldCheckIcon as I}from"/data/component-code/shared/pkg-14a7f5b66e16a893.mjs";import{Slot as k}from"/data/component-code/shared/pkg-ebab582119ecee43.mjs";import{cva as R}from"/data/component-code/shared/pkg-5d4d9063e68917ff.mjs";import{clsx as _}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as w}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function g(...t){return w(_(t))}import p from"/data/component-code/shared/react-jsx-runtime.mjs";var Be=p.Fragment,r=p.jsx,a=p.jsxs;var S=R("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),u=x(({className:t,variant:o,size:n,asChild:b=!1,...h},y)=>r(b?k:"button",{className:g(S({variant:o,size:n,className:t})),ref:y,...h}));u.displayName="Button";var M=[{icon:I,title:"Real-Time Protection",description:"Stay alert with instant notifications and smart security monitoring."},{icon:T,title:"Smart & Simple Setup",description:"Install easily in minutes with no complex tools or wiring."},{icon:C,title:"Peace of Mind Anywhere",description:"Monitor and control your home from anywhere, anytime."}];function l(){return a("div",{className:"mx-auto max-w-(--breakpoint-xl) px-6 py-24 text-center",id:"why-choose-us",children:[r("strong",{className:"font-medium text-muted-foreground text-sm uppercase tracking-wide",children:"Why Choose Us"}),r("h2",{className:"mx-auto mt-5 max-w-[32ch] text-4xl/tight font-medium tracking-tight text-balance",children:"Pioneering smart assistants for two decades"}),r("p",{className:"mt-5 text-muted-foreground text-xl -tracking-[0.01em] sm:text-2xl",children:"We are constantly always keep pace with the time."}),r("div",{className:"mt-16 flex flex-wrap justify-center gap-4",children:M.map(t=>a("div",{className:"relative w-full overflow-hidden rounded-lg border bg-linear-to-b from-foreground/3 px-6 py-10 sm:max-w-xs",children:[r(O,{}),a("div",{className:"isolate flex flex-col items-center gap-2",children:[r(t.icon,{className:"size-14 stroke-[1.5px] text-foreground"}),r("h3",{className:"mt-8 font-medium text-xl tracking-[-0.005em]",children:t.title}),r("p",{className:"text-balance text-base text-muted-foreground",children:t.description}),a(u,{className:"mt-6",children:["Learn More ",r(N,{})]})]})]},t.title))})]})}function O(){return r("div",{className:"absolute inset-0 -top-px -left-px",style:{backgroundImage:`
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
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
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
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,maskComposite:"intersect",WebkitMaskComposite:"source-in"}})}var A=l,d=class extends m{state={error:null};static getDerivedStateFromError(o){return window.__previewError=String(o),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(o)}}render(){return this.state.error?s.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function V({children:t}){return s.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),t}var i={},L=f(document.getElementById("root"));function v(){window.__previewValues=i,L.render(s.createElement(d,{key:JSON.stringify(i)},s.createElement(V,null,s.createElement(A,i))))}v();addEventListener("message",t=>{if(t.source!==parent||t.data?.type!=="vislexicon:props")return;let o=t.data.values;if(!(!o||typeof o!="object")){for(let n of[])Object.hasOwn(o,n)&&["string","number","boolean"].includes(typeof o[n])&&(i[n]=o[n]);v()}});window.__previewMounted=!0;
