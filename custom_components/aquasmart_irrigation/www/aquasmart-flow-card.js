var Et=Object.defineProperty;var St=Object.getOwnPropertyDescriptor;var v=(r,t,e,i)=>{for(var s=i>1?void 0:i?St(t,e):t,n=r.length-1,o;n>=0;n--)(o=r[n])&&(s=(i?o(t,e,s):o(s))||s);return i&&s&&Et(t,e,s),s};var I=globalThis,F=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ct=new WeakMap,N=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(F&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=ct.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&ct.set(e,t))}return t}toString(){return this.cssText}},dt=r=>new N(typeof r=="string"?r:r+"",void 0,G),O=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((i,s,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[n+1],r[0]);return new N(e,r,G)},lt=(r,t)=>{if(F)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),s=I.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,r.appendChild(i)}},Q=F?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return dt(e)})(r):r;var{is:Ct,defineProperty:Rt,getOwnPropertyDescriptor:Tt,getOwnPropertyNames:kt,getOwnPropertySymbols:Pt,getPrototypeOf:Nt}=Object,$=globalThis,ht=$.trustedTypes,Ot=ht?ht.emptyScript:"",Mt=$.reactiveElementPolyfillSupport,M=(r,t)=>r,U={toAttribute(r,t){switch(t){case Boolean:r=r?Ot:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},Z=(r,t)=>!Ct(r,t),pt={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:Z};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),$.litPropertyMetadata??($.litPropertyMetadata=new WeakMap);var g=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=pt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&Rt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:n}=Tt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:s,set(o){let c=s?.call(this);n?.call(this,o),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??pt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=Nt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,i=[...kt(e),...Pt(e)];for(let s of i)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let s of i)e.unshift(Q(s))}else t!==void 0&&e.push(Q(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){let n=(i.converter?.toAttribute!==void 0?i.converter:U).toAttribute(e,i.type);this._$Em=t,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let n=i.getPropertyOptions(s),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:U;this._$Em=s;let c=o.fromAttribute(e,n.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(t!==void 0){let o=this.constructor;if(s===!1&&(n=this[t]),i??(i=o.getPropertyOptions(t)),!((i.hasChanged??Z)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},o){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,n]of i){let{wrapped:o}=n,c=this[s];o!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,n,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};g.elementStyles=[],g.shadowRootOptions={mode:"open"},g[M("elementProperties")]=new Map,g[M("finalized")]=new Map,Mt?.({ReactiveElement:g}),($.reactiveElementVersions??($.reactiveElementVersions=[])).push("2.1.2");var L=globalThis,ut=r=>r,W=L.trustedTypes,mt=W?W.createPolicy("lit-html",{createHTML:r=>r}):void 0,$t="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,bt="?"+b,Ut=`<${bt}>`,E=document,q=()=>E.createComment(""),z=r=>r===null||typeof r!="object"&&typeof r!="function",nt=Array.isArray,Ht=r=>nt(r)||typeof r?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ft=/-->/g,vt=/>/g,A=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_t=/'/g,gt=/"/g,xt=/^(?:script|style|textarea|title)$/i,ot=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),u=ot(1),Qt=ot(2),Xt=ot(3),S=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),yt=new WeakMap,w=E.createTreeWalker(E,129);function At(r,t){if(!nt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return mt!==void 0?mt.createHTML(t):t}var Lt=(r,t)=>{let e=r.length-1,i=[],s,n=t===2?"<svg>":t===3?"<math>":"",o=H;for(let c=0;c<e;c++){let a=r[c],l,p,d=-1,m=0;for(;m<a.length&&(o.lastIndex=m,p=o.exec(a),p!==null);)m=o.lastIndex,o===H?p[1]==="!--"?o=ft:p[1]!==void 0?o=vt:p[2]!==void 0?(xt.test(p[2])&&(s=RegExp("</"+p[2],"g")),o=A):p[3]!==void 0&&(o=A):o===A?p[0]===">"?(o=s??H,d=-1):p[1]===void 0?d=-2:(d=o.lastIndex-p[2].length,l=p[1],o=p[3]===void 0?A:p[3]==='"'?gt:_t):o===gt||o===_t?o=A:o===ft||o===vt?o=H:(o=A,s=void 0);let f=o===A&&r[c+1].startsWith("/>")?" ":"";n+=o===H?a+Ut:d>=0?(i.push(l),a.slice(0,d)+$t+a.slice(d)+b+f):a+b+(d===-2?c:f)}return[At(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},D=class r{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0,c=t.length-1,a=this.parts,[l,p]=Lt(t,e);if(this.el=r.createElement(l,i),w.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=w.nextNode())!==null&&a.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith($t)){let m=p[o++],f=s.getAttribute(d).split(b),x=/([.?@])?(.*)/.exec(m);a.push({type:1,index:n,name:x[2],strings:f,ctor:x[1]==="."?et:x[1]==="?"?it:x[1]==="@"?st:T}),s.removeAttribute(d)}else d.startsWith(b)&&(a.push({type:6,index:n}),s.removeAttribute(d));if(xt.test(s.tagName)){let d=s.textContent.split(b),m=d.length-1;if(m>0){s.textContent=W?W.emptyScript:"";for(let f=0;f<m;f++)s.append(d[f],q()),w.nextNode(),a.push({type:2,index:++n});s.append(d[m],q())}}}else if(s.nodeType===8)if(s.data===bt)a.push({type:2,index:n});else{let d=-1;for(;(d=s.data.indexOf(b,d+1))!==-1;)a.push({type:7,index:n}),d+=b.length-1}n++}}static createElement(t,e){let i=E.createElement("template");return i.innerHTML=t,i}};function R(r,t,e=r,i){if(t===S)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl,n=z(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,e,i)),i!==void 0?(e._$Co??(e._$Co=[]))[i]=s:e._$Cl=s),s!==void 0&&(t=R(r,s._$AS(r,t.values),s,i)),t}var tt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??E).importNode(e,!0);w.currentNode=s;let n=w.nextNode(),o=0,c=0,a=i[0];for(;a!==void 0;){if(o===a.index){let l;a.type===2?l=new j(n,n.nextSibling,this,t):a.type===1?l=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(l=new rt(n,this,t)),this._$AV.push(l),a=i[++c]}o!==a?.index&&(n=w.nextNode(),o++)}return w.currentNode=E,s}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},j=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=R(this,t,e),z(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ht(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(E.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=D.createElement(At(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let n=new tt(s,this),o=n.u(this.options);n.p(e),this.T(o),this._$AH=n}}_$AC(t){let e=yt.get(t.strings);return e===void 0&&yt.set(t.strings,e=new D(t)),e}k(t){nt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let n of t)s===e.length?e.push(i=new r(this.O(q()),this.O(q()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=ut(t).nextSibling;ut(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(t,e=this,i,s){let n=this.strings,o=!1;if(n===void 0)t=R(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==S,o&&(this._$AH=t);else{let c=t,a,l;for(t=n[0],a=0;a<n.length-1;a++)l=R(this,c[i+a],e,a),l===S&&(l=this._$AH[a]),o||(o=!z(l)||l!==this._$AH[a]),l===h?t=h:t!==h&&(t+=(l??"")+n[a+1]),this._$AH[a]=l}o&&!s&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},et=class extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},it=class extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},st=class extends T{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=R(this,t,e,0)??h)===S)return;let i=this._$AH,s=t===h&&i!==h||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==h&&(i===h||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},rt=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){R(this,t)}};var qt=L.litHtmlPolyfillSupport;qt?.(D,j),(L.litHtmlVersions??(L.litHtmlVersions=[])).push("3.3.3");var wt=(r,t,e)=>{let i=e?.renderBefore??t,s=i._$litPart$;if(s===void 0){let n=e?.renderBefore??null;i._$litPart$=s=new j(t.insertBefore(q(),n),n,void 0,e??{})}return s._$AI(r),s};var B=globalThis,_=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=wt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};_._$litElement$=!0,_.finalized=!0,B.litElementHydrateSupport?.({LitElement:_});var zt=B.litElementPolyfillSupport;zt?.({LitElement:_});(B.litElementVersions??(B.litElementVersions=[])).push("4.2.2");var K=r=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};var Dt={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:Z},jt=(r=Dt,t,e)=>{let{kind:i,metadata:s}=e,n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),i==="accessor"){let{name:o}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(o,a,r,!0,c)},init(c){return c!==void 0&&this.C(o,void 0,r,c),c}}}if(i==="setter"){let{name:o}=e;return function(c){let a=this[o];t.call(this,c),this.requestUpdate(o,a,r,!0,c)}}throw Error("Unsupported decorator location: "+i)};function k(r){return(t,e)=>typeof e=="object"?jt(r,t,e):((i,s,n)=>{let o=s.hasOwnProperty(n);return s.constructor.createProperty(n,i),o?Object.getOwnPropertyDescriptor(s,n):void 0})(r,t,e)}function P(r){return k({...r,state:!0,attribute:!1})}var Bt="aquasmart_irrigation",C=class extends _{constructor(){super(...arguments);this._deviceFilter=e=>e.identifiers?.some(([i])=>i===Bt)??!1}setConfig(e){this._config=e}render(){return!this.hass||!this._config?u``:u`
      <div class="form">
        <ha-device-picker
          .hass=${this.hass}
          .value=${this._config.device_id}
          .deviceFilter=${this._deviceFilter}
          label="AquaSmart zariadenie"
          @value-changed=${this._deviceChanged}
        ></ha-device-picker>
        <ha-textfield
          label="Názov karty (voliteľné)"
          .value=${this._config.title??""}
          @input=${this._titleChanged}
        ></ha-textfield>
      </div>
    `}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){let i=e.target.value;this._updateConfig({title:i||void 0})}_updateConfig(e){if(!this._config)return;let i={...this._config,...e};this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}};C.styles=O`
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }
  `,v([k({attribute:!1})],C.prototype,"hass",2),v([P()],C.prototype,"_config",2),C=v([K("aquasmart-flow-card-editor")],C);var Vt=.0981,It=2,Ft=5e3,Zt=new Set(["unknown","unavailable",void 0]),y=class extends _{constructor(){super(...arguments);this._entitiesRequested=!1}static async getConfigElement(){return document.createElement("aquasmart-flow-card-editor")}static getStubConfig(e){let i=e.devices;return{type:"custom:aquasmart-flow-card",device_id:(i?Object.values(i).find(n=>n.identifiers?.some(([o])=>o==="aquasmart_irrigation")):void 0)?.id??""}}setConfig(e){if(!e.device_id)throw new Error("Vyber AquaSmart zariadenie v nastaveniach karty.");this._config=e,this._clearRetry(),this._entitiesRequested=!1,this._entities=void 0,this._error=void 0}getCardSize(){return 6}connectedCallback(){super.connectedCallback(),this._entities||(this._entitiesRequested=!1),this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),this._clearRetry()}_clearRetry(){this._retryTimer!==void 0&&(window.clearTimeout(this._retryTimer),this._retryTimer=void 0)}updated(e){super.updated(e),this.hass&&this._config&&!this._entitiesRequested&&(this._entitiesRequested=!0,this._fetchDiagramEntities())}async _fetchDiagramEntities(){let e=this._config;try{let i=await this.hass.callWS({type:"aquasmart_irrigation/diagram_entities",device_id:e.device_id});if(e!==this._config)return;this._entities=i,this._error=void 0}catch(i){if(e!==this._config)return;let s=i?.message??String(i);this._error=`Nepodarilo sa na\u010D\xEDta\u0165 entity diagramu: ${s}`,this.isConnected&&(this._retryTimer=window.setTimeout(()=>{this._retryTimer=void 0,this._entitiesRequested=!1,this.requestUpdate()},Ft))}}_state(e){if(e)return this.hass.states[e]?.state}_attr(e,i){if(e)return this.hass.states[e]?.attributes?.[i]}_num(e){let i=this._state(e);if(Zt.has(i))return;let s=parseFloat(i);return Number.isNaN(s)?void 0:s}render(){if(this._error)return u`<ha-card><div class="message error">${this._error}</div></ha-card>`;if(!this._entities)return u`<ha-card><div class="message">Načítavam diagram...</div></ha-card>`;let e=this._entities,i=this._state(e.winter_mode_entity_id)==="on",s=this._attr(e.winter_mode_entity_id,"valves_open")!==!1,n=e.zones.filter(V=>this._state(V.switch_entity_id)==="on"),o=this._state(e.pump_running_entity_id)==="on",c=!i&&(n.length>0||o),a=this._num(e.tank_level_entity_id),l=this._attr(e.tank_level_entity_id,"volume_liters"),p=a!==void 0?(a*Vt).toFixed(2):"--",d=a!==void 0?Math.min(100,Math.max(0,a/It*100)):0,m=this._num(e.pressure_entity_id),f=this._num(e.target_pressure_entity_id),x=this._state(e.pump_fault_entity_id)==="on",J=this._num(e.flow_rate_entity_id),at=this._num(e.flow_total_entity_id);return u`
      <ha-card .header=${this._config?.title||"Hydraulick\xFD diagram pr\xFAdenia vody"}>
        <div class="card-content">
          ${i?u`<div class="status-pill winter ${s?"":"fault"}">
                <ha-icon icon=${s?"mdi:snowflake":"mdi:snowflake-alert"}></ha-icon>
                <span
                  >${s?"Zimn\xFD re\u017Eim \xB7 vyp\xFA\u0161\u0165anie":"Zimn\xFD re\u017Eim \xB7 ventily NEOTVOREN\xC9 (zastavenie \u010Derpadla nepotvrden\xE9)"}</span
                >
              </div>`:u`<div class="status-pill ${c?"active":""}">
                <span class="pulse-dot"></span>
                <span
                  >${n.length>0?`Z\xE1vlaha akt\xEDvna (${n.length} ${n.length===1?"z\xF3na":"z\xF3ny"} otvoren\xE9)`:"Syst\xE9m v pohotovosti"}</span
                >
              </div>`}

          <div class="nodes">
            <div class="node ${c?"active":""}">
              <div class="node-header"><ha-icon icon="mdi:database"></ha-icon><span>Zdroj vody</span></div>
              <div class="tank-bar"><div class="tank-fill" style="width: ${d}%"></div></div>
              <div class="metric-main">${a!==void 0?`${a.toFixed(2)} m`:"--"}</div>
              <div class="metric-sub">${l!==void 0?`${Math.round(l)} L`:"--"}</div>
              <div class="detail">Hydrostatický tlak: <strong>${p} bar</strong></div>
            </div>

            <div class="connector ${c?"active":""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node ${o?"active":""} ${x?"fault":""}">
              <div class="node-header"><ha-icon icon="mdi:gauge"></ha-icon><span>Tlakový okruh</span></div>
              <div class="metric-main">${m!==void 0?`${m.toFixed(2)} bar`:"--"}</div>
              <div class="metric-sub">
                Cieľ: ${f!==void 0?`${f.toFixed(2)} bar`:"--"}
              </div>
              <div class="detail">
                Čerpadlo: <strong>${o?"ZAPNUT\xC9":i?"Vypnut\xE9 (zimn\xFD re\u017Eim)":"Vypnut\xE9"}</strong>
              </div>
              ${x?u`<div class="detail fault-text">Porucha meniča</div>`:h}
            </div>

            <div class="connector ${c?"active":""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node ${J?"active":""}">
              <div class="node-header"><ha-icon icon="mdi:chart-line"></ha-icon><span>Prietokomer</span></div>
              <div class="metric-main">${J!==void 0?`${J.toFixed(1)} L/min`:"--"}</div>
              <div class="metric-sub">Spolu: ${at!==void 0?`${at.toFixed(0)} L`:"--"}</div>
            </div>

            <div class="connector ${c?"active":""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node manifold">
              <div class="node-header"><ha-icon icon="mdi:source-branch"></ha-icon><span>Rozdeľovač & zóny</span></div>
              <div class="branches">
                ${e.zones.map(V=>i?this._renderWinterBranch(V,s):this._renderBranch(V))}
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `}_renderBranch(e){let i=this._state(e.switch_entity_id)==="on",s=this._num(e.session_volume_entity_id),n=this._attr(e.switch_entity_id,"friendly_name")??e.zone_id,o=i&&s!==void 0?`${s.toFixed(1)} L`:i?"be\u017E\xED":"0 L";return u`
      <div class="branch ${i?"active":""}">
        <div class="branch-info">
          <span class="branch-name">${n}</span>
          <span class="branch-flow">${o}</span>
        </div>
        <div class="branch-actions">
          <span class="branch-tag">${i?"OTVOREN\xDD":"ZATVOREN\xDD"}</span>
          ${i?u`<mwc-button dense @click=${()=>this._closeZone(e.switch_entity_id)}>Zavrieť</mwc-button>`:h}
        </div>
      </div>
    `}_renderWinterBranch(e,i){let s=this._attr(e.switch_entity_id,"friendly_name")??e.zone_id;return u`
      <div class="branch winter ${i?"":"fault"}">
        <div class="branch-info">
          <span class="branch-name">${s}</span>
          <span class="branch-flow">Bez tlaku</span>
        </div>
        <div class="branch-actions">
          <span class="branch-tag">${i?"VYP\xDA\u0160\u0164ANIE":"NEOTVOREN\xDD"}</span>
        </div>
      </div>
    `}_closeZone(e){this.hass.callService("switch","turn_off",{entity_id:e})}};y.styles=O`
    :host {
      display: block;
    }
    .card-content {
      padding: 0 16px 16px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.85rem;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }
    .status-pill.active {
      background: rgba(var(--rgb-success-color, 76, 175, 80), 0.18);
      color: var(--success-color);
    }
    .status-pill ha-icon {
      --mdc-icon-size: 16px;
    }
    .status-pill.winter {
      background: rgba(var(--rgb-info-color, 3, 169, 244), 0.15);
      color: var(--info-color, var(--primary-color));
    }
    .status-pill.winter.fault {
      background: rgba(var(--rgb-error-color, 219, 68, 55), 0.15);
      color: var(--error-color);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .status-pill.active .pulse-dot {
      animation: pulse 1.5s infinite;
    }

    .nodes {
      display: flex;
      align-items: stretch;
      gap: 4px;
      flex-wrap: wrap;
    }
    .node {
      flex: 1 1 160px;
      min-width: 150px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 12px;
      transition:
        border-color 0.3s,
        box-shadow 0.3s;
    }
    .node.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color);
    }
    .node.fault {
      border-color: var(--error-color);
      box-shadow: 0 0 0 1px var(--error-color);
    }
    .node-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }
    .node-header ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 18px;
    }
    .metric-main {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .metric-sub {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    .detail {
      font-size: 0.78rem;
      color: var(--secondary-text-color);
    }
    .fault-text {
      color: var(--error-color);
      font-weight: 500;
    }

    .tank-bar {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      overflow: hidden;
      margin-bottom: 8px;
    }
    .tank-fill {
      height: 100%;
      background: var(--info-color, var(--primary-color));
      transition: width 0.5s;
    }

    .connector {
      flex: 0 0 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .connector .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--divider-color);
    }
    .connector.active .dot {
      background: var(--primary-color);
      animation: flow 1.2s infinite;
    }
    .connector.active .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .connector.active .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    .manifold {
      flex-basis: 220px;
    }
    .branches {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .branch {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      border-radius: 8px;
      background: var(--secondary-background-color);
    }
    .branch.active {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }
    .branch.winter {
      background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
    }
    .branch.winter .branch-tag {
      background: var(--info-color, var(--primary-color));
      color: var(--text-primary-color, #fff);
    }
    .branch.winter.fault .branch-tag {
      background: var(--error-color);
    }
    .branch-info {
      display: flex;
      flex-direction: column;
    }
    .branch-name {
      font-size: 0.85rem;
      color: var(--primary-text-color);
    }
    .branch-flow {
      font-size: 0.72rem;
      color: var(--secondary-text-color);
    }
    .branch-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .branch-tag {
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .branch.active .branch-tag {
      background: var(--success-color);
      color: var(--text-primary-color, #fff);
    }

    .message {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .message.error {
      color: var(--error-color);
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
    }
    @keyframes flow {
      0% {
        opacity: 0.2;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
      100% {
        opacity: 0.2;
        transform: scale(0.8);
      }
    }

    @media (max-width: 600px) {
      .nodes {
        flex-direction: column;
      }
      .connector {
        flex-direction: row;
        width: 100%;
        height: 16px;
      }
    }
  `,v([k({attribute:!1})],y.prototype,"hass",2),v([P()],y.prototype,"_config",2),v([P()],y.prototype,"_entities",2),v([P()],y.prototype,"_error",2),y=v([K("aquasmart-flow-card")],y);window.customCards=window.customCards||[];window.customCards.push({type:"aquasmart-flow-card",name:"AquaSmart Flow Card",description:"Real-time hydraulick\xFD diagram pr\xFAdenia vody pre AquaSmart Irrigation Controller."});export{y as AquaSmartFlowCard};
