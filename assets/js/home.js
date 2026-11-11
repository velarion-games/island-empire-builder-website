// Landing page: the voyage line and the screenshot carousel.

// voyage line: from the intro down through the gap beside each feature to the footer,
// solid where the reader has already sailed, a small ship at the reader's place
(()=>{
  const NS="http://www.w3.org/2000/svg",svg=document.createElementNS(NS,"svg");
  svg.setAttribute("class","voyage");svg.setAttribute("aria-hidden","true");
  document.body.append(svg);
  let path,done,ship,len=0,last="";
  const build=()=>{
    const W=document.documentElement.clientWidth,secs=[...document.querySelectorAll(".feature")];
    if(!secs.length||W<=780)return;
    const pts=secs.map(sec=>{
      const m=sec.querySelector(".media").getBoundingClientRect(),t=sec.querySelector(".txt").getBoundingClientRect(),b=sec.getBoundingClientRect();
      const x=m.right<=t.left?(m.right+t.left)/2:(t.right+m.left)/2;
      return [x,b.top+scrollY+70,b.bottom+scrollY-70];
    });
    const H=Math.ceil(document.querySelector(".foot").getBoundingClientRect().top+scrollY);
    const key=[W,H,...pts.flat().map(Math.round)].join();
    if(key===last)return;last=key;
    let d=`M${pts[0][0]} ${pts[0][1]-40}`,wps="";
    pts.forEach(([x,y0,y1],i)=>{
      if(i){const [px,,py]=pts[i-1],m=(py+y0)/2;d+=` C${px} ${m} ${x} ${m} ${x} ${y0}`;}
      d+=` L${x} ${y1}`;wps+=`<circle class="wp" cx="${x}" cy="${(y0+y1)/2}" r="4"/>`;
    });
    svg.setAttribute("width",W);svg.setAttribute("height",H);svg.style.height=H+"px";svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    svg.innerHTML=`<path class="ahead" d="${d}"/><path class="done" d="${d}"/>${wps}<g class="ship"><path d="M-9 3h18l-4 5h-10z"/><path class="sail" d="M-1 2v-16l10 15z"/></g>`;
    path=svg.querySelector(".done");ship=svg.querySelector(".ship");len=path.getTotalLength();
    path.style.strokeDasharray=len;place();
  };
  // find the length along the route whose y matches the reading line (the route only runs downward)
  const place=()=>{
    if(!len)return;
    const target=scrollY+innerHeight*.55;let lo=0,hi=len;
    for(let k=0;k<22;k++){const mid=(lo+hi)/2;path.getPointAtLength(mid).y<target?lo=mid:hi=mid;}
    const p=path.getPointAtLength(lo);
    path.style.strokeDashoffset=len-lo;
    ship.setAttribute("transform",`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  };
  build();
  addEventListener("scroll",()=>requestAnimationFrame(place),{passive:true});
  let t;new ResizeObserver(()=>{clearTimeout(t);t=setTimeout(build,150)}).observe(document.body);
  document.fonts&&document.fonts.ready.then(build);
})();

// screenshot carousel: thumbnails and arrows switch the big slide (Steam-style, no autoplay)
(()=>{
  const g=document.querySelector(".gallery");if(!g)return;
  const slides=[...g.querySelectorAll(".slide")],thumbs=[...g.querySelectorAll(".thumb")];
  let cur=0;
  const show=i=>{
    cur=(i+slides.length)%slides.length;
    slides.forEach((s,k)=>s.hidden=k!==cur);
    thumbs.forEach((t,k)=>k===cur?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current"));
  };
  thumbs.forEach((t,k)=>t.addEventListener("click",()=>show(k)));
  g.querySelector(".nudge.back").addEventListener("click",()=>show(cur-1));
  g.querySelector(".nudge.fwd").addEventListener("click",()=>show(cur+1));
  g.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")show(cur-1);else if(e.key==="ArrowRight")show(cur+1);});
})();

// band colour trial (2026-11-11): ?band=sky|mist|cloud|slate|sand swaps the Limestone bands for a capsule-inspired tint
(()=>{
  const opts={limestone:"#D8CDB7",sky:"#D9E3EA",mist:"#D5DEDB",cloud:"#EEE5D3",slate:"#C8D1D8",sand:"#E6D9B8"};
  const k=new URLSearchParams(location.search).get("band");
  if(k&&opts[k])document.documentElement.style.setProperty("--band",opts[k]);
})();
