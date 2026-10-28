/* Standalone, local character art review. Shares the actual studio sprite kits. */
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);};
  var hero=window.StudioHeroSprites,ai=window.AIStudioSprites;
  if(!hero||!ai){$('viewLabel').textContent='角色素材暂未准备好，请刷新页面';return;}
  var ACTIONS=[['idle','待机'],['walk','走路'],['run','跑步'],['work','工作'],['wave','招手'],['talk','交谈'],['read','读书'],['coffee','喝茶'],['nap','打盹'],['sit','休息'],['carry','端东西'],['cheer','欢呼']];
  var COMMON_NOTES={idle:'眨眼、呼吸，顺手整理一下自己。',walk:'双脚交替承重，头发与尾巴稍晚跟上。',run:'蹬地、腾空、回收，再落地。',work:'抬腕、落指、换手，专心完成手边的工作。',wave:'抬起手臂，向伙伴挥挥手。',talk:'摊掌、强调、点头，也留时间听对方说。',read:'托住书本，读到下一页。',coffee:'抬杯、轻啜，再把杯子放低。',nap:'肩膀放松，安静地打个小盹。',sit:'坐下来，晃晃脚，伸展一下。',carry:'调整双手，让盘子保持平稳。',cheer:'蓄力、举手，为今天的小成果欢呼。'};
  var DIRECTIONS=[['front','正面','FRONT'],['right','右前 45°','THREE-QUARTER'],['left','左前 45°','THREE-QUARTER'],['back','背面','BACK']];
  var PORTRAITS={
    C0:['青色代码师','CODE / BUILD'],X0:['蝴蝶结画师','BRUSH / COLOR'],Feline1:['粉白小猫','CAT / HOME'],
    gpt:['白发龙娘','DRAGON / WHITE'],deepseek:['鲸鱼女仆','WHALE / OCEAN'],claude:['橙发书卷娘','SUN / STORY'],
    grok:['哥特双马尾','GOTHIC / X'],gemini:['星光猫娘','CAT / STARDUST'],kimi:['月夜女仆','MOON / MIDNIGHT'],doubao:['短发豆包','BOB / EVERYDAY']
  };
  var NOTES={
    C0:{tagline:'把灵感变成可运行的世界',traits:['耳机与镜架','青色连帽衫','牛仔裤'],note:'忙着写代码，也会摘下耳机听大家说话。镜框、耳罩和衣服边线都值得凑近看看。'},
    X0:{tagline:'把每个像素调到刚刚好',traits:['蝴蝶结','长发','画笔'],note:'长发和蝴蝶结比脚步晚一点落下。忙完这一笔，就来给工作室添一点新颜色。'},
    Feline1:{tagline:'工作室里的小小主心骨',traits:['猫耳','肉垫手套','粉白猫尾'],note:'猫耳、手套、裙边与尾巴都有自己的小细节。向右前方走时，尾巴留在左后方。'},
    gpt:{tagline:'慢一点，也会把茶端过来',traits:['白发龙娘','龙翼与龙尾','薄荷宝石'],note:'白裙、发束、龙翼和卷尾分出明暗。尾巴从后腰伸出，跟着重心慢半拍。'},
    deepseek:{tagline:'摸鱼之前，先把饭吃完',traits:['蓝发女仆','鲸鱼围裙','双叶鲸尾'],note:'发箍、裙边与围裙里的小鲸鱼，都是她的标记。分叉鲸尾始终留在身体后方。'},
    claude:{tagline:'灵魂出去透气，书页替她占座',traits:['橙色长发','日芒花饰','书卷'],note:'橙发的亮面、黑色束腰与奶油色裙褶，放大之后会看得更清楚。'},
    grok:{tagline:'嘴上说路过，手里已经帮上忙',traits:['金色双马尾','哥特裙装','黑色小翼'],note:'金色双马尾配上黑红裙装；摆臂时，衣袖、裙摆和发梢一起变化。'},
    gemini:{tagline:'把日常调成一片星光',traits:['异色瞳','蓝紫猫耳','猫尾与星饰'],note:'靠近的一只眼和远侧的一只眼有不同的颜色。紫色尾巴从后腰绕出来，尾尖轻轻摆动。'},
    kimi:{tagline:'小本本里，记着每个人的习惯',traits:['银白长发','月亮饰物','深蓝裙装'],note:'月亮头饰、袖口、裙褶和星点，在安静的动作里也能慢慢看清。'},
    doubao:{tagline:'反应慢半拍，饼干先分给你',traits:['棕色短发','日常穿搭','小手提袋'],note:'保留短发女生的日常感，把发丝、衣服接缝与鞋子画得更细一点。'}
  };
  var casts=hero.characters.map(function(c){return Object.assign({kit:hero,kind:'STUDIO FAMILY'},c);}).concat(ai.characters.map(function(c){return Object.assign({kit:ai,kind:'AI VISITOR'},c);}));
  var selected=casts.find(function(c){return c.id==='Feline1';})||casts[0];
  var initialUnique=typeof hero.uniqueActions==='function'?hero.uniqueActions(selected.id):[];
  var state=initialUnique.length?initialUnique[0].id:'walk',gaitAction=state,direction='right',playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches,frame=0,speed=1,elapsed=0,last=0,lastPaint=0;
  var showGrid=false,showLogo=true,showPersonality=false,groundMotion=true,comparison=false,referencePromise=null;
  var castViews=[],signatureCastViews=[],directionViews=[],actionViews=[],uniqueViews=[],gaitViews=[],portraitCast=null;
  var stage=$('characterStage'),sg=stage.getContext('2d');
  var views=new Map(),raf=0,running=false,paintCount=0,gaitMetaKey='',frameUiKey='';
  // Observe the actual canvases: a visible page section must not keep every
  // offscreen demonstration rendering. Static sheets never drive the clock.
  var viewObserver=window.IntersectionObserver?new IntersectionObserver(function(entries){
    var changed=false;entries.forEach(function(e){var v=views.get(e.target);if(!v)return;var on=e.isIntersecting&&e.intersectionRatio>0;if(v.visible!==on){v.visible=on;changed=true;}});
    if(changed)paint();else schedule();
  },{threshold:0.001}):null;
  function watch(canvas,kind){
    views.set(canvas,{canvas:canvas,kind:kind,visible:false});
    if(viewObserver)viewObserver.observe(canvas);
  }
  function release(list){list.forEach(function(v){if(viewObserver)viewObserver.unobserve(v.canvas);views.delete(v.canvas);});}
  function onScreen(canvas){var v=views.get(canvas);return!!(v&&v.visible);}
  function animated(v){return v.kind!=='cast'&&v.kind!=='gait'&&(v.kind!=='comparison'||comparison);}
  function hasAnimation(){var found=false;views.forEach(function(v){if(v.visible&&animated(v))found=true;});return found;}
  function schedule(){
    if(document.hidden||!playing||!hasAnimation()){
      if(raf)cancelAnimationFrame(raf);raf=0;running=false;last=0;lastPaint=0;return;
    }
    if(!running){running=true;last=0;lastPaint=0;}
    if(!raf)raf=requestAnimationFrame(loop);
  }
  function refreshVisibility(){
    views.forEach(function(v){var r=v.canvas.getBoundingClientRect();v.visible=r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;});paint();
  }
  var colour=function(hex){return[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)].join(',');};
  var count=function(action){return(selected.kit.states[action]||{count:1}).count;};
  function frameMs(action){return(selected.kit.states[action]||{}).frameMs||(action==='run'?70:action==='walk'?100:170);}
  function uniqueActions(c){c=c||selected;return typeof c.kit.uniqueActions==='function'?c.kit.uniqueActions(c.id):[];}
  function uniqueAction(action,c){return uniqueActions(c).find(function(a){return a.id===action;});}
  function actionName(action){var common=ACTIONS.find(function(a){return a[0]===action;});return common?common[1]:(uniqueAction(action)||{}).name||action;}
  function makeCanvas(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function personaTick(c,time){
    var start={claude:180,deepseek:145,doubao:72,grok:330,gemini:240,kimi:480,gpt:0};
    var span={claude:80,deepseek:135,doubao:142,grok:55,gemini:90,kimi:85,gpt:180};
    return(start[c.id]||0)+Math.floor(time/85)%(span[c.id]||180);
  }
  function drawSprite(ctx,c,action,index,dir,x,y,width){c.kit.draw(ctx,c.id,action,index,x,y,width,dir==='left',dir);}
  function makeCharacterButton(c,i){
    var b=document.createElement('button');b.type='button';b.className='cast-card';b.style.setProperty('--cast-color',c.color);b.dataset.id=c.id;b.setAttribute('aria-label','查看 '+c.name);b.setAttribute('aria-pressed','false');
    var canvas=makeCanvas(96,128);canvas.setAttribute('aria-hidden','true');var name=document.createElement('strong');name.textContent=c.name;b.append(canvas,name);
    var icon=window.AIStudioBadges&&AIStudioBadges.createIcon(c.id);if(icon){var mark=document.createElement('span');mark.className='cast-mark';mark.appendChild(icon);b.appendChild(mark);}
    b.addEventListener('click',function(){select(c);});$('castGrid').appendChild(b);castViews.push({canvas:canvas,button:b,c:c});watch(canvas,'cast');
  }
  function makeSignatureSelector(c){
    var button=document.createElement('button');button.type='button';button.title=c.name;button.dataset.id=c.id;button.style.setProperty('--cast-color',c.color);button.setAttribute('aria-label','查看 '+c.name+' 的特有动作');button.setAttribute('aria-pressed','false');
    var icon=window.AIStudioBadges&&AIStudioBadges.createIcon(c.id);if(icon)button.appendChild(icon);else button.textContent=c.name;
    button.addEventListener('click',function(){select(c);var actions=uniqueActions();if(actions.length)chooseAction(actions[0].id);});$('signatureCastControls').appendChild(button);signatureCastViews.push({button:button,c:c});
  }
  function portraitPath(c){return 'media/ai-studio/portraits/'+c.id+'.png';}
  function openPortrait(c){
    portraitCast=c;var dialog=$('portraitDialog');dialog.style.setProperty('--portrait-color',c.color);
    $('portraitDialogImage').src=portraitPath(c);$('portraitDialogImage').alt=c.name+' 像素立绘';
    $('portraitDialogName').textContent=c.name;$('portraitDialogSubtitle').textContent=PORTRAITS[c.id][0];
    $('portraitDownload').href=portraitPath(c);$('portraitDownload').download=c.name+'-portrait.png';
    dialog.showModal();
  }
  function makePortrait(c,index){
    var card=document.createElement('button');card.type='button';card.className='portrait-card';card.dataset.id=c.id;card.style.setProperty('--portrait-color',c.color);card.setAttribute('aria-label','放大 '+c.name+' 像素立绘');
    var top=document.createElement('span');top.className='portrait-top';var number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');top.appendChild(number);
    var icon=window.AIStudioBadges&&AIStudioBadges.createIcon(c.id);if(icon)top.appendChild(icon);
    var img=document.createElement('img');img.src=portraitPath(c);img.width=96;img.height=112;img.loading='lazy';img.alt='';
    var name=document.createElement('strong');name.textContent=c.name;var title=document.createElement('span');title.className='portrait-subtitle';title.textContent=PORTRAITS[c.id][0];
    var tag=document.createElement('small');tag.textContent=PORTRAITS[c.id][1];card.append(top,img,name,title,tag);
    card.addEventListener('click',function(){openPortrait(c);});$('portraitGallery').appendChild(card);
  }
  function makeUniqueControls(){
    release(uniqueViews);uniqueViews=[];$('uniqueActionControls').replaceChildren();$('uniqueActionGallery').replaceChildren();
    uniqueActions().forEach(function(a,index){
      var button=document.createElement('button');button.type='button';button.dataset.action=a.id;button.textContent=a.name;button.title=a.description||a.name;button.setAttribute('aria-pressed','false');button.addEventListener('click',function(){chooseAction(a.id);});$('uniqueActionControls').appendChild(button);
      var card=document.createElement('button');card.type='button';card.className='unique-motion-card';card.dataset.action=a.id;card.setAttribute('aria-pressed','false');
      var top=document.createElement('span');top.className='unique-card-top';top.textContent='0'+(index+1)+' / '+selected.name+' ONLY';
      var canvas=makeCanvas(192,224);canvas.setAttribute('aria-hidden','true');var caption=document.createElement('span');caption.className='motion-caption';var name=document.createElement('strong');name.textContent=a.name;var countLabel=document.createElement('small');countLabel.textContent=String(count(a.id)).padStart(2,'0')+'F';caption.append(name,countLabel);
      var description=document.createElement('p');description.textContent=a.description||a.name;card.append(top,canvas,caption,description);
      card.addEventListener('click',function(){chooseAction(a.id);stage.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});$('uniqueActionGallery').appendChild(card);uniqueViews.push({canvas:canvas,button:card,action:a.id});watch(canvas,'unique');
    });
  }
  function makeFrameCards(n){
    release(gaitViews);gaitViews=[];gaitMetaKey='';$('gaitGallery').replaceChildren();
    for(var i=0;i<n;i++)(function(index){
      var card=document.createElement('button');card.type='button';card.className='gait-card';card.setAttribute('aria-label','检查动作第 '+(index+1)+' 帧');card.setAttribute('aria-pressed','false');
      var canvas=makeCanvas(144,160);canvas.setAttribute('aria-hidden','true');var caption=document.createElement('span');caption.className='gait-caption';var number=document.createElement('strong');number.textContent=String(index+1).padStart(2,'0');var phase=document.createElement('small');caption.append(number,phase);var support=document.createElement('em');card.append(canvas,caption,support);
      card.addEventListener('click',function(){state=gaitAction;playing=false;frame=index;elapsed=frame*frameMs(state);sync();paint();});$('gaitGallery').appendChild(card);gaitViews.push({canvas:canvas,button:card,phase:phase,support:support,index:index});watch(canvas,'gait');
    })(i);
  }
  function makeControls(){
    makeFrameCards(count(state));
    document.querySelectorAll('[data-gait]').forEach(function(button){button.addEventListener('click',function(){chooseAction(button.dataset.gait);});});
    DIRECTIONS.forEach(function(d){
      var b=document.createElement('button');b.type='button';b.textContent=d[1];b.dataset.direction=d[0];b.setAttribute('aria-pressed','false');b.addEventListener('click',function(){direction=d[0];sync();paint();});$('directionControls').appendChild(b);
      var card=document.createElement('button');card.type='button';card.className='direction-card';card.setAttribute('aria-pressed','false');card.dataset.direction=d[0];
      var label=document.createElement('span');label.textContent=d[1];var small=document.createElement('small');small.textContent=d[2];label.appendChild(small);var canvas=makeCanvas(144,160);canvas.setAttribute('aria-hidden','true');card.append(label,canvas);
      card.addEventListener('click',function(){direction=d[0];sync();paint();});$('directionGallery').appendChild(card);directionViews.push({canvas:canvas,button:card,direction:d[0]});watch(canvas,'direction');
    });
    ACTIONS.forEach(function(a){
      var b=document.createElement('button');b.type='button';b.textContent=a[1];b.dataset.action=a[0];b.setAttribute('aria-pressed','false');b.addEventListener('click',function(){chooseAction(a[0]);});$('actionControls').appendChild(b);
      var card=document.createElement('button');card.type='button';card.className='motion-card';card.setAttribute('aria-pressed','false');card.dataset.action=a[0];
      var canvas=makeCanvas(144,160);canvas.setAttribute('aria-hidden','true');var caption=document.createElement('span');caption.className='motion-caption';var name=document.createElement('strong');name.textContent=a[1];var small=document.createElement('small');small.textContent='';caption.append(name,small);card.append(canvas,caption);
      card.addEventListener('click',function(){chooseAction(a[0]);stage.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});});$('actionGallery').appendChild(card);actionViews.push({canvas:canvas,button:card,action:a[0],countLabel:small});watch(canvas,'action');
    });
  }
  function select(c){var wasUnique=!!uniqueAction(state),changed=c.id!==selected.id;selected=c;if(wasUnique&&changed){var own=uniqueActions();state=own.length?own[0].id:'idle';gaitAction=state;}showPersonality=false;$('personalityToggle').checked=false;frame=0;elapsed=0;makeUniqueControls();sync();paint();}
  function chooseAction(action){state=action;gaitAction=action;frame=0;elapsed=0;showPersonality=false;$('personalityToggle').checked=false;sync();paint();}
  function gaitMetadata(){
    var key=[selected.id,gaitAction,direction].join('|');if(key===gaitMetaKey)return;gaitMetaKey=key;
    gaitViews.forEach(function(v){
      var locomotion=gaitAction==='walk'||gaitAction==='run',p=locomotion&&window.StudioGait&&StudioGait.sample(gaitAction,v.index),labels={contact:'落脚',down:'承重',passing:'交叉',up:'抬脚'};
      var phases=(selected.kit.states[gaitAction]||{}).phaseLabels;
      v.phase.textContent=phases&&phases[v.index]||(p?(p.flight?'腾空':labels[p.phaseName]||p.phaseName):'过渡');
      v.support.textContent=p?(p.near.planted?'近脚支撑':p.far.planted?'远脚支撑':'双脚腾空'):'';
      v.button.setAttribute('aria-label','检查'+actionName(gaitAction)+'第 '+(v.index+1)+' 帧，'+v.phase.textContent);
    });
  }
  function sync(){
    var note=NOTES[selected.id],n=casts.indexOf(selected)+1;
    document.documentElement.style.setProperty('--accent',selected.color);document.documentElement.style.setProperty('--accent-rgb',colour(selected.color));
    $('characterNumber').textContent=String(n).padStart(2,'0')+' / '+selected.kind;$('characterName').textContent=selected.name;$('characterTagline').textContent=note.tagline;
    $('characterTraits').replaceChildren();note.traits.forEach(function(text){var tag=document.createElement('span');tag.textContent=text;$('characterTraits').appendChild(tag);});
    $('characterNote').textContent=note.note;$('stageCharLabel').textContent=selected.name;$('stageDirectionLabel').textContent=DIRECTIONS.find(function(d){return d[0]===direction;})[1];
    var special=uniqueAction(state);
    $('resolutionTag').textContent=selected.kit.width+' × '+selected.kit.height+' / PIXEL ART';$('activeStateName').textContent=actionName(state);
    $('activeActionCategory').textContent=special?selected.name+' 的特有动作':'公共动作';$('activeActionCategory').classList.toggle('is-unique',!!special);
    $('activeActionDescription').textContent=special?special.description||special.name:COMMON_NOTES[state]||'';
    $('uniqueOwnerLabel').textContent=selected.name+' / 03';$('uniqueGalleryTitle').textContent=selected.name+' 的三个小习惯';
    $('personalityOption').hidden=selected.kit!==ai||!!special;
    castViews.forEach(function(v){v.button.setAttribute('aria-pressed',String(v.c.id===selected.id));});
    signatureCastViews.forEach(function(v){v.button.setAttribute('aria-pressed',String(v.c.id===selected.id));});
    document.querySelectorAll('[data-action]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.action===state));});
    document.querySelectorAll('[data-direction]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.direction===direction));});
    actionViews.forEach(function(v){v.countLabel.textContent=String(count(v.action)).padStart(2,'0')+'F';});
    document.querySelectorAll('[data-gait]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.gait===gaitAction));});
    if(gaitViews.length!==count(gaitAction))makeFrameCards(count(gaitAction));
    gaitMetadata();frameUiKey='';
    $('gaitTitle').textContent=count(gaitAction)+' 帧动作分解 · '+actionName(gaitAction);
    document.querySelectorAll('[data-gait]').forEach(function(b){b.textContent=actionName(b.dataset.gait)+' · '+count(b.dataset.gait)+' 帧';});
    $('sheetHelp').textContent=count(state)+' 列动作帧 × 4 行朝向 · '+selected.kit.width*count(state)+' × '+selected.kit.height*4+' 透明 PNG；正面、右前、左前、背面。';
    $('comparisonActionLabel').textContent=selected.name+' · '+actionName(state);
    frame%=count(state);$('frameScrubber').max=count(state)-1;$('frameScrubber').value=frame;
    $('playToggle').textContent=playing?'暂停播放':'播放动作';$('playToggle').setAttribute('aria-pressed',String(playing));$('playIndicator').classList.toggle('still',!playing);$('viewLabel').textContent=playing?'循环播放中':'逐帧查看';
    $('frameCounter').textContent=String(frame+1).padStart(2,'0')+' / '+String(count(state)).padStart(2,'0');
    stage.setAttribute('aria-label',selected.name+'，'+actionName(state)+'，'+$('stageDirectionLabel').textContent);
  }
  function stageFrame(){
    var scale=5,w=selected.kit.width*scale,h=selected.kit.height*scale,x=Math.round((stage.width-w)/2),floor=389,y=floor-h;
    sg.clearRect(0,0,stage.width,stage.height);sg.imageSmoothingEnabled=false;
    // Camera-relative tiles move at the pose's authored stride length. A planted
    // foot then stays with the ground instead of looking like a sliding kick.
    var loco=state==='walk'||state==='run',motion=selected.kit.states[state]||{},travel=loco&&groundMotion?((playing?elapsed/frameMs(state):frame)*(motion.stridePixels||20)/count(state)*scale):0;
    var dirSign=direction==='left'?-1:1,offset=(travel*dirSign)%88;
    var offsetX=direction==='front'||direction==='back'?0:offset;
    var offsetY=direction==='front'||direction==='back'?(travel*(direction==='front'?1:-1))%44:0;
    sg.fillStyle='#182538';sg.beginPath();sg.moveTo(105,387);sg.lineTo(360,336);sg.lineTo(615,387);sg.lineTo(360,438);sg.closePath();sg.fill();
    sg.save();sg.clip();sg.strokeStyle='#2b3b51';sg.lineWidth=1;
    for(var gx=-600;gx<1300;gx+=88){
      sg.beginPath();sg.moveTo(gx-offsetX,310-offsetY);sg.lineTo(gx+600-offsetX,460-offsetY);sg.stroke();
      sg.beginPath();sg.moveTo(gx-offsetX,460-offsetY);sg.lineTo(gx+600-offsetX,310-offsetY);sg.stroke();
    }sg.restore();
    sg.fillStyle='rgba(0,0,0,.22)';sg.fillRect(291,381,138,13);sg.fillRect(308,394,104,5);sg.fillRect(308,377,104,4);
    var action=state,pose=null,tick=personaTick(selected,elapsed),actor={id:selected.id,ai:true,x:0,y:0,state:selected.id==='gpt'?'walk':'work',path:selected.id==='gpt'?[{}]:[],waveUntil:0,direction:direction};
    if(showPersonality&&window.StudioPersonality){pose=StudioPersonality.pose(actor,tick,false);if(pose.state)action=pose.state;}
    sg.save();if(pose)sg.globalAlpha=pose.alpha;drawSprite(sg,selected,action,frame,direction,x,y,w);sg.restore();
    if(showPersonality&&window.StudioPersonality){sg.save();sg.translate(x,y);sg.scale(scale,scale);StudioPersonality.draw(sg,actor,0,0,selected.kit.width,selected.kit.height,tick,false);sg.restore();}
    if(showLogo&&window.AIStudioBadges){sg.save();sg.translate(stage.width/2-15,y-39);sg.scale(3,3);AIStudioBadges.draw(sg,selected.id,0,0,playing?elapsed/40:0,!playing);sg.restore();}
    if(showGrid){
      sg.strokeStyle='rgba(203,219,244,.12)';sg.lineWidth=1;sg.beginPath();
      for(var xx=x;xx<=x+w;xx+=scale){sg.moveTo(xx+.5,y);sg.lineTo(xx+.5,y+h);}for(var yy=y;yy<=y+h;yy+=scale){sg.moveTo(x,yy+.5);sg.lineTo(x+w,yy+.5);}sg.stroke();
    }
  }
  function smallView(canvas,c,action,index,dir,scale){
    var poseKey=[c.id,action,index,dir,scale].join('|');if(canvas.dataset.poseKey===poseKey)return;canvas.dataset.poseKey=poseKey;
    var ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
    var w=c.kit.width*scale,h=c.kit.height*scale,x=Math.round((canvas.width-w)/2),y=Math.round((canvas.height-h)/2);
    ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(Math.round(canvas.width*.28),y+h-2,Math.round(canvas.width*.44),3);drawSprite(ctx,c,action,index,dir,x,y,w);
  }
  function referenceFrame(){
    var time=playing?elapsed:frame*frameMs(state),cycle=frameMs(state)*count(state);
    return Math.floor(((time%cycle)+cycle)%cycle/cycle*8)%8;
  }
  function paintComparison(){
    if(!comparison||!window.StudioReference8||(!onScreen($('comparison8'))&&!onScreen($('comparison12'))))return;
    var oldKit=selected.kit===hero?StudioReference8.heroes:StudioReference8.ai;
    var oldIndex=referenceFrame();
    [['comparison8',oldKit,oldIndex],['comparison12',selected.kit,frame]].forEach(function(v){
      var canvas=$(v[0]);if(!onScreen(canvas))return;
      var key=[selected.id,state,v[2],direction].join('|');if(canvas.dataset.poseKey===key)return;canvas.dataset.poseKey=key;
      var ctx=canvas.getContext('2d'),scale=4,w=v[1].width*scale,h=v[1].height*scale,x=Math.round((canvas.width-w)/2),y=291-h;
      ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#26374c';ctx.fillRect(44,291,272,1);ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(132,286,96,5);
      v[1].draw(ctx,selected.id,state,v[2],x,y,w,direction==='left',direction);
    });
    var oldText=String(oldIndex+1).padStart(2,'0')+' / 08',newText=String(frame+1).padStart(2,'0')+' / '+count(state),cycleText='两边每轮均为 '+(frameMs(state)*count(state)/1000).toFixed(2)+' 秒';
    if($('comparison8Counter').textContent!==oldText)$('comparison8Counter').textContent=oldText;
    if($('comparison12Counter').textContent!==newText)$('comparison12Counter').textContent=newText;
    if($('comparisonCycle').textContent!==cycleText)$('comparisonCycle').textContent=cycleText;
  }
  function loadReference(){
    if(window.StudioReference8)return Promise.resolve();if(referencePromise)return referencePromise;
    referencePromise=new Promise(function(resolve,reject){var script=document.createElement('script');script.src='js/studio-reference8.js?v=20261028twelve9';script.onload=resolve;script.onerror=function(){referencePromise=null;script.remove();reject(new Error('reference unavailable'));};document.head.appendChild(script);});return referencePromise;
  }
  function paint(){
    if(document.hidden){schedule();return;}
    paintCount++;if(onScreen(stage))stageFrame();paintComparison();
    var key=[state,gaitAction,frame,count(state)].join('|');
    if(frameUiKey!==key){
      frameUiKey=key;$('frameScrubber').value=frame;$('frameCounter').textContent=String(frame+1).padStart(2,'0')+' / '+String(count(state)).padStart(2,'0');
      gaitViews.forEach(function(v){var pressed=String(state===gaitAction&&frame===v.index);if(v.button.getAttribute('aria-pressed')!==pressed)v.button.setAttribute('aria-pressed',pressed);});
    }
    castViews.forEach(function(v){if(onScreen(v.canvas))smallView(v.canvas,v.c,'idle',0,'front',2);});
    directionViews.forEach(function(v){if(onScreen(v.canvas))smallView(v.canvas,selected,state,frame,v.direction,2);});
    actionViews.forEach(function(v){if(!onScreen(v.canvas))return;var n=count(v.action),index=playing?Math.floor(elapsed/frameMs(v.action))%n:frame%n;smallView(v.canvas,selected,v.action,index,direction,2);});
    uniqueViews.forEach(function(v){if(!onScreen(v.canvas))return;var n=count(v.action),index=playing?Math.floor(elapsed/frameMs(v.action))%n:frame%n;smallView(v.canvas,selected,v.action,index,direction,3);});
    gaitViews.forEach(function(v){
      if(onScreen(v.canvas))smallView(v.canvas,selected,gaitAction,v.index,direction,2);
    });
    schedule();
  }
  function step(delta){playing=false;frame=(frame+delta+count(state))%count(state);sync();paint();}
  function togglePlay(){playing=!playing;elapsed=frame*frameMs(state);sync();paint();}
  $('playToggle').addEventListener('click',togglePlay);$('prevFrame').addEventListener('click',function(){step(-1);});$('nextFrame').addEventListener('click',function(){step(1);});
  $('frameScrubber').addEventListener('input',function(){playing=false;frame=Number(this.value);sync();paint();});$('playSpeed').addEventListener('change',function(){speed=Number(this.value);});
  $('pixelGridToggle').addEventListener('change',function(){showGrid=this.checked;paint();});$('logoToggle').addEventListener('change',function(){showLogo=this.checked;paint();});
  $('groundMotionToggle').addEventListener('change',function(){groundMotion=this.checked;paint();});
  $('personalityToggle').addEventListener('change',function(){showPersonality=this.checked;elapsed=0;if(showPersonality&&selected.id==='gpt'){state='walk';gaitAction=state;frame=0;}sync();paint();});
  stage.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}else if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key===' '){e.preventDefault();togglePlay();}});
  $('exportFrame').addEventListener('click',function(){
    var c=makeCanvas(selected.kit.width*4,selected.kit.height*4),ctx=c.getContext('2d');drawSprite(ctx,selected,state,frame,direction,0,0,c.width);var a=document.createElement('a');a.download=(selected.name+'-'+state+'-'+direction+'-'+String(frame+1).padStart(2,'0')+'.png').toLowerCase();a.href=c.toDataURL('image/png');a.click();
  });
  $('exportSheet').addEventListener('click',function(){
    var kit=selected.kit,n=count(state),c=makeCanvas(kit.width*n,kit.height*DIRECTIONS.length),ctx=c.getContext('2d');
    DIRECTIONS.forEach(function(d,row){for(var col=0;col<n;col++)drawSprite(ctx,selected,state,col,d[0],col*kit.width,row*kit.height,kit.width);});
    var a=document.createElement('a');a.download=(selected.name+'-'+state+'-4directions-'+n+'frames.png').toLowerCase();a.href=c.toDataURL('image/png');a.click();
  });
  $('comparisonToggle').addEventListener('click',function(){
    var button=this;if(comparison){comparison=false;$('comparisonBoard').hidden=true;button.textContent='开启对照';button.setAttribute('aria-expanded','false');schedule();return;}
    button.disabled=true;button.textContent='正在准备…';loadReference().then(function(){comparison=true;$('comparisonBoard').hidden=false;button.disabled=false;button.textContent='收起对照';button.setAttribute('aria-expanded','true');paint();}).catch(function(){button.disabled=false;button.textContent='加载失败，点此重试';});
  });
  $('closePortrait').addEventListener('click',function(){$('portraitDialog').close();});
  $('portraitDialog').addEventListener('click',function(e){if(e.target===this){var r=this.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)this.close();}});
  $('portraitMotion').addEventListener('click',function(){if(!portraitCast)return;select(portraitCast);$('portraitDialog').close();stage.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});stage.focus({preventScroll:true});});
  watch(stage,'stage');watch($('comparison8'),'comparison');watch($('comparison12'),'comparison');
  casts.forEach(makeCharacterButton);casts.forEach(makeSignatureSelector);casts.forEach(makePortrait);makeControls();makeUniqueControls();sync();paint();
  function loop(ts){
    raf=0;if(document.hidden||!playing||!hasAnimation()){running=false;last=0;lastPaint=0;return;}
    if(!last)last=ts;var dt=Math.min(120,ts-last);last=ts;elapsed+=dt*speed;
    if(ts-lastPaint>=1000/30){lastPaint=ts;frame=Math.floor(elapsed/frameMs(state))%count(state);paint();}
    schedule();
  }
  document.addEventListener('visibilitychange',function(){last=0;if(!document.hidden)paint();else schedule();});
  var motion=window.matchMedia('(prefers-reduced-motion: reduce)');if(motion.addEventListener)motion.addEventListener('change',function(e){if(e.matches){playing=false;sync();paint();}});
  if(!viewObserver){window.addEventListener('scroll',refreshVisibility,{passive:true});window.addEventListener('resize',refreshVisibility);refreshVisibility();}
  window.CharacterLab={snapshot:function(){var onscreen=0,animations=0;views.forEach(function(v){if(v.visible){onscreen++;if(animated(v))animations++;}});return{selected:selected.id,name:selected.name,state:state,actionKind:uniqueAction(state)?'unique':'common',direction:direction,frame:frame,count:count(state),frameMs:frameMs(state),cycleMs:frameMs(state)*count(state),playing:playing,speed:speed,grid:showGrid,logo:showLogo,personality:showPersonality,groundMotion:groundMotion,gaitAction:gaitAction,comparison:comparison,referenceFrame:comparison?referenceFrame():null,width:selected.kit.width,height:selected.kit.height,characters:casts.length,commonActions:ACTIONS.length,uniqueActions:uniqueActions().map(function(a){return{id:a.id,name:a.name};}),actions:ACTIONS.length+uniqueActions().length,running:running,visibleCanvases:onscreen,visibleAnimations:animations,paints:paintCount};}};
})();
