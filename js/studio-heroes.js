/* Studio heroes v13: forward three-quarter faces, articulated hands and matched leg fabrics.
 * Gameplay PX sprites are intentionally independent and remain unchanged. */
(function () {
  'use strict';
  var W=48,H=64,INK='#30273c',SKIN='#ffe3d5',SKIN_D='#e8b8b0',SKIN_L='#fff0df';
  var characters=[{id:'C0',name:'C0',color:'#4fe3ff'},{id:'X0',name:'X0',color:'#b48cff'},{id:'Feline1',name:'F1',color:'#ff9fc4'}];
  // One complete beat per twelve poses; the gallery and studio share these timings.
  var states={
    idle:{count:12,frameMs:250*2/3,phaseLabels:['呼吸','缓缓吸气','眨眼','转头','抬眼','舒展肩膀','抬起手腕','整理衣领','放低手腕','呼气','回正肩膀','站稳']},
    walk:{count:12,frameMs:100*2/3,stridePixels:20,phaseLabels:['右脚着地','压低承重','脚掌过渡','双腿交叉','提起后脚','向前摆腿','左脚着地','压低承重','脚掌过渡','双腿交叉','提起后脚','向前摆腿']},
    run:{count:12,frameMs:70*2/3,stridePixels:36,phaseLabels:['右脚触地','压低缓冲','向后蹬地','脚尖离地','腾空收腿','向前伸腿','左脚触地','压低缓冲','向后蹬地','脚尖离地','腾空收腿','向前伸腿']},
    work:{count:12,frameMs:125*2/3,phaseLabels:['抬起手腕','靠近按键','落下手指','换手定位','指尖触键','敲下按键','抬眼检查','再落手指','敲完收指','收回手腕','放松肩膀','回到起点']},
    wave:{count:12,frameMs:115*2/3,phaseLabels:['微微抬肘','举起手腕','展开手掌','向外挥手','挥过头侧','转动手腕','向内挥手','再次挥开','慢慢落肘','收回手掌','放下手腕','回到身旁']},
    talk:{count:12,frameMs:140*2/3,phaseLabels:['开口说话','抬起手腕','转出手掌','摊掌说明','向外强调','收住手势','停顿一下','垂头点头','抬回视线','慢慢收掌','放低前臂','回到身旁']},
    read:{count:12,frameMs:180*2/3,phaseLabels:['托稳书本','缓缓低头','落下视线','安静阅读','伸指捏页','轻掀书页','翻过书页','抚过页边','按平新页','继续阅读','读完一行','抬头放松']},
    coffee:{count:12,frameMs:200*2/3,phaseLabels:['握稳杯柄','抬起杯底','慢慢举杯','靠近嘴边','停在唇前','小小啜饮','停留回味','移开杯口','放下手腕','杯底放低','收回手肘','握杯回位']},
    nap:{count:12,frameMs:250*2/3,phaseLabels:['放松肩膀','缓缓合眼','垂下视线','慢慢低头','呼吸变缓','安静入睡','轻轻呼气','身体轻晃','慢慢吸气','抬起一点','再次放松','安稳睡着']},
    sit:{count:12,frameMs:210*2/3,phaseLabels:['坐稳身体','轻摆脚尖','抬起脚跟','抬起手腕','伸出前臂','轻轻伸展','回头看看','转回视线','放低手掌','慢慢收脚','坐正肩膀','恢复坐姿']},
    carry:{count:12,frameMs:145*2/3,phaseLabels:['托稳盘底','慢慢抬盘','抬到胸前','调整水平','微微倾斜','扶住盘边','重新托稳','放低前臂','轻轻落盘','调整指尖','收回手腕','回到起点']},
    cheer:{count:12,frameMs:110*2/3,phaseLabels:['屈臂蓄力','肩膀抬起','慢慢举手','高举双臂','张开手掌','向上欢呼','伸展手臂','挥向外侧','落下手腕','慢慢落臂','收回手肘','站稳放松']}
  };
  var signatureActions={
    C0:[
      {id:'c0_debug',name:'终端调试',description:'展开悬浮终端，逐行检查代码，再按下确认键。',count:12,frameMs:170*2/3,phaseLabels:['唤出终端','展开边框','拉开窗口','抬手定位','靠近输入','输入指令','逐行检查','移向确认','点下确认','收回手腕','缩小窗口','合上终端']},
      {id:'c0_headset',name:'调调耳机',description:'双手托住耳罩，侧头试听，调好后放下双手。',count:12,frameMs:180*2/3,phaseLabels:['抬起双手','靠近耳侧','托到耳罩','托住两侧','轻轻侧头','停下试听','压紧耳垫','转回头部','松开手指','离开耳罩','放低前臂','双手放下']},
      {id:'c0_overclock',name:'眼镜超频',description:'扶正镜架启动扫描，镜片亮起，环流检查完成。',count:12,frameMs:145*2/3,phaseLabels:['抬手扶镜','靠近镜架','触到镜框','推正眼镜','停住指尖','启动扫描','亮起镜片','沿框环流','检查完成','松开镜架','放低手掌','恢复待机']}
    ],
    X0:[
      {id:'x0_paint',name:'挥笔作画',description:'抬笔、落笔、挥出一条弧形色带，再轻轻收笔。',count:12,frameMs:150*2/3,phaseLabels:['握稳画笔','抬起手肘','抬高手腕','落下笔尖','转动笔锋','扫出上弧','拖出色带','沿弧转腕','轻轻回锋','提起笔尖','慢慢收笔','停笔欣赏']},
      {id:'x0_palette',name:'调色试色',description:'托着木调色盘，蘸取不同颜色，再举笔检查。',count:12,frameMs:190*2/3,phaseLabels:['托稳调色盘','抬起画笔','选好颜色','向下落笔','靠近颜料','蘸取颜色','转动笔尖','提起笔头','抬笔检查','点上试色','慢慢收腕','放回画笔']},
      {id:'x0_sketch',name:'举起速写',description:'在小画板上画猫，检查耳朵，再举起来展示。',count:12,frameMs:210*2/3,phaseLabels:['摆好画板','抬笔定位','画出轮廓','补上猫耳','描完耳尖','点出五官','握住两侧','抬过脸颊','高举画板','左右展示','慢慢放低','稳住画板']}
    ],
    Feline1:[
      {id:'f1_paws',name:'肉垫贴贴',description:'双爪举到脸旁，展开粉色肉垫，轻轻合爪再挥开。',count:12,frameMs:160*2/3,phaseLabels:['抬起双爪','转出爪面','露出肉垫','贴近脸颊','举到耳边','轻轻贴贴','慢慢合爪','向外展开','晃晃爪爪','落下前臂','收回肉垫','放下双爪']},
      {id:'f1_yarn',name:'拨弄毛线',description:'蹲下追着毛线球，伸爪轻拨，再把线头拉回来。',count:12,frameMs:185*2/3,phaseLabels:['蹲下发现','慢慢靠近','伸出爪尖','碰到线球','推开一点','顺势轻拨','追着线球','抓住线头','轻轻拉回','松开毛线','坐正身体','看着线球']},
      {id:'f1_groom',name:'梳理尾巴',description:'回头托住尾巴，顺着绒毛梳过，再把尾巴放回身后。',count:12,frameMs:200*2/3,phaseLabels:['回头找尾巴','伸爪靠近','托起尾尖','举起小梳','靠近绒毛','梳到尾尖','向下顺毛','提起梳子','轻梳第二遍','放低尾尖','放回尾巴','收好小梳']}
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
    C0:{hair:'#302a3c',hairD:'#1d1b29',hairM:'#484256',hairL:'#696079',cloth:'#353644',clothD:'#242633',clothL:'#535669',accent:'#62d5e5',accentD:'#278fa9',leg:'#52739b',legD:'#47658b',legL:'#83a3c3',shoe:'#e6e6ec',shoeD:'#7b8299',eye:'#555c77'},
    X0:{hair:'#684652',hairD:'#402b3d',hairM:'#855969',hairL:'#b1828c',cloth:'#fff0e9',clothD:'#c7afc3',clothL:'#fffaf0',accent:'#ed7aa7',accentD:'#ad486e',skirt:'#44304e',skirtL:'#765574',leg:'#76556f',legD:'#70506a',legL:'#ab7b95',shoe:'#40243b',shoeD:'#251b2c',eye:'#9a7bc7'},
    Feline1:{hair:'#fff1f7',hairD:'#c5a1c3',hairM:'#e8c8df',hairL:'#fffdf5',cloth:'#f6c4dd',clothD:'#d790b9',clothL:'#ffe7ef',accent:'#ee6ea2',accentD:'#bc4e82',skirt:'#efb2d2',skirtL:'#ffdfeb',leg:'#fff3f5',legD:'#e7dbe5',legL:'#fffdf4',shoe:'#bd588e',shoeD:'#8c3d73',eye:'#d25892'}
  };
  // Deliberate 24-colour ramps give the sprites readable GBA-like clusters.
  // Native artwork stays crisp; reducing colours removes isolated highlight noise.
  var gbaPalettes={
    C0:['#30273c','#ffe0cc','#dba4a4','#fff0df','#a7607c','#201e2b','#3e3a50','#686078','#242d3d','#35465b','#52667d','#257c96','#55c8db','#a8e5ea','#47658b','#5478a6','#8eacc9','#e6e4e6','#8d94ab','#7b93b3','#b9788c','#d9b27f','#79515e','#e8d8b2'],
    X0:['#30273c','#ffe0cc','#dba4a4','#fff0df','#a7607c','#422a3c','#79515f','#b57b8f','#bea5bd','#f4e1d8','#fff1dd','#35263e','#573b59','#88617b','#ad496f','#e978a1','#f5b2ca','#70506a','#7f5974','#382436','#9e83c4','#d5b4e7','#d9b27f','#e8d8b2'],
    Feline1:['#30273c','#ffe0cc','#dba4a4','#fff0df','#a7607c','#fff4f6','#e5bed7','#b692bf','#a54b7d','#e46a9c','#f3a7ca','#ba79a2','#e5a6ca','#ffdae9','#854069','#bd5a8e','#e7dbe5','#fff7ed','#dbb57e','#987b5e','#79515e','#e8d8b2','#8a8498','#4c3557']
  },colourCache=Object.create(null);
  function rgb(hex){return[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];}
  function gbaColour(id,colour){
    var key=id+'|'+colour;if(colourCache[key])return colourCache[key];var a=rgb(colour),best=Infinity,match=colour;
    gbaPalettes[id].forEach(function(c){var b=rgb(c),d=(a[0]-b[0])*(a[0]-b[0])*2+(a[1]-b[1])*(a[1]-b[1])*3+(a[2]-b[2])*(a[2]-b[2]);if(d<best){best=d;match=c;}});
    return(colourCache[key]=match);
  }
  function phase8(frame){return window.StudioMotion?StudioMotion.key8(frame):((Math.round((Number(frame)||0)*2/3)%8)+8)%8;}
  function pose12(values,frame){
    if(window.StudioMotion)return StudioMotion.sample8(values,frame);
    var f=(((Number(frame)||0)%12)+12)%12*2/3,a=Math.floor(f),b=(a+1)%8,t=f-a;
    function mix(x,y){return Array.isArray(x)?x.map(function(v,i){return mix(v,y[i]);}):x+(y-x)*t;}
    return mix(values[a],values[b]);
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
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(a[yy][xx]){g.fillStyle=gbaColour(id,a[yy][xx]);g.fillRect(flip?W-1-xx:xx,yy,1,1);}c.headBounds=facingHead(this.headBounds,flip);return c;
  };
  function palmPoint(x,y,id,big){return{x:Math.max(4,Math.min(id==='Feline1'&&big?42:43,x)),y:y};}
  function hand(r,x,y,id,p,far,big,back,joinMask){
    var anchor=palmPoint(x,y,id,big);x=Math.round(anchor.x);y=Math.round(anchor.y);back=back===undefined?!!r.back:back;
    var h=new R(),paw=id==='Feline1',w=paw?(big?3:2):1;
    if(paw){
      h.poly([[x-w,y-2],[x+w,y-2],[x+w+1,y],[x+w,y+3],[x-w,y+3],[x-w-1,y]],p.hairL);
      h.line(x-w,y+1,x-w,y+2,p.hairM);
      if(!back){h.rect(x-1,y+1,big?3:2,2,p.accent);h.dot(x-w,y-1,p.accentD);h.dot(x,y-2,p.accent);h.dot(x+w,y-1,p.accentD);}
      else{h.line(x-1,y-1,x+1,y-1,p.hairM);h.dot(x+w,y+1,p.hairD);}
    }else{
      h.poly([[x-1,y-1],[x+1,y-2],[x+2,y-1],[x+3,y+1],[x+2,y+3],[x-1,y+2]],SKIN);
      h.line(x-1,y+1,x,y+2,SKIN_D);h.dot(x+2,y+2,SKIN_D);h.dot(x,y-1,SKIN_L);h.dot(x+2,y,SKIN_L);
    }
    // An internal contour also separates a raised paw from pale hair and tail;
    // the sprite's outer silhouette alone cannot describe that contact.
    for(var yy=Math.max(0,y-3);yy<Math.min(H,y+5);yy++)for(var xx=Math.max(0,x-w-2);xx<Math.min(W,x+w+3);xx++){
      if(!h.rows[yy][xx]&&!(joinMask&&joinMask[yy][xx])&&((xx>0&&h.rows[yy][xx-1])||(xx<W-1&&h.rows[yy][xx+1])||(yy>0&&h.rows[yy-1][xx])||(yy<H-1&&h.rows[yy+1][xx])))r.dot(xx,yy,paw?p.hairD:INK);
    }
    stamp(r,h);r.lastHand={x:x,y:y,id:id,p:p,far:far,big:big,back:back};
  }
  function forearm(r,ex,ey,hx,hy,id,p,far,big,back){
    var anchor=palmPoint(hx,hy,id,big);hx=anchor.x;hy=anchor.y;
    var dx=hx-ex,dy=hy-ey,len=Math.max(1,Math.sqrt(dx*dx+dy*dy)),ux=dx/len,uy=dy/len,wx=hx-ux*2,wy=hy-uy*2;
    r.line(ex,ey,wx,wy,far?p.clothD:p.cloth,3);r.line(ex+1,ey,wx+1,wy,far?p.cloth:p.clothL,1);
    var joint=new R();joint.line(wx,wy,hx,hy,id==='Feline1'?p.hairM:SKIN,2);stamp(r,joint);
    r.line(wx-uy,wy+ux,wx+uy,wy-ux,p.accentD);r.dot(wx-ux,wy-uy,p.clothL);
    // The glove contour opens exactly where the drawn wrist enters its palm.
    hand(r,hx,hy,id,p,far,big,back,joint.rows);
  }
  function limb(r,sx,sy,ex,ey,hx,hy,id,p,far,big){
    var anchor=palmPoint(hx,hy,id,big);hx=anchor.x;hy=anchor.y;
    r.line(sx,sy,ex,ey,far?p.clothD:p.cloth,4);r.line(sx,sy,ex,ey,far?p.cloth:p.clothL,1);
    forearm(r,ex,ey,hx,hy,id,p,far,big);
    r.lastLimb={sx:sx,sy:sy,ex:ex,ey:ey,hx:hx,hy:hy,id:id,p:p,far:far,big:big,back:!!r.back};
  }
  function foregroundForearm(r,a){if(a)forearm(r,a.ex,a.ey,a.hx,a.hy,a.id,a.p,a.far,a.big,a.back);}
  function solveQuietArm(sx,sy,hx,hy,screenLeft,oldEx,oldEy,id){
    var h=palmPoint(hx,hy,id,false),dx=h.x-sx,dy=h.y-sy,distance=Math.sqrt(dx*dx+dy*dy),length=5;
    // The authored wrist path fits a pair of 5px segments. Choosing a stable
    // outward elbow keeps a running arm bent without stretching its upper arm.
    var safe=Math.max(.001,Math.min(length*2-.001,distance)),ux=distance?dx/distance:0,uy=distance?dy/distance:1,along=safe/2,bend=Math.sqrt(Math.max(0,length*length-along*along));
    var a={x:sx+ux*along-uy*bend,y:sy+uy*along+ux*bend},b={x:sx+ux*along+uy*bend,y:sy+uy*along-ux*bend};
    var elbow=Math.abs(a.x-b.x)<.001?(Math.hypot(a.x-oldEx,a.y-oldEy)<Math.hypot(b.x-oldEx,b.y-oldEy)?a:b):screenLeft?(a.x<b.x?a:b):(a.x>b.x?a:b);
    return{elbow:elbow,hand:h};
  }
  function shoe(r,x,y,id,p,far,roll,side,back){
    var toe=roll==='heel'?-1:0,heel=roll==='toe'?-1:0;
    if(!side){
      // Front toes and rear heel counters stay centered under the ankle. A
      // right-facing boot silhouette must not leak into these two directions.
      if(back){
        r.poly([[x-2,y],[x+2,y],[x+2,y+3],[x+3,y+4],[x-3,y+4],[x-2,y+3]],p.shoe);
        r.rect(x-1,y+1,3,2,p.shoeD);r.line(x-2,y+4,x+2,y+4,p.shoeD);r.dot(x,y+1,p.accentD);
      }else{
        r.poly([[x-2,y],[x+2,y],[x+3,y+2],[x+3,y+3],[x+2,y+4],[x-2,y+4],[x-3,y+3],[x-3,y+2]],p.shoe);
        r.line(x-2,y+4,x+2,y+4,p.shoeD);r.line(x-1,y+2,x+1,y+2,id==='Feline1'?p.hairL:id==='C0'?p.accentD:p.skirtL);
      }
      return;
    }
    // Canonical right view: the ankle is over the rear half. A square heel and
    // extended round toe make travel readable even in a single native frame.
    r.poly([[x-1,y+heel],[x+1,y+toe],[x+2,y+1+toe],[x+4,y+1+toe],[x+6,y+2+toe],[x+6,y+3+toe],[x+4,y+4+toe],[x-2,y+4+heel],[x-2,y+1+heel]],p.shoe);
    r.line(x-2,y+4+heel,x+4,y+4+toe,p.shoeD);r.line(x-2,y+1+heel,x-2,y+3+heel,p.shoeD);
    r.line(x,y+1,x+2,y+1,id==='Feline1'?p.hairL:id==='C0'?p.accentD:p.skirtL);
    r.line(x+3,y+2+toe,x+4,y+2+toe,id==='Feline1'?p.accent:p.shoe);
  }
  function legLayer(id,p,hip,knee,ankle,far,roll,side,back){
    var r=new R();
    // Both legs are cut from the same fabric. Depth lives at the outer edge,
    // knee crease and sole, rather than recolouring the entire far stocking.
    r.line(hip.x,hip.y,knee.x,knee.y,p.leg,4);r.line(knee.x,knee.y,ankle.x,ankle.y,p.leg,3);
    if(far){r.line(hip.x,hip.y,knee.x,knee.y,p.legD);r.dot(knee.x,knee.y+1,p.legD);}
    else{r.line(knee.x+1,knee.y+1,ankle.x+1,ankle.y-1,p.legL);r.dot(knee.x,knee.y,p.legD);}
    shoe(r,ankle.x,ankle.y,id,p,far,roll,side,back);return r;
  }
  function pairLegs(r,far,near){
    stamp(r,far);
    // Only touching silhouettes receive a narrow seam. Open space stays open,
    // and the near shin naturally occludes the far one during a crossing.
    for(var y=44;y<H-1;y++)for(var x=1;x<W-1;x++)if(far.rows[y][x]&&!near.rows[y][x]&&(near.rows[y][x-1]||near.rows[y][x+1]||near.rows[y-1][x]||near.rows[y+1][x]))r.dot(x,y,INK);
    stamp(r,near);
  }
  function legs(r,id,p,side,back,state,phase,lean){
    var moving=state==='walk'||state==='run',seated=state==='work'||state==='sit',f,n;
    if(seated){
      if(side){f=legLayer(id,p,{x:26+lean,y:47},{x:35,y:51},{x:34,y:57},true,'flat',side,back);n=legLayer(id,p,{x:21+lean,y:48},{x:29,y:52},{x:29,y:59},false,'flat',side,back);}
      else{f=legLayer(id,p,{x:20,y:48},{x:17,y:52},{x:19,y:58},true,'flat',side,back);n=legLayer(id,p,{x:28,y:48},{x:32,y:52},{x:30,y:59},false,'flat',side,back);}
    }else if(window.StudioGait){
      var m=gait(moving?state:'idle',phase);
      function one(leg,far){function project(q){return side?q:{x:(far?18:29)+(q.x-leg.hip.x)*.24,y:q.y};}return legLayer(id,p,project(leg.hip),project(leg.knee),project(leg.ankle),far,leg.roll,side,back);}
      f=one(m.far,true);n=one(m.near,false);
    }else{
      f=legLayer(id,p,{x:side?26:18,y:47},{x:side?26:18,y:52},{x:side?26:18,y:57},true,'flat',side,back);
      n=legLayer(id,p,{x:side?21:29,y:48},{x:side?21:29,y:53},{x:side?21:29,y:59},false,'flat',side,back);
    }
    pairLegs(r,f,n);
  }
  function tail(r,id,p,phase,bob,side,state){
    if(id!=='Feline1')return;
    var wag=(state==='walk'||state==='run')&&window.StudioGait?gait(state,phase).hairLag:pose12([0,-1,-2,-1,0,1,2,1],phase),t=new R();
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
  function torsoGeometry(side,back,bob,lean){
    var turned=side&&!back,top=35+bob;
    return{
      turned:turned,
      shoulder:function(far){return{x:(back?(far?18:31):turned?(far?32:20):(far?18:32))+lean,y:37+bob+(turned?(far?-1:1):0)};},
      point:function(x,y,hem){
        var t=Math.max(0,Math.min(1,(y-top)/(hem-top))),centre=25+lean*(1-t),dx=x-centre;
        // The chest turns more than the hips. The broad screen-left near half and narrow
        // screen-right far half keep a visible front plane instead of becoming a profile.
        return[27-t+lean*(1-t)+dx*(dx<0?.86:.72),y-dx*.12];
      }
    };
  }
  function torsoPlane(r,geometry,hem){
    function pt(x,y){return geometry.point(x,y,hem);}
    return{
      dot:function(x,y,c){var p=pt(x,y);r.dot(p[0],p[1],c);},
      line:function(x1,y1,x2,y2,c,size){var a=pt(x1,y1),b=pt(x2,y2);r.line(a[0],a[1],b[0],b[1],c,size);},
      poly:function(points,c){r.poly(points.map(function(p){return pt(p[0],p[1]);}),c);},
      rect:function(x,y,w,h,c){r.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(function(p){return pt(p[0],p[1]);}),c);}
    };
  }
  function turnedBody(r,id,p,bob,lean,state,phase){
    var top=35+bob,hem=(state==='work'||state==='sit'?47:48)+bob,geometry=torsoGeometry(true,false,bob,lean);
    // The visible left side panel joins the near shoulder to the rear hip. It is a
    // real second plane, with its own armhole and waist, behind the front panel.
    r.poly([[20+lean,top],[24+lean,top+1],[25+lean,top+5],[24,hem],[18,hem],[18+lean,top+5]],p.clothD);
    r.line(20+lean,top+2,20,hem-2,p.cloth);r.line(22+lean,top+3,23,hem-2,p.clothD);
    if(id!=='C0'){
      var lag=state==='run'?pose12([0,0,1,1,0,0,-1,-1],phase):state==='walk'?pose12([0,0,0,1,0,0,0,-1],phase):0,bottom=51+bob+lag;
      r.poly([[20,44+bob],[24,44+bob],[24,bottom],[16,bottom],[18,48+bob]],p.skirt);
      r.line(19,46+bob,18,bottom-1,p.clothD);r.line(21,46+bob,22,bottom-1,p.skirtL);
      if(id==='Feline1'){r.line(16,bottom,23,bottom,p.hairM);r.rect(17,bottom,2,2,p.hairL);r.rect(21,bottom,2,2,p.hairL);}
      else r.line(16,bottom,23,bottom,p.hairM);
    }
    // Redraw the same garment primitives through a shared native-coordinate
    // projection: neckline, pocket, drawstrings, bow, bell, waistband and pleats
    // all turn together. No completed sprite bitmap is squeezed or rotated.
    body(torsoPlane(r,geometry,hem),id,p,false,false,bob,lean,state,phase);
    if(id==='C0'){r.line(20+lean,top+1,23+lean,top+4,p.accentD);r.line(19,hem-1,23,hem-1,p.accentD);}
  }
  function body(r,id,p,side,back,bob,lean,state,phase){
    if(side&&!back){turnedBody(r,id,p,bob,lean,state,phase);return;}
    var top=35+bob,hem=48+bob,seated=state==='work'||state==='sit';if(seated)hem=47+bob;
    r.poly([[18+lean,top],[(back?30:32)+lean,top],[34+lean,top+6],[35,hem],[15,hem],[16+lean,top+5]],p.cloth);
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
      var skirtTop=44+bob,hemLag=state==='run'?pose12([0,0,1,1,0,0,-1,-1],phase):state==='walk'?pose12([0,0,0,1,0,0,0,-1],phase):0,skirtBottom=51+bob+hemLag;
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
    var irisWidth=width>=5?3:2,irisX=x+Math.floor((width-irisWidth)/2)+(lookRight?1:0);
    if(blink===.5){r.rect(x,y+3,width,1,'#fffdf4');r.rect(irisX,y+3,irisWidth,2,idEyeLight(p));r.dot(irisX+Math.floor(irisWidth/2),y+3,INK);r.line(x,y+2,x+width,y+2,INK);return;}
    if(blink){r.line(x,y+3,x+width,y+3,INK);r.dot(x+width,y+2,INK);return;}
    if(happy){r.line(x,y+2,x+Math.floor(width/2),y,INK);r.line(x+Math.floor(width/2),y,x+width,y+2,INK);return;}
    // Both eyes share one gaze. The iris shifts within the sclera; eye sockets
    // do not slide in opposite directions when the running head leans forward.
    r.rect(x,y+1,width,3,'#fffdf4');r.line(x,y,x+width-1,y,INK);r.dot(x+width,y+1,INK);
    r.rect(irisX,y+1,irisWidth,4,p.eye);r.rect(irisX,y+3,irisWidth,2,idEyeLight(p));
    r.line(irisX+Math.floor(irisWidth/2),y+1,irisX+Math.floor(irisWidth/2),y+3,INK);
    r.dot(irisX,y+1,'#fffdf4');r.dot(irisX+irisWidth-1,y+4,p.eye);
  }
  function idEyeLight(p){return p===palettes.Feline1?'#f3a4c7':p===palettes.X0?'#cbb2e7':'#98afc8';}
  function expressionFor(id,state,phase,expression){
    var expressions=window.StudioExpressions;if(!expressions)return null;
    var mood=expression&&expression!=='auto'?expression:expressions.resolve(id,state,phase);
    return expressions.moods.some(function(item){return item.id===mood;})?mood:null;
  }
  // Record only head paint, independently of raised hands and action props.
  // Bounds use native sprite pixels and include the one-pixel outside contour.
  function trackHead(r){
    var paint=r.dot,left=W,top=H,right=-1,bottom=-1;
    r.dot=function(x,y,c){var px=Math.round(x),py=Math.round(y);if(c&&px>=0&&px<W&&py>=0&&py<H){left=Math.min(left,px);top=Math.min(top,py);right=Math.max(right,px);bottom=Math.max(bottom,py);}paint.call(this,x,y,c);};
    return function(){r.dot=paint;r.headBounds={left:Math.max(0,left-1),top:Math.max(0,top-1),right:Math.min(W,right+2),bottom:Math.min(H,bottom+2)};};
  }
  function facingHead(bounds,flip){if(!bounds)return null;var b={left:flip?W-bounds.right:bounds.left,top:bounds.top,right:flip?W-bounds.left:bounds.right,bottom:bounds.bottom};b.centerX=(b.left+b.right)/2;return b;}
  function head(r,id,p,side,back,bob,lean,state,phase,expression){
    var finishHead=trackHead(r);
    var frame12=((Math.floor(Number(phase)||0)%12)+12)%12;phase=phase8(phase);
    var y=8+bob,hx=lean,blink=state==='nap'?1:state==='idle'?[0,.5,1,0,0,0,0,0,0,0,0,0][frame12]:0,happy=state==='wave'||state==='cheer';
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
      var far=side?32:18,near=side?22:29,farWidth=side?3:5,nearWidth=5;
      // In the right-facing three-quarter view the left eye is nearer the camera.
      // Cheek, nose, mouth, eyebrows and both pupils turn as one face plane.
      var face=side?[[19,y+12],[25,y+9],[34,y+10],[38,y+14],[40,y+18],[38,y+22],[33,y+25],[25,y+25],[20,y+22],[17,y+17]]:[[15,y+12],[21,y+8],[32,y+10],[36,y+15],[35,y+22],[30,y+25],[21,y+25],[16,y+22],[13,y+17]];
      r.poly(face.map(function(pt){return[pt[0]+hx,pt[1]];}),SKIN);
      var cheek=side?20:15;r.line(cheek+hx,y+18,cheek+2+hx,y+22,SKIN_D);r.line(cheek+2+hx,y+22,cheek+7+hx,y+24,SKIN_D);r.line(cheek+7+hx,y+24,side?33+hx:29+hx,y+24,'#f5c9bf');r.rect((side?26:21)+hx,y+12,10,4,SKIN_L);
      if(!expression){
        eye(r,far+hx,y+15,farWidth,p,blink,happy,side);eye(r,near+hx,y+15,nearWidth,p,blink,happy,side);
        r.line(far+hx,y+12,far+farWidth-1+hx,y+12,p.hairD);r.line(near+hx,y+12,near+nearWidth-1+hx,y+12,p.hairD);
      }
      var blushLeft=side?22:17,blushRight=side?36:32;r.rect(blushLeft+hx,y+21,2,1,'#eaa7b1');r.rect(blushRight+hx,y+21,2,1,'#eaa7b1');
      if(side){r.dot(37+hx,y+20,SKIN_D);r.dot(38+hx,y+19,SKIN_L);}else r.dot(26+hx,y+20,SKIN_D);
      var mouth=side?33:25;
      if(expression){
        StudioExpressions.draw(r,{
          near:{x:near+hx,y:y+15,w:nearWidth},far:{x:far+hx,y:y+15,w:farWidth},side:side,
          skin:SKIN,skinShade:SKIN_D,white:'#fffdf4',ink:INK,brow:p.hairD,mouthColor:'#ae697d',
          irisNear:p.eye,irisFar:p.eye,irisLightNear:idEyeLight(p),irisLightFar:idEyeLight(p),
          mouth:{x:mouth+hx,y:y+23},catMouth:id==='Feline1',blink:blink,speaking:state==='talk',gazeY:state==='read'?1:0
        },expression,frame12);
      }else if(id==='Feline1'){r.line(mouth-2+hx,y+22,mouth+hx,y+23,'#b95983');r.line(mouth+hx,y+23,mouth+2+hx,y+22,'#b95983');}
      else{r.line(mouth-1+hx,y+23,mouth+2+hx,y+23,'#ae697d');if(state==='talk'&&(phase===0||phase===2||phase===3||phase===5))r.rect(mouth+hx,y+22,2,2,'#a96278');}
      if(id==='C0'){
        r.poly([[13+hx,y+8],[17+hx,y+3],[23+hx,y+4],[25+hx,y+8],[30+hx,y+3],[35+hx,y+6],[38+hx,y+11],[34+hx,y+14],[31+hx,y+12],[27+hx,y+15],[23+hx,y+12],[19+hx,y+15],[15+hx,y+15]],p.hair);
        r.line(17+hx,y+6,21+hx,y+5,p.hairM);r.line(28+hx,y+6,31+hx,y+5,p.hairL);r.line(14+hx,y+8,14+hx,y+14,p.hairD);
        // Lens size follows its eye; the bridge joins the narrow far lens
        // to the broad near lens instead of reversing them across the nose.
        [[far,farWidth],[near,nearWidth]].forEach(function(lens){var lx=lens[0]+hx,lw=lens[1];r.line(lx-1,y+14,lx+lw,y+14,'#aab9d0');r.line(lx-1,y+14,lx-1,y+20,'#8fa1bd');r.line(lx-1,y+20,lx+lw,y+20,'#7b8aa5');r.line(lx+lw,y+14,lx+lw,y+20,'#aab9d0');});
        r.line((side?near+nearWidth:far+farWidth)+hx,y+16,(side?far-1:near-1)+hx,y+16,'#a1b1cd');r.dot(near+1+hx,y+15,'#e2f4ef');
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
    finishHead();
  }
  function arms(r,id,p,side,back,bob,lean,state,phase,screenLeft,propsOnly){
    // Action targets are authored by screen side; physical depth is derived
    // from the facing direction, independently of the legacy chart names.
    var physicalFar=side&&!back?!screenLeft:screenLeft,shoulder=torsoGeometry(side,back,bob,lean).shoulder(physicalFar),y=shoulder.y,sx=shoulder.x,moving=state==='walk'||state==='run',running=state==='run',sw=moving?gait(state,phase).armSwing*(side&&!back?-1:1):0;
    function paintLimb(sx,sy,ex,ey,hx,hy,who,palette,legacyFar){if(propsOnly)return;if(moving||state==='idle'){var joints=solveQuietArm(sx,sy,hx,hy,screenLeft,ex,ey,who);ex=joints.elbow.x;ey=joints.elbow.y;hx=joints.hand.x;hy=joints.hand.y;}limb(r,sx,sy,ex,ey,hx,hy,who,palette,physicalFar);}
    if(moving&&!propsOnly&&window.StudioGait&&StudioGait.arm){
      var chain=StudioGait.arm(state,gait(state,phase),{x:sx,y:y},physicalFar);
      function project(j){return{x:sx+(j.x-sx)*(side?1:.24),y:j.y};}
      var elbow=project(chain.elbow),wrist=project(chain.wrist);
      limb(r,sx,y,elbow.x,elbow.y,wrist.x,wrist.y,id,p,physicalFar);return;
    }
    var q=phase8(phase);
    if(screenLeft){
      if(moving){var ex=sx-sw*.55,ey=y+4-(running?1:0),hx=sx-sw*(running?.95:.8),hy=y+8-(running?2:0)-Math.abs(sw)*.22;paintLimb(sx,y,ex,ey,hx,hy,id,p,true);}
      else if(state==='cheer')paintLimb(sx,y,pose12([15,13,10,9,8,10,12,15],phase),y-pose12([1,4,7,9,8,7,4,0],phase),pose12([15,12,9,7,8,10,12,16],phase),pose12([39,32,26,22,20,25,31,40],phase),id,p,true);
      else if(state==='wave')paintLimb(sx,y,sx-3,y+pose12([4,4,3,3,4,5,5,4],phase),sx+pose12([-2,-3,-3,-2,-1,-1,-2,-2],phase),y+pose12([8,7,7,8,9,9,8,8],phase),id,p,true);
      else if(state==='work')paintLimb(sx,y,back?15:pose12([23,24,25,24,23,25,24,22],phase),y+pose12([5,6,5,4,5,6,5,4],phase),back?19:pose12([29,30,31,32,30,29,31,30],phase),y+pose12([5,6,5,4,4,6,6,5],phase),id,p,true);
      else if(state==='read')paintLimb(sx,y,back?pose12([13,12,13,14,15,14,13,14],phase):19,y+pose12([4,5,6,5,4,5,5,4],phase),back?18:23,y+pose12([6,7,7,6,5,6,7,6],phase),id,p,true);
      else if(state==='carry')paintLimb(sx,y,back?13:22,y+pose12([4,3,2,3,4,4,3,4],phase),back?16:30,y+pose12([3,2,1,2,3,4,3,3],phase),id,p,true);
      else if(state==='nap')paintLimb(sx,y,pose12([18,19,20,20,19,18,17,18],phase),y+pose12([5,6,7,7,6,6,5,5],phase),back?22:28,y+pose12([5,5,6,7,7,6,5,4],phase),id,p,true);
      else paintLimb(sx,y,sx+pose12([-3,-3,-4,-3,-2,-2,-1,-2],phase),y+pose12([4,5,5,4,3,4,5,4],phase),sx+pose12([-2,-3,-4,-3,-2,-1,0,-1],phase),y+pose12([8,9,8,7,7,8,9,8],phase),id,p,true);
      return;
    }
    if(state==='work'){
      var tap=pose12([-2,0,-1,1,-3,0,1,-1],phase),wx=back?34:pose12([37,39,41,40,38,42,40,37],phase);
      paintLimb(sx,y,back?pose12([36,37,37,36,35,37,38,36],phase):35,y+pose12([3,4,5,4,3,5,4,3],phase),wx,y+5+tap,id,p,false);
      var kx=back?20:26;r.line(kx,y+8,kx+17,y+8,'#5b5d77');r.rect(kx+2,y+7,14,1,'#c0c5d3');r.dot(kx+4+pose12([0,2,4,7,9,6,3,1],phase),y+7,p.accent);
      if(id==='X0'){r.line(wx,y+4+tap,wx+2,y-4+tap,p.accentD);r.dot(wx+2,y-5+tap,'#e1b87a');}
    }else if(state==='wave'||state==='cheer'){
      var hx=state==='wave'?pose12([34,38,42,40,37,42,39,35],phase):pose12([35,38,41,42,40,43,39,35],phase);
      var hy=state==='wave'?pose12([36,28,24,21,23,25,30,38],phase):pose12([39,31,25,21,19,24,30,39],phase);
      paintLimb(sx,y,pose12([34,36,38,38,37,39,36,34],phase),y-pose12([0,3,6,7,6,5,2,-1],phase),hx,hy,id,p,false);
      if(id!=='Feline1'){r.line(hx,hy,hx,hy-4,SKIN);r.line(hx+2,hy,hx+2,hy-3,SKIN);}
    }else if(state==='talk'){
      var ty=y+pose12([5,1,-3,-5,-1,0,3,6],phase),tx=pose12([36,39,42,41,39,43,40,35],phase);paintLimb(sx,y,pose12([34,35,37,38,36,38,36,34],phase),y+pose12([4,3,2,1,3,3,4,5],phase),tx,ty,id,p,false);r.dot(tx+2,ty,SKIN_L);
    }else if(state==='read'){
      // A book is in front of the chest. In rear view its pages are painted
      // first and disappear under the back, rather than becoming a backpack.
      var bx=(back?19:side?28:20)+pose12([0,0,0,1,1,0,-1,-1],phase),by=y+(back?-2:2)+pose12([0,1,1,0,-1,-1,0,0],phase);
      r.poly([[bx,by],[bx+7,by-1],[bx+14,by+1],[bx+14,by+11],[bx+7,by+9],[bx,by+10]],'#795062');r.rect(bx+1,by+1,5,7,'#e9d7b8');r.rect(bx+8,by+2,5,7,'#f4e3c5');r.line(bx+7,by,bx+7,by+8,'#b18e88');
      for(var j=0;j<3;j++){r.line(bx+2,by+3+j*2,bx+5,by+3+j*2,'#baa69c');r.line(bx+9,by+4+j*2,bx+12,by+4+j*2,'#baa69c');}
      if(q>=3&&q<=5){var pageX=pose12([0,0,0,12,8,4,0,0],phase);r.poly([[bx+7,by+1],[bx+pageX,by],[bx+8,by+8]],'#fff3d7');}
      paintLimb(sx,y,back?pose12([36,37,38,37,36,35,36,37],phase):35,y+pose12([5,6,6,5,4,5,6,5],phase),back?33:bx+12,by+9,id,p,false);
    }else if(state==='coffee'){
      var cy=pose12(back?[-1,-4,-9,-13,-12,-8,-3,0]:[2,-1,-5,-8,-8,-4,0,3],phase)+y,cx=back?27:pose12([38,38,37,36,36,37,39,39],phase);
      paintLimb(sx,y,pose12([35,36,37,37,36,35,35,34],phase),y+pose12([4,3,1,-1,0,2,4,5],phase),cx-1,cy+3,id,p,false);
      r.rect(cx,cy,6,6,'#fff2e5');r.line(cx,cy,cx+5,cy,'#8b5e57');r.line(cx+1,cy+1,cx+1,cy+4,'#ddd0d6');r.line(cx+6,cy+1,cx+7,cy+1,'#d4becb');r.line(cx+7,cy+1,cx+7,cy+4,'#d4becb');r.dot(cx+6,cy+4,'#d4becb');
      if(q<3||q>4){r.dot(cx+1+pose12([0,1,0,0,0,-1,0,1],phase),cy-3,'#bcaebd');r.dot(cx+3,cy-5-pose12([0,0,1,0,0,0,1,0],phase),'#bcaebd');}
    }else if(state==='nap'){
      paintLimb(sx,y,pose12([33,33,32,31,30,31,32,33],phase),y+pose12([5,6,7,8,8,7,6,5],phase),pose12([25,24,23,22,23,24,25,24],phase),y+pose12([5,6,7,7,8,7,6,5],phase),id,p,false);
    }else if(state==='carry'){
      var lift=pose12([0,-1,-2,-1,0,1,0,-1],phase),trayShift=pose12([0,1,1,0,-1,-1,0,0],phase);sx+=trayShift;
      paintLimb(sx,y,pose12([35,36,37,36,35,34,35,36],phase),y+pose12([5,4,3,4,5,6,5,4],phase),back?33:39,y+4+lift,id,p,false);
      var trayX=(back?14:29)+trayShift;r.line(trayX,y+3+lift,trayX+16,y+3+lift,'#e3c9ab',2);r.line(trayX+2,y+5+lift,trayX+14,y+5+lift,p.accentD);r.rect(trayX+4,y+lift,4,3,'#bd875e');r.rect(trayX+10,y+lift,4,3,'#deb88a');r.dot(trayX+5,y+lift,'#f1d49d');r.dot(trayX+12,y+1+lift,'#98694c');
    }else if(moving){
      var ex=sx+sw*.55,ey=y+4-(running?1:0),hx=sx+sw*(running?.95:.8),hy=y+8-(running?2:0)-Math.abs(sw)*.22;paintLimb(sx,y,ex,ey,hx,hy,id,p,false);
    }else if(state==='sit'){
      paintLimb(sx,y,pose12([34,35,36,37,36,35,34,33],phase),y+pose12([5,4,2,0,1,3,5,6],phase),pose12([32,34,38,40,38,36,33,31],phase),y+pose12([8,7,4,1,2,5,8,9],phase),id,p,false);
    }else if(state==='idle'){
      var iy=y+pose12([8,9,8,7,1,-6,-2,8],phase),ix=sx+pose12([2,3,4,3,4,4,6,1],phase);
      paintLimb(sx,y,sx+pose12([3,3,4,4,4,4,4,3],phase),y+pose12([4,5,4,3,0,-2,0,4],phase),ix,iy,id,p,false);
      if(id==='C0'&&q===5&&!back)r.dot(ix,iy-1,p.accent);
      if(id==='X0'&&q===6){r.line(ix,iy,ix+3,iy-7,p.accentD);r.dot(ix+3,iy-8,'#edcb88');}
    }else paintLimb(sx,y,sx+pose12([3,3,4,4,3,2,2,3],phase),y+pose12([4,5,4,3,3,4,5,4],phase),sx+pose12([2,3,4,3,2,1,0,1],phase),y+pose12([8,9,8,7,7,8,9,8],phase),id,p,false);
  }
  // Signature actions redraw twelve coordinate poses from their authored joint charts.
  // No bitmap is stretched, blended or copied to manufacture an in-between pose.
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
  function signatureArm(r,id,p,side,back,bob,lean,state,phase,screenLeft){
    var physicalFar=side&&!back?!screenLeft:screenLeft,a=pose12(signatureJoints[state][screenLeft?'far':'near'],phase),shoulder=torsoGeometry(side,back,bob,lean).shoulder(physicalFar),sx=shoulder.x,sy=shoulder.y,hx=a[2]+lean,hy=a[3]+bob;
    if(state==='c0_headset')hy+=pose12(signatureMotion[state].nod,phase);
    if(back&&state==='x0_palette'&&screenLeft)hx+=10;
    limb(r,sx,sy,a[0]+lean,a[1]+bob,hx,hy,id,p,physicalFar,state==='f1_paws');
  }
  function brush(r,hx,hy,tx,ty,p,colour){tx=Math.max(2,Math.min(44,tx));r.line(hx,hy,tx,ty,p.accentD,2);r.line(hx,hy,tx,ty,'#d9b27f');r.line(tx,ty,tx+1,ty-3,p.hairD,2);r.dot(tx+1,ty-3,colour||p.accent);}
  function signatureProps(r,id,p,side,back,bob,lean,state,phase){
    var q=phase8(phase),a=pose12(signatureJoints[state].near,phase),hx=a[2]+lean,hy=a[3]+bob;
    if(state==='c0_debug'){
      var x=pose12([32,31,30,29,29,30,31,32],phase),y=pose12([37,34,31,30,31,32,34,37],phase)+bob,w=pose12([12,14,16,17,17,16,14,12],phase),h=pose12([10,12,14,15,15,14,12,10],phase);
      r.rect(x,y,w,h,INK);r.rect(x+1,y+1,w-2,h-2,p.clothD);r.line(x+1,y+2,x+w-2,y+2,p.accentD);r.dot(x+2,y+1,p.accent);
      for(var row=0;row<3;row++){var length=pose12([3,5,6,8,7,6,4,2],phase)-row;if(length>0)r.line(x+3,y+4+row*3,x+3+length,y+4+row*3,row===q%3?p.accent:p.clothL);}
      r.rect(x+w-4,y+h-3,2,1,q===5?'#a8e5ea':p.accentD);
    }else if(state==='x0_paint'){
      var tx=pose12([39,42,44,44,42,40,39,37],phase)+lean,ty=pose12([36,29,25,23,24,29,33,37],phase)+bob;
      var band=pose12([[[39,34],[39.33,33.33],[39.67,32.67],[40,32]],[[40,30],[40.67,29.33],[41.33,28.67],[42,28]],[[41,27],[41.67,26.33],[42.33,25.67],[43,25]],[[39,24],[40.33,23.67],[41.67,23.33],[43,23]],[[37,25],[39,23.67],[41,23.33],[43,24]],[[36,27],[38,25],[41,25],[44,27]],[[35,29],[37,27],[41,27],[44,29]],[[37,31],[39,30.33],[41,30.33],[43,31]]],phase);
      for(var k=1;k<band.length;k++){r.line(band[k-1][0],band[k-1][1]+bob,band[k][0],band[k][1]+bob,k%2?p.accent:'#d5b4e7',2);}
      brush(r,hx,hy,tx,ty,p,q<4?p.accent:'#d5b4e7');
    }else if(state==='x0_palette'){
      var px=(back?32:side?28:21)+pose12([0,1,1,0,-1,-1,0,0],phase),py=43+bob+pose12([1,1,0,-1,0,1,0,-1],phase);
      r.poly([[px,py+1],[px+4,py-1],[px+10,py],[px+12,py+3],[px+10,py+7],[px+3,py+8],[px-1,py+5]],'#d9b27f');
      r.line(px+1,py+5,px+4,py+7,'#79515e');r.rect(px+2,py+1,2,2,p.accent);r.rect(px+6,py+1,2,2,'#d5b4e7');r.rect(px+8,py+4,2,2,p.clothL);r.dot(px+3,py+5,p.hairD);
      var tx=pose12([42,40,36,32,34,41,43,39],phase)+(back?6:0),ty=pose12([30,35,41,44,43,29,35,35],phase)+bob;if(tx>45)tx=45;
      brush(r,hx,hy,tx,ty,p,q<3?p.accent:q<6?'#d5b4e7':p.clothL);if(q===6)r.line(px+7,py+5,px+9,py+6,p.accentD);
    }else if(state==='x0_sketch'){
      var bx=pose12([22,22,23,23,21,21,22,22],phase),by=pose12([38,38,37,35,25,1,2,26],phase)+(q>=5&&q<=6?0:bob),bw=21,bh=17;
      r.rect(bx,by,bw,bh,'#79515e');r.rect(bx+1,by+1,bw-2,bh-2,back?'#d9b27f':'#fff1dd');r.line(bx+2,by+bh-2,bx+bw-3,by+bh-2,'#b57b8f');
      if(back){r.line(bx+3,by+3,bx+17,by+3,'#e8d8b2');r.line(bx+4,by+4,bx+4,by+12,'#79515e');}
      else{
        r.line(bx+5,by+10,bx+5,by+6,p.hairD);r.line(bx+5,by+6,bx+8,by+4,p.hairD);r.line(bx+8,by+4,bx+11,by+6,p.hairD);r.line(bx+11,by+6,bx+15,by+4,p.hairD);
        if(q>=2){r.line(bx+15,by+4,bx+16,by+10,p.hairD);r.line(bx+5,by+10,bx+8,by+13,p.hairD);r.line(bx+8,by+13,bx+14,by+13,p.hairD);r.line(bx+14,by+13,bx+16,by+10,p.hairD);}
        if(q>=3){r.dot(bx+8,by+9,p.accentD);r.dot(bx+13,by+9,p.accentD);r.line(bx+10,by+11,bx+11,by+11,p.accent);}
      }
      if(q<4)brush(r,hx,hy,bx+pose12([8,11,15,12,12,12,12,10],phase),by+pose12([7,6,5,10,10,10,10,8],phase),p,p.accentD);
    }else if(state==='f1_yarn'){
      var ballX=pose12([37,39,42,40,36,33,35,37],phase),ballY=57;
      r.poly([[ballX-3,ballY-3],[ballX+2,ballY-4],[ballX+4,ballY-1],[ballX+4,ballY+2],[ballX+1,ballY+4],[ballX-3,ballY+3],[ballX-4,ballY]],'#4c3557');
      r.poly([[ballX-2,ballY-2],[ballX+1,ballY-3],[ballX+3,ballY-1],[ballX+3,ballY+1],[ballX+1,ballY+3],[ballX-2,ballY+2],[ballX-3,ballY]],'#8a8498');
      r.line(ballX-2,ballY-2,ballX+3,ballY+1,p.hairM);r.line(ballX-3,ballY,ballX+1,ballY+3,'#4c3557');r.line(ballX,ballY-3,ballX-1,ballY+2,p.hairL);r.dot(ballX+2,ballY-1,p.hairM);
      r.line(ballX-3,ballY+2,28,60,p.accentD);r.line(28,60,23,58,p.accent);r.line(23,58,20,60,p.accentD);
      if(q>=2&&q<=5)r.line(hx,Math.min(56,hy+1),ballX-1,ballY-2,p.accentD);
    }else if(state==='f1_groom'){
      var f=pose12(signatureJoints[state].far,phase),cx=f[2]+lean,cy=f[3]+bob;
      r.line(cx-3,cy+1,cx+3,cy+1,p.accentD,2);for(var tooth=-3;tooth<=3;tooth+=2)r.line(cx+tooth,cy+2,cx+tooth,cy+4,p.accent);
      r.line(cx+3,cy+1,cx+5,cy-2,'#dbb57e',2);
    }
  }
  function signatureTail(r,id,p,state,phase,bob){
    var q=phase8(phase);
    if(id!=='Feline1')return;
    if(state!=='f1_groom'){tail(r,id,p,phase,bob,false,state);return;}
    var t=new R(),tipX=pose12([8,7,6,5,6,8,9,8],phase),tipY=pose12([38,36,34,35,37,40,39,38],phase);
    t.line(19,46+bob,13,50+bob,p.hairD,5);t.line(13,50+bob,7,47+bob,p.hair,5);t.line(7,47+bob,tipX-1,tipY+5,p.hair,4);t.line(tipX-1,tipY+5,tipX+1,tipY,p.hair,4);
    t.line(15,49+bob,8,46+bob,p.hairL,2);t.line(tipX,tipY+2,tipX,tipY+6,p.hairM);t.rect(tipX,tipY,3,2,p.hairL);stamp(r,t);r.tailMask=t.rows;
  }
  function signatureOverlay(r,id,p,back,bob,lean,state,phase,nod){
    var q=phase8(phase),y=8+bob+nod;
    if(state==='c0_headset'){
      // Far ear-cup and fingertips stay on the outer head silhouette.
      r.rect(38+lean,y+14,3,7,p.clothD);r.line(40+lean,y+15,40+lean,y+19,p.accentD);
      if(q>=2&&q<=5){r.line(40+lean,y+17,42+lean,y+17,SKIN);r.dot(10+lean,y+17,SKIN);}
    }else if(state==='c0_overclock'&&q>=2&&q<=6){
      if(!back){r.line(21+lean,y+14,26+lean,y+14,p.accent);r.line(31+lean,y+14,35+lean,y+14,p.accent);r.dot(25+lean,y+19,'#a8e5ea');}
      else r.line(12+lean,y+16,12+lean,y+20,p.accent);
      var ring=pose12([[[8,26],[43,15]],[[8,25],[43,17]],[[8,24],[43,19]],[[7,20],[43,25]],[[9,16],[42,30]],[[13,13],[40,33]],[[8,22],[43,17]],[[8,24],[43,15]]],phase);
      ring.forEach(function(pt,j){r.line(pt[0],pt[1]+bob,pt[0]+(j?-2:2),pt[1]+bob,p.accentD);r.dot(pt[0],pt[1]+bob-1,p.accent);});
    }
  }
  function signatureFrame(id,state,phase,direction,expression){
    var r=new R(),subject=new R(),p=palettes[id],q=phase8(phase),side=direction==='right'||direction==='left',back=direction==='back',m=signatureMotion[state],bob=pose12(m.bob,phase),lean=pose12(m.lean,phase),nod=pose12(m.nod,phase),trail=pose12(m.trail,phase),crouch=state==='f1_yarn';r.owner=id;subject.owner=id;r.back=back;subject.back=back;
    signatureTail(r,id,p,state,phase,bob);
    if(!back)longHair(subject,id,p,side,bob,trail,lean);
    if(back)signatureProps(subject,id,p,side,true,bob,lean,state,phase);
    legs(subject,id,p,side,back,crouch?'sit':'idle',phase,lean);
    var rearArm=side&&!back?false:true;signatureArm(subject,id,p,side,back,bob,lean,state,phase,rearArm);var rearLimb=subject.lastLimb,otherRear=null;
    if(back){signatureArm(subject,id,p,side,true,bob,lean,state,phase,false);otherRear=subject.lastLimb;}
    body(subject,id,p,side,back,bob,lean,crouch?'sit':'idle',phase);
    if(back)longHair(subject,id,p,side,bob,trail,lean);
    var h=new R(),headState=state==='x0_sketch'&&q>=4||state==='f1_paws'&&q>=2&&q<=5?'cheer':'idle';
    head(h,id,p,side,back,bob+nod+(id==='Feline1'?2:0),state==='f1_groom'?-lean:lean,headState,phase,expressionFor(id,state,phase,expression));
    // Grooming deliberately looks toward the held tail; ordinary locomotion
    // keeps the same forward-facing eye plane as every other right view.
    stamp(subject,h,state==='f1_groom'&&!back);
    r.headBounds=facingHead(h.headBounds,state==='f1_groom'&&!back);
    if(!back){
      signatureProps(subject,id,p,side,false,bob,lean,state,phase);
      if(side)foregroundForearm(subject,rearLimb);else signatureArm(subject,id,p,false,false,bob,lean,state,phase,true);
      signatureArm(subject,id,p,side,false,bob,lean,state,phase,side?true:false);
    }else if(state==='f1_paws'){
      // Raised paws can touch the head silhouette. Restore each complete distal
      // chain, never a detached palm after the head has covered its sleeve.
      foregroundForearm(subject,rearLimb);foregroundForearm(subject,otherRear);
    }
    signatureOverlay(subject,id,p,back,bob,lean,state,phase,nod);
    stamp(r,subject);
    if(id==='Feline1'&&r.tailMask)for(var y=1;y<H-1;y++)for(var x=1;x<W-1;x++)if(r.tailMask[y][x]&&!subject.rows[y][x]&&r.rows[y][x]===r.tailMask[y][x]&&(subject.rows[y][x-1]||subject.rows[y][x+1]||subject.rows[y-1][x]||subject.rows[y+1][x]))r.dot(x,y,INK);
    return r.canvas(direction==='left');
  }
  function build(id,state,phase,direction,expression){
    if(signatureOwners[state])return signatureFrame(id,state,phase,direction,expression);
    var r=new R(),p=palettes[id],side=direction==='left'||direction==='right',back=direction==='back',moving=state==='walk'||state==='run';r.owner=id;r.back=back;
    var m=gait(state,phase),motion=poseMotion[state]||poseMotion.idle,q=phase8(phase);
    var bob=moving?m.bodyY:pose12(motion.bob,phase),lean=moving?(side?m.lean:0):pose12(motion.lean,phase),trail=moving?m.hairLag:pose12(motion.trail,phase);
    var nod=moving?0:pose12(motion.nod,phase);
    if(!back)longHair(r,id,p,side,bob,trail,lean);
    tail(r,id,p,phase,bob,side,state);
    legs(r,id,p,side,back,state,phase,lean);
    var rearArm=side&&!back?false:true;arms(r,id,p,side,back,bob,lean,state,phase,rearArm);var farLimb=r.lastLimb,otherRear=null;
    // Away-facing hands and their front-held props exist in front of the body.
    // Painting them here lets the back garment, head and long hair occlude them.
    if(back){arms(r,id,p,side,true,bob,lean,state,phase,false);otherRear=r.lastLimb;}
    body(r,id,p,side,back,bob,lean,state,phase);
    if(back)longHair(r,id,p,side,bob,trail,lean);
    // Leave a small head margin for F1's ears at the running up-position.
    head(r,id,p,side,back,bob+nod+(id==='Feline1'?2:0),lean,state,phase,expressionFor(id,state,phase,expression));
    if(!back){if(['work','read','nap','carry','coffee','wave','cheer'].indexOf(state)>=0)foregroundForearm(r,farLimb);arms(r,id,p,side,false,bob,lean,state,phase,side?true:false);if(side&&['work','read','coffee','carry'].indexOf(state)>=0)arms(r,id,p,side,false,bob,lean,state,phase,false,true);}else if(state==='wave'||state==='cheer'){foregroundForearm(r,farLimb);foregroundForearm(r,otherRear);}
    tailJoin(r,id,p,side,back,bob,lean,state,phase,nod);
    return r.canvas(direction==='left');
  }
  function frame(id,state,index,direction,expression){
    if(!known[id])return null;state=states[state]&&(!signatureOwners[state]||signatureOwners[state]===id)?state:'idle';var count=states[state].count,n=Number(index);if(!Number.isFinite(n))n=0;var p=((Math.floor(n)%count)+count)%count;
    direction=['front','back','left','right'].indexOf(direction)>=0?direction:'front';
    var key=[id,state,p,direction,expression||'auto'].join('|');return cache[key]||(cache[key]=build(id,state,p,direction,expression));
  }
  function draw(ctx,id,state,index,x,y,width,facingLeft,direction,expression){
    direction=direction|| (facingLeft?'left':state==='walk'||state==='run'||state==='work'?'right':'front');var c=frame(id,state,index,direction,expression);if(!c)return false;
    width=width||27;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(c,x,y,width,width*H/W);ctx.restore();return true;
  }
  window.StudioHeroSprites={width:W,height:H,palettes:gbaPalettes,characters:characters,states:states,uniqueActions:uniqueActions,ready:Promise.resolve(true),isReady:function(){return true;},draw:draw,frame:frame};
}());
