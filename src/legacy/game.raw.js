"use strict";
/* ================= 全局导航 ================= */
const DAY_ORDER=['g11','g1','g2','g4','g7','g8','g3','g6','g14','g13','g5','g12','g10','g9'];
const cleared = {};
DAY_ORDER.forEach(k=>cleared[k]=false);
let activeGame = null;

function show(id){
  document.querySelectorAll('section.screen').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  window.scrollTo(0,0);
}
function openGame(id){
  activeGame = id;
  show(id);
  GAMES[id].start();
}
function goHome(){
  stopAllLoops();
  activeGame = null;
  show('home');
}
function markCleared(id){
  cleared[id]=true;
  document.getElementById('card-'+id).classList.add('cleared');
}
function nextGameOf(id){
  const i=DAY_ORDER.indexOf(id);
  for(let j=i+1;j<DAY_ORDER.length;j++){ if(!cleared[DAY_ORDER[j]]) return DAY_ORDER[j]; }
  for(let j=0;j<DAY_ORDER.length;j++){ if(!cleared[DAY_ORDER[j]]) return DAY_ORDER[j]; }
  return null;
}
function stopAllLoops(){ for(const k in GAMES) GAMES[k].stop(); }
function restartAll(){
  for(const k in cleared){cleared[k]=false;document.getElementById('card-'+k).classList.remove('cleared');}
  goHome();
}

/* ================= 结果弹层 ================= */
const modal=document.getElementById('modal');
function showResult({title,body,voice,data,gameId,success}){
  document.getElementById('mTitle').textContent=title;
  document.getElementById('mBody').innerHTML=body||'';
  document.getElementById('mVoice').textContent=voice||'';
  document.getElementById('mVoice').style.display=voice?'block':'none';
  document.getElementById('mData').innerHTML=data||'';
  document.getElementById('mData').style.display=data?'block':'none';
  const act=document.getElementById('mActions');
  act.innerHTML='';
  const mk=(label,ghost,fn)=>{
    const b=document.createElement('button');
    b.className='btn'+(ghost?' ghost':'');
    b.textContent=label;
    b.onclick=()=>{modal.classList.remove('on');fn();};
    act.appendChild(b);
  };
  if(success){
    markCleared(gameId);
    const nxt=nextGameOf(gameId);
    const allDone=Object.values(cleared).every(v=>v);
    mk('回家看看',true,goHome);
    if(allDone){ mk('这一天结束了 →',false,()=>{stopAllLoops();show('final');}); }
    else if(nxt){ mk('下一段时光 →',false,()=>openGame(nxt)); }
  }else{
    mk('先歇一会儿',true,goHome);
    mk('再试一次',false,()=>openGame(gameId));
  }
  modal.classList.add('on');
}

/* 通用：给按钮绑定“按住”事件（指针+键盘可达） */
function bindHold(el,onDown,onUp){
  const down=e=>{e.preventDefault();onDown();};
  const up=()=>onUp();
  el.addEventListener('pointerdown',down);
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up);
  el.addEventListener('pointerleave',up);
  el.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();onDown();}});
  el.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')onUp();});
}

/* ================= 关卡一：白内障读说明书 ================= */
const g1=(function(){
  let stamina=100,squinting=false,raf=null,last=0,answered=false;
  const leaflet=document.getElementById('leaflet');
  const frame=document.getElementById('leafletFrame');
  const bar=document.getElementById('stam1');
  const barWrap=document.getElementById('stam1Bar');
  const txt=document.getElementById('stam1Txt');
  const btn=document.getElementById('squintBtn');

  bindHold(btn,()=>{if(stamina>2)setSquint(true);},()=>setSquint(false));

  function setSquint(v){
    squinting=v;
    leaflet.classList.toggle('squint',v);
    frame.classList.toggle('squinting',v);
  }
  function loop(t){
    if(!last)last=t;
    const dt=Math.min((t-last)/1000,.1); last=t;
    if(squinting){
      stamina-=24*dt;
      if(stamina<=0){stamina=0;setSquint(false);btn.disabled=true;}
    }else{
      stamina+=9*dt;
      if(stamina>30)btn.disabled=false;
      if(stamina>100)stamina=100;
    }
    bar.style.width=stamina+'%';
    txt.textContent=Math.round(stamina);
    barWrap.classList.toggle('low',stamina<30);
    raf=requestAnimationFrame(loop);
  }
  document.getElementById('q1opts').addEventListener('click',e=>{
    const o=e.target.closest('.opt');
    if(!o||answered)return;
    answered=true;
    const right=o.dataset.r==='1';
    o.classList.add(right?'right':'wrong');
    setTimeout(()=>{
      if(right){
        showResult({gameId:'g1',success:true,
          title:'看清了，但眼睛好酸',
          body:'你答对了。可你有没有发现——为了这一行小字，你把体力条几乎耗光了。',
          voice:'“字怎么越印越小了……唉，是我的眼睛越来越旧了。”',
          data:'<b>真实数据</b> · 我国 60 岁以上人群白内障发病率约为 80%。它让世界变得模糊、泛黄、怕光——而一台白内障手术平均只需要 10 分钟。'});
      }else{
        showResult({gameId:'g1',success:false,
          title:'吃错剂量了…',
          body:'降压药吃错剂量可能导致血压骤降或失控。很多老人不是不识字，而是<b>看不清那行字</b>。',
          voice:'“大概……就是这么吃的吧，问孩子又怕他们嫌烦。”',
          data:'<b>真实数据</b> · 研究显示，超过一半的老年人曾因看不清说明书而错服、漏服药物。'});
      }
    },600);
  });
  return {
    start(){
      stamina=100;answered=false;last=0;btn.disabled=false;
      document.querySelectorAll('#q1opts .opt').forEach(o=>o.classList.remove('right','wrong'));
      setSquint(false);
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;}
  };
})();

/* ================= 关卡二：手抖拧药瓶 ================= */
const g2=(function(){
  const stage=document.getElementById('tremorStage');
  const hand=document.getElementById('hand');
  const cap=document.getElementById('cap');
  const capBar=document.getElementById('capBar');
  const capTxt=document.getElementById('capTxt');
  const hint=document.getElementById('tremorHint');
  let raf=null,last=0,t0=0;
  let px=160,py=120;          // 玩家真实指向
  let pressing=false,progress=0,done=false;

  stage.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect();
    px=e.clientX-r.left; py=e.clientY-r.top;
  });
  stage.addEventListener('pointerdown',e=>{
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    const r=stage.getBoundingClientRect();
    px=e.clientX-r.left; py=e.clientY-r.top;
    pressing=true;
  });
  const release=()=>{pressing=false;};
  stage.addEventListener('pointerup',release);
  stage.addEventListener('pointercancel',release);

  function loop(t){
    if(!last){last=t;t0=t;}
    const dt=Math.min((t-last)/1000,.1); last=t;
    const sec=(t-t0)/1000;
    // 老年性震颤：4~6Hz 复合正弦，用力(按住)时幅度增大，进度越高越“紧张”
    const amp=(pressing?20:11)+progress*0.16;
    const tx=px+amp*(Math.sin(sec*2*Math.PI*4.7)+.55*Math.sin(sec*2*Math.PI*7.3+1.4));
    const ty=py+amp*(Math.cos(sec*2*Math.PI*5.2+.7)+.5*Math.sin(sec*2*Math.PI*6.1));
    hand.style.left=tx+'px';
    hand.style.top =ty+'px';

    // 判定：颤抖后的落点是否在瓶盖上
    const cr=cap.getBoundingClientRect(),sr=stage.getBoundingClientRect();
    const cx=cr.left-sr.left+cr.width/2, cy=cr.top-sr.top+cr.height/2;
    const dist=Math.hypot(tx-cx,ty-cy);
    const onCap=dist<52;

    if(!done){
      if(pressing&&onCap){
        progress+=dt/2.8*100;
        hint.textContent='稳住……手别抖……';
      }else if(pressing){
        progress-=dt*14;
        hint.textContent='手滑开了！挪回瓶盖上';
      }else{
        progress-=dt*5;
        hint.textContent='把手移到瓶盖上，按住别松开';
      }
      progress=Math.max(0,Math.min(100,progress));
      cap.style.setProperty('--p',progress);
      cap.style.transform='rotate('+progress*3.6+'deg)';
      capBar.style.width=progress+'%';
      capTxt.textContent=Math.round(progress)+'%';
      if(progress>=100){
        done=true;
        cap.style.transition='transform .5s,top .5s,opacity .5s';
        cap.style.top='20px';cap.style.opacity='0';
        setTimeout(()=>{
          showResult({gameId:'g2',success:true,
            title:'咔哒——终于开了',
            body:'一个你两秒能拧开的瓶盖，刚才花了你多久？而这只是她每天要开的第一个瓶子。',
            voice:'“儿童安全瓶盖……防住了孩子，也防住了我。”',
            data:'<b>真实数据</b> · 约 10% 的 65 岁以上老人患有特发性震颤或帕金森样症状，频率恰好在 4–6Hz——正是你刚才感受到的抖动。'});
        },700);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      progress=0;done=false;pressing=false;last=0;t0=0;
      cap.style.transition='';cap.style.top='88px';cap.style.opacity='1';cap.style.transform='';
      cap.style.setProperty('--p',0);
      capBar.style.width='0%';capTxt.textContent='0%';
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;}
  };
})();

