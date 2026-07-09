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
      }catch(err){this.textContent='当前设备不支持音频';}
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
    }catch(e){}
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

/* ================= 关卡：自助挂号机 ================= */
const g6=(function(){
  const TOTAL=30;
  const kiosk=document.getElementById('kiosk');
  const scr=document.getElementById('kioskScreen');
  const bar=document.getElementById('kioskTimeBar');
  let t=TOTAL,step=0,raf=null,last=0,done=false,busy=false,timeouts=0;

  bindHold(document.getElementById('shadeBtn'),
    ()=>kiosk.classList.add('shaded'),
    ()=>kiosk.classList.remove('shaded'));

  function touch(){/* 每次有效操作重置读秒 */ t=TOTAL;}
  function render(){
    busy=false;
    if(step===0){
      scr.innerHTML='<h4>自助挂号 · 欢迎使用</h4><p>请将社会保障卡插入卡槽（芯片朝上）</p><div class="kgrid"><button class="kbtn" data-a="card">💳 插入医保卡</button><button class="kbtn" data-a="none">📱 电子凭证（维护中）</button></div><p class="khint">如需帮助请联系大厅工作人员</p>';
    }else if(step===1){
      scr.innerHTML='<h4>请选择科室</h4><div class="kgrid"><button class="kbtn" data-a="no">普通内科</button><button class="kbtn" data-a="no">骨科</button><button class="kbtn" data-a="ok">心血管内科</button><button class="kbtn" data-a="no">眼科</button><button class="kbtn" data-a="no">皮肤科</button><button class="kbtn" data-a="no">外科</button></div><p class="khint" id="kmsg"></p>';
    }else if(step===2){
      scr.innerHTML='<h4>心血管内科 · 请选择医生</h4><div class="kgrid"><button class="kbtn" disabled>刘医生（号满）</button><button class="kbtn" data-a="ok">陈医生（余 3）</button><button class="kbtn" disabled>周医生（号满）</button><button class="kbtn" data-a="no">返回上级</button></div>';
    }else if(step===3){
      scr.innerHTML='<h4>陈医生 · 请选择时段</h4><div class="kgrid"><button class="kbtn" disabled>上午（已过时段）</button><button class="kbtn" data-a="ok">下午 14:30</button><button class="kbtn" data-a="ok">下午 16:00</button><button class="kbtn" data-a="no">返回上级</button></div>';
    }else if(step===4){
      scr.innerHTML='<h4>确认挂号信息</h4><p>心血管内科 · 陈医生 · 今日下午<br>诊查费：10.00 元</p><p style="color:#C0632F;">💡 推荐开通电子医保凭证，扫码关注公众号即可注册！</p><div class="kgrid"><button class="kbtn" data-a="scan">扫码关注并注册</button><button class="kbtn" data-a="ok">直接用实体卡缴费</button></div>';
    }
  }
  scr.addEventListener('click',e=>{
    const b=e.target.closest('.kbtn');
    if(!b||done||busy)return;
    const a=b.dataset.a;
    touch();
    if(a==='card'&&step===0){step=1;render();}
    else if(a==='ok'){
      if(step===4){finish();}
      else{step++;render();}
    }
    else if(a==='no'){
      const m=document.getElementById('kmsg');
      if(m)m.textContent='该科室今日无复查号，请重新选择。';
      if(step>1){step=1;render();}
    }
    else if(a==='none'){
      scr.querySelector('.khint').textContent='电子凭证功能维护中，请使用实体卡。';
    }
    else if(a==='scan'){
      busy=true;
      scr.innerHTML='<h4>正在跳转…</h4><p>请使用手机扫描屏幕二维码<br>▨▨▨<br>等待关注确认…</p>';
      setTimeout(()=>{
        scr.innerHTML='<h4>⚠ 注册失败</h4><p>验证码已超时，请返回重试。</p>';
        setTimeout(()=>{step=4;render();},1600);
      },3200);
    }
  });
  function finish(){
    done=true;
    scr.innerHTML='<h4>✅ 挂号成功</h4><p>请取走凭条，前往三楼候诊。</p>';
    setTimeout(()=>{
      showResult({gameId:'g6',success:true,
        title:'挂上号了',
        body: timeouts===0
          ? '你在 30 秒的倒计时里一次通关。可你有没有想过——刚才每一步，你都在赶时间，而机器后面还排着队。'
          : '机器把你踢出来了 '+timeouts+' 次，每次都要从插卡重新开始。队伍里的叹气声，你听见了吗？',
        voice:'“闺女，这机器……能不能别催我啊。”',
        data:'<b>真实数据</b> · 多数自助终端的无操作超时设定在 30–60 秒，是按年轻人的阅读与决策速度设计的。适老化改造清单里，“延长超时、放大字体、保留人工窗口”排在最前面。'});
    },1200);
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.1);last=ts;
    if(!done){
      t-=dt;
      bar.style.width=Math.max(0,t/TOTAL*100)+'%';
      if(t<=0){
        timeouts++;t=TOTAL;step=0;busy=false;
        scr.innerHTML='<h4>⏱ 长时间未操作</h4><p>系统已自动退出，请重新开始。</p>';
        setTimeout(()=>{if(!done)render();},1400);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      t=TOTAL;step=0;done=false;busy=false;timeouts=0;last=0;
      kiosk.classList.remove('shaded');
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
  let ring=40,raf=null,last=0,done=false,miss=0,popLeft=0;

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
    popLeft=1;
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
    p.remove();popLeft=0;
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

/* ================= 关卡：广场舞节奏（反应延迟音游） ================= */
const g13=(function(){
  const BEAT=60/90;          // 90 BPM
  const LAG=0.35;            // 神经反应延迟
  const WIN=0.2;             // 判定窗口 ±0.2s
  const COUNT_IN=4, TOTAL=16;
  const dancers=document.getElementById('dancers');
  const pulse=document.getElementById('beatPulse');
  const word=document.getElementById('beatWord');
  const feed=document.getElementById('danceFeed');
  const hand=document.getElementById('handLag');
  const hitEl=document.getElementById('hitN');
  const btn=document.getElementById('tapBeatBtn');
  let ac=null,startT=0,raf=null,done=false,running=false;
  let judged=[],pending=[],hits=0,lastBeatShown=-1;

  btn.addEventListener('click',()=>{
    if(!running){begin();return;}
    if(done)return;
    // 意识按下了，身体 0.35 秒后才动
    pending.push(ac.currentTime+LAG);
    setTimeout(()=>{
      hand.style.opacity='1';
      setTimeout(()=>hand.style.opacity='0',140);
    },LAG*1000);
  });

  function clickAt(t,hi){
    const o=ac.createOscillator(),g=ac.createGain();
    o.type='sine';o.frequency.value=hi?1200:760;
    g.gain.setValueAtTime(.11,t);
    g.gain.exponentialRampToValueAtTime(.001,t+.09);
    o.connect(g).connect(ac.destination);
    o.start(t);o.stop(t+.1);
  }
  function begin(){
    try{ac=new (window.AudioContext||window.webkitAudioContext)();}
    catch(e){feed.textContent='此设备不支持音频，凭光圈跟拍也可以！';}
    running=true;done=false;hits=0;judged=new Array(TOTAL).fill(null);pending=[];lastBeatShown=-1;
    hitEl.textContent='0';feed.textContent='';
    btn.textContent='👏 拍！';
    startT=(ac?ac.currentTime:performance.now()/1000)+1;
    if(ac){for(let i=0;i<COUNT_IN+TOTAL;i++)clickAt(startT+i*BEAT,i%4===0);}
    cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
  }
  function now(){return ac?ac.currentTime:performance.now()/1000;}
  function loop(){
    const t=now();
    const beatF=(t-startT)/BEAT;
    const bi=Math.floor(beatF);
    // 视觉：光圈每拍收拢
    if(bi>=0){
      const phase=beatF-bi;                       // 0→1
      pulse.style.transform='scale('+(1.7-phase*.7)+')';
      pulse.style.opacity=(phase*.9).toFixed(2);
      if(bi!==lastBeatShown){
        lastBeatShown=bi;
        dancers.classList.add('bop');
        setTimeout(()=>dancers.classList.remove('bop'),110);
        if(bi<COUNT_IN)word.textContent=['预备','3','2','1'][bi];
        else if(bi<COUNT_IN+TOTAL)word.textContent=(bi-COUNT_IN+1);
        else word.textContent='🎉';
      }
    }
    // 判定：处理已“落地”的延迟拍
    if(!done){
      pending=pending.filter(eff=>{
        if(eff>t)return true;
        const k=Math.round((eff-startT)/BEAT)-COUNT_IN;
        if(k>=0&&k<TOTAL&&judged[k]===null&&Math.abs(eff-(startT+(COUNT_IN+k)*BEAT))<=WIN){
          judged[k]='hit';hits++;hitEl.textContent=hits;
          feed.textContent='✅ 踩上了！';
        }else{
          feed.textContent='💨 慢了半拍……';
        }
        return false;
      });
      // 结束判定
      if(t>startT+(COUNT_IN+TOTAL)*BEAT+WIN+LAG){
        done=true;running=false;btn.textContent='🎵 开始跟跳';
        const ok=hits>=10;
        setTimeout(()=>{
          if(ok){
            showResult({gameId:'g13',success:true,
              title:'跟上了！踩中 '+hits+' / 16 拍',
              body:'发现秘诀了吗？——想踩上点，就得<b>在心里提前 0.35 秒出手</b>。老人跳舞看着慢半拍，其实是大脑一直在悄悄做“提前量”。',
              voice:'“姐妹们等等我……不是我不想快，是这身子，收到信儿晚。”',
              data:'<b>真实数据</b> · 人的简单反应时从约 20 岁起逐年变慢，70 岁人群平均比年轻人慢 25%–40%。这不是“迟钝”，是神经传导速度的自然衰减——却常被误读成“笨”。'});
          }else{
            showResult({gameId:'g13',success:false,
              title:'只踩中 '+hits+' / 16 拍',
              body:'每次你都是听到拍子才出手——可你的身体比意识慢 0.35 秒，落下去时，拍子已经走了。<br><b>试试提前一点点按下去</b>，像她们一样，用预判弥补迟缓。',
              voice:'“又乱了……我明明是跟着点子拍的呀。”',
              data:'<b>真实数据</b> · 反应延迟叠加肌肉启动变慢，是老人躲避碰撞、急刹、接扶失败的核心原因——也是“扶不住摔倒的自己”背后的生理学。'});
          }
        },400);
      }
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      running=false;done=false;pending=[];
      word.textContent='—';feed.textContent='';hitEl.textContent='0';
      btn.textContent='🎵 开始跟跳';
      pulse.style.opacity='0';
      cancelAnimationFrame(raf);
    },
    stop(){
      cancelAnimationFrame(raf);raf=null;running=false;
      if(ac){try{ac.close();}catch(e){}ac=null;}
    }
  };
})();

/* ================= 关卡：爬五楼（交替输入+心率管理） ================= */
const g14=(function(){
  const STEPS=12;
  const LINES={2:'二楼，李老师家飘出饭菜香。',3:'三楼，电视的声音隔着门传出来。',4:'四楼了。扶着栏杆，歇口气也不丢人。'};
  const floorEl=document.getElementById('floorN');
  const stepBar=document.getElementById('stepBar');
  const heartBar=document.getElementById('heartBar');
  const heartN=document.getElementById('heartN');
  const heartIcon=document.getElementById('heartIcon');
  const msg=document.getElementById('stairMsg');
  const stage=document.getElementById('stairStage');
  const bL=document.getElementById('footL'),bR=document.getElementById('footR');
  let floor=1,step=0,bpm=70,lastFoot=null,done=false,resting=false,knee=false;
  let raf=null,last=0,t0=0,rests=0;

  function setBtns(){
    const dis=done||resting||knee;
    bL.disabled=dis;bR.disabled=dis;
  }
  function tap(f){
    if(done||resting||knee)return;
    if(f===lastFoot){
      msg.textContent='⚠ 同一只脚连迈两次，趔趄了一下！';
      step=Math.max(0,step-1);
      stage.classList.add('shake');
      setTimeout(()=>stage.classList.remove('shake'),400);
    }else{
      lastFoot=f;
      step++;bpm+=7;
      if(Math.random()<0.06){
        knee=true;setBtns();
        msg.textContent='😖 膝盖突然一软！赶紧扶住栏杆……';
        setTimeout(()=>{knee=false;setBtns();msg.textContent='缓过来了，慢慢走。';},1800);
      }
      if(step>=STEPS){
        floor++;step=0;lastFoot=null;
        if(floor>=5){win();}
        else msg.textContent=LINES[floor]||'';
      }
    }
    render();
  }
  bL.addEventListener('click',()=>tap('L'));
  bR.addEventListener('click',()=>tap('R'));

  function render(){
    floorEl.textContent=floor;
    stepBar.style.width=(step/STEPS*100)+'%';
  }
  function win(){
    done=true;setBtns();
    const sec=Math.round((performance.now()-t0)/1000);
    msg.textContent='🏠 到家了。';
    setTimeout(()=>{
      showResult({gameId:'g14',success:true,
        title:'五楼，'+sec+' 秒'+(rests?'，喘了 '+rests+' 次':''),
        body:'四十八级台阶。你必须管着自己的心跳，让着自己的膝盖，还要防着自己的脚绊自己。年轻人一分钟跑完的楼梯，是她每天出门要过两遍的关。',
        voice:'“不买那么多菜了……拎不动，也是因为，还得留力气爬楼。”',
        data:'<b>真实数据</b> · 我国 2000 年前建成的多层住宅大多没有电梯，数千万老人住在其中。“悬空老人”一词由此而来——不是不想下楼，是下了楼，就怕上不来。老旧小区加装电梯，正是为了他们。'});
    },700);
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.1);last=ts;
    if(!done){
      bpm=Math.max(70,bpm-11*dt);
      if(!resting&&bpm>142){
        resting=true;rests++;setBtns();
        msg.textContent='🫀 心口怦怦跳得厉害，必须停下来喘口气……';
      }
      if(resting&&bpm<105){
        resting=false;setBtns();
        msg.textContent='呼——缓过来了，继续。';
      }
      heartBar.style.width=Math.min(100,(bpm-60)/100*100)+'%';
      heartN.textContent=Math.round(bpm);
      heartIcon.classList.toggle('race',bpm>125);
    }
    raf=requestAnimationFrame(loop);
  }
  return {
    start(){
      floor=1;step=0;bpm=70;lastFoot=null;done=false;resting=false;knee=false;rests=0;last=0;
      t0=performance.now();
      msg.textContent='深吸一口气，出发。';
      render();setBtns();
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
    },
    stop(){cancelAnimationFrame(raf);raf=null;last=0;}
  };
})();

/* ================= 关卡注册表 ================= */
const GAMES={g1,g2,g3,g4,g5,g6,g7,g8,g9,g10,g11,g12,g13,g14};
