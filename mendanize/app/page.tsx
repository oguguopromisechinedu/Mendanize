<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mendanize | Start a Blog with AI — Grow, Monetize & Succeed</title>
<meta name="description" content="Mendanize is the #1 beginner system for starting, growing, and monetizing a blog with AI tools. No experience needed. Follow the 4-step roadmap.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">

<style>
/* ========================================================
   MENDANIZE — HOMEPAGE
   Theme : Warm dark editorial — deep ink + electric amber
   Fonts : Bricolage Grotesque (display) + Instrument Sans
   Vibe  : Premium beginner guide. Confident. Trustworthy.
======================================================== */

:root {
  --ink:        #0E0E12;
  --ink-2:      #16161D;
  --ink-3:      #1E1E28;
  --ink-4:      #252532;
  --amber:      #F59E0B;
  --amber-lt:   #FCD34D;
  --amber-glow: rgba(245,158,11,0.18);
  --amber-dim:  rgba(245,158,11,0.08);
  --white:      #FAFAF8;
  --off:        #C9C9BE;
  --muted:      #7A7A8C;
  --border:     rgba(255,255,255,0.07);
  --border-h:   rgba(245,158,11,0.4);
  --green:      #22D65F;
  --blue:       #60A5FA;
  --red:        #F87171;
  --r:          16px;
  --r-lg:       24px;
  --ease:       cubic-bezier(.4,0,.2,1);
  --t:          0.28s;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}

body{
  font-family:'Instrument Sans',sans-serif;
  background:var(--ink);
  color:var(--white);
  line-height:1.65;
  overflow-x:hidden;
}

img{display:block;max-width:100%}
a{text-decoration:none;color:inherit}
ul{list-style:none}
button{cursor:pointer;font-family:inherit}

/* ── Layout ── */
.wrap{max-width:1180px;margin:0 auto;padding:0 28px}
.sec{padding:100px 0}
.sec-sm{padding:64px 0}

/* ── Type ── */
h1,h2,h3,h4,h5{
  font-family:'Bricolage Grotesque',sans-serif;
  line-height:1.12;
  font-weight:800;
}

/* ── Pill tag ── */
.pill{
  display:inline-flex;align-items:center;gap:7px;
  background:var(--amber-dim);color:var(--amber);
  border:1px solid var(--amber-glow);
  border-radius:100px;padding:5px 16px;
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:11.5px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;gap:9px;
  padding:14px 30px;border-radius:12px;border:none;
  font-family:'Bricolage Grotesque',sans-serif;
  font-weight:700;font-size:15px;
  text-decoration:none;white-space:nowrap;
  transition:transform var(--t) var(--ease),
             box-shadow var(--t) var(--ease),
             background var(--t) var(--ease),
             border-color var(--t) var(--ease);
}
.btn-amber{
  background:var(--amber);color:var(--ink);
}
.btn-amber:hover{
  background:var(--amber-lt);
  transform:translateY(-2px);
  box-shadow:0 12px 40px var(--amber-glow);
}
.btn-outline{
  background:transparent;color:var(--white);
  border:1.5px solid var(--border);
}
.btn-outline:hover{
  border-color:var(--amber);color:var(--amber);
  transform:translateY(-2px);
}
.btn-wide{width:100%;justify-content:center;padding:16px}

/* ── Card base ── */
.card{
  background:var(--ink-3);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  transition:border-color var(--t) var(--ease),
             transform var(--t) var(--ease),
             box-shadow var(--t) var(--ease);
}
.card:hover{
  border-color:var(--border-h);
  transform:translateY(-5px);
  box-shadow:0 24px 60px rgba(0,0,0,.35);
}

/* ── Section header ── */
.sh{text-align:center;margin-bottom:60px}
.sh .pill{margin-bottom:18px}
.sh h2{font-size:clamp(30px,4vw,50px);margin-bottom:16px}
.sh p{font-size:17px;color:var(--muted);max-width:560px;margin:0 auto;line-height:1.75}

/* ── Scroll reveal ── */
.rv{
  opacity:0;transform:translateY(30px);
  transition:opacity .65s var(--ease),transform .65s var(--ease);
}
.rv.in{opacity:1;transform:none}
.rv.d1{transition-delay:.1s}
.rv.d2{transition-delay:.2s}
.rv.d3{transition-delay:.3s}
.rv.d4{transition-delay:.4s}

/* ── Glow blobs ── */
.blob{
  position:absolute;border-radius:50%;pointer-events:none;filter:blur(90px);
}

/* ============================================================
   ANNOUNCEMENT BAR
============================================================ */
#topbar{
  background:linear-gradient(90deg,#92400E,var(--amber),#92400E);
  background-size:200% 100%;
  animation:shimmer 4s linear infinite;
  text-align:center;padding:9px 16px;
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:13px;font-weight:600;color:var(--ink);
  position:relative;z-index:200;
}
#topbar a{color:var(--ink);font-weight:800;text-decoration:underline}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ============================================================
   NAVIGATION
============================================================ */
#nav{
  position:fixed;top:36px;left:0;right:0;z-index:150;
  padding:0 28px;
  transition:top var(--t) var(--ease);
}
#nav.solid{top:0}
#nav.solid .nav-inner{
  background:rgba(14,14,18,.92);
  backdrop-filter:blur(24px);
  border-radius:0;
  border-left:none;border-right:none;border-top:none;
  border-bottom:1px solid var(--border);
}

.nav-inner{
  max-width:1180px;margin:0 auto;
  display:flex;align-items:center;justify-content:space-between;
  height:68px;
  background:rgba(14,14,18,.75);
  backdrop-filter:blur(20px);
  border:1px solid var(--border);
  border-radius:18px;padding:0 24px;
  transition:border-radius var(--t) var(--ease),
             background var(--t) var(--ease);
}

.logo{
  display:flex;align-items:center;gap:10px;
  font-family:'Bricolage Grotesque',sans-serif;
  font-weight:800;font-size:21px;color:var(--white);
}
.logo-icon{
  width:36px;height:36px;border-radius:10px;
  background:var(--amber);
  display:flex;align-items:center;justify-content:center;
  font-size:17px;flex-shrink:0;
}
.logo em{color:var(--amber);font-style:normal}

.nav-links{
  display:flex;align-items:center;gap:32px;
}
.nav-links a{
  color:var(--muted);font-size:14.5px;font-weight:500;
  transition:color var(--t) var(--ease);
}
.nav-links a:hover{color:var(--white)}

.nav-right{display:flex;align-items:center;gap:12px}

.burger{
  display:none;flex-direction:column;gap:5px;
  background:none;border:none;padding:4px;
}
.burger span{
  display:block;width:22px;height:2px;
  background:var(--white);border-radius:2px;
  transition:var(--t) var(--ease);
}

/* Mobile drawer */
.drawer{
  display:none;position:fixed;
  top:0;left:0;right:0;bottom:0;
  background:var(--ink-2);z-index:140;
  padding:100px 32px 40px;
  flex-direction:column;gap:6px;
}
.drawer.open{display:flex}
.drawer a{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:22px;font-weight:700;color:var(--white);
  padding:14px 0;border-bottom:1px solid var(--border);
}

/* ============================================================
   HERO
============================================================ */
.hero{
  min-height:100vh;
  display:flex;align-items:center;
  padding-top:140px;padding-bottom:80px;
  position:relative;overflow:hidden;
}