/* ================= 关卡三：重听 ================= */
const g3=(function(){
  const full='奶奶，妈妈说星期四下午三点，带您去医院复查，记得带医保卡，我们在小区门口等您。';
  // 高频辅音字先丢失（s/sh/x/q/j 声母），而不是随机缺字
  const stages=[
    '奶奶，妈妈说<span class="miss">◌</span>期<span class="miss">◌</span>下午<span class="miss">◌</span>点，带您去<span class="miss">◌</span>院复<span class="miss">◌</span>，记得带医保卡，我们在<span class="miss">◌</span>区门口等您。',
    '奶奶，妈妈说星期<span class="miss">◌</span>下午三点，带您去医院复查，记得带医保卡，我们在小区门口等您。',
    full+'（他放慢了语速，几乎是喊出来的）'
  ];
  const faces=['🧒','🙂','😮‍💨'];
  const patienceIcons=['😊😊😊','😊😊','😐'];
  let stage=0,answered=false;
  const speech=document.getElementById('speech');
  const face=document.getElementById('npcFace');
  const pat=document.getElementById('patience');
  const btn=document.getElementById('repeatBtn');

  btn.addEventListener('click',()=>{
    if(stage<2){
      stage++;
      render();
      face.style.transform='scale(1.15)';
      setTimeout(()=>face.style.transform='',250);
      if(stage===2)btn.disabled=true;
    }
  });
  function render(){
    speech.innerHTML=stages[stage];
    face.textContent=faces[stage];
    pat.innerHTML='孙子的耐心：<b>'+patienceIcons[stage]+'</b>';
  }
  document.getElementById('q3opts').addEventListener('click',e=>{
    const o=e.target.closest('.opt');
    if(!o||answered)return;
    answered=true;
    const right=o.dataset.r==='1';
    o.classList.add(right?'right':'wrong');
    const repeatNote = stage===0
      ? '你一次都没让他重复就答对了？——大多数老人不敢赌，也不好意思问。'
      : '你让他重复了 '+stage+' 遍才听清。现实里，很多老人在第一遍之后就点头装懂了。';
    setTimeout(()=>{
      if(right){
        showResult({gameId:'g3',success:true,
          title:'听清了：星期四',
          body:repeatNote,
          voice:'“再问一遍，孩子就要不耐烦了。算了，就当是星期四吧……”',
          data:'<b>真实数据</b> · 我国 65 岁以上老人约三分之一存在中度以上听力损失，高频辅音（s、sh、x）最先丢失——所以“四”和“十”、“先”和“三”，在他们耳中几乎一样。'});
      }else{
        showResult({gameId:'g3',success:false,
          title:'记错日子了',
          body:'星期三那天，她在医院门口等了一下午，没人来。'+(stage<2?'<br>其实……你还可以再问一遍的。':''),
          voice:'“肯定是我记岔了，别怪孩子。”',
          data:'<b>真实数据</b> · 听力损失让老人逐渐回避交谈。研究表明，未干预的听损会使老年抑郁与认知衰退风险显著升高——助听器的平均佩戴率却不足 10%。'});
      }
    },600);
  });

  /* 耳鸣模拟（WebAudio，可开关） */
  let ac=null,nodes=null;
  document.getElementById('tinnitusBtn').addEventListener('click',function(){
    if(!ac){
      try{
        ac=new (window.AudioContext||window.webkitAudioContext)();
        const osc=ac.createOscillator();osc.type='sine';osc.frequency.value=5800;
        const g=ac.createGain();g.gain.value=0.012;
        osc.connect(g).connect(ac.destination);osc.start();
        nodes={osc,g};
        this.textContent='🔕 摘下耳朵（关闭耳鸣）';
      }catch{this.textContent='当前设备不支持音频';}
    }else{
      const on=nodes.g.gain.value>0;
      nodes.g.gain.value=on?0:0.012;
      this.textContent=on?'🔔 戴上她的耳朵（模拟耳鸣声）':'🔕 摘下耳朵（关闭耳鸣）';
    }
  });

  return {
    start(){
      stage=0;answered=false;btn.disabled=false;
      document.querySelectorAll('#q3opts .opt').forEach(o=>o.classList.remove('right','wrong'));
      render();
    },
    stop(){ if(nodes&&nodes.g)nodes.g.gain.value=0; }
  };
})();

