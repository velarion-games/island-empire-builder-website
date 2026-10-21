// Rhumb lines and chart marks behind the whole page, shared by every page.
// Needs #top (the title the web centres on) and .foot (where the web ends).
// rhumb lines: a centre rose behind the title and 16 roses on a circle around it,
// each sending 32 winds (main / half / quarter coloured like a portolan chart)
(()=>{
  const NS="http://www.w3.org/2000/svg",svg=document.createElementNS(NS,"svg");
  svg.setAttribute("class","rhumbs draw");svg.setAttribute("aria-hidden","true");
  document.body.prepend(svg);
  const marks=document.createElementNS(NS,"svg");
  marks.setAttribute("class","marks");marks.setAttribute("aria-hidden","true");
  svg.after(marks);
  const title=document.getElementById("top");
  let last="";
  const build=()=>{
    const W=document.documentElement.clientWidth,H=Math.ceil(document.querySelector(".foot").getBoundingClientRect().bottom+scrollY);
    const r=title.getBoundingClientRect();
    const cx=r.left+r.width*.55,cy=r.top+scrollY+r.height*.5;
    const key=[W,H,Math.round(cx),Math.round(cy)].join();
    if(key===last)return;last=key;
    const R=Math.max(320,Math.min(W*.42,720)),L=Math.hypot(W,H)*1.5;
    const roses=[[cx,cy]];
    for(let k=0;k<16;k++){const a=k*Math.PI/8;roses.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]);}
    let out="";
    for(const [x,y] of roses){
      for(let i=0;i<32;i++){
        const a=i*Math.PI/16,c=i%4===0?"wm":i%2===0?"wh":"wq";
        out+=`<line pathLength="1" class="${c}" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x+L*Math.cos(a)).toFixed(1)}" y2="${(y+L*Math.sin(a)).toFixed(1)}"/>`;
      }
      out+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5"/>`;
    }
    svg.setAttribute("width",W);svg.setAttribute("height",H);svg.style.height=H+"px";
    svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    svg.innerHTML=out;
    marks.setAttribute("width",W);marks.setAttribute("height",H);marks.style.height=H+"px";
    marks.setAttribute("viewBox",`0 0 ${W} ${H}`);
    marks.innerHTML=chartMarks(cx,cy,R,roses);
  };
  const f=n=>n.toFixed(1),P=(x,y,r,a)=>[x+r*Math.cos(a),y+r*Math.sin(a)];
  // astrolabe: degree ring on the mater, and a rete (ecliptic, tropics, star pointers) that turns very slowly
  const astrolabe=(cx,cy,R)=>{
    const A=R*.62;let o=`<g class="astro"><circle class="bold" cx="${f(cx)}" cy="${f(cy)}" r="${f(A)}"/><circle class="fine" cx="${f(cx)}" cy="${f(cy)}" r="${f(A*.94)}"/>`;
    for(let d=0;d<360;d+=2){const l=d%30===0?A*.1:d%10===0?A*.06:A*.035,[x1,y1]=P(cx,cy,A,d*Math.PI/180),[x2,y2]=P(cx,cy,A-l,d*Math.PI/180);
      o+=`<line class="fine" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;}
    // almucantars: circles of equal altitude, stereographic so they crowd towards the zenith
    for(let k=1;k<=6;k++){const r=A*.8*(1-k/7.5),dy=A*.22*(k/6);o+=`<circle class="fine" cx="${f(cx)}" cy="${f(cy-dy)}" r="${f(r)}"/>`;}
    o+=`<g class="rete" style="transform-origin:${f(cx)}px ${f(cy)}px">`;
    o+=`<circle class="bold" cx="${f(cx)}" cy="${f(cy-A*.16)}" r="${f(A*.6)}"/><circle class="fine" cx="${f(cx)}" cy="${f(cy)}" r="${f(A*.36)}"/><circle class="fine" cx="${f(cx)}" cy="${f(cy)}" r="${f(A*.8)}"/>`;
    for(let k=0;k<9;k++){const a=k*Math.PI*2/9+.3,[x,y]=P(cx,cy,A*(.46+.3*((k*37)%10)/10),a),[bx,by]=P(cx,cy,A*.2,a+.5);
      o+=`<path class="fine" d="M${f(bx)} ${f(by)} Q${f((bx+x)/2+6)} ${f((by+y)/2-6)} ${f(x)} ${f(y)}"/><circle class="fine" cx="${f(x)}" cy="${f(y)}" r="2.5"/>`;}
    return o+`</g><line class="fine" x1="${f(cx-A)}" y1="${f(cy)}" x2="${f(cx+A)}" y2="${f(cy)}"/><line class="fine" x1="${f(cx)}" y1="${f(cy-A)}" x2="${f(cx)}" y2="${f(cy+A)}"/></g>`;
  };
  // construction: the hidden circle through the roses, a square on the cardinal roses,
  // compass arcs struck from them, and Euclid's lettering
  const chartMarks=(cx,cy,R,roses)=>{
    let o=astrolabe(cx,cy,R)+`<circle class="geo dash" cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}"/>`;
    const card=[1,5,9,13].map(i=>roses[i]);
    o+=`<path class="geo dash" d="M${card.map(([x,y])=>f(x)+" "+f(y)).join(" L")} Z"/>`;
    for(const [x,y] of card){const a=Math.atan2(cy-y,cx-x),s=.32;
      const [x1,y1]=P(x,y,R*1.414,a-s),[x2,y2]=P(x,y,R*1.414,a+s);
      o+=`<path class="geo" d="M${f(x1)} ${f(y1)} A${f(R*1.414)} ${f(R*1.414)} 0 0 1 ${f(x2)} ${f(y2)}"/>`;}
    // letters stay off the title block
    const t=title.getBoundingClientRect(),tx0=t.left-24,tx1=t.right+24,ty0=t.top+scrollY-24,ty1=t.bottom+scrollY+24;
    "AEBFCGDH".split("").forEach((L,j)=>{const [x,y]=roses[1+j*2],a=Math.atan2(y-cy,x-cx),[tx,ty]=P(x,y,16,a);
      if(tx>tx0&&tx<tx1&&ty>ty0&&ty<ty1)return;
      o+=`<text x="${f(tx)}" y="${f(ty)}" text-anchor="middle" dominant-baseline="middle">${L}</text>`;});
    return o;
  };
  build();
  setTimeout(()=>svg.classList.remove("draw"),3200);
  let t;new ResizeObserver(()=>{clearTimeout(t);t=setTimeout(build,120)}).observe(document.body);
  document.fonts&&document.fonts.ready.then(build);
})();
