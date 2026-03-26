import { useState, useEffect } from "react";

const USERS_KEY = "kidmed_users_v1";
const SESSION_KEY = "kidmed_session_v1";
const DATA_PREFIX = "kidmed_data_v2_";
const ONBOARDING_KEY = "kidmed_onboarded_v1";

function loadUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; } }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function loadSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function loadUserData(email) { try { return JSON.parse(localStorage.getItem(DATA_PREFIX + email)) || getDefaultData(); } catch { return getDefaultData(); } }
function saveUserData(email, data) { localStorage.setItem(DATA_PREFIX + email, JSON.stringify(data)); }
function getDefaultData() { return { kids: [], log: [] }; }
function hasSeenOnboarding(email) { try { return JSON.parse(localStorage.getItem(ONBOARDING_KEY + email)); } catch { return false; } }
function markOnboardingSeen(email) { localStorage.setItem(ONBOARDING_KEY + email, "true"); }
function generateId() { return Math.random().toString(36).slice(2, 10); }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function formatTime(t) { const [h,m]=t.split(":"); const hh=parseInt(h); return `${hh>12?hh-12:hh||12}:${m} ${hh>=12?"PM":"AM"}`; }
function formatTimestamp(ts) { return new Date(ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}); }

function PillIcon({color="#fff",size=16}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display:"inline-block",verticalAlign:"middle"}}><rect x="3" y="9" width="18" height="6" rx="3" fill={color} opacity="0.2"/><rect x="3" y="9" width="9" height="6" rx="3" fill={color} opacity="0.65"/><rect x="3" y="9" width="18" height="6" rx="3" stroke={color} strokeWidth="1.5"/></svg>);}
function CheckIcon({size=16}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);}