/* ================= 关卡四：过马路 ================= */
const g4=(function(){
  const road=document.getElementById('road');
  const walker=document.getElementById('walker');
  const lightNum=document.getElementById('lightNum');
  const lightTxt=document.getElementById('lightTxt');
  const legBar=document.getElementById('legBar');
  const legTxt=document.getElementById('legTxt');
  const legWrap=document.getElementById('legBarWrap');
  const btn=document.getElementById('walkBtn');

  const H=430, TOP_SAFE=56, BOT_SAFE=H-56;   // 人行道
  const ISL_TOP=194, ISL_BOT=236;            // 安全岛
  const TRAFFIC_TYPES={
    minibus:{label:'小巴',className:'minibus',speed:[245,315]},
    "double-decker":{label:'巴士',className:'double-decker',speed:[115,155]},
    taxi:{label:'🚕',className:'taxi',speed:[180,230]},
    car:{label:'🚗',className:'private-car',speed:[145,190]}
  };
  const TRAFFIC_LANES=[
    {ly:86,type:'minibus'},
    {ly:120,type:'taxi'},
    {ly:154,type:'double-decker'},
    {ly:264,type:'double-decker'},
    {ly:298,type:'minibus'},
    {ly:332,type:'car'},
    {ly:366,type:'taxi'}
  ];
  let y=H-28, walking=false, leg=100;
  let green=true, tLight=20, raf=null, last=0, done=false, attempts=0;
  let cars=[],carEls=[];

  bindHold(btn,()=>walking=true,()=>walking=false);

  function buildLanes(){
    // 清理旧元素
    road.querySelectorAll('.lane-mark,.car').forEach(el=>el.remove());
    carEls=[];cars=[];
    const laneYs=[90,124,158,268,302,336,370].filter(v=>v>TOP_SAFE&&v<BOT_SAFE);
    laneYs.forEach(ly=>{
      if(ly!==158&&ly!==370){ // 车道分隔线
        const m=document.createElement('div');
        m.className='lane-mark';m.style.top=(ly+17)+'px';
        road.appendChild(m);
      }
    });
    // 车辆：小巴较快、巴士较慢且更占视野，只制造压迫感，不改变失败规则。
    TRAFFIC_LANES.forEach(({ly,type},i)=>{
      const traffic=TRAFFIC_TYPES[type];
      const dir=(ly<ISL_TOP)?-1:1;
      const el=document.createElement('div');
      el.className='car '+traffic.className;
      el.textContent=traffic.label;
      el.style.top=(ly-6)+'px';
      road.appendChild(el);
      carEls.push(el);
      cars.push({
        x:(i*92)%440-80,
        dir,
        flip:dir>0&&(type==='taxi'||type==='car'),
        speed:traffic.speed[0]+Math.random()*(traffic.speed[1]-traffic.speed[0])
      });
    });
  }
  function inSafeZone(yy){
    return yy>=BOT_SAFE || yy<=TOP_SAFE || (yy>=ISL_TOP&&yy<=ISL_BOT);
  }
  function loop(t){
    if(!last)last=t;
    const dt=Math.min((t-last)/1000,.08);last=t;

    // 信号灯
    tLight-=dt;
    if(tLight<=0){green=!green;tLight=green?20:10;}
    lightNum.textContent=Math.ceil(tLight);
    lightNum.className='light '+(green?'green':'red');
    lightTxt.textContent=green?'绿灯 · 可以通行':'红灯 · 车流通行';

    // 行走：老年步速 + 疲劳减速
    if(walking&&!done){
      leg-=8*dt;
      if(leg<0)leg=0;
      const speed=(leg>35?13:9);   // px/s —— 走完全程约需 26~30 秒
      y-=speed*dt;
    }else{
      leg+=4*dt; if(leg>100)leg=100;
    }
    legBar.style.width=leg+'%';legTxt.textContent=Math.round(leg);
    legWrap.classList.toggle('low',leg<35);
    walker.style.top=y+'px';

    // 车辆动画：红灯（对行人）时车流通行
    cars.forEach((c,i)=>{
      if(!green){
        c.x+=c.dir*c.speed*dt;
        if(c.x>460)c.x=-130; if(c.x<-130)c.x=460;
      }
      carEls[i].style.transform='translateX('+c.x+'px)'+(c.flip?' scaleX(-1)':'');
    });

    // 判定
    if(!done){
      if(y<=TOP_SAFE){
        done=true;
        setTimeout(()=>{
          showResult({gameId:'g4',success:true,
            title:'到了。你用了两个绿灯',
            body:'年轻人一口气就能走完的马路，你必须在中间的安全岛停下来，等下一个 20 秒。'+(attempts>0?'<br>（这已经是你第 '+(attempts+1)+' 次尝试了）':''),
            voice:'“绿灯又开始闪了……走快点，再快点，腿啊，你争点气。”',
            data:'<b>真实数据</b> · 交通信号通常按 1.0–1.2 米/秒的步速设计，而多数老年人的步速只有 0.6–0.8 米/秒。对他们来说，每一次过马路都是一场掐着秒表的考试。'});
        },300);
      }else if(!green&&!inSafeZone(y)){
        // 红灯困在车道上
        done=true;
        road.classList.add('shake');
        honk();
        setTimeout(()=>{
          road.classList.remove('shake');
          attempts++;
          showResult({gameId:'g4',success:false,
            title:'红灯了，你还在马路中间',
            body:'喇叭声从四面八方压过来。司机看到的是一个“慢吞吞挡路的老人”，看不到的是一双已经拼尽全力的腿。<br><b>提示：先走到中间的安全岛，等下一个绿灯。</b>',
            voice:'“我真的……已经走得很快了。”',
            data:'<b>真实数据</b> · 步行过街是老年人交通事故的高发场景。设有二次过街安全岛的路口，老年行人事故率显著更低。'});
        },500);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  function honk(){
    try{
      const ac=new (window.AudioContext||window.webkitAudioContext)();
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='square';o.frequency.value=310;g.gain.value=.06;
      o.connect(g).connect(ac.destination);o.start();
      setTimeout(()=>{o.stop();ac.close();},450);
    }catch{}
  }
  return {
    start(){
      y=H-28;walking=false;leg=100;green=true;tLight=20;done=false;last=0;
      walker.style.top=y+'px';
      buildLanes();
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;walking=false;}
  };
})();

/* ================= 关卡：菜市场数钱 ================= */
const g7=(function(){
  const TARGET_PRICE=86;
  const priceStages=[
    '一條魚六十八，菜心十八，總共<span class="miss">◌</span>十<span class="miss">◌</span>蚊！',
    '總共八十<span class="miss">◌</span>蚊，阿姐！',
    '（他湊到你耳邊喊）總共——八十六蚊！'
  ];
  const BILLS=[
    {v:100,c:'#8B4A6B', t:'壹佰蚊'},
    {v:50, c:'#6B9A6B', t:'伍拾蚊'},
    {v:50, c:'#6B9A6B', t:'伍拾蚊'},
    {v:20, c:'#6F8EC7', t:'貳拾蚊'},
    {v:10, c:'#8A68A8', t:'拾蚊'},
    {v:5,  c:'#B78352', t:'五蚊'},
    {v:5,  c:'#B78352', t:'五蚊'},
    {v:2,  c:'#9AA0A8', t:'兩蚊'},
    {v:2,  c:'#9AA0A8', t:'兩蚊'},
    {v:2,  c:'#9AA0A8', t:'兩蚊'}
  ];
  let stage=0,done=false;
  const vendor=document.getElementById('vendorSay');
  const wallet=document.getElementById('wallet');
  const askBtn=document.getElementById('askPriceBtn');
  const pickCnt=document.getElementById('pickCnt');

  askBtn.addEventListener('click',()=>{
    if(stage<2){stage++;vendor.innerHTML=priceStages[stage];if(stage===2)askBtn.disabled=true;}
  });
  bindHold(document.getElementById('squint2Btn'),
    ()=>wallet.classList.add('squint'),
    ()=>wallet.classList.remove('squint'));

  function buildWallet(){
    wallet.innerHTML='';
    BILLS.forEach(b=>{
      const el=document.createElement('button');
      el.className='bill'+(b.v<10?' coin':'');
      el.style.background='linear-gradient(100deg,'+b.c+' 20%, #fff2 50%, '+b.c+' 80%),'+b.c;
      el.textContent=b.t;
      el.dataset.v=b.v;
      el.onclick=()=>{
        if(done)return;
        el.classList.toggle('sel');
        pickCnt.textContent=wallet.querySelectorAll('.sel').length;
      };
      wallet.appendChild(el);
    });
  }
  document.getElementById('payBtn').addEventListener('click',()=>{
    if(done)return;
    const sels=[...wallet.querySelectorAll('.sel')];
    if(!sels.length)return;
    const sum=Math.round(sels.reduce((s,el)=>s+parseFloat(el.dataset.v),0)*10)/10;
    done=true;
    const askNote= stage===0 ? '而且你没让鱼档老板重复，就赌对了价格——现实里，老人往往直接递上一张大钞：“你看着找吧。”'
                             : '你让鱼档老板重复了 '+stage+' 遍。街市里，不是每个档口都有这份耐心。';
    if(sum===TARGET_PRICE){
      showResult({gameId:'g7',success:true,
        title:'不多不少，正好八十六蚊',
        body:'在模糊的视界里数对了港纸。'+askNote,
        voice:'“五十蚊係綠色，二十蚊係藍色……等我瞇埋眼睇清楚先。”',
        data:'<b>真实数据</b> · 白内障带来的“黄化”让颜色难以分辨，纸币面额首当其冲。当越来越多街市档口只挂出收款码，一位只会用现金的老人，连买一条鱼和一扎菜都成了闯关。'});
    }else if(sum>TARGET_PRICE){
      showResult({gameId:'g7',success:true,
        title:'鱼档老板笑了：“阿姐，多咗喇”',
        body:'你多付了 '+(sum-TARGET_PRICE)+' 蚊，好在遇上了厚道人，找了回来。可要是遇上不厚道的呢？很多老人多付了钱，自己永远不会知道。',
        voice:'“畀多張大鈔算啦，費事數錯……等人哋找返。”',
        data:'<b>真实数据</b> · 视力与计算速度下降后，“多给钱让对方找”是老人普遍的自我保护策略——也让他们成了找零欺诈的最易受害人群。'});
    }else{
      showResult({gameId:'g7',success:false,
        title:'“阿姐，唔夠錢喎”',
        body:'差了 '+(TARGET_PRICE-sum)+' 蚊。档主提高了嗓门，后面排队的人朝你看过来，你的脸一下子热了。',
        voice:'“人老咗，連買餸啲錢都數唔清……真係失禮。”',
        data:'<b>真实数据</b> · 这种当众的窘迫会让老人逐渐回避独自购物、回避社交——很多“不爱出门”，其实是“怕出错”。'});
    }
  });
  return {
    start(){
      stage=0;done=false;askBtn.disabled=false;
      vendor.innerHTML=priceStages[0];
      pickCnt.textContent='0';
      wallet.classList.remove('squint');
      buildWallet();
    },
    stop(){}
  };
})();

/* ================= 关卡：记忆购物 ================= */
const g8=(function(){
  const stageEl=document.getElementById('memoStage');
  const TARGET=['必理痛','薯片','生抽酱油'];
  const OPTIONS=['必理痛','幸福傷風素','胃藥','薯片','蝦條','生抽酱油','老抽酱油','蠔油','紙巾'];
  const WALKS=[
    '升降機大堂碰到隔籬陳太：“落街呀？我個孫今朝又唔肯返學呀……”你陪著笑，聽咗好一陣。',
    '過馬路嗰陣，小巴、巴士同八達通嘟嘟聲一齊湧過嚟，你心入面張清單突然散咗一半。',
    '超市門口喇叭循環播著：“薯片第二包半價！蝦條特價！今日最後一天！”'
  ];
  let timer=null,picked=[];

  function start(){
    picked=[];clearInterval(timer);
    let n=6;
    stageEl.innerHTML=
      '<div class="memo-card">落街要買三樣嘢：<br><b>必理痛 · 薯片 · 生抽酱油</b></div>'+
      '<div class="memo-count">喺心入面默念一次……<span id="memoN">6</span> 秒後出發</div>';
    timer=setInterval(()=>{
      n--;
      const el=document.getElementById('memoN');
      if(el)el.textContent=n;
      if(n<=0){clearInterval(timer);walkStep(0);}
    },1000);
  }
  function walkStep(i){
    if(i>=WALKS.length){arrive();return;}
    stageEl.innerHTML='<div class="walk-event">🚶 '+WALKS[i]+'</div><div class="center"><button class="btn" id="goOn">繼續行</button></div>';
    document.getElementById('goOn').onclick=()=>walkStep(i+1);
  }
  function arrive(){
    stageEl.innerHTML='<div class="memo-card" style="background:var(--dusk2);color:var(--paper-dim);">……</div>';
    setTimeout(()=>{
      stageEl.innerHTML=
        '<div class="walk-event">到超市了。你企喺貨架前，手扶住購物籃，突然愣住——<b style="color:var(--amber)">頭先……要買咩嚟？</b><br>靠記憶揀返嗰三樣：</div>'+
        '<div class="shop-grid" id="shopGrid"></div>'+
        '<div class="center"><button class="btn" id="checkout">去畀錢（<span id="pkn">0</span>/3）</button></div>';
      const grid=document.getElementById('shopGrid');
      OPTIONS.forEach(o=>{
        const b=document.createElement('button');
        b.className='shop-item';b.textContent=o;
        b.onclick=()=>{
          if(b.classList.contains('sel')){
            b.classList.remove('sel');picked=picked.filter(x=>x!==o);
          }else if(picked.length<3){
            b.classList.add('sel');picked.push(o);
          }
          document.getElementById('pkn').textContent=picked.length;
        };
        grid.appendChild(b);
      });
      document.getElementById('checkout').onclick=()=>{
        if(picked.length<3)return;
        const hits=picked.filter(x=>TARGET.includes(x));
        const missed=TARGET.filter(x=>!picked.includes(x));
        const wrong=picked.filter(x=>!TARGET.includes(x));
        if(hits.length===3){
          showResult({gameId:'g8',success:true,
            title:'三樣都記住咗',
            body:'穿過鄰居閒談、小巴聲同超市特價廣播，你將張清單護送到收銀處。留意到嗎——呢一路上，<b>冇任何任務提示幫你</b>。',
            voice:'“出門前念三次，一路上再念三次。人哋笑我口噏噏，唔噏就真係會唔記得。”',
            data:'<b>真实数据</b> · 工作记忆容量随年龄自然衰退，且更容易被无关信息“覆写”。列清单、口头复述、把东西放在门口——这些不是怪癖，是老人为自己发明的记忆假肢。'});
        }else{
          let bodyTxt='返到屋企打開袋，你先發現：';
          if(missed.length)bodyTxt+='<b>忘了买 '+missed.join('、')+'</b>；';
          if(wrong.length)bodyTxt+='買多咗 '+wrong.join('、')+'。';
          if(picked.includes('蝦條'))bodyTxt+='<br>嗰包特價蝦條——喇叭塞入腦入面嘅嘢，竟然記得清過自己張清單。';
          if(missed.includes('必理痛'))bodyTxt+='<br>而忘掉的偏偏是必理痛。';
          showResult({gameId:'g8',success:false,
            title:'袋入面啲嘢，唔係好啱',
            body:bodyTxt,
            voice:'“明明出門前仲記得清清楚楚……點解一路行一路就漏咗呢。”',
            data:'<b>真实数据</b> · 偶尔忘事是正常老化；但如果“忘了买”变成“忘了自己来过超市”，就需要警惕认知障碍的早期信号。区分两者，是家人能做的第一层守护。'});
        }
      };
    },900);
  }
  return {start, stop(){clearInterval(timer);}};
})();

/* ================= 关卡：八达通余额不足 ================= */
const g6=(function(){
  const TOTAL=30;
  const stage=document.getElementById('octopusStage');
  const scene=document.getElementById('octopusScene');
  const controls=document.getElementById('octopusControls');
  const msg=document.getElementById('octopusMsg');
  const pressureBar=document.getElementById('octPressureBar');
  const pressureN=document.getElementById('octPressureN');
  const timeN=document.getElementById('octTimeN');
  const shadeBtn=document.getElementById('octShadeBtn');
  let t=TOTAL,phase='gate',pressure=0,maxPressure=0,errors=0,timeouts=0,amount=50,done=false,raf=null,last=0,t0=0;

  bindHold(shadeBtn,()=>stage.classList.add('clear'),()=>stage.classList.remove('clear'));

  function touch(){t=TOTAL;}
  function addPressure(n,text){
    pressure=Math.min(100,pressure+n);
    maxPressure=Math.max(maxPressure,pressure);
    if(text)msg.textContent=text;
    if(n>0){
      stage.classList.add('shake');
      setTimeout(()=>stage.classList.remove('shake'),320);
    }
    if(pressure>=100&&errors>=3)fail();
  }
  function renderStatus(){
    pressureBar.style.width=pressure+'%';
    pressureN.textContent=Math.round(pressure);
    timeN.textContent=Math.ceil(t);
    stage.classList.toggle('panic',pressure>=65);
  }
  function setControls(html){controls.innerHTML=html;}
  function render(){
    renderStatus();
    if(phase==='gate'){
      scene.innerHTML='<div class="oct-gate"><b>入闸机</b><div class="oct-reader red">请拍卡</div><div class="oct-card">八达通</div></div><div class="oct-crowd">🧍 🧍 🧍</div>';
      setControls('<button class="kbtn" data-a="tapGate">💳 拍八达通</button>');
      msg.textContent='先拍八达通入闸。';
    }else if(phase==='machines'){
      scene.innerHTML='<div class="oct-machines"><button class="oct-machine" data-machine="ticket">售票机</button><button class="oct-machine" data-machine="check">查阅机</button><button class="oct-machine good" data-machine="topup">增值机</button><button class="oct-machine" data-machine="service">客服中心</button></div>';
      setControls('');
      msg.textContent='后面有人排队。离开闸机，找增值机。';
    }else if(phase==='card'){
      scene.innerHTML='<div class="oct-kiosk"><h4>增值机</h4><p>步骤 1 / 4：请拍卡</p><div class="oct-reader">读卡区</div><div class="bill-slot">入钞口</div></div>';
      setControls('<button class="kbtn" data-a="tapMachineCard">💳 拍到读卡区</button><button class="kbtn" data-a="tapWrongSlot">拍到入钞口</button>');
      msg.textContent='把八达通拍到黄色读卡区。';
    }else if(phase==='amount'){
      scene.innerHTML='<div class="oct-kiosk"><h4>选择增值金额</h4><p>余额 HK$3.7</p><div class="amount-row"><button data-a="amount" data-v="20">HK$20</button><button data-a="amount" data-v="50">HK$50</button><button data-a="amount" data-v="100">HK$100</button></div></div>';
      setControls('');
      msg.textContent='目标是增值 HK$50。反光下，20 和 50 很容易看错。';
    }else if(phase==='cash'){
      scene.innerHTML='<div class="oct-kiosk"><h4>请放入纸币</h4><p>已选择 HK$'+amount+'</p><div class="cash-row"><button data-a="cash" data-v="10">HK$10</button><button data-a="cash" data-v="20">HK$20</button><button data-a="cash" data-v="50">HK$50</button><button data-a="cash" data-v="100">HK$100</button></div></div>';
      setControls('');
      msg.textContent='从钱包里找出同面额纸币。按住眯眼可以短暂看清。';
    }else if(phase==='return'){
      scene.innerHTML='<div class="oct-gate ok"><b>入闸机</b><div class="oct-reader">请再次拍卡</div><div class="oct-card">八达通</div></div><div class="oct-crowd kind">🧍 <span>慢慢嚟，我唔赶。</span></div>';
      setControls('<button class="kbtn" data-a="passGate">💳 再次拍卡</button>');
      msg.textContent='增值成功。回到闸机，再拍一次卡。';
    }
  }
  function wrong(text,n=10){
    errors++;touch();addPressure(n,text);
  }
  function finish(){
    done=true;renderStatus();
    scene.innerHTML='<div class="oct-gate ok"><b>嘟——通过</b><div class="oct-reader">绿色灯</div></div>';
    const sec=Math.round((performance.now()-t0)/1000);
    setTimeout(()=>{
      showResult({gameId:'g6',success:true,
        title:'终于入到闸，'+sec+' 秒',
        body:'你不是不会用八达通。你只是被闸机声、后面人流、反光屏幕、倒计时和细字一起夹住。'+(amount===20?'<br>你只增值了 HK$20，今日行程可能仍然要小心余额。':''),
        voice:'“嘟嘟一响，后面有人等，我个脑就乱晒。”',
        data:'<b>数码通行指数</b> · 误触 '+errors+' 次，超时 '+timeouts+' 次，最高压力 '+Math.round(maxPressure)+'%。公共空间的数码流程，最难的往往是出错之后没有人等你。'});
    },900);
  }
  function fail(){
    if(done)return;
    done=true;renderStatus();
    setTimeout(()=>{
      showResult({gameId:'g6',success:false,
        title:'你决定先离开闸机',
        body:'你站在增值机前，突然不想再试了。后面的人没有骂你，只是叹了一口气。但这一声已经够了。你决定走去客服中心排队，或者改天再去覆诊。',
        voice:'“我不是不会，我只是越急越看不清。”',
        data:'<b>体验提示</b> · 压力会放大视力和操作困难。清晰按钮、足够时间、有人帮忙解释，能让长者保住体面。'});
    },500);
  }
  controls.addEventListener('click',e=>{
    const b=e.target.closest('[data-a]');
    if(!b||done)return;
    handle(b.dataset.a,b.dataset.v);
  });
  scene.addEventListener('click',e=>{
    const machine=e.target.closest('[data-machine]');
    const b=e.target.closest('[data-a]');
    if(done)return;
    if(machine){handle('machine',machine.dataset.machine);}
    else if(b){handle(b.dataset.a,b.dataset.v);}
  });
  function handle(a,v){
    touch();
    if(a==='tapGate'&&phase==='gate'){
      phase='machines';pressure=35;maxPressure=35;render();
      msg.textContent='嘟嘟——余额不足。后面有人排队。';
    }else if(a==='machine'&&phase==='machines'){
      if(v==='topup'){phase='card';render();}
      else if(v==='service'){wrong('客服中心前排了很长的队。压力又上来了。',15);}
      else wrong('这部不是增值机。字太细，刚才看错了。',10);
    }else if(a==='tapMachineCard'&&phase==='card'){
      phase='amount';render();
    }else if(a==='tapWrongSlot'&&phase==='card'){
      wrong('机器没有反应。你才发现那是入钞口。',10);
    }else if(a==='amount'&&phase==='amount'){
      amount=Number(v);
      if(amount===100){wrong('现钞不够 HK$100。请重新选择。',15);}
      else{phase='cash';render();if(amount===20)addPressure(6,'HK$20 也可以，但今天可能不够用。');}
    }else if(a==='cash'&&phase==='cash'){
      const cash=Number(v);
      if(cash===amount){phase='return';pressure=Math.max(0,pressure-12);render();}
      else wrong('纸币不符，请取回。后面提示音又响了一次。',10);
    }else if(a==='passGate'&&phase==='return'){
      finish();
    }
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.1);last=ts;
    if(!done&&phase!=='gate'&&phase!=='return'){
      t-=dt;
      if(t<=0){
        timeouts++;t=TOTAL;phase='card';errors++;addPressure(20,'长时间未操作，系统回到首页。又要重新拍卡。');
        if(timeouts>=3)fail();
        else render();
      }
    }
    renderStatus();
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      t=TOTAL;phase='gate';pressure=0;maxPressure=0;errors=0;timeouts=0;amount=50;done=false;last=0;t0=performance.now();
      stage.classList.remove('clear','panic');
      render();
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;}
  };
})();

/* ================= 关卡：手机弹窗 ================= */
const g5=(function(){
  const scr=document.getElementById('phoneScreen');
  const missEl=document.getElementById('missN');
  let ring=40,raf=null,last=0,done=false,miss=0;

  function addMiss(){miss++;missEl.textContent=miss;}
  function rndPos(el){
    el.style.left=(10+Math.random()*46)+'px';
    el.style.top=(70+Math.random()*230)+'px';
  }
  function build(){
    scr.innerHTML='';
    const call=document.createElement('div');
    call.className='callcard';
    call.innerHTML='<div class="cava">👧</div><div class="cname">囡囡</div><div class="ring-timer">邀请你视频通话 · 还剩 <span id="ringN">40</span> 秒</div>';
    const ans=document.createElement('button');
    ans.className='answerBtn';ans.textContent='📹';
    ans.onclick=()=>{ if(done)return; done=true; win(); };
    call.appendChild(ans);
    scr.appendChild(call);
    spawnPopup(0);
  }
  function spawnPopup(idx){
    const p=document.createElement('div');
    p.className='popup';rndPos(p);
    let fakeX=false;
    if(idx===0){
      p.innerHTML='<h5>🎁 恭喜！您获得老年养生大礼包</h5><p>价值 999 元，仅限今日，点击立即领取！</p><button class="adbtn">立即领取</button>';
    }else if(idx===1){
      p.innerHTML='<h5>⚡ 内存严重不足！</h5><p>检测到手机卡顿，一键清理提速 300%</p><button class="adbtn">立即清理</button>';
      fakeX=true;
    }else{
      p.innerHTML='<h5>📶 【紧急】流量即将用尽</h5><p>本月流量剩余 3%，立即充值享 5 折优惠</p><button class="adbtn">马上充值</button>';
    }
    const x=document.createElement('div');
    x.className='x';x.textContent='✕';
    p.appendChild(x);
    // 点弹窗身体或大按钮 = 误触，弹窗还会跳走
    p.addEventListener('click',e=>{
      if(done)return;
      if(e.target===x){
        if(fakeX){ e.stopPropagation(); showFullAd(p,idx); }
        else{ closePopup(p,idx); }
        return;
      }
      addMiss();
      p.style.animation='shake .3s';
      setTimeout(()=>{p.style.animation='';rndPos(p);},280);
    });
    scr.appendChild(p);
  }
  function showFullAd(popup,idx){
    const ad=document.createElement('div');
    ad.className='fullad';
    ad.innerHTML='<div style="font-size:44px;">💊✨</div><b style="font-size:18px;">神奇磁疗鞋垫</b><p style="font-size:13px;opacity:.9;">走一走，腿不酸腰不痛<br>已售 10 万+ 双</p>';
    const skip=document.createElement('div');
    skip.className='skip';
    let n=5;skip.textContent='跳过 '+n;
    const tm=setInterval(()=>{
      n--;
      if(n<=0){clearInterval(tm);skip.textContent='✕ 跳过';skip.dataset.ok='1';}
      else skip.textContent='跳过 '+n;
    },1000);
    skip.onclick=()=>{
      if(!skip.dataset.ok){addMiss();return;}
      clearInterval(tm);ad.remove();closePopup(popup,idx);
    };
    ad.appendChild(skip);
    scr.appendChild(ad);
  }
  function closePopup(p,idx){
    p.remove();
    if(idx<2)spawnPopup(idx+1);
  }
  function win(){
    scr.innerHTML='<div class="callcard"><div class="cava">👧</div><div class="cname">囡囡</div><div class="ring-timer" style="color:#7DDE8B;">已接通 · 00:01</div><p style="margin-top:24px;font-size:15px;color:#DDD;line-height:2;">“奶奶！你终于接啦！<br>我还以为你不在家呢～”</p></div>';
    setTimeout(()=>{
      showResult({gameId:'g5',success:true,
        title:'接通了，用了 '+Math.round(40-ring)+' 秒',
        body:'为了这通电话，你穿过了 3 层弹窗，误触了 '+miss+' 次，还被一个假“关闭”骗进了全屏广告。年轻人叫它“套路”，老人只会怪自己笨。',
        voice:'“不是奶奶不想接……是这手机，它拦着我啊。”',
        data:'<b>真实数据</b> · 工信部适老化整改明确要求：适老版应用禁止广告弹窗、禁止诱导下载。可在整改名单之外，仿冒“关闭”按钮的弹窗，依然是老人手机里的日常。'});
    },1600);
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.1);last=ts;
    if(!done){
      ring-=dt;
      const n=document.getElementById('ringN');
      if(n)n.textContent=Math.max(0,Math.ceil(ring));
      if(ring<=0){
        done=true;
        scr.innerHTML='<div class="callcard"><div class="cava" style="filter:grayscale(1);">👧</div><div class="cname">囡囡</div><div class="ring-timer" style="color:#FF7A6B;">未接来电</div></div>';
        setTimeout(()=>{
          showResult({gameId:'g5',success:false,
            title:'铃声停了',
            body:'你还在跟第 '+(miss>3?'不知道多少':'二')+' 个弹窗搏斗，电话已经挂断。<br>晚上家庭群里，女儿发消息说：“妈总不接视频，是不是不会用啊？”<br>——其实你一直在拼命地点。',
            voice:'“囡囡，奶奶不是不接……奶奶找不到你在哪儿。”',
            data:'<b>真实数据</b> · 调查显示，近半数老年人曾因弹窗广告误触扣费或下载。每一个设计成“✕ 很小、按钮很大”的弹窗，都是对他们的一次精准围猎。'});
        },1200);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      ring=40;done=false;miss=0;last=0;missEl.textContent='0';
      build();
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;}
  };
})();

/* ================= 关卡：微信打字 ================= */
const g10=(function(){
  const TILES=['好的','周三','周四','再','见','不去','，','。','？'];
  const COLS=3, TARGET='好的，周四见';
  const chat=document.getElementById('chatBox');
  const compose=document.getElementById('composeLine');
  const tilesEl=document.getElementById('tiles');
  let tokens=[],t0=0,done=false;

  function neighbors(i){
    const r=Math.floor(i/COLS),c=i%COLS,list=[];
    if(c>0)list.push(i-1);
    if(c<COLS-1)list.push(i+1);
    if(r>0)list.push(i-COLS);
    if(i+COLS<TILES.length)list.push(i+COLS);
    return list;
  }
  function renderCompose(){
    compose.innerHTML=tokens.length?tokens.join(''):'<span class="ph">点下面的按键输入…</span>';
  }
  function buildTiles(){
    tilesEl.innerHTML='';
    TILES.forEach((w,i)=>{
      const b=document.createElement('button');
      b.className='tile';b.textContent=w;
      b.onclick=()=>{
        if(done)return;
        let actual=i;
        if(Math.random()<0.3){                 // 手抖误触：点A出B
          const ns=neighbors(i);
          actual=ns[Math.floor(Math.random()*ns.length)];
          const wrongEl=tilesEl.children[actual];
          wrongEl.classList.add('flash');
          setTimeout(()=>wrongEl.classList.remove('flash'),350);
        }
        tokens.push(TILES[actual]);
        renderCompose();
      };
      tilesEl.appendChild(b);
    });
  }
  document.getElementById('delBtn').addEventListener('click',()=>{
    if(done)return;
    tokens.pop();renderCompose();
  });
  document.getElementById('sendBtn').addEventListener('click',()=>{
    if(done||!tokens.length)return;
    done=true;
    const sent=tokens.join('');
    const sec=Math.round((Date.now()-t0)/1000);
    chat.innerHTML+='<div class="msg me"><span class="who">🧓</span><p>'+sent+'</p></div>';
    setTimeout(()=>{
      if(sent===TARGET){
        chat.innerHTML+='<div class="msg"><span class="who">🧒</span><p>好嘞奶奶！周四见！❤️</p></div>';
        setTimeout(()=>{
          showResult({gameId:'g10',success:true,
            title:'发出去了，用时 '+sec+' 秒',
            body:'五个词的一条消息。年轻人打完只要三秒——你刚才每一次“点的是A、出来的是B”，都是她指尖的日常。',
            voice:'“回个‘好的’要改三遍……所以奶奶总是发语音，不是懒，是键盘欺负人。”',
            data:'<b>真实数据</b> · 手指触控精度随年龄下降，指尖干燥还会让电容屏“失灵”。适老化设计规范因此要求：触控目标不小于 9 毫米、允许长按语音替代打字。'});
        },900);
      }else{
        chat.innerHTML+='<div class="msg"><span class="who">🧒</span><p>啊？？奶奶您是说不来了吗？😢</p></div>';
        setTimeout(()=>{
          showResult({gameId:'g10',success:false,
            title:'话，被手机说错了',
            body:'你想说“'+TARGET+'”，发出去的却是“'+sent+'”。孙子盯着屏幕愣了半天。<br>多少老人被误触的键盘替自己“说”过话，又要花十倍的力气解释。',
            voice:'“这手机怎么净替我说话……我明明点的不是这个字啊。”',
            data:'<b>真实数据</b> · 误触与撤回困难是老年用户放弃打字、只发语音的首要原因——而“60 秒语音方阵”，正是他们被键盘逼出来的无奈。'});
        },900);
      }
    },500);
  });
  return {
    start(){
      tokens=[];done=false;t0=Date.now();
      chat.innerHTML='<div class="msg"><span class="who">🧒</span><p>奶奶，那就周四下午三点，我来楼下接您！🌟</p></div>';
      renderCompose();buildTiles();
    },
    stop(){}
  };
})();

/* ================= 关卡：摸黑起夜 ================= */
const g9=(function(){
  const room=document.getElementById('nightRoom');
  const walker=document.getElementById('nightWalker');
  const mask=document.getElementById('nightMask');
  const stumbleEl=document.getElementById('stumbleN');
  let x=0,y=0,raf=null,last=0,done=false,lit=false,stumbles=0;
  const dir={up:false,down:false,left:false,right:false};
  let obstacles=[],W=300,H=340;

  document.querySelectorAll('.dbtn').forEach(b=>{
    bindHold(b,()=>dir[b.dataset.d]=true,()=>dir[b.dataset.d]=false);
  });
  document.addEventListener('keydown',e=>{
    if(activeGame!=='g9')return;
    const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
    if(m[e.key]){dir[m[e.key]]=true;e.preventDefault();}
  });
  document.addEventListener('keyup',e=>{
    const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
    if(m[e.key])dir[m[e.key]]=false;
  });

  function build(){
    room.querySelectorAll('.obst,.furn').forEach(el=>el.remove());
    W=room.clientWidth;H=room.clientHeight;
    const mk=(cls,e,fx,fy)=>{
      const el=document.createElement('div');
      el.className=cls;el.textContent=e;
      el.style.left=(fx*W)+'px';el.style.top=(fy*H)+'px';
      room.appendChild(el);
      return {el,x:fx*W,y:fy*H,cool:0};
    };
    mk('furn','🛏',0.13,0.85);
    mk('furn','🚽',0.9,0.14);
    const sw=mk('furn','💡',0.08,0.14);
    obstacles=[
      mk('obst','🩴',0.34,0.72),
      mk('obst','🧵',0.55,0.52),
      mk('obst','🪑',0.3,0.34),
      mk('obst','🩴',0.74,0.6),
      mk('obst','📦',0.62,0.24)
    ];
    obstacles.switch=sw;
    x=0.13*W;y=0.78*H;
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.08);last=ts;
    if(!done){
      const sp=46;
      if(dir.up)y-=sp*dt;
      if(dir.down)y+=sp*dt;
      if(dir.left)x-=sp*dt;
      if(dir.right)x+=sp*dt;
      x=Math.max(16,Math.min(W-16,x));
      y=Math.max(26,Math.min(H-16,y));
      walker.style.left=x+'px';walker.style.top=y+'px';
      mask.style.setProperty('--lx',x+'px');
      mask.style.setProperty('--ly',y+'px');

      // 夜灯开关
      const sw=obstacles.switch;
      if(!lit&&Math.hypot(x-sw.x,y-sw.y)<26){
        lit=true;room.classList.add('lit');
        sw.el.textContent='💡✨';
      }
      // 障碍物
      obstacles.forEach(o=>{
        if(o.cool>0){o.cool-=dt;return;}
        if(Math.hypot(x-o.x,y-o.y)<23){
          o.cool=1.2;stumbles++;stumbleEl.textContent=stumbles;
          room.classList.add('shake');
          setTimeout(()=>room.classList.remove('shake'),400);
          // 被绊后向后趔趄
          x+= (x-o.x)*1.4; y+=(y-o.y)*1.4;
          if(stumbles>=3){
            done=true;
            setTimeout(()=>{
              showResult({gameId:'g9',success:false,
                title:'摔倒了',
                body:'黑暗里，第三次被绊到时，你没能扶住任何东西。<br>你在地板上躺了很久——够不着手机，也喊不醒任何人。这是独居老人最怕的一种夜晚。',
                voice:'“地上凉……先别慌，缓缓，看能不能扒着床沿起来。”',
                data:'<b>真实数据</b> · 跌倒是我国 65 岁以上老人因伤致死的首位原因，每年约 4000 万老人至少跌倒一次，超过一半发生在家中——而起夜，是最高发的时刻。一盏十几块钱的感应夜灯，就能大幅降低这个风险。'});
            },600);
          }
        }
      });
      // 到达卫生间
      if(!done&&Math.hypot(x-0.9*W,y-0.14*H)<28){
        done=true;
        setTimeout(()=>{
          showResult({gameId:'g9',success:true,
            title:lit?'灯亮着，路就短了':'到了，一路悬着心',
            body:(lit
              ?'你找到了墙上的开关。灯亮起来的那一刻你才看清——拖鞋、电线、小板凳，原来危险一直就在脚边。'
              :'你在黑暗里蹭着地板挪过去的，中途踉跄了 '+stumbles+' 次。每一步，都在赌。')
              +'<br>顺便一提：很多老人不开灯，是怕费电，也是怕吵醒旁边的人——哪怕床的另一边，早已空了很多年。',
            voice:'“慢点走，扶着墙……不摔，就是不给孩子添麻烦。”',
            data:'<b>真实数据</b> · 跌倒是我国 65 岁以上老人因伤致死的首位原因，超过一半发生在家中，起夜时段最高发。感应夜灯、床边扶手、收起地面杂物——三件小事，能挡住大多数意外。'});
        },400);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      done=false;lit=false;stumbles=0;last=0;
      stumbleEl.textContent='0';
      room.classList.remove('lit');
      for(const k in dir)dir[k]=false;
      build();
      walker.style.left=x+'px';walker.style.top=y+'px';
      mask.style.setProperty('--lx',x+'px');
      mask.style.setProperty('--ly',y+'px');
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;for(const k in dir)dir[k]=false;}
  };
})();

/* ================= 关卡：起身平衡（连续操控） ================= */
const g11=(function(){
  const PHASES=[
    {who:'🧎',name:'第一步 · 慢慢坐起', amp:.55,dur:5},
    {who:'🧍',name:'第二步 · 扶床站立', amp:.9, dur:6},
    {who:'🚶',name:'第三步 · 迈出第一步',amp:1.2,dur:6}
  ];
  const ball=document.getElementById('balanceBall');
  const overlay=document.getElementById('dizzyOverlay');
  const scene=document.getElementById('dizzyScene');
  const whoEl=document.getElementById('dizzyWho');
  const phaseEl=document.getElementById('dizzyPhase');
  const phaseBar=document.getElementById('phaseBar');
  let o=0,ph=0,tPhase=0,tAll=0,raf=null,last=0,done=false,blackouts=0;
  const hold={l:false,r:false};
  bindHold(document.getElementById('balL'),()=>hold.l=true,()=>hold.l=false);
  bindHold(document.getElementById('balR'),()=>hold.r=true,()=>hold.r=false);

  function setPhase(i){
    ph=i;tPhase=0;o=0;
    whoEl.textContent=PHASES[i].who;
    phaseEl.textContent=PHASES[i].name;
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.06);last=ts;
    if(!done){
      tAll+=dt;tPhase+=dt;
      const P=PHASES[ph];
      // 身体的漂移力：复合正弦 + 随机游走
      const drift=P.amp*(Math.sin(tAll*1.9)+.6*Math.sin(tAll*3.7+2)+ (Math.random()-.5)*1.6);
      const ctrl=(hold.l?-2.1:0)+(hold.r?2.1:0);
      o+=(drift+ctrl)*dt;
      o=Math.max(-1.08,Math.min(1.08,o));
      ball.style.left=(50+o*46)+'%';
      const dizzy=Math.min(1,Math.abs(o));
      overlay.style.opacity=(dizzy*.9).toFixed(2);
      scene.style.filter='blur('+(dizzy*4).toFixed(1)+'px)';
      phaseBar.style.width=Math.min(100,tPhase/P.dur*100)+'%';

      if(Math.abs(o)>=1.05){
        blackouts++;
        if(blackouts>=3){
          done=true;
          overlay.style.opacity='1';
          setTimeout(()=>{
            showResult({gameId:'g11',success:false,
              title:'眼前一黑，跌坐回床上',
              body:'第三次发黑时，你没能扶稳。还好，是坐回了床上——很多老人没这么幸运，清晨的第一跤，常常摔在起身的那一步。',
              voice:'“别急别急……躺一分钟，坐一分钟，站一分钟，医生说的‘三个一分钟’。”',
              data:'<b>真实数据</b> · 体位性低血压在 65 岁以上人群中的发生率约 20%——起身瞬间脑供血不足导致眼前发黑甚至晕厥。“三个一分钟”起床法是最简单有效的预防。'});
          },600);
        }else{
          phaseEl.textContent='眼前发黑！坐回去缓一缓……（第 '+blackouts+' 次）';
          o=0;tPhase=0;
        }
      }else if(tPhase>=P.dur){
        if(ph<PHASES.length-1){ setPhase(ph+1); }
        else{
          done=true;
          whoEl.textContent='🚶✨';
          setTimeout(()=>{
            showResult({gameId:'g11',success:true,
              title:'站稳了，用了 '+Math.round(tAll)+' 秒',
              body:'从睁眼到迈出第一步，你花了 '+Math.round(tAll)+' 秒'+(blackouts?'，中途发黑 '+blackouts+' 次':'')+'。年轻人一个鲤鱼打挺的事，她每天都要像走钢丝一样完成。',
              voice:'“不着急，天亮着呢。先让血，追上身子。”',
              data:'<b>真实数据</b> · 体位性低血压在 65 岁以上人群中的发生率约 20%。医生推荐“三个一分钟”：醒后躺一分钟、坐起一分钟、床边站一分钟——把这个方法告诉家里老人。'});
          },500);
        }
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      done=false;blackouts=0;tAll=0;last=0;hold.l=hold.r=false;
      overlay.style.opacity='0';scene.style.filter='';
      setPhase(0);
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;hold.l=hold.r=false;}
  };
})();

/* ================= 关卡：穿针引线（精准拖拽） ================= */
const g12=(function(){
  const stage=document.getElementById('needleStage');
  const svg=document.getElementById('needleSvg');
  const ring=document.getElementById('needleEyeRing');
  const timerEl=document.getElementById('needleTimer');
  let raf=null,last=0,t0=0,done=false,dragging=false,drops=0;
  let px=60,py=160,hold=0;
  const HOLD_NEED=1.0;

  stage.addEventListener('pointerdown',e=>{
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    const r=stage.getBoundingClientRect();
    px=e.clientX-r.left;py=e.clientY-r.top;
    dragging=true;
  });
  stage.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const r=stage.getBoundingClientRect();
    px=e.clientX-r.left;py=e.clientY-r.top;
  });
  const drop=()=>{
    if(dragging&&!done){drops++;hold=0;}
    dragging=false;
  };
  stage.addEventListener('pointerup',drop);
  stage.addEventListener('pointercancel',drop);

  function loop(ts){
    if(!last){last=ts;t0=ts;}
    const dt=Math.min((ts-last)/1000,.08);last=ts;
    const sec=(ts-t0)/1000;
    const W=stage.clientWidth,H=stage.clientHeight;

    // 针：竖直悬在右侧，捏针的手也在抖 —— 针眼上下漂移
    const eyeX=W-70+Math.sin(sec*2.1)*5;
    const eyeY=H/2+Math.sin(sec*1.4)*16+Math.cos(sec*3.3)*5;

    // 线头：拖拽位置 + 4~6Hz 老年性震颤
    const amp=dragging?11:5;
    const tx=px+amp*(Math.sin(sec*2*Math.PI*4.6)+.5*Math.sin(sec*2*Math.PI*7.1+1));
    const ty=py+amp*(Math.cos(sec*2*Math.PI*5.3+.6)+.5*Math.sin(sec*2*Math.PI*6.4));

    // 画针 + 线（SVG 每帧重绘）
    svg.innerHTML=
      '<line x1="'+eyeX+'" y1="'+(eyeY-90)+'" x2="'+eyeX+'" y2="'+(eyeY+14)+'" stroke="#C9CDD4" stroke-width="4" stroke-linecap="round"/>'+
      '<circle cx="'+eyeX+'" cy="'+eyeY+'" r="7" fill="none" stroke="#C9CDD4" stroke-width="3.5"/>'+
      '<path d="M 24 '+(H-40)+' Q '+((24+tx)/2)+' '+((H-40+ty)/2-40)+' '+tx+' '+ty+'" fill="none" stroke="#D46A5E" stroke-width="2.5"/>'+
      '<circle cx="'+tx+'" cy="'+ty+'" r="4.5" fill="#D46A5E"/>'+
      '<text x="14" y="'+(H-16)+'" fill="#8A93A5" font-size="12">🧵 线轴</text>';
    ring.style.left=eyeX+'px';ring.style.top=eyeY+'px';

    if(!done){
      const inEye=dragging&&Math.hypot(tx-eyeX,ty-eyeY)<9;
      if(inEye){hold+=dt;}
      else{hold=Math.max(0,hold-dt*1.5);}
      ring.style.setProperty('--p',Math.min(100,hold/HOLD_NEED*100));
      timerEl.textContent='用时 '+Math.round(sec)+' 秒 · 脱手 '+drops+' 次';
      if(hold>=HOLD_NEED){
        done=true;
        setTimeout(()=>{
          showResult({gameId:'g12',success:true,
            title:'穿过去了！用时 '+Math.round(sec)+' 秒',
            body:'线头脱手 '+drops+' 次。两只手都在抖，针眼只有两毫米——这只是缝一颗扣子的<b>第一步</b>。年轻时她闭着眼都能穿上。',
            voice:'“年轻那会儿，我一晚上能给全家纳一双鞋底……现在，跟一个针眼较劲半天。”',
            data:'<b>真实数据</b> · 精细动作能力（指尖捏合、手眼协调）从 65 岁起显著下降，叠加震颤与老花，穿针、系扣、剪指甲成为三大高频求助项。市面上几块钱的“穿针器”，是很多老人不知道的小发明——买一个送过去。'});
        },400);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      done=false;dragging=false;drops=0;hold=0;last=0;
      px=60;py=stage.clientHeight-60;
      ring.style.setProperty('--p',0);
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;dragging=false;}
  };
})();