/* animated grid */
.hero-grid{
  position:absolute;inset:0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size:64px 64px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 40%,black,transparent);
}

/* glow orbs */
.hero-orb-1{
  width:700px;height:700px;
  background:radial-gradient(var(--amber),transparent 65%);
  opacity:.07;top:-200px;right:-100px;
}
.hero-orb-2{
  width:500px;height:500px;
  background:radial-gradient(#60A5FA,transparent 65%);
  opacity:.06;bottom:-100px;left:-80px;
}

.hero-wrap{
  position:relative;z-index:1;
  display:grid;grid-template-columns:1fr 1fr;
  gap:72px;align-items:center;
}

/* Left */
.hero-left{}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  margin-bottom:28px;
}
.pulse-dot{
  width:9px;height:9px;border-radius:50%;background:var(--green);
  box-shadow:0 0 0 0 rgba(34,214,95,.5);
  animation:pulse 2.2s infinite;
}
@keyframes pulse{
  0%,100%{box-shadow:0 0 0 0 rgba(34,214,95,.5)}
  60%{box-shadow:0 0 0 10px rgba(34,214,95,0)}
}
.badge-text{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:12.5px;font-weight:700;
  color:var(--green);letter-spacing:.09em;text-transform:uppercase;
}

.hero h1{
  font-size:clamp(42px,5.5vw,70px);
  margin-bottom:26px;
  animation:fadeUp .7s var(--ease) both;
}
.hero h1 .gold{color:var(--amber)}
.hero h1 .strike-line{
  position:relative;display:inline-block;
}
.hero h1 .strike-line::after{
  content:'';position:absolute;
  left:0;right:0;bottom:6px;height:4px;
  background:var(--amber);border-radius:2px;
  animation:growLine .8s .5s var(--ease) both;
  transform-origin:left;
}
@keyframes growLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}

.hero-sub{
  font-size:18px;color:var(--muted);
  max-width:480px;line-height:1.78;
  margin-bottom:38px;font-weight:400;
  animation:fadeUp .7s .12s var(--ease) both;
}

.hero-btns{
  display:flex;gap:14px;flex-wrap:wrap;
  margin-bottom:52px;
  animation:fadeUp .7s .22s var(--ease) both;
}

.hero-proof{
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
  animation:fadeUp .7s .32s var(--ease) both;
}
.proof-avatars{display:flex}
.proof-avatars span{
  width:34px;height:34px;border-radius:50%;
  border:2px solid var(--ink);
  display:flex;align-items:center;justify-content:center;
  font-size:15px;background:var(--ink-4);
  margin-left:-8px;
}
.proof-avatars span:first-child{margin-left:0}
.proof-text{font-size:13px;color:var(--muted)}
.proof-text strong{color:var(--white)}

/* Right — dashboard card */
.hero-right{animation:fadeIn .9s .3s var(--ease) both}

.dash-card{
  background:var(--ink-3);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  padding:30px;
  box-shadow:0 40px 100px rgba(0,0,0,.5);
  position:relative;
}

.dash-head{
  display:flex;align-items:center;gap:12px;
  margin-bottom:26px;
}
.dash-ava{
  width:44px;height:44px;border-radius:12px;
  background:linear-gradient(135deg,var(--amber),#F87171);
  display:flex;align-items:center;justify-content:center;font-size:20px;
}
.dash-title{
  font-family:'Bricolage Grotesque',sans-serif;
  font-weight:700;font-size:15px;
}
.dash-sub{font-size:12px;color:var(--muted);margin-top:2px}
.dash-live{
  margin-left:auto;display:flex;align-items:center;gap:6px;
  font-size:11px;font-weight:600;color:var(--green);
  font-family:'Bricolage Grotesque',sans-serif;
  text-transform:uppercase;letter-spacing:.08em;
}
.dash-live-dot{
  width:7px;height:7px;border-radius:50%;background:var(--green);
  animation:pulse 2s infinite;
}

.prog-list{display:flex;flex-direction:column;gap:18px}
.prog-item{}
.prog-label{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:9px;
}
.prog-name{font-size:13px;font-weight:500;display:flex;align-items:center;gap:7px}
.prog-pct{font-size:12px;font-weight:700;color:var(--amber)}
.prog-track{
  height:7px;background:var(--ink-4);
  border-radius:4px;overflow:hidden;
}
.prog-fill{
  height:100%;border-radius:4px;
  background:linear-gradient(90deg,var(--amber),var(--amber-lt));
  animation:barGrow 1.6s var(--ease) both;
}
@keyframes barGrow{from{width:0!important}}

/* Floating chips */
.chip{
  position:absolute;
  background:var(--ink-2);border:1px solid var(--border);
  border-radius:14px;padding:11px 16px;
  display:flex;align-items:center;gap:10px;
  box-shadow:0 20px 50px rgba(0,0,0,.4);
  white-space:nowrap;
}
.chip-tl{top:-22px;left:-22px;animation:bob 4s ease-in-out infinite}
.chip-br{bottom:-22px;right:-22px;animation:bob 4s 1.2s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.chip-ico{font-size:20px}
.chip-lbl{font-size:11px;color:var(--muted)}
.chip-val{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:14px}

/* ── Keyframes shared ── */
@keyframes fadeUp{
  from{opacity:0;transform:translateY(26px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes fadeIn{
  from{opacity:0}to{opacity:1}
}

/* ============================================================
   TRUST BAR
============================================================ */
.trustbar{
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  background:var(--ink-2);
  padding:24px 0;
}
.trustbar-inner{
  display:flex;align-items:center;justify-content:center;
  gap:40px;flex-wrap:wrap;
}
.tb-item{
  display:flex;align-items:center;gap:9px;
  font-size:13.5px;color:var(--muted);font-weight:500;
}
.tb-item .ico{font-size:18px}
.tb-item strong{color:var(--white)}

/* ============================================================
   SYSTEM — 4 STEPS
============================================================ */
.system{background:var(--ink-2)}

.steps{
  display:grid;grid-template-columns:repeat(4,1fr);gap:20px;
}

.step-card{
  padding:32px 26px;position:relative;overflow:hidden;
}
.step-card::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,var(--amber-glow),transparent);
  opacity:0;transition:opacity var(--t) var(--ease);
  pointer-events:none;
}
.step-card:hover::after{opacity:1}

.step-num-bg{
  position:absolute;top:16px;right:20px;
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:80px;font-weight:800;line-height:1;
  color:rgba(255,255,255,.04);user-select:none;
}
.step-no{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--amber);
  margin-bottom:18px;display:block;
}
.step-ico{font-size:38px;margin-bottom:16px;display:block}
.step-card h3{font-size:19px;margin-bottom:10px}
.step-card p{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:22px}
.step-cta{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:12.5px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;
  color:var(--amber);
  display:inline-flex;align-items:center;gap:6px;
  transition:gap var(--t) var(--ease);
}
.step-card:hover .step-cta{gap:12px}

/* ============================================================
   HOW IT WORKS
============================================================ */
.how-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:80px;align-items:center;
}

.how-label{margin-bottom:18px}
.how-grid h2{font-size:clamp(28px,3.8vw,46px);margin-bottom:20px}
.how-intro{font-size:16px;color:var(--muted);line-height:1.78;margin-bottom:44px}

.flow-steps{display:flex;flex-direction:column}
.flow-step{
  display:flex;gap:20px;padding:24px 0;
  border-bottom:1px solid var(--border);position:relative;
}
.flow-step:last-child{border-bottom:none}
.flow-line{
  position:absolute;left:23px;top:72px;bottom:0;
  width:1px;background:var(--border);
}
.flow-step:last-child .flow-line{display:none}
.flow-ico{
  width:46px;height:46px;border-radius:12px;flex-shrink:0;
  background:var(--ink-4);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  font-size:20px;position:relative;z-index:1;
  transition:background var(--t) var(--ease),border-color var(--t) var(--ease);
}
.flow-step:hover .flow-ico{
  background:var(--amber-dim);border-color:var(--border-h);
}
.flow-body h4{font-size:16px;font-weight:700;margin-bottom:5px}
.flow-body p{font-size:13.5px;color:var(--muted);line-height:1.62}

/* Terminal */
.terminal{
  background:var(--ink-2);border:1px solid var(--border);
  border-radius:var(--r-lg);overflow:hidden;
}
.term-bar{
  display:flex;align-items:center;gap:7px;
  padding:14px 20px;background:var(--ink-3);
  border-bottom:1px solid var(--border);
}
.tdot{width:12px;height:12px;border-radius:50%}
.td-r{background:#EF4444}.td-y{background:#F59E0B}.td-g{background:#22C55E}
.term-title{
  margin-left:auto;font-size:11.5px;color:var(--muted);
  font-family:'Bricolage Grotesque',sans-serif;font-weight:600;
}
.chat{display:flex;flex-direction:column;gap:18px;padding:24px}

.msg{display:flex;gap:12px;align-items:flex-start}
.msg.from-user{flex-direction:row-reverse}
.msg-ava{
  width:32px;height:32px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:14px;
}
.ai-ava{background:var(--amber-dim);border:1px solid var(--amber-glow)}
.user-ava{background:var(--ink-4);border:1px solid var(--border)}
.bubble{
  padding:11px 15px;border-radius:12px;
  font-size:13px;line-height:1.6;max-width:82%;
}
.ai-bub{background:var(--ink-4);border:1px solid var(--border)}
.user-bub{background:var(--amber);color:var(--ink);font-weight:500}
.ai-bub strong{color:var(--amber)}
.typing-dots{display:flex;gap:4px;padding:4px 0}
.typing-dots span{
  width:6px;height:6px;border-radius:50%;
  background:var(--muted);
  animation:blink 1.3s infinite;
}
.typing-dots span:nth-child(2){animation-delay:.2s}
.typing-dots span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}

/* ============================================================
   AI TOOLS
============================================================ */
.tools-sec{background:var(--ink-2)}

.tools-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:22px;
}
.tool-card{padding:28px}
.tool-top{display:flex;align-items:center;gap:16px;margin-bottom:16px}
.tool-ico{
  width:54px;height:54px;border-radius:15px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:26px;
  border:1px solid var(--border);
}
.tool-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px}
.tool-cat{font-size:12px;color:var(--muted);margin-top:3px}
.tool-desc{font-size:13.5px;color:var(--muted);line-height:1.67;margin-bottom:18px;flex:1}
.tool-tag{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 11px;border-radius:7px;
  font-size:11.5px;font-weight:700;
  font-family:'Bricolage Grotesque',sans-serif;
}
.t-free{background:rgba(34,214,95,.12);color:var(--green);border:1px solid rgba(34,214,95,.25)}
.t-freemium{background:rgba(245,158,11,.1);color:var(--amber);border:1px solid var(--amber-glow)}
.t-paid{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.2)}

