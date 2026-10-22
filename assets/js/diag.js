// Diagnostics for finding what makes the page slow on a given phone. Off unless asked for in the URL:
//   ?fps                      a frame-rate counter in the corner (tap it to reset)
//   ?off=mist,lines,plates,glow   turn decorative layers off (or ?off=all)
//   ?mist=img                 on phones, draw the mist from pre-rendered images instead of the SVG noise filter
// mist = sea mist and haze; lines = rhumb lines, astrolabe and voyage line;
// plates = the leather texture and shadows on the video plates; glow = the text halos.
(()=>{
  const q=new URLSearchParams(location.search);
  if(q.get("mist")==="img")document.documentElement.classList.add("mist-img");
  if(!q.has("fps")&&!q.has("off"))return;
  const all=["mist","lines","plates","glow"];
  let off=(q.get("off")||"").split(",").map(s=>s.trim()).filter(Boolean);
  if(off.includes("all"))off=all;
  const rules={
    mist:".mist,.chart-mist{display:none!important}",
    lines:".rhumbs,.marks,.voyage{display:none!important}",
    plates:".tocome{background:#3e2817!important;box-shadow:none!important}.tocome b{filter:none!important}",
    glow:"*{text-shadow:none!important}"
  };
  const css=off.filter(k=>rules[k]).map(k=>rules[k]).join("");
  if(css){const s=document.createElement("style");s.textContent=css;document.head.append(s);}
  if(!q.has("fps"))return;
  // frames per second over the last second, the slowest frame and the frames over 50 ms since the last reset
  const box=document.createElement("div");
  box.style.cssText="position:fixed;left:8px;bottom:8px;z-index:99;padding:6px 9px;background:rgba(0,0,0,.78);color:#fff;font:600 13px/1.35 ui-monospace,monospace;border-radius:4px;pointer-events:auto;white-space:pre";
  let times=[],worst=0,slow=0,last=performance.now();
  const reset=()=>{times=[];worst=0;slow=0;};
  box.addEventListener("click",reset);
  const tick=now=>{
    const dt=now-last;last=now;
    times.push(now);while(times.length&&now-times[0]>1000)times.shift();
    if(dt<1000){worst=Math.max(worst,dt);if(dt>50)slow++;}
    box.textContent=`${times.length} fps · worst ${Math.round(worst)} ms · slow ${slow}\noff: ${off.length?off.join(", "):"none"}${q.get("mist")==="img"?" · mist: img":""}`;
    requestAnimationFrame(tick);
  };
  const start=()=>{document.body.append(box);requestAnimationFrame(tick);};
  document.body?start():addEventListener("DOMContentLoaded",start);
})();