/* ================= 关卡：叮叮车落车（听站+按钟+到门口） ================= */
const g13=(function(){
  const STOPS=[
    {name:'金钟道',heard:'下一站：金___'},
    {name:'修顿球场',heard:'下一站：修___球场'},
    {name:'湾仔街市',heard:'下一站：湾___市',target:true},
    {name:'天乐里',heard:'下一站：天___里'}
  ];
  const STOP_DISTANCE=160;
  const LISTEN_SPEED=16;
  const WALK_SPEED=8;
  const board=document.getElementById('stationBoard');
  const flash=document.getElementById('bellFlash');
  const progressEl=document.getElementById('tramProgress');
  const balanceBar=document.getElementById('tramBalanceBar');
  const feed=document.getElementById('tramFeed');
  const choices=document.getElementById('tramChoices');
  const bellBtn=document.getElementById('bellBtn');
  const replayBtn=document.getElementById('tramReplayBtn');
  const holdBtn=document.getElementById('tramHoldBtn');
  const moveBtn=document.getElementById('tramMoveBtn');
  const grandma=document.getElementById('tramGrandma');
  let stopIndex=0,distance=STOP_DISTANCE,position=0,balance=100,prepared=false,identified=false,holding=false,blocked=0,done=false,raf=null,last=0,ac=null,lastMsg='';

  bellBtn.addEventListener('click',ring);
  replayBtn.addEventListener('click',replay);
  moveBtn.addEventListener('click',move);
  holdBtn.addEventListener('click',()=>setHolding(!holding));
  choices.addEventListener('click',e=>{
    const b=e.target.closest('[data-choice]');
    if(!b||done)return;
    choose(b.dataset.choice);
  });

  function ding(){
    flash.classList.add('on');
    setTimeout(()=>flash.classList.remove('on'),220);
    if(!ac){
      try{ac=new (window.AudioContext||window.webkitAudioContext)();}
      catch{return;}
    }
    const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
    o.type='triangle';o.frequency.value=988;
    g.gain.setValueAtTime(.1,t);
    g.gain.exponentialRampToValueAtTime(.001,t+.18);
    o.connect(g).connect(ac.destination);
    o.start(t);o.stop(t+.2);
  }
  function say(k,text){
    if(lastMsg===k)return;
    lastMsg=k;feed.textContent=text;
  }
  function setHolding(v){
    if(done&&v)return;
    holding=v;
    holdBtn.classList.toggle('holding',v);
  }
  function options(){
    const pool=['湾仔街市','湾仔消防局','修顿球场'];
    choices.innerHTML=pool.map(o=>'<button data-choice="'+o+'">'+o+'</button>').join('');
  }
  function current(){return STOPS[Math.min(stopIndex,STOPS.length-1)];}
  function render(){
    const s=current();
    board.textContent=s.heard;
    progressEl.style.width=Math.max(0,Math.min(100,(STOP_DISTANCE-distance)/STOP_DISTANCE*100))+'%';
    balanceBar.style.width=Math.max(0,balance)+'%';
    grandma.style.left=(50+position*.38)+'%';
    bellBtn.disabled=done||!identified||prepared;
    replayBtn.disabled=done||prepared;
    moveBtn.disabled=done||!prepared;
    holdBtn.disabled=done||!prepared;
    holdBtn.textContent=holding?'✋ 已扶住':'✋ 扶住';
    choices.style.display=prepared?'none':'grid';
  }
  function choose(name){
    const s=current();
    if(name===s.name&&s.target){
      identified=true;
      feed.textContent='你听出来了：下一站是湾仔街市。现在要按钟，再慢慢行到门口。';
    }else if(s.target){
      balance=Math.max(0,balance-8);
      feed.textContent='站名听错了。再听一次会少一点时间。';
    }else if(name==='湾仔街市'){
      balance=Math.max(0,balance-10);
      feed.textContent='还未到湾仔街市，太早准备会站得更久。';
    }else{
      feed.textContent='不是目标站，继续坐。';
    }
    render();
  }
  function replay(){
    if(done||prepared)return;
    distance=Math.max(0,distance-22);
    feed.textContent='你请自己再听一次，但车还在向前行。';
    render();
  }
  function ring(){
    if(done||!identified||prepared)return;
    ding();prepared=true;
    const ringDistance=distance;
    if(ringDistance>95)balance=Math.max(0,balance-8);
    if(ringDistance<35)balance=Math.max(0,balance-15);
    distance=Math.max(distance,110);
    feed.textContent=ringDistance>=55&&ringDistance<=90?'叮——时间刚好。扶住栏杆，慢慢到车门。':'叮——有点早/迟，但还来得及，扶住栏杆慢慢行。';
    render();
  }
  function move(){
    if(done||!prepared)return;
    if(!holding){
      balance=Math.max(0,balance-18);
      feed.textContent='没有扶住就起身，车一晃，身体差点失衡。';
    }else if(blocked>0){
      blocked=0;
      balance=Math.max(0,balance-6);
      position=Math.min(100,position+20);
      feed.textContent='你让了半步，再扶住栏杆向门口挪过去。';
    }else{
      position=Math.min(100,position+30);
      feed.textContent='扶住栏杆，向车门行一步。';
    }
    if(current().target&&prepared&&position>=90){success();return;}
    render();
  }
  function nextStop(){
    stopIndex++;
    distance=STOP_DISTANCE;identified=false;prepared=false;position=0;holding=false;lastMsg='';
    holdBtn.classList.remove('holding');
    if(stopIndex>=STOPS.length){fail('miss');return;}
    feed.textContent='广播又响起，但有些字听不清。';
    render();
  }
  function success(){
    done=true;render();
    setTimeout(()=>{
      showResult({gameId:'g13',success:true,
        title:'你落到车了',
        body:'你不是到站才站起来，而是在听到站名前就开始准备：辨认站名、按钟、扶住栏杆、避开乘客，再慢慢走到车门。',
        voice:'“我早啲企出去，不是心急，是怕行唔切。”',
        data:'<b>本地化体验</b> · 很多长者不是故意早早站在车门口。他们只是在替自己争取那几十秒，避免车到站时来不及移动。'});
    },600);
  }
  function fail(kind){
    if(done)return;
    done=true;render();
    const body=kind==='balance'
      ?'车身一晃，你差点跌倒，被旁边乘客扶住。这一站，只能先不下车。'
      : kind==='door'
        ?'你已经按钟，但还未走到门口。车门关上了。'
        :'你没有及时认出湾仔街市，车继续往下一站驶去。';
    setTimeout(()=>{
      showResult({gameId:'g13',success:false,
        title:kind==='balance'?'差点跌倒':kind==='door'?'未行到车门':'坐过站了',
        body:body+'<br><b>提示：听到目标站后先按钟，再扶住栏杆一步一步行到车门。</b>',
        voice:'“我听到好似係湾仔，但一犹豫，车就过了。”',
        data:'<b>体验提示</b> · 听不清站名、车身晃动、要提前移动，是长者搭车时同时面对的几件事。'});
    },500);
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.1);last=ts;
    if(!done){
      distance-=dt*(prepared?WALK_SPEED:LISTEN_SPEED);
      if(prepared&&!holding)balance=Math.max(0,balance-dt*5);
      if(blocked>0)blocked-=dt;
      if(Math.random()<dt*.08&&prepared){
        blocked=1.1;
        feed.textContent='有乘客经过，先让一让。';
      }
      if(Math.random()<dt*.06&&prepared&&!holding){
        balance=Math.max(0,balance-20);
        feed.textContent='车突然一顿，幸好旁边有人扶了一下。';
      }
      if(balance<=0)fail('balance');
      else if(distance<=0){
        if(current().target&&prepared&&position>=90)success();
        else if(current().target&&prepared)fail('door');
        else if(current().target)fail('miss');
        else nextStop();
      }else if(!prepared){
        if(current().target)say('target','听起来像“湾___市”。如果是目标站，就要准备。');
        else say('listen','下一站不是目标站，听清楚再决定。');
      }
      render();
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      stopIndex=0;distance=STOP_DISTANCE;position=0;balance=100;prepared=false;identified=false;holding=false;blocked=0;done=false;last=0;lastMsg='';
      options();feed.textContent='你坐在下层靠窗位置。今日要去湾仔街市。';bellBtn.classList.remove('pressed');
      render();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){
      cancelAnimationFrame(raf);raf=null;last=0;setHolding(false);
      if(ac){try{ac.close();}catch{}ac=null;}
    }
  };
})();

