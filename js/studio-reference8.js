/* Frozen V8 reference, loaded only for same-duration 8 / 12 pose comparison.
 * Each original renderer runs against a private window object; the live kits
 * and live gait are never replaced. Original sprite credits remain below. */
(function () {
  var referenceWindow = {};

/* gait / SHA256 dff1c268d921e4f136ea152dffb548281d314cc4f7ab2dd73c067a5f04350ce0 */
(function (window, document, StudioGait) {
/* Shared eight-pose locomotion, expressed on the studio's native 48 x 64 grid.
 * The shoe anchor is its ankle; render the sole four pixels below that point.
 * All limbs keep their segment lengths. Contact and recovery are separate
 * phases: a planted foot travels backwards on one ground plane, while its
 * partner bends at the knee to clear that plane before the next contact. */
(function () {
  'use strict';

  var states = {
    walk: { count: 8, frameMs: 100, stridePixels: 20 },
    run: { count: 8, frameMs: 70, stridePixels: 36 }
  };
  var phaseNames = ['contact', 'down', 'passing', 'up', 'contact', 'down', 'passing', 'up'];
  var walk = {
    x: [5, 2.5, 0, -2.5, -5, -3, 0, 3],
    y: [59, 59, 59, 59, 58, 55, 54, 57],
    body: [0, 1, 0, -1, 0, 1, 0, -1],
    arm: [-4, -2, 0, 3, 4, 2, 0, -3],
    hair: [0, 0, 1, 1, 0, 0, -1, -1],
    planted: [true, true, true, true, false, false, false, false],
    roll: ['heel', 'flat', 'flat', 'toe', 'air', 'air', 'air', 'air'],
    tilt: [-1, 0, 0, 1, 1, 0, -1, -1],
    nearLength: 6.25,
    farLength: 5.8
  };
  var run = {
    // Contact, compression, toe-off, flight; the other leg takes over at +4.
    // Recovery ankle rises behind the knee, then swings under the body.
    x: [9, 4, -1, -6, -9, -6, 0, 6],
    y: [59, 59, 56, 52, 50, 50, 52, 55],
    body: [0, 1, 0, -2, 0, 1, 0, -2],
    arm: [-6, -3, 0, 4, 6, 3, 0, -4],
    hair: [1, 1, 0, -1, -1, 0, 1, 1],
    planted: [true, true, false, false, false, false, false, false],
    roll: ['flat', 'toe', 'air', 'air', 'air', 'air', 'air', 'air'],
    tilt: [0, 1, 1, 1, 1, 0, -1, -1],
    nearLength: 7.5,
    farLength: 6.8
  };

  function point(x, y) { return { x: x, y: y }; }
  function knee(hip, ankle, length) {
    var dx = ankle.x - hip.x, dy = ankle.y - hip.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    // The hand-authored anchors are reachable. Guard the solver as well so
    // malformed caller input can never feed NaN into the pixel-art renderer.
    var safe = Math.max(0.001, Math.min(length * 2 - 0.001, distance));
    var along = safe / 2;
    var bend = Math.sqrt(Math.max(0, length * length - along * along));
    var ux = distance ? dx / distance : 0, uy = distance ? dy / distance : 1;
    // Bend toward the direction of travel, rather than letting a joint flip
    // across the hip/ankle line when the foot passes under the pelvis.
    return point(hip.x + ux * along + uy * bend, hip.y + uy * along - ux * bend);
  }

  function leg(data, phase, bodyY, far) {
    var hip = point(far ? 21 : 26, (far ? 47 : 48) + bodyY);
    var ankle = point(hip.x + data.x[phase], data.y[phase] - (far ? 2 : 0));
    return {
      hip: hip,
      knee: knee(hip, ankle, far ? data.farLength : data.nearLength),
      ankle: ankle,
      planted: data.planted[phase],
      roll: data.roll[phase],
      footTilt: data.tilt[phase]
    };
  }

  function neutral() {
    return {
      phase: 0, phaseName: 'neutral', bodyY: 0, lean: 0, armSwing: 0,
      hairLag: 0, stridePixels: 0, flight: false,
      near: { hip: point(26, 48), knee: point(26, 53), ankle: point(26, 59), planted: true, roll: 'flat', footTilt: 0 },
      far: { hip: point(21, 47), knee: point(21, 52), ankle: point(21, 57), planted: true, roll: 'flat', footTilt: 0 }
    };
  }

  function sample(state, index) {
    if (state !== 'walk' && state !== 'run') return neutral();
    var n = Number(index);
    if (!Number.isFinite(n)) n = 0;
    var phase = ((Math.floor(n) % 8) + 8) % 8;
    var data = state === 'run' ? run : walk;
    var bodyY = data.body[phase];
    var near = leg(data, phase, bodyY, false);
    var far = leg(data, (phase + 4) % 8, bodyY, true);
    return {
      phase: phase,
      phaseName: phaseNames[phase],
      bodyY: bodyY,
      lean: state === 'run' ? 2 : 0,
      armSwing: data.arm[phase],
      hairLag: data.hair[phase],
      near: near,
      far: far,
      stridePixels: states[state].stridePixels,
      flight: !near.planted && !far.planted
    };
  }

  window.StudioGait = { states: states, sample: sample };
})();

})(referenceWindow, document, referenceWindow.StudioGait);

/* heroes / SHA256 cc77719c4583aefa719631a5a73317dd00462533d02388486901f85a47c119ed */
(function (window, document, StudioGait) {
/* Studio heroes v8: authored signature actions, coherent gaze and separated tails.
 * Gameplay PX sprites are intentionally independent and remain unchanged. */
(function () {
  'use strict';
  var W=48,H=64,INK='#30273c',SKIN='#ffe3d5',SKIN_D='#e8b8b0',SKIN_L='#fff0df';
  var characters=[{id:'C0',name:'C0',color:'#4fe3ff'},{id:'X0',name:'X0',color:'#b48cff'},{id:'Feline1',name:'F1',color:'#ff9fc4'}];
  // One complete beat per eight poses; the gallery and studio share these timings.
  var states={
    idle:{count:8,frameMs:250,phaseLabels:['呼吸','眨眼','转头','吸气','抬手','整理','放手','回正']},
    walk:{count:8,frameMs:100,stridePixels:20,phaseLabels:['右脚着地','承重','交叉','提步','左脚着地','承重','交叉','提步']},
    run:{count:8,frameMs:70,stridePixels:36,phaseLabels:['右脚触地','压低','蹬地','腾空','左脚触地','压低','蹬地','腾空']},
    work:{count:8,frameMs:125,phaseLabels:['抬腕','落指','换手','敲击','抬眼','再敲','收腕','回位']},
    wave:{count:8,frameMs:115,phaseLabels:['抬肘','举手','向外','挥过','向内','再挥','落肘','收手']},
    talk:{count:8,frameMs:140,phaseLabels:['开口','抬手','摊掌','强调','停顿','点头','收掌','回位']},
    read:{count:8,frameMs:180,phaseLabels:['托书','低头','阅读','捏页','翻页','抚平','读完','抬头']},
    coffee:{count:8,frameMs:200,phaseLabels:['握杯','抬杯','靠近','小啜','停留','离口','放低','回位']},
    nap:{count:8,frameMs:250,phaseLabels:['放松','合眼','垂头','入睡','呼气','轻晃','吸气','安睡']},
    sit:{count:8,frameMs:210,phaseLabels:['坐稳','晃脚','抬手','伸展','回望','放手','收脚','回正']},
    carry:{count:8,frameMs:145,phaseLabels:['托稳','抬盘','找平','微倾','扶稳','放低','调整','回位']},
    cheer:{count:8,frameMs:110,phaseLabels:['蓄力','抬臂','举高','欢呼','伸展','挥手','落臂','回稳']}
  };
  var signatureActions={
    C0:[
      {id:'c0_debug',name:'终端调试',description:'展开悬浮终端，逐行检查代码，再按下确认键。',count:8,frameMs:170,phaseLabels:['唤出终端','展开窗口','抬手定位','输入指令','逐行检查','点下确认','收回手腕','合上窗口']},
      {id:'c0_headset',name:'调调耳机',description:'双手托住耳罩，侧头试听，调好后放下双手。',count:8,frameMs:180,phaseLabels:['抬起双手','靠近耳罩','托住两侧','侧头试听','压紧耳垫','转回头部','松开耳罩','放下双手']},
      {id:'c0_overclock',name:'眼镜超频',description:'扶正镜架启动扫描，镜片亮起，环流检查完成。',count:8,frameMs:145,phaseLabels:['抬手扶镜','触到镜框','推正眼镜','启动扫描','亮起镜片','环流检查','松开镜架','恢复待机']}
    ],
    X0:[
      {id:'x0_paint',name:'挥笔作画',description:'抬笔、落笔、挥出一条弧形色带，再轻轻收笔。',count:8,frameMs:150,phaseLabels:['握稳画笔','抬起手腕','落下笔尖','扫出上弧','拖出色带','转腕回锋','轻提笔尖','收笔欣赏']},
      {id:'x0_palette',name:'调色试色',description:'托着木调色盘，蘸取不同颜色，再举笔检查。',count:8,frameMs:190,phaseLabels:['托稳调色盘','选好颜色','向下落笔','蘸取颜料','转动笔尖','提笔检查','点上试色','放回画笔']},
      {id:'x0_sketch',name:'举起速写',description:'在小画板上画猫，检查耳朵，再举起来展示。',count:8,frameMs:210,phaseLabels:['摆好画板','画出轮廓','补上猫耳','点出五官','握住两侧','高举画板','晃晃展示','放低画板']}
    ],
    Feline1:[
      {id:'f1_paws',name:'肉垫贴贴',description:'双爪举到脸旁，展开粉色肉垫，轻轻合爪再挥开。',count:8,frameMs:160,phaseLabels:['抬起双爪','转出肉垫','贴近脸颊','高举双爪','轻轻合爪','展开爪爪','晃晃肉垫','收回双爪']},
      {id:'f1_yarn',name:'拨弄毛线',description:'蹲下追着毛线球，伸爪轻拨，再把线头拉回来。',count:8,frameMs:185,phaseLabels:['蹲下发现','伸爪靠近','碰到线球','向前轻拨','追着线球','拉回线头','松开毛线','坐好看球']},
      {id:'f1_groom',name:'梳理尾巴',description:'回头托住尾巴，顺着绒毛梳过，再把尾巴放回身后。',count:8,frameMs:200,phaseLabels:['回头找尾巴','托起尾尖','举起小梳','梳到尾尖','向下顺毛','轻梳第二遍','放回尾巴','收好小梳']}
    ]
  },signatureOwners=Object.create(null);
  Object.keys(signatureActions).forEach(function(id){signatureActions[id].forEach(function(action){signatureOwners[action.id]=id;states[action.id]=Object.assign({owner:id,unique:true},action);});});
  function uniqueActions(id){return(signatureActions[id]||[]).map(function(action){return Object.assign({},action,{phaseLabels:action.phaseLabels.slice()});});}
  // Small changes in shoulders, head and cloth carry a beat even when a rear-facing
  // prop is correctly hidden by the body. These are eight authored poses, not repeats.
  var poseMotion={
    idle:{bob:[0,0,0,-1,-1,0,1,0],lean:[0,0,-1,-1,0,1,1,0],nod:[0,0,0,-1,0,1,0,0],trail:[0,-1,1,1,0,-1,-1,1]},
    work:{bob:[0,1,0,-1,0,1,0,0],lean:[0,1,1,2,1,0,-1,0],nod:[0,1,1,0,-1,0,1,0],trail:[0,-1,0,1,1,0,-1,1]},
    wave:{bob:[1,0,-1,-1,0,-1,0,1],lean:[0,0,1,1,0,-1,-1,0],nod:[0,-1,0,0,-1,0,1,0],trail:[0,0,-1,-1,0,1,1,0]},
    talk:{bob:[0,0,-1,0,1,0,-1,0],lean:[0,1,1,0,-1,-1,0,0],nod:[0,0,-1,0,1,2,1,0],trail:[0,-1,-1,0,1,1,0,-1]},
    read:{bob:[0,0,1,1,0,-1,0,0],lean:[0,-1,-1,0,1,1,0,0],nod:[0,1,2,1,1,2,1,0],trail:[0,1,1,0,-1,-1,0,0]},
    coffee:{bob:[0,0,-1,-1,0,1,1,0],lean:[0,0,1,1,0,-1,-1,0],nod:[0,0,-1,-1,0,0,1,0],trail:[0,0,-1,-1,0,1,1,-1]},
    nap:{bob:[1,1,2,2,3,2,1,1],lean:[0,0,1,1,0,-1,-1,1],nod:[0,1,2,2,2,1,1,0],trail:[0,0,-1,0,1,1,0,-1]},
    sit:{bob:[0,0,-1,-1,0,1,1,0],lean:[0,-1,-1,0,1,1,0,0],nod:[0,0,-1,-1,0,1,1,0],trail:[0,1,1,0,-1,-1,0,1]},
    carry:{bob:[0,-1,-1,0,1,0,-1,0],lean:[0,0,1,1,0,-1,-1,0],nod:[0,-1,0,1,0,-1,0,0],trail:[0,-1,-1,0,1,1,0,0]},
    cheer:{bob:[1,0,-1,-2,-1,-1,0,1],lean:[0,-1,0,1,1,0,-1,0],nod:[1,0,-1,-1,0,-1,0,0],trail:[0,1,1,0,-1,-1,0,0]}
  };
  var palettes={
    C0:{hair:'#302a3c',hairD:'#1d1b29',hairM:'#484256',hairL:'#696079',cloth:'#353644',clothD:'#242633',clothL:'#535669',accent:'#62d5e5',accentD:'#278fa9',leg:'#52739b',legD:'#344b72',legL:'#83a3c3',shoe:'#e6e6ec',shoeD:'#7b8299',eye:'#555c77'},
    X0:{hair:'#684652',hairD:'#402b3d',hairM:'#855969',hairL:'#b1828c',cloth:'#fff0e9',clothD:'#c7afc3',clothL:'#fffaf0',accent:'#ed7aa7',accentD:'#ad486e',skirt:'#44304e',skirtL:'#765574',leg:'#76556f',legD:'#4c3448',legL:'#ab7b95',shoe:'#40243b',shoeD:'#251b2c',eye:'#9a7bc7'},
    Feline1:{hair:'#fff1f7',hairD:'#c5a1c3',hairM:'#e8c8df',hairL:'#fffdf5',cloth:'#f6c4dd',clothD:'#d790b9',clothL:'#ffe7ef',accent:'#ee6ea2',accentD:'#bc4e82',skirt:'#efb2d2',skirtL:'#ffdfeb',leg:'#fff3f5',legD:'#cbb4d4',legL:'#fffdf4',shoe:'#bd588e',shoeD:'#8c3d73',eye:'#d25892'}
  };
  // Deliberate 24-colour ramps give the sprites readable GBA-like clusters.
  // Native artwork stays crisp; reducing colours removes isolated highlight noise.
  var gbaPalettes={
    C0:['#30273c','#ffe0cc','#dba4a4','#fff0df','#a7607c','#201e2b','#3e3a50','#686078','#242d3d','#35465b','#52667d','#257c96','#55c8db','#a8e5ea','#354d73','#5478a6','#8eacc9','#e6e4e6','#8d94ab','#7b93b3','#b9788c','#d9b27f','#79515e','#e8d8b2'],
    X0:['#30273c','#ffe0cc','#dba4a4','#fff0df','#a7607c','#422a3c','#79515f','#b57b8f','#bea5bd','#f4e1d8','#fff1dd','#35263e','#573b59','#88617b','#ad496f','#e978a1','#f5b2ca','#4c3448','#7f5974','#382436','#9e83c4','#d5b4e7','#d9b27f','#e8d8b2'],
    Feline1:['#30273c','#ffe0cc','#dba4a4','#fff0df','#a7607c','#fff4f6','#e5bed7','#b692bf','#a54b7d','#e46a9c','#f3a7ca','#ba79a2','#e5a6ca','#ffdae9','#854069','#bd5a8e','#c5b2cf','#fff7ed','#dbb57e','#987b5e','#79515e','#e8d8b2','#8a8498','#4c3557']
  },colourCache=Object.create(null);
  function rgb(hex){return[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];}
  function gbaColour(id,colour){
    var key=id+'|'+colour;if(colourCache[key])return colourCache[key];var a=rgb(colour),best=Infinity,match=colour;
    gbaPalettes[id].forEach(function(c){var b=rgb(c),d=(a[0]-b[0])*(a[0]-b[0])*2+(a[1]-b[1])*(a[1]-b[1])*3+(a[2]-b[2])*(a[2]-b[2]);if(d<best){best=d;match=c;}});
    return(colourCache[key]=match);
  }
  function gait(state,phase){return window.StudioGait?StudioGait.sample(state,phase):{bodyY:0,lean:0,armSwing:0,hairLag:0};}
  var cache=Object.create(null),known={C0:1,X0:1,Feline1:1};
  function R(){this.rows=Array.from({length:H},function(){return Array(W).fill(null);});}
  R.prototype.dot=function(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)this.rows[y][x]=c;};
  R.prototype.rect=function(x,y,w,h,c){x=Math.round(x);y=Math.round(y);for(var j=0;j<h;j++)for(var i=0;i<w;i++)this.dot(x+i,y+j,c);};
  R.prototype.line=function(x1,y1,x2,y2,c,size){x1=Math.round(x1);y1=Math.round(y1);x2=Math.round(x2);y2=Math.round(y2);size=size||1;var dx=Math.abs(x2-x1),sx=x1<x2?1:-1,dy=-Math.abs(y2-y1),sy=y1<y2?1:-1,er=dx+dy;for(;;){this.rect(x1,y1,size,size,c);if(x1===x2&&y1===y2)break;var e=2*er;if(e>=dy){er+=dy;x1+=sx;}if(e<=dx){er+=dx;y1+=sy;}}};
  R.prototype.poly=function(points,c){var y0=Math.max(0,Math.floor(Math.min.apply(null,points.map(function(p){return p[1];})))),y1=Math.min(H-1,Math.ceil(Math.max.apply(null,points.map(function(p){return p[1];}))));for(var y=y0;y<=y1;y++)for(var x=0;x<W;x++){var inside=false;for(var i=0,j=points.length-1;i<points.length;j=i++){var a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)this.dot(x,y,c);}};
  R.prototype.canvas=function(flip){
    var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d'),a=this.rows,id=this.owner;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(!a[y][x]&&((x>0&&a[y][x-1])||(x<W-1&&a[y][x+1])||(y>0&&a[y-1][x])||(y<H-1&&a[y+1][x]))){g.fillStyle=INK;g.fillRect(flip?W-1-x:x,y,1,1);}
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(a[yy][xx]){g.fillStyle=gbaColour(id,a[yy][xx]);g.fillRect(flip?W-1-xx:xx,yy,1,1);}return c;
  };
  function hand(r,x,y,id,p){
    if(id==='Feline1'){r.poly([[x-2,y-1],[x+2,y-1],[x+3,y+2],[x+1,y+4],[x-2,y+3]],p.hairL);r.rect(x,y+1,2,2,p.accent);r.dot(x-1,y,p.accentD);r.dot(x+2,y,p.accentD);}
    else{r.poly([[x-1,y-1],[x+2,y-1],[x+3,y+1],[x+2,y+3],[x-1,y+2]],SKIN);r.dot(x+2,y+2,SKIN_D);r.dot(x,y,SKIN_L);}
  }
  function limb(r,sx,sy,ex,ey,hx,hy,id,p,far){r.line(sx,sy,ex,ey,far?p.clothD:p.cloth,4);r.line(sx,sy,ex,ey,far?p.clothD:p.clothL,1);r.line(ex,ey,hx,hy,far?SKIN_D:SKIN,3);r.line(ex,ey,hx,hy,far?p.clothD:p.cloth,2);hand(r,hx,hy,id,p);}
  function shoe(r,x,y,id,p,far,roll){
    var toe=roll==='heel'?-1:0,heel=roll==='toe'?-1:0;
    var base=far?p.shoeD:p.shoe;
    if(id==='C0'){
      r.poly([[x-2,y+heel],[x+3,y+toe],[x+5,y+2+toe],[x+5,y+4+toe],[x-3,y+4+heel],[x-3,y+2+heel]],base);
      r.line(x-2,y+4+heel,x+4,y+4+toe,p.shoe);r.line(x-1,y+2,x+2,y+2,p.accentD);
    }else{
      r.poly([[x-2,y+heel],[x+2,y+toe],[x+4,y+2+toe],[x+3,y+4+toe],[x-3,y+4+heel],[x-3,y+2+heel]],base);
      r.line(x-2,y+3+heel,x+3,y+3+toe,far?p.shoeD:p.hairL);r.rect(x-1,y,3,1,id==='Feline1'?p.accent:p.hairL);
    }
  }
  function legs(r,id,p,side,back,state,phase,lean){
    var moving=state==='walk'||state==='run',seated=state==='work'||state==='sit';
    if(seated){
      if(side){r.line(21+lean,47,29,51,p.legD,4);r.line(29,51,29,57,p.legD,3);shoe(r,30,57,id,p,true,'flat');r.line(26+lean,48,35,52,p.leg,4);r.line(35,52,34,59,p.leg,3);r.line(35,53,35,58,p.legL);shoe(r,35,59,id,p,false,'flat');}
      else{r.line(20,48,17,52,p.legD,4);r.line(17,52,19,58,p.legD,3);shoe(r,19,58,id,p,true,'flat');r.line(28,48,32,52,p.leg,4);r.line(32,52,30,59,p.leg,3);shoe(r,31,59,id,p,false,'flat');}return;
    }
    if(moving&&window.StudioGait){
      var m=gait(state,phase);
      function one(leg,far){
        function project(q){return side?q:{x:(far?18:29)+(q.x-leg.hip.x)*.24,y:q.y};}
        var hip=project(leg.hip),knee=project(leg.knee),ankle=project(leg.ankle),base=far?p.legD:p.leg;
        r.line(hip.x,hip.y,knee.x,knee.y,base,4);r.line(knee.x,knee.y,ankle.x,ankle.y,base,3);
        if(!far)r.line(knee.x+1,knee.y+1,ankle.x+1,ankle.y-1,p.legL);
        shoe(r,ankle.x,ankle.y,id,p,far,leg.roll);
        if(id==='C0'&&!far)r.line(hip.x+1,hip.y+1,knee.x+1,knee.y,p.legL);
      }
      one(m.far,true);one(m.near,false);return;
    }
    // Quiet poses have a genuinely neutral stance, not a frozen stride.
    r.line(side?21:18,47,side?21:18,57,p.legD,4);shoe(r,side?21:18,57,id,p,true,'flat');
    r.line(side?28:29,48,side?28:29,59,p.leg,4);r.line(side?29:30,51,side?29:30,58,p.legL);shoe(r,side?28:29,59,id,p,false,'flat');
  }
  function tail(r,id,p,phase,bob,side,state){
    if(id!=='Feline1')return;
    var wag=(state==='walk'||state==='run')&&window.StudioGait?gait(state,phase).hairLag:[0,-1,-2,-1,0,1,2,1][phase%8],t=new R();
    // This is the trailing side of a right-facing three-quarter pose. The whole
    // sprite (including this root) mirrors once for left-facing movement.
    t.line(19,46+bob,13,50+bob,p.hairD,5);t.line(13,50+bob,7,48+wag,p.hair,5);t.line(7,48+wag,5,42+wag,p.hair,4);t.line(5,42+wag,8,37+wag,p.hair,4);
    t.line(15,49+bob,8,47+wag,p.hairL,2);t.line(6,45+wag,6,41+wag,p.hairM,1);t.rect(7,36+wag,3,3,p.hairD);t.dot(7,36+wag,p.hairL);
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(t.rows[yy][xx])r.dot(xx,yy,t.rows[yy][xx]);
    r.tailMask=t.rows;
  }
  function tailJoin(r,id,p,side,back,bob,lean,state,phase,nod){
    if(id!=='Feline1'||!r.tailMask)return;
    var cover=new R();legs(cover,id,p,side,back,state,phase,lean);arms(cover,id,p,side,back,bob,lean,state,phase,true);arms(cover,id,p,side,back,bob,lean,state,phase,false);body(cover,id,p,side,back,bob,lean,state,phase);head(cover,id,p,side,back,bob+nod+2,lean,state,phase);
    // The outside contour comes from R.canvas; only internal contacts need this
    // one-pixel seam where white tail touches lace, paws or the lower hair edge.
    // The root remains underneath the skirt instead of being painted on top.
    for(var y=1;y<H-1;y++)for(var x=1;x<W-1;x++)if(r.tailMask[y][x]&&!cover.rows[y][x]&&r.rows[y][x]===r.tailMask[y][x]&&(cover.rows[y][x-1]||cover.rows[y][x+1]||cover.rows[y-1][x]||cover.rows[y+1][x]))r.dot(x,y,INK);
  }
  function longHair(r,id,p,side,bob,trail,lean){
    if(id!=='X0')return;
    r.poly([[15+lean,11+bob],[34+lean,11+bob],[39+lean,22+bob],[36+lean,34+bob],[40-trail,45+bob],[37-trail,52+bob],[31-trail,50+bob],[27-trail,46+bob],[19-trail,51+bob],[12-trail,50+bob],[9-trail,44+bob],[12+lean,29+bob]],p.hair);
    r.poly([[12+lean,22+bob],[17+lean,22+bob],[16,34+bob],[14-trail,45+bob],[16-trail,49+bob],[12-trail,47+bob],[10-trail,41+bob]],p.hairD);
    r.line(16+lean,23+bob,16-trail,40+bob,p.hairM,2);r.line(16-trail,40+bob,19-trail,46+bob,p.hairL);
    r.line(34+lean,25+bob,34-trail,43+bob,p.hairL);r.line(35+lean,27+bob,36-trail,43+bob,p.hairM,2);r.line(36-trail,43+bob,33-trail,48+bob,p.hairL);
    r.dot(13-trail,44+bob,p.hairL);r.dot(37-trail,45+bob,p.hairM);
  }
  function body(r,id,p,side,back,bob,lean,state,phase){
    var top=35+bob,hem=48+bob,seated=state==='work'||state==='sit';if(seated)hem=47+bob;
    r.poly([[18+lean,top],[30+lean,top],[34+lean,top+6],[35,hem],[15,hem],[16+lean,top+5]],p.cloth);
    r.poly([[17+lean,top+3],[21+lean,top+3],[21,hem],[16,hem]],p.clothD);r.line(30+lean,top+3,32,hem-2,p.clothL);r.line(23+lean,top,28+lean,top,p.clothL);
    if(id==='C0'){
      if(back){
        // Dropped hood, shoulder yoke and centre seam belong to the back.
        r.poly([[18+lean,top-1],[21+lean,top+4],[26+lean,top+6],[31+lean,top+1],[30+lean,top-2],[21+lean,top-2]],p.clothD);
        r.line(20+lean,top,23+lean,top+3,p.clothL);r.line(23+lean,top+3,27+lean,top+4,p.accentD);
        r.line(29+lean,top+2,31,hem-3,p.clothL);r.line(25+lean,top+7,25,hem-2,p.clothD);
        r.line(18+lean,top+6,21+lean,top+7,p.clothL);r.line(28+lean,top+7,31+lean,top+6,p.clothD);
      }else{
        r.poly([[18+lean,top],[22+lean,top+4],[29+lean,top+3],[32+lean,top],[30+lean,top-2],[20+lean,top-2]],'#252b3a');
        r.line(20+lean,top-1,24+lean,top+2,p.accentD);r.line(24+lean,top+2,30+lean,top-1,p.accent);
        r.rect(21+lean,top+8,9,4,p.clothD);r.line(21+lean,top+8,29+lean,top+8,p.clothL);r.line(24+lean,top+9,23+lean,top+11,p.accentD);
        r.line(23+lean,top+3,23+lean,top+6,p.accent);r.line(28+lean,top+3,28+lean,top+6,p.accentD);r.dot(24+lean,top+6,'#b2edf3');
      }
      r.line(17,hem-1,33,hem-1,p.accentD);r.dot(31,hem-2,p.accent);
    }else{
      var skirtTop=44+bob,hemLag=state==='run'?[0,0,1,1,0,0,-1,-1][phase%8]:state==='walk'?[0,0,0,1,0,0,0,-1][phase%8]:0,skirtBottom=51+bob+hemLag;
      r.poly([[18,skirtTop],[32,skirtTop],[36,skirtBottom],[13,skirtBottom],[15,47+bob]],p.skirt);
      r.poly([[16,46+bob],[19,45+bob],[18,skirtBottom],[14,skirtBottom]],p.clothD);r.line(22,46+bob,21,skirtBottom-1,p.skirtL);r.line(28,46+bob,30,skirtBottom-1,p.clothD);r.line(32,48+bob,33,skirtBottom-1,p.skirtL);
      if(id==='X0'){
        r.poly([[19+lean,top],[23+lean,top+4],[26+lean,top+2],[29+lean,top],[26+lean,top-1],[22+lean,top-1]],p.clothL);
        r.rect(19,43+bob,13,2,p.skirt);r.line(23,45+bob,23,49+bob,'#9c708e');r.line(14,skirtBottom,35,skirtBottom,p.hairM);
        if(!back){r.poly([[24+lean,top+3],[20+lean,top+2],[20+lean,top+6],[24+lean,top+5],[28+lean,top+7],[29+lean,top+3]],p.accent);r.dot(24+lean,top+4,p.accentD);r.dot(25+lean,top+4,'#ffc2d6');}
      }else{
        r.poly([[18+lean,top],[21+lean,top+3],[28+lean,top+3],[31+lean,top],[28+lean,top-1],[21+lean,top-1]],p.hairL);
        r.line(18,skirtBottom,34,skirtBottom,p.hairL);for(var lx=15;lx<=34;lx+=4){r.rect(lx,skirtBottom,2,2,p.hairL);r.dot(lx+1,skirtBottom-1,p.hairM);}
        if(!back){r.poly([[24+lean,top+3],[20+lean,top+1],[20+lean,top+6],[24+lean,top+5],[29+lean,top+6],[29+lean,top+1]],p.accent);r.rect(24+lean,top+3,2,2,p.accentD);r.rect(24+lean,top+6,3,3,'#eac983');r.dot(25+lean,top+6,'#fff0b5');r.dot(25+lean,top+8,'#a38155');}
      }
      if(back){r.rect(20,top+5,9,3,p.clothD);r.poly([[24,top+6],[17,top+3],[17,top+8],[24,top+7],[31,top+9],[31,top+4]],p.accent);r.rect(23,top+6,3,2,p.accentD);}
    }
  }
  function hairShape(r,id,p,y,hx){
    if(id==='C0')r.poly([[10+hx,y+14],[10+hx,y+6],[13+hx,y+1],[14+hx,y-2],[20+hx,y+1],[24+hx,y-4],[28+hx,y],[34+hx,y-2],[36+hx,y+3],[40+hx,y+4],[39+hx,y+12],[38+hx,y+21],[32+hx,y+24],[16+hx,y+23],[11+hx,y+20]],p.hair);
    else r.poly([[12+hx,y+3],[18+hx,y],[30+hx,y],[36+hx,y+3],[40+hx,y+9],[39+hx,y+20],[35+hx,y+25],[17+hx,y+25],[11+hx,y+21],[9+hx,y+11]],p.hair);
    r.poly([[13+hx,y+7],[17+hx,y+4],[18+hx,y+15],[16+hx,y+23],[12+hx,y+21]],p.hairD);
    r.line(15+hx,y+3,20+hx,y+1,p.hairL);r.line(20+hx,y+1,27+hx,y+1,p.hairL);r.line(14+hx,y+5,14+hx,y+10,p.hairM);r.dot(16+hx,y+3,p.hairL);
  }
  function bow(r,x,y,p,back){
    r.poly([[x,y+3],[x-7,y],[x-7,y+8],[x,y+6],[x+7,y+9],[x+7,y+1]],p.accentD);
    r.poly([[x-1,y+3],[x-6,y+1],[x-6,y+6],[x,y+5]],p.accent);r.poly([[x+1,y+4],[x+6,y+2],[x+6,y+7],[x+1,y+6]],'#f5a2c0');
    r.rect(x-1,y+3,3,3,p.accent);r.dot(x,y+3,'#ffccdb');r.line(x-3,y+8,x-4,y+13,p.accentD);r.line(x+4,y+9,x+5,y+13,p.accent);
  }
  function eye(r,x,y,width,p,blink,happy,lookRight){
    if(blink){r.line(x,y+3,x+width,y+3,INK);r.dot(x+width,y+2,INK);return;}
    if(happy){r.line(x,y+2,x+Math.floor(width/2),y,INK);r.line(x+Math.floor(width/2),y,x+width,y+2,INK);return;}
    var irisWidth=width>=5?3:2,irisX=x+Math.floor((width-irisWidth)/2)+(lookRight?1:0);
    // Both eyes share one gaze. The iris shifts within the sclera; eye sockets
    // do not slide in opposite directions when the running head leans forward.
    r.rect(x,y+1,width,3,'#fffdf4');r.line(x,y,x+width-1,y,INK);r.dot(x+width,y+1,INK);
    r.rect(irisX,y+1,irisWidth,4,p.eye);r.rect(irisX,y+3,irisWidth,2,idEyeLight(p));
    r.line(irisX+Math.floor(irisWidth/2),y+1,irisX+Math.floor(irisWidth/2),y+3,INK);
    r.dot(irisX,y+1,'#fffdf4');r.dot(irisX+irisWidth-1,y+4,p.eye);
  }
  function idEyeLight(p){return p===palettes.Feline1?'#f3a4c7':p===palettes.X0?'#cbb2e7':'#98afc8';}
  function head(r,id,p,side,back,bob,lean,state,phase){
    var y=8+bob,hx=lean,blink=state==='nap'||state==='idle'&&phase===1,happy=state==='wave'||state==='cheer';
    if(id==='Feline1'){
      r.poly([[12+hx,y+4],[10+hx,y-5],[12+hx,y-7],[20+hx,y+2]],p.hair);
      r.poly([[29+hx,y+1],[36+hx,y-7],[38+hx,y-5],[38+hx,y+6]],p.hair);
      r.poly([[13+hx,y],[12+hx,y-4],[17+hx,y+1]],back?p.hairM:p.accent);r.poly([[32+hx,y+1],[36+hx,y-4],[36+hx,y+2]],back?p.hairM:p.accent);
      r.line(12+hx,y-5,13+hx,y-2,p.hairL);r.line(35+hx,y-5,34+hx,y-2,p.hairL);
    }
    hairShape(r,id,p,y,hx);
    if(back){
      r.poly([[17+hx,y+5],[32+hx,y+3],[35+hx,y+12],[34+hx,y+22],[20+hx,y+24],[14+hx,y+18]],p.hair);
      r.line(22+hx,y+4,21+hx,y+16,p.hairL);r.line(31+hx,y+5,32+hx,y+19,p.hairD);r.line(18+hx,y+17,20+hx,y+22,p.hairM);
      if(id==='Feline1'){r.line(16+hx,y+21,34+hx,y+21,p.hairM);r.dot(17+hx,y+20,p.hairL);}
      if(id==='X0')bow(r,28+hx,y+5,p,true);
    }else{
      var far=side?32:18,near=side?22:29;
      if(!side&&state==='idle'&&(phase===2||phase===3)){far--;near--;}
      r.poly([[16+hx,y+12],[22+hx,y+8],[34+hx,y+10],[38+hx,y+15],[36+hx,y+22],[31+hx,y+25],[22+hx,y+25],[17+hx,y+22],[14+hx,y+17]],SKIN);
      r.line(16+hx,y+17,18+hx,y+22,SKIN_D);r.line(18+hx,y+22,23+hx,y+24,SKIN_D);r.line(23+hx,y+24,30+hx,y+24,'#f5c9bf');r.rect(22+hx,y+12,11,4,SKIN_L);
      eye(r,far+hx,y+15,side?3:4,p,blink,happy,side);eye(r,near+hx,y+15,5,p,blink,happy,side);
      r.line(far+hx,y+12,far+hx+2,y+11,p.hairD);r.line(near+hx,y+11,near+hx+3,y+12,p.hairD);
      r.rect(17+hx,y+21,3,1,'#eaa7b1');r.rect(34+hx,y+21,3,1,'#eaa7b1');r.dot(18+hx,y+22,'#f4bcc1');r.dot(35+hx,y+22,'#f4bcc1');
      var mouth=side?2:0;if(side)r.dot(35+hx,y+20,SKIN_D);
      if(id==='Feline1'){r.line(26+hx+mouth,y+22,28+hx+mouth,y+23,'#b95983');r.line(28+hx+mouth,y+23,30+hx+mouth,y+22,'#b95983');}
      else{r.line(27+hx+mouth,y+23,30+hx+mouth,y+23,'#ae697d');if(state==='talk'&&(phase===0||phase===2||phase===3||phase===5))r.rect(28+hx+mouth,y+22,2,2,'#a96278');}
      if(id==='C0'){
        r.poly([[13+hx,y+8],[17+hx,y+3],[23+hx,y+4],[25+hx,y+8],[30+hx,y+3],[35+hx,y+6],[38+hx,y+11],[34+hx,y+14],[31+hx,y+12],[27+hx,y+15],[23+hx,y+12],[19+hx,y+15],[15+hx,y+15]],p.hair);
        r.line(17+hx,y+6,21+hx,y+5,p.hairM);r.line(28+hx,y+6,31+hx,y+5,p.hairL);r.line(14+hx,y+8,14+hx,y+14,p.hairD);
        // Glasses are thin, with separate lens highlights instead of solid blocks.
        r.line(far-1+hx,y+14,far+4+hx,y+14,'#8fa1bd');r.line(far-1+hx,y+14,far-1+hx,y+20,'#8fa1bd');r.line(far-1+hx,y+20,far+4+hx,y+20,'#7b8aa5');r.line(far+4+hx,y+15,far+4+hx,y+19,'#8fa1bd');
        r.line(near-1+hx,y+14,near+5+hx,y+14,'#aab9d0');r.line(near-1+hx,y+14,near-1+hx,y+20,'#8fa1bd');r.line(near-1+hx,y+20,near+5+hx,y+20,'#7b8aa5');r.line(near+5+hx,y+14,near+5+hx,y+20,'#aab9d0');r.line((side?near+5:far+4)+hx,y+16,(side?far-1:near-1)+hx,y+16,'#a1b1cd');r.dot(near+2+hx,y+15,'#e2f4ef');
      }else{
        r.poly([[13+hx,y+12],[15+hx,y+6],[22+hx,y+3],[31+hx,y+4],[37+hx,y+9],[38+hx,y+14],[34+hx,y+14],[30+hx,y+10],[27+hx,y+16],[24+hx,y+11],[21+hx,y+15],[19+hx,y+12],[17+hx,y+19],[13+hx,y+19]],p.hair);
        r.line(16+hx,y+8,20+hx,y+5,p.hairL);r.line(20+hx,y+5,25+hx,y+5,p.hairL);r.line(14+hx,y+12,14+hx,y+18,p.hairM);r.line(33+hx,y+8,35+hx,y+11,p.hairM);r.dot(29+hx,y+7,p.hairL);
        if(id==='X0')bow(r,(side?14:35)+hx,y+3,p,false);
        else{r.line(13+hx,y+20,15+hx,y+24,p.hairD);r.line(36+hx,y+18,34+hx,y+24,p.hairM);r.dot(14+hx,y+21,p.hairL);}
      }
    }
    if(id==='C0'){
      // Headset contour and ear-cup have native one-pixel bevels and a cyan LED.
      r.line(13+hx,y+17,12+hx,y+9,p.clothD,3);r.line(12+hx,y+9,18+hx,y+1,p.clothD,3);r.line(18+hx,y+1,29+hx,y,p.clothD,3);
      r.line(13+hx,y+8,18+hx,y+2,'#6d697e');r.line(18+hx,y+2,28+hx,y+1,'#6d697e');
      r.poly([[11+hx,y+13],[16+hx,y+13],[17+hx,y+17],[16+hx,y+23],[12+hx,y+24],[10+hx,y+20]],'#262936');
      r.rect(12+hx,y+15,3,6,'#535466');r.line(12+hx,y+16,12+hx,y+20,p.accent);r.dot(13+hx,y+21,p.accentD);
      if(!back){r.line(15+hx,y+23,20+hx,y+26,'#59596a');r.line(20+hx,y+26,27+hx,y+25,'#59596a');r.rect(26+hx,y+24,3,2,p.accentD);r.dot(27+hx,y+24,p.accent);}
    }
  }
  function arms(r,id,p,side,back,bob,lean,state,phase,far){
    var y=37+bob,sx=(far?18:31)+lean,moving=state==='walk'||state==='run',running=state==='run',sw=moving?gait(state,phase).armSwing:0;
    var q=phase%8;
    if(far){
      if(moving){var ex=sx-sw*.55,ey=y+4-(running?1:0),hx=sx-sw*(running?.95:.8),hy=y+8-(running?2:0)-Math.abs(sw)*.22;limb(r,sx,y,ex,ey,hx,hy,id,p,true);}
      else if(state==='cheer')limb(r,sx,y,[15,13,10,9,8,10,12,15][q],y-[1,4,7,9,8,7,4,0][q],[15,12,9,7,8,10,12,16][q],[39,32,26,22,20,25,31,40][q],id,p,true);
      else if(state==='wave')limb(r,sx,y,sx-3,y+[4,4,3,3,4,5,5,4][q],sx+[-2,-3,-3,-2,-1,-1,-2,-2][q],y+[8,7,7,8,9,9,8,8][q],id,p,true);
      else if(state==='work')limb(r,sx,y,back?15:[23,24,25,24,23,25,24,22][q],y+[5,6,5,4,5,6,5,4][q],back?19:[29,30,31,32,30,29,31,30][q],y+[5,6,5,4,4,6,6,5][q],id,p,true);
      else if(state==='read')limb(r,sx,y,back?[13,12,13,14,15,14,13,14][q]:19,y+[4,5,6,5,4,5,5,4][q],back?18:23,y+[6,7,7,6,5,6,7,6][q],id,p,true);
      else if(state==='carry')limb(r,sx,y,back?13:22,y+[4,3,2,3,4,4,3,4][q],back?16:30,y+[3,2,1,2,3,4,3,3][q],id,p,true);
      else if(state==='nap')limb(r,sx,y,[18,19,20,20,19,18,17,18][q],y+[5,6,7,7,6,6,5,5][q],back?22:28,y+[5,5,6,7,7,6,5,4][q],id,p,true);
      else limb(r,sx,y,sx+[-3,-3,-4,-3,-2,-2,-1,-2][q],y+[4,5,5,4,3,4,5,4][q],sx+[-2,-3,-4,-3,-2,-1,0,-1][q],y+[8,9,8,7,7,8,9,8][q],id,p,true);
      return;
    }
    if(state==='work'){
      var tap=[-2,0,-1,1,-3,0,1,-1][q],wx=back?34:[37,39,41,40,38,42,40,37][q];
      limb(r,sx,y,back?[36,37,37,36,35,37,38,36][q]:35,y+[3,4,5,4,3,5,4,3][q],wx,y+5+tap,id,p,false);
      var kx=back?20:26;r.line(kx,y+8,kx+17,y+8,'#5b5d77');r.rect(kx+2,y+7,14,1,'#c0c5d3');r.dot(kx+4+[0,2,4,7,9,6,3,1][q],y+7,p.accent);
      if(id==='X0'){r.line(wx,y+4+tap,wx+2,y-4+tap,p.accentD);r.dot(wx+2,y-5+tap,'#e1b87a');}
    }else if(state==='wave'||state==='cheer'){
      var hx=state==='wave'?[34,38,42,40,37,42,39,35][q]:[35,38,41,42,40,43,39,35][q];
      var hy=state==='wave'?[36,28,24,21,23,25,30,38][q]:[39,31,25,21,19,24,30,39][q];
      limb(r,sx,y,[34,36,38,38,37,39,36,34][q],y-[0,3,6,7,6,5,2,-1][q],hx,hy,id,p,false);
      if(id!=='Feline1'){r.line(hx,hy,hx,hy-4,SKIN);r.line(hx+2,hy,hx+2,hy-3,SKIN);}
    }else if(state==='talk'){
      var ty=y+[5,1,-3,-5,-1,0,3,6][q],tx=[36,39,42,41,39,43,40,35][q];limb(r,sx,y,[34,35,37,38,36,38,36,34][q],y+[4,3,2,1,3,3,4,5][q],tx,ty,id,p,false);r.dot(tx+2,ty,SKIN_L);
    }else if(state==='read'){
      // A book is in front of the chest. In rear view its pages are painted
      // first and disappear under the back, rather than becoming a backpack.
      var bx=(back?19:side?28:20)+[0,0,0,1,1,0,-1,-1][q],by=y+(back?-2:2)+[0,1,1,0,-1,-1,0,0][q];
      r.poly([[bx,by],[bx+7,by-1],[bx+14,by+1],[bx+14,by+11],[bx+7,by+9],[bx,by+10]],'#795062');r.rect(bx+1,by+1,5,7,'#e9d7b8');r.rect(bx+8,by+2,5,7,'#f4e3c5');r.line(bx+7,by,bx+7,by+8,'#b18e88');
      for(var j=0;j<3;j++){r.line(bx+2,by+3+j*2,bx+5,by+3+j*2,'#baa69c');r.line(bx+9,by+4+j*2,bx+12,by+4+j*2,'#baa69c');}
      if(q>=3&&q<=5){var pageX=[0,0,0,12,8,4,0,0][q];r.poly([[bx+7,by+1],[bx+pageX,by],[bx+8,by+8]],'#fff3d7');}
      limb(r,sx,y,back?[36,37,38,37,36,35,36,37][q]:35,y+[5,6,6,5,4,5,6,5][q],back?33:bx+12,by+9,id,p,false);
    }else if(state==='coffee'){
      var cy=(back?[-1,-4,-9,-13,-12,-8,-3,0]:[2,-1,-5,-8,-8,-4,0,3])[q]+y,cx=back?27:[38,38,37,36,36,37,39,39][q];
      limb(r,sx,y,[35,36,37,37,36,35,35,34][q],y+[4,3,1,-1,0,2,4,5][q],cx-1,cy+3,id,p,false);
      r.rect(cx,cy,6,6,'#fff2e5');r.line(cx,cy,cx+5,cy,'#8b5e57');r.line(cx+1,cy+1,cx+1,cy+4,'#ddd0d6');r.line(cx+6,cy+1,cx+7,cy+1,'#d4becb');r.line(cx+7,cy+1,cx+7,cy+4,'#d4becb');r.dot(cx+6,cy+4,'#d4becb');
      if(q<3||q>4){r.dot(cx+1+[0,1,0,0,0,-1,0,1][q],cy-3,'#bcaebd');r.dot(cx+3,cy-5-[0,0,1,0,0,0,1,0][q],'#bcaebd');}
    }else if(state==='nap'){
      limb(r,sx,y,[33,33,32,31,30,31,32,33][q],y+[5,6,7,8,8,7,6,5][q],[25,24,23,22,23,24,25,24][q],y+[5,6,7,7,8,7,6,5][q],id,p,false);
    }else if(state==='carry'){
      var lift=[0,-1,-2,-1,0,1,0,-1][q],trayShift=[0,1,1,0,-1,-1,0,0][q];sx+=trayShift;
      limb(r,sx,y,[35,36,37,36,35,34,35,36][q],y+[5,4,3,4,5,6,5,4][q],back?33:39,y+4+lift,id,p,false);
      var trayX=(back?14:29)+trayShift;r.line(trayX,y+3+lift,trayX+16,y+3+lift,'#e3c9ab',2);r.line(trayX+2,y+5+lift,trayX+14,y+5+lift,p.accentD);r.rect(trayX+4,y+lift,4,3,'#bd875e');r.rect(trayX+10,y+lift,4,3,'#deb88a');r.dot(trayX+5,y+lift,'#f1d49d');r.dot(trayX+12,y+1+lift,'#98694c');
    }else if(moving){
      var ex=sx+sw*.55,ey=y+4-(running?1:0),hx=sx+sw*(running?.95:.8),hy=y+8-(running?2:0)-Math.abs(sw)*.22;limb(r,sx,y,ex,ey,hx,hy,id,p,false);
    }else if(state==='sit'){
      limb(r,sx,y,[34,35,36,37,36,35,34,33][q],y+[5,4,2,0,1,3,5,6][q],[32,34,38,40,38,36,33,31][q],y+[8,7,4,1,2,5,8,9][q],id,p,false);
    }else if(state==='idle'&&q>=4&&q<=6){
      var iy=y+[1,-6,-2][q-4],ix=[35,35,37][q-4];limb(r,sx,y,35,y-[0,2,0][q-4],ix,iy,id,p,false);
      if(id==='C0'&&q===5&&!back)r.dot(35,iy-1,p.accent);
      if(id==='X0'&&q===6){r.line(ix,iy,ix+3,iy-7,p.accentD);r.dot(ix+3,iy-8,'#edcb88');}
    }else limb(r,sx,y,sx+[3,3,4,4,3,2,2,3][q],y+[4,5,4,3,3,4,5,4][q],sx+[2,3,4,3,2,1,0,1][q],y+[8,9,8,7,7,8,9,8][q],id,p,false);
  }
  // Signature actions have their own eight-pose joint charts and prop paths.
  // They do not rename or route through a shared life action.
  var signatureMotion={
    c0_debug:{bob:[0,1,0,-1,0,1,0,-1],lean:[0,0,1,1,0,-1,-1,0],nod:[0,1,0,-1,1,0,-1,0],trail:[0,-1,-1,0,1,1,0,-1]},
    c0_headset:{bob:[0,0,1,0,-1,0,1,0],lean:[0,-1,-2,-1,1,2,1,0],nod:[0,0,1,0,-1,0,1,-1],trail:[0,0,-1,-1,0,1,1,-1]},
    c0_overclock:{bob:[0,1,0,-1,0,1,0,-1],lean:[0,0,1,1,0,-1,-1,0],nod:[0,1,0,-1,1,0,-1,0],trail:[0,-1,-1,0,1,1,0,-1]},
    x0_paint:{bob:[0,1,0,-1,0,1,0,-1],lean:[0,0,1,2,1,0,-1,-1],nod:[0,1,0,-1,1,0,-1,0],trail:[0,-1,-1,0,1,1,0,-1]},
    x0_palette:{bob:[0,1,0,-1,0,1,0,-1],lean:[0,0,1,1,0,-1,-1,0],nod:[0,1,0,-1,1,0,-1,0],trail:[0,-1,-1,0,1,1,0,-1]},
    x0_sketch:{bob:[0,1,0,-1,0,-1,-1,0],lean:[0,0,1,1,0,-1,1,-1],nod:[0,1,0,1,0,-1,0,0],trail:[0,-1,-1,0,1,1,0,-1]},
    f1_paws:{bob:[0,1,0,-1,0,1,0,-1],lean:[0,0,1,1,0,-1,-1,0],nod:[0,1,0,-1,1,0,-1,0],trail:[0,-1,-1,0,1,1,0,-1]},
    f1_yarn:{bob:[3,4,5,5,4,4,3,2],lean:[0,1,2,1,0,-1,-1,0],nod:[1,1,2,1,0,1,0,0],trail:[0,-1,-1,0,1,1,0,-1]},
    f1_groom:{bob:[0,1,0,-1,0,1,0,-1],lean:[0,-1,-1,-2,-1,0,1,0],nod:[0,1,0,-1,1,0,-1,0],trail:[0,-1,-1,0,1,1,0,-1]}
  };
  // Each row is [elbow-x, elbow-y, hand-x, hand-y] in the native 48×64 art.
  var signatureJoints={
    c0_debug:{far:[[16,41,20,45],[17,41,23,43],[19,41,25,41],[19,40,26,40],[20,40,27,41],[19,41,25,42],[18,42,23,44],[16,42,20,46]],near:[[34,42,35,45],[36,39,38,40],[37,37,40,36],[38,38,40,39],[37,39,39,41],[38,37,42,37],[36,40,38,43],[34,43,34,46]]},
    c0_headset:{far:[[15,41,16,43],[12,36,14,34],[10,32,11,28],[9,30,10,25],[10,29,11,24],[11,31,12,26],[12,36,14,33],[15,41,17,42]],near:[[35,42,34,44],[39,36,38,35],[41,32,40,28],[42,30,40,25],[41,29,39,24],[41,32,39,28],[39,37,37,35],[35,42,34,44]]},
    c0_overclock:{far:[[15,41,16,45],[15,42,17,46],[16,41,18,45],[17,40,19,44],[17,41,19,45],[16,42,18,46],[15,41,17,45],[15,40,16,44]],near:[[35,41,35,42],[37,36,36,32],[38,32,36,26],[38,30,36,24],[39,31,37,25],[38,33,37,28],[36,38,35,35],[34,42,34,44]]},
    x0_paint:{far:[[15,41,16,45],[15,42,16,46],[16,41,17,45],[17,40,18,44],[17,41,18,45],[16,42,17,46],[15,41,16,45],[14,40,15,44]],near:[[34,42,35,43],[36,38,37,37],[38,35,39,33],[39,33,40,31],[40,34,41,33],[38,37,39,36],[36,40,37,39],[33,42,34,43]]},
    x0_palette:{far:[[16,42,21,46],[17,42,22,46],[18,41,23,45],[19,40,24,44],[18,41,23,45],[17,42,22,46],[16,41,21,45],[16,40,21,44]],near:[[36,39,38,38],[37,40,37,40],[37,42,35,43],[35,43,32,45],[35,42,33,44],[37,38,38,36],[38,39,40,39],[35,40,36,41]]},
    x0_sketch:{far:[[17,42,22,46],[18,42,23,46],[18,41,23,45],[19,40,24,44],[16,36,19,35],[14,28,19,17],[15,27,20,16],[16,36,20,36]],near:[[35,42,36,44],[36,40,37,41],[37,38,38,38],[37,37,39,36],[38,35,41,34],[41,27,43,17],[42,26,42,16],[38,36,42,36]]},
    f1_paws:{far:[[15,41,16,44],[12,36,12,37],[9,33,8,31],[8,30,7,27],[10,32,10,30],[8,34,7,33],[11,38,10,39],[15,42,16,44]],near:[[35,42,33,44],[39,36,38,37],[42,33,41,31],[43,30,41,27],[42,32,42,30],[43,34,43,33],[40,38,40,39],[35,42,34,44]]},
    f1_yarn:{far:[[15,43,15,48],[14,44,14,49],[14,45,15,50],[15,45,16,50],[16,44,17,49],[17,43,18,48],[16,42,17,47],[15,41,16,46]],near:[[34,42,33,44],[36,45,36,49],[38,48,37,51],[40,48,42,53],[38,46,39,50],[35,43,34,47],[34,41,33,45],[35,40,35,44]]},
    f1_groom:{far:[[16,41,17,45],[14,39,13,41],[13,36,10,37],[11,34,8,34],[12,37,9,38],[13,40,11,41],[15,41,14,43],[17,42,17,45]],near:[[27,42,16,46],[25,41,14,44],[24,39,13,42],[23,38,12,41],[24,40,13,43],[26,42,15,45],[28,43,16,46],[29,43,18,46]]}
  };
  function stamp(r,layer,flip){for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(layer.rows[y][x])r.dot(flip?W-1-x:x,y,layer.rows[y][x]);}
  function signatureHand(r,x,y,id,p,back,big){
    if(id!=='Feline1'){hand(r,x,y,id,p);return;}
    var w=big?3:2;r.poly([[x-w,y-2],[x+w,y-2],[x+w+1,y+1],[x+w,y+4],[x-w,y+3],[x-w-1,y]],p.hairL);r.line(x-w,y+1,x-w,y+2,p.hairM);
    if(!back){r.rect(x-1,y+1,3,2,p.accent);r.dot(x-w,y-1,p.accentD);r.dot(x,y-2,p.accent);r.dot(x+w,y-1,p.accentD);}
    else{r.line(x-1,y-1,x+1,y-1,p.hairM);r.dot(x+w,y+2,p.hairD);}
  }
  function signatureArm(r,id,p,back,bob,lean,state,q,far){
    var a=signatureJoints[state][far?'far':'near'][q],sx=(far?18:31)+lean,sy=37+bob,hx=a[2]+lean,hy=a[3]+bob;
    if(state==='c0_headset')hy+=signatureMotion[state].nod[q];
    if(back&&state==='x0_palette'&&far)hx+=10;
    r.line(sx,sy,a[0]+lean,a[1]+bob,far?p.clothD:p.cloth,4);r.line(sx,sy,a[0]+lean,a[1]+bob,far?p.clothD:p.clothL,1);
    r.line(a[0]+lean,a[1]+bob,hx,hy,far?SKIN_D:SKIN,3);r.line(a[0]+lean,a[1]+bob,hx,hy,far?p.clothD:p.cloth,2);
    signatureHand(r,hx,hy,id,p,back,state==='f1_paws');
  }
  function brush(r,hx,hy,tx,ty,p,colour){tx=Math.max(2,Math.min(44,tx));r.line(hx,hy,tx,ty,p.accentD,2);r.line(hx,hy,tx,ty,'#d9b27f');r.line(tx,ty,tx+1,ty-3,p.hairD,2);r.dot(tx+1,ty-3,colour||p.accent);}
  function signatureProps(r,id,p,side,back,bob,lean,state,q){
    var a=signatureJoints[state].near[q],hx=a[2]+lean,hy=a[3]+bob;
    if(state==='c0_debug'){
      var x=[32,31,30,29,29,30,31,32][q],y=[37,34,31,30,31,32,34,37][q]+bob,w=[12,14,16,17,17,16,14,12][q],h=[10,12,14,15,15,14,12,10][q];
      r.rect(x,y,w,h,INK);r.rect(x+1,y+1,w-2,h-2,p.clothD);r.line(x+1,y+2,x+w-2,y+2,p.accentD);r.dot(x+2,y+1,p.accent);
      for(var row=0;row<3;row++){var length=[3,5,6,8,7,6,4,2][q]-row;if(length>0)r.line(x+3,y+4+row*3,x+3+length,y+4+row*3,row===q%3?p.accent:p.clothL);}
      r.rect(x+w-4,y+h-3,2,1,q===5?'#a8e5ea':p.accentD);
    }else if(state==='x0_paint'){
      var tx=[39,42,44,44,42,40,39,37][q]+lean,ty=[36,29,25,23,24,29,33,37][q]+bob;
      var band=[[[39,34],[40,32]],[[40,30],[42,28]],[[41,27],[43,25]],[[39,24],[43,23]],[[37,25],[40,23],[43,24]],[[36,27],[38,25],[41,25],[44,27]],[[35,29],[37,27],[41,27],[44,29]],[[37,31],[40,30],[43,31]]][q];
      for(var k=1;k<band.length;k++){r.line(band[k-1][0],band[k-1][1]+bob,band[k][0],band[k][1]+bob,k%2?p.accent:'#d5b4e7',2);}
      brush(r,hx,hy,tx,ty,p,q<4?p.accent:'#d5b4e7');
    }else if(state==='x0_palette'){
      var px=(back?32:side?28:21)+[0,1,1,0,-1,-1,0,0][q],py=43+bob+[1,1,0,-1,0,1,0,-1][q];
      r.poly([[px,py+1],[px+4,py-1],[px+10,py],[px+12,py+3],[px+10,py+7],[px+3,py+8],[px-1,py+5]],'#d9b27f');
      r.line(px+1,py+5,px+4,py+7,'#79515e');r.rect(px+2,py+1,2,2,p.accent);r.rect(px+6,py+1,2,2,'#d5b4e7');r.rect(px+8,py+4,2,2,p.clothL);r.dot(px+3,py+5,p.hairD);
      var tx=[42,40,36,32,34,41,43,39][q]+(back?6:0),ty=[30,35,41,44,43,29,35,35][q]+bob;if(tx>45)tx=45;
      brush(r,hx,hy,tx,ty,p,q<3?p.accent:q<6?'#d5b4e7':p.clothL);if(q===6)r.line(px+7,py+5,px+9,py+6,p.accentD);
    }else if(state==='x0_sketch'){
      var bx=[22,22,23,23,21,21,22,22][q],by=[38,38,37,35,25,1,2,26][q]+(q>=5&&q<=6?0:bob),bw=21,bh=17;
      r.rect(bx,by,bw,bh,'#79515e');r.rect(bx+1,by+1,bw-2,bh-2,back?'#d9b27f':'#fff1dd');r.line(bx+2,by+bh-2,bx+bw-3,by+bh-2,'#b57b8f');
      if(back){r.line(bx+3,by+3,bx+17,by+3,'#e8d8b2');r.line(bx+4,by+4,bx+4,by+12,'#79515e');}
      else{
        r.line(bx+5,by+10,bx+5,by+6,p.hairD);r.line(bx+5,by+6,bx+8,by+4,p.hairD);r.line(bx+8,by+4,bx+11,by+6,p.hairD);r.line(bx+11,by+6,bx+15,by+4,p.hairD);
        if(q>=2){r.line(bx+15,by+4,bx+16,by+10,p.hairD);r.line(bx+5,by+10,bx+8,by+13,p.hairD);r.line(bx+8,by+13,bx+14,by+13,p.hairD);r.line(bx+14,by+13,bx+16,by+10,p.hairD);}
        if(q>=3){r.dot(bx+8,by+9,p.accentD);r.dot(bx+13,by+9,p.accentD);r.line(bx+10,by+11,bx+11,by+11,p.accent);}
      }
      if(q<4)brush(r,hx,hy,bx+[8,11,15,12][q],by+[7,6,5,10][q],p,p.accentD);
    }else if(state==='f1_yarn'){
      var ballX=[37,39,42,40,36,33,35,37][q],ballY=57;
      r.poly([[ballX-3,ballY-3],[ballX+2,ballY-4],[ballX+4,ballY-1],[ballX+4,ballY+2],[ballX+1,ballY+4],[ballX-3,ballY+3],[ballX-4,ballY]],'#4c3557');
      r.poly([[ballX-2,ballY-2],[ballX+1,ballY-3],[ballX+3,ballY-1],[ballX+3,ballY+1],[ballX+1,ballY+3],[ballX-2,ballY+2],[ballX-3,ballY]],'#8a8498');
      r.line(ballX-2,ballY-2,ballX+3,ballY+1,p.hairM);r.line(ballX-3,ballY,ballX+1,ballY+3,'#4c3557');r.line(ballX,ballY-3,ballX-1,ballY+2,p.hairL);r.dot(ballX+2,ballY-1,p.hairM);
      r.line(ballX-3,ballY+2,28,60,p.accentD);r.line(28,60,23,58,p.accent);r.line(23,58,20,60,p.accentD);
      if(q>=2&&q<=5)r.line(hx,Math.min(56,hy+1),ballX-1,ballY-2,p.accentD);
    }else if(state==='f1_groom'){
      var f=signatureJoints[state].far[q],cx=f[2]+lean,cy=f[3]+bob;
      r.line(cx-3,cy+1,cx+3,cy+1,p.accentD,2);for(var tooth=-3;tooth<=3;tooth+=2)r.line(cx+tooth,cy+2,cx+tooth,cy+4,p.accent);
      r.line(cx+3,cy+1,cx+5,cy-2,'#dbb57e',2);
    }
  }
  function signatureTail(r,id,p,state,q,bob){
    if(id!=='Feline1')return;
    if(state!=='f1_groom'){tail(r,id,p,q,bob,false,state);return;}
    var t=new R(),tipX=[8,7,6,5,6,8,9,8][q],tipY=[38,36,34,35,37,40,39,38][q];
    t.line(19,46+bob,13,50+bob,p.hairD,5);t.line(13,50+bob,7,47+bob,p.hair,5);t.line(7,47+bob,tipX-1,tipY+5,p.hair,4);t.line(tipX-1,tipY+5,tipX+1,tipY,p.hair,4);
    t.line(15,49+bob,8,46+bob,p.hairL,2);t.line(tipX,tipY+2,tipX,tipY+6,p.hairM);t.rect(tipX,tipY,3,2,p.hairL);stamp(r,t);r.tailMask=t.rows;
  }
  function signatureOverlay(r,id,p,back,bob,lean,state,q,nod){
    var y=8+bob+nod;
    if(state==='c0_headset'){
      // Far ear-cup and fingertips stay on the outer head silhouette.
      r.rect(38+lean,y+14,3,7,p.clothD);r.line(40+lean,y+15,40+lean,y+19,p.accentD);
      if(q>=2&&q<=5){r.line(40+lean,y+17,42+lean,y+17,SKIN);r.dot(10+lean,y+17,SKIN);}
    }else if(state==='c0_overclock'&&q>=2&&q<=6){
      if(!back){r.line(21+lean,y+14,26+lean,y+14,p.accent);r.line(31+lean,y+14,35+lean,y+14,p.accent);r.dot(25+lean,y+19,'#a8e5ea');}
      else r.line(12+lean,y+16,12+lean,y+20,p.accent);
      var ring=[[[8,24],[43,19]],[[7,20],[43,25]],[[9,16],[42,30]],[[13,13],[40,33]],[[8,22],[43,17]]][q-2];
      ring.forEach(function(pt,j){r.line(pt[0],pt[1]+bob,pt[0]+(j?-2:2),pt[1]+bob,p.accentD);r.dot(pt[0],pt[1]+bob-1,p.accent);});
    }
  }
  function signatureFrame(id,state,phase,direction){
    var r=new R(),subject=new R(),p=palettes[id],q=phase%8,side=direction==='right'||direction==='left',back=direction==='back',m=signatureMotion[state],bob=m.bob[q],lean=m.lean[q],nod=m.nod[q],trail=m.trail[q],crouch=state==='f1_yarn';r.owner=id;subject.owner=id;
    signatureTail(r,id,p,state,q,bob);
    if(!back)longHair(subject,id,p,side,bob,trail,lean);
    if(back)signatureProps(subject,id,p,side,true,bob,lean,state,q);
    legs(subject,id,p,side,back,crouch?'sit':'idle',q,lean);
    signatureArm(subject,id,p,back,bob,lean,state,q,true);
    if(back)signatureArm(subject,id,p,true,bob,lean,state,q,false);
    body(subject,id,p,side,back,bob,lean,crouch?'sit':'idle',q);
    if(back)longHair(subject,id,p,side,bob,trail,lean);
    var h=new R(),headState=state==='x0_sketch'&&q>=4||state==='f1_paws'&&q>=2&&q<=5?'cheer':'idle';
    head(h,id,p,side,back,bob+nod+(id==='Feline1'?2:0),state==='f1_groom'?-lean:lean,headState,q);
    stamp(subject,h,state==='f1_groom'&&!back);
    if(!back){signatureProps(subject,id,p,side,false,bob,lean,state,q);signatureArm(subject,id,p,false,bob,lean,state,q,true);signatureArm(subject,id,p,false,bob,lean,state,q,false);}
    signatureOverlay(subject,id,p,back,bob,lean,state,q,nod);
    stamp(r,subject);
    if(id==='Feline1'&&r.tailMask)for(var y=1;y<H-1;y++)for(var x=1;x<W-1;x++)if(r.tailMask[y][x]&&!subject.rows[y][x]&&r.rows[y][x]===r.tailMask[y][x]&&(subject.rows[y][x-1]||subject.rows[y][x+1]||subject.rows[y-1][x]||subject.rows[y+1][x]))r.dot(x,y,INK);
    return r.canvas(direction==='left');
  }
  function build(id,state,phase,direction){
    if(signatureOwners[state])return signatureFrame(id,state,phase,direction);
    var r=new R(),p=palettes[id],side=direction==='left'||direction==='right',back=direction==='back',moving=state==='walk'||state==='run';r.owner=id;
    var m=gait(state,phase),motion=poseMotion[state]||poseMotion.idle,q=phase%8;
    var bob=moving?m.bodyY:motion.bob[q],lean=moving?(side?m.lean:0):motion.lean[q],trail=moving?m.hairLag:motion.trail[q];
    var nod=moving?0:motion.nod[q];
    if(!back)longHair(r,id,p,side,bob,trail,lean);
    tail(r,id,p,phase,bob,side,state);
    legs(r,id,p,side,back,state,phase,lean);
    arms(r,id,p,side,back,bob,lean,state,phase,true);
    // Away-facing hands and their front-held props exist in front of the body.
    // Painting them here lets the back garment, head and long hair occlude them.
    if(back)arms(r,id,p,side,true,bob,lean,state,phase,false);
    body(r,id,p,side,back,bob,lean,state,phase);
    if(back)longHair(r,id,p,side,bob,trail,lean);
    // Leave a small head margin for F1's ears at the running up-position.
    head(r,id,p,side,back,bob+nod+(id==='Feline1'?2:0),lean,state,phase);
    if(!back)arms(r,id,p,side,false,bob,lean,state,phase,false);
    tailJoin(r,id,p,side,back,bob,lean,state,phase,nod);
    return r.canvas(direction==='left');
  }
  function frame(id,state,index,direction){
    if(!known[id])return null;state=states[state]&&(!signatureOwners[state]||signatureOwners[state]===id)?state:'idle';var count=states[state].count,n=Number(index);if(!Number.isFinite(n))n=0;var p=((Math.floor(n)%count)+count)%count;
    direction=['front','back','left','right'].indexOf(direction)>=0?direction:'front';
    var key=[id,state,p,direction].join('|');return cache[key]||(cache[key]=build(id,state,p,direction));
  }
  function draw(ctx,id,state,index,x,y,width,facingLeft,direction){
    direction=direction|| (facingLeft?'left':state==='walk'||state==='run'||state==='work'?'right':'front');var c=frame(id,state,index,direction);if(!c)return false;
    width=width||27;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(c,x,y,width,width*H/W);ctx.restore();return true;
  }
  window.StudioHeroSprites={width:W,height:H,palettes:gbaPalettes,characters:characters,states:states,uniqueActions:uniqueActions,ready:Promise.resolve(true),isReady:function(){return true;},draw:draw,frame:frame};
}());

})(referenceWindow, document, referenceWindow.StudioGait);

/* ai / SHA256 767eba8bed3caad3daa1faae7f58116356aaba94f44763b1bff3cd6ca3db538c */
(function (window, document, StudioGait) {
/* AI studio map sprites v8: seven personalities, twenty-one authored signature actions, four views.
 * Native 48 x 64 grid, hand-refined at one-pixel resolution and cached. No raster crops are used
 * for map animation. Character credits: media/ai-studio/README.md.
 * The earlier detailed illustration remains available only as drawPortrait(). */
(function () {
  'use strict';
  var W=48,H=64,BW=24,BH=32,INK='#292238',SKIN='#ffe0cb',SKIN_D='#dca2a1',WHITE='#fff6e5';
  var characters=[
    {id:'gpt',name:'GPT',color:'#94cbb9'}, {id:'deepseek',name:'DeepSeek',color:'#7aaff0'},
    {id:'claude',name:'Claude',color:'#e9a16f'}, {id:'grok',name:'Grok',color:'#dba0ba'},
    {id:'gemini',name:'Gemini',color:'#b7a0ef'}, {id:'kimi',name:'Kimi',color:'#a9b7eb'},
    {id:'doubao',name:'Doubao',color:'#b6d8e8'}
  ];
  var palettes={
    gpt:{hair:'#e7dff2',shade:'#aca0c7',light:'#fff8f1',cloth:'#f9eee7',dark:'#bcaed0',accent:'#86c3b1',eye:'#8274b0',leg:'#ede5ed',shoe:'#9383b4'},
    deepseek:{hair:'#4668ac',shade:'#2e4279',light:'#719fda',cloth:'#3d568f',dark:'#293e6c',accent:'#a2c8e9',eye:'#4693ce',leg:'#ede8ed',shoe:'#293a67'},
    claude:{hair:'#ce7c47',shade:'#8f4c3c',light:'#f4b870',cloth:'#f6e6cb',dark:'#3b303d',accent:'#d3844c',eye:'#9f654a',leg:'#e6ccba',shoe:'#72504c'},
    grok:{hair:'#dfb371',shade:'#a87555',light:'#ffdc98',cloth:'#39303f',dark:'#241f30',accent:'#a54d6a',eye:'#5f95bc',leg:'#6c4e62',shoe:'#2e2739'},
    gemini:{hair:'#7e7bd1',shade:'#4e4b8f',light:'#a5b7ed',cloth:'#59518d',dark:'#39355e',accent:'#c89be9',eye:'#5498c2',leg:'#ffe0cb',shoe:'#6b5b9e'},
    kimi:{hair:'#e3e0ee',shade:'#a3a2c8',light:'#fff8f3',cloth:'#36416b',dark:'#252d4d',accent:'#b2b8da',eye:'#7897c6',leg:'#eee8f0',shoe:'#353754'},
    doubao:{hair:'#574131',shade:'#332b2a',light:'#8c6546',cloth:'#484850',dark:'#30313c',accent:'#c9b28f',eye:'#735444',leg:'#ffe0cb',shoe:'#eee8d8'}
  };
  var states={
    idle:{count:8,frameMs:250,phaseLabels:['放松','吸气','轻转头','停留','呼气','回望','松肩','归位']},
    walk:{count:8,frameMs:100,stridePixels:20,phaseLabels:['右脚落地','右脚承重','左脚经过','左脚前摆','左脚落地','左脚承重','右脚经过','右脚前摆']},
    run:{count:8,frameMs:70,stridePixels:36,phaseLabels:['右脚落地','蹬地','腾空','前摆','左脚落地','蹬地','腾空','前摆']},
    work:{count:8,frameMs:100,phaseLabels:['准备','左手落键','左手回弹','右手伸出','右手落键','右手回弹','双手换位','回到键位']},
    wave:{count:8,frameMs:125,phaseLabels:['抬肩','举手','展开','向外挥','向内挥','再挥一次','收手','放下']},
    talk:{count:8,frameMs:100,phaseLabels:['起话','抬手','摊掌','强调','停顿','点头','收手','听对方说']},
    read:{count:8,frameMs:200,phaseLabels:['捧书','低头','阅读','捏住页角','翻页','抚平','继续读','抬眼']},
    coffee:{count:8,frameMs:175,phaseLabels:['握杯','抬杯','凑近','轻吹','喝一口','离开嘴边','放低','回到手边']},
    nap:{count:8,frameMs:230,phaseLabels:['放松','吸气','肩膀抬起','睡熟','呼气','头轻垂','回正','平稳呼吸']},
    sit:{count:8,frameMs:180,phaseLabels:['坐稳','伸展','换重心','轻晃脚','整理衣角','放松手','收腿','坐回原位']},
    carry:{count:8,frameMs:110,phaseLabels:['托稳','轻抬','调整左手','抬高','调整右手','放低','稳住','归位']},
    cheer:{count:8,frameMs:115,phaseLabels:['蓄力','举臂','踮脚','欢呼','落下','再举手','收臂','站稳']}
  };
  // Each life action has a complete anticipation / action / settle cycle.
  // Values are half-grid units, so the native renderer moves in single pixels.
  var lifeMotion={
    idle:{bob:[0,-.5,-.5,0,.5,.5,0,0],head:[0,0,.5,.5,0,-.5,-.5,.5],lean:[0,0,.5,.5,0,-.5,-.5,0],trail:[0,-.5,-.5,0,.5,.5,0,0]},
    work:{bob:[0,-.5,0,.5,0,-.5,0,.5],head:[0,.5,0,-.5,0,.5,.5,-.5],lean:[.5,1,1,.5,0,0,.5,.5],trail:[0,.5,.5,0,-.5,-.5,0,.5]},
    wave:{bob:[0,-.5,-.5,-1,-.5,-1,0,.5],head:[0,0,-.5,0,.5,0,-.5,0],lean:[0,0,.5,.5,0,-.5,0,0],trail:[0,-.5,-1,-.5,0,.5,.5,0]},
    talk:{bob:[0,-.5,0,.5,0,-.5,0,.5],head:[0,.5,0,-.5,0,.5,1,.5],lean:[0,.5,.5,0,-.5,0,.5,0],trail:[0,-.5,0,.5,.5,0,-.5,0]},
    read:{bob:[0,0,-.5,-.5,0,.5,.5,0],head:[0,.5,1,1,.5,0,-.5,-.5],lean:[0,-.5,-.5,0,.5,.5,0,0],trail:[0,-.5,0,.5,1,.5,0,-.5]},
    coffee:{bob:[0,-.5,-.5,0,.5,0,-.5,0],head:[0,0,.5,1,.5,0,-.5,.5],lean:[0,.5,.5,0,-.5,-.5,0,0],trail:[0,-.5,-1,-.5,0,.5,.5,0]},
    nap:{bob:[.5,1,1.5,2,1.5,1,.5,0],head:[0,.5,1,1,.5,0,-.5,0],lean:[0,0,.5,.5,0,-.5,-.5,0],trail:[0,.5,.5,0,-.5,-.5,0,0]},
    sit:{bob:[0,-.5,-1,-.5,0,.5,.5,0],head:[0,-.5,0,.5,1,.5,0,-.5],lean:[0,.5,1,.5,0,-.5,-.5,0],trail:[0,-.5,0,.5,1,.5,0,-.5]},
    carry:{bob:[0,-.5,-1,-.5,0,.5,1,.5],head:[0,.5,.5,0,-.5,-.5,0,.5],lean:[0,.5,.5,0,-.5,-.5,0,.5],trail:[0,-.5,-1,-.5,0,.5,1,.5]},
    cheer:{bob:[.5,0,-1,-1.5,-.5,0,-1,0],head:[0,-.5,0,.5,0,-.5,0,.5],lean:[0,0,.5,.5,0,-.5,-.5,0],trail:[0,-.5,-1,-.5,0,.5,1,.5]}
  };
  function life(state,phase){var p=lifeMotion[state]||lifeMotion.idle,i=phase%8;return{bob:p.bob[i],head:p.head[i],lean:p.lean[i],trail:p.trail[i]};}

  var signatureActions={
    gpt:[
      ['gpt_think','慢慢推理','托住下巴，翻看推理纸，再把思路一点点接起来。',180,['摊开草稿','抬起手','托住下巴','推敲线索','写下结论','再想一步','放下手','整理草稿']],
      ['gpt_wings','伸展龙翼','先耸肩，再逐节展开龙翼，舒舒服服地伸个懒腰。',135,['收紧肩膀','抬臂','展开翼骨','完全伸展','轻扇翅尖','收回外翼','垂下手臂','放松站稳']],
      ['gpt_tea','龙尾奉茶','龙尾稳稳托着小茶杯，双手把茶盘恭敬地递过来。',160,['托稳茶盘','龙尾抬杯','端近一点','微微鞠躬','请你喝茶','抬起头','收回茶盘','茶杯归位']]],
    deepseek:[
      ['deepseek_fish','偷偷摸鱼','探头看看，抓住一条小鱼，再若无其事地藏进袖口。',145,['看看四周','举起小鱼','悄悄欣赏','往袖里藏','按住袖口','假装认真','露出鱼尾','重新藏好']],
      ['deepseek_bowl','抱碗干饭','双手抱着饭碗，举起筷子，认真地吃一大口。',125,['抱住饭碗','凑近闻闻','举起筷子','夹起米饭','吃一大口','满足点头','放低饭碗','再来一口']],
      ['deepseek_tail','鲸尾拍水','抬起鲸尾蓄力，拍出一小圈水花，甩甩尾巴再站稳。',110,['张手平衡','鲸尾抬起','向下蓄力','拍到水面','水花弹起','甩掉水珠','收回尾巴','重新站稳']]],
    claude:[
      ['claude_soul','灵魂出窍','身体慢慢断线，小灵魂升起，兜一圈又落回身体。',160,['信号变弱','肩膀垂下','脑袋低垂','小魂升起','飘到半空','寻找身体','慢慢落回','重新醒来']],
      ['claude_scroll','展开长卷','抓住卷轴两端，把短短的纸卷展开成一张长长的说明书。',150,['握住卷轴','松开纸带','向两侧拉','展开长卷','检查内容','往回收卷','叠好纸边','抱回怀里']],
      ['claude_reconnect','重新上线','寻找松掉的插头，接上线，再精神抖擞地回到工作状态。',130,['发现断线','摸到线头','拿起插头','对准接口','咔哒接上','信号回来','拍拍胸口','精神上线']]],
    grok:[
      ['grok_axe','转转战斧','握住斧柄，绕着手腕转一圈，再稳稳地接住。',100,['握紧斧柄','抬起手腕','斧刃向上','翻过手背','绕过左侧','翻转斧柄','接住战斧','收回身侧']],
      ['grok_smirk','坏笑挑眉','一手叉腰，一手摊掌，挑着眉毛晃晃脑袋。',155,['手搭腰间','抬起手掌','歪头看看','挑起眉毛','露出坏笑','晃晃手腕','收回手掌','得意站稳']],
      ['grok_spark','划出闪电','抬指划过空气，把弯弯的电弧拉成一道闪电。',100,['手指蓄力','擦出火星','向上划线','拉长电弧','闪电分叉','甩开余电','放下手指','静电散去']]],
    gemini:[
      ['gemini_stars','编织星光','两只手牵住星线，交叉编织，再把小星星轻轻放开。',145,['捏住星线','向外拉开','双手交错','编起星结','托起星星','慢慢松手','星光散开','收回指尖']],
      ['gemini_twins','双星分身','合掌聚起星光，再张开双手召出两枚会跟着动的小星灵。',145,['双手合拢','聚起双星','向外分开','星灵显形','左右招呼','一同旋转','收回星灵','合掌归位']],
      ['gemini_tail','追逐尾尖','转头发现尾尖，弯腰伸手去捉，尾巴却又绕到另一边。',115,['发现尾尖','转头看去','弯腰伸手','差一点点','摸到尾毛','尾巴溜走','重新追上','假装没追']]],
    kimi:[
      ['kimi_moon','捧起月亮','双手把一弯小月亮从掌心举起，再温柔地接回怀里。',165,['掌心合拢','月牙出现','慢慢举起','抬头望月','捧到最高','轻轻接住','抱回怀里','月光安稳']],
      ['kimi_notes','长卷速记','拉开记录长卷，执笔快速写下几行，再整理收好。',110,['拉出纸卷','握好笔尖','写第一行','移到下一行','快速补记','查看笔记','收起长卷','合上笔帽']],
      ['kimi_search','月下寻页','抱住书页，用放大镜从左到右认真寻找那个小小的线索。',155,['摊开书页','举起放大镜','靠近左页','移向右页','找到线索','轻点页角','放低镜子','合好书页']]],
    doubao:[
      ['doubao_cookie','分你饼干','打开小饼干盒，挑一块最完整的，伸手分给你。',145,['抱好饼干盒','打开小盒','挑出一块','抬起饼干','递到你面前','等你接过','收回小手','盖好盒子']],
      ['doubao_drool','迷糊发呆','两只手慢慢垂下来，脑袋一点一点，嘴角挂上一小滴口水。',190,['松开双手','眼神放空','脑袋低垂','迷迷糊糊','口水冒出','晃晃脑袋','擦擦嘴角','慢慢回神']],
      ['doubao_idea','突然开窍','抓抓脑袋，突然想到好主意，举起手指笑起来。',140,['有点疑惑','抬手挠头','认真想想','忽然一亮','举起手指','开心点头','放下小手','记住主意']]]
  };
  var actionOwner=Object.create(null),actionMeta=Object.create(null);
  Object.keys(signatureActions).forEach(function(id){signatureActions[id]=signatureActions[id].map(function(a){
    var item={id:a[0],name:a[1],description:a[2],count:8,frameMs:a[3],phaseLabels:a[4],uniqueFor:id};
    states[item.id]=item;actionOwner[item.id]=id;actionMeta[item.id]=item;return item;
  });});
  function uniqueActions(id){return(signatureActions[id]||[]).map(function(a){return{id:a.id,name:a.name,description:a.description,count:a.count,frameMs:a.frameMs,phaseLabels:a.phaseLabels.slice()};});}
  // Signature actions have their own body rhythm and hand choreography. Each
  // list contains eight complete poses, rather than aliases of public actions.
  var signatureMotion={
    gpt_think:[[0,0,-.5,0,.5,0,-.5,0],[0,.5,1,1,.5,0,-.5,0],[0,.5,.5,0,-.5,-.5,0,.5]],
    gpt_wings:[[.5,0,-.5,-1,-1.5,-.5,0,.5],[0,-.5,-.5,0,.5,0,-.5,0],[0,-.5,-.5,0,.5,.5,0,-.5]],
    gpt_tea:[[0,-.5,0,.5,1,.5,0,-.5],[0,0,.5,1,1.5,1,.5,0],[0,.5,1,1.5,1,.5,0,-.5]],
    deepseek_fish:[[0,-.5,0,.5,0,-.5,.5,0],[0,-.5,0,.5,1,.5,0,-.5],[0,.5,1,.5,-.5,-1,-.5,0]],
    deepseek_bowl:[[0,-.5,-1,-.5,.5,1,.5,0],[0,.5,1,.5,1.5,1,.5,0],[0,.5,.5,0,-.5,-.5,0,.5]],
    deepseek_tail:[[0,-.5,-1,1,.5,-.5,0,.5],[0,-.5,0,1,.5,0,-.5,0],[0,.5,1,.5,0,-.5,-1,-.5]],
    claude_soul:[[0,.5,1,1.5,2,1.5,.5,0],[0,.5,1,2,2.5,1.5,.5,-.5],[0,.5,1,1,.5,0,-.5,0]],
    claude_scroll:[[0,-.5,-.5,0,.5,0,-.5,0],[0,.5,1,.5,0,-.5,0,.5],[0,-.5,-1,-.5,0,.5,1,.5]],
    claude_reconnect:[[1,.5,0,.5,0,-.5,-1,0],[1.5,1,.5,1,.5,0,-.5,0],[-.5,0,.5,1,.5,0,-.5,0]],
    grok_axe:[[.5,0,-.5,-1,-.5,0,.5,0],[0,-.5,0,.5,0,-.5,.5,0],[0,.5,1,.5,0,-.5,-1,-.5]],
    grok_smirk:[[0,-.5,0,.5,0,-.5,.5,0],[0,-.5,0,.5,1,.5,0,-.5],[0,.5,1,1.5,.5,-.5,-1,0]],
    grok_spark:[[.5,0,-.5,-1,-.5,.5,0,-.5],[0,-.5,0,.5,-.5,0,.5,0],[0,.5,1,.5,0,-.5,-.5,0]],
    gemini_stars:[[0,-.5,-1,-.5,0,.5,0,-.5],[0,.5,0,-.5,.5,1,.5,0],[0,.5,1,.5,0,-.5,-1,-.5]],
    gemini_twins:[[.5,0,-.5,-1,-.5,0,.5,0],[0,.5,0,-.5,.5,1,.5,0],[0,-.5,0,.5,1,.5,0,-.5]],
    gemini_tail:[[0,.5,1,1.5,1,.5,0,-.5],[0,.5,1,1.5,1,.5,0,-.5],[0,-.5,-1,-1.5,-1,-.5,0,.5]],
    kimi_moon:[[0,-.5,-1,-1.5,-1,-.5,0,.5],[0,.5,0,-.5,-1,-.5,.5,0],[0,.5,.5,0,-.5,-.5,0,.5]],
    kimi_notes:[[0,-.5,0,.5,0,-.5,.5,0],[0,.5,1,.5,0,-.5,0,.5],[0,.5,1,.5,0,-.5,-.5,0]],
    kimi_search:[[0,-.5,0,.5,0,-.5,.5,0],[0,.5,1,.5,0,-.5,0,.5],[0,.5,1,.5,0,-.5,-1,-.5]],
    doubao_cookie:[[0,-.5,-.5,0,.5,0,-.5,0],[0,.5,0,-.5,0,.5,1,.5],[0,.5,1,1.5,1,.5,0,-.5]],
    doubao_drool:[[0,.5,1,1.5,2,1.5,.5,0],[0,.5,1,1.5,2,1,.5,-.5],[0,.5,1,.5,0,-.5,-1,-.5]],
    doubao_idea:[[0,-.5,0,.5,-1,-.5,0,.5],[0,.5,1,.5,-.5,0,.5,0],[0,.5,1,.5,0,-.5,-.5,0]]
  };
  function signaturePose(state,i){var m=signatureMotion[state];return{bob:m[0][i],head:m[1][i],lean:m[2][i],trail:[0,-.5,-1,-.5,0,.5,1,.5][i]};}
  function validState(id,state){return states[state]&&(!actionOwner[state]||actionOwner[state]===id)?state:'idle';}

  var cache=Object.create(null),lookup=Object.create(null);
  characters.forEach(function(c){lookup[c.id]=c;});
  function Raster(w,h){this.w=w||BW;this.h=h||BH;var width=this.w;this.rows=Array.from({length:this.h},function(){return Array(width).fill(null);});}
  Raster.prototype.dot=function(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<this.w&&y>=0&&y<this.h)this.rows[y][x]=c;};
  Raster.prototype.rect=function(x,y,w,h,c){for(var j=0;j<h;j++)for(var i=0;i<w;i++)this.dot(x+i,y+j,c);};
  Raster.prototype.line=function(x1,y1,x2,y2,c,size){
    x1=Math.round(x1);y1=Math.round(y1);x2=Math.round(x2);y2=Math.round(y2);size=size||1;
    var dx=Math.abs(x2-x1),sx=x1<x2?1:-1,dy=-Math.abs(y2-y1),sy=y1<y2?1:-1,err=dx+dy;
    for(;;){this.rect(x1,y1,size,size,c);if(x1===x2&&y1===y2)break;var e=2*err;if(e>=dy){err+=dy;x1+=sx;}if(e<=dx){err+=dx;y1+=sy;}}
  };
  Raster.prototype.poly=function(pts,c){
    var lo=Math.max(0,Math.floor(Math.min.apply(null,pts.map(function(p){return p[1];})))),hi=Math.min(this.h-1,Math.ceil(Math.max.apply(null,pts.map(function(p){return p[1];}))));
    for(var y=lo;y<=hi;y++)for(var x=0;x<this.w;x++){
      var inside=false;for(var i=0,j=pts.length-1;i<pts.length;j=i++){
        var a=pts[i],b=pts[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&(x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0]))inside=!inside;
      }if(inside)this.dot(x,y,c);
    }
  };
  Raster.prototype.canvas=function(flip){
    var hi=new Raster(W,H);
    if(this.before)this.before(hi);
    // The articulated silhouette is only a scaffold. Faces, hair, embroidery,
    // edges, shoes, wings and tails are repainted below on the 48px native grid.
    for(var sy=0;sy<BH;sy++)for(var sx=0;sx<BW;sx++)if(this.rows[sy][sx])hi.rect(sx*2,sy*2,2,2,this.rows[sy][sx]);
    if(this.refine)this.refine(hi);
    if(this.after)this.after(hi);
    if(this.palette)limitPalette(hi,this.palette);
    var rows=hi.rows;
    // Keep deliberate pixel clusters intact: no automatic chamfer/dither pass.
    var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');
    for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(!rows[y][x]&&((x&&rows[y][x-1]&&rows[y][x-1]!==INK)||(x<W-1&&rows[y][x+1]&&rows[y][x+1]!==INK)||(y&&rows[y-1][x]&&rows[y-1][x]!==INK)||(y<H-1&&rows[y+1][x]&&rows[y+1][x]!==INK))){g.fillStyle=INK;g.fillRect(flip?W-1-x:x,y,1,1);}
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(rows[yy][xx]){g.fillStyle=rows[yy][xx];g.fillRect(flip?W-1-xx:xx,yy,1,1);}return c;
  };
  function star(r,x,y,color){r.rect(x,y-1,1,3,color);r.rect(x-1,y,3,1,color);}
  function limb(r,shoulder,elbow,hand,sleeve,skin){
    r.line(shoulder[0],shoulder[1],elbow[0],elbow[1],sleeve,2);
    r.line(elbow[0],elbow[1],hand[0],hand[1],skin,2);
  }
  function limitedColours(p,id){
    return [INK,SKIN,SKIN_D,'#edb1ad',WHITE,p.hair,p.shade,p.light,p.cloth,p.dark,p.accent,p.eye,p.leg,p.shoe,
      '#80584a','#c5a575','#53617c','#9bcbd0','#d5b4d9',id==='gemini'?'#c6a458':p.eye].filter(function(c,i,a){return a.indexOf(c)===i;});
  }
  function limitPalette(r,palette){
    var memo=Object.create(null),rgb=palette.map(function(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];});
    for(var y=0;y<r.h;y++)for(var x=0;x<r.w;x++)if(r.rows[y][x]){
      var color=r.rows[y][x];if(palette.indexOf(color)>=0)continue;
      if(!memo[color]){var a=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)],best=0,score=Infinity;
        rgb.forEach(function(b,i){var d=(a[0]-b[0])*(a[0]-b[0])*.8+(a[1]-b[1])*(a[1]-b[1])*1.1+(a[2]-b[2])*(a[2]-b[2]);if(d<score){score=d;best=i;}});memo[color]=palette[best];}
      r.rows[y][x]=memo[color];
    }
  }
  function gait(state,phase){
    if(window.StudioGait)return StudioGait.sample(state,phase);
    return{bodyY:0,lean:0,armSwing:0,hairLag:0,near:{hip:{x:26,y:48},knee:{x:27,y:54},ankle:{x:27,y:59},planted:true},far:{hip:{x:21,y:47},knee:{x:20,y:53},ankle:{x:20,y:57},planted:true}};
  }
  function nativeShoe(r,ankle,p,far,planted,roll){
    var x=Math.round(ankle.x),y=Math.round(ankle.y),base=far?p.dark:p.shoe;
    // A planted foot has a flat sole; a lifted foot turns its toe down slightly.
    if(planted){
      if(roll==='heel')r.poly([[x-2,y],[x+2,y-1],[x+4,y+1],[x+3,y+2],[x-3,y+3],[x-3,y+1]],base);
      else if(roll==='toe')r.poly([[x-2,y-1],[x+2,y],[x+4,y+2],[x+4,y+3],[x,y+3],[x-3,y+1]],base);
      else r.poly([[x-2,y],[x+2,y],[x+4,y+2],[x+4,y+3],[x-3,y+3],[x-3,y+1]],base);
      r.line(roll==='toe'?x:x-2,y+3,roll==='heel'?x:x+4,y+3,far?p.shade:WHITE);r.line(x-1,y,x+2,y,far?p.dark:p.accent);
    }
    else{r.poly([[x-2,y-1],[x+2,y],[x+3,y+2],[x+1,y+3],[x-2,y+2],[x-3,y]],base);r.line(x-1,y+2,x+2,y+3,far?p.shade:WHITE);}
  }
  function nativeLegs(r,p,pose,side,back){
    function draw(j,far){
      var hip={x:j.hip.x,y:j.hip.y},knee={x:j.knee.x,y:j.knee.y},ankle={x:j.ankle.x,y:j.ankle.y};
      if(!side){
        // Toward/away motion changes depth and lift, not a giant horizontal split.
        var mid=far?19:29,shift=side?0:(j.ankle.x-j.hip.x)*.22;
        hip.x=mid;knee.x=mid+shift;ankle.x=mid+shift;
      }
      var col=far?p.dark:p.leg;
      r.line(hip.x,hip.y,knee.x,knee.y,col,4);r.line(knee.x,knee.y,ankle.x,ankle.y,col,3);
      if(!far)r.line(knee.x+1,knee.y+1,ankle.x+1,ankle.y-1,p.leg===SKIN?WHITE:p.light,1);
      nativeShoe(r,ankle,p,far||back,j.planted,j.roll);
    }
    draw(pose.far,true);draw(pose.near,false);
  }
  function nativeMovingArm(r,p,pose,side,back,far){
    var swing=pose.armSwing*(far?-1:1),sx=(far?18:31)+pose.lean,sy=38+pose.bodyY;
    if(!side)sx=far?14:33;
    var ex=sx+swing*.72,ey=sy+5-Math.abs(swing)*.15,hx=ex+swing*.55,hy=sy+10-Math.abs(swing)*.55;
    var sleeve=far?p.dark:p.cloth;
    r.line(sx,sy,ex,ey,sleeve,4);r.line(ex,ey,hx,hy,far?SKIN_D:SKIN,3);
    if(!far)r.line(sx,sy,ex,ey,p.light,1);
    r.rect(hx-1,hy-1,3,3,far?SKIN_D:SKIN);
  }
  function shoe(r,x,y,p,back){r.rect(x-1,y,4,2,back?p.dark:p.shoe);r.rect(x,y+1,3,1,back?p.shade:WHITE);}
  function legs(r,p,side,back,state,phase,lean){
    var walking=state==='walk'||state==='run',running=state==='run';
    var steps=running?[-4,-2,2,4,2,-2]:[-3,-1,2,3,1,-2],s=walking?steps[phase%6]:0;
    var seated=state==='work'||state==='sit';
    if(seated){
      var toeX=(state==='sit'?[0,.5,1,1,.5,0,-.5,0]:[0,0,.5,0,-.5,0,.5,0])[phase%8];
      var toeY=(state==='sit'?[0,-.5,-1,-.5,0,.5,0,0]:[0,-.5,0,0,0,-.5,0,0])[phase%8];
      if(side){r.line(11,25,16,26,p.leg,2);r.line(16,26,16+toeX,29+toeY,p.leg,2);shoe(r,16+toeX,29+toeY,p,false);r.line(10,25,13,27,p.dark,2);r.line(13,27,14,29,p.dark,2);shoe(r,14,29,p,true);}
      else{r.line(9,25,7,27,p.leg,2);r.line(7,27,8,29,p.leg,2);r.line(14,25,17,27,p.leg,2);r.line(17,27,16+toeX,29+toeY,p.leg,2);shoe(r,8,29,p,back);shoe(r,16+toeX,29+toeY,p,back);}return;
    }
    if(side){
      var footFar=10-s*.7,footNear=13+s*.7,farY=walking&&phase%3===1?27:29,nearY=walking&&phase%3===2?28:30;
      // Bent knees, crossed passing poses and planted heels make an actual stride.
      r.line(10+lean,24,10-s*.4,26,p.dark,2);r.line(10-s*.4,26,footFar,farY,p.dark,2);shoe(r,footFar,farY,p,true);
      r.line(13+lean,24,13+s*.4,27,p.leg,2);r.line(13+s*.4,27,footNear,nearY,p.leg,2);shoe(r,footNear,nearY,p,false);
    }else{
      var liftA=walking&&phase%6<3?Math.abs(s)*.65:0,liftB=walking&&phase%6>=3?Math.abs(s)*.65:0;
      r.line(9,24,8-s*.3,27,p.leg,2);r.line(8-s*.3,27,8-s*.45,30-liftA,p.leg,2);shoe(r,8-s*.45,30-liftA,p,back);
      r.line(14,24,15+s*.3,27,p.leg,2);r.line(15+s*.3,27,15+s*.45,30-liftB,p.leg,2);shoe(r,15+s*.45,30-liftB,p,back);
    }
  }
  function hairBack(r,id,p,side,back,bob,trail,lean){
    var y=5+bob;
    if(id==='doubao'){
      r.poly([[6+lean,y],[17+lean,y],[20+lean,y+4],[20+lean,y+14],[16+lean,y+15],[5+lean,y+14],[4+lean,y+6]],p.hair);
      r.rect(5+lean,y+6,2,8,p.shade);return;
    }
    if(id==='grok'){
      // Independent twin tails trail the head, rather than stretching the portrait.
      r.poly([[6+lean,y+2],[2+lean,y+5],[2-trail,y+11],[3-trail,y+15],[2-trail,y+19],[5-trail,y+18],[7+lean,y+7]],p.hair);
      r.poly([[17+lean,y+2],[21+lean,y+5],[21-trail,y+10],[21-trail,y+15],[21-trail,y+19],[19-trail,y+18],[17+lean,y+7]],side?p.shade:p.hair);
      r.line(5+lean,y+7,5-trail,y+13,p.light);r.line(19+lean,y+7,19-trail,y+14,p.light);return;
    }
    var bottom=id==='claude'?27:id==='kimi'?26:id==='gpt'?25:23;
    r.poly([[6+lean,y],[17+lean,y],[20+lean,y+6],[18+lean,y+12],[19-trail,bottom-3+bob],[17-trail,bottom+bob],[13-trail,bottom-2+bob],[8-trail,bottom+bob],[4-trail,bottom-1+bob],[5+lean,y+12],[3+lean,y+5]],p.hair);
    r.line(5+lean,y+6,6-trail,bottom-3+bob,p.shade,2);r.line(18+lean,y+7,16-trail,bottom-2+bob,p.light);
    if(id==='gemini')r.poly([[4-trail,19+bob],[7-trail,17+bob],[18-trail,18+bob],[18-trail,23+bob],[15-trail,25+bob],[7-trail,23+bob]],'#b58adf');
  }
  function wings(r,id,p,side,bob,trail,state,phase){
    if(id!=='gpt')return;
    if(state==='gpt_wings'){
      var span=[3,4,6,7,8,7,5,3][phase],rise=[0,1,2,4,5,3,1,0][phase];
      r.poly([[10,20+bob],[9-span,17-rise+bob],[10-span,21+bob],[12-span,20+bob],[13-span,24+bob],[9,23+bob]],p.dark);
      r.line(9-span,17-rise+bob,8,22+bob,p.hair);r.line(10-span,20+bob,8,22+bob,p.shade);
      var far=side?Math.ceil(span*.55):span;
      r.poly([[15,20+bob],[Math.min(22,15+far),17-rise*.7+bob],[Math.min(23,17+far),22+bob],[18,21+bob],[17,24+bob],[15,23+bob]],p.shade);
      r.line(16,21+bob,Math.min(22,15+far),18-rise*.7+bob,p.light);return;
    }
    // The near wing emerges from the rear shoulder; the far wing is foreshortened.
    r.poly([[10,20+bob],[5,16+bob],[2,18+bob],[1,22+bob],[4,20+bob],[5,24+bob],[9,23+bob]],p.dark);
    r.line(4,18+bob,8,22+bob,p.hair);
    if(!side)r.poly([[15,20+bob],[20,16+bob],[22,21+bob],[19,20+bob],[18,24+bob],[15,23+bob]],p.dark);
    else r.poly([[15,20+bob],[18,18+bob],[20,21+bob],[17,23+bob]],p.shade);
  }
  function tail(id,p,bob,phase,motion,state){
    if(id!=='gpt'&&id!=='deepseek'&&id!=='gemini')return null;
    var r=new Raster(W,H),wag=motion?motion.hairLag:[0,-1,-2,-1,0,1,2,1][phase%8];
    var baseY=Math.round(bob*2),w=wag*.65;
    if(state==='gpt_tea')w=[0,-1,-2,-3,-2,-1,0,1][phase];
    if(state==='deepseek_tail')w=[0,-4,-6,11,14,8,3,0][phase];
    if(state==='gemini_tail')w=[0,1,3,5,4,0,-3,-1][phase];
    // Tail roots stay behind the left/rear hip in the right-facing model.
    // Native-width shafts leave a visible channel beside the skirt and hair.
    if(id==='gpt'){
      r.line(19,49+baseY,14,54+baseY,p.shade,3);
      r.line(14,54+baseY,8,56+baseY,p.shade,3);
      r.line(8,56+baseY,4,53+baseY,p.shade,3);
      r.line(4,53+baseY,3,47+w+baseY,p.shade,3);
      r.line(3,47+w+baseY,5,43+w+baseY,p.shade,3);
      r.poly([[3,44+w+baseY],[2,41+w+baseY],[5,38+w+baseY],[8,41+w+baseY],[7,44+w+baseY]],p.hair);
      r.line(5,45+w+baseY,5,50+baseY,p.hair);
      r.line(6,54+baseY,10,56+baseY,p.light);
      r.line(11,55+baseY,15,53+baseY,p.hair);
      r.dot(5,40+w+baseY,p.light);r.dot(4,49+baseY,p.light);
    }else if(id==='deepseek'){
      r.line(19,49+baseY,13,54+baseY,p.hair,3);
      r.line(13,54+baseY,8,54+baseY,p.light,3);
      r.line(8,54+baseY,5,Math.min(56,49+w+baseY),p.light,3);
      r.line(5,Math.min(56,49+w+baseY),5,43+w+baseY,p.light,3);
      // Two flukes, a central V notch, and a dark inner edge distinguish the
      // whale tail from the blue apron and the long rear hair.
      r.poly([[5,45+w+baseY],[2,42+w+baseY],[1,37+w+baseY],[4,38+w+baseY],[6,40+w+baseY],[9,36+w+baseY],[11,36+w+baseY],[10,41+w+baseY],[8,44+w+baseY]],p.accent);
      r.line(3,39+w+baseY,5,42+w+baseY,p.light);
      r.line(9,38+w+baseY,7,42+w+baseY,p.light);
      r.line(6,47+w+baseY,6,51+baseY,p.accent);
      r.line(9,54+baseY,14,53+baseY,p.accent);
    }else{
      r.line(19,49+baseY,14,54+baseY,p.shade,3);
      r.line(14,54+baseY,9,55+baseY,p.accent,3);
      r.line(9,55+baseY,5,52+baseY,p.accent,3);
      r.line(5,52+baseY,3,47+w+baseY,p.accent,3);
      r.line(3,47+w+baseY,3,43+w+baseY,p.accent,3);
      r.line(3,43+w+baseY,5,40+w+baseY,p.accent,3);
      r.line(5,40+w+baseY,state==='gemini_tail'?[7,8,9,10,12,9,7,7][phase]:7,40+w+baseY,p.accent,2);
      r.line(4,45+w+baseY,4,49+w+baseY,p.light);
      r.line(6,53+baseY,10,55+baseY,p.light);
      r.dot(6,40+w+baseY,p.light);
    }
    var outlined=new Raster(W,H);
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){
      if(!r.rows[y][x]&&((x&&r.rows[y][x-1])||(x<W-1&&r.rows[y][x+1])||(y&&r.rows[y-1][x])||(y<H-1&&r.rows[y+1][x])))outlined.dot(x,y,INK);
    }
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(r.rows[yy][xx])outlined.dot(xx,yy,r.rows[yy][xx]);
    return outlined;
  }
  function tailUnderlay(target,layer,foreground){
    if(!layer)return;
    function covered(x,y){return x>=0&&x<W&&y>=0&&y<H&&foreground.rows[Math.floor(y/2)][Math.floor(x/2)];}
    for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(layer.rows[y][x]){
      var color=layer.rows[y][x];
      // A one-pixel contact shadow separates touching tail and body clusters.
      // The body still occludes the root instead of the tail crossing its waist.
      if(color!==INK&&!covered(x,y)&&(covered(x+1,y)||covered(x-1,y)||covered(x,y-1)||covered(x,y+1)))color=INK;
      target.dot(x,y,color);
    }
  }
  function body(r,id,p,side,back,bob,lean,state,phase){
    var top=18+bob,hem=25+bob,seated=state==='work'||state==='sit';
    if(seated)hem=24+bob;
    if(side){
      r.poly([[8+lean,top],[15+lean,top],[17+lean,top+4],[18,hem+1],[7,hem+1],[7+lean,top+3]],p.cloth);
      r.rect(7+lean,top+1,2,4,p.dark);r.line(10+lean,top,14+lean,top,WHITE);
      r.line(14+lean,top+1,16,hem,p.accent);
    }else{
      r.poly([[8,top],[15,top],[17,top+4],[18,hem],[5,hem],[7,top+4]],p.cloth);
      r.rect(7,top+1,2,4,p.dark);r.rect(15,top+2,1,4,p.dark);r.line(9,top,13,top,WHITE);
    }
    if(id==='gpt'){
      if(!back){r.line(11+lean,top+1,11+lean,top+5,p.light);star(r,12+lean,top+2,p.accent);}r.line(7,hem,16,hem,p.light);
    }else if(id==='deepseek'){
      if(!back){r.poly([[10+lean,top+1],[14+lean,top+1],[15,hem],[8,hem]],WHITE);r.rect(11+lean,top+3,2,2,p.light);}
      else{r.rect(9,top+3,5,2,WHITE);r.line(9,top+4,7,top+6,WHITE);r.line(13,top+4,15,top+6,WHITE);}
      for(var i=6;i<18;i+=3)r.rect(i,hem,2,1,WHITE);
    }else if(id==='claude'){
      r.rect(side?10+lean:8,top+2,side?5:7,2,p.dark);if(!back)r.dot(12+lean,top+2,'#e5b969');
      if(!back)r.poly([[13+lean,top+4],[16,hem],[11,hem]],p.accent);r.line(7,hem,17,hem,'#d1aa80');
    }else if(id==='grok'){
      if(!back){r.rect(10+lean,top+1,4,1,p.accent);r.line(10+lean,top+2,13+lean,top+4,'#d4b17b');}else r.line(12,top+1,12,hem-1,p.dark);
      r.poly([[13+lean,top+4],[17,hem],[14,hem+1],[11,hem]],p.accent);r.line(7,hem,16,hem,p.dark);
    }else if(id==='gemini'){
      r.rect(10+lean,top+3,4,2,back?p.cloth:SKIN);r.rect(8,hem-1,9,2,p.dark);r.line(7,hem,17,hem,p.accent);
      if(!back)star(r,12+lean,top+1,'#b4dce5');
    }else if(id==='kimi'){
      if(!back){r.poly([[10+lean,top+1],[14+lean,top+1],[15,hem],[8,hem]],'#dedbea');r.line(11+lean,top+2,13+lean,top+2,p.dark);}
      else{r.rect(8,top+1,7,5,p.dark);r.dot(10,top+2,'#ddd6ec');r.dot(14,top+4,'#b6bbdc');}
      r.line(7,hem,16,hem,p.accent);
    }else if(id==='doubao'){
      r.rect(side?9+lean:7,top,side?3:2,3,WHITE);if(!side)r.rect(15,top,2,3,WHITE);
      if(!back){r.rect(10+lean,top+3,4,3,'#61636b');r.dot(12+lean,top+3,p.accent);}else{r.line(9,top+1,14,top+5,p.dark);r.line(14,top+1,9,top+5,p.dark);}
      r.line(8,hem,16,hem,p.dark);
    }
  }
  function armBack(r,id,p,side,back,bob,lean,state,phase){
    var y=19+bob,swing=[-2,-1,1,2,1,-1][phase%6],run=state==='run',moving=run||state==='walk';
    if(side){
      var sx=10+lean;
      if(moving){var ex=sx-swing*(run?1.3:1),ey=y+2-(run?1:0),hx=ex-(run?2:1),hy=y+4-Math.abs(swing)*.5;limb(r,[sx,y],[ex,ey],[hx,hy],p.dark,SKIN_D);}
      else limb(r,[sx,y],[sx-2,y+2],[sx-2,y+4],p.dark,SKIN_D);
    }else if(back){limb(r,[7,y],[5,y+2],[5,y+4],p.dark,SKIN_D);}
  }
  function head(r,id,p,side,back,bob,lean,state,phase){
    var y=5+bob, hx=lean, blink=state==='nap'||state==='idle'&&phase===1, happy=state==='wave'||state==='cheer';
    r.poly([[6+hx,y],[17+hx,y],[20+hx,y+3],[20+hx,y+10],[17+hx,y+13],[7+hx,y+13],[4+hx,y+10],[4+hx,y+4]],p.hair);
    r.line(7+hx,y+1,15+hx,y+1,p.light);r.line(5+hx,y+4,5+hx,y+9,p.shade);
    if(back){
      // Rear silhouette: crown, braid/parting, reflected hair streaks, zero face pixels.
      r.poly([[7+hx,y+3],[17+hx,y+2],[18+hx,y+11],[14+hx,y+13],[7+hx,y+12]],p.hair);
      r.line(9+hx,y+3,8+hx,y+9,p.light);r.line(16+hx,y+4,16+hx,y+11,p.shade);
      if(id==='doubao')r.line(6+hx,y+12,18+hx,y+12,p.shade);
      else if(id==='grok'){r.rect(5+hx,y+4,2,2,p.dark);r.rect(17+hx,y+4,2,2,p.dark);}
      else{r.rect(10+hx,y+11,4,2,p.shade);r.dot(12+hx,y+13,p.light);}
    }else if(side){
      // A soft three-quarter face: both eyes remain visible, the far eye is
      // narrower, and the cheek turns towards the walking direction.
      r.poly([[9+hx,y+5],[16+hx,y+4],[19+hx,y+7],[19+hx,y+10],[17+hx,y+13],[11+hx,y+13],[7+hx,y+10],[7+hx,y+7]],SKIN);
      r.line(8+hx,y+9,10+hx,y+12,SKIN_D);
      r.dot(7+hx,y+9,SKIN_D);r.dot(8+hx,y+9,SKIN);
      if(blink){r.line(9+hx,y+9,11+hx,y+9,INK);r.line(15+hx,y+10,18+hx,y+10,INK);}
      else if(happy){
        r.dot(10+hx,y+8,INK);r.dot(11+hx,y+9,INK);
        r.line(15+hx,y+9,16+hx,y+8,INK);r.dot(17+hx,y+9,INK);
      }else{
        r.rect(10+hx,y+8,1,3,INK);r.dot(10+hx,y+8,WHITE);r.dot(10+hx,y+10,p.eye);
        r.rect(15+hx,y+8,3,3,INK);r.rect(16+hx,y+9,2,2,id==='gemini'?'#ceab55':p.eye);
        r.dot(15+hx,y+8,WHITE);r.dot(16+hx,y+8,WHITE);
      }
      r.dot(18+hx,y+10,'#edbaa9');r.dot(9+hx,y+11,'#edb1ad');r.dot(18+hx,y+11,'#edb1ad');
      r.dot(15+hx,y+12,'#a96678');if(state==='talk'&&phase!==1)r.dot(16+hx,y+12,'#a96678');
      r.poly([[6+hx,y+6],[8+hx,y+2],[15+hx,y+2],[18+hx,y+4],[19+hx,y+7],[16+hx,y+6],[15+hx,y+5],[13+hx,y+8],[12+hx,y+5],[10+hx,y+6],[8+hx,y+9],[6+hx,y+10]],p.hair);
      r.line(8+hx,y+3,12+hx,y+2,p.light);r.line(6+hx,y+5,6+hx,y+9,p.shade);
    }else{
      r.poly([[7+hx,y+6],[16+hx,y+5],[18+hx,y+8],[17+hx,y+11],[15+hx,y+13],[8+hx,y+13],[6+hx,y+10]],SKIN);
      r.line(7+hx,y+10,8+hx,y+12,SKIN_D);r.rect(8+hx,y+8,2,3,blink?SKIN:INK);r.rect(14+hx,y+8,2,3,blink?SKIN:INK);
      if(blink){r.rect(7+hx,y+9,3,1,INK);r.rect(14+hx,y+9,3,1,INK);}
      else if(happy){r.dot(7+hx,y+9,INK);r.dot(8+hx,y+8,INK);r.dot(14+hx,y+8,INK);r.dot(15+hx,y+9,INK);r.dot(8+hx,y+10,SKIN);r.dot(14+hx,y+10,SKIN);}
      else{r.dot(8+hx,y+8,WHITE);r.dot(14+hx,y+8,WHITE);r.dot(9+hx,y+10,p.eye);r.dot(15+hx,y+10,id==='gemini'?'#ceab55':p.eye);}
      r.dot(7+hx,y+11,'#eab0af');r.dot(16+hx,y+11,'#eab0af');
      r.dot(12+hx,y+12,'#a96678');if(state==='talk'&&phase!==1)r.dot(11+hx,y+12,'#a96678');
      r.poly([[7+hx,y+3],[16+hx,y+3],[18+hx,y+6],[16+hx,y+8],[14+hx,y+6],[12+hx,y+9],[11+hx,y+6],[8+hx,y+8],[6+hx,y+7]],p.hair);
      r.line(8+hx,y+4,11+hx,y+3,p.light);
    }
    // Character-specific head silhouettes and sparse accessories.
    if(id==='gpt'){
      r.poly([[6+hx,y+1],[5+hx,y-3],[7+hx,y-3],[8+hx,y],[8+hx,y+2]],p.light);
      r.poly([[16+hx,y+1],[17+hx,y-3],[19+hx,y-3],[18+hx,y],[18+hx,y+2]],p.light);
      if(!back)star(r,(side?6:18)+hx,y+5,p.dark);
    }else if(id==='deepseek'){
      r.line(5+hx,y+3,8+hx,y-1,WHITE,2);r.line(8+hx,y-1,16+hx,y-1,WHITE,2);r.line(16+hx,y-1,19+hx,y+3,WHITE,2);
      r.dot(9+hx,y-2,p.accent);r.dot(13+hx,y-2,p.accent);
      r.poly([[5+hx,y+9],[2+hx,y+11],[5+hx,y+12],[7+hx,y+10]],p.light);
      if(!side)r.poly([[18+hx,y+9],[21+hx,y+11],[18+hx,y+12],[16+hx,y+10]],p.light);
    }else if(id==='claude'){
      star(r,(side?7:18)+hx,y+3,'#edba74');r.dot((side?7:18)+hx,y+3,'#825540');
      r.rect((side?7:18)+hx,y+5,1,4,p.dark);
    }else if(id==='grok'){
      r.poly([[4+hx,y+4],[2+hx,y],[5+hx,y+1],[7+hx,y+4]],p.dark);
      if(!side)r.poly([[17+hx,y+3],[21+hx,y],[20+hx,y+4]],p.dark);
    }else if(id==='gemini'){
      r.poly([[5+hx,y+1],[5+hx,y-3],[10+hx,y]],p.hair);r.dot(6+hx,y-2,'#e7b2cd');
      r.poly([[15+hx,y],[19+hx,y-3],[20+hx,y+2]],p.hair);r.dot(18+hx,y-2,'#e7b2cd');
      star(r,(side?7:18)+hx,y+5,'#cbb3e9');
    }else if(id==='kimi'){
      r.line(6+hx,y+1,8+hx,y-1,WHITE,2);r.line(8+hx,y-1,15+hx,y-1,WHITE,2);
      r.rect((side?7:17)+hx,y+2,3,3,p.dark);r.dot((side?7:17)+hx,y+2,'#e9d598');r.dot((side?6:16)+hx,y+3,'#e9d598');r.dot((side?7:17)+hx,y+4,'#e9d598');
    }else if(id==='doubao'&&!back){
      r.poly([[6+hx,y+6],[8+hx,y+2],[14+hx,y+1],[18+hx,y+4],[19+hx,y+7],[15+hx,y+4],[12+hx,y+4],[9+hx,y+6]],p.hair);
      r.line(7+hx,y+4,12+hx,y+1,p.light);
    }
  }
  function armFront(r,id,p,side,back,bob,lean,state,phase){
    var i=phase%8,y=19+bob,sx=side?13+lean:16;
    var ease=[0,.5,1,.5,0,-.5,-1,-.5][i];
    if(state==='work'){
      var leftTap=[0,-1,-.5,.5,1,.5,0,-.5][i],rightTap=[1,.5,0,-.5,-1,-.5,.5,1][i];
      if(side){
        limb(r,[sx,y],[16+lean,y+1+leftTap*.5],[19+ease,y+leftTap],p.cloth,SKIN);
        r.rect(18,y+1,5,1,'#8c8aab');
      }else{
        limb(r,[7,y],[6.5-ease*.3,y+2],[10+ease*.5,y+leftTap],p.cloth,SKIN);
        limb(r,[16,y],[17+ease*.3,y+2],[13-ease*.5,y+rightTap],p.cloth,SKIN);
        r.rect(8,y+2,9,1,'#8c8aab');
      }
    }else if(state==='wave'||state==='cheer'){
      var cheer=state==='cheer',handX=(cheer?[18,19,20,21,20,21,19,18]:[18,19,20,21,20,19,20,19])[i];
      var handY=(cheer?[18,14,10,8,11,9,13,17]:[18,15,12,10,11,10,12,16])[i]+bob;
      limb(r,[sx,y],[18+ease*.5,y-1-Math.max(0,17-handY)*.25],[handX,handY],p.cloth,SKIN);
      r.dot(handX,handY-1,SKIN);if(i>1&&i<6)r.dot(handX+1,handY-2,SKIN);
      if(!side){
        if(cheer)limb(r,[7,y],[5-ease*.5,y-1],[5-ease,handY+1],p.cloth,SKIN);
        else limb(r,[7,y],[5,y+2],[5+ease*.5,y+4],p.cloth,SKIN);
      }
    }else if(state==='talk'){
      var tx=(side?20:19)+[0,.5,1,.5,0,-.5,0,-.5][i],ty=y+[2,0,-2,-1,1,3,2,3][i];
      limb(r,[sx,y],[sx+2+ease*.5,y+1],[tx,ty],p.cloth,SKIN);r.dot(tx+1,ty,SKIN);
      if(!side)limb(r,[7,y],[5.5-ease*.5,y+2],[6+ease*.5,y+3],p.cloth,SKIN);
    }else if(state==='read'){
      var bx=(side?16:9)+[0,0,0,.5,.5,0,-.5,0][i],by=y+1+[0,0,-.5,-.5,0,.5,.5,0][i];
      r.rect(bx,by,7,6,'#74483f');r.rect(bx+1,by+1,5,4,'#ba8a62');r.line(bx+3,by+1,bx+3,by+4,'#6b514d');
      if(i===3)r.poly([[bx+5,by+1],[bx+6,by+2],[bx+4,by+5]],'#eee2c4');
      if(i===4)r.poly([[bx+3,by+1],[bx+5,by+2],[bx+3,by+5]],'#eee2c4');
      if(i===5)r.rect(bx+1,by+1,2,4,'#eee2c4');
      limb(r,[sx,y],[sx+1+ease*.3,y+3],[bx+5,by+4],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[6-ease*.3,y+3],[bx,by+4],p.cloth,SKIN);
    }else if(state==='coffee'){
      var cx=(side?19:17)+[0,.5,.5,0,0,-.5,-.5,0][i],cy=[20,19,17,15,14,15.5,17.5,19.5][i]+bob;
      limb(r,[sx,y],[sx+2+ease*.5,y+1],[cx-1,cy+1],p.cloth,SKIN);
      r.rect(cx,cy,3,3,WHITE);r.rect(cx+3,cy+1,1,1,p.accent);r.rect(cx,cy,3,1,'#80584a');
      if(i!==3&&i!==4)r.dot(cx+1+ease*.5,cy-2-(i%2)*.5,'#beb3cd');
      if(!side)limb(r,[7,y],[5,y+2],[6+ease*.5,y+4],p.cloth,SKIN);
    }else if(state==='nap'){
      limb(r,[sx,y],[17+ease*.5,y+3],[10+ease*.5,y+3+ease*.5],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[6-ease*.5,y+3],[14,y+3],p.cloth,SKIN);
    }else if(state==='carry'){
      var lift=[0,-.5,-1,-.5,0,.5,1,.5][i],trayX=14+ease*.5;
      limb(r,[sx,y],[sx+1+ease*.5,y+2],[16+ease*.5,y+2+lift],p.cloth,SKIN);
      r.rect(trayX,y+1+lift,7,2,'#f1e8cf');r.rect(trayX+1,y+3+lift,5,2,p.accent);
      if(!side)limb(r,[7,y],[6-ease*.5,y+3],[trayX,y+2+lift],p.cloth,SKIN);
    }else if(state==='sit'){
      limb(r,[sx,y],[sx+1+ease*.5,y+2],[sx+[0,.5,1,1.5,2,1,.5,0][i],y+[5,4.5,4,3,3.5,4,4.5,5][i]],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[5-ease*.5,y+2],[6-ease*.5,y+4],p.cloth,SKIN);
    }else{
      if(side)limb(r,[sx,y],[sx+1+ease*.5,y+2],[sx+ease*.5,y+5],p.cloth,SKIN);
      else{limb(r,[7,y],[5-ease*.5,y+2],[6-ease*.5,y+4],p.cloth,SKIN);limb(r,[16,y],[18+ease*.5,y+2],[17+ease*.5,y+4],p.cloth,SKIN);}
    }
  }
  function signatureGesture(r,id,p,side,back,bob,lean,state,i,layer){
    var cx=side?17:12,py=20+bob,n,f,prop=function(){},t=[0,.5,1,.5,0,-.5,-1,-.5][i];
    function at(points){return[points[i][0],points[i][1]+bob];}
    function book(x,y,w,h){r.rect(x,y,w,h,'#80584a');r.rect(x+.5,y+.5,w-1,h-1,'#c5a575');r.line(x+w/2,y+1,x+w/2,y+h-1,p.dark);}
    function paper(x,y,w,h){r.rect(x,y,w,h,'#c5a575');r.rect(x+.5,y+.5,w-1,h-1,WHITE);for(var k=2;k<h-1;k+=2)r.line(x+1,y+k,x+w-2,y+k,p.shade);}
    function fish(x,y){r.poly([[x-2,y],[x,y-1],[x+2,y],[x+3,y-1],[x+3,y+1],[x+2,y],[x,y+1]],p.accent);r.dot(x-1,y,INK);}
    function cookie(x,y){r.poly([[x-1,y-2],[x+1,y-2],[x+2,y-1],[x+2,y+1],[x+1,y+2],[x-1,y+2],[x-2,y+1],[x-2,y-1]],'#c5a575');r.dot(x-1,y-1,'#80584a');r.dot(x+1,y,'#80584a');r.dot(x,y+1,'#80584a');}
    switch(state){
      case'gpt_think':
        n=at([[17,23],[17,21],[16,18],[16,17],[17,17],[17,18],[16,20],[16,22]]);f=[cx-3,24+bob];
        prop=function(){paper(cx-4,21+bob,5,5);r.line(cx-3,23+bob,cx-1,23+bob,p.accent);if(i>2&&i<6)star(r,cx+4,13+bob,p.accent);};break;
      case'gpt_wings':
        n=at([[17,23],[18,21],[19,19],[20,17],[21,16],[20,18],[19,20],[18,22]]);f=at([[6,23],[5,21],[4,19],[3,17],[2,16],[3,18],[4,20],[5,22]]);break;
      case'gpt_tea':
        py=[24,23,22,21,21,22,23,24][i]+bob;n=[cx+3,py+1];f=[cx-3,py+1];
        prop=function(){r.rect(cx-4,py,9,1,'#c5a575');r.rect(cx-2,py-2,3,2,WHITE);r.rect(cx-1,py-2,2,1,'#80584a');r.dot(cx+1,py-1,p.accent);r.rect(2,18+[0,-.5,-1,-1.5,-1,-.5,0,.5][i]+bob,2,2,WHITE);};break;
      case'deepseek_fish':
        n=at([[17,24],[18,21],[18,18],[16,20],[14,21],[14,22],[16,21],[15,23]]);f=at([[7,24],[6,24],[7,23],[8,22],[9,22],[8,23],[7,24],[7,23]]);
        prop=function(){if(i<3)fish(n[0]+1,n[1]-1);else if(i===3||i===6)fish(n[0]-1,n[1]);if(i===4||i===5)r.line(n[0]-2,n[1],n[0]+1,n[1],p.dark);};break;
      case'deepseek_bowl':
        py=[24,23,22,21,20,21,23,24][i]+bob;n=[cx+3,py+1];f=[cx-3,py+1];
        prop=function(){r.poly([[cx-4,py-1],[cx+4,py-1],[cx+3,py+3],[cx-2,py+3]],WHITE);r.line(cx-3,py+2,cx+2,py+2,p.accent);r.line(cx-3,py-1,cx+3,py-1,p.dark);for(var k=-2;k<3;k+=2)r.dot(cx+k,py-2,WHITE);if(i>1&&i<6){r.line(cx+2,py-3,cx+4,py-6,'#c5a575');r.line(cx+3,py-3,cx+5,py-6,'#80584a');r.dot(cx+4,py-5,WHITE);}};break;
      case'deepseek_tail':
        n=at([[17,24],[19,21],[20,18],[19,20],[21,21],[20,19],[18,22],[17,23]]);f=at([[7,24],[5,21],[4,18],[5,20],[3,21],[4,19],[6,22],[7,23]]);break;
      case'claude_soul':
        n=at([[17,24],[18,25],[18,26],[17,27],[16,27],[17,26],[18,25],[17,23]]);f=at([[7,24],[6,25],[6,26],[7,27],[8,27],[7,26],[6,25],[7,23]]);break;
      case'claude_scroll':
        var spread=[2,3,4,5,6,5,3,2][i];if(side)spread=Math.min(5,spread);py=[23,22,21,20,20,21,22,23][i]+bob;n=[cx+(side?Math.min(4,spread):spread),py+1];f=[cx-spread,py+1];
        prop=function(){paper(cx-spread,py-1,spread*2+1,5);r.rect(cx-spread,py-2,1,7,'#80584a');r.rect(cx+spread,py-2,1,7,'#80584a');};break;
      case'claude_reconnect':
        n=at([[17,25],[18,24],[19,22],[19,20],[18,19],[17,19],[16,21],[17,23]]);f=at([[7,25],[8,24],[10,23],[12,22],[13,21],[11,22],[9,23],[7,24]]);
        prop=function(){r.line(n[0],n[1]+1,22,25+bob,p.dark);r.line(22,25+bob,21,28+bob,p.dark);r.line(21,28+bob,17,28+bob,p.dark);r.rect(n[0]-1,n[1]-1,2,2,p.dark);r.dot(n[0],n[1]-2,i>3?p.accent:'#c5a575');r.dot(n[0]+1,n[1]-2,WHITE);};break;
      case'grok_axe':
        n=[side?18.5:17,20+bob+[2,1,0,-1,-.5,0,1,2][i]];f=at([[7,24],[7,22],[9,21],[11,21],[10,22],[9,23],[8,24],[7,24]]);
        prop=function(){var a=[.4,-.4,-1.2,-2,-2.8,-3.6,-4.4,-5.2][i],vx=Math.cos(a),vy=Math.sin(a),ex=n[0]+vx*3.5,ey=n[1]+vy*3.5;r.line(n[0]-vx*2,n[1]-vy*2,ex,ey,'#80584a');r.poly([[ex-vy*2,ey+vx*2],[ex+vx*1.5-vy*1.5,ey+vy*1.5+vx*1.5],[ex+vx*2,ey+vy*2],[ex+vx*1.5+vy*1.5,ey+vy*1.5-vx*1.5],[ex+vy*2,ey-vx*2]],'#9bcbd0');r.line(ex-vy,ey+vx,ex+vy,ey-vx,WHITE);};break;
      case'grok_smirk':
        n=at([[17,24],[19,22],[20,20],[21,19],[20,20],[21,21],[19,23],[17,24]]);f=at([[8,23],[8,22],[8,21],[8,22],[8,23],[8,22],[8,21],[8,23]]);break;
      case'grok_spark':
        n=at([[17,24],[19,22],[20,19],[21,15],[20,12],[21,16],[19,21],[17,23]]);f=at([[7,24],[6,23],[5,22],[4,21],[5,20],[6,22],[7,23],[7,24]]);
        prop=function(){if(i>0&&i<7){var top=[23,20,16,10,7,12,19,23][i]+bob;r.poly([[21,top],[23,top-2],[21,top+3],[23,top+2],[20,top+8],[21,top+4],[19,top+5]],'#c5a575');r.dot(22,top+1,WHITE);}};break;
      case'gemini_stars':
        n=at([[17,24],[19,21],[20,17],[18,15],[16,18],[19,20],[20,22],[17,24]]);f=at([[7,24],[5,21],[4,17],[6,15],[9,18],[6,20],[5,22],[7,24]]);
        prop=function(){if(i<7){r.line(f[0],f[1]-1,cx,17+bob+t,p.accent);r.line(cx,17+bob+t,n[0],n[1]-1,p.light);star(r,cx,17+bob+t,'#c5a575');if(i>1&&i<6){star(r,f[0]+1,f[1]-2,p.light);star(r,n[0]-1,n[1]-2,p.light);}}};break;
      case'gemini_twins':
        n=at([[14,22],[15,21],[17,20],[19,18],[20,17],[19,19],[17,21],[14,22]]);f=at([[10,22],[9,21],[7,20],[5,18],[4,17],[5,19],[7,21],[10,22]]);break;
      case'gemini_tail':
        n=at([[17,23],[17,25],[15,26],[11,26],[7,22],[5,22],[9,24],[15,23]]);f=at([[7,23],[5,24],[4,26],[3,24],[4,22],[5,20],[6,22],[7,23]]);break;
      case'kimi_moon':
        py=[24,23,21,19,17,20,22,24][i]+bob;n=[cx+2,py+2];f=[cx-2,py+2];
        prop=function(){r.poly([[cx+1,py-3],[cx-1,py-2],[cx-2,py],[cx-1,py+2],[cx+1,py+3],[cx+3,py+2],[cx+1,py+1],[cx,py],[cx,py-1]],'#c5a575');r.line(cx-1,py-1,cx-1,py+1,WHITE);};break;
      case'kimi_notes':
        py=21+bob;f=[cx-2,py];n=[cx+2+[0,1,2,1,0,-1,1,0][i]*.5,py+[1,1.5,2,3,3.5,2.5,1.5,1][i]];
        prop=function(){var len=[3,5,6,8,9,7,5,3][i];paper(cx-2,py-1,5,len);r.rect(cx-2,py+len-1,5,1,p.accent);r.line(n[0]-1,n[1]+1,n[0]+2,n[1]-2,'#c5a575');};break;
      case'kimi_search':
        py=23+bob;f=[cx-3,py+2];n=[cx+[3,4,3,5,4,2,3,3][i],py+[-1,-4,-7,-6,-5,-3,-1,0][i]];if(side)n[0]=Math.min(20,n[0]);
        prop=function(){book(cx-4,py,8,4);r.rect(n[0]-1,n[1]-3,3,3,p.accent);r.rect(n[0],n[1]-2,1,1,WHITE);r.line(n[0]+1,n[1],n[0]+2,n[1]+2,'#c5a575');};break;
      case'doubao_cookie':
        n=at([[17,24],[17,22],[18,21],[19,20],[20,19],[20,20],[18,22],[17,24]]);f=[cx-3,25+bob];
        prop=function(){r.rect(cx-4,23+bob,5,4,'#c5a575');r.line(cx-4,23+bob,cx,23+bob,p.accent);if(i>0&&i<7){r.line(cx-4,22+bob,cx-1,21+bob,'#80584a');cookie(n[0]+1,n[1]-1);}else r.line(cx-4,24+bob,cx,24+bob,'#80584a');};break;
      case'doubao_drool':
        n=at([[17,24],[18,25],[18,26],[17,27],[16,27],[17,25],[17,19],[17,23]]);f=at([[7,24],[6,25],[6,26],[7,27],[8,27],[7,26],[6,25],[7,24]]);break;
      case'doubao_idea':
        n=at([[17,24],[18,20],[18,15],[17,12],[21,12],[20,16],[18,21],[17,24]]);f=at([[7,24],[6,23],[5,22],[5,21],[4,17],[5,20],[6,23],[7,24]]);break;
      default:return;
    }
    // Some side silhouettes are foreshortened, but each arm still has its own
    // elbow path and reaches an actual hand-held prop, not a renamed idle pose.
    var ns=[side?13+lean:16,19+bob],fs=[side?10+lean:7,19+bob];
    var bend=[.5,1,1.5,1,.5,0,-.5,0][i];
    function arm(s,h,far){var ex=s[0]+(h[0]-s[0])*.48+(far?-bend:bend)*.35,ey=Math.max(s[1],h[1])+(h[1]<s[1]?-2:1);limb(r,s,[ex,ey],h,far?p.dark:p.cloth,far?SKIN_D:SKIN);}
    if(layer==='far'){arm(fs,f,true);return;}
    if(state!=='grok_axe'&&state!=='grok_spark'&&state!=='kimi_moon')prop();arm(ns,n,false);r.rect(f[0],f[1],1.5,1.5,SKIN_D);
    if(state==='grok_smirk'&&i>1&&i<6)r.line(n[0],n[1],n[0]+1,n[1],SKIN);
    if(state==='doubao_idea'&&i===4)r.line(n[0],n[1],n[0],n[1]-2,SKIN);
  }
  function nativeSignatureProp(state,side,bob,i,back){
    if(state!=='grok_axe'&&state!=='grok_spark'&&state!=='kimi_moon')return null;
    var r=new Raster(W,H),outline=new Raster(W,H);
    if(state==='grok_axe'){
      var a=[.4,-.4,-1.2,-2,-2.8,-3.6,-4.4,-5.2][i],vx=Math.cos(a),vy=Math.sin(a),nx=-vy,ny=vx;
      var px=side?37:34,py=(20+bob+[2,1,0,-1,-.5,0,1,2][i])*2,ex=px+vx*5,ey=py+vy*5;
      function pt(n,v){return[ex+nx*n+vx*v,ey+ny*n+vy*v];}
      r.line(px-vx*4,py-vy*4,ex,ey,'#80584a',2);
      r.poly([pt(-4,-1),pt(-5,3),pt(4,3),pt(5,0),pt(2,-2),pt(-2,-2)],'#9bcbd0');
      var edgeA=pt(-4,2),edgeB=pt(3,2);r.line(edgeA[0],edgeA[1],edgeB[0],edgeB[1],WHITE);
      r.dot(ex,ey,'#53617c');
    }else if(state==='grok_spark'){
      if(i===0||i===7)return null;
      var y=[40,34,25,15,8,21,32,40][i]+bob*2;
      r.poly([[44,y],[40,y+7],[43,y+6],[40,y+14],[46,y+4],[43,y+5]],'#9bcbd0');
      r.line(43,y+2,41,y+6,WHITE);r.line(43,y+7,41,y+11,WHITE);
    }else{
      var cx=(side?17:12)*2,cy=([24,23,21,19,17,20,22,24][i]+bob)*2-1;
      // A real open crescent: the hollow shows the layers behind it, with a
      // one-pixel inner rim separating moonlight from palms and pale skin.
      for(var y=-7;y<=7;y++)for(var x=-7;x<=7;x++){
        if(x*x+y*y<=39&&(x-3)*(x-3)+(y+2)*(y+2)>30)r.dot(cx+x,cy+y,WHITE);
      }
      for(var y=-3;y<=3;y++)if(r.rows[Math.round(cy+y)]&&r.rows[Math.round(cy+y)][Math.round(cx-5)])r.dot(cx-5,cy+y,'#c5a575');
    }
    for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(!r.rows[y][x]&&((x&&r.rows[y][x-1])||(x<W-1&&r.rows[y][x+1])||(y&&r.rows[y-1][x])||(y<H-1&&r.rows[y+1][x])))outline.dot(x,y,INK);
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(r.rows[yy][xx])outline.dot(xx,yy,r.rows[yy][xx]);
    return outline;
  }
  function copyNative(target,layer){if(layer)for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(layer.rows[y][x])target.dot(x,y,layer.rows[y][x]);}
  function signatureFaceState(state,i){
    if(state==='claude_soul')return i>0&&i<7?'nap':'idle';
    if(state==='claude_reconnect')return i<4?'nap':i>5?'wave':'idle';
    if(state==='doubao_drool')return i>1&&i<6?'nap':'idle';
    if(state==='gpt_wings'&&i>1&&i<6||state==='doubao_idea'&&i>3&&i<6||state==='doubao_cookie'&&i>2&&i<6)return'wave';
    return state;
  }
  function signatureEffects(r,id,p,side,back,bob,lean,state,i,headBob){
    var hx=lean*2,hy=(5+headBob)*2,t=[0,-1,-2,-1,0,1,2,1][i];
    function sparkle(x,y,c){r.line(x,y-2,x,y+2,c);r.line(x-2,y,x+2,y,c);r.dot(x,y,WHITE);}
    if(state==='claude_soul'&&i>0&&i<7){
      var gy=[0,12,8,4,3,7,13,0][i],gx=24+[-1,-2,-1,0,2,1,0,-1][i];
      r.poly([[gx-3,gy+1],[gx-1,gy-1],[gx+2,gy],[gx+4,gy+3],[gx+3,gy+8],[gx+1,gy+7],[gx-1,gy+9],[gx-3,gy+7]],'#d5b4d9');
      r.line(gx-2,gy+1,gx,gy,WHITE);if(!back){r.dot(gx-1,gy+3,p.dark);r.dot(gx+2,gy+3,p.dark);r.dot(gx+1,gy+5,WHITE);}if(i>1&&i<6)r.line(gx,gy+10,gx-1,gy+12,'#d5b4d9');
    }else if(state==='claude_reconnect'&&i>3){
      var x=43,y=12;for(var k=0;k<3;k++)if(k<Math.min(3,i-3))r.rect(x-4+k*2,y-k*2,1,3+k*2,p.accent);if(i===6)sparkle(5,16,WHITE);
    }else if(state==='deepseek_tail'){
      var h=[0,1,2,7,10,7,3,1][i];if(h){r.line(1,60,10,60,'#9bcbd0');r.line(3,60,1,60-h,'#9bcbd0');r.line(7,60,10,60-h*.7,p.accent);r.dot(12,58-h*.5,p.light);r.dot(1,57-h*.7,WHITE);}
    }else if(state==='gemini_twins'){
      var spread=[1,2,4,6,7,6,4,2][i],y=31+t;
      [24-spread*3,24+spread*3].forEach(function(x,j){x=Math.max(4,Math.min(43,x));sparkle(x,y+(j?t:-t),j?p.accent:p.light);if(i>1&&i<7){r.rect(x-2,y+4,5,3,j?p.light:p.accent);r.dot(x-2,y+7,p.shade);r.dot(x+2,y+7,p.shade);if(!back){r.dot(x-1,y+4,p.dark);r.dot(x+1,y+4,p.dark);}}});
    }else if(state==='doubao_idea'&&i>1&&i<7){
      var x=42,y=8+(i===2?2:0);r.poly([[x-2,y],[x,y-2],[x+2,y],[x+2,y+3],[x+1,y+5],[x-1,y+5],[x-2,y+3]],'#c5a575');r.rect(x-1,y+5,3,2,p.dark);r.dot(x-1,y,WHITE);if(i>2&&i<6){r.dot(x-4,y-1,WHITE);r.dot(x+4,y-1,WHITE);r.dot(x,y-4,WHITE);}
    }
    if(!back){
      if(state==='doubao_drool'&&i>1&&i<7){var mx=(side?31:25)+hx,my=hy+26,len=[0,0,1,3,5,4,1,0][i];r.line(mx,my,mx,my+len,'#9bcbd0');r.dot(mx-1,my+len,'#9bcbd0');r.dot(mx,my+len+1,WHITE);}
      if(state==='grok_smirk'&&i>1&&i<7){var x=(side?30:28)+hx,y=hy+13;r.line(x-1,y,x+4,y-1,p.shade);r.line((side?28:23)+hx,hy+25,(side?32:27)+hx,hy+24,p.accent);if(i===3||i===4)r.line((side?20:15)+hx,hy+18,(side?23:19)+hx,hy+18,p.dark);}
    }
  }
  function mix(a,b,t){
    var out='#';for(var i=1;i<7;i+=2){var n=Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t);out+=n.toString(16).padStart(2,'0');}return out;
  }
  function refine(r,id,p,side,back,headBob,lean,state,phase,bob,trail){
    var hx=lean*2,hy=(5+headBob)*2,by=(18+bob)*2;
    var hair=[p.hair,p.shade,p.light],cloth=back?[p.cloth,p.dark,p.accent]:[p.cloth,p.dark,p.accent,p.light,WHITE];
    var hairMid=mix(p.hair,p.light,.38),hairSoft=mix(p.hair,p.shade,.35),clothMid=mix(p.cloth,p.dark,.28);
    function has(x,y,colors){x=Math.round(x);y=Math.round(y);return y>=0&&y<H&&x>=0&&x<W&&colors.indexOf(r.rows[y][x])>=0;}
    function maskedLine(x1,y1,x2,y2,color,colors){
      x1=Math.round(x1);y1=Math.round(y1);x2=Math.round(x2);y2=Math.round(y2);
      var dx=Math.abs(x2-x1),sx=x1<x2?1:-1,dy=-Math.abs(y2-y1),sy=y1<y2?1:-1,err=dx+dy;
      for(;;){if(has(x1,y1,colors))r.dot(x1,y1,color);if(x1===x2&&y1===y2)break;var e=err*2;if(e>=dy){err+=dy;x1+=sx;}if(e<=dx){err+=dx;y1+=sy;}}
    }
    // Deliberately drawn one-pixel lock lines, rather than a noisy all-over texture.
    maskedLine(13+hx,hy+4,20+hx,hy+1,hairMid,hair);
    maskedLine(21+hx,hy+1,29+hx,hy+2,p.light,hair);
    maskedLine(30+hx,hy+3,35+hx,hy+8,hairMid,hair);
    maskedLine(10+hx,hy+9,9+hx,hy+17,hairSoft,hair);
    maskedLine(12+hx,hy+10,12+hx,hy+21,hairMid,hair);
    maskedLine(36+hx,hy+11,35+hx,hy+22,hairSoft,hair);
    if(id!=='doubao'){
      maskedLine(10+hx,hy+20,11-trail*2,44+bob*2,hairMid,hair);
      maskedLine(13+hx,hy+21,14-trail*2,49+bob*2,hairSoft,hair);
      maskedLine(35+hx,hy+19,33-trail*2,46+bob*2,p.light,hair);
      maskedLine(37+hx,hy+19,36-trail*2,50+bob*2,hairMid,hair);
      maskedLine(13-trail*2,45+bob*2,10-trail*2,49+bob*2,p.light,hair);
    }else{
      maskedLine(10+hx,hy+18,11+hx,hy+26,hairMid,hair);
      maskedLine(35+hx,hy+16,35+hx,hy+27,hairMid,hair);
      maskedLine(13+hx,hy+25,32+hx,hy+26,hairSoft,hair);
    }
    if(id==='grok'){
      maskedLine(6,hy+14,4-trail*2,hy+29,p.light,hair);
      maskedLine(42,hy+14,41-trail*2,hy+29,hairMid,hair);
      maskedLine(4-trail*2,hy+30,7-trail*2,hy+35,hairSoft,hair);
    }

    // Satiny folds, seams and individual hem stitches follow the moving torso.
    maskedLine(17+hx,by+4,16,by+11,clothMid,cloth);
    maskedLine(20+hx,by+6,19,by+13,mix(p.cloth,WHITE,.55),cloth);
    maskedLine(29+hx,by+6,32,by+13,clothMid,cloth);
    maskedLine(33+hx,by+5,35,by+12,p.dark,cloth);
    var hem=(state==='work'||state==='sit'?24:25)*2+bob*2;
    for(var sx=14;sx<35;sx+=4)if(has(sx,hem,cloth)){
      r.dot(sx,hem,mix(p.cloth,WHITE,.8));
      if(has(sx+1,hem-1,cloth))r.dot(sx+1,hem-1,mix(p.cloth,p.accent,.45));
    }
    if(!back){
      if(id==='gpt'){
        r.poly([[24+hx,by+1],[27+hx,by+4],[25+hx,by+8],[22+hx,by+5]],'#679e95');
        r.poly([[24+hx,by+2],[26+hx,by+4],[24+hx,by+6],[23+hx,by+4]],'#aee5d4');r.dot(24+hx,by+3,WHITE);
        maskedLine(16,by+10,19,hem-1,p.light,cloth);maskedLine(29,by+9,33,hem-1,p.light,cloth);
        [[16,hem-3],[31,hem-2]].forEach(function(v){if(has(v[0],v[1],cloth)){r.dot(v[0],v[1],p.dark);r.dot(v[0]-1,v[1]+1,p.light);r.dot(v[0]+1,v[1]+1,p.light);}});
      }else if(id==='deepseek'){
        r.poly([[23+hx,by],[18+hx,by+1],[21+hx,by+4],[24+hx,by+2],[29+hx,by+4],[31+hx,by],[26+hx,by]],'#759bc9');
        r.rect(24+hx,by+1,2,2,'#e7c886');
        r.dot(23+hx,by+6,'#526999');r.dot(23+hx,by+9,'#526999');
        if(state!=='work'){
          r.rect(22,by+11,5,2,'#6ca1cf');r.dot(21,by+12,'#6ca1cf');r.dot(27,by+10,'#6ca1cf');r.dot(27,by+11,'#6ca1cf');
        }
        maskedLine(20+hx,by+5,18,hem-1,'#c4dbea',cloth);maskedLine(29+hx,by+5,31,hem-1,'#c4dbea',cloth);
        for(var lx=13;lx<36;lx+=3)if(has(lx,hem,cloth)){r.dot(lx,hem,WHITE);r.dot(lx,hem+1,'#c4d8e7');}
      }else if(id==='claude'){
        r.rect(23+hx,by+4,5,3,'#bd9668');r.rect(24+hx,by+5,3,1,'#3f3038');
        maskedLine(29+hx,by+7,32,hem-1,'#edba78',cloth);maskedLine(20+hx,by+8,18,hem-1,'#bda994',cloth);
        r.dot(33,hem-4,'#b06d45');r.dot(32,hem-3,'#e8bc7f');r.dot(34,hem-3,'#e8bc7f');r.dot(33,hem-2,'#b06d45');
      }else if(id==='grok'){
        r.line(22+hx,by+4,28+hx,by+7,'#d8ae78');r.line(28+hx,by+4,22+hx,by+7,'#a58969');
        r.line(22+hx,by+8,28+hx,by+11,'#d8ae78');r.line(28+hx,by+8,22+hx,by+11,'#a58969');
        maskedLine(15,by+9,13,hem,'#765466',cloth);maskedLine(30,by+10,35,hem,'#ca7890',cloth);
        r.dot(27+hx,by+2,'#f0d09a');
      }else if(id==='gemini'){
        var cx=25+hx,cy=by+3;r.line(cx,cy-2,cx,cy+2,'#d1dafa');r.line(cx-2,cy,cx+2,cy,'#b7d8f2');r.dot(cx,cy,WHITE);
        maskedLine(17,by+4,14,hem-1,'#ad95dd',cloth);maskedLine(31,by+4,35,hem-1,'#a3a6e3',cloth);
        r.line(17,hem-1,32,hem-1,'#bba6df');
      }else if(id==='kimi'){
        r.rect(23+hx,by+2,5,2,p.dark);r.dot(25+hx,by+3,'#d8cca3');
        for(var ky=by+5;ky<hem-1;ky+=3)r.dot(24+hx,ky,'#a9b5d7');
        [[17,by+8],[32,by+8],[15,hem-1],[34,hem-2]].forEach(function(v){if(has(v[0],v[1],cloth)){r.dot(v[0],v[1],'#d6d3e6');r.dot(v[0]+1,v[1]+1,'#a9b5d7');}});
        maskedLine(19,by+8,18,hem-1,'#b3adc9',cloth);maskedLine(29,by+8,30,hem-1,'#b3adc9',cloth);
      }else if(id==='doubao'){
        r.dot(20+hx,by+3,'#cfb58f');r.dot(29+hx,by+3,'#cfb58f');
        r.line(21+hx,by+8,27+hx,by+8,'#85818b');r.line(21+hx,by+8,21+hx,by+11,'#85818b');
        maskedLine(17,by+5,17,hem-1,'#686771',cloth);maskedLine(32,by+6,34,hem-1,p.dark,cloth);
      }
    }else{
      if(id==='deepseek'){maskedLine(21,by+5,28,by+9,WHITE,cloth);maskedLine(28,by+5,21,by+9,WHITE,cloth);}
      if(id==='kimi'){[[18,by+5],[26,by+8],[31,by+3]].forEach(function(v){if(has(v[0],v[1],cloth))r.dot(v[0],v[1],'#d0d4e9');});}
    }

    // Shoes and stockings receive fine highlights between the coarse gait joints.
    for(var fy=54;fy<H-1;fy++)for(var fx=1;fx<W-1;fx++){
      if(r.rows[fy][fx]===p.shoe&&r.rows[fy-1][fx]!==p.shoe&&fx%3===0)r.dot(fx,fy,mix(p.shoe,WHITE,.45));
      if(r.rows[fy][fx]===p.leg&&r.rows[fy][fx-1]!==p.leg&&fy%4===0)r.dot(fx,fy,mix(p.leg,WHITE,.4));
    }
    // Wings remain behind the torso; tail detail is authored on its own native layer.
    if(id==='gpt'){
      maskedLine(7,35+bob*2,15,44+bob*2,'#e5d8eb',[p.dark,p.shade]);
      maskedLine(5,38+bob*2,12,44+bob*2,'#998eb6',[p.dark,p.shade]);
    }

    // Repaint face features at native resolution. No face pixels are introduced
    // into the rear view; the near/far eyes keep the 45-degree orientation.
    if(!back){
      var faceColors=[SKIN,SKIN_D,INK,WHITE,p.eye,'#ceab55','#a96678','#edbaa9','#edb1ad','#eab0af'];
      var maxFaceX=state==='coffee'&&phase===1?(side?36:32):39+hx;
      for(var yy=hy+10;yy<=hy+25;yy++)for(var xx=12+hx;xx<=maxFaceX;xx++)if(has(xx,yy,faceColors)){
        var shade=yy>hy+22&&xx<22+hx?'#efbcae':xx<16+hx?'#f4c6b5':SKIN;r.dot(xx,yy,shade);
      }
      var faceState=actionOwner[state]?signatureFaceState(state,phase):state;
      var eyeY=hy+16,blink=faceState==='nap'||faceState==='idle'&&phase===1,happy=faceState==='wave'||faceState==='cheer';
      function eye(x,y,w,far,color){
        if(blink){r.line(x-1,y+2,x+w,y+2,'#725464');r.dot(x+w,y+1,'#725464');return;}
        if(happy){r.line(x-1,y+2,x+1,y,'#584151');r.line(x+1,y,x+w,y+2,'#584151');return;}
        r.rect(x,y,w,6,'#584151');r.rect(x,y+1,w,4,'#fff6ed');
        var irisW=far?2:3,pupilW=far?1:2;
        // Both eyes share one gaze: a three-quarter face looks toward its nose
        // and travel direction, while a front face looks straight ahead.
        var lookBack=state==='gemini_tail'&&phase>1&&phase<7;
        var ix=x+(side?(lookBack?0:w-irisW):Math.floor((w-irisW)/2));
        var px=x+(side?(lookBack?0:w-pupilW):Math.floor((w-pupilW)/2));
        var down=state==='read'?1:0;
        r.rect(ix,y+1,irisW,5,color);r.rect(px,y+1+down,pupilW,3-down,'#49384f');
        r.rect(x,y,w,1,'#49384f');r.dot(x-1,y,'#725464');
        r.dot(ix,y+1,WHITE);
        r.dot(ix+irisW-1,y+4,mix(color,WHITE,.6));r.dot(x+w-1,y+6,'#d7a09c');
      }
      if(side){
        eye(20+hx,eyeY,3,true,p.eye);eye(30+hx,eyeY,5,false,id==='gemini'?'#c29a46':p.eye);
        if(has(20+hx,eyeY-3,[SKIN,'#f4c6b5']))r.line(19+hx,eyeY-3,22+hx,eyeY-3,p.shade);
        if(has(30+hx,eyeY-3,[SKIN]))r.line(30+hx,eyeY-3,34+hx,eyeY-2,p.shade);
        r.dot(28+hx,hy+22,'#edb8a6');r.dot(29+hx,hy+22,'#f8d2bd');
        r.rect(17+hx,hy+23,3,1,'#eaa5a5');r.rect(35+hx,hy+23,2,1,'#eaa5a5');
        r.line(29+hx,hy+25,31+hx,hy+25,'#b47782');r.dot(30+hx,hy+26,'#f7c8bf');
        if(state==='talk'&&phase!==1)r.rect(30+hx,hy+24,2,2,'#a75f75');
      }else{
        eye(15+hx,eyeY,4,false,p.eye);eye(28+hx,eyeY,4,false,id==='gemini'?'#c29a46':p.eye);
        r.rect(13+hx,hy+23,3,1,'#eaa5a5');r.rect(33+hx,hy+23,3,1,'#eaa5a5');
        r.dot(24+hx,hy+22,'#f5bfa9');r.line(23+hx,hy+25,25+hx,hy+25,'#b47782');
        if(state==='talk'&&phase!==1)r.rect(24+hx,hy+24,2,2,'#a75f75');
      }
    }
    // Refined hair ornaments retain their original community identities.
    if(id==='gpt'){
      maskedLine(12+hx,hy-4,14+hx,hy+1,'#b7a5cc',hair);maskedLine(35+hx,hy-4,34+hx,hy+1,'#b7a5cc',hair);
      var rx=(side?6:18)*2+hx,ry=hy+10;if(!back){r.dot(rx-2,ry,'#fff8f1');r.dot(rx,ry-2,'#fff8f1');r.dot(rx+2,ry,'#fff8f1');r.dot(rx,ry+2,'#fff8f1');r.dot(rx,ry,p.shade);}
    }else if(id==='deepseek'){
      for(var mx=15;mx<=32;mx+=4){r.dot(mx+hx,hy-3,WHITE);r.dot(mx+hx+1,hy-2,'#d0d8e9');}
      maskedLine(12+hx,hy-1,17+hx,hy-4,'#d0d8e9',[WHITE]);
    }else if(id==='claude'){
      var sx=(side?7:18)*2+hx,sy=hy+6;
      [[0,-3],[2,-2],[3,0],[2,2],[0,3],[-2,2],[-3,0],[-2,-2]].forEach(function(v){r.dot(sx+v[0],sy+v[1],'#e8ad66');});
      r.rect(sx-1,sy-1,3,3,'#8f593a');r.dot(sx,sy,'#f4d18d');
      r.line(sx,sy+5,sx-1,sy+10,'#4d3440');
    }else if(id==='grok'){
      [[8+hx,hy+8],[37+hx,hy+7]].forEach(function(v){if(has(v[0],v[1],[p.dark,p.hair,p.shade])){r.line(v[0]-2,v[1],v[0]+2,v[1],p.dark);r.dot(v[0],v[1],'#caa773');}});
    }else if(id==='gemini'){
      r.dot(12+hx,hy-4,'#efc8d7');r.dot(13+hx,hy-3,'#cc96b7');r.dot(36+hx,hy-4,'#efc8d7');
      var gx=(side?7:18)*2+hx,gy=hy+10;r.line(gx,gy-3,gx,gy+3,'#e4d2f5');r.line(gx-2,gy,gx+2,gy,'#beb4ec');r.dot(gx,gy,WHITE);
    }else if(id==='kimi'){
      var kx=(side?7:17)*2+hx,ky=hy+4;
      r.rect(kx-2,ky-1,6,5,p.dark);r.line(kx+1,ky-1,kx-1,ky+1,'#e2d4a4');r.line(kx-1,ky+1,kx+1,ky+3,'#e2d4a4');r.dot(kx+2,ky+3,'#e2d4a4');
      r.line(kx+1,ky+6,kx+2,ky+10,'#c0b7d5');r.dot(kx+2,ky+11,WHITE);
    }else if(id==='doubao'){
      maskedLine(14+hx,hy+7,23+hx,hy+2,hairMid,hair);maskedLine(17+hx,hy+8,26+hx,hy+3,p.light,hair);
      maskedLine(33+hx,hy+8,36+hx,hy+15,hairSoft,hair);
    }
    // Fine prop surfaces are clipped to their original colours so hands stay in front.
    if(!back&&(state==='read'||id==='claude'&&state==='idle'&&phase===5)){
      var bx=((side?16:9)+[0,0,0,.5,.5,0,-.5,0][phase%8])*2,py=(20+bob+[0,0,-.5,-.5,0,.5,.5,0][phase%8])*2;
      maskedLine(bx+2,py+2,bx+11,py+2,'#f0dbb7',['#74483f','#ba8a62','#eee2c4','#704840','#d4b88c']);
      maskedLine(bx+2,py+5,bx+10,py+5,'#b99a7b',['#74483f','#ba8a62','#eee2c4']);
      maskedLine(bx+6,py+2,bx+6,py+9,'#69504b',['#74483f','#ba8a62','#eee2c4']);
    }
    if(!back&&state==='coffee'){
      var cupX=((side?19:17)+[0,.5,.5,0,0,-.5,-.5,0][phase%8])*2,cupY=([20,19,17,15,14,15.5,17.5,19.5][phase%8]+bob)*2;
      maskedLine(cupX+1,cupY+1,cupX+4,cupY+1,'#a4785c',['#80584a',WHITE]);
      maskedLine(cupX+1,cupY+3,cupX+1,cupY+5,'#fffef3',[WHITE]);
    }
  }
  function build(id,state,phase,direction){
    var r=new Raster(),p=palettes[id],side=direction==='left'||direction==='right',back=direction==='back';
    var walking=state==='walk'||state==='run',signature=!!actionOwner[state];
    var motion=walking?gait(state,phase):null,pose=walking?null:signature?signaturePose(state,phase):life(state,phase);
    var bob=walking?motion.bodyY/2:pose.bob;
    var lean=walking?(side?motion.lean/2:0):pose.lean*(side?1:.5);
    var trail=walking?motion.hairLag*.5:pose.trail;
    var headBob=bob+(walking?0:pose.head);
    function idleProp(){
      if(state==='idle'&&id==='claude'&&phase===5){r.rect(14,21+bob,6,6,'#704840');r.rect(15,22+bob,4,3,'#d4b88c');}
      if(state==='idle'&&id==='doubao'&&phase===5){r.rect(3,22+bob,4,6,'#c5a680');r.rect(4,23+bob,2,2,p.accent);}
    }
    wings(r,id,p,side,bob,trail,state,phase);
    hairBack(r,id,p,side,back,bob,trail,lean);
    var tailLayer=tail(id,p,bob,phase,motion,state),signatureProp=signature?nativeSignatureProp(state,side,bob,phase,back):null;
    if(!walking){
      legs(r,p,side,back,state,phase,lean);
      if(signature)signatureGesture(r,id,p,side,back,bob,lean,state,phase,'far');
      else armBack(r,id,p,side,back,bob,lean,state,phase);
      // An away-facing character holds objects on the far side of her torso.
      // Draw those hands and props first; the back and rear hair occlude them.
      if(back){if(signature)signatureGesture(r,id,p,side,back,bob,lean,state,phase,'near');else armFront(r,id,p,side,back,bob,lean,state,phase);idleProp();}
    }
    body(r,id,p,side,back,bob,lean,state,phase);
    if(back)hairBack(r,id,p,side,back,bob,trail,lean);
    head(r,id,p,side,back,headBob,lean,signature?signatureFaceState(state,phase):state,phase);
    if(!walking&&!back){if(signature)signatureGesture(r,id,p,side,back,bob,lean,state,phase,'near');else armFront(r,id,p,side,back,bob,lean,state,phase);idleProp();}
    r.before=function(hi){
      tailUnderlay(hi,tailLayer,r);
      if(back)copyNative(hi,signatureProp);
      if(walking){
        nativeLegs(hi,p,motion,side,back);
        nativeMovingArm(hi,p,motion,side,back,true);
        if(back)nativeMovingArm(hi,p,motion,side,back,false);
      }
    };
    if(walking&&!back)r.after=function(hi){nativeMovingArm(hi,p,motion,side,back,false);};
    r.refine=function(hi){refine(hi,id,p,side,back,headBob,lean,state,phase,bob,trail);};
    if(state==='coffee'&&!back){
      // The sipping hand and cup sit in front of the face; the native eye/skin
      // pass must not turn a white cup back into a cheek.
      var foreground=new Raster();armFront(foreground,id,p,side,false,bob,lean,state,phase);
      r.after=function(hi){
        for(var yy=0;yy<BH;yy++)for(var xx=0;xx<BW;xx++)if(foreground.rows[yy][xx])hi.rect(xx*2,yy*2,2,2,foreground.rows[yy][xx]);
        var cx=Math.round(((side?19:17)+[0,.5,.5,0,0,-.5,-.5,0][phase%8])*2),cy=Math.round(([20,19,17,15,14,15.5,17.5,19.5][phase%8]+bob)*2);
        hi.line(cx+1,cy+1,cx+4,cy+1,'#a4785c');hi.line(cx+1,cy+3,cx+1,cy+5,WHITE);
      };
    }
    if(signature){
      var signatureForeground=new Raster();
      if(!back)signatureGesture(signatureForeground,id,p,side,false,bob,lean,state,phase,'near');
      r.after=function(hi){
        if(!back)copyNative(hi,signatureProp);
        if(!back)for(var yy=0;yy<BH;yy++)for(var xx=0;xx<BW;xx++)if(signatureForeground.rows[yy][xx])hi.rect(xx*2,yy*2,2,2,signatureForeground.rows[yy][xx]);
        var effects=new Raster(W,H);signatureEffects(effects,id,p,side,back,bob,lean,state,phase,headBob);
        for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(effects.rows[y][x]&&(!back||!hi.rows[y][x]))hi.dot(x,y,effects.rows[y][x]);
      };
    }
    r.palette=limitedColours(p,id);
    return r.canvas(direction==='left');
  }
  function get(id,state,phase,direction){
    var key=[id,state,phase,direction].join('|');return cache[key]||(cache[key]=build(id,state,phase,direction));
  }
  function draw(ctx,id,state,frame,x,y,width,facingLeft,direction){
    if(!Object.prototype.hasOwnProperty.call(lookup,id))return false;
    state=validState(id,state);var count=states[state].count,phase=((Math.floor(frame||0)%count)+count)%count;
    direction=direction==='left'||direction==='right'||direction==='front'||direction==='back'?direction:(facingLeft?'left':state==='walk'||state==='run'||state==='work'?'right':'front');
    width=width||27;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(get(id,state,phase,direction),x,y,width,width*H/W);ctx.restore();return true;
  }
  // Portraits stay as a separate display asset; they are never used for walking.
  var script=document.currentScript,portrait=new Image(),portraitReady=false,portraitStarted=false;
  portrait.onload=function(){portraitReady=portrait.naturalWidth===1344;};
  function drawPortrait(ctx,id,x,y,width){
    if(!portraitStarted){portraitStarted=true;try{portrait.src=new URL('../media/ai-studio/characters.png?v=20261028ai1',script&&script.src?script.src:location.href).href;}catch(e){/* Portraits are optional. */}}
    if(!portraitReady)return draw(ctx,id,'idle',0,x,y,width||27,false,'front');
    var row=characters.findIndex(function(c){return c.id===id;});if(row<0)return false;
    width=width||32;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(portrait,0,row*112,96,112,x,y,width,width*112/96);ctx.restore();return true;
  }
  window.AIStudioSprites={characters:characters,states:states,uniqueActions:uniqueActions,ready:Promise.resolve(true),isReady:function(){return true;},draw:draw,drawPortrait:drawPortrait,width:W,height:H,
    // Frame getter is read-only and useful for art QA without changing scene state.
    frame:function(id,state,index,direction){if(!lookup[id])return null;state=validState(id,state);var count=states[state].count,phase=((Math.floor(index||0)%count)+count)%count;return get(id,state,phase,direction||'front');}};
}());

})(referenceWindow, document, referenceWindow.StudioGait);
window.StudioReference8 = { heroes: referenceWindow.StudioHeroSprites, ai: referenceWindow.AIStudioSprites, gait: referenceWindow.StudioGait };
})();
