var a=Object.create;var c=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,l=Object.prototype.hasOwnProperty;var i=(r,e)=>()=>{try{return e||r((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var f=(r,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of d(e))!l.call(r,o)&&o!==t&&c(r,o,{get:()=>e[o],enumerable:!(n=E(e,o))||n.enumerable});return r};var v=(r,e,t)=>(t=r!=null?a(j(r)):{},f(e||!r||!r.__esModule?c(t,"default",{value:r,enumerable:!0}):t,r));var p=i(m=>{"use strict";/**
 * @license React
 * react-jsx-dev-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var g=Symbol.for("react.fragment");m.Fragment=g;m.jsxDEV=void 0});var x=i((V,u)=>{"use strict";u.exports=p()});var s=v(x()),N=s.default.Fragment,T=s.default.jsxDEV,_=s.default;export{N as Fragment,_ as default,T as jsxDEV};