.tools-cta{text-align:center;margin-top:44px}

/* ============================================================
   POPULAR ARTICLES
============================================================ */
.posts-grid{
  display:grid;
  grid-template-columns:1.55fr 1fr;
  grid-template-rows:auto auto;
  gap:24px;
}
.post-card{
  display:flex;flex-direction:column;
  overflow:hidden;
}
.post-card.featured{grid-row:1/3}

.post-thumb{
  width:100%;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  background:var(--ink-4);
}
.post-thumb.tall{aspect-ratio:4/3}
.post-thumb.short{aspect-ratio:16/9}
.post-thumb .emo{font-size:64px;line-height:1}
.post-thumb.short .emo{font-size:42px}

.post-body{padding:26px;flex:1;display:flex;flex-direction:column}
.post-meta{
  display:flex;align-items:center;gap:8px;
  margin-bottom:12px;
}
.post-cat{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--amber);
}
.post-sep{color:var(--border);font-size:14px}
.post-date{font-size:12px;color:var(--muted)}
.post-card h3{
  font-size:19px;margin-bottom:10px;line-height:1.3;
}
.post-card.sm h3{font-size:15.5px}
.post-card p{font-size:13.5px;color:var(--muted);line-height:1.65;flex:1}
.post-foot{
  display:flex;align-items:center;justify-content:space-between;
  margin-top:18px;padding-top:18px;
  border-top:1px solid var(--border);
}
.read-link{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:12.5px;font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;
  color:var(--amber);
  display:inline-flex;align-items:center;gap:6px;
  transition:gap var(--t) var(--ease);
}
.post-card:hover .read-link{gap:11px}
.read-time{font-size:12px;color:var(--muted)}

.posts-cta{text-align:center;margin-top:44px}

/* ============================================================
   WHY MENDANIZE
============================================================ */
.why{background:var(--ink-2)}
.why-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:20px;
}
.why-card{padding:32px 26px;text-align:center}
.why-ico{font-size:38px;margin-bottom:18px;display:block}
.why-card h4{font-size:16.5px;font-weight:700;margin-bottom:10px}
.why-card p{font-size:13.5px;color:var(--muted);line-height:1.65}

/* ============================================================
   TESTIMONIALS
============================================================ */
.testi-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:22px;
}
.testi-card{padding:32px}
.stars{color:var(--amber);font-size:15px;letter-spacing:3px;margin-bottom:16px}
.testi-q{
  font-size:15px;color:var(--off);
  line-height:1.72;margin-bottom:24px;font-style:italic;
}
.testi-who{display:flex;align-items:center;gap:12px}
.testi-ava{
  width:42px;height:42px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--amber),var(--blue));
  display:flex;align-items:center;justify-content:center;font-size:18px;
}
.testi-name{
  font-family:'Bricolage Grotesque',sans-serif;
  font-weight:700;font-size:14.5px;
}
.testi-role{font-size:12px;color:var(--muted);margin-top:2px}

/* ============================================================
   EMAIL OPT-IN
============================================================ */
.optin{
  background:
    radial-gradient(ellipse 70% 60% at 50% 0%, var(--amber-dim), transparent 60%),
    var(--ink-3);
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
}
.optin-wrap{
  display:grid;grid-template-columns:1fr 1fr;
  gap:72px;align-items:center;
}
.optin-left .pill{margin-bottom:20px}
.optin-left h2{font-size:clamp(26px,3.5vw,42px);margin-bottom:16px}
.optin-left p{font-size:16px;color:var(--muted);line-height:1.75;margin-bottom:28px}
.perks{display:flex;flex-direction:column;gap:11px}
.perk{display:flex;align-items:center;gap:10px;font-size:14px}
.perk .ck{color:var(--green);font-size:16px}

