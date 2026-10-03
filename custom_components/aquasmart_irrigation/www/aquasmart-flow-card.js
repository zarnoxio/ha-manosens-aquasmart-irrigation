var At=Object.defineProperty;var Et=Object.getOwnPropertyDescriptor;var f=(r,t,e,s)=>{for(var i=s>1?void 0:s?Et(t,e):t,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&At(t,e,i),i};var I=globalThis,V=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ot=new WeakMap,N=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(V&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ot.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ot.set(e,t))}return t}toString(){return this.cssText}},at=r=>new N(typeof r=="string"?r:r+"",void 0,G),O=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new N(e,r,G)},ct=(r,t)=>{if(V)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=I.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},Y=V?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return at(e)})(r):r;var{is:wt,defineProperty:St,getOwnPropertyDescriptor:Ct,getOwnPropertyNames:Pt,getOwnPropertySymbols:Rt,getPrototypeOf:Tt}=Object,y=globalThis,dt=y.trustedTypes,kt=dt?dt.emptyScript:"",Nt=y.reactiveElementPolyfillSupport,M=(r,t)=>r,U={toAttribute(r,t){switch(t){case Boolean:r=r?kt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},F=(r,t)=>!wt(r,t),lt={attribute:!0,type:String,converter:U,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),y.litPropertyMetadata??(y.litPropertyMetadata=new WeakMap);var _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=lt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&St(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:n}=Ct(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){let c=i?.call(this);n?.call(this,o),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??lt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=Tt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,s=[...Pt(e),...Rt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(Y(i))}else t!==void 0&&e.push(Y(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ct(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:U).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let n=s.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:U;this._$Em=i;let c=o.fromAttribute(e,n.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(t!==void 0){let o=this.constructor;if(i===!1&&(n=this[t]),s??(s=o.getPropertyOptions(t)),!((s.hasChanged??F)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:o}=n,c=this[i];o!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,n,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[M("elementProperties")]=new Map,_[M("finalized")]=new Map,Nt?.({ReactiveElement:_}),(y.reactiveElementVersions??(y.reactiveElementVersions=[])).push("2.1.2");var L=globalThis,ht=r=>r,Z=L.trustedTypes,pt=Z?Z.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,$t="?"+b,Ot=`<${$t}>`,w=document,q=()=>w.createComment(""),D=r=>r===null||typeof r!="object"&&typeof r!="function",rt=Array.isArray,Mt=r=>rt(r)||typeof r?.[Symbol.iterator]=="function",Q=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ut=/-->/g,mt=/>/g,A=RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ft=/'/g,vt=/"/g,yt=/^(?:script|style|textarea|title)$/i,nt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),v=nt(1),Jt=nt(2),Gt=nt(3),S=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),gt=new WeakMap,E=w.createTreeWalker(w,129);function bt(r,t){if(!rt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}var Ut=(r,t)=>{let e=r.length-1,s=[],i,n=t===2?"<svg>":t===3?"<math>":"",o=H;for(let c=0;c<e;c++){let a=r[c],h,p,d=-1,u=0;for(;u<a.length&&(o.lastIndex=u,p=o.exec(a),p!==null);)u=o.lastIndex,o===H?p[1]==="!--"?o=ut:p[1]!==void 0?o=mt:p[2]!==void 0?(yt.test(p[2])&&(i=RegExp("</"+p[2],"g")),o=A):p[3]!==void 0&&(o=A):o===A?p[0]===">"?(o=i??H,d=-1):p[1]===void 0?d=-2:(d=o.lastIndex-p[2].length,h=p[1],o=p[3]===void 0?A:p[3]==='"'?vt:ft):o===vt||o===ft?o=A:o===ut||o===mt?o=H:(o=A,i=void 0);let m=o===A&&r[c+1].startsWith("/>")?" ":"";n+=o===H?a+Ot:d>=0?(s.push(h),a.slice(0,d)+_t+a.slice(d)+b+m):a+b+(d===-2?c:m)}return[bt(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},z=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0,c=t.length-1,a=this.parts,[h,p]=Ut(t,e);if(this.el=r.createElement(h,s),E.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=E.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(let d of i.getAttributeNames())if(d.endsWith(_t)){let u=p[o++],m=i.getAttribute(d).split(b),x=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:x[2],strings:m,ctor:x[1]==="."?tt:x[1]==="?"?et:x[1]==="@"?st:R}),i.removeAttribute(d)}else d.startsWith(b)&&(a.push({type:6,index:n}),i.removeAttribute(d));if(yt.test(i.tagName)){let d=i.textContent.split(b),u=d.length-1;if(u>0){i.textContent=Z?Z.emptyScript:"";for(let m=0;m<u;m++)i.append(d[m],q()),E.nextNode(),a.push({type:2,index:++n});i.append(d[u],q())}}}else if(i.nodeType===8)if(i.data===$t)a.push({type:2,index:n});else{let d=-1;for(;(d=i.data.indexOf(b,d+1))!==-1;)a.push({type:7,index:n}),d+=b.length-1}n++}}static createElement(t,e){let s=w.createElement("template");return s.innerHTML=t,s}};function P(r,t,e=r,s){if(t===S)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,n=D(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=i:e._$Cl=i),i!==void 0&&(t=P(r,i._$AS(r,t.values),i,s)),t}var X=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??w).importNode(e,!0);E.currentNode=i;let n=E.nextNode(),o=0,c=0,a=s[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new j(n,n.nextSibling,this,t):a.type===1?h=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(h=new it(n,this,t)),this._$AV.push(h),a=s[++c]}o!==a?.index&&(n=E.nextNode(),o++)}return E.currentNode=w,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},j=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=P(this,t,e),D(t)?t===l||t==null||t===""?(this._$AH!==l&&this._$AR(),this._$AH=l):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Mt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==l&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(w.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=z.createElement(bt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let n=new X(i,this),o=n.u(this.options);n.p(e),this.T(o),this._$AH=n}}_$AC(t){let e=gt.get(t.strings);return e===void 0&&gt.set(t.strings,e=new z(t)),e}k(t){rt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let n of t)i===e.length?e.push(s=new r(this.O(q()),this.O(q()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=ht(t).nextSibling;ht(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=l,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=l}_$AI(t,e=this,s,i){let n=this.strings,o=!1;if(n===void 0)t=P(this,t,e,0),o=!D(t)||t!==this._$AH&&t!==S,o&&(this._$AH=t);else{let c=t,a,h;for(t=n[0],a=0;a<n.length-1;a++)h=P(this,c[s+a],e,a),h===S&&(h=this._$AH[a]),o||(o=!D(h)||h!==this._$AH[a]),h===l?t=l:t!==l&&(t+=(h??"")+n[a+1]),this._$AH[a]=h}o&&!i&&this.j(t)}j(t){t===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},tt=class extends R{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===l?void 0:t}},et=class extends R{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==l)}},st=class extends R{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=P(this,t,e,0)??l)===S)return;let s=this._$AH,i=t===l&&s!==l||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==l&&(s===l||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},it=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t)}};var Ht=L.litHtmlPolyfillSupport;Ht?.(z,j),(L.litHtmlVersions??(L.litHtmlVersions=[])).push("3.3.3");var xt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let n=e?.renderBefore??null;s._$litPart$=i=new j(t.insertBefore(q(),n),n,void 0,e??{})}return i._$AI(r),i};var B=globalThis,g=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};g._$litElement$=!0,g.finalized=!0,B.litElementHydrateSupport?.({LitElement:g});var Lt=B.litElementPolyfillSupport;Lt?.({LitElement:g});(B.litElementVersions??(B.litElementVersions=[])).push("4.2.2");var W=r=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};var qt={attribute:!0,type:String,converter:U,reflect:!1,hasChanged:F},Dt=(r=qt,t,e)=>{let{kind:s,metadata:i}=e,n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),s==="accessor"){let{name:o}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(o,a,r,!0,c)},init(c){return c!==void 0&&this.C(o,void 0,r,c),c}}}if(s==="setter"){let{name:o}=e;return function(c){let a=this[o];t.call(this,c),this.requestUpdate(o,a,r,!0,c)}}throw Error("Unsupported decorator location: "+s)};function T(r){return(t,e)=>typeof e=="object"?Dt(r,t,e):((s,i,n)=>{let o=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),o?Object.getOwnPropertyDescriptor(i,n):void 0})(r,t,e)}function k(r){return T({...r,state:!0,attribute:!1})}var zt="aquasmart_irrigation",C=class extends g{constructor(){super(...arguments);this._deviceFilter=e=>e.identifiers?.some(([s])=>s===zt)??!1}setConfig(e){this._config=e}render(){return!this.hass||!this._config?v``:v`
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
    `}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){let s=e.target.value;this._updateConfig({title:s||void 0})}_updateConfig(e){if(!this._config)return;let s={...this._config,...e};this._config=s,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}};C.styles=O`
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }
  `,f([T({attribute:!1})],C.prototype,"hass",2),f([k()],C.prototype,"_config",2),C=f([W("aquasmart-flow-card-editor")],C);var jt=.0981,Bt=2,It=new Set(["unknown","unavailable",void 0]),$=class extends g{constructor(){super(...arguments);this._entitiesRequested=!1}static async getConfigElement(){return document.createElement("aquasmart-flow-card-editor")}static getStubConfig(e){let s=e.devices;return{type:"custom:aquasmart-flow-card",device_id:(s?Object.values(s).find(n=>n.identifiers?.some(([o])=>o==="aquasmart_irrigation")):void 0)?.id??""}}setConfig(e){if(!e.device_id)throw new Error("Vyber AquaSmart zariadenie v nastaveniach karty.");this._config=e,this._entitiesRequested=!1,this._entities=void 0,this._error=void 0}getCardSize(){return 6}updated(e){super.updated(e),this.hass&&this._config&&!this._entitiesRequested&&(this._entitiesRequested=!0,this._fetchDiagramEntities())}async _fetchDiagramEntities(){try{this._entities=await this.hass.callWS({type:"aquasmart_irrigation/diagram_entities",device_id:this._config.device_id})}catch(e){this._error=`Nepodarilo sa na\u010D\xEDta\u0165 entity diagramu: ${e instanceof Error?e.message:String(e)}`}}_state(e){if(e)return this.hass.states[e]?.state}_attr(e,s){if(e)return this.hass.states[e]?.attributes?.[s]}_num(e){let s=this._state(e);if(It.has(s))return;let i=parseFloat(s);return Number.isNaN(i)?void 0:i}render(){if(this._error)return v`<ha-card><div class="message error">${this._error}</div></ha-card>`;if(!this._entities)return v`<ha-card><div class="message">Načítavam diagram...</div></ha-card>`;let e=this._entities,s=e.zones.filter(J=>this._state(J.switch_entity_id)==="on"),i=this._state(e.pump_running_entity_id)==="on",n=s.length>0||i,o=this._num(e.tank_level_entity_id),c=this._attr(e.tank_level_entity_id,"volume_liters"),a=o!==void 0?(o*jt).toFixed(2):"--",h=o!==void 0?Math.min(100,Math.max(0,o/Bt*100)):0,p=this._num(e.pressure_entity_id),d=this._num(e.target_pressure_entity_id),u=this._state(e.pump_fault_entity_id)==="on",m=this._num(e.flow_rate_entity_id),x=this._num(e.flow_total_entity_id);return v`
      <ha-card .header=${this._config?.title||"Hydraulick\xFD diagram pr\xFAdenia vody"}>
        <div class="card-content">
          <div class="status-pill ${n?"active":""}">
            <span class="pulse-dot"></span>
            <span
              >${s.length>0?`Z\xE1vlaha akt\xEDvna (${s.length} ${s.length===1?"z\xF3na":"z\xF3ny"} otvoren\xE9)`:"Syst\xE9m v pohotovosti"}</span
            >
          </div>

          <div class="nodes">
            <div class="node ${n?"active":""}">
              <div class="node-header"><ha-icon icon="mdi:database"></ha-icon><span>Zdroj vody</span></div>
              <div class="tank-bar"><div class="tank-fill" style="width: ${h}%"></div></div>
              <div class="metric-main">${o!==void 0?`${o.toFixed(2)} m`:"--"}</div>
              <div class="metric-sub">${c!==void 0?`${Math.round(c)} L`:"--"}</div>
              <div class="detail">Hydrostatický tlak: <strong>${a} bar</strong></div>
            </div>

            <div class="connector ${n?"active":""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node ${i?"active":""} ${u?"fault":""}">
              <div class="node-header"><ha-icon icon="mdi:gauge"></ha-icon><span>Tlakový okruh</span></div>
              <div class="metric-main">${p!==void 0?`${p.toFixed(2)} bar`:"--"}</div>
              <div class="metric-sub">
                Cieľ: ${d!==void 0?`${d.toFixed(2)} bar`:"--"}
              </div>
              <div class="detail">Čerpadlo: <strong>${i?"ZAPNUT\xC9":"Vypnut\xE9"}</strong></div>
              ${u?v`<div class="detail fault-text">Porucha meniča</div>`:l}
            </div>

            <div class="connector ${n?"active":""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node ${m?"active":""}">
              <div class="node-header"><ha-icon icon="mdi:chart-line"></ha-icon><span>Prietokomer</span></div>
              <div class="metric-main">${m!==void 0?`${m.toFixed(1)} L/min`:"--"}</div>
              <div class="metric-sub">Spolu: ${x!==void 0?`${x.toFixed(0)} L`:"--"}</div>
            </div>

            <div class="connector ${n?"active":""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node manifold">
              <div class="node-header"><ha-icon icon="mdi:source-branch"></ha-icon><span>Rozdeľovač & zóny</span></div>
              <div class="branches">${e.zones.map(J=>this._renderBranch(J))}</div>
            </div>
          </div>
        </div>
      </ha-card>
    `}_renderBranch(e){let s=this._state(e.switch_entity_id)==="on",i=this._num(e.session_volume_entity_id),n=this._attr(e.switch_entity_id,"friendly_name")??e.zone_id,o=s&&i!==void 0?`${i.toFixed(1)} L`:s?"be\u017E\xED":"0 L";return v`
      <div class="branch ${s?"active":""}">
        <div class="branch-info">
          <span class="branch-name">${n}</span>
          <span class="branch-flow">${o}</span>
        </div>
        <div class="branch-actions">
          <span class="branch-tag">${s?"OTVOREN\xDD":"ZATVOREN\xDD"}</span>
          ${s?v`<mwc-button dense @click=${()=>this._closeZone(e.switch_entity_id)}>Zavrieť</mwc-button>`:l}
        </div>
      </div>
    `}_closeZone(e){this.hass.callService("switch","turn_off",{entity_id:e})}};$.styles=O`
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
  `,f([T({attribute:!1})],$.prototype,"hass",2),f([k()],$.prototype,"_config",2),f([k()],$.prototype,"_entities",2),f([k()],$.prototype,"_error",2),$=f([W("aquasmart-flow-card")],$);window.customCards=window.customCards||[];window.customCards.push({type:"aquasmart-flow-card",name:"AquaSmart Flow Card",description:"Real-time hydraulick\xFD diagram pr\xFAdenia vody pre AquaSmart Irrigation Controller."});export{$ as AquaSmartFlowCard};
