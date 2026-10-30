/* A shared pixel home: Feline1 leads the camera, friends work and visit. */
(function () {
  'use strict';
  var view = document.getElementById('studio');
  if (!view || !window.StudioRoom || !window.StudioWorld) return;
  var BASE_SW=320, BASE_ZOOM=2, WORLD=StudioWorld.width, WORLD_H=StudioWorld.height, SIM_STEP=50;
  var SW=BASE_SW, SH=180, SCALE=2, zoom=BASE_ZOOM, pixelRatio=1, displayWidth=0, displayHeight=0;
  view.width=SW*SCALE; view.height=SH*SCALE;
  var screen=view.getContext('2d'), scene=PX.make(view.width,view.height), g=scene.getContext('2d');
  var world=StudioWorld.build(StudioRoom.background);
  var status=document.getElementById('studioStatus'), roster=document.getElementById('studioRoster');
  var photoButton=document.getElementById('studioPhoto');
  var soundButton=document.getElementById('studioSound'),volumeInput=document.getElementById('studioVolume'),soundStatus=document.getElementById('studioSoundStatus'),voice=window.StudioVoice;
  var motion=window.matchMedia('(prefers-reduced-motion: reduce)'), reduced=motion.matches, paused=motion.matches;
  var visible=false, stageActive=true, running=false, ready=false, lastFrame=0, animationMs=0, tk=0, camera=0,cameraY=0,director=null;
  var accumulator=0,renderAlpha=0,renderTimeMs=0,renderCount=0,renderCamera=0,renderCameraY=0,cameraVelocity=0,cameraVelocityY=0,cameraHandoffUntil=0;
  var pair=null, nextPair=210, photo=null,photoSerial=0, selected='Feline1', hint=null, keys={};
  var lastStatus='', statusKey='studio.loading', statusName='',statusDetail=null,lastPerformanceStatus='', originals={}, actors=[], byId={}, hitboxes=[];
  var palettes={C0:'#4fe3ff',X0:'#b48cff',Feline1:'#ff9fc4'};
  var homes=StudioWorld.workstations.map(function(s){return[s.id,s.x,s.y,'work'];});
  PX.ORDER.forEach(function(id){
    var s=PX.buildChar(id); originals[id]=s;
    s.left={stand:PX.flip(s.stand),blink:PX.flip(s.blink),cheer:PX.flip(s.cheer),run:s.run.map(PX.flip),idle:s.idle.map(PX.flip)};
  });
  homes.forEach(function(h,i){
    var meta=window.AIStudioSprites && AIStudioSprites.characters.filter(function(c){return c.id===h[0];})[0];
    var a={id:h[0],name:window.StudioCast?StudioCast.name(h[0]):meta?meta.name:h[0]==='Feline1'?'F1':h[0],color:meta?meta.color:palettes[h[0]],ai:!!meta,
      home:{x:h[1],y:h[2]},homeState:h[3],x:h[1],y:h[2],state:h[3],direction:h[3]==='work'?'right':'front',facingLeft:false,path:[],after:h[3],
      until:i===2?100:220+i*29,waveUntil:0,mood:null,bubbleUntil:0,visits:0,index:i,lastQuirk:null,gait:i*2,waiting:false,manualUntil:0};
    a.prevX=a.renderX=a.x;a.prevY=a.renderY=a.y;a.prevGait=a.renderGait=a.gait;
    actors.push(a); byId[a.id]=a;
    var b=document.createElement('button');b.type='button';b.title=a.name;b.setAttribute('aria-label',a.name);
    var icon=window.AIStudioBadges&&AIStudioBadges.createIcon(a.id);if(icon)b.appendChild(icon);
    var label=document.createElement('span');label.className='studio-sr';label.textContent=a.name;b.appendChild(label);
    b.style.setProperty('--actor-color',a.color);b.setAttribute('aria-pressed',a.id===selected?'true':'false');
    b.addEventListener('click',function(){followActor(a);});b.addEventListener('dblclick',function(){greet(a);});roster.appendChild(b);a.button=b;
  });
  var leader=byId.Feline1, followed=leader, zones=StudioWorld.zones;
  var hangouts=StudioWorld.hangouts||[{x:550,y:190},{x:860,y:210},{x:1120,y:250}];
  var catHome=StudioWorld.catHome,cat={x:catHome.x,prevX:catHome.x,renderX:catHome.x,target:catHome.target,y:catHome.y,until:230,state:'sleep'};
  var snow=Array.from({length:24},function(_,i){return[i*7%59,i*11%54];});
  if(window.StudioDirector)director=StudioDirector.create({
    actors:actors,getKit:actorKit,getSpeed:movementSpeed,isMoving:moving,
    navigate:function(a,x,y,after,fast){go(a,x,y,after,fast||Math.hypot(x-a.x,y-a.y)>420);},findStage:findDuetStage,findSoloStage:findSoloStage,
    onEvent:function(detail){
      var members=(detail.actors||[]).map(function(id){return byId[id];}).filter(Boolean);
      if(detail.phase==='start')rerouteAroundStage();
      if(members.length)activity(detail.type,members,{action:detail.action,scene:detail.scene,performance:detail.performance,stage:detail.stage,phase:detail.phase,line:detail.line});
    },
    onCancel:function(detail){
      (detail.approaching||[]).forEach(function(id){var a=byId[id];if(!a||(detail.preserve||[]).indexOf(id)>=0)return;a.path=[];a.waiting=false;a.state='rest';a.until=tk+90;});
      refreshPerformanceIndicators();
    }
  });
  function t(key,values){return window.I18N?(I18N.liveT?I18N.liveT(key,values):I18N.t(key,values)):key;}
  function chinese(){return !window.I18N||(I18N.liveLocale?I18N.liveLocale():I18N.getLocale())==='zh-CN';}
  function liveText(value){return window.StudioCast?StudioCast.text(value):value;}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function zoneAt(x){return zones.filter(function(z){return x>=z.x&&x<z.end;})[0]||zones[zones.length-1];}
  function floorRow(part){var bounds=StudioNavigation.bounds;return Math.round(bounds.top+(bounds.bottom-bounds.top)*part);}
  // The map is a persistent world. The frame is a window into it: resizing the
  // frame reveals more or less floor at the same character size.
  function projectViewport(){SCALE=zoom*pixelRatio;SW=scene.width/SCALE;SH=scene.height/SCALE;}
  function clampCamera(){
    var x=clamp(camera,0,Math.max(0,WORLD-SW)),y=clamp(cameraY,0,Math.max(0,WORLD_H-SH));
    if(x!==camera)cameraVelocity=0;if(y!==cameraY)cameraVelocityY=0;camera=x;cameraY=y;
  }
  function snapCamera(x,y){camera=x;cameraY=y;cameraVelocity=cameraVelocityY=0;clampCamera();}
  function photoBounds(){
    if(!photo||photo.phase==='depart')return null;
    return{left:Math.min.apply(null,photo.slots.map(function(s){return s.x;}))-32,
      right:Math.max.apply(null,photo.slots.map(function(s){return s.x;}))+32,
      top:Math.min.apply(null,photo.slots.map(function(s){return s.y;}))-64,
      bottom:Math.max.apply(null,photo.slots.map(function(s){return s.y;}))+8};
  }
  function cameraZoom(){
    var group=photoBounds(),fit=group?Math.min(BASE_ZOOM,displayWidth/(group.right-group.left),displayHeight/(group.bottom-group.top)):BASE_ZOOM;
    return Math.max(fit,displayWidth/WORLD,displayHeight/WORLD_H);
  }
  function cameraTarget(){
    var group=photoBounds();
    return{x:clamp((group?(group.left+group.right)/2:followed.renderX)-SW*.5,0,Math.max(0,WORLD-SW)),
      y:clamp(group?(group.top+group.bottom-SH)/2:followed.renderY-SH*.72,0,Math.max(0,WORLD_H-SH))};
  }
  function focusCamera(){
    presentPositions();zoom=cameraZoom();projectViewport();var target=cameraTarget();snapCamera(target.x,target.y);
  }
  function resizeCanvas(){
    var rect=view.getBoundingClientRect();if(rect.width<1)return false;
    // A very narrow panel should not grow into a tall strip. This limit belongs
    // to the display frame, never to the dimensions of the world behind it.
    var maxHeight=Math.floor(rect.width*1.45)+'px';
    if(view.parentElement.style.maxHeight!==maxHeight)view.parentElement.style.maxHeight=maxHeight;
    rect=view.getBoundingClientRect();if(rect.height<1)return false;
    var density=clamp(window.devicePixelRatio||1,1,2);
    if(rect.width===displayWidth&&rect.height===displayHeight&&density===pixelRatio)return false;
    var first=!displayWidth,centerX=camera+SW/2,centerY=cameraY+SH/2;
    displayWidth=rect.width;displayHeight=rect.height;pixelRatio=density;
    // Backing buffers follow the frame, so camera motion/temporary photo zoom
    // never reallocates canvases or changes page layout.
    view.width=scene.width=Math.round(displayWidth*pixelRatio);view.height=scene.height=Math.round(displayHeight*pixelRatio);
    zoom=cameraZoom();projectViewport();
    if(first||paused)focusCamera();else snapCamera(centerX-SW/2,centerY-SH/2);
    screen.imageSmoothingEnabled=g.imageSmoothingEnabled=false;return true;
  }
  function presentPositions(){
    actors.forEach(function(a){a.renderX=a.prevX+(a.x-a.prevX)*renderAlpha;a.renderY=a.prevY+(a.y-a.prevY)*renderAlpha;a.renderGait=a.prevGait+(a.gait-a.prevGait)*renderAlpha;});
    cat.renderX=cat.prevX+(cat.x-cat.prevX)*renderAlpha;
  }
  function advanceCamera(dt){
    var desiredZoom=cameraZoom(),oldWidth=SW,oldHeight=SH;
    zoom+=(desiredZoom-zoom)*(1-Math.exp(-dt/150));
    if(Math.abs(zoom-desiredZoom)<.001)zoom=desiredZoom;
    projectViewport();camera+=(oldWidth-SW)/2;cameraY+=(oldHeight-SH)/2;clampCamera();
    var target=cameraTarget();
    // A critically damped spring starts and stops gently, independent of RAF rate.
    var seconds=dt/1000,omega=2/(renderTimeMs<cameraHandoffUntil?.22:.5),decay=Math.exp(-omega*seconds);
    var change=camera-target.x,temp=(cameraVelocity+omega*change)*seconds;
    camera=target.x+(change+temp)*decay;cameraVelocity=(cameraVelocity-omega*temp)*decay;
    var changeY=cameraY-target.y,tempY=(cameraVelocityY+omega*changeY)*seconds;
    cameraY=target.y+(changeY+tempY)*decay;cameraVelocityY=(cameraVelocityY-omega*tempY)*decay;
    clampCamera();
    if(Math.abs(camera-target.x)<.002&&Math.abs(cameraVelocity)<.02){camera=target.x;cameraVelocity=0;}
    if(Math.abs(cameraY-target.y)<.002&&Math.abs(cameraVelocityY)<.02){cameraY=target.y;cameraVelocityY=0;}
  }
  function moving(a){return a.path.length>0;}
  function actorKit(a){return a.ai?window.AIStudioSprites:window.StudioHeroSprites;}
  function performanceAvoid(a){
    var avoid=[];if(!director)return avoid;
    director.snapshot().jobs.forEach(function(job){
      if(job.actors.indexOf(a.id)>=0)return;
      var left=Math.min.apply(null,job.targets.map(function(p){return p.x;})),right=Math.max.apply(null,job.targets.map(function(p){return p.x;}));
      var x=(left+right)/2,y=job.targets[0].y,radius=(right-left)/2+17;
      if(job.performance){var original=['C0','X0','Feline1'].indexOf(job.performance)>=0;var offsets=original?[-54,-36,-18,0,18,36,54,72]:[-36,-18,0,18,36];offsets.forEach(function(offset){avoid.push({x:x+offset,y:y-6,radius:16});});return;}
      // Overlapping footprints reserve the space behind the performers, so
      // passers-by take the back aisle instead of crossing a prop or a face.
      [0,-9,-18,-27,-36].forEach(function(offset){avoid.push({x:x,y:y+offset,radius:radius});});
    });
    return avoid;
  }
  function routeAvoid(a){
    return actors.filter(function(b){return b!==a&&!moving(b)&&b.y>134;}).map(function(b){return{x:b.x,y:b.y,radius:7};}).concat(performanceAvoid(a));
  }
  function rerouteAroundStage(){
    actors.forEach(function(a){
      if(!moving(a)||a.manualUntil>tk||director.owns(a))return;
      var end=a.path[a.path.length-1],path=StudioNavigation.plan(a,end,{avoid:routeAvoid(a)});
      if(path.length)a.path=path;
    });
  }
  function clearStage(p,ignored,radius){
    radius=radius||30;
    return StudioNavigation.isWalkable(p.x,p.y)&&actors.every(function(a){
      if(ignored.indexOf(a.id)>=0)return true;
      var target=a.path[a.path.length-1];
      return Math.hypot(p.x-a.x,p.y-a.y)>=radius&&(!target||Math.hypot(p.x-target.x,p.y-target.y)>=radius);
    });
  }
  function findSoloStage(a){
    var original=['C0','X0','Feline1'].indexOf(a.id)>=0;
    var radius=original?82:window.StudioCast&&StudioCast.story(a.id)?58:30;
    function clear(p){
      if(!original)return clearStage(p,[a.id],radius);
      return StudioNavigation.isWalkable(p.x,p.y)&&actors.every(function(other){
        if(other===a)return true;var target=other.path[other.path.length-1];
        if(other.y<134&&!target)return true;
        return Math.hypot(p.x-other.x,p.y-other.y)>=radius&&(!target||Math.hypot(p.x-target.x,p.y-target.y)>=radius);
      });
    }
    // The new living rooms have an open rehearsal area. Use it before trying
    // an improvised spot between occupied chairs and household furniture.
    var stages=(StudioWorld.performanceSpots||[]).slice().sort(function(p,q){return Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y);});
    for(var s=0;s<stages.length;s++)if(clear(stages[s]))return{x:stages[s].x,y:stages[s].y};
    if(a.y>=floorRow(original?.5:.65)&&a.y<=floorRow(original?.8:1)&&a.x>=radius&&a.x<=WORLD-radius&&clear(a))return{x:a.x,y:a.y};
    var offsets=original?[0,48,-48,96,-96,144,-144,192,-192,240,-240]:[0,32,-32,64,-64,96,-96],rows=original?[floorRow(.62),floorRow(.75),floorRow(.5)]:[floorRow(.84),floorRow(.96),floorRow(.68)];
    for(var j=0;j<rows.length;j++)for(var i=0;i<offsets.length;i++){
      var p={x:clamp(a.x+offsets[i],radius,WORLD-radius),y:rows[j]};if(clear(p))return p;
    }
    return null;
  }
  function findDuetStage(a,b){
    var center=clamp((a.x+b.x)/2,48,WORLD-48),offsets=[0,42,-42,84,-84,126,-126],rows=[floorRow(.65),floorRow(.82),floorRow(.95),floorRow(.5)];
    for(var j=0;j<rows.length;j++)for(var i=0;i<offsets.length;i++){
      var x=clamp(center+offsets[i],42,WORLD-42),left={x:x-20,y:rows[j]},right={x:x+20,y:rows[j]};
      if(clearStage(left,[a.id,b.id])&&clearStage(right,[a.id,b.id]))return[left,right];
    }
    return null;
  }
  function directorContext(){
    var blocked=actors.filter(function(a){return a.manualUntil>tk||a.waveUntil>tk||pair&&(pair.a===a||pair.b===a);}).map(function(a){return a.id;});
    return{reduced:reduced,paused:paused,hidden:document.hidden,photo:!!photo,pairActive:!!pair,blocked:blocked,followedId:followed.id,view:{left:camera,right:camera+SW,top:cameraY,bottom:cameraY+SH}};
  }
  function movementSpeed(a,state){return(state==='run'?4:a.ai?2.15:2.35)*(a.id==='gpt'?.9:1);}
  function advanceGait(a,distance){
    if(distance<.001)return;
    // Keep the authored pose timing independent of travel speed. Interpolate
    // this frame cursor as before, but leave it still when movement is blocked.
    var kit=actorKit(a),motion=kit&&kit.states[a.state];
    a.gait+=SIM_STEP/(motion&&motion.frameMs||100);
  }
  function activity(type,members,extra){
    var center=members.reduce(function(n,a){return n+a.x;},0)/Math.max(1,members.length);
    var zone=zoneAt(center),detail={type:type,actors:members.map(function(a){return a.id;}),zone:zone.logZone||zone.id};
    if(extra)Object.keys(extra).forEach(function(k){detail[k]=extra[k];});
    window.dispatchEvent(new CustomEvent('studio:activity',{detail:detail}));
  }
  function setStatus(key,name,detail){
    statusKey=key;statusName=name||'';statusDetail=detail||null;
    var values={name:statusName};if(detail&&detail.action)values.action=t('studio.signature.'+detail.action);if(detail&&detail.scene)values.scene=t('studio.scene.'+detail.scene);if(detail&&detail.label)values.action=liveText(detail.label);
    var text=t(key,values);
    if(text!==lastStatus){status.textContent=text;lastStatus=text;}
  }
  function select(a){selected=a.id;followed=a;status.style.setProperty('--status-color',a.color);actors.forEach(function(p){p.button.setAttribute('aria-pressed',p.id===selected?'true':'false');});}
  function announce(a,state){
    var cue=director&&director.pose(a);
    if(cue){if(cue.performance){setStatus('studio.performStatus',a.name,{label:cue.label});return;}if(cue.scene)setStatus('studio.sceneStatus',a.name,{scene:cue.scene});else setStatus('studio.performStatus',a.name,{action:cue.action||cue.state});return;}
    setStatus('studio.status.'+(state==='chat'?'wave':state),a.name);
  }
  function refreshPerformanceIndicators(){
    if(!director)return;
    actors.forEach(function(a){
      var cue=director.pose(a),active=cue?'true':'false';if(a.button.dataset.performing!==active)a.button.dataset.performing=active;
      var cast=window.StudioCast&&(StudioCast.localized?StudioCast.localized(a.id):StudioCast.get(a.id));
      var title=cue?a.name+' · '+(cue.performance?liveText(cue.title)+' · '+liveText(cue.label):t(cue.scene?'studio.scene.'+cue.scene:'studio.signature.'+(cue.action||cue.state))):a.name+(cast?' · '+cast.tagline:'');
      if(a.button.title!==title)a.button.title=title;
    });
  }
  function followActor(a){
    release();cancelPhoto();if(voice)voice.stop();select(a);
    cameraHandoffUntil=renderTimeMs+900;
    if(paused)focusCamera();
    if(!moving(a))a.until=Math.min(a.until,tk+90);
    announce(a,a.state);draw();wake();
  }
  // Furniture-aware paths use foot positions; visible sprites can overlap in depth.
  function go(a,x,y,after,fast){
    x=clamp(x,18,WORLD-18);y=clamp(y,StudioNavigation.bounds.top,StudioNavigation.bounds.bottom);a.path=[];
    a.waveUntil=0;a.waiting=false;
    var avoid=routeAvoid(a);
    a.path=StudioNavigation.plan({x:a.x,y:a.y},{x:x,y:y},{allowDock:true,avoid:photo?[]:avoid});
    a.after=after||'rest';a.state=fast?'run':'walk';a.until=tk+200;a.facingLeft=x<a.x;
    if(!a.path.length){a.state=a.after;a.until=tk+70;}
    activity('walk',[a]);
  }
  function goHome(a){go(a,a.home.x,a.home.y,a.homeState,false);}
  function settle(a){
    if(a.path.length){var end=a.path[a.path.length-1];a.x=end.x;a.y=end.y;a.path=[];a.state=a.after;}
    a.prevX=a.x;a.prevY=a.y;a.prevGait=a.gait;
  }
  function cancelPair(){
    if(!pair)return;
    [pair.a,pair.b].forEach(function(a){a.mood=null;a.until=tk+200;if(!moving(a))a.state='rest';});
    pair=null;nextPair=tk+260;
  }
  function photoHome(a,index){
    var lane=floorRow(.15+index%4*.2),sign=a.home.x<a.x?-1:1,via=StudioNavigation.nearest(a.x+sign*(22+index%3*5),lane);
    var first=StudioNavigation.plan(a,via),last=StudioNavigation.plan(via,a.home);
    a.photoTravel=true;a.photoDepartAt=0;a.waveUntil=0;a.mood=null;a.bubbleUntil=0;a.waiting=false;
    a.path=first.concat(last);a.after=a.homeState;a.state=a.path.length?'run':a.homeState;a.until=tk+170;
    if(paused){settle(a);a.photoTravel=false;}
  }
  function cancelPhoto(){if(!photo)return;if(voice)voice.stop();photo=null;actors.forEach(function(a,i){photoHome(a,i);});nextPair=tk+160;}
  function greet(a){
    cancelPhoto();cancelPair();
    var host=followed;
    if(director&&a===host&&!paused&&!reduced){
      a.manualUntil=0;
      if(director.requestSolo(a,tk,animationMs,directorContext())){announce(a,a.state);wake(true);return;}
    }
    if(director){director.cancel(a,'greeting');if(a!==host)director.cancel(host,'greeting');}
    if(a===host){host.path=[];host.state='rest';host.direction='front';host.waveUntil=tk+65;host.mood='heart';host.bubbleUntil=tk+65;announce(host,'wave');}
    else{
      var x=clamp(a.x,42,WORLD-42),row=Math.max(floorRow(.55),a.y);go(a,x+16,row,'chat',false);go(host,x-16,row,'chat',Math.abs(host.x-x)>180);
      pair={a:host,b:a,phase:'arrive',until:0};announce(host,host.state);
    }
    if(paused){
      settle(a);settle(host);focusCamera();
      host.mood='heart';host.bubbleUntil=tk+65;
      if(a!==host){a.mood='heart';a.bubbleUntil=tk+65;}
    }
    wake(true);
  }
  function command(x,y){
    cancelPhoto();if(pair&&(pair.a===followed||pair.b===followed))cancelPair();
    if(director)director.cancel(followed,'user-command');followed.manualUntil=tk+250;
    go(followed,x,y===undefined?floorRow(.75):y,'rest',Math.abs(followed.x-x)>140);
    if(paused){settle(followed);focusCamera();}
    var goal=followed.path[followed.path.length-1]||followed;
    hint={x:goal.x,y:goal.y,until:tk+50};announce(followed,followed.state);wake(true);
  }
  function startPair(){
    var list=actors.filter(function(a){return !moving(a)&&a.waveUntil<tk&&a.manualUntil<=tk&&(!director||!director.owns(a));});
    if(list.length<2){nextPair=tk+90;return;}
    var a=list[Math.floor(tk/13)%list.length], buddies=list.filter(function(b){return b!==a;});
    var nearby=buddies.filter(function(b){return Math.abs(b.x-a.x)<220;});
    if(nearby.length)buddies=nearby;
    var b=buddies[Math.floor(tk/29)%buddies.length];
    var center=clamp((a.x+b.x)/2,55,WORLD-55);
    var row=clamp((a.y+b.y)/2+16,floorRow(.45),floorRow(.9));
    go(a,center-17,row,'chat',false);go(b,center+17,row,'chat',false);pair={a:a,b:b,phase:'arrive',until:0};
  }
  function updatePair(){
    if(photo)return;
    if(!pair){if(tk>=nextPair&&actors.filter(moving).length<2)startPair();return;}
    if(pair.phase==='arrive'&&!moving(pair.a)&&!moving(pair.b)){
      pair.phase='talk';pair.until=tk+145;pair.a.facingLeft=false;pair.b.facingLeft=true;pair.a.direction='right';pair.b.direction='left';
      pair.a.waveUntil=tk+24;pair.b.waveUntil=tk+38;activity('chat',[pair.a,pair.b]);
    }
    if(pair.phase==='talk'){
      var turn=Math.floor(tk/30)%2, moods=['symbols','heart','angry','cry','music'];
      pair.a.mood=turn?null:moods[Math.floor(tk/60)%5];pair.b.mood=turn?moods[(Math.floor(tk/60)+1)%5]:null;
      pair.a.bubbleUntil=pair.b.bubbleUntil=tk+2;
      if(tk>=pair.until){
        var a=pair.a,b=pair.b;a.mood=b.mood='heart';a.bubbleUntil=b.bubbleUntil=tk+30;
        activity('heart',[a,b]);pair=null;goHome(a);goHome(b);nextPair=tk+320;
      }
    }
  }
  function updateActor(a){
    if(moving(a)){
      var pt=a.path[0],dx=pt.x-a.x,dy=pt.y-a.y,speed=movementSpeed(a,a.state);
      if(a.photoTravel)speed=Math.abs(a.x-(photo?photo.center.x:followed.x))>BASE_SW*.6?6:4;
      var final=a.path[a.path.length-1];
      var neighbour=!photo&&!a.photoTravel&&tk>(a.replannedAt||0)&&actors.some(function(b){
        var bx=b.x-a.x,by=b.y-a.y,len=Math.hypot(dx,dy)||1;
        return b!==a&&!moving(b)&&b.y>134&&Math.hypot(bx,by)<23&&
          bx*dx+by*dy>0&&Math.abs(bx*dy-by*dx)/len<9&&Math.hypot(final.x-b.x,final.y-b.y)>19;
      });
      if(neighbour){
        var alt=StudioNavigation.plan(a,final,{avoid:routeAvoid(a)});
        a.replannedAt=tk+35;if(alt.length){a.path=alt;return;}
      }
      // Keep space behind slower friends in the same lane (especially GPT).
      var following=!photo&&!a.photoTravel&&Math.abs(dx)>2&&actors.some(function(b){
        return b!==a&&moving(b)&&Math.abs(b.y-a.y)<8&&b.facingLeft===a.facingLeft&&
          (dx>0?b.x>a.x&&b.x-a.x<28:b.x<a.x&&a.x-b.x<28);
      });
      if(following){a.waiting=true;return;}a.waiting=false;
      var len=Math.sqrt(dx*dx+dy*dy);
      if(Math.abs(dx)>Math.abs(dy)*0.7){a.facingLeft=dx<0;a.direction=dx<0?'left':'right';}
      else if(Math.abs(dy)>.1)a.direction=dy<0?'back':'front';
      var step=Math.min(speed,len),next=len?StudioNavigation.move(a,dx/len*step,dy/len*step):a;
      advanceGait(a,Math.hypot(next.x-a.x,next.y-a.y));a.x=next.x;a.y=next.y;
      if(Math.hypot(pt.x-a.x,pt.y-a.y)<.3)a.path.shift();
      if(!moving(a)){
        a.photoTravel=false;a.waiting=false;
        a.state=a.after;a.until=tk+170+a.index*11;a.direction=a.state==='work'?'right':a.direction;
        if(a===followed)announce(a,a.state);activity(a.state==='work'?'work':'visit',[a]);
      }
      return;
    }
    if(photo||pair&&(pair.a===a||pair.b===a)||a.waveUntil>tk||tk<a.until||a.manualUntil>tk||director&&director.owns(a))return;
    // Reserve space for a conversation instead of letting departures fill every slot forever.
    if(!pair&&tk>=nextPair&&actors.filter(moving).length>=1){a.until=tk+25;return;}
    if(actors.filter(moving).length>=3){a.until=tk+30;return;}
    a.visits++;
    if(Math.abs(a.x-a.home.x)>2||Math.abs(a.y-a.home.y)>2)goHome(a);
    else{
      var spot=hangouts[(a.visits-1+a.index*3)%hangouts.length];
      var target=StudioNavigation.nearest(spot.x+(a.index%3-1)*9,spot.y+(a.visits%3-1)*3);
      go(a,target.x,target.y,'rest',Math.hypot(target.x-a.x,target.y-a.y)>420);
    }
  }
  function startPhoto(){
    cancelPhoto();cancelPair();if(voice)voice.stop();if(director)director.cancelAll('photo');
    var composition=StudioPhoto.layout(followed,actors,StudioNavigation,StudioPhoto.patterns[photoSerial++%StudioPhoto.patterns.length]);
    photo={phase:'arrive',until:tk+850,center:composition.center,anchor:followed.id,pattern:composition.pattern,slots:composition.slots,poses:{}};
    composition.slots.forEach(function(slot){var a=byId[slot.id];a.photoTravel=true;go(a,slot.x,slot.y,'rest',true);if(paused)settle(a);});
    cameraHandoffUntil=renderTimeMs+900;
    if(paused){posePhoto();focusCamera();}
    setStatus('studio.photoStatus');wake(true);
  }
  function posePhoto(){
    photo.phase='pose';photo.until=tk+150;
    actors.forEach(function(a){a.photoTravel=false;a.photoDepartAt=0;a.waiting=false;a.facingLeft=false;a.direction='front';a.waveUntil=0;a.mood=a.id===photo.anchor?'heart':null;a.bubbleUntil=a.id===photo.anchor?tk+150:0;photo.poses[a.id]=StudioPhoto.pose(a,actorKit(a));});
    activity('photo',actors);
  }
  function departPhoto(){
    if(voice)voice.stop();
    photo.phase='depart';photo.until=tk+850;
    StudioPhoto.shuffle(actors).forEach(function(a,i){a.mood=null;a.bubbleUntil=0;a.waveUntil=0;a.state='rest';a.photoDepartAt=tk+i*4+1;a.photoOrder=i;});
  }
  function updatePhoto(){
    if(!photo)return;var visitors=actors;
    if(photo.phase==='arrive'&&visitors.every(function(a){return !moving(a);})){
      posePhoto();
    }
    if(photo.phase==='pose'&&tk>=photo.until)departPhoto();
    if(photo.phase==='depart'){
      visitors.forEach(function(a){if(a.photoDepartAt&&tk>=a.photoDepartAt)photoHome(a,a.photoOrder);});
      if(visitors.every(function(a){return !a.photoDepartAt&&!moving(a);})){photo=null;nextPair=tk+100;setStatus('studio.loadedStatus');}
    }
    if(photo&&tk>=photo.until){cancelPhoto();setStatus('studio.loadedStatus');}
  }
  function update(){
    tk++;
    if(director)director.update(tk,animationMs,directorContext());
    if(keys.ArrowLeft||keys.ArrowRight){
      if(pair&&(pair.a===followed||pair.b===followed))cancelPair();
      followed.path=[];followed.waiting=false;followed.waveUntil=0;followed.state=keys.Shift?'run':'walk';
      followed.manualUntil=tk+100;
      var speed=movementSpeed(followed,followed.state);
      var next=StudioNavigation.move(followed,(keys.ArrowRight?1:-1)*speed,0);
      advanceGait(followed,Math.hypot(next.x-followed.x,next.y-followed.y));followed.x=next.x;followed.y=next.y;followed.facingLeft=!keys.ArrowRight;
      followed.direction=keys.ArrowRight?'right':'left';followed.until=tk+100;
    }
    actors.forEach(function(a){if(a!==followed||!(keys.ArrowLeft||keys.ArrowRight))updateActor(a);});updatePair();updatePhoto();
    if(!director&&window.StudioPersonality)actors.forEach(function(a){
      var q=StudioPersonality.describe(a,tk);
      if(q&&q!==a.lastQuirk)activity('quirk',[a],{quirk:q});a.lastQuirk=q;
    });
    if(director){
      refreshPerformanceIndicators();
      var current=director.pose(followed),statusId=current?followed.id+'|'+current.state+'|'+(current.scene||'')+'|'+current.stage:'';
      if(statusId!==lastPerformanceStatus){if(!photo)announce(followed,followed.state);lastPerformanceStatus=statusId;}
    }
    if(tk>=cat.until&&cat.state==='sleep'){cat.state='walk';cat.target=cat.x<(catHome.x+catHome.target)/2?catHome.target:catHome.x;}
    if(cat.state==='walk'){
      cat.x+=cat.target>cat.x?.45:-.45;
      if(Math.abs(cat.x-cat.target)<.5){cat.x=cat.target;cat.state='sleep';cat.until=tk+250;}
    }
  }
  // Pixel cloud bubbles: expressions and comic noise, never literal dialogue.
  function bubble(mood,x,y,color){
    if(!mood)return;var bx=x-11;
    g.fillStyle='#2e243e';g.fillRect(bx+3,y,16,1);g.fillRect(bx+1,y+1,20,2);g.fillRect(bx,y+3,22,8);g.fillRect(bx+2,y+11,18,2);g.fillRect(x-1,y+13,3,2);
    g.fillStyle='#fff5ea';g.fillRect(bx+3,y+1,16,11);g.fillRect(bx+1,y+3,20,7);g.fillRect(x,y+12,2,2);
    function pixel(px,py,w,h,c){g.fillStyle=c;g.fillRect(x+px,y+py,w,h);}
    if(mood==='heart'){
      pixel(-5,4,4,3,'#e96795');pixel(1,4,4,3,'#e96795');pixel(-5,6,10,2,'#e96795');pixel(-4,8,8,1,'#e96795');pixel(-3,9,6,1,'#e96795');pixel(-1,10,2,1,'#e96795');
    }else if(mood==='angry'){
      pixel(-5,3,3,1,'#a25362');pixel(-3,4,2,1,'#a25362');pixel(2,3,3,1,'#a25362');pixel(1,4,2,1,'#a25362');pixel(-4,6,2,2,'#493248');pixel(2,6,2,2,'#493248');pixel(-2,9,4,1,'#cf7680');
    }else if(mood==='cry'){
      pixel(-5,4,4,1,'#5a526e');pixel(1,4,4,1,'#5a526e');pixel(-4,5,2,5,'#79bddb');pixel(2,5,2,5,'#79bddb');pixel(-1,8,2,2,'#bb7587');
    }else if(mood==='music'){
      pixel(-1,3,1,6,'#8970b8');pixel(0,3,4,1,'#8970b8');pixel(3,3,1,5,'#8970b8');pixel(-4,8,4,2,'#8970b8');pixel(1,7,3,2,'#8970b8');
    }else PX.text(g,tk%60<30?'%#!':'#%?',x-6,y+4,'#665477');
  }
  function drawActor(a){
    if(a.ai&&!ready)return;
    var kit=actorKit(a),cue=director&&director.pose(a,renderTimeMs);
    var w=kit?27:24,h=kit?w*kit.height/kit.width:36;
    var x=a.renderX-w/2,y=a.renderY-h;
    if(cue&&window.StudioPerformance){StudioPerformance.props(g,a,cue);x+=StudioPerformance.placement(cue);if(kit)StudioPerformance.copies(g,a,cue,kit,x,y,w);}
    var isMoving=(moving(a)||a===followed&&(keys.ArrowLeft||keys.ArrowRight))&&!a.waiting;
    var state=!isMoving&&a.waveUntil>tk?'wave':a.state;
    if(a.waiting)state='idle';
    if(state==='chat')state='talk';
    if(state==='rest'){
      var beat=Math.floor((tk+a.index*31)/65)%4;
      state=(a.id==='claude'||a.id==='kimi')&&beat<2?'read':
        (a.id==='doubao'||a.id==='gpt'||a.id==='grok')&&beat===1?'coffee':
        a.id==='grok'&&Math.abs(a.x-a.home.x)<2&&Math.abs(a.y-a.home.y)<2&&beat===2?'sit':'idle';
    }
    if(cue)state=cue.state;
    var still=photo&&photo.phase==='pose'&&photo.poses[a.id];
    if(still){state=still.state;isMoving=false;}
    var pose=!director&&window.StudioPersonality?StudioPersonality.pose(a,tk,reduced):{alpha:1,state:null};
    if(pose.state&&a.waveUntil<=tk)state=pose.state;
    var motion=kit&&kit.states[state];
    var frame=still?still.frame:cue?cue.frame:isMoving?Math.floor(a.renderGait):Math.floor((renderTimeMs+a.index*137)/(motion&&motion.frameMs||170));
    var direction=still?'front':cue&&cue.direction||a.direction;
    var expression=still?still.expression:cue?cue.expression:undefined;
    a.renderState=state;a.renderFrame=motion?frame%motion.count:frame;a.renderDirection=direction;a.renderSource=still?'photo':cue?'director':pose.state?'personality':'base';
    a.inView=x+w>=renderCamera&&x<=renderCamera+SW&&y+h>=renderCameraY&&y<=renderCameraY+SH;
    a.renderHead=null;a.renderBadge=null;
    if(!a.inView)return;
    if(kit&&kit.frame){
      var image=kit.frame(a.id,state,frame,direction,expression),head=image&&image.headBounds;
      if(head){var unit=w/kit.width;a.renderHead={left:x+head.left*unit,top:y+head.top*unit,right:x+head.right*unit,bottom:y+head.bottom*unit,centerX:x+head.centerX*unit};}
    }
    g.fillStyle=a===followed?'rgba(255,159,196,.35)':'rgba(0,0,0,.27)';g.fillRect(a.renderX-w/3,a.renderY-1,w*2/3,2);
    g.fillStyle='rgba(0,0,0,.24)';g.fillRect(a.renderX-w/5,a.renderY,w*2/5,1);
    g.save();g.globalAlpha=pose.alpha===undefined?1:pose.alpha;
    if(cue&&cue.effect==='banned')g.filter='grayscale('+cue.progress+')';
    else if(cue&&cue.effect==='login')g.filter='grayscale('+(1-cue.progress)+')';
    if(kit)kit.draw(g,a.id,state,frame,x,y,w,direction==='left',direction,expression);
    else{
      var s=a.facingLeft?originals[a.id].left:originals[a.id],image;
      if(isMoving)image=s.run[frame%4];else if(state==='wave')image=s.cheer;
      else if(state==='work')image=s.idle[Math.floor((tk+a.index*9)/10)%s.idle.length];
      else image=(tk+a.index*17)%130<5?s.blink:s.idle[Math.floor(tk/20)%s.idle.length];
      g.drawImage(image,x,y,w,h);
    }
    g.restore();
    if(cue&&window.StudioPerformance&&StudioPerformance.foreground)StudioPerformance.foreground(g,a,cue);
    if(!director&&window.StudioPersonality)StudioPersonality.draw(g,a,x,y,w,h,tk,reduced);
    hitboxes.push({actor:a,x:x,y:y-13,w:w,h:h+13});
  }
  function drawBadge(a){
    if(a.ai&&!ready||!a.inView||!window.AIStudioBadges)return;
    var head=a.renderHead;if(!head)return;
    var frozen=photo&&photo.phase==='pose',size=8,x=head.centerX-size/2,y=head.top-size-1;
    // A crowded photo may hide a mark; it must never climb above the group
    // or paint over another friend's face to keep every mark visible.
    var cue=director&&director.pose(a,renderTimeMs),speaking=cue&&cue.performance&&cue.line||cue&&cue.mood||a.bubbleUntil>tk&&a.mood;
    var hidden=!!speaking||!!photo&&actors.some(function(other){var h=other.renderHead;return other!==a&&other.inView&&h&&x<h.right&&x+size>h.left&&y<h.bottom&&y+size>h.top;});
    a.renderBadge={x:x,y:y,size:size,hidden:hidden};
    if(hidden)return;
    g.save();g.translate(x,y);AIStudioBadges.draw(g,a.id,0,0,(frozen?0:renderTimeMs/SIM_STEP)+a.index*19,reduced||paused||frozen,size);g.restore();
  }
  function drawSpeech(a){
    if(a.ai&&!ready||!a.inView)return;
    var kit=a.ai?AIStudioSprites:window.StudioHeroSprites;
    var h=kit?27*kit.height/kit.width:36,head=a.renderHead,x=head?head.centerX:a.renderX,y=head?head.top:a.renderY-h;
    var cue=director&&director.pose(a,renderTimeMs);
    if(cue&&cue.performance&&window.StudioPerformance)StudioPerformance.speech(g,a,cue,{left:renderCamera,right:renderCamera+SW,top:renderCameraY,bottom:renderCameraY+SH});
    else if(cue&&cue.mood)bubble(cue.mood,x,y-18,a.color);
    else if(a.bubbleUntil>tk)bubble(a.mood,x,y-18,a.color);
  }
  function drawAmbience(){
    g.fillStyle='#fff6d8';g.fillRect(56,22,7,5);
    snow.forEach(function(p,i){var x=15+p[0]+Math.sin(tk/45+i)*2,y=19+(p[1]+tk*.14)%52;
      if(Math.abs(x-44)>1&&Math.abs(y-45)>1){g.fillStyle='#d8dff5';g.fillRect(Math.round(x),Math.round(y),1,1);}});
    for(var u=0;u<9;u++){g.fillStyle=(Math.floor(tk/13)+u)%3?'#5dff8f':'#253b30';g.fillRect(290,60+u*7,2,1);}
    g.fillStyle='#fff3dc';g.fillRect(30,105,6,6);g.fillRect(36,106,2,3);
    for(var i=0;i<3;i++){g.fillStyle='rgba(255,255,255,.4)';var rise=(tk/7+i*4)%12;g.fillRect(32+Math.round(Math.sin(rise)),Math.round(103-rise),1,1);}
  }
  function drawCat(){
    var kitten=cat.state==='sleep'?StudioRoom.cat.sleep:StudioRoom.cat.walk[Math.floor(tk/6)%4];g.save();
    if(cat.state==='walk'&&cat.target<cat.x){g.translate(cat.renderX+20,cat.y-12);g.scale(-1,1);g.drawImage(kitten,0,0);}else g.drawImage(kitten,cat.renderX,cat.y-12);g.restore();
    if(cat.state==='sleep')PX.text(g,'Z',cat.renderX+13,cat.y-16-Math.floor(tk/30)%2,'#b8bce0');
  }
  function draw(){
    presentPositions();renderCamera=clamp(Math.round(camera*SCALE)/SCALE,0,Math.max(0,WORLD-SW));
    renderCameraY=clamp(Math.round(cameraY*SCALE)/SCALE,0,Math.max(0,WORLD_H-SH));renderCount++;
    hitboxes=[];g.setTransform(1,0,0,1,0,0);g.fillStyle='#100c1d';g.fillRect(0,0,scene.width,scene.height);g.imageSmoothingEnabled=false;
    g.setTransform(SCALE,0,0,SCALE,-renderCamera*SCALE,-renderCameraY*SCALE);
    var bounds={left:renderCamera,right:renderCamera+SW,top:renderCameraY,bottom:renderCameraY+SH};
    var left=Math.floor(bounds.left),right=Math.min(WORLD,Math.ceil(bounds.right)),top=Math.floor(bounds.top),bottom=Math.min(WORLD_H,Math.ceil(bounds.bottom));
    g.drawImage(world,left,top,right-left,bottom-top,left,top,right-left,bottom-top);
    if(StudioWorld.drawAmbience)StudioWorld.drawAmbience(g,tk,bounds);else if(renderCamera<BASE_SW)drawAmbience();
    var layers=actors.map(function(a){return{depth:a.renderY,draw:function(){drawActor(a);}};});
    if(cat.renderX+24>=renderCamera&&cat.renderX<=renderCamera+SW)layers.push({depth:cat.y,draw:drawCat});
    (StudioWorld.workstationDepths||[129]).forEach(function(depth){layers.push({depth:depth,draw:function(){StudioWorld.drawWorkstations(g,actors,tk,bounds,depth);}});});
    (StudioWorld.occluders||[]).forEach(function(o){if(o.x+o.w>=bounds.left&&o.x<=bounds.right)layers.push({depth:o.footY,draw:function(){o.draw(g);}});});
    if(!StudioWorld.occluders)layers.push({depth:128,draw:function(){StudioWorld.foreground(g);}});
    layers.sort(function(a,b){return a.depth-b.depth;}).forEach(function(layer){layer.draw();});
    actors.forEach(drawBadge);
    actors.forEach(drawSpeech);
    if(hint&&hint.until>tk){g.fillStyle='#ff9fc4';var hx=Math.round(hint.x),hy=Math.round(hint.y);g.fillRect(hx-4,hy+1,3,1);g.fillRect(hx+2,hy+1,3,1);g.fillRect(hx,hy-2,1,2);}
    // The screen overlay stays fixed while the world pans or a photo zooms.
    var hudScale=BASE_ZOOM*pixelRatio,hudWidth=scene.width/hudScale,hudHeight=scene.height/hudScale;
    g.setTransform(hudScale,0,0,hudScale,0,0);
    g.fillStyle='rgba(0,0,0,.08)';for(var y=0;y<hudHeight;y+=2)g.fillRect(0,y,hudWidth,1);
    var recordLabel=paused?'II':'REC',recordX=hudWidth-8-PX.textWidth(recordLabel),zoneLabel=zoneAt(followed.renderX).label;
    var zoneX=hudWidth>=220?recordX-12-PX.textWidth(zoneLabel):recordX;
    if(hudWidth>=220)PX.text(g,zoneLabel,zoneX,4,'#91d6cf');
    PX.text(g,recordLabel,recordX,4,paused?'#ffd45e':tk%30<18?'#ff4f6a':'#792840');
    var statusWidth=Math.max(20,zoneX-12)/hudWidth*100+'%';if(status.style.maxWidth!==statusWidth)status.style.maxWidth=statusWidth;
    screen.imageSmoothingEnabled=false;screen.drawImage(scene,0,0,view.width,view.height);
    updateVoice();
  }
  function loop(ts){
    if(!stageActive||!visible||document.hidden||paused){running=false;return;}requestAnimationFrame(loop);
    var dt=clamp(ts-lastFrame,0,100);lastFrame=ts;accumulator+=dt;
    // Keep daily schedules and navigation at their original pace. Rendering
    // interpolates between these fixed steps on every display refresh.
    while(accumulator>=SIM_STEP){
      actors.forEach(function(a){a.prevX=a.x;a.prevY=a.y;a.prevGait=a.gait;});cat.prevX=cat.x;
      animationMs+=SIM_STEP;update();accumulator-=SIM_STEP;
    }
    renderAlpha=accumulator/SIM_STEP;renderTimeMs=animationMs+accumulator;
    presentPositions();advanceCamera(dt);draw();
  }
  function wake(force){
    if(!stageActive)return;
    if(force&&paused){draw();return;}
    if(!running&&visible&&!document.hidden&&!paused){running=true;lastFrame=performance.now();requestAnimationFrame(loop);}
  }
  view.addEventListener('pointerdown',function(e){
    if(e.button!==0)return;var r=view.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*SW,y=(e.clientY-r.top)/r.height*SH;
    view.focus({preventScroll:true});
    var wx=x+renderCamera,wy=y+renderCameraY;
    var hit=hitboxes.slice().reverse().filter(function(b){return wx>=b.x&&wx<=b.x+b.w&&wy>=b.y&&wy<=b.y+b.h;})[0];
    if(hit)followActor(hit.actor);else if(wy>=StudioNavigation.bounds.top)command(wx,wy);
  });
  view.addEventListener('dblclick',function(){greet(followed);});
  view.addEventListener('keydown',function(e){
    if(['ArrowLeft','ArrowRight','Shift',' '].indexOf(e.key)<0)return;e.preventDefault();
    if(e.key===' '){paused=!paused;draw();wake();return;}if(e.key==='Shift'){keys.Shift=true;return;}
    cancelPhoto();if(director)director.cancel(followed,'keyboard');followed.manualUntil=tk+100;keys[e.key]=true;wake();
  });
  function release(){keys={};if(followed&&!moving(followed)&&(followed.state==='walk'||followed.state==='run')){followed.state='rest';followed.until=tk+100;}}
  view.addEventListener('keyup',function(e){delete keys[e.key];if(!keys.ArrowLeft&&!keys.ArrowRight)release();});view.addEventListener('blur',release);
  photoButton.addEventListener('click',startPhoto);
  function updateVoice(){
    if(!voice||!voice.isEnabled())return;
    if(!stageActive||!visible||document.hidden||paused||reduced){voice.stop();return;}
    if(photo){
      if(photo.phase==='pose'){
        if(!photo.voiced&&voice.photo)photo.voiced=voice.photo(actors.map(function(a){return a.id;}));
      }else voice.stop();
      return;
    }
    var cue=director&&director.pose(followed,renderTimeMs);
    if(!cue||!cue.performance||!followed.inView){voice.stop();return;}
    var beat=cue.beat,musicOffset=cue.performance==='grok'&&cue.effect==='turn'?StudioCast.get('grok').beats[1].seconds:0;
    voice.sync(cue.performance+':'+cue.job+':'+cue.stage,beat.voice,cue.localMs,beat.seconds,true,1,beat.effect,musicOffset);
  }
  function updateSoundControls(){
    var on=voice&&voice.isEnabled();
    if(soundButton){soundButton.setAttribute('aria-pressed',on?'true':'false');soundButton.textContent=t(on?'studio.soundOn':'studio.soundOff');}
    if(volumeInput)volumeInput.setAttribute('aria-label',t('studio.volume'));
  }
  if(soundButton){
    soundButton.disabled=!voice;
    soundButton.addEventListener('click',function(){
      voice.enable(!voice.isEnabled()).then(function(){updateSoundControls();if(soundStatus)soundStatus.textContent=t('studio.soundReady',{count:window.StudioCast?StudioCast.list.length:10});updateVoice();}).catch(function(){if(soundStatus)soundStatus.textContent=t('studio.soundError');});
    });
  }
  if(volumeInput&&voice){voice.setVolume(Number(volumeInput.value)/100);volumeInput.addEventListener('input',function(){voice.setVolume(Number(volumeInput.value)/100);updateVoice();});}
  updateSoundControls();
  function languageChanged(){
    if(voice)voice.stop();
    actors.forEach(function(a){a.name=window.StudioCast?StudioCast.name(a.id):a.name;a.button.setAttribute('aria-label',a.name);var label=a.button.querySelector('.studio-sr');if(label)label.textContent=a.name;});
    lastStatus='';announce(followed,followed.state);refreshPerformanceIndicators();updateSoundControls();draw();
  }
  window.addEventListener('c0-language-change',languageChanged);
  window.addEventListener('studio-stage-change',function(event){
    stageActive=!(event.detail&&event.detail.active==='game');release();
    lastFrame=performance.now();accumulator=0;
    if(!stageActive){if(voice)voice.stop();return;}
    resizeCanvas();draw();wake();
  });
  function motionChanged(e){reduced=e.matches;paused=reduced;if(reduced&&voice)voice.stop();if(reduced&&director){director.cancelAll('reduced-motion');lastPerformanceStatus='';if(!photo)announce(followed,followed.state);refreshPerformanceIndicators();}draw();wake();}if(motion.addEventListener)motion.addEventListener('change',motionChanged);
  if(window.IntersectionObserver)new IntersectionObserver(function(entries){visible=entries[entries.length-1].isIntersecting;if(!visible&&voice)voice.stop();wake();}).observe(view);else visible=true;
  document.addEventListener('visibilitychange',function(){release();if(document.hidden&&voice)voice.stop();wake();});
  window.addEventListener('pagehide',function(){if(voice)voice.stop();});
  if(window.AIStudioSprites)AIStudioSprites.ready.then(function(ok){ready=ok!==false;if(ready)announce(followed,followed.state);else setStatus('studio.failed');draw();}).catch(function(){setStatus('studio.failed');});
  if(window.ResizeObserver)new ResizeObserver(function(){if(resizeCanvas())draw();}).observe(view.parentElement);
  window.addEventListener('resize',function(){if(resizeCanvas())draw();});
  if(document.fonts)document.fonts.ready.then(function(){if(StudioWorld.refreshLabels)StudioWorld.refreshLabels();draw();});
  view.style.cursor='pointer';resizeCanvas();setStatus(statusKey);draw();wake();
  window.Studio={snapshot:function(){return{active:stageActive,tick:tk,animationMs:animationMs,simStepMs:SIM_STEP,renderTimeMs:renderTimeMs,renderAlpha:renderAlpha,renderCount:renderCount,rasterScale:SCALE,renderCamera:renderCamera,renderCameraY:renderCameraY,width:WORLD,height:WORLD_H,viewportWidth:SW,viewportHeight:SH,camera:camera,cameraY:cameraY,zoom:zoom,displayWidth:displayWidth,displayHeight:displayHeight,followed:followed.id,overview:false,paused:paused,ready:ready,photo:photo?{phase:photo.phase,anchor:photo.anchor,pattern:photo.pattern,center:Object.assign({},photo.center),slots:photo.slots.map(function(s){return Object.assign({},s);}),poses:Object.assign({},photo.poses)}:null,pair:pair?[pair.a.id,pair.b.id]:null,pairPhase:pair?pair.phase:null,director:director?director.snapshot():null,
    actors:actors.map(function(a){return{id:a.id,name:a.name,x:a.x,y:a.y,renderX:a.renderX,renderY:a.renderY,inView:a.inView,head:a.renderHead?Object.assign({},a.renderHead):null,badge:a.renderBadge?Object.assign({},a.renderBadge):null,state:a.state,direction:a.direction,moving:moving(a),home:a.home.x,homeY:a.home.y,homeState:a.homeState,manualUntil:a.manualUntil,renderState:a.renderState,renderFrame:a.renderFrame,renderDirection:a.renderDirection,renderSource:a.renderSource,path:a.path.map(function(p){return{x:p.x,y:p.y};})};})};}};
})();
