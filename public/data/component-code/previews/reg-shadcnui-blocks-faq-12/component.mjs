import e from"/data/component-code/shared/react.mjs";var A=e.Activity,O=e.Children,d=e.Component,q=e.Fragment,M=e.Profiler,D=e.PureComponent,L=e.StrictMode,U=e.Suspense,W=e.ViewTransition,F=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,V=e.__COMPILER_RUNTIME,j=e.act,H=e.addTransitionType,Y=e.cache,z=e.cacheSignal,Q=e.captureOwnerStack,B=e.cloneElement,G=e.createContext,J=e.createElement,X=e.createRef,K=e.forwardRef,Z=e.isValidElement,$=e.lazy,ee=e.memo,te=e.startTransition,re=e.unstable_useCacheRefresh,oe=e.use,ne=e.useActionState,se=e.useCallback,ae=e.useContext,ie=e.useDebugValue,ce=e.useDeferredValue,pe=e.useEffect,le=e.useEffectEvent,ue=e.useId,de=e.useImperativeHandle,me=e.useInsertionEffect,xe=e.useLayoutEffect,fe=e.useMemo,ge=e.useOptimistic,ye=e.useReducer,he=e.useRef,ve=e.useState,we=e.useSyncExternalStore,be=e.useTransition,ke=e.version,n=e;import c from"/data/component-code/shared/react-dom-client.mjs";var m=c.createRoot,Se=c.hydrateRoot,Re=c.version;import{CircleDollarSign as f,Clock as w,Package as b,PackageX as g,Plane as k,ShieldPlus as E,Users as _,Waypoints as S}from"/data/component-code/shared/pkg-14a7f5b66e16a893.mjs";import{clsx as h}from"/data/component-code/shared/pkg-8041c05d9c9a4712.mjs";import{twMerge as v}from"/data/component-code/shared/pkg-75219ef6f3e87d6e.mjs";function x(...t){return v(h(t))}import p from"/data/component-code/shared/react-jsx-runtime.mjs";var Ae=p.Fragment,o=p.jsx,s=p.jsxs;var R=[{question:"What is your return policy?",answer:"We offer a 30-day return policy on all unused products. Please ensure the item is in original packaging when returning.",icon:b},{question:"How long does shipping take?",answer:"Shipping typically takes 3-7 business days depending on your location.",icon:w},{question:"Do you ship internationally?",answer:"Yes, we ship to most countries worldwide. Shipping fees and delivery times vary by destination.",icon:k},{question:"How can I track my order?",answer:"After your order is shipped, you'll receive an email with a tracking link. You can also track your order in your account dashboard.",icon:S},{question:"What payment methods do you accept?",answer:"We accept all major credit cards, PayPal, UPI, and net banking.",icon:f},{question:"Can I cancel or change my order?",answer:"Yes, you can cancel or modify your order within 2 hours of placing it. After that, the order may already be processed for shipment.",icon:g},{question:"Is my personal information secure?",answer:"Yes, we use industry-standard encryption to ensure your personal and payment information is secure.",icon:E},{question:"Do you offer customer support?",answer:"Absolutely. Our support team is available 24/7 via email and chat to help with any issues or questions.",icon:_},{question:"What payment methods do you accept?",answer:"We accept all major credit cards, PayPal, UPI, and net banking.",icon:f},{question:"Can I cancel or change my order?",answer:"Yes, you can cancel or modify your order within 2 hours of placing it. After that, the order may already be processed for shipment.",icon:g}];function l(){return o("div",{children:s("div",{className:"px-6 py-20 text-center",children:[o("h2",{className:"text-balance text-center font-medium text-4xl tracking-tight",children:"Help with your order"}),o("p",{className:"mt-3 text-balance text-center text-lg text-muted-foreground md:text-2xl md:tracking-[-0.015em]",children:"Find answers to common questions about our products and services"}),o("div",{className:"mx-auto mt-12 grid max-w-5xl grid-cols-1 sm:mt-16 md:grid-cols-2",children:R.map((t,r)=>s("div",{className:x("relative -ms-px -mt-px overflow-hidden border bg-card p-6 text-start","first:rounded-t-lg last:rounded-b-lg md:nth-[2]:rounded-tr-lg md:nth-last-[2]:rounded-bl-lg md:last:rounded-bl-none md:first:rounded-tr-none"),children:[s("div",{className:"isolate",children:[s("div",{className:"flex items-center gap-2 font-medium text-lg tracking-[-0.01em]",children:[o(t.icon,{className:"mr-2.5 size-5 shrink-0 text-primary"}),t.question]}),o("div",{className:"mt-2 pl-10 text-start text-base text-foreground/80",children:t.answer})]}),o("div",{className:"absolute inset-0 z-0 -ms-px -mt-0.5",style:{backgroundImage:`
        linear-gradient(to right, oklch(from var(--card-foreground) l c h / 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, oklch(from var(--card-foreground) l c h / 0.12) 1px, transparent 1px)
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
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
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
      `,maskComposite:"intersect",WebkitMaskComposite:"source-in"}})]},r))})]})})}var N=l,u=class extends d{state={error:null};static getDerivedStateFromError(r){return window.__previewError=String(r),parent.postMessage({type:"vislexicon:error"},"*"),{error:String(r)}}render(){return this.state.error?n.createElement("pre",{id:"preview-error"},this.state.error):this.props.children}};function I({children:t}){return n.useEffect(()=>{parent.postMessage({type:"vislexicon:ready"},"*")},[]),t}var i={},T=m(document.getElementById("root"));function y(){window.__previewValues=i,T.render(n.createElement(u,{key:JSON.stringify(i)},n.createElement(I,null,n.createElement(N,i))))}y();addEventListener("message",t=>{if(t.source!==parent||t.data?.type!=="vislexicon:props")return;let r=t.data.values;if(!(!r||typeof r!="object")){for(let a of[])Object.hasOwn(r,a)&&["string","number","boolean"].includes(typeof r[a])&&(i[a]=r[a]);y()}});window.__previewMounted=!0;