.optin-box{
  background:var(--ink-4);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:40px;
}
.optin-box h3{font-size:20px;font-weight:700;margin-bottom:7px}
.optin-box .sub{font-size:13.5px;color:var(--muted);margin-bottom:28px}
.field{display:flex;flex-direction:column;gap:12px}
.inp{
  background:var(--ink-2);border:1.5px solid var(--border);
  border-radius:11px;padding:14px 18px;
  color:var(--white);font-family:'Instrument Sans',sans-serif;
  font-size:15px;width:100%;outline:none;
  transition:border-color var(--t) var(--ease),box-shadow var(--t) var(--ease);
}
.inp::placeholder{color:var(--muted)}
.inp:focus{
  border-color:var(--amber);
  box-shadow:0 0 0 3px var(--amber-glow);
}
.fn{font-size:12px;color:var(--muted);text-align:center;margin-top:11px}

/* ============================================================
   ABOUT
============================================================ */
.about-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:80px;align-items:center;
}
.about-right .pill{margin-bottom:20px}
.about-right h2{font-size:clamp(26px,3.5vw,42px);margin-bottom:18px}
.about-right p{font-size:15.5px;color:var(--muted);line-height:1.78;margin-bottom:14px}
.about-right p strong{color:var(--white)}
.about-btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}

.about-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.astat{
  padding:28px 22px;text-align:center;border-radius:var(--r-lg);
}
.astat-n{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:38px;font-weight:800;color:var(--amber);
  display:block;margin-bottom:6px;
}
.astat-l{font-size:13px;color:var(--muted)}

.social-row{
  margin-top:20px;
  background:var(--ink-3);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:22px 24px;
}
.social-row p{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);margin-bottom:14px;
}
.slinks{display:flex;gap:10px;flex-wrap:wrap}
.sl{
  width:40px;height:40px;border-radius:11px;
  background:var(--ink-4);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;font-size:17px;
  transition:border-color var(--t) var(--ease),transform var(--t) var(--ease);
}
.sl:hover{border-color:var(--border-h);transform:translateY(-3px)}

/* ============================================================
   FOOTER
============================================================ */
footer{
  background:var(--ink);
  border-top:1px solid var(--border);
  padding:80px 0 40px;
}
.footer-grid{
  display:grid;grid-template-columns:2fr 1fr 1fr 1fr;
  gap:52px;margin-bottom:60px;
}
.footer-brand .logo{margin-bottom:16px}
.footer-brand p{font-size:14px;color:var(--muted);max-width:270px;line-height:1.7;margin-bottom:22px}
.footer-slinks{display:flex;gap:9px}

.fc h5{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:12px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  color:var(--off);margin-bottom:18px;
}
.flinks{display:flex;flex-direction:column;gap:11px}
.flinks a{font-size:14px;color:var(--muted);transition:color var(--t) var(--ease)}
.flinks a:hover{color:var(--white)}

.footer-bottom{
  border-top:1px solid var(--border);padding-top:32px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;
}
.footer-bottom p{font-size:13px;color:var(--muted)}
.legal{display:flex;gap:18px}
.legal a{font-size:13px;color:var(--muted);transition:color var(--t) var(--ease)}
.legal a:hover{color:var(--white)}

/* ============================================================
   RESPONSIVE
============================================================ */
@media(max-width:1050px){
  .steps{grid-template-columns:1fr 1fr}
  .tools-grid{grid-template-columns:1fr 1fr}
  .why-grid{grid-template-columns:1fr 1fr}
  .testi-grid .testi-card:last-child{display:none}
  .testi-grid{grid-template-columns:1fr 1fr}
  .footer-grid{grid-template-columns:1fr 1fr;gap:36px}
  .posts-grid{grid-template-columns:1fr}
  .post-card.featured{grid-row:auto}
}
@media(max-width:768px){
  .sec{padding:68px 0}
  .hero{padding-top:120px}
  .hero-wrap{grid-template-columns:1fr}
  .hero-right{display:none}
  .nav-links,.nav-right .btn{display:none}
  .burger{display:flex}
  .how-grid{grid-template-columns:1fr}
  .terminal{display:none}
  .optin-wrap{grid-template-columns:1fr;gap:44px}
  .about-grid{grid-template-columns:1fr}
  .about-left{order:2}
  .about-right{order:1}
  .steps{grid-template-columns:1fr}
  .tools-grid{grid-template-columns:1fr}
  .why-grid{grid-template-columns:1fr 1fr}
  .testi-grid{grid-template-columns:1fr}
  .testi-grid .testi-card:last-child{display:block}
  .trustbar-inner{gap:20px}
  .footer-grid{grid-template-columns:1fr;gap:28px}
  .footer-bottom{flex-direction:column;text-align:center}
  .chip-tl,.chip-br{display:none}
  .about-stats{grid-template-columns:1fr 1fr}
}
@media(max-width:480px){
  .why-grid{grid-template-columns:1fr}
  .hero-btns{flex-direction:column}
  .hero-btns .btn{width:100%;justify-content:center}
}
</style>
</head>
<body>

<!-- ══════════════════════════
  ANNOUNCEMENT BAR
══════════════════════════ -->
<div id="topbar">
  🎁 Free Download: The AI Blogging Starter Kit — 
  <a href="#optin">Get it now →</a>
</div>

<!-- ══════════════════════════
  NAVIGATION
══════════════════════════ -->
<nav id="nav" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">

    <a href="https://mendanize.com" class="logo">
      <div class="logo-icon">🤖</div>
      Menda<em>nize</em>
    </a>

    <ul class="nav-links" role="list">
      <li><a href="https://mendanize.com/blog/">Blog</a></li>
      <li><a href="https://mendanize.com/start-here/">Start Here</a></li>
      <li><a href="https://mendanize.com/best-ai-tools/">AI Tools</a></li>
      <li><a href="https://mendanize.com/how-to-make-money-online/">Make Money</a></li>
    </ul>

    <div class="nav-right">
      <a href="#optin" class="btn btn-amber" style="padding:11px 22px;font-size:14px;">
        Get Free Guide
      </a>
    </div>

    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>

  </div>
</nav>

<!-- Mobile drawer -->
<div class="drawer" id="drawer" role="dialog" aria-label="Mobile menu">
  <a href="https://mendanize.com/blog/">Blog</a>
  <a href="https://mendanize.com/start-here/">Start Here</a>
  <a href="https://mendanize.com/best-ai-tools/">AI Tools</a>
  <a href="https://mendanize.com/how-to-make-money-online/">Make Money</a>
  <a href="#optin" class="btn btn-amber" style="margin-top:24px;justify-content:center;">
    Get Free AI Guide →
  </a>
</div>

<!-- ══════════════════════════
  HERO
