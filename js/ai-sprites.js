/* AI studio map sprites v9: twelve freshly rasterized poses per action, preserving each original cycle duration.
 * Native 48 x 64 grid, hand-refined at one-pixel resolution and cached. No raster crops are used
 * for map animation. Character credits: studio-credits.html.
 * The earlier detailed illustration remains available only as drawPortrait(). */
(function () {
  'use strict';
  var W=48,H=64,BW=24,BH=32,INK='#292238',SKIN='#ffe0cb',SKIN_D='#dca2a1',WHITE='#fff6e5',FACE_LINE='#9d6373';
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
  Object.keys(palettes).forEach(function(id){var p=palettes[id];p.id=id;p.legShade=mix(p.leg,INK,.15);p.legLight=mix(p.leg,WHITE,.28);p.shoeShade=mix(p.shoe,INK,.2);p.eyeLight=mix(p.eye,WHITE,.45);});
  function sample8(values,frame){
    if(window.StudioMotion)return StudioMotion.sample8(values,frame);
    var q=((frame%12)+12)%12*8/12,a=Math.floor(q),t=q-a,b=(a+1)%8;
    function blend(x,y){return Array.isArray(x)?x.map(function(v,i){return blend(v,y[i]);}):x+(y-x)*t;}
    return blend(values[a],values[b]);
  }
  function key8(frame){return window.StudioMotion?StudioMotion.key8(frame):Math.round((((frame%12)+12)%12)*8/12)%8;}
  function angle8(values,frame){
    var q=((frame%12)+12)%12*8/12,a=Math.floor(q),b=(a+1)%8,t=q-a,d=values[b]-values[a];
    while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return values[a]+d*t;
  }
  function labels12(labels){return[labels[0],labels[1]+' · 起势',labels[1],labels[2],labels[3]+' · 过渡',labels[3],labels[4],labels[5]+' · 衔接',labels[5],labels[6],labels[7]+' · 收势',labels[7]];}
  var states={
    idle:{count:12,frameMs:250*8/12,phaseLabels:['放松','吸气','轻转头','停留','呼气','回望','松肩','归位']},
    walk:{count:12,frameMs:100*8/12,stridePixels:20,phaseLabels:['右脚落地','右脚承重','左脚经过','左脚前摆','左脚落地','左脚承重','右脚经过','右脚前摆']},
    run:{count:12,frameMs:70*8/12,stridePixels:36,phaseLabels:['右脚落地','蹬地','腾空','前摆','左脚落地','蹬地','腾空','前摆']},
    work:{count:12,frameMs:100*8/12,phaseLabels:['准备','左手落键','左手回弹','右手伸出','右手落键','右手回弹','双手换位','回到键位']},
    wave:{count:12,frameMs:125*8/12,phaseLabels:['抬肩','举手','展开','向外挥','向内挥','再挥一次','收手','放下']},
    talk:{count:12,frameMs:100*8/12,phaseLabels:['起话','抬手','摊掌','强调','停顿','点头','收手','听对方说']},
    read:{count:12,frameMs:200*8/12,phaseLabels:['捧书','低头','阅读','捏住页角','翻页','抚平','继续读','抬眼']},
    coffee:{count:12,frameMs:175*8/12,phaseLabels:['握杯','抬杯','凑近','轻吹','喝一口','离开嘴边','放低','回到手边']},
    nap:{count:12,frameMs:230*8/12,phaseLabels:['放松','吸气','肩膀抬起','睡熟','呼气','头轻垂','回正','平稳呼吸']},
    sit:{count:12,frameMs:180*8/12,phaseLabels:['坐稳','伸展','换重心','轻晃脚','整理衣角','放松手','收腿','坐回原位']},
    carry:{count:12,frameMs:110*8/12,phaseLabels:['托稳','轻抬','调整左手','抬高','调整右手','放低','稳住','归位']},
    cheer:{count:12,frameMs:115*8/12,phaseLabels:['蓄力','举臂','踮脚','欢呼','落下','再举手','收臂','站稳']}
  };
  Object.keys(states).forEach(function(name){states[name].phaseLabels=labels12(states[name].phaseLabels);});
  states.walk.phaseLabels=['右脚落地','接住重心','压低承重','左脚经过','右脚推离','重心抬高','左脚落地','接住重心','压低承重','右脚经过','左脚推离','重心抬高'];
  states.run.phaseLabels=['右脚触地','缓冲承重','右脚蹬地','离地腾空','收起后脚','左脚前摆','左脚触地','缓冲承重','左脚蹬地','离地腾空','收起后脚','右脚前摆'];
  // Each life action is rerasterized at twelve coordinate samples over its original cycle.
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
  function life(state,phase){var p=lifeMotion[state]||lifeMotion.idle;return{bob:sample8(p.bob,phase),head:sample8(p.head,phase),lean:sample8(p.lean,phase),trail:sample8(p.trail,phase)};}

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
    var item={id:a[0],name:a[1],description:a[2],count:12,frameMs:a[3]*8/12,phaseLabels:labels12(a[4]),uniqueFor:id};
    states[item.id]=item;actionOwner[item.id]=id;actionMeta[item.id]=item;return item;
  });});
  function uniqueActions(id){return(signatureActions[id]||[]).map(function(a){return{id:a.id,name:a.name,description:a.description,count:a.count,frameMs:a.frameMs,phaseLabels:a.phaseLabels.slice()};});}
  // Signature actions have their own body rhythm and hand choreography. Each
  // list keeps eight authored key poses and redraws twelve intervening poses.
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
  function signaturePose(state,i){var m=signatureMotion[state];return{bob:sample8(m[0],i),head:sample8(m[1],i),lean:sample8(m[2],i),trail:sample8([0,-.5,-1,-.5,0,.5,1,.5],i)};}
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
    nativeArmDetails(hi,this,this.paletteOwner);
    if(this.after)this.after(hi);
    if(this.palette)limitPalette(hi,this.palette,this.paletteOwner);
    var rows=hi.rows;
    // Keep deliberate pixel clusters intact: no automatic chamfer/dither pass.
    var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');
    for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(!rows[y][x]&&((x&&rows[y][x-1]&&rows[y][x-1]!==INK)||(x<W-1&&rows[y][x+1]&&rows[y][x+1]!==INK)||(y&&rows[y-1][x]&&rows[y-1][x]!==INK)||(y<H-1&&rows[y+1][x]&&rows[y+1][x]!==INK))){g.fillStyle=INK;g.fillRect(flip?W-1-x:x,y,1,1);}
    for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++)if(rows[yy][xx]){g.fillStyle=rows[yy][xx];g.fillRect(flip?W-1-xx:xx,yy,1,1);}return c;
  };
  function star(r,x,y,color){r.rect(x,y-1,1,3,color);r.rect(x-1,y,3,1,color);}
  // A right-front turn exposes the screen-left shoulder. Forward reach is
  // separate from that lateral depth: props stay ahead, while the shoulder
  // and elbow reconnect to the visible side of the ribcage.
  function correctDepth(p,side,back){return side&&!back;}
  function actionPlane(target,role,centre,paired,relaxed,heldFar,raised){
    var dx=-2.5,projection={role:role,centre:centre,paired:paired,relaxed:relaxed,heldFar:heldFar,raised:raised};
    return{target:target,armProjection:projection,
      dot:function(x,y,c){target.dot(x+(raised&&Number.isFinite(projection.fingerShift)?projection.fingerShift:dx),y,c);},
      rect:function(x,y,w,h,c){target.rect(x+dx,y,w,h,c);},
      line:function(x1,y1,x2,y2,c,size){target.line(x1+dx,y1,x2+dx,y2,c,size);},
      poly:function(points,c){target.poly(points.map(function(q){return[q[0]+dx,q[1]];}),c);}};
  }
  function limb(r,shoulder,elbow,hand,sleeve,skin){
    if(r.armProjection){
      var projection=r.armProjection,far=projection.role==='far',authoredHandX=hand[0];
      shoulder=[shoulder[0]+(far?5:-4),shoulder[1]];
      var handX=projection.paired?projection.centre*2-hand[0]-2.5:projection.relaxed?hand[0]+(far?8:-7):far&&projection.heldFar?hand[0]-2.5:hand[0]+(far?5:-2.5);
      if(projection.raised){
        handX=7.5-(hand[0]-18)*.9+(shoulder[0]-9);
        var lift=Math.max(0,Math.min(1,(shoulder[1]-hand[1])/9));
        elbow=[(shoulder[0]+handX)*.5-lift*1.5,(shoulder[1]+hand[1])*.5+.5];
      }else elbow=[shoulder[0]+(handX-shoulder[0])*.5+(far?-.35:.35),elbow[1]];
      hand=[Math.max(2,Math.min(21.5,handX)),hand[1]];projection.fingerShift=hand[0]-authoredHandX;
      r=r.target;
    }
    r.line(shoulder[0],shoulder[1],elbow[0],elbow[1],sleeve,2);
    r.line(elbow[0],elbow[1],hand[0],hand[1],SKIN,2);
    if(!r.hands)r.hands=[];
    r.hands.push({elbow:[elbow[0]*2,elbow[1]*2],hand:[hand[0]*2,hand[1]*2],sleeve:sleeve,far:skin===SKIN_D});
  }
  // A four-pixel palm, one-pixel thumb and a narrow cuff read as a hand rather
  // than the unbroken rectangular end of a sleeve. Clip detail to visible skin
  // so books, cups and the rear silhouette retain their authored occlusion.
  function nativeArmDetails(r,source,p){
    if(!p||!source.hands)return;
    source.hands.forEach(function(a){
      var x=Math.round(a.hand[0]),y=Math.round(a.hand[1]),ex=Math.round(a.elbow[0]),ey=Math.round(a.elbow[1]);
      function skinAt(px,py){return py>=0&&py<H&&px>=0&&px<W&&(r.rows[py][px]===SKIN||r.rows[py][px]===SKIN_D);}
      function dot(px,py,c){px=Math.round(px);py=Math.round(py);if(skinAt(px,py))r.dot(px,py,c);}
      var visible=0;for(var yy=y;yy<y+4;yy++)for(var xx=x;xx<x+4;xx++)if(skinAt(xx,yy))visible++;
      if(!visible)return;
      var horizontal=Math.abs(x-ex)>=Math.abs(y-ey);
      // The same skin base belongs to both hands; only the lower edge is shaded.
      for(var py=y;py<y+4;py++)for(var px=x;px<x+4;px++)dot(px,py,SKIN);
      for(var k=0;k<3;k++)dot(x+k,y+3,SKIN_D);
      dot(x+3,y+2,SKIN_D);dot(x+1,y+1,a.far?SKIN:WHITE);
      if(horizontal){for(var i=0;i<4;i++)dot(ex,ey+i,a.sleeve);dot(ex+1,ey+3,SKIN_D);}
      else{for(var i=0;i<4;i++)dot(ex+i,ey,a.sleeve);dot(ex,ey+1,SKIN_D);}
      if(visible>=6){
        var tx=horizontal?x+1:y<ey?x+4:x-1,ty=horizontal?y+4:y+1;
        // A thumb may extend into empty space, but never across a held object.
        if(tx>=0&&tx<W&&ty>=0&&ty<H&&!r.rows[ty][tx])r.dot(tx,ty,SKIN);
      }
    });
  }
  function limitedColours(p,id){
    return [INK,SKIN,SKIN_D,FACE_LINE,'#edb1ad',WHITE,p.hair,p.shade,p.light,p.cloth,p.dark,p.accent,p.eye,p.eyeLight,p.leg,p.legShade,p.legLight,p.shoe,p.shoeShade,
      '#80584a','#c5a575','#53617c','#9bcbd0','#d5b4d9',id==='gemini'?'#c6a458':p.eye,id==='gemini'?'#e1cb91':p.eyeLight].filter(function(c,i,a){return a.indexOf(c)===i;});
  }
  function limitPalette(r,palette,p){
    // New anatomical ramps are explicit paint colours. Keep unrelated costume
    // mixes on the established palette rather than letting a new sock shadow
    // steal the closest-colour match of a jewel, ribbon or hair highlight.
    var reserved=p?[FACE_LINE,p.eyeLight,p.legShade,p.legLight,p.shoeShade,'#e1cb91']:[];
    var matches=palette.filter(function(c){return reserved.indexOf(c)<0;});
    var memo=Object.create(null),rgb=matches.map(function(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];});
    for(var y=0;y<r.h;y++)for(var x=0;x<r.w;x++)if(r.rows[y][x]){
      var color=r.rows[y][x];if(palette.indexOf(color)>=0)continue;
      if(!memo[color]){var a=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)],best=0,score=Infinity;
        rgb.forEach(function(b,i){var d=(a[0]-b[0])*(a[0]-b[0])*.8+(a[1]-b[1])*(a[1]-b[1])*1.1+(a[2]-b[2])*(a[2]-b[2]);if(d<score){score=d;best=i;}});memo[color]=matches[best];}
      r.rows[y][x]=memo[color];
    }
  }
  function gait(state,phase){
    if(window.StudioGait)return StudioGait.sample(state,phase);
    return{bodyY:0,lean:0,armSwing:0,hairLag:0,near:{hip:{x:26,y:48},knee:{x:27,y:54},ankle:{x:27,y:59},planted:true},far:{hip:{x:21,y:47},knee:{x:20,y:53},ankle:{x:20,y:57},planted:true}};
  }
  function nativeShoe(r,ankle,p,far,planted,roll,side,back){
    var x=Math.round(ankle.x),y=Math.round(ankle.y),base=p.shoe;
    if(!side){
      // Front shows a centred rounded toe; the rear shows a narrower heel and
      // its upright seam. Neither reuses a sideways shoe silhouette.
      r.poly(back?[[x-2,y],[x+2,y],[x+3,y+3],[x+2,y+3],[x-2,y+3],[x-3,y+2]]:[[x-2,y],[x+2,y],[x+3,y+2],[x+2,y+3],[x-2,y+3],[x-3,y+2]],base);
      r.line(x-2,y+3,x+2,y+3,p.shoeShade);
      if(back){r.line(x-2,y+1,x+2,y+1,p.shoeShade);r.line(x,y+1,x,y+2,p.shoeShade);}
      else r.line(x-1,y+2,x+1,y+2,WHITE);
      return;
    }
    var heel=roll==='toe'?-1:0,toe=roll==='heel'?-1:0;
    // The ankle sits above the rear third, with an upright heel behind it and
    // a longer stepped toe pointing in the same direction as the face.
    if(planted){
      r.poly([[x-2,y-1+heel],[x+1,y-1+heel],[x+2,y+toe],[x+5,y+1+toe],[x+5,y+3+toe],[x-2,y+3+heel]],base);
      r.line(x-2,y+3+heel,x+5,y+3+toe,p.shoeShade);
      r.line(x-2,y+heel,x-2,y+2+heel,p.shoeShade);r.line(x+2,y+1+toe,x+4,y+1+toe,far?p.shoe:WHITE);
    }else{
      r.poly([[x-2,y-1],[x+1,y],[x+4,y+2],[x+4,y+3],[x,y+3],[x-2,y+1]],base);
      r.line(x-2,y+1,x+3,y+3,p.shoeShade);r.dot(x+3,y+2,WHITE);
    }
  }
  function nativeLegs(r,p,pose,side,back){
    function draw(j,far){
      var hip={x:j.hip.x,y:j.hip.y},knee={x:j.knee.x,y:j.knee.y},ankle={x:j.ankle.x,y:j.ankle.y};
      if(!side){
        // Toward/away motion changes depth and lift, not a giant horizontal split.
        var mid=far?19:29,shift=side?0:(j.ankle.x-j.hip.x)*.22;
        hip.x=mid;knee.x=mid+shift;ankle.x=mid+shift;
      }
      r.line(hip.x,hip.y,knee.x,knee.y,p.leg,4);r.line(knee.x,knee.y,ankle.x,ankle.y,p.leg,3);
      r.line(hip.x,hip.y,knee.x,knee.y,p.legShade,1);r.line(knee.x,knee.y,ankle.x,ankle.y,p.legShade,1);
      if(!far)r.line(knee.x+2,knee.y+1,ankle.x+1,ankle.y-1,p.legLight,1);
      nativeShoe(r,ankle,p,far,j.planted,j.roll,side,back);
    }
    draw(pose.far,true);draw(pose.near,false);
  }
  function nativeMovingArm(r,p,pose,side,back,far,state){
    var swing=pose.armSwing*(far?-1:1),sx=(correctDepth(p,side,back)?(far?31:18):(far?18:31))+pose.lean,sy=38+pose.bodyY;
    if(!side)sx=far?14:33;
    var ex=sx+swing*.72,ey=sy+5-Math.abs(swing)*.15,hx=ex+swing*.55,hy=sy+10-Math.abs(swing)*.55;
    if(window.StudioGait&&StudioGait.arm){
      var joints=StudioGait.arm(state,pose,{x:sx,y:sy},far);
      ex=joints.elbow.x;ey=joints.elbow.y;hx=joints.wrist.x;hy=joints.wrist.y;
      if(!side){ex=sx+(ex-sx)*.35;hx=sx+(hx-sx)*.35;}
    }
    var sleeve=far?p.dark:p.cloth;
    r.line(sx,sy,ex,ey,sleeve,4);r.line(ex,ey,hx,hy,SKIN,3);
    if(!far)r.line(sx,sy,ex,ey,p.light,1);
    r.rect(hx-1,hy-1,4,4,SKIN);
    nativeArmDetails(r,{hands:[{elbow:[ex,ey],hand:[hx-1,hy-1],sleeve:sleeve,far:far}]},p);
  }
  function shoe(r,x,y,p,far,side,back){
    if(side){
      r.poly([[x-1,y],[x+.5,y],[x+1,y+.5],[x+2.5,y+1],[x+2.5,y+2],[x-1,y+2]],p.shoe);
      r.line(x-1,y+2,x+2,y+2,p.shoeShade);r.line(x-1,y,x-1,y+1,p.shoeShade);r.dot(x+2,y+1,far?p.shoe:WHITE);
    }else{
      r.poly([[x-1,y],[x+1,y],[x+1.5,y+1],[x+1,y+2],[x-1,y+2],[x-1.5,y+1]],p.shoe);
      r.line(x-1,y+2,x+1,y+2,p.shoeShade);r.line(x-1,y+1,x+1,y+1,back?p.shoeShade:WHITE);if(back)r.dot(x,y,p.shoeShade);
    }
  }
  function legs(r,p,side,back,state,phase,lean){
    var walking=state==='walk'||state==='run',running=state==='run';
    var steps=running?[-4,-2,2,4,2,-2]:[-3,-1,2,3,1,-2],s=walking?steps[phase%6]:0;
    var seated=state==='work'||state==='sit';
    if(correctDepth(p,side,back)){
      if(seated){
        var toe=sample8(state==='sit'?[0,.5,1,1,.5,0,-.5,0]:[0,0,.5,0,-.5,0,.5,0],phase);
        r.line(13,23.5,16,25.5,p.leg,2);r.line(16,25.5,16.5,28.5,p.leg,2);shoe(r,16.5,28.5,p,true,side,back);
        r.line(10.5,24,14.5,26,p.leg,2);r.line(14.5,26,14.5+toe,29.5,p.leg,2);shoe(r,14.5+toe,29.5,p,false,side,back);
      }else{
        r.line(13,23.5,13,28.5,p.leg,2);shoe(r,13,28.5,p,true,side,back);
        r.line(10.5,24,10.5,29.5,p.leg,2);shoe(r,10.5,29.5,p,false,side,back);
      }
      return;
    }
    if(seated){
      var toeX=sample8(state==='sit'?[0,.5,1,1,.5,0,-.5,0]:[0,0,.5,0,-.5,0,.5,0],phase);
      var toeY=sample8(state==='sit'?[0,-.5,-1,-.5,0,.5,0,0]:[0,-.5,0,0,0,-.5,0,0],phase);
      if(side){r.line(10,25,13,27,p.leg,2);r.line(13,27,14,29,p.leg,2);shoe(r,14,29,p,true,side,back);r.line(11,25,16,26,p.leg,2);r.line(16,26,16+toeX,29+toeY,p.leg,2);shoe(r,16+toeX,29+toeY,p,false,side,back);}
      else{r.line(9,25,7,27,p.leg,2);r.line(7,27,8,29,p.leg,2);r.line(14,25,17,27,p.leg,2);r.line(17,27,16+toeX,29+toeY,p.leg,2);shoe(r,8,29,p,back,side,back);shoe(r,16+toeX,29+toeY,p,back,side,back);}return;
    }
    if(side){
      var footFar=10-s*.7,footNear=13+s*.7,farY=walking&&phase%3===1?27:29,nearY=walking&&phase%3===2?28:30;
      // Bent knees, crossed passing poses and planted heels make an actual stride.
      r.line(10+lean,24,10-s*.4,26,p.leg,2);r.line(10-s*.4,26,footFar,farY,p.leg,2);shoe(r,footFar,farY,p,true,side,back);
      r.line(13+lean,24,13+s*.4,27,p.leg,2);r.line(13+s*.4,27,footNear,nearY,p.leg,2);shoe(r,footNear,nearY,p,false,side,back);
    }else{
      var liftA=walking&&phase%6<3?Math.abs(s)*.65:0,liftB=walking&&phase%6>=3?Math.abs(s)*.65:0;
      r.line(9,24,8-s*.3,27,p.leg,2);r.line(8-s*.3,27,8-s*.45,30-liftA,p.leg,2);shoe(r,8-s*.45,30-liftA,p,back,side,back);
      r.line(14,24,15+s*.3,27,p.leg,2);r.line(15+s*.3,27,15+s*.45,30-liftB,p.leg,2);shoe(r,15+s*.45,30-liftB,p,back,side,back);
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
      var span=sample8([3,4,6,7,8,7,5,3],phase),rise=sample8([0,1,2,4,5,3,1,0],phase);
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
    var r=new Raster(W,H),wag=motion?motion.hairLag:sample8([0,-1,-2,-1,0,1,2,1],phase);
    var baseY=Math.round(bob*2),w=wag*.65;
    if(state==='gpt_tea')w=sample8([0,-1,-2,-3,-2,-1,0,1],phase);
    if(state==='deepseek_tail')w=sample8([0,-4,-6,11,14,8,3,0],phase);
    if(state==='gemini_tail')w=sample8([0,1,3,5,4,0,-3,-1],phase);
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
      r.line(5,40+w+baseY,state==='gemini_tail'?sample8([7,8,9,10,12,9,7,7],phase):7,40+w+baseY,p.accent,2);
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
    if(back&&state==='work')return;
    if(correctDepth(p,side,back))r=actionPlane(r,'far',0,false);
    var y=19+bob,swing=[-2,-1,1,2,1,-1][phase%6],run=state==='run',moving=run||state==='walk';
    if(side){
      var sx=10+lean;
      if(moving){var ex=sx-swing*(run?1.3:1),ey=y+2-(run?1:0),hx=ex-(run?2:1),hy=y+4-Math.abs(swing)*.5;limb(r,[sx,y],[ex,ey],[hx,hy],p.dark,SKIN_D);}
      else limb(r,[sx,y],[sx-2,y+2],[sx-2,y+4],p.dark,SKIN_D);
    }else if(back){limb(r,[7,y],[5,y+2],[5,y+4],p.dark,SKIN_D);}
  }
  function head(r,id,p,side,back,bob,lean,state,phase){
    var k=key8(phase);
    var y=5+bob, hx=lean, blink=state==='nap'||state==='idle'&&k===1, happy=state==='wave'||state==='cheer';
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
      r.dot(15+hx,y+12,'#a96678');if(state==='talk'&&k!==1)r.dot(16+hx,y+12,'#a96678');
      r.poly([[6+hx,y+6],[8+hx,y+2],[15+hx,y+2],[18+hx,y+4],[19+hx,y+7],[16+hx,y+6],[15+hx,y+5],[13+hx,y+8],[12+hx,y+5],[10+hx,y+6],[8+hx,y+9],[6+hx,y+10]],p.hair);
      r.line(8+hx,y+3,12+hx,y+2,p.light);r.line(6+hx,y+5,6+hx,y+9,p.shade);
    }else{
      r.poly([[7+hx,y+6],[16+hx,y+5],[18+hx,y+8],[17+hx,y+11],[15+hx,y+13],[8+hx,y+13],[6+hx,y+10]],SKIN);
      r.line(7+hx,y+10,8+hx,y+12,SKIN_D);r.rect(8+hx,y+8,2,3,blink?SKIN:INK);r.rect(14+hx,y+8,2,3,blink?SKIN:INK);
      if(blink){r.rect(7+hx,y+9,3,1,INK);r.rect(14+hx,y+9,3,1,INK);}
      else if(happy){r.dot(7+hx,y+9,INK);r.dot(8+hx,y+8,INK);r.dot(14+hx,y+8,INK);r.dot(15+hx,y+9,INK);r.dot(8+hx,y+10,SKIN);r.dot(14+hx,y+10,SKIN);}
      else{r.dot(8+hx,y+8,WHITE);r.dot(14+hx,y+8,WHITE);r.dot(9+hx,y+10,p.eye);r.dot(15+hx,y+10,id==='gemini'?'#ceab55':p.eye);}
      r.dot(7+hx,y+11,'#eab0af');r.dot(16+hx,y+11,'#eab0af');
      r.dot(12+hx,y+12,'#a96678');if(state==='talk'&&k!==1)r.dot(11+hx,y+12,'#a96678');
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
    if(correctDepth(p,side,back))r=actionPlane(r,'near',0,false,false,false,state==='wave'||state==='cheer');
    var i=phase%12,k=key8(phase),y=19+bob,sx=side?13+lean:16;
    var ease=sample8([0,.5,1,.5,0,-.5,-1,-.5],i);
    if(state==='work'){
      var leftTap=sample8([0,-1,-.5,.5,1,.5,0,-.5],i),rightTap=sample8([1,.5,0,-.5,-1,-.5,.5,1],i);
      if(side){
        limb(r,[sx,y],[16+lean,y+2+leftTap*.5],[19+ease,y+leftTap],p.cloth,SKIN);
        r.rect(18,y+1,5,1,'#8c8aab');
      }else{
        limb(r,[7,y],[6.5-ease*.3,y+2],[10+ease*.5,y+leftTap],p.cloth,SKIN);
        limb(r,[16,y],[17+ease*.3,y+2],[13-ease*.5,y+rightTap],p.cloth,SKIN);
        r.rect(8,y+2,9,1,'#8c8aab');
      }
    }else if(state==='wave'||state==='cheer'){
      var cheer=state==='cheer',handX=sample8(cheer?[18,19,20,21,20,21,19,18]:[18,19,20,21,20,19,20,19],i);
      var handY=sample8(cheer?[18,14,10,8,11,9,13,17]:[18,15,12,10,11,10,12,16],i)+bob;
      limb(r,[sx,y],[18+ease*.5,y-1-Math.max(0,17-handY)*.25],[handX,handY],p.cloth,SKIN);
      r.dot(handX,handY-1,SKIN);if(k>1&&k<6)r.dot(handX+1,handY-2,SKIN);
      if(!side){
        if(cheer)limb(r,[7,y],[5-ease*.5,y-1],[5-ease,handY+1],p.cloth,SKIN);
        else limb(r,[7,y],[5,y+2],[5+ease*.5,y+4],p.cloth,SKIN);
      }
    }else if(state==='talk'){
      var tx=(side?20:19)+sample8([0,.5,1,.5,0,-.5,0,-.5],i),ty=y+sample8([2,0,-2,-1,1,3,2,3],i);
      limb(r,[sx,y],[sx+2+ease*.5,y+1],[tx,ty],p.cloth,SKIN);r.dot(tx+1,ty,SKIN);
      if(!side)limb(r,[7,y],[5.5-ease*.5,y+2],[6+ease*.5,y+3],p.cloth,SKIN);
    }else if(state==='read'){
      var bx=(side?16:9)+sample8([0,0,0,.5,.5,0,-.5,0],i),by=y+1+sample8([0,0,-.5,-.5,0,.5,.5,0],i);
      r.rect(bx,by,7,6,'#74483f');r.rect(bx+1,by+1,5,4,'#ba8a62');r.line(bx+3,by+1,bx+3,by+4,'#6b514d');
      if(k===3)r.poly([[bx+5,by+1],[bx+6,by+2],[bx+4,by+5]],'#eee2c4');
      if(k===4)r.poly([[bx+3,by+1],[bx+5,by+2],[bx+3,by+5]],'#eee2c4');
      if(k===5)r.rect(bx+1,by+1,2,4,'#eee2c4');
      limb(r,[sx,y],[sx+1+ease*.3,y+3],[bx+5,by+4],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[6-ease*.3,y+3],[bx,by+4],p.cloth,SKIN);
    }else if(state==='coffee'){
      var cx=(side?19:17)+sample8([0,.5,.5,0,0,-.5,-.5,0],i),cy=sample8([20,19,17,15,14,15.5,17.5,19.5],i)+bob;
      limb(r,[sx,y],[sx+2+ease*.5,y+1],[cx-1,cy+1],p.cloth,SKIN);
      r.rect(cx,cy,3,3,WHITE);r.rect(cx+3,cy+1,1,1,p.accent);r.rect(cx,cy,3,1,'#80584a');
      if(k!==3&&k!==4)r.dot(cx+1+ease*.5,cy-2-sample8([0,.5,0,.5,0,.5,0,.5],i),'#beb3cd');
      if(!side)limb(r,[7,y],[5,y+2],[6+ease*.5,y+4],p.cloth,SKIN);
    }else if(state==='nap'){
      limb(r,[sx,y],[17+ease*.5,y+3],[10+ease*.5,y+3+ease*.5],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[6-ease*.5,y+3],[14,y+3],p.cloth,SKIN);
    }else if(state==='carry'){
      var lift=sample8([0,-.5,-1,-.5,0,.5,1,.5],i),trayX=14+ease*.5;
      r.rect(trayX,y+1+lift,7,2,'#f1e8cf');r.rect(trayX+1,y+3+lift,5,2,p.accent);
      limb(r,[sx,y],[sx+1+ease*.5,y+3],[16+ease*.5,y+3+lift],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[6-ease*.5,y+3],[trayX,y+2+lift],p.cloth,SKIN);
    }else if(state==='sit'){
      limb(r,[sx,y],[sx+1+ease*.5,y+2],[sx+sample8([0,.5,1,1.5,2,1,.5,0],i),y+sample8([5,4.5,4,3,3.5,4,4.5,5],i)],p.cloth,SKIN);
      if(!side)limb(r,[7,y],[5-ease*.5,y+2],[6-ease*.5,y+4],p.cloth,SKIN);
    }else{
      if(side)limb(r,[sx,y],[sx+1+ease*.5,y+2],[sx+ease*.5,y+5],p.cloth,SKIN);
      else{limb(r,[7,y],[5-ease*.5,y+2],[6-ease*.5,y+4],p.cloth,SKIN);limb(r,[16,y],[18+ease*.5,y+2],[17+ease*.5,y+4],p.cloth,SKIN);}
    }
  }
  function signatureGesture(r,id,p,side,back,bob,lean,state,i,layer){
    var k=key8(i);
    var cx=side?17:12,py=20+bob,n,f,prop=function(){},t=sample8([0,.5,1,.5,0,-.5,-1,-.5],i);
    function at(points){var point=sample8(points,i);return[point[0],point[1]+bob];}
    function book(x,y,w,h){r.rect(x,y,w,h,'#80584a');r.rect(x+.5,y+.5,w-1,h-1,'#c5a575');r.line(x+w/2,y+1,x+w/2,y+h-1,p.dark);}
    function paper(x,y,w,h){r.rect(x,y,w,h,'#c5a575');r.rect(x+.5,y+.5,w-1,h-1,WHITE);for(var k=2;k<h-1;k+=2)r.line(x+1,y+k,x+w-2,y+k,p.shade);}
    function fish(x,y){r.poly([[x-2,y],[x,y-1],[x+2,y],[x+3,y-1],[x+3,y+1],[x+2,y],[x,y+1]],p.accent);r.dot(x-1,y,INK);}
    function cookie(x,y){r.poly([[x-1,y-2],[x+1,y-2],[x+2,y-1],[x+2,y+1],[x+1,y+2],[x-1,y+2],[x-2,y+1],[x-2,y-1]],'#c5a575');r.dot(x-1,y-1,'#80584a');r.dot(x+1,y,'#80584a');r.dot(x,y+1,'#80584a');}
    switch(state){
      case'gpt_think':
        n=at([[17,23],[17,21],[16,18],[16,17],[17,17],[17,18],[16,20],[16,22]]);f=[cx-3,24+bob];
        prop=function(){paper(cx-4,21+bob,5,5);r.line(cx-3,23+bob,cx-1,23+bob,p.accent);if(k>2&&k<6)star(r,cx+4,13+bob,p.accent);};break;
      case'gpt_wings':
        n=at([[17,23],[18,21],[19,19],[20,17],[21,16],[20,18],[19,20],[18,22]]);f=at([[6,23],[5,21],[4,19],[3,17],[2,16],[3,18],[4,20],[5,22]]);break;
      case'gpt_tea':
        py=sample8([24,23,22,21,21,22,23,24],i)+bob;n=[cx+3,py+1];f=[cx-3,py+1];
        prop=function(){r.rect(cx-4,py,9,1,'#c5a575');r.rect(cx-2,py-2,3,2,WHITE);r.rect(cx-1,py-2,2,1,'#80584a');r.dot(cx+1,py-1,p.accent);r.rect(2+(correctDepth(p,side,back)?2.5:0),18+sample8([0,-.5,-1,-1.5,-1,-.5,0,.5],i)+bob,2,2,WHITE);};break;
      case'deepseek_fish':
        n=at([[17,24],[18,21],[18,18],[16,20],[14,21],[14,22],[16,21],[15,23]]);f=at([[7,24],[6,24],[7,23],[8,22],[9,22],[8,23],[7,24],[7,23]]);
        prop=function(){if(k<3)fish(n[0]+1,n[1]-1);else if(k===3||k===6)fish(n[0]-1,n[1]);if(k===4||k===5)r.line(n[0]-2,n[1],n[0]+1,n[1],p.dark);};break;
      case'deepseek_bowl':
        py=sample8([24,23,22,21,20,21,23,24],i)+bob;n=[cx+3,py+1];f=[cx-3,py+1];
        prop=function(){r.poly([[cx-4,py-1],[cx+4,py-1],[cx+3,py+3],[cx-2,py+3]],WHITE);r.line(cx-3,py+2,cx+2,py+2,p.accent);r.line(cx-3,py-1,cx+3,py-1,p.dark);for(var k=-2;k<3;k+=2)r.dot(cx+k,py-2,WHITE);if(k>1&&k<6){r.line(cx+2,py-3,cx+4,py-6,'#c5a575');r.line(cx+3,py-3,cx+5,py-6,'#80584a');r.dot(cx+4,py-5,WHITE);}};break;
      case'deepseek_tail':
        n=at([[17,24],[19,21],[20,18],[19,20],[21,21],[20,19],[18,22],[17,23]]);f=at([[7,24],[5,21],[4,18],[5,20],[3,21],[4,19],[6,22],[7,23]]);break;
      case'claude_soul':
        n=at([[17,24],[18,25],[18,26],[17,27],[16,27],[17,26],[18,25],[17,23]]);f=at([[7,24],[6,25],[6,26],[7,27],[8,27],[7,26],[6,25],[7,23]]);break;
      case'claude_scroll':
        var spread=sample8([2,3,4,5,6,5,3,2],i);if(side)spread=Math.min(5,spread);py=sample8([23,22,21,20,20,21,22,23],i)+bob;n=[cx+(side?Math.min(4,spread):spread),py+1];f=[cx-spread,py+1];
        prop=function(){paper(cx-spread,py-1,spread*2+1,5);r.rect(cx-spread,py-2,1,7,'#80584a');r.rect(cx+spread,py-2,1,7,'#80584a');};break;
      case'claude_reconnect':
        n=at([[17,25],[18,24],[19,22],[19,20],[18,19],[17,19],[16,21],[17,23]]);f=at([[7,25],[8,24],[10,23],[12,22],[13,21],[11,22],[9,23],[7,24]]);
        prop=function(){r.line(n[0],n[1]+1,22,25+bob,p.dark);r.line(22,25+bob,21,28+bob,p.dark);r.line(21,28+bob,17,28+bob,p.dark);r.rect(n[0]-1,n[1]-1,2,2,p.dark);r.dot(n[0],n[1]-2,k>3?p.accent:'#c5a575');r.dot(n[0]+1,n[1]-2,WHITE);};break;
      case'grok_axe':
        n=[side?18.5:17,20+bob+sample8([2,1,0,-1,-.5,0,1,2],i)];f=at([[7,24],[7,22],[9,21],[11,21],[10,22],[9,23],[8,24],[7,24]]);
        prop=function(){var a=angle8([.4,-.4,-1.2,-2,-2.8,-3.6,-4.4,-5.2],i),vx=Math.cos(a),vy=Math.sin(a),ex=n[0]+vx*3.5,ey=n[1]+vy*3.5;r.line(n[0]-vx*2,n[1]-vy*2,ex,ey,'#80584a');r.poly([[ex-vy*2,ey+vx*2],[ex+vx*1.5-vy*1.5,ey+vy*1.5+vx*1.5],[ex+vx*2,ey+vy*2],[ex+vx*1.5+vy*1.5,ey+vy*1.5-vx*1.5],[ex+vy*2,ey-vx*2]],'#9bcbd0');r.line(ex-vy,ey+vx,ex+vy,ey-vx,WHITE);};break;
      case'grok_smirk':
        n=at([[17,24],[19,22],[20,20],[21,19],[20,20],[21,21],[19,23],[17,24]]);f=at([[8,23],[8,22],[8,21],[8,22],[8,23],[8,22],[8,21],[8,23]]);break;
      case'grok_spark':
        n=at([[17,24],[19,22],[20,19],[21,15],[20,12],[21,16],[19,21],[17,23]]);f=at([[7,24],[6,23],[5,22],[4,21],[5,20],[6,22],[7,23],[7,24]]);
        prop=function(){if(k>0&&k<7){var top=sample8([23,20,16,10,7,12,19,23],i)+bob;r.poly([[21,top],[23,top-2],[21,top+3],[23,top+2],[20,top+8],[21,top+4],[19,top+5]],'#c5a575');r.dot(22,top+1,WHITE);}};break;
      case'gemini_stars':
        n=at([[17,24],[19,21],[20,17],[18,15],[16,18],[19,20],[20,22],[17,24]]);f=at([[7,24],[5,21],[4,17],[6,15],[9,18],[6,20],[5,22],[7,24]]);
        prop=function(){if(k<7){r.line(f[0],f[1]-1,cx,17+bob+t,p.accent);r.line(cx,17+bob+t,n[0],n[1]-1,p.light);star(r,cx,17+bob+t,'#c5a575');if(k>1&&k<6){star(r,f[0]+1,f[1]-2,p.light);star(r,n[0]-1,n[1]-2,p.light);}}};break;
      case'gemini_twins':
        n=at([[14,22],[15,21],[17,20],[19,18],[20,17],[19,19],[17,21],[14,22]]);f=at([[10,22],[9,21],[7,20],[5,18],[4,17],[5,19],[7,21],[10,22]]);break;
      case'gemini_tail':
        n=at([[17,23],[17,25],[15,26],[11,26],[7,22],[5,22],[9,24],[15,23]]);f=at([[7,23],[5,24],[4,26],[3,24],[4,22],[5,20],[6,22],[7,23]]);break;
      case'kimi_moon':
        py=sample8([24,23,21,19,17,20,22,24],i)+bob;n=[cx+2,py+2];f=[cx-2,py+2];
        prop=function(){r.poly([[cx+1,py-3],[cx-1,py-2],[cx-2,py],[cx-1,py+2],[cx+1,py+3],[cx+3,py+2],[cx+1,py+1],[cx,py],[cx,py-1]],'#c5a575');r.line(cx-1,py-1,cx-1,py+1,WHITE);};break;
      case'kimi_notes':
        py=21+bob;f=[cx-2,py];n=[cx+2+sample8([0,1,2,1,0,-1,1,0],i)*.5,py+sample8([1,1.5,2,3,3.5,2.5,1.5,1],i)];
        prop=function(){var len=sample8([3,5,6,8,9,7,5,3],i);paper(cx-2,py-1,5,len);r.rect(cx-2,py+len-1,5,1,p.accent);r.line(n[0]-1,n[1]+1,n[0]+2,n[1]-2,'#c5a575');};break;
      case'kimi_search':
        py=23+bob;f=[cx-3,py+2];n=[cx+sample8([3,4,3,5,4,2,3,3],i),py+sample8([-1,-4,-7,-6,-5,-3,-1,0],i)];if(side)n[0]=Math.min(20,n[0]);
        prop=function(){book(cx-4,py,8,4);r.rect(n[0]-1,n[1]-3,3,3,p.accent);r.rect(n[0],n[1]-2,1,1,WHITE);r.line(n[0]+1,n[1],n[0]+2,n[1]+2,'#c5a575');};break;
      case'doubao_cookie':
        n=at([[17,24],[17,22],[18,21],[19,20],[20,19],[20,20],[18,22],[17,24]]);f=[cx-3,25+bob];
        prop=function(){r.rect(cx-4,23+bob,5,4,'#c5a575');r.line(cx-4,23+bob,cx,23+bob,p.accent);if(k>0&&k<7){r.line(cx-4,22+bob,cx-1,21+bob,'#80584a');cookie(n[0]+1,n[1]-1);}else r.line(cx-4,24+bob,cx,24+bob,'#80584a');};break;
      case'doubao_drool':
        n=at([[17,24],[18,25],[18,26],[17,27],[16,27],[17,25],[17,19],[17,23]]);f=at([[7,24],[6,25],[6,26],[7,27],[8,27],[7,26],[6,25],[7,24]]);break;
      case'doubao_idea':
        n=at([[17,24],[18,20],[18,15],[17,12],[21,12],[20,16],[18,21],[17,24]]);f=at([[7,24],[6,23],[5,22],[5,21],[4,17],[5,20],[6,23],[7,24]]);break;
      default:return;
    }
    if(correctDepth(p,side,back)){
      var paired=['gpt_wings','gpt_tea','deepseek_bowl','deepseek_tail','claude_scroll','gemini_stars','gemini_twins','kimi_moon','kimi_notes'].indexOf(state)>=0;
      var spread=['gpt_wings','deepseek_tail','gemini_stars','gemini_twins'].indexOf(state)>=0;
      var relaxed=state==='claude_soul'||state==='doubao_drool';
      var heldFar=['gpt_think','claude_reconnect','kimi_search','doubao_cookie'].indexOf(state)>=0;
      r=actionPlane(r,layer==='far'?'far':'near',spread?12:side?17:12,paired,relaxed,heldFar);
    }
    // Some side silhouettes are foreshortened, but each arm still has its own
    // elbow path and reaches an actual hand-held prop, not a renamed idle pose.
    var ns=[side?13+lean:16,19+bob],fs=[side?10+lean:7,19+bob];
    var bend=sample8([.5,1,1.5,1,.5,0,-.5,0],i);
    function arm(s,h,far){var ex=s[0]+(h[0]-s[0])*.48+(far?-bend:bend)*.35,ey=Math.max(s[1],h[1])+(h[1]<s[1]?-2:1);limb(r,s,[ex,ey],h,far?p.dark:p.cloth,far?SKIN_D:SKIN);}
    if(layer==='far'){arm(fs,f,true);return;}
    if(state!=='grok_axe'&&state!=='grok_spark'&&state!=='kimi_moon')prop();arm(ns,n,false);if(!correctDepth(p,side,back))r.rect(f[0],f[1],1.5,1.5,SKIN_D);
    if(state==='grok_smirk'&&k>1&&k<6)r.line(n[0],n[1],n[0]+1,n[1],SKIN);
    if(state==='doubao_idea'&&k===4)r.line(n[0],n[1],n[0],n[1]-2,SKIN);
  }
  function nativeSignatureProp(state,side,bob,i,back){
    var k=key8(i);
    if(state!=='grok_axe'&&state!=='grok_spark'&&state!=='kimi_moon')return null;
    var r=new Raster(W,H),outline=new Raster(W,H);
    if(state==='grok_axe'){
      var a=angle8([.4,-.4,-1.2,-2,-2.8,-3.6,-4.4,-5.2],i),vx=Math.cos(a),vy=Math.sin(a),nx=-vy,ny=vx;
      var px=side?37:34,py=(20+bob+sample8([2,1,0,-1,-.5,0,1,2],i))*2,ex=px+vx*5,ey=py+vy*5;
      function pt(n,v){return[ex+nx*n+vx*v,ey+ny*n+vy*v];}
      r.line(px-vx*4,py-vy*4,ex,ey,'#80584a',2);
      r.poly([pt(-4,-1),pt(-5,3),pt(4,3),pt(5,0),pt(2,-2),pt(-2,-2)],'#9bcbd0');
      var edgeA=pt(-4,2),edgeB=pt(3,2);r.line(edgeA[0],edgeA[1],edgeB[0],edgeB[1],WHITE);
      r.dot(ex,ey,'#53617c');
    }else if(state==='grok_spark'){
      if(k===0||k===7)return null;
      var y=sample8([40,34,25,15,8,21,32,40],i)+bob*2;
      r.poly([[44,y],[40,y+7],[43,y+6],[40,y+14],[46,y+4],[43,y+5]],'#9bcbd0');
      r.line(43,y+2,41,y+6,WHITE);r.line(43,y+7,41,y+11,WHITE);
    }else{
      var cx=(side?17:12)*2,cy=(sample8([24,23,21,19,17,20,22,24],i)+bob)*2-1;
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
  function copyNative(target,layer,offsetX){if(layer)for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(layer.rows[y][x])target.dot(x+(offsetX||0),y,layer.rows[y][x]);}
  function signatureFaceState(state,i){
    i=key8(i);
    if(state==='claude_soul')return i>0&&i<7?'nap':'idle';
    if(state==='claude_reconnect')return i<4?'nap':i>5?'wave':'idle';
    if(state==='doubao_drool')return i>1&&i<6?'nap':'idle';
    if(state==='gpt_wings'&&i>1&&i<6||state==='doubao_idea'&&i>3&&i<6||state==='doubao_cookie'&&i>2&&i<6)return'wave';
    return state;
  }
  function signatureEffects(r,id,p,side,back,bob,lean,state,i,headBob){
    var stage=key8(i);
    var hx=lean*2,hy=(5+headBob)*2,t=sample8([0,-1,-2,-1,0,1,2,1],i);
    function sparkle(x,y,c){r.line(x,y-2,x,y+2,c);r.line(x-2,y,x+2,y,c);r.dot(x,y,WHITE);}
    if(state==='claude_soul'&&stage>0&&stage<7){
      var gy=sample8([0,12,8,4,3,7,13,0],i),gx=24+sample8([-1,-2,-1,0,2,1,0,-1],i);
      r.poly([[gx-3,gy+1],[gx-1,gy-1],[gx+2,gy],[gx+4,gy+3],[gx+3,gy+8],[gx+1,gy+7],[gx-1,gy+9],[gx-3,gy+7]],'#d5b4d9');
      r.line(gx-2,gy+1,gx,gy,WHITE);if(!back){r.dot(gx-1,gy+3,p.dark);r.dot(gx+2,gy+3,p.dark);r.dot(gx+1,gy+5,WHITE);}if(stage>1&&stage<6)r.line(gx,gy+10,gx-1,gy+12,'#d5b4d9');
    }else if(state==='claude_reconnect'&&stage>3){
      var x=43,y=12;for(var bar=0;bar<3;bar++)if(bar<Math.min(3,stage-3))r.rect(x-4+bar*2,y-bar*2,1,3+bar*2,p.accent);if(stage===6)sparkle(5,16,WHITE);
    }else if(state==='deepseek_tail'){
      var h=sample8([0,1,2,7,10,7,3,1],i);if(h){r.line(1,60,10,60,'#9bcbd0');r.line(3,60,1,60-h,'#9bcbd0');r.line(7,60,10,60-h*.7,p.accent);r.dot(12,58-h*.5,p.light);r.dot(1,57-h*.7,WHITE);}
    }else if(state==='gemini_twins'){
      var spread=sample8([1,2,4,6,7,6,4,2],i),y=31+t;
      [24-spread*3,24+spread*3].forEach(function(x,j){x=Math.max(4,Math.min(43,x));sparkle(x,y+(j?t:-t),j?p.accent:p.light);if(stage>1&&stage<7){r.rect(x-2,y+4,5,3,j?p.light:p.accent);r.dot(x-2,y+7,p.shade);r.dot(x+2,y+7,p.shade);if(!back){r.dot(x-1,y+4,p.dark);r.dot(x+1,y+4,p.dark);}}});
    }else if(state==='doubao_idea'&&stage>1&&stage<7){
      var x=42,y=8+(stage===2?2:0);r.poly([[x-2,y],[x,y-2],[x+2,y],[x+2,y+3],[x+1,y+5],[x-1,y+5],[x-2,y+3]],'#c5a575');r.rect(x-1,y+5,3,2,p.dark);r.dot(x-1,y,WHITE);if(stage>2&&stage<6){r.dot(x-4,y-1,WHITE);r.dot(x+4,y-1,WHITE);r.dot(x,y-4,WHITE);}
    }
    if(!back){
      if(state==='doubao_drool'&&stage>1&&stage<7){var mx=(side?31:25)+hx,my=hy+26,len=sample8([0,0,1,3,5,4,1,0],i);r.line(mx,my,mx,my+len,'#9bcbd0');r.dot(mx-1,my+len,'#9bcbd0');r.dot(mx,my+len+1,WHITE);}
      if(state==='grok_smirk'&&stage>1&&stage<7){var x=(side?30:28)+hx,y=hy+13;r.line(x-1,y,x+4,y-1,p.shade);r.line((side?28:23)+hx,hy+25,(side?32:27)+hx,hy+24,p.accent);if(stage===3||stage===4)r.line((side?20:15)+hx,hy+18,(side?23:19)+hx,hy+18,p.dark);}
    }
  }
  function mix(a,b,t){
    var out='#';for(var i=1;i<7;i+=2){var n=Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t);out+=n.toString(16).padStart(2,'0');}return out;
  }
  function refine(r,id,p,side,back,headBob,lean,state,phase,bob,trail,expression){
    var k=key8(phase);
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
      if(r.rows[fy][fx]===p.shoe&&r.rows[fy-1][fx]!==p.shoe&&fx%3===0)r.dot(fx,fy,p.shoeShade);
      if(r.rows[fy][fx]===p.leg){
        if(r.rows[fy][fx-1]!==p.leg&&r.rows[fy][fx-1]!==p.legShade)r.dot(fx,fy,p.legShade);
        else if(r.rows[fy][fx+1]!==p.leg&&r.rows[fy][fx+1]!==p.legLight)r.dot(fx,fy,p.legLight);
      }
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
      var maxFaceX=state==='coffee'&&k===1?(side?36:32):39+hx;
      for(var yy=hy+10;yy<=hy+25;yy++)for(var xx=12+hx;xx<=maxFaceX;xx++)if(has(xx,yy,faceColors)){
        var shade=yy>hy+22&&xx<22+hx?'#efbcae':xx<16+hx?'#f4c6b5':SKIN;r.dot(xx,yy,shade);
      }
      var faceState=actionOwner[state]?signatureFaceState(state,phase):state;
      var eyeY=hy+16,blink=faceState==='nap'||faceState==='idle'&&k===1,happy=faceState==='wave'||faceState==='cheer';
      var expressionPainted=false,expressions=window.StudioExpressions;
      if(expression&&expressions&&typeof expressions.draw==='function'){
        var near={x:(side?20:15)+hx,y:eyeY,w:side?5:4},far={x:(side?33:28)+hx,y:eyeY,w:side?3:4};
        expressionPainted=expressions.draw(r,{near:near,far:far,side:side,skin:SKIN,skinShade:SKIN_D,white:WHITE,ink:INK,brow:p.shade,mouthColor:FACE_LINE,
          irisNear:p.eye,irisFar:id==='gemini'?'#c29a46':p.eye,irisLightNear:p.eyeLight,irisLightFar:id==='gemini'?'#e1cb91':p.eyeLight,
          mouth:{x:(side?30:24)+hx,y:hy+25},catMouth:false,blink:blink?1:0,speaking:state==='talk',gazeY:state==='read'?1:0,
          browClip:function(x,y){return has(x,y,[SKIN,SKIN_D,'#f4c6b5','#efbcae']);}},expression,phase)===true;
      }
      function eye(x,y,w,far,color){
        if(blink){r.line(x-1,y+2,x+w,y+2,'#725464');r.dot(x+w,y+1,'#725464');return;}
        if(happy){r.line(x-1,y+2,x+1,y,'#584151');r.line(x+1,y,x+w,y+2,'#584151');return;}
        r.rect(x,y,w,6,'#584151');r.rect(x,y+1,w,4,'#fff6ed');
        var irisW=far?2:3,pupilW=far?1:2;
        // Both eyes share one gaze: a three-quarter face looks toward its nose
        // and travel direction, while a front face looks straight ahead.
        var lookBack=state==='gemini_tail'&&k>1&&k<7;
        var ix=x+(side?(lookBack?0:w-irisW):Math.floor((w-irisW)/2));
        var px=x+(side?(lookBack?0:w-pupilW):Math.floor((w-pupilW)/2));
        var down=state==='read'?1:0;
        r.rect(ix,y+1,irisW,5,color);r.rect(px,y+1+down,pupilW,3-down,'#49384f');
        // A resting lid stays inside the eye width. The extra outer pixel made
        // the straight lid read as a heavy, lowered eyebrow at native size.
        r.rect(x,y,w,1,'#49384f');
        r.dot(ix,y+1,WHITE);
        r.dot(ix+irisW-1,y+4,color===p.eye?p.eyeLight:'#e1cb91');r.dot(x+w-1,y+6,'#d7a09c');
      }
      function restingBrow(x,w){
        // Keep brows level and registered to the actual near/far eye, leaving
        // a skin gap before the lid. A lower flat row can clear the bangs;
        // otherwise the hair naturally hides the brow instead of one stray dot.
        var browY=eyeY-3,skin=[SKIN,'#f4c6b5'];
        function exposed(y){var n=0;for(var i=0;i<w;i++)if(has(x+i,y,skin))n++;return n;}
        if(exposed(browY)<2)browY=eyeY-2;
        if(exposed(browY)<2)return;
        for(var bx=0;bx<w;bx++)if(has(x+bx,browY,skin))r.dot(x+bx,browY,p.shade);
      }
      if(side){
        if(!expressionPainted){
          if(correctDepth(p,side,back)){eye(20+hx,eyeY,5,false,p.eye);eye(33+hx,eyeY,3,true,id==='gemini'?'#c29a46':p.eye);}
          else{eye(20+hx,eyeY,3,true,p.eye);eye(30+hx,eyeY,5,false,id==='gemini'?'#c29a46':p.eye);}
          if(blink||happy){
            if(has(20+hx,eyeY-3,[SKIN,'#f4c6b5']))r.line(19+hx,eyeY-3,22+hx,eyeY-3,p.shade);
            if(has(30+hx,eyeY-3,[SKIN]))r.line(30+hx,eyeY-3,34+hx,eyeY-2,p.shade);
          }else if(correctDepth(p,side,back)){restingBrow(20+hx,4);restingBrow(33+hx,3);}
          else{restingBrow(20+hx,3);restingBrow(30+hx,4);}
          r.line(29+hx,hy+25,31+hx,hy+25,FACE_LINE);r.dot(30+hx,hy+26,SKIN_D);
          if(state==='talk'&&k!==1)r.rect(30+hx,hy+24,2,2,FACE_LINE);
        }
        r.dot(28+hx,hy+22,'#edb8a6');r.dot(29+hx,hy+22,'#f8d2bd');
        r.rect(17+hx,hy+23,3,1,'#eaa5a5');r.rect(35+hx,hy+23,2,1,'#eaa5a5');
      }else{
        if(!expressionPainted){
          eye(15+hx,eyeY,4,false,p.eye);eye(28+hx,eyeY,4,false,id==='gemini'?'#c29a46':p.eye);
          if(!blink&&!happy){restingBrow(15+hx,4);restingBrow(28+hx,4);}
          r.line(23+hx,hy+25,25+hx,hy+25,FACE_LINE);
          if(state==='talk'&&k!==1)r.rect(24+hx,hy+24,2,2,FACE_LINE);
        }
        r.rect(13+hx,hy+23,3,1,'#eaa5a5');r.rect(33+hx,hy+23,3,1,'#eaa5a5');
        r.dot(24+hx,hy+22,SKIN_D);r.dot(25+hx,hy+22,SKIN);
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
    // A tiny stepped keybed keeps the work prop distinct from the bent wrist.
    if(state==='work'&&!back&&side){
      var keyY=Math.round((20+bob)*2);
      var keyShift=correctDepth(p,side,back)?-5:0;
      r.line(37+keyShift,keyY+1,45+keyShift,keyY+1,p.dark);
      for(var keyX=38;keyX<=44;keyX+=3)r.dot(keyX+keyShift,keyY,WHITE);
    }
    // Fine prop surfaces are clipped to their original colours so hands stay in front.
    if(!back&&(state==='read'||id==='claude'&&state==='idle'&&k===5)){
      var bx=((side?16:9)+sample8([0,0,0,.5,.5,0,-.5,0],phase))*2-(correctDepth(p,side,back)?5:0),py=(20+bob+sample8([0,0,-.5,-.5,0,.5,.5,0],phase))*2;
      maskedLine(bx+2,py+2,bx+11,py+2,'#f0dbb7',['#74483f','#ba8a62','#eee2c4','#704840','#d4b88c']);
      maskedLine(bx+2,py+5,bx+10,py+5,'#b99a7b',['#74483f','#ba8a62','#eee2c4']);
      maskedLine(bx+6,py+2,bx+6,py+9,'#69504b',['#74483f','#ba8a62','#eee2c4']);
    }
    if(!back&&state==='coffee'){
      var cupX=((side?19:17)+sample8([0,.5,.5,0,0,-.5,-.5,0],phase))*2-(correctDepth(p,side,back)?5:0),cupY=(sample8([20,19,17,15,14,15.5,17.5,19.5],phase)+bob)*2;
      maskedLine(cupX+1,cupY+1,cupX+4,cupY+1,'#a4785c',['#80584a',WHITE]);
      maskedLine(cupX+1,cupY+3,cupX+1,cupY+5,'#fffef3',[WHITE]);
    }
  }
  function build(id,state,phase,direction,expression){
    var r=new Raster(),p=palettes[id],side=direction==='left'||direction==='right',back=direction==='back';
    var walking=state==='walk'||state==='run',signature=!!actionOwner[state];
    var motion=walking?gait(state,phase):null,pose=walking?null:signature?signaturePose(state,phase):life(state,phase);
    var bob=walking?motion.bodyY/2:pose.bob;
    var lean=walking?(side?motion.lean/2:0):pose.lean*(side?1:.5);
    var trail=walking?motion.hairLag*.5:pose.trail;
    var headBob=bob+(walking?0:pose.head);
    function idleProp(){
      if(state==='idle'&&id==='claude'&&key8(phase)===5){r.rect(14,21+bob,6,6,'#704840');r.rect(15,22+bob,4,3,'#d4b88c');}
      if(state==='idle'&&id==='doubao'&&key8(phase)===5){r.rect(3,22+bob,4,6,'#c5a680');r.rect(4,23+bob,2,2,p.accent);}
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
      if(back&&state==='work'){
        // Rear typing has its own twelve elbow positions. The hand reaches
        // forward under the back silhouette; the outer elbow carries the tap.
        var ex=[10,10,9,9,10,11,11,10,9,9,10,10][phase],ey=[43,42,42,43,44,44,43,42,43,44,44,43][phase]+bob*2;
        hi.line(14,38+bob*2,ex,ey,p.dark,3);
        hi.line(ex,ey,20,38+bob*2+sample8([0,-1,-.5,.5,1,.5,0,-.5],phase)*2,SKIN_D,3);
      }
      if(back)copyNative(hi,signatureProp);
      if(walking){
        nativeLegs(hi,p,motion,side,back);
        nativeMovingArm(hi,p,motion,side,back,true,state);
        if(back)nativeMovingArm(hi,p,motion,side,back,false,state);
      }
    };
    if(walking&&!back)r.after=function(hi){nativeMovingArm(hi,p,motion,side,back,false,state);};
    r.refine=function(hi){refine(hi,id,p,side,back,headBob,lean,state,phase,bob,trail,expression);};
    if((state==='wave'||state==='cheer')&&correctDepth(p,side,back)){
      // Raised near arms sit in front of the head. Repaint the complete arm
      // after facial refinement so a palm cannot lose its sleeve connection.
      var raisedForeground=new Raster();armFront(raisedForeground,id,p,side,false,bob,lean,state,phase);
      r.after=function(hi){
        for(var yy=0;yy<BH;yy++)for(var xx=0;xx<BW;xx++)if(raisedForeground.rows[yy][xx])hi.rect(xx*2,yy*2,2,2,raisedForeground.rows[yy][xx]);
        nativeArmDetails(hi,raisedForeground,p);
      };
    }
    if(state==='coffee'&&!back){
      // The sipping hand and cup sit in front of the face; the native eye/skin
      // pass must not turn a white cup back into a cheek.
      var foreground=new Raster();armFront(foreground,id,p,side,false,bob,lean,state,phase);
      r.after=function(hi){
        for(var yy=0;yy<BH;yy++)for(var xx=0;xx<BW;xx++)if(foreground.rows[yy][xx])hi.rect(xx*2,yy*2,2,2,foreground.rows[yy][xx]);
        var cx=Math.round(((side?19:17)+sample8([0,.5,.5,0,0,-.5,-.5,0],phase))*2)-(correctDepth(p,side,back)?5:0),cy=Math.round((sample8([20,19,17,15,14,15.5,17.5,19.5],phase)+bob)*2);
        nativeArmDetails(hi,foreground,p);
        hi.line(cx+1,cy+1,cx+4,cy+1,'#a4785c');hi.line(cx+1,cy+3,cx+1,cy+5,WHITE);
      };
    }
    if(signature){
      var signatureForeground=new Raster();
      if(!back)signatureGesture(signatureForeground,id,p,side,false,bob,lean,state,phase,'near');
      r.after=function(hi){
        if(!back)copyNative(hi,signatureProp,correctDepth(p,side,back)?-5:0);
        if(!back)for(var yy=0;yy<BH;yy++)for(var xx=0;xx<BW;xx++)if(signatureForeground.rows[yy][xx])hi.rect(xx*2,yy*2,2,2,signatureForeground.rows[yy][xx]);
        if(!back)nativeArmDetails(hi,signatureForeground,p);
        var effects=new Raster(W,H);signatureEffects(effects,id,p,side,back,bob,lean,state,phase,headBob);
        for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(effects.rows[y][x]&&(!back||!hi.rows[y][x]))hi.dot(x,y,effects.rows[y][x]);
      };
    }
    r.paletteOwner=p;r.palette=limitedColours(p,id);
    return r.canvas(direction==='left');
  }
  function get(id,state,phase,direction,expression){
    var expressions=window.StudioExpressions;
    if(expression===undefined||expression==='auto')expression=!actionOwner[state]&&expressions&&typeof expressions.resolve==='function'?expressions.resolve(id,state,phase):null;
    var key=[id,state,phase,direction,expression||'base'].join('|');return cache[key]||(cache[key]=build(id,state,phase,direction,expression));
  }
  function draw(ctx,id,state,frame,x,y,width,facingLeft,direction,expression){
    if(!Object.prototype.hasOwnProperty.call(lookup,id))return false;
    state=validState(id,state);var count=states[state].count,n=Number(frame),phase=Number.isFinite(n)?((Math.floor(n)%count)+count)%count:0;
    direction=direction==='left'||direction==='right'||direction==='front'||direction==='back'?direction:(facingLeft?'left':state==='walk'||state==='run'||state==='work'?'right':'front');
    width=width||27;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(get(id,state,phase,direction,expression),x,y,width,width*H/W);ctx.restore();return true;
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
    frame:function(id,state,index,direction,expression){if(!lookup[id])return null;state=validState(id,state);var count=states[state].count,n=Number(index),phase=Number.isFinite(n)?((Math.floor(n)%count)+count)%count:0;return get(id,state,phase,direction||'front',expression);}};
}());