/* ================= 关卡：港铁扶梯平衡（三阶段） ================= */
const g14=(function(){
  const stage=document.getElementById('mtrEscStage');
  const rider=document.getElementById('elderRider');
  const cue=document.getElementById('escStepCue');
  const phaseLabel=document.getElementById('escPhaseLabel');
  const balanceBall=document.getElementById('escBalanceBall');
  const stabilityBar=document.getElementById('escStabilityBar');
  const stabilityN=document.getElementById('escStabilityN');
  const pressureN=document.getElementById('escPressureN');
  const exitBar=document.getElementById('mtrExitBar');
  const msg=document.getElementById('mtrMsg');
  const leftBtn=document.getElementById('escLeftBtn');
  const rightBtn=document.getElementById('escRightBtn');
  const stepBtn=document.getElementById('escStepBtn');
  let phase='mount',progress=0,balance=0,stability=100,pressure=0,input=0,done=false;
  let raf=null,last=0,t0=0,phaseT=0,events=0,stepMiss=0,lastEvent=0,exitPressed=false;

  bindHold(leftBtn,()=>{input=-1;},()=>{if(input<0)input=0;});
  bindHold(rightBtn,()=>{input=1;},()=>{if(input>0)input=0;});
  stepBtn.addEventListener('click',step);

  function setPhase(next,text){
    phase=next;phaseT=0;msg.textContent=text;
    if(next==='mount')phaseLabel.textContent='阶段 A · 踏上扶梯';
    if(next==='ride')phaseLabel.textContent='阶段 B · 保持平衡';
    if(next==='exit')phaseLabel.textContent='阶段 C · 踏出扶梯';
  }
  function damage(n,text){
    stability=Math.max(0,stability-n);
    if(text)msg.textContent=text;
    stage.classList.add('shake');
    setTimeout(()=>stage.classList.remove('shake'),340);
    if(stability<=0)fail('balance');
  }
  function addPressure(n){
    pressure=Math.min(100,pressure+n);
  }
  function step(){
    if(done)return;
    if(phase==='mount'){
      const pos=(phaseT*1.15)%1;
      const d=Math.abs(pos-.5);
      if(d<.11){
        setPhase('ride','踏上去了。现在保持平衡，不要让光球滑出安全区。');
      }else if(d<.22){
        stepMiss++;damage(pos<.5?10:15,pos<.5?'稍早了一点，脚步不稳。':'慢了半拍，被级边带了一下。');
        setPhase('ride','已经踏上扶梯。先稳住身体。');
      }else{
        stepMiss++;addPressure(15);damage(30,'脚步乱了，只能扶住旁边栏杆。');
        setPhase('ride','扶稳，后面人流已经贴近。');
      }
    }else if(phase==='exit'){
      const remain=3-phaseT;
      exitPressed=true;
      if(remain>=.2&&remain<=.8)win('完美踏出');
      else if(remain>-0.25&&remain<1.2){damage(5,'成功踏出，但脚尖拖了一下。');win('踏出去了');}
      else{damage(25,'踏出时机不对，差点在出口绊倒。');if(stability>0)win('扶住出口栏杆');}
    }
  }
  function render(){
    stabilityBar.style.width=Math.max(0,stability)+'%';
    stabilityN.textContent=Math.round(stability);
    pressureN.textContent=Math.round(pressure);
    exitBar.style.width=Math.max(0,Math.min(100,progress))+'%';
    balanceBall.style.left=(50+balance*.42)+'%';
    rider.style.left=(50+balance*.2)+'%';
    rider.style.top=(phase==='mount'?'76%':phase==='ride'?(76-progress*.42)+'%':'28%');
    if(phase==='mount'){
      cue.style.display='block';
      cue.style.left=(12+((phaseT*1.15)%1)*76)+'%';
    }else{
      cue.style.display='none';
    }
    stepBtn.textContent=phase==='exit'?'🦶 踏出':'🦶 踏步';
  }
  function win(title){
    if(done)return;
    done=true;render();
    const sec=Math.round((performance.now()-t0)/1000);
    setTimeout(()=>{
      showResult({gameId:'g14',success:true,
        title:title+'，用了 '+sec+' 秒',
        body:'这段扶梯只用了几十秒，但你刚才同时做了三件事：看级边、稳住身体、避开身后人流。对年轻人来说，扶梯是代步工具；对长者来说，它是一条不停移动的窄桥。',
        voice:'“唔好急，等我睇准级边先。”',
        data:'<b>扶梯安全指数</b> · 踏步失误 '+stepMiss+' 次，失衡事件 '+events+' 次，最高压力 '+Math.round(pressure)+'%。'});
    },650);
  }
  function fail(kind){
    if(done)return;
    done=true;render();
    setTimeout(()=>{
      showResult({gameId:'g14',success:false,
        title:kind==='exit'?'差点绊在出口':'扶梯上失去平衡',
        body:'你没有真正跌倒，但身体已经吓到僵住。后面的人只是绕过你继续走，你站在一旁扶着栏杆，等心跳慢下来。',
        voice:'“我知道要行，但脚一踏错，成个人就慌。”',
        data:'<b>体验提示</b> · 踏上、站稳、踏出，是长者搭扶梯时连续发生的三个难点。'});
    },520);
  }
  function event(t){
    if(t-lastEvent<2.2)return;
    lastEvent=t;events++;
    const r=Math.random();
    if(r<.34){balance+=24;addPressure(20);msg.textContent='后面有人快步靠近：“唔该借借。”';}
    else if(r<.67){balance+=(Math.random()<.5?-1:1)*28;msg.textContent='旁边乘客碰到手臂，身体偏了一下。';}
    else{balance+=18;msg.textContent='扶手速度错觉，身体慢慢向一侧漂。';}
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.1);last=ts;phaseT+=dt;
    if(!done){
      if(phase==='mount'){
        msg.textContent=phaseT<.4?'睇准级边，慢慢踏上去。':msg.textContent;
      }else if(phase==='ride'){
        progress+=dt*13;
        balance+=Math.sin(ts/520)*dt*35+(Math.random()-.5)*dt*16-input*dt*68;
        balance=Math.max(-100,Math.min(100,balance));
        pressure=Math.min(100,Math.max(0,pressure+dt*1.4));
        if(Math.random()<dt*.22)event(ts/1000);
        if(Math.abs(balance)>70)stability=Math.max(0,stability-dt*18);
        if(Math.abs(balance)>90)stability=Math.max(0,stability-dt*38);
        if(stability<=0)fail('balance');
        if(progress>=78)setPhase('exit','出口到了。不要等到“踏出”才按，要提前一点。');
      }else if(phase==='exit'){
        progress=Math.min(100,82+phaseT*6);
        const remain=3-phaseT;
        msg.textContent=remain>2?'3':remain>1?'2':remain>0?'1':'踏出！';
        if(remain<-0.35&&!exitPressed)fail('exit');
      }
      render();
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      progress=0;balance=0;stability=100;pressure=0;input=0;done=false;last=0;events=0;stepMiss=0;lastEvent=0;exitPressed=false;t0=performance.now();
      setPhase('mount','睇准级边，慢慢踏上去。');
      render();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;input=0;}
  };
})();

/* ================= 关卡注册表 ================= */
const GAMES={g1,g2,g3,g4,g5,g6,g7,g8,g9,g10,g11,g12,g13,g14};

window.show=show;
window.openGame=openGame;
window.goHome=goHome;
window.restartAll=restartAll;