══════════════════════════ -->
<section class="hero" aria-label="Hero">
  <div class="hero-grid" aria-hidden="true"></div>
  <div class="blob hero-orb-1" aria-hidden="true"></div>
  <div class="blob hero-orb-2" aria-hidden="true"></div>

  <div class="wrap">
    <div class="hero-wrap">

      <!-- ── Left: Copy ── -->
      <div class="hero-left">
        <div class="hero-badge">
          <div class="pulse-dot" aria-hidden="true"></div>
          <span class="badge-text">AI Blogging System for Beginners</span>
        </div>

        <h1>
          Start a Blog.<br>
          <span class="gold">Grow with AI</span>.<br>
          <span class="strike-line">Earn Online</span>.
        </h1>

        <p class="hero-sub">
          Mendanize is the step-by-step system beginners use to launch, grow,
          and monetize a real blog using AI tools — no experience, no tech skills needed.
        </p>

        <div class="hero-btns">
          <a href="https://mendanize.com/start-here/" class="btn btn-amber">
            🚀 Start the 4-Step System
          </a>
          <a href="https://mendanize.com/best-ai-tools/" class="btn btn-outline">
            Explore AI Tools
          </a>
        </div>

        <div class="hero-proof">
          <div class="proof-avatars" aria-hidden="true">
            <span>😊</span><span>🙌</span><span>🎉</span><span>💪</span>
          </div>
          <p class="proof-text">
            <strong>Trusted by beginners worldwide</strong> — 
            no experience needed to start
          </p>
        </div>
      </div>

      <!-- ── Right: Dashboard Card ── -->
      <div class="hero-right" aria-hidden="true">
        <div class="dash-card">

          <!-- Top chip -->
          <div class="chip chip-tl">
            <div class="chip-ico">🤖</div>
            <div>
              <div class="chip-lbl">AI Tool Active</div>
              <div class="chip-val">ChatGPT + Canva</div>
            </div>
          </div>

          <!-- Bottom chip -->
          <div class="chip chip-br">
            <div class="chip-ico">📈</div>
            <div>
              <div class="chip-lbl">Traffic Growth</div>
              <div class="chip-val">+240% this month</div>
            </div>
          </div>

          <div class="dash-head">
            <div class="dash-ava">🤖</div>
            <div>
              <div class="dash-title">AI Blogging Dashboard</div>
              <div class="dash-sub">Your progress tracker</div>
            </div>
            <div class="dash-live">
              <div class="dash-live-dot"></div>
              Live
            </div>
          </div>

          <div class="prog-list">
            <div class="prog-item">
              <div class="prog-label">
                <span class="prog-name">🧱 Blog Setup</span>
                <span class="prog-pct">100%</span>
              </div>
              <div class="prog-track">
                <div class="prog-fill" style="width:100%"></div>
              </div>
            </div>
            <div class="prog-item">
              <div class="prog-label">
                <span class="prog-name">✍️ AI Content Writing</span>
                <span class="prog-pct">78%</span>
              </div>
              <div class="prog-track">
                <div class="prog-fill" style="width:78%;animation-delay:.25s"></div>
              </div>
            </div>
            <div class="prog-item">
              <div class="prog-label">
                <span class="prog-name">🚀 SEO & Traffic</span>
                <span class="prog-pct">54%</span>
              </div>
              <div class="prog-track">
                <div class="prog-fill" style="width:54%;animation-delay:.5s"></div>
              </div>
            </div>
            <div class="prog-item">
              <div class="prog-label">
                <span class="prog-name">💰 Monetization</span>
                <span class="prog-pct">32%</span>
              </div>
              <div class="prog-track">
                <div class="prog-fill" style="width:32%;animation-delay:.75s"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════
  TRUST BAR
══════════════════════════ -->
<div class="trustbar" aria-label="Trust indicators">
  <div class="wrap">
    <div class="trustbar-inner">
      <div class="tb-item"><span class="ico">📖</span><span><strong>Plain English</strong> tutorials</span></div>
      <div class="tb-item"><span class="ico">🧪</span><span><strong>Tested</strong> AI tools only</span></div>
      <div class="tb-item"><span class="ico">🗺️</span><span><strong>4-Step</strong> proven roadmap</span></div>
      <div class="tb-item"><span class="ico">💸</span><span><strong>Real</strong> income strategies</span></div>
      <div class="tb-item"><span class="ico">🆓</span><span><strong>Free</strong> to start today</span></div>
    </div>
  </div>
</div>

<!-- ══════════════════════════
  THE 4-STEP SYSTEM
══════════════════════════ -->
<section class="system sec" aria-labelledby="system-title">
  <div class="wrap">
    <div class="sh rv">
      <div class="pill">The Mendanize Method</div>
      <h2 id="system-title">Your Complete AI Blogging Roadmap</h2>
      <p>Four clear steps — in the right order. Follow this system from zero and build a real blog that earns real income.</p>
    </div>

    <div class="steps">

      <div class="card step-card rv d1">
        <div class="step-num-bg" aria-hidden="true">01</div>
        <span class="step-no">Step 01</span>
        <span class="step-ico" aria-hidden="true">🧱</span>
        <h3>Start Your Blog</h3>
        <p>Pick a profitable niche, choose a domain name, set up WordPress hosting, and go live — with zero technical skills required.</p>
        <a href="https://mendanize.com/start-here/" class="step-cta">Begin Here →</a>
      </div>

      <div class="card step-card rv d2">
        <div class="step-num-bg" aria-hidden="true">02</div>
        <span class="step-no">Step 02</span>
        <span class="step-ico" aria-hidden="true">✍️</span>
        <h3>Create with AI Tools</h3>
        <p>Use ChatGPT, Canva, and AI writing tools to produce SEO-optimized content at 5× the speed — without burning out or hiring writers.</p>
        <a href="https://mendanize.com/best-ai-tools/" class="step-cta">See AI Tools →</a>
      </div>

      <div class="card step-card rv d3">
        <div class="step-num-bg" aria-hidden="true">03</div>
        <span class="step-no">Step 03</span>
        <span class="step-ico" aria-hidden="true">🚀</span>
        <h3>Get Blog Traffic</h3>
        <p>Learn beginner SEO, keyword research, and AI-powered strategies to rank on Google and bring consistent daily visitors to your blog.</p>
        <a href="https://mendanize.com/blog/" class="step-cta">Learn Traffic →</a>
      </div>

      <div class="card step-card rv d4">
        <div class="step-num-bg" aria-hidden="true">04</div>
        <span class="step-no">Step 04</span>
        <span class="step-ico" aria-hidden="true">💰</span>
        <h3>Make Money Online</h3>
        <p>Monetize through affiliate marketing, display ads, digital products, and email marketing. Turn your readers into a real recurring income.</p>
        <a href="https://mendanize.com/how-to-make-money-online/" class="step-cta">Start Earning →</a>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════
  HOW IT WORKS
