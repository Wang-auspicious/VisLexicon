var i=Object.create;var n=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var T=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty;var u=(t,r)=>()=>{try{return r||t((r={exports:{}}).exports,r),r.exports}catch(e){throw r=0,e}};var m=(t,r,e,o)=>{if(r&&typeof r=="object"||typeof r=="function")for(let s of k(r))!a.call(t,s)&&s!==e&&n(t,s,{get:()=>r[s],enumerable:!(o=v(r,s))||o.enumerable});return t};var _=(t,r,e)=>(e=t!=null?i(T(t)):{},m(r||!t||!t.__esModule?n(e,"default",{value:t,enumerable:!0}):e,t));var p=u(x=>{"use strict";/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var c=Symbol.for("react.transitional.element"),f=Symbol.for("react.fragment");function j(t,r,e){var o=null;if(e!==void 0&&(o=""+e),r.key!==void 0&&(o=""+r.key),"key"in r){e={};for(var s in r)s!=="key"&&(e[s]=r[s])}else e=r;return r=e.ref,{$$typeof:c,type:t,key:o,ref:r!==void 0?r:null,props:e}}x.Fragment=f;x.jsx=j;x.jsxs=j});var d=u((P,E)=>{"use strict";E.exports=p()});var l=_(d()),R=l.default.Fragment,q=l.default.jsx,C=l.default.jsxs,M=l.default;export{R as Fragment,M as default,q as jsx,C as jsxs};