const inp={width:"100%",background:"#0e0e22",border:"1.5px solid #252545",borderRadius:14,color:"#e8e8ff",padding:"13px 16px",fontSize:15,fontFamily:"'Nunito',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:12,transition:"border-color .2s"};
const primaryBtn=(bg)=>({width:"100%",background:bg,border:"none",borderRadius:14,color:"#fff",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:16,padding:"14px",cursor:"pointer"});

function Modal({open,onClose,title,children}){if(!open)return null;return(<div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(8,8,18,0.85)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}><div style={{background:"#13132a",borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -12px 48px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><span style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:18,color:"#fff"}}>{title}</span><button onClick={onClose} style={{background:"#1e1e3a",border:"none",borderRadius:10,color:"#888",width:34,height:34,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>{children}</div></div>);}
function Toast({toast}){if(!toast)return null;return(<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:toast.ok?"#0e2a1a":"#2a0e0e",border:`1.5px solid ${toast.ok?"#22c55e":"#ef4444"}`,color:toast.ok?"#22c55e":"#f87171",borderRadius:16,padding:"13px 24px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,zIndex:300,animation:"fadeIn .2s ease",maxWidth:"88vw",textAlign:"center",boxShadow:"0 4px 32px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>{toast.msg}</div>);}


// ── Reminder helpers ─────────────────────────────────────────────────────────
function ReminderModal({open, onClose, kid, med, showToast}){
  if(!open||!kid||!med) return null;
  const times = med.times||[];

  const handleClock = () => {
    window.location.href = "clock-alarm://";
    setTimeout(()=>{ try{window.location.href="clock://";}catch(e){} }, 400);
    onClose();
  };

  const handleReminder = (t) => {
    const title = encodeURIComponent("💊 "+kid.name+": "+med.name+" "+med.dose);
    const notes = encodeURIComponent("Give "+med.name+" "+med.dose+" at "+formatTime(t));
    window.location.href = "x-apple-reminderkit://REMCDReminder/?title="+title+"&notes="+notes;
    setTimeout(()=>{ try{window.location.href="x-apple-reminders://";}catch(e){} }, 500);
    onClose();
  };

  const copyText = (t) => {
    const text = "💊 "+kid.name+": "+med.name+" "+med.dose+" at "+formatTime(t);
    if(navigator.clipboard){ navigator.clipboard.writeText(text).then(()=>showToast("Copied to clipboard!")).catch(()=>{}); }
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(8,8,18,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#13132a",borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -12px 48px rgba(0,0,0,0.7)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontWeight:900,fontSize:17,color:"#fff"}}>Set Reminder</span>
          <button onClick={onClose} style={{background:"#1e1e3a",border:"none",borderRadius:10,color:"#888",width:34,height:34,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <p style={{fontSize:13,color:"#6666aa",marginBottom:18}}>{kid.avatar} {kid.name} · {med.name} {med.dose}</p>

        <div style={{background:"#0a0a1c",borderRadius:14,padding:"12px 14px",marginBottom:18,border:"1px solid #1e1e3a"}}>
          <p style={{fontSize:12,color:"#6666aa",lineHeight:1.8}}>
            <strong style={{color:"#f59e0b"}}>⏰ Clock Alarm</strong> — opens the iPhone Clock app. Tap <strong style={{color:"#ccc"}}>+</strong> to add an alarm at the time below. Fires even when the phone is locked.<br/>
            <strong style={{color:"#818cf8"}}>📋 Reminder</strong> — opens the Reminders app with the medication pre-filled. Add a date & time and it will alert you.<br/>
            <strong style={{color:"#5555aa"}}>📋 Copy</strong> — copies the text so you can paste it anywhere.
          </p>
        </div>

        {times.map(t=>(
          <div key={t} style={{background:"#0e0e22",borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid #1e1e3a"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontWeight:900,fontSize:18,color:"#fff"}}>{formatTime(t)}</span>
              <span style={{fontSize:11,color:"#5555aa",background:"#13132a",borderRadius:8,padding:"3px 10px",fontWeight:700}}>{med.name}</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={handleClock} style={{flex:1,background:"#0d1f0d",border:"1.5px solid #22c55e55",borderRadius:12,color:"#22c55e",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:12,padding:"10px 4px",cursor:"pointer"}}>⏰ Clock Alarm</button>
              <button onClick={()=>handleReminder(t)} style={{flex:1,background:"#0e0e1f",border:"1.5px solid #818cf855",borderRadius:12,color:"#818cf8",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:12,padding:"10px 4px",cursor:"pointer"}}>📋 Reminder</button>
              <button onClick={()=>copyText(t)} style={{background:"#13132a",border:"1.5px solid #2a2a50",borderRadius:12,color:"#5555aa",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,padding:"10px 12px",cursor:"pointer"}}>Copy</button>
            </div>
          </div>
        ))}

        <p style={{fontSize:11,color:"#2a2a4a",textAlign:"center",marginTop:8,lineHeight:1.6}}>
          Clock alarms fire 100% reliably even when your phone is locked or KidMeds is closed.
        </p>
      </div>
    </div>
  );
}

function OnboardingScreen({user,onDone}){
  const [step,setStep]=useState(0);
  const slides=[
    {emoji:"👋",title:`Welcome, ${user.firstName}!`,desc:"KidMeds helps you track your children's medications — so you never miss a dose or wonder if you already gave it.",cta:"Let's get started"},
    {emoji:"👶",title:"Step 1 — Add your child",desc:'Go to the Kids tab and tap "+ Add Child". Give them a name, pick a fun avatar, and choose a colour.',cta:"Got it"},
    {emoji:"💊",title:"Step 2 — Add their medications",desc:'Inside each child\'s card, tap "+ Add Medication". Enter the name, dose, schedule times, and any notes like "with food".',cta:"Got it"},
    {emoji:"✅",title:"Step 3 — Mark as given",desc:'Every day the Today tab shows all pending doses. Tap "Give ✓" after giving the medication. It logs the time automatically.',cta:"Got it"},
    {emoji:"🔔",title:"About reminders",desc:"Tap the Reminders button and allow notifications. The app will alert you at the scheduled time while the app is open or recently used on iPhone. For best results install KidMeds to your home screen.",sub:"Tip: tap Install in the app header to add it to your iPhone home screen.",cta:"Take me to the app →"},
  ];
  const slide=slides[step];
  const isLast=step===slides.length-1;
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(150deg,#0a0a18,#110d28 60%,#0d1820)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"'Nunito',sans-serif",color:"#fff",maxWidth:480,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{display:"flex",gap:8,marginBottom:48}}>{slides.map((_,i)=>(<div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?"#6d28d9":"#1e1e3a",transition:"all .3s"}}/>))}</div>
      <div key={step} style={{textAlign:"center",animation:"fadeSlide .35s ease both",width:"100%"}}>
        <div style={{fontSize:72,marginBottom:24}}>{slide.emoji}</div>
        <h2 style={{fontSize:26,fontWeight:900,marginBottom:16,lineHeight:1.2}}>{slide.title}</h2>
        <p style={{fontSize:16,color:"#8888bb",lineHeight:1.7}}>{slide.desc}</p>
        {slide.sub&&<div style={{background:"#1a1030",border:"1px solid #6d28d944",borderRadius:14,padding:"12px 16px",marginTop:16}}><p style={{fontSize:13,color:"#a78bfa",lineHeight:1.6}}>💡 {slide.sub}</p></div>}
      </div>
      <div style={{width:"100%",marginTop:48}}>
        <button onClick={()=>{if(isLast){markOnboardingSeen(user.email);onDone();}else setStep(s=>s+1);}} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>{slide.cta}</button>
        {!isLast&&<button onClick={()=>{markOnboardingSeen(user.email);onDone();}} style={{background:"none",border:"none",color:"#44446a",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%",marginTop:16,textAlign:"center"}}>Skip intro</button>}
      </div>
    </div>
  );
}

function InstallScreen({onDismiss}){
  const steps=[{icon:"🌐",title:"Open in Safari",desc:"Must be Safari on iPhone — not Chrome or Firefox."},{icon:"⬆️",title:"Tap the Share button",desc:"Tap the Share icon at the bottom of Safari."},{icon:"📲",title:"Add to Home Screen",desc:'Tap "Add to Home Screen" in the share sheet.'},{icon:"✏️",title:"Name it & Add",desc:'Name it "KidMeds" then tap "Add".'},{icon:"💊",title:"Done!",desc:"KidMeds opens full screen like a real app."}];
  return(<div style={{minHeight:"100vh",background:"linear-gradient(150deg,#0a0a18,#110d28 60%,#0d1820)",fontFamily:"'Nunito',sans-serif",color:"#fff",maxWidth:480,margin:"0 auto",padding:"52px 24px 48px"}}><div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:52}}>📲</div><h1 style={{fontSize:24,fontWeight:900,marginTop:10}}>Install on iPhone</h1><p style={{color:"#5555aa",fontSize:14,marginTop:6}}>Add KidMeds to your home screen</p></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>{steps.map((s,i)=>(<div key={i} style={{background:"#13132a",borderRadius:16,padding:"14px 16px",display:"flex",gap:14,alignItems:"flex-start",border:"1.5px solid #1e1e3c"}}><div style={{fontSize:26,minWidth:32,textAlign:"center"}}>{s.icon}</div><div><div style={{fontWeight:800,fontSize:14,marginBottom:3}}><span style={{background:"#6d28d9",borderRadius:5,fontSize:10,fontWeight:900,padding:"2px 6px",marginRight:7}}>{i+1}</span>{s.title}</div><div style={{fontSize:13,color:"#6666aa",lineHeight:1.5}}>{s.desc}</div></div></div>))}</div><button onClick={onDismiss} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>Got it — Back to App →</button></div>);
}

function ForgotPasswordScreen({onBack}){
  const [step,setStep]=useState("request");
  const [email,setEmail]=useState("");
  const [token,setToken]=useState("");
  const [newPass,setNewPass]=useState("");
  const [confirm,setConfirm]=useState("");
  const [err,setErr]=useState("");
  const [msg,setMsg]=useState("");
  const requestReset=()=>{setErr("");const users=loadUsers();const user=users[email.toLowerCase().trim()];if(!user)return setErr("No account found.");const code=Math.floor(100000+Math.random()*900000).toString();localStorage.setItem("kidmed_reset_"+email.toLowerCase().trim(),JSON.stringify({code,expiry:Date.now()+3600000,email:email.toLowerCase().trim()}));setMsg(code);setStep("sent");};
  const verifyCode=()=>{setErr("");const raw=localStorage.getItem("kidmed_reset_"+email.toLowerCase().trim());if(!raw)return setErr("No reset request found.");const{code,expiry}=JSON.parse(raw);if(Date.now()>expiry)return setErr("Code expired.");if(token.trim()!==code)return setErr("Incorrect code.");setStep("reset");};
  const resetPassword=()=>{setErr("");if(newPass.length<6)return setErr("Min 6 characters.");if(newPass!==confirm)return setErr("Passwords don't match.");const users=loadUsers();const key=email.toLowerCase().trim();users[key]={...users[key],password:newPass};saveUsers(users);localStorage.removeItem("kidmed_reset_"+key);setStep("done");};
  return(<div style={{minHeight:"100vh",background:"linear-gradient(150deg,#0a0a18,#110d28 60%,#0d1820)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Nunito',sans-serif"}}><div style={{width:"100%",maxWidth:400}}><button onClick={onBack} style={{background:"none",border:"none",color:"#5555aa",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:28}}>← Back</button><div style={{textAlign:"center",marginBottom:28}}><div style={{fontSize:48}}>🔐</div><h1 style={{fontSize:24,fontWeight:900,color:"#fff",marginTop:10}}>{step==="done"?"Password updated!":"Forgot Password"}</h1></div><div style={{background:"rgba(18,16,38,0.92)",borderRadius:24,padding:"28px 24px",border:"1.5px solid #202040"}}>{step==="request"&&(<><input style={inp} type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&requestReset()}/>{err&&<div style={{background:"#2a0e0e",border:"1px solid #7f1d1d",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#fca5a5",fontSize:13,fontWeight:600}}>⚠️ {err}</div>}<button onClick={requestReset} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>Send Reset Code →</button></>)}{step==="sent"&&(<><div style={{background:"#0e1e2a",border:"1.5px solid #0ea5e9",borderRadius:14,padding:"14px 16px",marginBottom:20}}><p style={{fontSize:12,color:"#0ea5e9",fontWeight:800,marginBottom:6}}>📧 EMAIL NOT CONFIGURED YET</p><p style={{fontSize:13,color:"#7ab8d4",lineHeight:1.6}}>Your reset code is:</p><div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:6,textAlign:"center",marginTop:12,background:"#0a1520",borderRadius:10,padding:"12px 0"}}>{msg}</div></div><input style={{...inp,fontSize:22,letterSpacing:6,textAlign:"center",fontWeight:900}} type="text" placeholder="──────" maxLength={6} value={token} onChange={e=>setToken(e.target.value.replace(/\D/g,""))}/>{err&&<div style={{background:"#2a0e0e",border:"1px solid #7f1d1d",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#fca5a5",fontSize:13,fontWeight:600}}>⚠️ {err}</div>}<button onClick={verifyCode} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>Verify Code →</button></>)}{step==="reset"&&(<><input style={inp} type="password" placeholder="New password" value={newPass} onChange={e=>setNewPass(e.target.value)}/><input style={inp} type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)}/>{err&&<div style={{background:"#2a0e0e",border:"1px solid #7f1d1d",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#fca5a5",fontSize:13,fontWeight:600}}>⚠️ {err}</div>}<button onClick={resetPassword} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>Update Password →</button></>)}{step==="done"&&(<><div style={{textAlign:"center",padding:"8px 0 20px"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><p style={{color:"#22c55e",fontWeight:700,fontSize:15}}>Password updated successfully.</p></div><button onClick={onBack} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>Log In →</button></>)}</div></div></div>);
}

function AuthScreen({onAuth}){
  const [mode,setMode]=useState("login");
  const [f,setF]=useState({firstName:"",lastName:"",email:"",password:""});
  const [err,setErr]=useState("");
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const submit=()=>{setErr("");const users=loadUsers();if(mode==="register"){if(!f.firstName.trim()||!f.lastName.trim())return setErr("Please enter your full name.");if(!f.email.includes("@"))return setErr("Enter a valid email.");if(f.password.length<6)return setErr("Password must be at least 6 characters.");if(users[f.email.toLowerCase()])return setErr("Account already exists.");const user={firstName:f.firstName.trim(),lastName:f.lastName.trim(),email:f.email.toLowerCase().trim(),password:f.password,createdAt:Date.now()};users[user.email]=user;saveUsers(users);saveSession(user);onAuth(user);}else{const user=users[f.email.toLowerCase().trim()];if(!user)return setErr("No account found.");if(user.password!==f.password)return setErr("Incorrect password.");saveSession(user);onAuth(user);}};
  if(mode==="forgot")return <ForgotPasswordScreen onBack={()=>setMode("login")}/>;
  return(<div style={{minHeight:"100vh",background:"linear-gradient(150deg,#0a0a18,#110d28 60%,#0d1820)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden",fontFamily:"'Nunito',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}input:focus{border-color:#6d28d9!important;}`}</style><div style={{position:"absolute",top:"25%",right:"-70px",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,#7c3aed20,transparent 70%)"}}/>  <div style={{textAlign:"center",marginBottom:32,animation:"fadeIn .5s ease"}}><div style={{fontSize:58,animation:"pulse 3s ease-in-out infinite"}}>💊</div><h1 style={{fontSize:32,fontWeight:900,color:"#fff",marginTop:10,letterSpacing:-1}}>KidMeds</h1><p style={{color:"#5555aa",fontSize:14,marginTop:5,fontWeight:600}}>Your family medication tracker</p></div><div style={{background:"rgba(18,16,38,0.92)",backdropFilter:"blur(12px)",borderRadius:24,padding:"32px 28px",width:"100%",maxWidth:400,border:"1.5px solid #202040",boxShadow:"0 24px 64px rgba(0,0,0,0.5)",animation:"fadeIn .4s ease .1s both"}}><div style={{display:"flex",background:"#0a0a1c",borderRadius:14,padding:4,marginBottom:26}}>{[["login","Log In"],["register","Register"]].map(([id,label])=>(<button key={id} onClick={()=>{setMode(id);setErr("");}} style={{flex:1,padding:10,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:14,background:mode===id?"#6d28d9":"transparent",color:mode===id?"#fff":"#4a4a88",transition:"all .2s"}}>{label}</button>))}</div>{mode==="register"&&<div style={{display:"flex",gap:10}}><input style={{...inp,flex:1}} placeholder="First name" value={f.firstName} onChange={set("firstName")}/><input style={{...inp,flex:1}} placeholder="Last name" value={f.lastName} onChange={set("lastName")}/></div>}<input style={inp} type="email" placeholder="Email address" value={f.email} onChange={set("email")} autoComplete="email"/><input style={inp} type="password" placeholder="Password" value={f.password} onChange={set("password")} onKeyDown={e=>e.key==="Enter"&&submit()}/>{err&&<div style={{background:"#2a0e0e",border:"1px solid #7f1d1d",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#fca5a5",fontSize:13,fontWeight:600}}>⚠️ {err}</div>}<button onClick={submit} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>{mode==="login"?"Log In →":"Create Account →"}</button>{mode==="login"&&<button onClick={()=>setMode("forgot")} style={{background:"none",border:"none",color:"#5555aa",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%",marginTop:14,textAlign:"center",textDecoration:"underline"}}>Forgot your password?</button>}{mode==="register"&&<p style={{fontSize:11,color:"#2a2a4a",textAlign:"center",marginTop:14}}>Your data is saved locally on this device.</p>}</div></div>);
}

function ReminderBanner({onEnable,onDismiss}){
  return(<div style={{margin:"0 24px 20px",background:"linear-gradient(135deg,#1a0e30,#12102a)",borderRadius:18,padding:"16px 18px",border:"1.5px solid #6d28d944",position:"relative"}}><button onClick={onDismiss} style={{position:"absolute",top:10,right:12,background:"none",border:"none",color:"#44446a",fontSize:20,cursor:"pointer"}}>×</button><div style={{fontWeight:900,fontSize:15,marginBottom:6}}>🔔 Enable Reminders</div><p style={{fontSize:13,color:"#8888bb",lineHeight:1.6,marginBottom:12}}>Get notified at the exact time each medication is due.</p><div style={{background:"#0e0e22",borderRadius:12,padding:"10px 14px",marginBottom:14,border:"1px solid #1e1e3a"}}><p style={{fontSize:12,color:"#5555aa",lineHeight:1.6}}><strong style={{color:"#a78bfa"}}>How it works:</strong> Notifications fire when the app is open or recently used on your phone. Install KidMeds to your home screen for best results — tap <strong style={{color:"#a78bfa"}}>Install</strong> in the header.</p></div><button onClick={onEnable} style={{...primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)"),fontSize:14,padding:"11px"}}>Allow Notifications →</button></div>);
}

function EmptyState({onAddChild}){
  return(<div style={{padding:"0 24px"}}><div style={{background:"linear-gradient(135deg,#13132a,#1a1035)",borderRadius:24,padding:"36px 24px",textAlign:"center",border:"1.5px dashed #3a2a60"}}><div style={{fontSize:56,marginBottom:16}}>👶</div><h2 style={{fontSize:20,fontWeight:900,marginBottom:10}}>Add your first child</h2><p style={{fontSize:14,color:"#7777aa",lineHeight:1.7,marginBottom:28}}>Start by adding a child, then set up their medications and schedule. It only takes a minute!</p><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28,textAlign:"left"}}>{[{n:"1",icon:"👶",text:"Add a child with a name & avatar"},{n:"2",icon:"💊",text:"Add their medications & doses"},{n:"3",icon:"⏰",text:"Set the daily schedule times"},{n:"4",icon:"✅",text:'Tap "Give ✓" each time you dose them'}].map(s=>(<div key={s.n} style={{display:"flex",alignItems:"center",gap:14,background:"#0e0e22",borderRadius:14,padding:"12px 16px"}}><span style={{background:"#6d28d9",borderRadius:8,fontSize:11,fontWeight:900,padding:"3px 8px",color:"#fff",minWidth:24,textAlign:"center"}}>{s.n}</span><span style={{fontSize:20}}>{s.icon}</span><span style={{fontSize:14,color:"#ccc",fontWeight:600}}>{s.text}</span></div>))}</div><button onClick={onAddChild} style={{...primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)"),fontSize:17,padding:"16px",borderRadius:16}}>👶 Add My First Child</button></div></div>);
}

export default function App(){
  const [user,setUser]=useState(()=>loadSession());
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [data,setData]=useState(()=>user?loadUserData(user.email):getDefaultData());
  const [tab,setTab]=useState("today");
  const [modal,setModal]=useState(null);
  const [modalCtx,setModalCtx]=useState({});
  const [form,setForm]=useState({});
  const [notifPerm,setNotifPerm]=useState("default");
  const [toast,setToast]=useState(null);
  const [showInstall,setShowInstall]=useState(false);
  const [showReminderBanner,setShowReminderBanner]=useState(true);
  const [reminderModal,setReminderModal]=useState({open:false,kid:null,med:null});

  useEffect(()=>{if("Notification"in window)setNotifPerm(Notification.permission);},[]);
  useEffect(()=>{if(user)saveUserData(user.email,data);},[data,user]);
  useEffect(()=>{
    if(!user)return;
    const check=()=>{const now=new Date();const hhmm=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;data.kids.forEach(kid=>{kid.meds.forEach(med=>{if(med.times.includes(hhmm)){const done=data.log.some(l=>l.kidId===kid.id&&l.medId===med.id&&l.scheduledTime===hhmm&&l.date===todayKey());if(!done&&Notification.permission==="granted")new Notification("💊 Medication reminder",{body:`${kid.avatar} ${kid.name}: ${med.name} ${med.dose} at ${formatTime(hhmm)}`});}});});};
    const iv=setInterval(check,30000);return()=>clearInterval(iv);
  },[data,user]);

  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),2800);};
  const handleAuth=u=>{setUser(u);setData(loadUserData(u.email));setTab("today");if(!hasSeenOnboarding(u.email))setShowOnboarding(true);};
  const handleLogout=()=>{clearSession();setUser(null);setData(getDefaultData());setShowOnboarding(false);};
  const requestNotif=async()=>{if(!("Notification"in window))return showToast("Notifications not supported",false);const p=await Notification.requestPermission();setNotifPerm(p);showToast(p==="granted"?"🔔 Reminders enabled!":"Notifications blocked",p==="granted");};

  const giveMed=(kid,med,scheduledTime)=>{const entry={id:generateId(),kidId:kid.id,medId:med.id,kidName:kid.name,kidAvatar:kid.avatar,kidColor:kid.color,medName:med.name,dose:med.dose,scheduledTime,time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),timestamp:Date.now(),date:todayKey(),notes:med.notes||""};setData(d=>({...d,log:[entry,...d.log]}));showToast(`✅ ${kid.avatar} ${kid.name} got ${med.name}`);};
  const isGiven=(kidId,medId,time)=>data.log.some(l=>l.kidId===kidId&&l.medId===medId&&l.scheduledTime===time&&l.date===todayKey());

  const schedule=[];
  data.kids.forEach(kid=>{kid.meds.forEach(med=>{med.times.forEach(t=>schedule.push({kid,med,time:t,given:isGiven(kid.id,med.id,t)}));});});
  schedule.sort((a,b)=>a.time.localeCompare(b.time));
  const pending=schedule.filter(x=>!x.given);
  const done=schedule.filter(x=>x.given);

  const openAddKid=()=>{setForm({name:"",avatar:"🦊",color:"#7c3aed"});setModal("addKid");};
  const saveKid=()=>{if(!form.name.trim())return showToast("Enter a name",false);setData(d=>({...d,kids:[...d.kids,{id:generateId(),name:form.name.trim(),avatar:form.avatar,color:form.color,meds:[]}]}));setModal(null);showToast(`${form.avatar} ${form.name.trim()} added!`);};
  const deleteKid=id=>{setData(d=>({...d,kids:d.kids.filter(k=>k.id!==id)}));showToast("Child removed");};
  const openAddMed=kid=>{setModalCtx({kid});setForm({name:"",dose:"",times:["08:00"],notes:""});setModal("addMed");};
  const saveMed=()=>{if(!form.name.trim()||!form.dose.trim())return showToast("Fill name and dose",false);const med={id:generateId(),name:form.name.trim(),dose:form.dose.trim(),times:form.times.filter(Boolean),notes:form.notes};setData(d=>({...d,kids:d.kids.map(k=>k.id===modalCtx.kid.id?{...k,meds:[...k.meds,med]}:k)}));setModal(null);showToast(`💊 ${form.name.trim()} added`);};
  const deleteMed=(kidId,medId)=>{setData(d=>({...d,kids:d.kids.map(k=>k.id===kidId?{...k,meds:k.meds.filter(m=>m.id!==medId)}:k)}));showToast("Medication removed");};
  const openEditMed=(kid,med)=>{setModalCtx({kid,med});setForm({name:med.name,dose:med.dose,times:[...med.times],notes:med.notes||""});setModal("editMed");};
  const saveEditMed=()=>{if(!form.name.trim()||!form.dose.trim())return showToast("Fill name and dose",false);const updated={...modalCtx.med,name:form.name.trim(),dose:form.dose.trim(),times:form.times.filter(Boolean),notes:form.notes};setData(d=>({...d,kids:d.kids.map(k=>k.id===modalCtx.kid.id?{...k,meds:k.meds.map(m=>m.id===updated.id?updated:m)}:k)}));setModal(null);showToast(`✅ ${form.name.trim()} updated`);};
  const addTime=()=>setForm(f=>({...f,times:[...f.times,"12:00"]}));
  const removeTime=i=>setForm(f=>({...f,times:f.times.filter((_,idx)=>idx!==i)}));
  const updateTime=(i,v)=>setForm(f=>({...f,times:f.times.map((t,idx)=>idx===i?v:t)}));
  const avatars=["🦊","🐻","🐼","🐨","🐯","🦁","🐸","🐧","🐙","🌟","🌈","🦄"];

  if(!user)return <AuthScreen onAuth={handleAuth}/>;
  if(showOnboarding)return <OnboardingScreen user={user} onDone={()=>setShowOnboarding(false)}/>;
  if(showInstall)return <InstallScreen onDismiss={()=>setShowInstall(false)}/>;

  return(<>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>{`*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}body{background:#090912;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a50;border-radius:4px;}@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.card{animation:slideUp .3s ease both;}.give-btn:active{transform:scale(.93);}input:focus{border-color:#6d28d9!important;}`}</style>

    <div style={{minHeight:"100vh",background:"linear-gradient(150deg,#090912,#10102a)",fontFamily:"'Nunito',sans-serif",color:"#fff",maxWidth:480,margin:"0 auto",paddingBottom:100}}>

      {/* Header */}
      <div style={{padding:"52px 24px 18px",background:"linear-gradient(180deg,#180a38,transparent)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontSize:12,color:"#5555aa",fontWeight:700,letterSpacing:.8,textTransform:"uppercase"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
            <h1 style={{fontSize:26,fontWeight:900,marginTop:4}}>💊 Hi, {user.firstName}!</h1>
            <p style={{fontSize:12,color:"#3a3a6a",marginTop:2}}>{user.firstName} {user.lastName}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,alignItems:"flex-end"}}>
            <button onClick={requestNotif} style={{background:notifPerm==="granted"?"#0e2a1a":"#1a0e2e",border:`1.5px solid ${notifPerm==="granted"?"#22c55e":"#6d28d9"}`,borderRadius:10,padding:"7px 12px",color:notifPerm==="granted"?"#22c55e":"#a78bfa",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>{notifPerm==="granted"?"🔔 ON":"🔕 Reminders"}</button>
            <button onClick={()=>setShowInstall(true)} style={{background:"#0e1824",border:"1.5px solid #0ea5e9",borderRadius:10,color:"#38bdf8",fontSize:11,fontWeight:800,padding:"6px 12px",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📲 Install</button>
            <button onClick={handleLogout} style={{background:"none",border:"1px solid #2a1414",borderRadius:10,color:"#664444",fontSize:11,fontWeight:700,padding:"6px 12px",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Log out</button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}>
          {[{l:"Pending",v:pending.length,c:"#f59e0b"},{l:"Given",v:done.length,c:"#22c55e"},{l:"Total",v:schedule.length,c:"#818cf8"}].map(s=>(<div key={s.l} style={{flex:1,background:"#13132a",borderRadius:14,padding:"11px 8px",textAlign:"center",border:"1px solid #1e1e3a"}}><div style={{fontSize:21,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:"#44446a",fontWeight:700,marginTop:2}}>{s.l}</div></div>))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,padding:"0 24px 20px"}}>
        {[["today","📅 Today"],["history","📋 History"],["kids","👶 Kids"]].map(([id,label])=>(<button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 0",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,background:tab===id?"#6d28d9":"#13132a",color:tab===id?"#fff":"#4a4a88",transition:"all .18s"}}>{label}</button>))}
      </div>

      {/* TODAY */}
      {tab==="today"&&(<>
        {showReminderBanner&&notifPerm!=="granted"&&<ReminderBanner onEnable={async()=>{await requestNotif();setShowReminderBanner(false);}} onDismiss={()=>setShowReminderBanner(false)}/>}
        <div style={{padding:"0 24px"}}>
          {data.kids.length===0&&<EmptyState onAddChild={()=>{setTab("kids");setTimeout(openAddKid,100);}}/>}
          {data.kids.length>0&&schedule.length===0&&(<div style={{background:"#13132a",borderRadius:20,padding:"28px 20px",textAlign:"center",border:"1.5px dashed #2a2a50"}}><div style={{fontSize:44,marginBottom:12}}>💊</div><h3 style={{fontSize:17,fontWeight:900,marginBottom:8}}>No medications scheduled today</h3><p style={{fontSize:14,color:"#5555aa",lineHeight:1.6,marginBottom:20}}>Go to the Kids tab and add medications with schedule times.</p><button onClick={()=>setTab("kids")} style={{...primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)"),fontSize:14,padding:"12px"}}>Go to Kids tab →</button></div>)}
          {pending.length>0&&<><p style={{fontSize:11,fontWeight:800,color:"#f59e0b",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>⏳ Pending</p>{pending.map(({kid,med,time},i)=>(<div key={kid.id+med.id+time} className="card" style={{background:"#13132a",borderRadius:18,padding:"15px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,border:"1.5px solid #1e1e3c",animationDelay:`${i*.05}s`}}><div style={{fontSize:30}}>{kid.avatar}</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}><span style={{fontWeight:800,fontSize:14}}>{kid.name}</span><span style={{background:kid.color+"28",color:kid.color,borderRadius:6,fontSize:11,fontWeight:700,padding:"2px 7px"}}>{formatTime(time)}</span></div><div style={{fontSize:13,color:"#7777aa",marginTop:3}}><PillIcon color={kid.color} size={13}/>&nbsp;<strong style={{color:"#ccc"}}>{med.name}</strong> · {med.dose}</div>{med.notes&&<div style={{fontSize:11,color:"#3a3a6a",marginTop:3}}>📝 {med.notes}</div>}</div><button className="give-btn" onClick={()=>giveMed(kid,med,time)} style={{background:`linear-gradient(135deg,${kid.color}cc,${kid.color})`,border:"none",borderRadius:12,color:"#fff",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,padding:"10px 13px",cursor:"pointer",whiteSpace:"nowrap",transition:"transform .1s"}}>Give ✓</button></div>))}</>}
          {done.length>0&&<><p style={{fontSize:11,fontWeight:800,color:"#22c55e",letterSpacing:1,textTransform:"uppercase",margin:"20px 0 12px"}}>✅ Given today</p>{done.map(({kid,med,time})=>(<div key={kid.id+med.id+time} style={{background:"#0c1a0e",borderRadius:16,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,border:"1px solid #0e2614",opacity:.8}}><div style={{fontSize:26,filter:"grayscale(.3)"}}>{kid.avatar}</div><div style={{flex:1}}><span style={{fontWeight:700,fontSize:13,color:"#aaa"}}>{kid.name} · </span><span style={{fontSize:13,color:"#666"}}>{med.name} {med.dose}</span><div style={{fontSize:11,color:"#22c55e",marginTop:2}}>✓ {formatTime(time)}</div></div><div style={{background:"#0e2614",borderRadius:10,padding:7,color:"#22c55e"}}><CheckIcon size={17}/></div></div>))}</>}
        </div>
      </>)}

      {/* HISTORY */}
      {tab==="history"&&(<div style={{padding:"0 24px"}}>{data.log.length===0?(<div style={{textAlign:"center",padding:"52px 0",color:"#2a2a55"}}><div style={{fontSize:52}}>📋</div><p style={{marginTop:14,fontWeight:800}}>No history yet</p><p style={{fontSize:13,marginTop:6,color:"#1e1e44"}}>Doses you give will appear here</p></div>):(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><p style={{fontSize:11,fontWeight:800,color:"#818cf8",letterSpacing:1,textTransform:"uppercase"}}>All doses given</p><button onClick={()=>{if(window.confirm("Clear all history?"))setData(d=>({...d,log:[]}));}} style={{background:"none",border:"1px solid #2a1414",borderRadius:8,color:"#7a3333",fontSize:11,fontWeight:700,padding:"5px 10px",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Clear</button></div>{data.log.map((e,i)=>(<div key={e.id} className="card" style={{background:"#13132a",borderRadius:15,padding:"12px 15px",marginBottom:8,display:"flex",gap:11,alignItems:"center",border:"1px solid #1e1e3a",animationDelay:`${Math.min(i,8)*.03}s`}}><div style={{fontSize:24}}>{e.kidAvatar}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:800,fontSize:13}}>{e.kidName}</div><div style={{fontSize:12,color:"#666"}}>{e.medName} · {e.dose}</div>{e.notes&&<div style={{fontSize:10,color:"#33336a",marginTop:2}}>📝 {e.notes}</div>}</div><div style={{textAlign:"right"}}><div style={{fontSize:12,color:"#22c55e",fontWeight:700}}>{e.time}</div><div style={{fontSize:10,color:"#33336a"}}>{formatTimestamp(e.timestamp)}</div></div></div>))}</>)}</div>)}

      {/* KIDS */}
      {tab==="kids"&&(<div style={{padding:"0 24px"}}>
        {data.kids.length===0&&<div style={{textAlign:"center",padding:"32px 0 20px",color:"#3a3a6a"}}><p style={{fontSize:14,fontWeight:700}}>No children added yet</p><p style={{fontSize:13,marginTop:4,color:"#2a2a55"}}>Tap the button below to get started</p></div>}
        {data.kids.map((kid,ki)=>(<div key={kid.id} className="card" style={{background:"#13132a",borderRadius:20,padding:18,marginBottom:16,border:`1.5px solid ${kid.color}33`,animationDelay:`${ki*.07}s`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:32}}>{kid.avatar}</span><div><div style={{fontWeight:900,fontSize:16}}>{kid.name}</div><div style={{fontSize:11,color:"#44446a"}}>{kid.meds.length} medication{kid.meds.length!==1?"s":""}</div></div></div><button onClick={()=>deleteKid(kid.id)} style={{background:"none",border:"1px solid #2a1414",borderRadius:8,color:"#7a3333",fontSize:17,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button></div>{kid.meds.length===0&&<div style={{background:"#0e0e22",borderRadius:12,padding:"14px",textAlign:"center",marginBottom:10}}><p style={{fontSize:13,color:"#3a3a6a"}}>No medications yet — add one below 👇</p></div>}{kid.meds.map(med=>(<div key={med.id} style={{background:"#0e0e22",borderRadius:13,padding:"11px 13px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontWeight:800,fontSize:13,color:kid.color}}><PillIcon color={kid.color} size={13}/>&nbsp;{med.name} · {med.dose}</div><div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:5}}>{med.times.map(t=><span key={t} style={{background:kid.color+"1a",color:kid.color,borderRadius:6,fontSize:11,fontWeight:700,padding:"2px 7px"}}>{formatTime(t)}</span>)}</div>{med.notes&&<div style={{fontSize:10,color:"#33336a",marginTop:4}}>📝 {med.notes}</div>}</div><div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}><button onClick={()=>setReminderModal({open:true,kid,med})} style={{background:"#1a1030",border:"1px solid #6d28d944",borderRadius:8,color:"#a78bfa",fontSize:13,cursor:"pointer",padding:"4px 7px",fontFamily:"'Nunito',sans-serif"}}>🔔</button><button onClick={()=>openEditMed(kid,med)} style={{background:"#0e1a2e",border:"1px solid #0ea5e944",borderRadius:8,color:"#38bdf8",fontSize:13,cursor:"pointer",padding:"4px 7px"}}>✏️</button><button onClick={()=>deleteMed(kid.id,med.id)} style={{background:"none",border:"none",color:"#5a2a2a",fontSize:14,cursor:"pointer",padding:"4px 7px"}}>✕</button></div></div>))}<button onClick={()=>openAddMed(kid)} style={{width:"100%",marginTop:4,background:kid.color+"10",border:`1.5px dashed ${kid.color}44`,borderRadius:12,color:kid.color,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,padding:10,cursor:"pointer"}}>+ Add Medication</button></div>))}
        <button onClick={openAddKid} style={{width:"100%",background:"linear-gradient(135deg,#6d28d922,#8b5cf611)",border:"1.5px dashed #6d28d9",borderRadius:18,color:"#a78bfa",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:15,padding:18,cursor:"pointer"}}>👶 Add Child</button>
      </div>)}
    </div>

    <ReminderModal open={reminderModal.open} onClose={()=>setReminderModal({open:false,kid:null,med:null})} kid={reminderModal.kid} med={reminderModal.med} showToast={showToast}/>
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,height:80,pointerEvents:"none",background:"linear-gradient(0deg,#090912 30%,transparent)"}}/>
    <Toast toast={toast}/>

    <Modal open={modal==="addKid"} onClose={()=>setModal(null)} title="Add Child">
      <input style={inp} placeholder="Child's name" value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <p style={{fontSize:12,color:"#44446a",fontWeight:700,marginBottom:10}}>Pick an avatar</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{avatars.map(a=>(<button key={a} onClick={()=>setForm(f=>({...f,avatar:a}))} style={{fontSize:22,background:form.avatar===a?"#6d28d933":"#0e0e22",border:form.avatar===a?"2px solid #6d28d9":"1.5px solid #1e1e3a",borderRadius:10,width:42,height:42,cursor:"pointer"}}>{a}</button>))}</div>
      <p style={{fontSize:12,color:"#44446a",fontWeight:700,marginBottom:8}}>Color</p>
      <input type="color" value={form.color||"#7c3aed"} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{width:"100%",height:44,borderRadius:10,border:"none",cursor:"pointer",marginBottom:18}}/>
      <button onClick={saveKid} style={primaryBtn("linear-gradient(135deg,#6d28d9,#8b5cf6)")}>Add Child</button>
    </Modal>

    <Modal open={modal==="addMed"} onClose={()=>setModal(null)} title={`Medication for ${modalCtx.kid?.name||""}`}>
      <input style={inp} placeholder="Medication name (e.g. Ibuprofen)" value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <input style={inp} placeholder="Dose (e.g. 5ml, 250mg)" value={form.dose||""} onChange={e=>setForm(f=>({...f,dose:e.target.value}))}/>
      <input style={inp} placeholder="Notes — with food, 7-day course…" value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
      <p style={{fontSize:12,color:"#44446a",fontWeight:700,marginBottom:8}}>Schedule times</p>
      {(form.times||[]).map((t,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><input type="time" value={t} onChange={e=>updateTime(i,e.target.value)} style={{...inp,marginBottom:0,flex:1}}/>{(form.times||[]).length>1&&<button onClick={()=>removeTime(i)} style={{background:"#2a0e0e",border:"none",borderRadius:8,color:"#ef4444",width:36,height:42,cursor:"pointer",fontSize:16}}>✕</button>}</div>))}
      <button onClick={addTime} style={{background:"none",border:"1px dashed #252548",borderRadius:10,color:"#818cf8",width:"100%",padding:8,marginBottom:16,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>+ Add time</button>
      <button onClick={saveMed} style={primaryBtn(`linear-gradient(135deg,${modalCtx.kid?.color||"#6d28d9"},${modalCtx.kid?.color||"#8b5cf6"})`)}>Save Medication</button>
    </Modal>

    <Modal open={modal==="editMed"} onClose={()=>setModal(null)} title={`Edit — ${modalCtx.med?.name||""}`}>
      <input style={inp} placeholder="Medication name" value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <input style={inp} placeholder="Dose (e.g. 5ml, 250mg)" value={form.dose||""} onChange={e=>setForm(f=>({...f,dose:e.target.value}))}/>
      <input style={inp} placeholder="Notes — with food, 7-day course…" value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
      <p style={{fontSize:12,color:"#44446a",fontWeight:700,marginBottom:8}}>Schedule times</p>
      {(form.times||[]).map((t,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><input type="time" value={t} onChange={e=>updateTime(i,e.target.value)} style={{...inp,marginBottom:0,flex:1}}/>{(form.times||[]).length>1&&<button onClick={()=>removeTime(i)} style={{background:"#2a0e0e",border:"none",borderRadius:8,color:"#ef4444",width:36,height:42,cursor:"pointer",fontSize:16}}>✕</button>}</div>))}
      <button onClick={addTime} style={{background:"none",border:"1px dashed #252548",borderRadius:10,color:"#818cf8",width:"100%",padding:8,marginBottom:16,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>+ Add time</button>
      <button onClick={saveEditMed} style={primaryBtn(`linear-gradient(135deg,${modalCtx.kid?.color||"#6d28d9"},${modalCtx.kid?.color||"#8b5cf6"})`)}>Save Changes ✓</button>
    </Modal>
  </>);
}