══════════════════════════ -->
<section class="sec" aria-labelledby="how-title">
  <div class="wrap">
    <div class="how-grid">

      <!-- Left: Text -->
      <div>
        <div class="how-label rv"><div class="pill">How It Works</div></div>
        <h2 id="how-title" class="rv">AI Handles the Hard Parts.<br>You Handle the Publishing.</h2>
        <p class="how-intro rv">Mendanize gives you the exact workflow beginners use to build a profitable blog — step by step, tool by tool, no guesswork.</p>

        <div class="flow-steps">
          <div class="flow-step rv">
            <div class="flow-ico">🎯</div>
            <div class="flow-line" aria-hidden="true"></div>
            <div class="flow-body">
              <h4>Choose Your Niche & Set Up</h4>
              <p>Follow our free beginner guide to find a profitable niche and launch your WordPress blog in under 60 minutes.</p>
            </div>
          </div>
          <div class="flow-step rv d1">
            <div class="flow-ico">🤖</div>
            <div class="flow-line" aria-hidden="true"></div>
            <div class="flow-body">
              <h4>Write Blog Posts with AI</h4>
              <p>Use our ChatGPT prompts and AI content framework to write SEO-ready posts that rank — in a fraction of the time.</p>
            </div>
          </div>
          <div class="flow-step rv d2">
            <div class="flow-ico">📈</div>
            <div class="flow-line" aria-hidden="true"></div>
            <div class="flow-body">
              <h4>Grow Traffic with SEO</h4>
              <p>Learn keyword research, on-page SEO, and how AI tools help you find low-competition topics and rank faster.</p>
            </div>
          </div>
          <div class="flow-step rv d3">
            <div class="flow-ico">💸</div>
            <div class="flow-body">
              <h4>Turn Traffic into Income</h4>
              <p>Add affiliate links, ad networks, or digital products. Build email lists that turn readers into buyers.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Terminal / Chat Demo -->
      <div class="rv d2">
        <div class="terminal">
          <div class="term-bar">
            <div class="tdot td-r"></div>
            <div class="tdot td-y"></div>
            <div class="tdot td-g"></div>
            <div class="term-title">AI Content Assistant — Mendanize</div>
          </div>
          <div class="chat">
            <div class="msg from-user">
              <div class="msg-ava user-ava">👤</div>
              <div class="bubble user-bub">
                Write a great SEO intro for: "Best free AI tools for beginners"
              </div>
            </div>
            <div class="msg">
              <div class="msg-ava ai-ava">🤖</div>
              <div class="bubble ai-bub">
                <strong>ChatGPT says:</strong><br><br>
                "If you're just starting out, AI tools can feel overwhelming — there are hundreds of them. But you only need a handful to build a real blog. This guide shows you the best free AI tools beginners actually use to save time, create content, and grow faster..."
              </div>
            </div>
            <div class="msg from-user">
              <div class="msg-ava user-ava">👤</div>
              <div class="bubble user-bub">
                Now give me 5 keywords I can rank for with a new blog
              </div>
            </div>
            <div class="msg">
              <div class="msg-ava ai-ava">🤖</div>
              <div class="bubble ai-bub">
                <strong>5 low-competition keywords:</strong><br><br>
                ✅ free AI tools for beginner bloggers<br>
                ✅ how to use ChatGPT for blogging<br>
                ✅ best AI writing tools free 2026<br>
                ✅ AI tools to write blog posts fast<br>
                ✅ ChatGPT prompts for SEO content
              </div>
            </div>
            <div class="msg">
              <div class="msg-ava ai-ava">🤖</div>
              <div class="bubble ai-bub">
                <div class="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════
  AI TOOLS
══════════════════════════ -->
<section class="tools-sec sec" aria-labelledby="tools-title">
  <div class="wrap">
    <div class="sh rv">
      <div class="pill">Recommended Tools</div>
      <h2 id="tools-title">The AI Tools We Use at Mendanize</h2>
      <p>Every tool here has been tested. If it didn't help beginners grow, we don't recommend it.</p>
    </div>

    <div class="tools-grid">

      <div class="card tool-card rv">
        <div class="tool-top">
          <div class="tool-ico" style="background:rgba(16,163,127,.12);border-color:rgba(16,163,127,.25)">🤖</div>
          <div>
            <div class="tool-name">ChatGPT</div>
            <div class="tool-cat">AI Writing Assistant</div>
          </div>
        </div>
        <p class="tool-desc">Write entire blog posts, generate SEO titles, create content outlines, and brainstorm ideas — 10× faster than writing alone.</p>
        <span class="tool-tag t-freemium">Freemium</span>
      </div>

      <div class="card tool-card rv d1">
        <div class="tool-top">
          <div class="tool-ico" style="background:rgba(99,102,241,.12);border-color:rgba(99,102,241,.25)">🎨</div>
          <div>
            <div class="tool-name">Canva</div>
            <div class="tool-cat">Design & Graphics</div>
          </div>
        </div>
        <p class="tool-desc">Design stunning blog featured images, Pinterest graphics, and social media posts with drag-and-drop simplicity. No design skills needed.</p>
        <span class="tool-tag t-free">Free Plan</span>
      </div>

      <div class="card tool-card rv d2">
        <div class="tool-top">
          <div class="tool-ico" style="background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.25)">📊</div>
          <div>
            <div class="tool-name">Rank Math</div>
            <div class="tool-cat">SEO Plugin</div>
          </div>
        </div>
        <p class="tool-desc">Score every blog post in real-time for SEO inside WordPress. Get keyword suggestions, fix errors, and rank on Google faster.</p>
        <span class="tool-tag t-free">Free WordPress Plugin</span>
      </div>

      <div class="card tool-card rv">
        <div class="tool-top">
          <div class="tool-ico" style="background:rgba(245,158,11,.1);border-color:var(--amber-glow)">✉️</div>
          <div>
            <div class="tool-name">ConvertKit</div>
            <div class="tool-cat">Email Marketing</div>
          </div>
        </div>
        <p class="tool-desc">Build your email list from day one. Automate sequences, create landing pages, and turn subscribers into income — free for your first 1,000 contacts.</p>
        <span class="tool-tag t-free">Free to Start</span>
      </div>

      <div class="card tool-card rv d1">
        <div class="tool-top">
          <div class="tool-ico" style="background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.25)">🔍</div>
          <div>
            <div class="tool-name">Ubersuggest</div>
            <div class="tool-cat">Keyword Research</div>
          </div>
        </div>
        <p class="tool-desc">Find keywords your new blog can actually rank for. Discover content gaps, see competitor strategies, and target low-competition topics first.</p>
        <span class="tool-tag t-freemium">Freemium</span>
      </div>

      <div class="card tool-card rv d2">
        <div class="tool-top">
          <div class="tool-ico" style="background:rgba(250,204,21,.1);border-color:rgba(250,204,21,.2)">⚡</div>
          <div>
            <div class="tool-name">Elementor</div>
            <div class="tool-cat">WordPress Page Builder</div>
          </div>
        </div>
        <p class="tool-desc">Build beautiful WordPress pages visually with drag-and-drop. Design your homepage, landing pages, and blog layout — zero coding needed.</p>
        <span class="tool-tag t-freemium">Freemium</span>
      </div>

    </div>

    <div class="tools-cta rv">
      <a href="https://mendanize.com/best-ai-tools/" class="btn btn-outline">
        View All Recommended AI Tools →
      </a>
    </div>
  </div>
</section>

<!-- ══════════════════════════
  POPULAR ARTICLES
