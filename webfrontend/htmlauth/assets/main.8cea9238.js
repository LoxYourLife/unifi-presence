import{l as T,a as y,u as x,r as Z,c as N,w as c,Q as ce,o as u,b as i,d as ue,e as S,f as g,g as Se,h as re,i as Ie,j as Ee,k as J,m as q,n as a,t as l,p as m,q as w,s as L,v as Te,x as h,F as D,y as ge,z as Y,A as K,B as me,C as _e,D as le,E as de,G as z,H as ee,I as U,J as j,K as te,L as B,M as fe,N as ne,O as Ne,P as pe,R as Oe,S as he,T as ve,U as Re,V as we,W as Ce,X as be,Y as Ae,Z as ye}from"./vendor.19769baa.js";const Le=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const d of r)if(d.type==="childList")for(const s of d.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const d={};return r.integrity&&(d.integrity=r.integrity),r.referrerpolicy&&(d.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?d.credentials="include":r.crossorigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function n(r){if(r.ep)return;r.ep=!0;const d=o(r);fetch(r.href,d)}};Le();const De={},X={ERROR:"error",RESET_ERROR:"resetError",LOADING:"setLoading"},Ue=()=>({error:null,loading:!1}),Ve={},Fe={[X.ERROR](e,t){e.error=t},[X.RESET_ERROR](e){e.error=null},[X.LOADING](e,t){e.loading=t}};var V={name:"Global",namespaced:!0,state:Ue,actions:Ve,mutations:Fe,mutationTypes:T.exports.mapValues(X,e=>`Global/${e}`),actionTypes:T.exports.mapValues(De,e=>`Global/${e}`)};const C={LOAD_CONFIG:"loadConfig",SAVE_CONFIG:"saveConfig",LOAD_STATS:"loadStats",LOAD_CLIENTS:"loadClients",SAVE_CLIENTS:"saveClients",RESTART_SERVICE:"restartService",LOAD_SITES:"loadSites"},I={STORE_CONFIG:"storeConfig",SHOW_TWO_FACTOR:"showTwoFactor",HIDE_TWO_FACTOR:"hideTwoFactor",STORE_STATS:"storeStats",SET_LOGIN_REQUIRED:"setLoginRequired",SET_LOGIN_ERROR:"setLoginError",SET_CONNECTION_ERROR:"setConnectionError",SET_CLIENTS:"setClients",SET_CONFIG_CLIENTS:"setConfigClients",SET_SERVICE_STATUS:"setServiceStatus",SET_SITES:"setSites",SYNC_DEVICE:"syncDevice"},Pe=()=>({config:{},showTwoFactor:!1,version:null,versionError:!1,stats:{},loginRequired:!1,loginError:!1,connectionError:!1,existingClients:[],clients:[],serviceStatus:"DISCONNECTED",sites:[{label:"Default",value:"default"}]}),F=async(e,t)=>{try{e.commit(V.mutationTypes.RESET_ERROR,null,{root:!0}),await t(),e.commit(I.SET_CONNECTION_ERROR,!1)}catch(o){if(o.response){if(o.response.status===499)throw e.commit(I.SHOW_TWO_FACTOR),o;if(o.response.status===403)throw e.commit(I.SET_LOGIN_REQUIRED,!0),e.commit(I.SET_LOGIN_ERROR,!0),o;if(o.response.status===408)throw e.commit(I.SET_CONNECTION_ERROR,!0),o;const n=T.exports.get(o,"response.data.error",o.message);e.commit(V.mutationTypes.ERROR,n,{root:!0})}else e.commit(V.mutationTypes.ERROR,o.message,{root:!0});throw o}},Me={async[C.LOAD_CONFIG](e){return F(e,async()=>{const t=await y.get("/admin/plugins/unifi_presence/express/api/config");e.commit(I.STORE_CONFIG,t.data)})},async[C.SAVE_CONFIG](e){return e.commit(I.HIDE_TWO_FACTOR),e.commit(I.SET_LOGIN_ERROR,!1),F(e,async()=>{const t=await y.put("/admin/plugins/unifi_presence/express/api/config",Object.assign(e.state.config,{loginRequired:e.state.loginRequired}));e.commit(I.STORE_CONFIG,t.data)})},async[C.LOAD_STATS](e){return F(e,async()=>{const t=await y.get("/admin/plugins/unifi_presence/express/api/stats");e.commit(I.STORE_STATS,t.data),e.commit(I.SET_LOGIN_REQUIRED,!1)})},async[C.LOAD_CLIENTS](e){return F(e,async()=>{const t=await y.get("/admin/plugins/unifi_presence/express/api/clients");e.commit(I.SET_CLIENTS,t.data.clients)})},async[C.SAVE_CLIENTS](e,{mac:t,value:o}){return F(e,async()=>{const n=e.state.clients.filter(d=>d.mac!=t&&d.watched||d.mac==t&&o===!0).map(d=>{const s=Object.assign({},d);return delete s.watched,s}),r=await y.put("/admin/plugins/unifi_presence/express/api/config",{clients:n});e.commit(I.SET_CONFIG_CLIENTS,r.data.clients)})},async[C.RESTART_SERVICE](e){return F(e,async()=>{await y.post("/admin/plugins/unifi_presence/express/api/restartService")})},async[C.LOAD_SITES](e){return F(e,async()=>{const t=await y.get("/admin/plugins/unifi_presence/express/api/sites");e.commit(I.SET_SITES,t.data.sites)})}},Ge={[I.STORE_CONFIG](e,t){t.wiredTimeout||(t.wiredTimeout=30),e.config=t,e.existingClients=t.clients.map(o=>o.mac)},[I.STORE_STATS](e,t){t.version&&(e.version=t.version,e.versionError=t.versionError),t.deviceType&&(e.deviceType=t.deviceType),t.wan&&t.www&&(e.stats={wan:t.wan,www:t.www})},[I.SHOW_TWO_FACTOR](e){e.showTwoFactor=!0,e.config.token=null,e.twoFaEnabled=!0},[I.HIDE_TWO_FACTOR](e){e.showTwoFactor=!1},[I.SET_LOGIN_REQUIRED](e,t){e.loginRequired=t},[I.SET_LOGIN_ERROR](e,t){e.loginError=t,e.twoFaEnabled=!1},[I.SET_CONNECTION_ERROR](e,t){e.connectionError=t},[I.SET_CLIENTS](e,t){t=t.map(o=>(o.watched=e.existingClients.includes(o.mac),o)),e.clients=T.exports.orderBy(t,["watched","type"],["desc","desc"])},[I.SYNC_DEVICE](e,t){delete t.connected,delete t.ap;const o=e.clients.find(n=>n.mac===t.mac);o&&Object.assign(o,t)},[I.SET_CONFIG_CLIENTS](e,t){e.config.clients=t},[I.SET_SERVICE_STATUS](e,t){e.serviceStatus=t},[I.SET_SITES](e,t){e.sites=t}};var f={name:"Settings",namespaced:!0,state:Pe,actions:Me,mutations:Ge,mutationTypes:T.exports.mapValues(I,e=>`Settings/${e}`),actionTypes:T.exports.mapValues(C,e=>`Settings/${e}`)};var Q=(e,t)=>{for(const[o,n]of t)e[o]=n;return e};const ke={name:"App",setup(){const e=x();let t=null;const o=()=>{const n=`ws://${document.location.hostname}:3000/plugins/unifi_presence/api/socket`,r=new WebSocket(n,"webClient");r.onopen=d=>{t=setInterval(()=>r.send("ping"),2e4)},r.onmessage=d=>{if(d.data==="pong")return;const s=JSON.parse(d.data);switch(s.type){case"stats":return e.commit(f.mutationTypes.STORE_STATS,s.data);case"serviceStatus":return e.commit(f.mutationTypes.SET_SERVICE_STATUS,s.data.status);case"device:sync":return e.commit(f.mutationTypes.SYNC_DEVICE,s.data)}},r.onclose=()=>{clearInterval(t),setTimeout(o,5e3)}};o()}};function We(e,t,o,n,r,d){const s=Z("router-view");return u(),N(ce,{view:"hHh lpR fFf"},{default:c(()=>[i(ue,null,{default:c(()=>[i(s)]),_:1})]),_:1})}var Qe=Q(ke,[["render",We]]);const He={},P={LOAD_SETTINGS:"LOAD_SETTINGS",SAVE_SETTINGS:"SAVE_SETTINGS",LOAD_CLIENTS:"LOAD_CLIENTS",SAVE_CLIENTS:"SAVE_CLIENTS",RESTART_SERVICE:"RESTART_SERVICE"},se=async(e,t)=>{e.commit(V.mutationTypes.LOADING,!0,{root:!0});try{await t()}finally{e.commit(V.mutationTypes.LOADING,!1,{root:!0})}},qe={async[P.LOAD_SETTINGS](e){return se(e,async()=>{await e.dispatch(f.actionTypes.LOAD_CONFIG,null,{root:!0});const t=e.rootState.Settings.config;t.ipaddress&&t.username&&t.password&&(await e.dispatch(f.actionTypes.LOAD_STATS,null,{root:!0}),await e.dispatch(f.actionTypes.LOAD_SITES,null,{root:!0}))})},async[P.SAVE_SETTINGS](e){return se(e,async()=>{await e.dispatch(f.actionTypes.SAVE_CONFIG,null,{root:!0}),await e.dispatch(f.actionTypes.LOAD_STATS,null,{root:!0}),await e.dispatch(f.actionTypes.LOAD_SITES,null,{root:!0})})},async[P.LOAD_CLIENTS](e){return se(e,async()=>{T.exports.isEmpty(e.rootState.Settings.config)&&await e.dispatch(P.LOAD_SETTINGS),await e.dispatch(f.actionTypes.LOAD_CLIENTS,null,{root:!0})})},async[P.SAVE_CLIENTS](e,{mac:t,value:o}){return e.dispatch(f.actionTypes.SAVE_CLIENTS,{mac:t,value:o},{root:!0})},async[P.RESTART_SERVICE](e){return e.dispatch(f.actionTypes.RESTART_SERVICE,null,{root:!0})}};var M={name:"Actions",namespaced:!0,actions:qe,actionTypes:T.exports.mapValues(P,e=>`Actions/${e}`),mutationTypes:T.exports.mapValues(He,e=>`Actions/${e}`)},ze="/admin/plugins/unifi_presence/assets/udm.c8127c61.png",Be="/admin/plugins/unifi_presence/assets/udmpro.ee5c1a50.png";const $e={name:"UnifiController",setup(){const e=x(),t=S(()=>e.state.Settings.config),o=S(()=>e.state.Global.loading),n=S(()=>e.state.Settings.loginRequired),r=S(()=>e.state.Settings.version),d=S(()=>e.state.Settings.versionError),s=S(()=>e.state.Settings.deviceType),_=S(()=>e.state.Settings.stats),b=S(()=>e.state.Settings.serviceStatus),A=S(()=>e.state.Global.error),G=S(()=>e.state.Settings.connectionError),k=S(()=>!(n.value||A.value||G.value||r.value===null||r.value<"6.4.54"||!t.value.username||!t.value.ipaddress||!t.value.password||b.value!=="CONNECTED")),p=E=>E<3600?`${Math.round(E/60)}m`:E<86400?`${Math.round(E/60/60)}h`:`${Math.floor(E/60/60/24)}d`,R=S(()=>p(_.value.www.uptime)),W=S(()=>p(_.value.wan.stats.uptime)),O=g(!1),v=async()=>{O.value=!0,await e.dispatch(M.actionTypes.RESTART_SERVICE,null,{root:!0}),O.value=!1},H=S(()=>(s.value||"").toLowerCase().indexOf("pro")!=-1?Be:ze);return{isLoading:o,version:r,versionError:d,loginRequired:n,error:A,connected:k,stats:_,ispUptime:R,udmUptime:W,serviceStatus:b,restartLoading:O,restartService:v,image:H}}},xe={class:"text-h6"},Ye={key:0,class:"text-weight-medium text-negative"},Ke={key:1,class:"text-subtitle2"},je={key:2,class:"text-weight-medium text-negative"},Xe={class:"text-h6"},Ze={class:"text-subtitle2"},Je={class:"row"},et={class:"col-4 text-weight-light"},tt={class:"text-weight-medium"},nt={class:"col-5 text-weight-light"},st={class:"text-weight-medium"},it={class:"col-3 text-weight-light"},at={class:"text-weight-medium"},ot={class:"col-9 text-weight-light"},rt={class:"text-weight-medium"},lt={class:"col-3 text-weight-light"},dt={class:"text-weight-medium"};function ct(e,t,o,n,r,d){return u(),N(me,{class:"my-card"},{default:c(()=>[i(Se,{src:n.image,"spinner-color":"white"},null,8,["src"]),n.isLoading?(u(),N(re,{key:0,align:"center"},{default:c(()=>[i(Ie,{color:"primary",size:"3em",class:"q-mb-md"})]),_:1})):(u(),N(Ee,{key:1},{default:c(()=>[i(ge,null,{default:c(()=>[n.connected?(u(),m(D,{key:1},[i(J,null,{default:c(()=>[i(q,null,{default:c(()=>[a("div",Xe,l(n.stats.wan.name),1),a("div",Ze,l(e.$t(`SERVICE.${n.serviceStatus}`)),1),i(Te,{caption:""},{default:c(()=>[h(l(e.$t("UNIFI.VERSION",{version:n.version})),1)]),_:1})]),_:1}),i(q,{avatar:""},{default:c(()=>[i(L,{size:"40px",name:"verified",color:"light-green-7"})]),_:1})]),_:1}),i(J,null,{default:c(()=>[i(q,null,{default:c(()=>[a("div",Je,[a("div",et,[a("span",tt,l(e.$t("UNIFI.CPU"))+":",1),h(" "+l(n.stats.wan.stats.cpu)+"%",1)]),a("div",nt,[a("span",st,l(e.$t("UNIFI.MEMORY"))+":",1),h(" "+l(n.stats.wan.stats.mem)+"Mb",1)]),a("div",it,[a("span",at,l(e.$t("UNIFI.UPTIME"))+":",1),h(" "+l(n.udmUptime),1)]),a("div",ot,[a("span",rt,l(e.$t("UNIFI.ISP"))+":",1),h(" "+l(n.stats.www.isp),1)]),a("div",lt,[a("span",dt,l(e.$t("UNIFI.UPTIME"))+":",1),h(" "+l(n.ispUptime),1)])])]),_:1})]),_:1})],64)):(u(),N(J,{key:0},{default:c(()=>[i(q,null,{default:c(()=>[a("div",xe,l(e.$t(`SERVICE.${n.serviceStatus}`)),1),n.versionError?(u(),m("div",Ye,l(e.$t("COMMON.VERSION_ERROR",{version:n.version})),1)):w("",!0),n.loginRequired?(u(),m("div",Ke,l(e.$t("UNIFI.LOGIN_REQUIRED")),1)):w("",!0),n.error?(u(),m("div",je,l(n.error),1)):w("",!0)]),_:1}),i(q,{avatar:""},{default:c(()=>[i(L,{size:"40px",name:"warning_amber",color:"orange-14"})]),_:1})]),_:1}))]),_:1})]),_:1})),i(Y),i(re,null,{default:c(()=>[i(K,{class:"q-ml-md",outline:"",icon:"restart_alt",size:"sm",color:"orange-14",loading:n.restartLoading,onClick:n.restartService,"data-role":"none"},{default:c(()=>[h(l(e.$t("SERVICE.RESTART")),1)]),_:1},8,["loading","onClick"])]),_:1})]),_:1})}var ut=Q($e,[["render",ct]]);const St={name:"Page",components:{UnifiController:ut},setup(){return{}}},It={class:"q-pa-s,"},Et={class:"q-gutter-y-md bg-light-green-7"},Tt={class:"row"},gt={class:"desktop-only col-sm-5 col-md-4 col-lg-3 q-pt-md"},mt={class:"col-12 col-sm-6 col-md-7 col-lg-8"};function _t(e,t,o,n,r,d){const s=Z("UnifiController"),_=Z("router-view");return u(),m(D,null,[a("div",It,[a("div",Et,[i(_e,{"inline-label":"",dense:"",class:"text-grey-3 bg-light-green-6","active-color":"white bg-light-green-7","indicator-color":"light-green-9",align:"justify"},{default:c(()=>[i(de,{name:"mails",to:{name:"settings"},icon:"settings",label:e.$t("UNIFI.SETTINGS"),"data-role":"none"},null,8,["label"]),i(de,{name:"alarms",to:{name:"clients"},icon:"router",label:e.$t("UNIFI.DEVICES"),"data-role":"none"},null,8,["label"])]),_:1})])]),i(le,{padding:""},{default:c(()=>[a("div",Tt,[a("div",gt,[i(s)]),i(z,{class:"desktop-only"}),a("div",mt,[i(_)])])]),_:1})],64)}var ft=Q(St,[["render",_t]]),Nt=e=>({required:[t=>!!t||e("VALIDATION.REQUIRED")],topic:[t=>/^[\w-]+((?:\/[\w-]+)+)?$/.test(t)||e("VALIDATION.INVALID_TOPIC")],ipAddress:[t=>/\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(t)||e("VALIDATION.INVALID_IP")],port:[t=>t==null||/^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/.test(t)||e("VALIDATION.INVALID_PORT")]});const pt={name:"Settings",components:{},setup(){const{t:e}=ee.exports.useI18n({useScope:"global"}),t=x();t.dispatch(M.actionTypes.LOAD_SETTINGS);const o=S(()=>t.state.Settings.config),n=S(()=>t.state.Settings.showTwoFactor),r=S(()=>t.state.Settings.loginRequired),d=S(()=>t.state.Settings.versionError),s=S(()=>t.state.Settings.version),_=S(()=>t.state.Settings.sites),b=S(()=>t.state.Settings.loginError),A=S(()=>t.state.Global.loading),G=S(()=>t.state.Settings.serviceStatus),k=S(()=>G.value!=="NO_MQTT"),p=g(!1),R=[{label:e("TIMEOUT_OPTIONS.SECONDS",{count:10}),value:10},{label:e("TIMEOUT_OPTIONS.SECONDS",{count:20}),value:20},{label:e("TIMEOUT_OPTIONS.SECONDS",{count:30}),value:30},{label:e("TIMEOUT_OPTIONS.SECONDS",{count:40}),value:40},{label:e("TIMEOUT_OPTIONS.SECONDS",{count:50}),value:50},{label:e("TIMEOUT_OPTIONS.MINUTES",{count:1}),value:60},{label:e("TIMEOUT_OPTIONS.MINUTES",{count:2}),value:120},{label:e("TIMEOUT_OPTIONS.MINUTES",{count:3}),value:180},{label:e("TIMEOUT_OPTIONS.MINUTES",{count:4}),value:240},{label:e("TIMEOUT_OPTIONS.MINUTES",{count:5}),value:300}],W={topic:g(null),native:g(null),ipAddress:g(null),port:g(null),username:g(null),password:g(null),twoFa:g(null),site:g(null),wiredTimeout:g(null)},O=async()=>{const v=Object.values(W).filter(E=>E.value&&E.value.validate);if(v.forEach(E=>E.value.validate()),v.find(E=>(E.value.name==="username"||E.value.name==="password")&&b.value||E.value.name==="twoFa"&&n?!1:E.value.hasError)===void 0){p.value=!0;try{await t.dispatch(M.actionTypes.SAVE_SETTINGS)}finally{p.value=!1}}};return{config:o,showPassword:g(!0),showTwoFactor:n,isLoading:A,validationRules:Nt(e),formFields:W,saveSettings:O,isSaving:p,loginRequired:r,loginError:b,sites:_,versionError:d,version:s,hasMqtt:k,wiredTimeoutOptions:R}}},Ot={class:"row"},ht={class:"col-12"},vt={class:"text-h5 self-end"},Rt={class:"text-h5 q-mt-xl self-end"},wt={key:3,class:"row"},Ct={class:"col-6"},bt={class:"row q-pt-md"},At={class:"col-12"};function yt(e,t,o,n,r,d){return u(),m(D,null,[a("div",Ot,[a("div",ht,[a("div",vt,l(e.$t("UNIFI.PLUGIN_SETTINGS")),1),i(Y,{spaced:""}),n.hasMqtt?(u(),N(U,{key:0,name:"topic",ref:n.formFields.topic,disable:n.isSaving||n.isLoading,loading:n.isLoading,modelValue:n.config.topic,"onUpdate:modelValue":t[0]||(t[0]=s=>n.config.topic=s),label:e.$t("UNIFI.TOPIC"),hint:e.$t("UNIFI.TOPIC_HINT"),rules:n.validationRules.topic,"data-role":"none"},null,8,["disable","loading","modelValue","label","hint","rules"])):(u(),N(j,{key:1,rounded:"",class:"bg-red text-white q-mt-md"},{default:c(()=>[h(l(e.$t("UNIFI.NEED_MQTT")),1)]),_:1})),i(te,{ref:n.formFields.wiredTimeout,modelValue:n.config.wiredTimeout,"onUpdate:modelValue":t[1]||(t[1]=s=>n.config.wiredTimeout=s),disable:n.isSaving||n.isLoading,loading:n.isLoading,"emit-value":"","map-options":"",options:n.wiredTimeoutOptions,label:e.$t("UNIFI.TIMEOUT_OPTIONS"),hint:e.$t("UNIFI.TIMEOUT_OPTIONS_HINT")},null,8,["modelValue","disable","loading","options","label","hint"]),a("div",Rt,l(e.$t("UNIFI.CONTROLLER")),1),i(Y,{spaced:""}),i(B,{name:"native",ref:n.formFields.native,disable:n.isSaving||n.isLoading,loading:n.isLoading,modelValue:n.config.native,"onUpdate:modelValue":t[2]||(t[2]=s=>n.config.native=s),size:"lg",label:e.$t("UNIFI.NATIVE_HINT")},null,8,["disable","loading","modelValue","label"]),i(U,{name:"ip",ref:n.formFields.ipAddress,disable:n.isSaving||n.isLoading,loading:n.isLoading,modelValue:n.config.ipaddress,"onUpdate:modelValue":t[3]||(t[3]=s=>n.config.ipaddress=s),label:e.$t("UNIFI.IP"),hint:e.$t("UNIFI.IP_HINT"),rules:n.validationRules.ipAddress,"data-role":"none"},null,8,["disable","loading","modelValue","label","hint","rules"]),n.config.native?w("",!0):(u(),N(U,{key:2,name:"port",ref:n.formFields.port,disable:n.isSaving||n.isLoading,loading:n.isLoading,modelValue:n.config.port,"onUpdate:modelValue":t[4]||(t[4]=s=>n.config.port=s),label:e.$t("UNIFI.PORT"),hint:e.$t("UNIFI.PORT_HINT"),rules:n.validationRules.port,"data-role":"none"},null,8,["disable","loading","modelValue","label","hint","rules"])),i(U,{name:"username",ref:n.formFields.username,disable:n.isSaving||n.isLoading,loading:n.isLoading,modelValue:n.config.username,"onUpdate:modelValue":t[5]||(t[5]=s=>n.config.username=s),label:e.$t("UNIFI.USERNAME"),rules:n.validationRules.required,error:n.loginError,"data-role":"none"},null,8,["disable","loading","modelValue","label","rules","error"]),i(U,{name:"password",ref:n.formFields.password,disable:n.isSaving||n.isLoading,loading:n.isLoading,type:n.showPassword?"password":"text",modelValue:n.config.password,"onUpdate:modelValue":t[7]||(t[7]=s=>n.config.password=s),label:e.$t("UNIFI.PASSWORD"),rules:n.validationRules.required,error:n.loginError,"data-role":"none"},{append:c(()=>[i(L,{name:n.showPassword?"visibility_off":"visibility",class:"cursor-pointer",onClick:t[6]||(t[6]=s=>n.showPassword=!n.showPassword)},null,8,["name"])]),_:1},8,["disable","loading","type","modelValue","label","rules","error"]),i(te,{ref:n.formFields.site,modelValue:n.config.site,"onUpdate:modelValue":t[8]||(t[8]=s=>n.config.site=s),disable:n.isSaving||n.isLoading,loading:n.isLoading,"emit-value":"","map-options":"",options:n.sites,label:e.$t("UNIFI.SITE")},null,8,["modelValue","disable","loading","options","label"]),n.showTwoFactor?(u(),m("div",wt,[a("div",Ct,[i(U,{name:"twoFa",ref:n.formFields.twoFa,disable:n.isSaving||n.isLoading,loading:n.isLoading,type:"text",modelValue:n.config.token,"onUpdate:modelValue":t[9]||(t[9]=s=>n.config.token=s),label:e.$t("UNIFI.TWO_FA"),error:"","data-role":"none"},{append:c(()=>[i(L,{name:"lock",class:"cursor-pointer"})]),_:1},8,["disable","loading","modelValue","label"])]),i(z)])):w("",!0)])]),i(z),a("div",bt,[a("div",At,[n.versionError?(u(),N(j,{key:0,rounded:"",class:"bg-red text-white q-mt-md"},{default:c(()=>[h(l(e.$t("COMMON.VERSION_ERROR",{version:n.version})),1)]),_:1})):(u(),N(K,{key:1,loading:n.isSaving,disable:!n.isSaving&&n.isLoading,push:"",color:"light-green-7",icon:"save",size:"md",label:e.$t(n.loginRequired?"COMMON.SAVE_AND_LOGIN_BTN":"COMMON.SAVE_BTN"),onClick:n.saveSettings},null,8,["loading","disable","label","onClick"]))]),i(z)])],64)}var Lt=Q(pt,[["render",yt]]);const Dt={name:"Clients",setup(){const{t:e}=ee.exports.useI18n({useScope:"global"}),t=x(),o=S(()=>t.state.Settings.versionError),n=S(()=>t.state.Settings.version);o.value===!1&&t.dispatch(M.actionTypes.LOAD_CLIENTS);const r=S(()=>t.state.Global.loading),d=S(()=>{const v=t.state.Settings.clients.filter(E=>{const ie=E.type==="WIRELESS",ae=E.type==="WIRED",oe=E.type==="WIRELESS"&&!E.experience;return ie&&A.value!==ie||ae&&k.value!==ae||oe&&G.value===!oe?!1:p.value?!!(T.exports.lowerCase(E.name).indexOf(T.exports.lowerCase(p.value))!=-1||T.exports.lowerCase(E.mac).indexOf(T.exports.lowerCase(p.value))!=-1||E.ssid&&T.exports.lowerCase(E.ssid).indexOf(T.exports.lowerCase(p.value))!=-1):!0});if(R.value==="standard")return v;const H=["signalPercentage","watched"].includes(R.value)?"desc":"asc";return T.exports.orderBy(v,[R.value],[H])}),s=S(()=>t.state.Settings.clients.filter(v=>/google/i.test(v.system)).length>0),_=O=>O>77?"wifi":O>33?"wifi_2_bar":"wifi_1_bar",b=(O,v,H)=>{t.dispatch(M.actionTypes.SAVE_CLIENTS,{mac:O,value:v})},A=g(!0),G=g(!0),k=g(!0),p=g(""),R=g("standard"),W=[{label:e("SORTING.STANDARD"),value:"standard"},{label:e("SORTING.SELECTED"),value:"watched"},{label:e("SORTING.NAME"),value:"name"},{label:e("SORTING.SSID"),value:"ssid"},{label:e("SORTING.EXPERIENCE"),value:"signalPercentage"},{label:e("SORTING.TYPE"),value:"type"}];return{isLoading:r,clients:d,update:b,wifiIcon:_,showWifi:A,showOffline:G,showWired:k,search:p,sorting:R,sortOptions:W,versionError:o,version:n,hasAndroid:s}}},Ut=e=>(Ne("data-v-0273295d"),e=e(),pe(),e),Vt={key:1,class:"row"},Ft={class:"col-12"},Pt={class:"text-h5 self-end"},Mt={class:"row"},Gt={class:"col-3"},kt={class:"col-4"},Wt={class:"col-2"},Qt={class:"col-2"},Ht={class:"bg-light-green-7 text-white"},qt=Ut(()=>a("th",{class:"text-left"},null,-1)),zt={class:"text-left"},Bt={class:"text-left"},$t={class:"text-left"},xt={class:"text-left"},Yt={class:"text-left"},Kt={class:""},jt={key:0},Xt={key:1},Zt={key:2};function Jt(e,t,o,n,r,d){return u(),m(D,null,[n.versionError?(u(),N(j,{key:0,rounded:"",class:"bg-red text-white q-mt-md"},{default:c(()=>[h(l(e.$t("COMMON.VERSION_ERROR",{version:n.version})),1)]),_:1})):w("",!0),n.versionError?w("",!0):(u(),m("div",Vt,[a("div",Ft,[a("div",Pt,l(e.$t("UNIFI.DEVICES")),1),i(Y,{spaced:""}),a("p",null,l(e.$t("UNIFI.CLIENT_SELECTION")),1),n.hasAndroid?(u(),N(j,{key:0,dense:"",rounded:"",class:"bg-orange-13 text-white q-my-md"},{avatar:c(()=>[i(L,{name:"warning",color:"white"})]),action:c(()=>[i(K,{flat:"",color:"white",label:e.$t("UNIFI.ANDROID_DEVICE_LINK"),href:"https://www.hotsplots.de/fileadmin/Daten/Support/Downloads/Kurzanleitung_MAC-Adresse.pdf",target:"_blank"},null,8,["label"])]),default:c(()=>[h(" "+l(e.$t("UNIFI.ANDROID_DEVICES")),1)]),_:1})):w("",!0),a("div",Mt,[a("div",Gt,[i(U,{clearable:"","bottom-slots":"",modelValue:n.search,"onUpdate:modelValue":t[0]||(t[0]=s=>n.search=s),label:e.$t("UNIFI.SEARCH"),dense:""},{append:c(()=>[i(L,{name:"search"})]),_:1},8,["modelValue","label"])]),i(z),a("div",kt,[i(B,{modelValue:n.showWifi,"onUpdate:modelValue":t[1]||(t[1]=s=>n.showWifi=s),label:e.$t("UNIFI.SHOW_WIFI")},null,8,["modelValue","label"]),i(B,{modelValue:n.showWired,"onUpdate:modelValue":t[2]||(t[2]=s=>n.showWired=s),label:e.$t("UNIFI.SHOW_WIRED")},null,8,["modelValue","label"])]),a("div",Wt,[i(B,{modelValue:n.showOffline,"onUpdate:modelValue":t[3]||(t[3]=s=>n.showOffline=s),label:e.$t("UNIFI.SHOW_OFFLINE")},null,8,["modelValue","label"])]),a("div",Qt,[i(te,{modelValue:n.sorting,"onUpdate:modelValue":t[4]||(t[4]=s=>n.sorting=s),dense:"","emit-value":"","map-options":"",options:n.sortOptions,label:e.$t("UNIFI.SORT")},null,8,["modelValue","options","label"])])]),i(fe,{bordered:"",separator:"vertical"},{default:c(()=>[a("thead",Ht,[a("tr",null,[qt,a("th",zt,l(e.$t("UNIFI.NAME")),1),a("th",Bt,l(e.$t("UNIFI.MAC")),1),a("th",$t,l(e.$t("UNIFI.SSID")),1),a("th",xt,l(e.$t("UNIFI.EXPERIENCE")),1),a("th",Yt,l(e.$t("UNIFI.TYPE")),1)])]),a("tbody",Kt,[n.isLoading?(u(),m(D,{key:0},ne(10,s=>a("tr",{key:s},[(u(),m(D,null,ne(6,_=>a("td",{key:_},[i(Oe,{animation:"blink",type:"text"})])),64))])),64)):(u(!0),m(D,{key:1},ne(n.clients,s=>(u(),m("tr",{key:s.mac},[a("td",null,[i(B,{name:s.mac,"onUpdate:modelValue":[_=>n.update(s.mac,!s.watched),_=>s.watched=_],modelValue:s.watched,size:"md"},null,8,["name","onUpdate:modelValue","modelValue"])]),a("td",null,l(s.name),1),a("td",null,l(s.mac),1),a("td",null,l(s.ssid),1),s.type==="WIRELESS"&&s.signalDbm>-100?(u(),m("td",jt,[h(l(s.experience)+" ",1),i(L,{class:"float-right",name:n.wifiIcon(s.signalPercentage),size:"22px"},null,8,["name"])])):s.type==="WIRELESS"?(u(),m("td",Xt,"Offline")):(u(),m("td",Zt,"-")),a("td",null,l(s.type),1)]))),128))])]),_:1})])]))],64)}var en=Q(Dt,[["render",Jt],["__scopeId","data-v-0273295d"]]);const tn={setup(){const e=he(),t=ve();console.log(t,e)}},nn=a("h3",null,"Not Found",-1);function sn(e,t,o,n,r,d){return u(),N(le,{padding:""},{default:c(()=>[nn,i(K,{to:{name:"settings"},label:"open Settings"})]),_:1})}var an=Q(tn,[["render",sn]]),on=[{base:"/admin/plugins/unifi_presence/express",path:"/",component:ft,children:[{name:"settings",path:"",component:Lt},{name:"clients",path:"clients",component:en}]},{path:"/:pathMatch(.*)*",name:"NotFound",component:an}],rn={COMMON:{SAVE_BTN:"Speichern",SAVE_AND_LOGIN_BTN:"Speichern und Einloggen",VERSION_ERROR:"Die Version deines UniFi Controller ist kleiner als 6.4.54. Bitte aktualisiere zuerst deinen Controller um das Plugin nutzen zu k\xF6nnen. Deine aktuelle Version ist: {version}"},UNIFI:{SETTINGS:"Einstellungen",DEVICES:"Ger\xE4te",PLUGIN_SETTINGS:"Plugin Einstellungen",CONTROLLER:"UniFi Controller Einstellungen",TOPIC:"MQTT Topic",TOPIC_HINT:"Das Mqtt Topic in dem die Werte geschrieben werden sollen. Z.B. UniFi/clients. Kein Slash am Anfang oder Ende und keine Leer- oder Sonderzeichen. Das Topic wird automatisch abonniert.",IP:"IP Adresse",IP_HINT:"Gebe hier die IP Adresse des UniFi Controllers an. Stelle Sicher, dass Loxberry zugriff darauf hat.",USERNAME:"Benutzername",PASSWORD:"Passwort",SITE:"UniFi Site",NEED_MQTT:"Um dises Plugin nutzen zu k\xF6nnen, muss das MQTT Gateway Plugin in der Version >= 2.0.4 installiert sein.",CLIENTS:"UniFi Ger\xE4te",CLIENT_SELECTION:"Alle selektierten Ger\xE4te werden \xFCberwacht und an MQTT \xFCbermittelt. Alle anderen Ger\xE4te werden ignoriert. Um den Status der Ger\xE4te zu erhalten, m\xFCssen diese Selektiert werden. Es wird automatisch gespeichert.",NAME:"Name",MAC:"Mac Adresse",SSID:"WLAN SSID",EXPERIENCE:"Erfahrung / Signal",TYPE:"Typ",TWO_FA:"Bitte gebe dein 2 Faktor Code ein.",NATIVE_HINT:"Wenn du eine UniFi Dream Machine oder die Dream Machine Pro benutzt, aktiviere bitte den Schalter. Wenn dein Controller woanders l\xE4uft, dann lasse den Schalter bitte aus.",PORT:"Der port um das Dashbaord zu \xF6ffnen - sofern ben\xF6tigt.",PORT_HINT:"Wenn du einen port f\xFCr den Zugriff auf den Controller im Browser brauchst, dann geben diesen bitte hier an.",LOGIN_REQUIRED:"Ausgeloggt, Bitte neu einloggen.",VERSION:"Version {version}",CPU:"CPU",MEMORY:"Mem",UPTIME:"Aktiv",ISP:"ISP",SHOW_WIRED:"Kabelgebunden anzeigen",SHOW_WIFI:"WiFi anzeigen",SHOW_OFFLINE:"Zeige Offline",SORT:"Sortierung",SEARCH:"Suche",ANDROID_DEVICES:"Es befinden sich Android Ger\xE4te in der Liste. Android neigt dazu eine zuf\xE4llige Mac Adresse zu vergeben. Ist dieses Feature aktiviert, dann kann das Plugin keine eindeutige zuweisung des Ger\xE4tes vornehmen und die Erkennung des Ger\xE4tes funktioniert nicht. Das m\xFCsste dann deaktiviert werden.",ANDROID_DEVICE_LINK:"Hinweise zum Deaktivieren",TIMEOUT_OPTIONS:"Timeout for Kabelgebundene Ger\xE4te",TIMEOUT_OPTIONS_HINT:"UniFi erkennt selbst nicht ob ein kabelgebudenes Ger\xE4t Offline ist nicht. Die Erkennung funktioniert daher so, dass wenn \xFCber den hier definierten Zeitraum keine Daten gesendet werden, dass Ger\xE4t als Offline angezeigt wird. Es kann sein, dass ein Ger\xE4t auch mal eine Minute nichts sendet und kann dann als Ofline geziegt werden obwohl das nicht der Fall ist."},SERVICE:{WAIT_FOR_CONFIG:"Konfigurationsfehler, wartet auf \xC4nderungen",CONNECTED:"Verbunden mit UniFi Controller",DISCONNECTED:"Nicht Verbunden - Neue Verbindung wird hergestellt",UNAUTHORIZED:"Nicht eingeloggt",LOST:"UniFi Event Service nicht erreichbar",RESTART:"Hintergrund Service Neustarten",NO_MQTT:"Mqtt Plugin ist nicht installiert"},SORTING:{STANDARD:"Standard",SELECTED:"Selektiert",NAME:"Name",SSID:"WiFi SSID",EXPERIENCE:"Erfahrung",TYPE:"Typ"},VALIDATION:{REQUIRED:"Diese Feld wird zwingend ben\xF6tigt.",INVALID_TOPIC:"Das Topic darf nur alphanumerisch sein und wird mit einem / gruppiert. Beispielsweise test/topic.",INVALID_IP:"Bitte gebe eine g\xFCltige V4 IP-Addresse ein.",INVALID_PORT:"Bitte gebe einen Port zwischen 0 und 65535 an."},TIMEOUT_OPTIONS:{SECONDS:"{count} Sekunden",MINUTES:"{count} Minute | {count} Minuten"}},ln={COMMON:{SAVE_BTN:"Save",SAVE_AND_LOGIN_BTN:"Save and Login",VERSION_ERROR:"The version of your unifi controller is lower than 6.4.54. Please update your controller to be able to use the plugin. Your current version is: {version}"},UNIFI:{SETTINGS:"Settings",DEVICES:"Devices",PLUGIN_SETTINGS:"Plugin Settings",CONTROLLER:"UniFi Controller Settings",TOPIC:"MQTT Topic",TOPIC_HINT:"Specify the topic you'd like the data to be published. eg. UniFi/clients. No slash in the beginning or the end. Subscription is added automatically.",IP:"IP Address",IP_HINT:"Please enter the local IP of your UniFi controller and ensure that Loxberry has access.",USERNAME:"Username",PASSWORD:"Password",SITE:"UniFi Site",NEED_MQTT:"To use this plugin, the MQTT Gateway plugin is required. Please install the MQTT Gateway Plugin version >= 2.0.4 first.",CLIENTS:"UniFi Devices",CLIENT_SELECTION:"All clients which are selected are watched and transmitted to MQTT. All other clients are ignored. To get the state of one or more elements, simply select them. The selection is saved automatically.",NAME:"Name",MAC:"Mac Address",SSID:"WLAN SSID",EXPERIENCE:"Experience / Signal",TYPE:"Type",TWO_FA:"Please enter your 2FA code to login.",NATIVE_HINT:"If you use a UniFi Dream Machine oder Dream Machine Pro, please tick this with yes. If your controller runs somewhere else please leave that unchecked.",PORT:"UniFi port to acces the control panel",PORT_HINT:"If you do need a port to access the control panel via browser, please specifiy this port here.",LOGIN_REQUIRED:"Logged out, Please login again.",VERSION:"Version {version}",CPU:"CPU",MEMORY:"Mem",UPTIME:"Active",ISP:"ISP",SHOW_WIRED:"Show wired",SHOW_WIFI:"Show WiFi",SHOW_OFFLINE:"Show Offline",SORT:"Sorting",SEARCH:"Search",ANDROID_DEVICES:"Looks like you have android devices in your list. Android seems to use a random mac address while connecting to WiFi. When this feature is active, the plugin can't identify the device properly and detect the state. You'd need to disable this feature.",ANDROID_DEVICE_LINK:"Hint to decativate",TIMEOUT_OPTIONS:"Timeout for wired devices",TIMEOUT_OPTIONS_HINT:"UniFi can't detect if a wired is online or offline. When a wired device doen't send data in the given time window, the device will be shown as offline. Suddenly it happen's that a device doesn't send data for a minute or so and will then be shown as offline even though it might be online."},SERVICE:{WAIT_FOR_CONFIG:"Configuration issue, waiting for changes",CONNECTED:"Connected to UniFi Controller",DISCONNECTED:"Not connected - Trying to reconnect",UNAUTHORIZED:"Logged out",LOST:"UniFi Event Service not reachable",RESTART:"Restart Backround Service",NO_MQTT:"Mqtt Plugin is not installed"},SORTING:{STANDARD:"Standard",SELECTED:"Selected",NAME:"Name",SSID:"WiFi SSID",EXPERIENCE:"Experience",TYPE:"Type"},VALIDATION:{REQUIRED:"This field is required.",INVALID_TOPIC:"A topic can only be alphanumeric and separated by /. e.g. test/topic",INVALID_IP:"Plase enter a valid ip-v4.",INVALID_PORT:"Please enter a port between 0 and 65535."},TIMEOUT_OPTIONS:{SECONDS:"{count} Seconds",MINUTES:"{count} Minute | {count} Minutes"}};const $=Re(Qe),dn=we({history:Ce(),routes:on}),cn=T.exports.head((navigator.language||navigator.userLanguage||"de-DE").split("-")),un=ee.exports.createI18n({locale:cn,fallbackLocale:"en",messages:{de:rn,en:ln}}),Sn=be({modules:{[V.name]:V,[f.name]:f,[M.name]:M}});$.use(Ae,{plugins:{Loading:ye}});$.use(dn);$.use(Sn);$.use(un);$.mount("#unifiPresence");