══════════════════════════ -->
<section class="sec" aria-labelledby="posts-title" style="background:var(--ink-2)">
  <div class="wrap">
    <div class="sh rv">
      <div class="pill">Most-Read Guides</div>
      <h2 id="posts-title">Popular Beginner Guides</h2>
      <p>Step-by-step articles that move you from idea to action — no fluff, no confusion.</p>
    </div>

    <div class="posts-grid">

      <!-- Featured -->
      <a href="https://mendanize.com/how-to-start-a-blog-beginner-guide/" class="card post-card featured rv">
        <div class="post-thumb tall">
          <span class="emo">📝</span>
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-cat">Start a Blog</span>
            <span class="post-sep">·</span>
            <span class="post-date">May 2, 2026</span>
          </div>
          <h3>How to Start a Blog in 2026 — The Complete Beginner's Guide</h3>
          <p>Everything you need to launch your first blog from scratch: niche selection, domain name, WordPress setup, essential plugins, and your first post. Go live today following this guide step by step.</p>
          <div class="post-foot">
            <span class="read-link">Read Full Guide →</span>
            <span class="read-time">⏱ 12 min read</span>
          </div>
        </div>
      </a>

      <!-- Side 1 -->
      <a href="https://mendanize.com/how-to-use-chatgpt-for-blogging-step-by-step/" class="card post-card sm rv d1">
        <div class="post-thumb short">
          <span class="emo">🤖</span>
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-cat">AI Tools</span>
            <span class="post-sep">·</span>
            <span class="post-date">Apr 5, 2026</span>
          </div>
          <h3>How to Use ChatGPT for Blogging (Step-by-Step)</h3>
          <p>Exact prompts and workflows to write faster with AI.</p>
          <div class="post-foot">
            <span class="read-link">Read →</span>
            <span class="read-time">⏱ 8 min</span>
          </div>
        </div>
      </a>

      <!-- Side 2 -->
      <a href="https://mendanize.com/how-to-choose-a-profitable-blog-niche-beginner-friendly/" class="card post-card sm rv d2">
        <div class="post-thumb short">
          <span class="emo">🎯</span>
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-cat">Strategy</span>
            <span class="post-sep">·</span>
            <span class="post-date">May 2, 2026</span>
          </div>
          <h3>How to Choose a Profitable Blog Niche (Beginner-Friendly)</h3>
          <p>Find a niche you love that actually makes money.</p>
          <div class="post-foot">
            <span class="read-link">Read →</span>
            <span class="read-time">⏱ 7 min</span>
          </div>
        </div>
      </a>

      <!-- Row 2 left -->
      <a href="https://mendanize.com/top-free-ai-tools-to-make-money-online/" class="card post-card sm rv">
        <div class="post-thumb short">
          <span class="emo">💰</span>
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-cat">Make Money</span>
            <span class="post-sep">·</span>
            <span class="post-date">Apr 5, 2026</span>
          </div>
          <h3>Top Free AI Tools to Make Money Online in 2026</h3>
          <p>The exact free tools beginners use to start earning online.</p>
          <div class="post-foot">
            <span class="read-link">Read →</span>
            <span class="read-time">⏱ 9 min</span>
          </div>
        </div>
      </a>

      <!-- Row 2 right -->
      <a href="https://mendanize.com/domain-name-ideas-pick-the-perfect-blog-name/" class="card post-card sm rv d1">
        <div class="post-thumb short">
          <span class="emo">🌐</span>
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-cat">Start a Blog</span>
            <span class="post-sep">·</span>
            <span class="post-date">May 2, 2026</span>
          </div>
          <h3>Domain Name Ideas: How to Pick the Perfect Blog Name</h3>
          <p>A beginner's guide to choosing a domain that stands out.</p>
          <div class="post-foot">
            <span class="read-link">Read →</span>
            <span class="read-time">⏱ 6 min</span>
          </div>
        </div>
      </a>

    </div>

    <div class="posts-cta rv">
      <a href="https://mendanize.com/blog/" class="btn btn-outline">Browse All Articles →</a>
    </div>
  </div>
</section>

<!-- ══════════════════════════
  WHY MENDANIZE
══════════════════════════ -->
<section class="why sec" aria-labelledby="why-title">
  <div class="wrap">
    <div class="sh rv">
      <div class="pill">Why Mendanize</div>
      <h2 id="why-title">Everything Built for Beginners</h2>
      <p>We assume you know nothing — and we walk you through everything, step by step.</p>
    </div>

    <div class="why-grid">
      <div class="card why-card rv">
        <span class="why-ico">📖</span>
        <h4>Plain-English Guides</h4>
        <p>Every tutorial is written without jargon. If you can read this, you can follow our guides and succeed.</p>
      </div>
      <div class="card why-card rv d1">
        <span class="why-ico">🧪</span>
        <h4>Tested AI Tools Only</h4>
        <p>We personally test every tool before recommending it. If it didn't work for beginner bloggers, it's not on our list.</p>
      </div>
      <div class="card why-card rv d2">
        <span class="why-ico">🗺️</span>
        <h4>A System, Not Just Tips</h4>
        <p>Follow our 4-step roadmap from launch to income. Everything connects. Nothing is random or scattered.</p>
      </div>
      <div class="card why-card rv d3">
        <span class="why-ico">⚡</span>
        <h4>Actionable, Not Fluffy</h4>
        <p>Every guide ends with clear next steps. You always know exactly what to do — and why it works.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════
  TESTIMONIALS
══════════════════════════ -->
<section class="sec" aria-labelledby="testi-title">
  <div class="wrap">
    <div class="sh rv">
      <div class="pill">Reader Stories</div>
      <h2 id="testi-title">Beginners Who Started Here</h2>
      <p>Real people. Real results. Zero experience when they began.</p>
    </div>

    <div class="testi-grid">
      <div class="card testi-card rv">
        <div class="stars">★★★★★</div>
        <p class="testi-q">"I had no idea where to start. Mendanize's 4-step system made everything clear. Within 3 weeks my blog was live and I had my first affiliate sale. Couldn't believe it was actually that simple."</p>
        <div class="testi-who">
          <div class="testi-ava">😊</div>
          <div>
            <div class="testi-name">Sarah K.</div>
            <div class="testi-role">Lifestyle Blogger, USA</div>
          </div>
        </div>
      </div>

      <div class="card testi-card rv d1">
        <div class="stars">★★★★★</div>
        <p class="testi-q">"The ChatGPT blogging guide was a total game-changer. I went from writing one post per week to five. My traffic doubled in 60 days. Mendanize is the real deal for anyone starting from zero."</p>
        <div class="testi-who">
          <div class="testi-ava">🙌</div>
          <div>
            <div class="testi-name">James M.</div>
            <div class="testi-role">Finance Blogger, UK</div>
          </div>
        </div>
      </div>

      <div class="card testi-card rv d2">
        <div class="stars">★★★★★</div>
        <p class="testi-q">"I followed the Make Money guide and added affiliate links after one month. Earned my first $47 in week 5. It's small but it's real — and now I know the system actually works. Thank you so much!"</p>
        <div class="testi-who">
          <div class="testi-ava">🎉</div>
          <div>
            <div class="testi-name">Aisha T.</div>
            <div class="testi-role">Food Blogger, Nigeria</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════
  EMAIL OPT-IN
══════════════════════════ -->
<section class="optin sec" id="optin" aria-labelledby="optin-title">
  <div class="wrap">
    <div class="optin-wrap">

      <div class="optin-left rv">
        <div class="pill">Free Starter Kit</div>
        <h2 id="optin-title">Get the Free AI Blogging Starter Guide</h2>
        <p>Join beginners worldwide who are building real blogs with AI. Get the complete starter guide sent straight to your inbox — free, instantly.</p>
        <div class="perks">
          <div class="perk"><span class="ck">✅</span> The full 4-step Mendanize blogging system</div>
          <div class="perk"><span class="ck">✅</span> Best free AI tools for beginner bloggers</div>
          <div class="perk"><span class="ck">✅</span> 10 ChatGPT prompts to write blog posts fast</div>
          <div class="perk"><span class="ck">✅</span> How to make your first $100 with your blog</div>
          <div class="perk"><span class="ck">✅</span> Weekly beginner tips every Tuesday</div>
        </div>
      </div>

      <div class="optin-box rv d2">
        <h3>🎁 Yes, Send Me the Free Guide</h3>
        <p class="sub">No spam. Unsubscribe in one click, any time.</p>
        <div class="field">
          <input type="text" class="inp" placeholder="Your first name" autocomplete="given-name">
          <input type="email" class="inp" placeholder="Your best email address" autocomplete="email">
          <a href="https://mendanize.com/" class="btn btn-amber btn-wide">
            Get Free Instant Access →
          </a>
        </div>
        <p class="fn">🔒 Your email is safe. We never sell or share your data.</p>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════
  ABOUT MENDANIZE
══════════════════════════ -->
<section class="sec" style="background:var(--ink-2)" aria-labelledby="about-title">
  <div class="wrap">
    <div class="about-grid">

      <!-- Left: Stats -->
      <div class="about-left rv">
        <div class="about-stats">
          <div class="card astat">
            <span class="astat-n">4</span>
            <span class="astat-l">Steps to Income</span>
          </div>
          <div class="card astat">
            <span class="astat-n">100%</span>
            <span class="astat-l">Beginner-Focused</span>
          </div>
          <div class="card astat">
            <span class="astat-n">AI</span>
            <span class="astat-l">Powered System</span>
          </div>
          <div class="card astat">
            <span class="astat-n">Free</span>
            <span class="astat-l">To Start Today</span>
          </div>
        </div>
        <div class="social-row">
          <p>Follow Mendanize</p>
          <div class="slinks">
            <a href="https://www.facebook.com/mendanize" class="sl" title="Facebook" aria-label="Facebook">📘</a>
            <a href="https://www.instagram.com/mendanize/" class="sl" title="Instagram" aria-label="Instagram">📸</a>
            <a href="https://www.threads.com/@mendanize" class="sl" title="Threads" aria-label="Threads">🧵</a>
            <a href="https://x.com/Mendanize" class="sl" title="X / Twitter" aria-label="X Twitter">🐦</a>
          </div>
        </div>
      </div>

      <!-- Right: Copy -->
      <div class="about-right rv d2">
        <div class="pill">About Mendanize</div>
        <h2 id="about-title">Built for Beginners Who Want Real Results</h2>
        <p>Mendanize was created for one reason: <strong>to help complete beginners start a blog and actually make money online</strong> using the power of AI tools.</p>
        <p>We know how overwhelming it feels to start. Too much information, too many tools, no clear path forward. That's why we built the <strong>Mendanize 4-Step System</strong> — a clear, beginner-friendly roadmap that takes you from zero to a live, growing, monetized blog.</p>
        <p>Every guide on Mendanize is written in plain English, tested for real results, and designed for people starting from scratch. <strong>No tech skills required. No prior experience needed.</strong></p>
        <div class="about-btns">
          <a href="https://mendanize.com/start-here/" class="btn btn-amber">Start the System →</a>
          <a href="https://mendanize.com/blog/" class="btn btn-outline">Read the Blog</a>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════
  FOOTER
══════════════════════════ -->
<footer>
  <div class="wrap">
    <div class="footer-grid">

      <div class="footer-brand">
        <a href="https://mendanize.com" class="logo">
          <div class="logo-icon">🤖</div>
          Menda<em>nize</em>
        </a>
        <p>Your step-by-step system to start, grow, and monetize a blog using AI — built for complete beginners.</p>
        <div class="footer-slinks">
          <a href="https://www.facebook.com/mendanize" class="sl" title="Facebook" aria-label="Facebook">📘</a>
          <a href="https://www.instagram.com/mendanize/" class="sl" title="Instagram" aria-label="Instagram">📸</a>
          <a href="https://www.threads.com/@mendanize" class="sl" title="Threads" aria-label="Threads">🧵</a>
          <a href="https://x.com/Mendanize" class="sl" title="Twitter" aria-label="Twitter">🐦</a>
        </div>
      </div>

      <div class="fc">
        <h5>Start Blogging</h5>
        <ul class="flinks">
          <li><a href="https://mendanize.com/start-here/">Start Here</a></li>
          <li><a href="https://mendanize.com/how-to-start-a-blog-beginner-guide/">How to Start a Blog</a></li>
          <li><a href="https://mendanize.com/how-to-choose-a-profitable-blog-niche-beginner-friendly/">Choose a Niche</a></li>
          <li><a href="https://mendanize.com/domain-name-ideas-pick-the-perfect-blog-name/">Pick a Domain</a></li>
        </ul>
      </div>

      <div class="fc">
        <h5>AI Tools</h5>
        <ul class="flinks">
          <li><a href="https://mendanize.com/best-ai-tools/">Best AI Tools</a></li>
          <li><a href="https://mendanize.com/how-to-use-chatgpt-for-blogging-step-by-step/">ChatGPT for Blogging</a></li>
          <li><a href="https://mendanize.com/top-free-ai-content-creation-tools-money-2026/">Free AI Content Tools</a></li>
          <li><a href="https://mendanize.com/best-ai-video-generators-for-youtube-income/">AI Video Generators</a></li>
        </ul>
      </div>

      <div class="fc">
        <h5>Make Money</h5>
        <ul class="flinks">
          <li><a href="https://mendanize.com/how-to-make-money-online/">Make Money Online</a></li>
          <li><a href="https://mendanize.com/top-free-ai-tools-to-make-money-online/">Free Tools for Income</a></li>
          <li><a href="https://mendanize.com/blog/">All Articles</a></li>
          <li><a href="#optin">Free Starter Guide</a></li>
        </ul>
      </div>

    </div>

    <div class="footer-bottom">
      <p>© 2026 Mendanize. All rights reserved. Made with ❤️ for beginners everywhere.</p>
      <div class="legal">
        <a href="https://mendanize.com/">Privacy Policy</a>
        <a href="https://mendanize.com/">Disclaimer</a>
        <a href="https://mendanize.com/">Contact</a>
      </div>
    </div>

  </div>
</footer>

<!-- ══════════════════════════
  JAVASCRIPT
══════════════════════════ -->
<script>
(function(){
  'use strict';

  /* ── Topbar height offset for nav ── */
  var topbar = document.getElementById('topbar');
  var nav    = document.getElementById('nav');

  function setNavTop(){
    var h = topbar ? topbar.offsetHeight : 0;
    nav.style.top = h + 'px';
  }
  setNavTop();

  /* ── Nav scroll solid ── */
  window.addEventListener('scroll', function(){
    nav.classList.toggle('solid', window.scrollY > 60);
    if(window.scrollY > 60){ nav.style.top = '0'; }
    else { setNavTop(); }
  }, {passive:true});

  /* ── Mobile menu ── */
  var burger  = document.getElementById('burger');
  var drawer  = document.getElementById('drawer');
  var isOpen  = false;

  function toggleMenu(){
    isOpen = !isOpen;
    drawer.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', toggleMenu);
  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      if(isOpen) toggleMenu();
    });
  });

  /* ── Scroll reveal ── */
  var rvEls = document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          observer.unobserve(e.target);
        }
      });
    },{threshold:0.1, rootMargin:'0px 0px -36px 0px'});
    rvEls.forEach(function(el){ observer.observe(el); });
  } else {
    rvEls.forEach(function(el){ el.classList.add('in'); });
  }

})();
</script>

</body>
</html>