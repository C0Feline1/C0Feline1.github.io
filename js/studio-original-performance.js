/* F1's sunflower-seed conference. No original-character badges or work orders. */
(function () {
  'use strict';
  var ids=['doubao','gpt','deepseek','claude','gemini','grok','kimi'];
  var colors=['#b6d8e8','#94cbb9','#7aaff0','#e9a16f','#b7a0ef','#dba0ba','#a9b7eb'];
  var seats=[[344,151],[402,133],[464,154],[490,211],[449,267],[382,270],[322,220]];
  var periods=[.48,.63,.52,.71,.57,.68,.46],cache=Object.create(null);
  var INK='#2a2237',CREAM='#fff0da';
  function clamp(v){return Math.max(0,Math.min(1,v));}
  function ease(v){v=clamp(v);return v*v*(3-2*v);}
  function mix(a,b,t){return a+(b-a)*clamp(t);}
  function rect(g,x,y,w,h,c){if(w<=0||h<=0)return;g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function line(g,x0,y0,x1,y1,c,size){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);var dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;for(;;){rect(g,x0,y0,size||2,size||2,c);if(x0===x1&&y0===y1)break;var twice=2*err;if(twice>=dy){err+=dy;x0+=sx;}if(twice<=dx){err+=dx;y0+=sy;}}}
  function icon(g,id,x,y,size,alpha){if(!cache[id]&&window.AIStudioBadges)cache[id]=AIStudioBadges.createIcon(id);if(alpha<=0)return;g.save();g.globalAlpha*=alpha===undefined?1:clamp(alpha);g.imageSmoothingEnabled=false;if(cache[id])g.drawImage(cache[id],Math.round(x),Math.round(y),size,size);else{rect(g,x,y,size,size,INK);rect(g,x+4,y+4,size-8,size-8,colors[ids.indexOf(id)]);}g.restore();}
  function heart(g,x,y,p){p=p||2;var c='#eea0bf';rect(g,x,y,3*p,2*p,c);rect(g,x+4*p,y,3*p,2*p,c);rect(g,x-p,y+p,9*p,2*p,c);rect(g,x,y+3*p,7*p,p,c);rect(g,x+p,y+4*p,5*p,p,c);rect(g,x+2*p,y+5*p,3*p,p,c);rect(g,x+3*p,y+6*p,p,p,c);}
  function stool(g,x,y){rect(g,x,y,35,7,'#a17a72');rect(g,x+3,y+7,4,14,'#775466');rect(g,x+28,y+7,4,14,'#775466');rect(g,x+6,y+15,24,3,'#775466');}
  function table(g){
    rect(g,388,233,7,56,'#775466');rect(g,460,233,7,56,'#775466');rect(g,394,271,69,4,'#775466');
    rect(g,388,197,80,7,'#442e43');rect(g,368,204,120,9,'#442e43');rect(g,356,213,144,16,'#442e43');rect(g,368,229,120,9,'#442e43');rect(g,387,237,82,5,'#442e43');
    rect(g,389,194,78,7,'#d8b08e');rect(g,369,201,118,9,'#d8b08e');rect(g,357,210,142,15,'#d8b08e');rect(g,369,225,118,8,'#c3957c');rect(g,388,233,80,5,'#a67a6c');
    rect(g,377,212,104,2,'#e9c4a3');rect(g,385,225,89,2,'#b68b78');
  }
  function bag(g,x,base,fill){
    fill=clamp(fill);var h=17+18*fill,y=base-h;
    rect(g,x+3,y,30,h,'#b99768');rect(g,x,y+5,36,h-4,'#e5c58e');rect(g,x+3,y+3,30,4,'#92704e');
    if(fill>.08){rect(g,x+10,y+12,16,13,'#786045');rect(g,x+15,y+13,4,10,'#fff1bf');rect(g,x+20,y+14,2,8,'#dccc9a');}
    else {rect(g,x+7,y+9,22,5,'#947254');rect(g,x+12,y+13,12,2,'#e5c58e');}
  }
  function shells(g,count){
    rect(g,413,226,45,4,'#9f96a9');
    for(var n=0;n<count;n++){var row=Math.floor(n/8),col=n%8;var x=415+col*5+(row%2?2:0),y=224-row*4;rect(g,x,y,4,2,'#e4d9b1');rect(g,x+1,y+2,2,1,'#8e785e');}
  }
  function symbol(g,type,x,y,color){
    var c=color||'#9d7c9e';
    if(type==='dots'){rect(g,x,y+7,2,2,c);rect(g,x+5,y+7,2,2,c);rect(g,x+10,y+7,2,2,c);}
    else if(type==='!'){rect(g,x+5,y,3,6,c);rect(g,x+5,y+8,3,3,c);}
    else {rect(g,x+3,y,7,2,c);rect(g,x+1,y+2,3,3,c);rect(g,x+8,y+2,3,4,c);rect(g,x+5,y+5,5,2,c);rect(g,x+5,y+7,2,2,c);rect(g,x+5,y+11,2,2,c);}
  }
  function chatter(g,i,x,y,local,busy,flipped){
    var clock=(local||0)/1000,period=periods[i]*(busy?.76:1),phase=((clock+i*.137)%period)/period;
    if(phase>(busy?.82:.66))return;
    var lift=busy?(i%2)*5:0,bx=x+(i%2?12:-6),by=y-24-lift,w=29,h=17;
    rect(g,bx+4,by,w-8,2,INK);rect(g,bx+1,by+2,w-2,3,INK);rect(g,bx,by+5,w,9,INK);rect(g,bx+3,by+14,w-6,3,INK);rect(g,bx+10,by+17,5,4,INK);
    rect(g,bx+4,by+2,w-8,13,CREAM);rect(g,bx+2,by+5,w-4,8,CREAM);rect(g,bx+11,by+15,3,4,CREAM);
    var type=['dots','!','?'][Math.floor(clock/period+i)%3];
    // Question and exclamation glyphs remain readable when the whole theatre mirrors.
    g.save();if(flipped){g.translate(bx+w,by);g.scale(-1,1);symbol(g,type,7,3,colors[i]);}else symbol(g,type,bx+7,by+3,colors[i]);g.restore();
    if(busy&&i%2===0){rect(g,bx+w+4,by+6,3,3,colors[i]);rect(g,bx+w+9,by+3,2,2,colors[i]);}
  }
  function escapePhase(s){
    if(s.effect==='f1_refill')return .42*ease((clamp(s.p)-.45)/.55);
    if(s.effect==='f1_abandoned')return .42+.58*ease(clamp(s.p)/.45);
    return 0;
  }
  function guest(s,i){
    var base=seats[i],x=base[0],y=base[1],alpha=1,flee=0,p=clamp(s.p);
    if(s.effect==='f1_open'){var arrival=ease((p-i*.05)/.65);x=mix(720+i*14,x,arrival);y=mix(250,y,arrival);alpha=arrival;}
    if(s.effect==='f1_news'||s.effect==='f1_chatter')y-=Math.max(0,Math.sin((s.local||0)/(periods[i]*160)+i))*2;
    if(s.effect==='f1_refill'||s.effect==='f1_abandoned'){
      flee=clamp((escapePhase(s)-i*.065)/(1-i*.065));var move=ease(flee);
      x=mix(x,1000+i*13,move);y=mix(y,[119,83,150,214,307,327,279][i],move);
      alpha=1-ease((flee-.68)/.32);
    }
    return{x:x,y:y,alpha:alpha,flee:flee};
  }
  function drawGuest(g,s,i){var pos=guest(s,i);if(pos.alpha<=0)return;g.save();g.globalAlpha*=pos.alpha;rect(g,pos.x+5,pos.y+34,22,3,'#17111f');icon(g,ids[i],pos.x,pos.y,32,1);g.restore();if(s.effect==='f1_news'||s.effect==='f1_chatter')chatter(g,i,pos.x,pos.y,s.local,s.effect==='f1_chatter',s.flipped);}
  function wind(g,p){
    var drift=36*ease(p);line(g,345+drift,155,376+drift,155,'#9d98b3',2);rect(g,375+drift,152,5,2,'#9d98b3');line(g,430+drift,174,465+drift,174,'#817b96',2);rect(g,430+drift,171,5,2,'#817b96');
    rect(g,407,188,3,3,'#d6c3d6');rect(g,417,188,3,3,'#d6c3d6');rect(g,427,188,3,3,'#d6c3d6');
  }
  function behind(g,s){
    var e=s.effect,p=clamp(s.p);
    seats.forEach(function(pos){stool(g,pos[0]-1,pos[1]+31);});
    stool(g,145,251);
    [0,1,2].forEach(function(i){drawGuest(g,s,i);});
    table(g);
    var fill=e==='f1_open'?1:e==='f1_news'?1-.35*p:e==='f1_chatter'?.65*(1-p):e==='f1_abandoned'?1:0;
    bag(g,357,222,fill);
    var amount=e==='f1_open'?Math.floor(p*6):e==='f1_news'?6+Math.floor(p*26):e==='f1_chatter'?32+Math.floor(p*40):72;
    shells(g,amount);
    [3,4,5,6].forEach(function(i){drawGuest(g,s,i);});
    if(e==='f1_empty'){
      seats.forEach(function(pos,i){if(i%2===0){rect(g,pos[0]+10,pos[1]-10,2,2,colors[i]);rect(g,pos[0]+16,pos[1]-10,2,2,colors[i]);rect(g,pos[0]+22,pos[1]-10,2,2,colors[i]);}});
    }
    if(e==='f1_abandoned'&&p>.45)wind(g,(p-.45)/.55);
  }
  function front(g,s){
    if(s.effect!=='f1_refill')return;
    var p=clamp(s.p),delivery=ease(p/.78),x=mix(622,357,delivery),base=mix(151,222,delivery);
    bag(g,x,base,1);
    if(p<.9){g.save();g.globalAlpha*=1-ease((p-.7)/.2);heart(g,x+10,base-52,1.5);g.restore();}
  }
  window.StudioConferenceProps={drawBehind:behind,drawFront:front};
}());

/* Original trio's prop-led comic performances. Everything is reconstructed from time. */
(function () {
  'use strict';
  var ids=['doubao','gpt','deepseek','claude','gemini','grok','kimi'];
  var colors=['#b6d8e8','#94cbb9','#7aaff0','#e9a16f','#b7a0ef','#dba0ba','#a9b7eb'];
  var badges=Object.create(null),INK='#262034',CREAM='#fff1dc';
  function clamp(v){return Math.max(0,Math.min(1,v));}
  function ease(v){v=clamp(v);return v*v*(3-2*v);}
  function mix(a,b,t){return a+(b-a)*clamp(t);}
  function rect(g,x,y,w,h,c){if(w<=0||h<=0)return;g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function line(g,x0,y0,x1,y1,c,size){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);var dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;for(;;){rect(g,x0,y0,size||2,size||2,c);if(x0===x1&&y0===y1)break;var twice=2*err;if(twice>=dy){err+=dy;x0+=sx;}if(twice<=dx){err+=dx;y0+=sy;}}}
  function words(g,s,value,x,y,color,size){g.save();g.font=(size||12)+'px "Fusion Pixel",monospace';g.fillStyle=color||CREAM;g.textBaseline='top';if(s.flipped){var w=g.measureText(value).width;g.translate(x+w,y);g.scale(-1,1);g.fillText(value,0,0);}else g.fillText(value,x,y);g.restore();}
  function icon(g,id,x,y,size,alpha,gray){
    if(ids.indexOf(id)<0)return;
    if(!badges[id]&&window.AIStudioBadges)badges[id]=AIStudioBadges.createIcon(id);
    g.save();g.globalAlpha*=alpha===undefined?1:clamp(alpha);if(gray)g.filter='grayscale('+clamp(gray)+')';g.imageSmoothingEnabled=false;
    if(badges[id])g.drawImage(badges[id],Math.round(x),Math.round(y),Math.round(size||36),Math.round(size||36));
    else {rect(g,x,y,size||36,size||36,INK);rect(g,x+4,y+4,(size||36)-8,(size||36)-8,colors[ids.indexOf(id)]||'#b48cff');}
    g.restore();
  }
  function plate(g,x,y,w,h,edge){rect(g,x+3,y+4,w,h,'#100c1c');rect(g,x,y,w,h,edge||'#776488');rect(g,x+2,y+2,w-4,h-4,'#282238');}
  function tick(g,x,y,c,size){var p=size||3;line(g,x,y+3*p,x+2*p,y+5*p,c||'#a7d7b7',p);line(g,x+2*p,y+5*p,x+6*p,y,c||'#a7d7b7',p);}
  function cross(g,x,y,c,size){var p=size||2;line(g,x,y,x+5*p,y+5*p,c||'#ea7f98',p);line(g,x+5*p,y,x,y+5*p,c||'#ea7f98',p);}
  function heart(g,x,y,c,p){p=p||2;c=c||'#f18db0';rect(g,x,y,3*p,2*p,c);rect(g,x+4*p,y,3*p,2*p,c);rect(g,x-p,y+p,9*p,2*p,c);rect(g,x,y+3*p,7*p,p,c);rect(g,x+p,y+4*p,5*p,p,c);rect(g,x+2*p,y+5*p,3*p,p,c);rect(g,x+3*p,y+6*p,p,p,c);}
  function paper(g,x,y,w,h,done){rect(g,x+2,y+2,w,h,'#6d5e68');rect(g,x,y,w,h,'#e7dec8');rect(g,x+4,y+4,w-8,2,'#a99782');rect(g,x+4,y+9,Math.max(4,w-13),2,'#b6a78f');if(done)tick(g,x+w-18,y+h-14,'#5a937a',2);}
  function mug(g,x,y,empty){rect(g,x,y,21,23,'#786877');rect(g,x+2,y+2,17,19,'#fff0db');rect(g,x+21,y+5,7,13,'#d2bfc6');rect(g,x+23,y+8,3,7,'#282238');rect(g,x+3,y+2,15,4,empty?'#c5b7b4':'#5c3b34');rect(g,x-3,y+23,31,3,'#b6a3b8');}
  function cookie(g,x,y){rect(g,x+2,y,12,3,'#e9c58c');rect(g,x,y+3,16,9,'#e9c58c');rect(g,x+2,y+12,12,3,'#b78b58');rect(g,x+4,y+4,3,3,'#795241');rect(g,x+10,y+8,3,2,'#795241');}
  function bowl(g,x,y){rect(g,x+3,y-5,24,7,'#fff0d7');rect(g,x,y,30,6,'#a8d3e5');rect(g,x+4,y+6,22,8,'#679cba');rect(g,x+9,y+14,12,3,'#679cba');}
  function loading(g,x,y,t){var dots=[[4,0],[8,1],[10,5],[8,9],[4,10],[0,8],[-1,4],[0,1]],at=Math.floor(t/100)%dots.length;dots.forEach(function(d,i){rect(g,x+d[0],y+d[1],3,3,i===at?'#e9fff5':'#4e7970');});}
  function note(g,x,y,c){rect(g,x+6,y,3,16,c);rect(g,x+8,y,10,3,c);rect(g,x+15,y+2,3,11,c);rect(g,x,y+13,8,5,c);rect(g,x+10,y+10,8,5,c);}
  var lineup=[[350,141],[406,141],[462,141],[350,201],[406,201],[462,201],[406,261]];
  // Current StudioHeroSprites talk palm anchors, verified against all twelve r.lastHand poses.
  var C0_TALK_PALM=[[36,41],[38,38],[40,35],[42,32],[41,31],[40,33],[39,36],[42,36],[42,37],[40,38],[37,41],[35,42]];
  function c0Hand(s){var p=C0_TALK_PALM[((Math.floor(s.frame)%12)+12)%12];return{x:Math.round(s.actorX)+p[0]*2,y:135+p[1]*2};}
  function queueIcon(g,i,x,y,size,alpha,gray){var w=size||36;g.save();g.globalAlpha*=alpha===undefined?1:clamp(alpha);rect(g,x+3,y+w+3,w-6,3,'#14101e');icon(g,ids[i],x,y,w,1,gray);g.restore();}
  function anger(g,x,y){line(g,x,y,x+8,y,'#f07a86',3);line(g,x+8,y,x+8,y+7,'#f07a86',3);line(g,x+13,y+2,x+13,y+9,'#f07a86',3);line(g,x+13,y+9,x+20,y+9,'#f07a86',3);line(g,x+3,y+13,x+10,y+13,'#f07a86',3);line(g,x+10,y+13,x+10,y+20,'#f07a86',3);}
  function c0Behind(g,s){
    var e=s.effect,p=clamp(s.p),rage=e==='c0_rage';
    if(e==='c0_scatter'){
      if(p>=1)return;
      ids.forEach(function(id,i){var base=lineup[i],x=base[0],y=base[1],alpha=i===3?1-ease((p-.22)/.28):1-ease((p-.88)/.12),gray=0;
        g.save();g.globalAlpha*=alpha;
        if(i===0){var turn=.3;x=p<turn?mix(x,315,ease(p/turn)):mix(315,655,ease((p-turn)/(1-turn)));y+=Math.sin(p*24)*3;if(p<.3)words(g,s,'?',x+13,y-16,colors[i],12);}
        if(i===1){var q=clamp((p-.4)/.6),step=Math.floor(q*8)/8;x=mix(x,665,step);if(p<.43)loading(g,x+10,y-16,s.local);else y+=Math.sin(step*17)*4;}
        if(i===2){x=mix(x,620,ease(p));y=mix(y,365,ease(p));bowl(g,x+26,y+36);}
        if(i===3){gray=clamp(p/.28);if(p>.18&&p<.55){cross(g,x+12,y+12,'#b4a5b9',2);rect(g,x-3,y+40,42,3,'#8b8195');}}
        if(i===4){var split=ease(p);icon(g,id,x-split*365,y-split*165,36,1-ease((p-.73)/.25));icon(g,id,x+split*300,y+split*150,36,1-ease((p-.73)/.25));g.restore();return;}
        if(i===5){x=mix(x,660,ease(p))+Math.sin(p*40)*9;y+=Math.sin(p*36)*9;note(g,x-17,y+12,'#dba0ba');}
        if(i===6){x=mix(x,675,ease(p));y+=Math.sin(p*20)*3;var paperW=Math.max(0,x-base[0]);rect(g,base[0]+10,base[1]+34,paperW,7,'#d9d1bc');for(var n=0;n<paperW;n+=19)rect(g,base[0]+13+n,base[1]+36,10,2,'#a69880');}
        queueIcon(g,i,x,y,36,1,gray);g.restore();
      });return;
    }
    ids.forEach(function(id,i){var base=lineup[i],x=base[0],y=base[1],alpha=1;
      if(e==='c0_lineup'){var t=ease((p-i*.055)/.62);x=mix(610+i*12,x,t);}
      if(rage){var beat=(s.local/190+i*.6)%3;y-=Math.max(0,Math.sin(beat*Math.PI))*7;}
      queueIcon(g,i,x,y,36,alpha,0);
      if(rage&&Math.floor(s.local/220)%7===i){rect(g,x-4,y-4,44,2,'#ee7d8c');rect(g,x-4,y+38,44,2,'#ee7d8c');words(g,s,'!',x+13,y-18,'#f6c0c8',12);}
      if(e==='c0_fix'){var repaired=p>(i+.5)/7;if(repaired)tick(g,x+22,y+22,'#96d3ad',2);else cross(g,x+23,y+24,'#ed8095',2);}
    });
    if(e==='c0_coffee'){mug(g,113,226,false);for(var k=0;k<3;k++)rect(g,118+k*7,215-Math.round(Math.sin(s.local/190+k)*4),2,7,'#c0b4c7');}
    if(e==='c0_fix'){plate(g,370,114,150,16,'#526c77');rect(g,374,118,142*p,8,'#87c4ae');}
    if(e==='c0_dismiss'){line(g,390,118,500,118,'#f1c6a0',5);line(g,480,103,500,118,'#f1c6a0',5);line(g,480,133,500,118,'#f1c6a0',5);}
    // Draw the rod first so the complete, animated palm covers its grip.
    if(rage){var target=lineup[Math.floor(s.local/220)%7],hand=c0Hand(s);line(g,hand.x,hand.y,target[0]+13,target[1]+18,'#976d56',3);rect(g,target[0]+11,target[1]+16,6,6,'#e8d8b2');}
  }
  function c0Front(g,s){if(s.effect!=='c0_rage')return;var x=s.actorX===undefined?200:s.actorX;anger(g,x+52,137);var tremor=Math.floor(s.local/80)%2?3:0;rect(g,x-13-tremor,180,8,3,'#ec8a98');rect(g,x-8-tremor,188,5,3,'#ec8a98');}
  function catDrawing(g,x,y,fill){
    var c=fill?'#e4bfd6':'#9a829b';if(fill){rect(g,x+14,y+9,34,29,'#fff4e6');rect(g,x+10,y+15,42,18,'#fff4e6');rect(g,x+13,y+3,10,12,'#f2c9dc');rect(g,x+39,y+3,10,12,'#f2c9dc');}
    line(g,x+10,y+16,x+14,y+2,c,2);line(g,x+14,y+2,x+25,y+11,c,2);line(g,x+25,y+11,x+37,y+11,c,2);line(g,x+37,y+11,x+48,y+2,c,2);line(g,x+48,y+2,x+52,y+17,c,2);line(g,x+10,y+17,x+12,y+32,c,2);line(g,x+12,y+32,x+23,y+39,c,2);line(g,x+23,y+39,x+41,y+39,c,2);line(g,x+41,y+39,x+52,y+32,c,2);line(g,x+52,y+32,x+52,y+17,c,2);rect(g,x+21,y+23,3,4,'#88688f');rect(g,x+39,y+23,3,4,'#88688f');rect(g,x+30,y+29,5,3,'#dd8bb2');if(fill){rect(g,x+17,y+30,6,2,'#efb5cc');rect(g,x+42,y+30,6,2,'#efb5cc');}
  }
  function easel(g,complete,p){
    rect(g,433,132,9,166,'#7a5860');line(g,405,251,390,297,'#946c64',7);line(g,467,251,484,297,'#946c64',7);rect(g,380,144,129,119,'#795b60');rect(g,385,149,119,109,CREAM);rect(g,385,255,119,3,'#d5c6b0');rect(g,374,261,141,7,'#a47a68');catDrawing(g,405,169,complete);if(complete){rect(g,407,216,61,3,'#edbad3');rect(g,426,222,34,2,'#b5b0d8');}else{var length=clamp(p)*68;rect(g,404,223,length,2,'#c9bacb');}}
  var crowd=[[336,163],[391,156],[448,163],[327,211],[379,212],[431,211],[483,210]];
  function x0Behind(g,s){var e=s.effect,p=clamp(s.p),finished=e==='x0_reveal'||e==='x0_again'||(e==='x0_peace'&&p>.45);
    easel(g,finished,e==='x0_peace'?p:e==='x0_start'?p*.3:1);
    if(e==='x0_start')return;
    ids.forEach(function(id,i){var from=crowd[i],target=[310+i*30,279],x=from[0],y=from[1],size=36;
      if(e==='x0_crowd'){var t=ease((p-i*.035)/.7);x=mix(598+i*5,x,t);y=mix(285,y,t);}
      if(e==='x0_peace'){x=mix(x,target[0],ease(p));y=mix(y,target[1],ease(p));size=mix(36,28,ease(p));}
      if(e==='x0_reveal'||e==='x0_again'){x=target[0];y=target[1];size=28;}
      queueIcon(g,i,x,y,size,1,0);
      if(e==='x0_crowd')words(g,s,'?',x+12,y-14,colors[i],12);
      if(e==='x0_treat'&&p>(i+.25)/7)cookie(g,x+22,y+26);
      if(e==='x0_peace'||e==='x0_reveal')cookie(g,x+17,y+23);
      if(e==='x0_reveal'){var lift=Math.sin(clamp((p-i*.035)*1.3)*Math.PI)*12;heart(g,x+8,y-21-lift,colors[i],1.7);}
    });
    if(e==='x0_crowd'||e==='x0_treat'){var t=e==='x0_crowd'?ease(p):1;mug(g,mix(565,311,t),221,true);}
    if(e==='x0_again'){for(var i=0;i<5;i++){var t=ease((p-i*.07)/.55);var x=mix(590+i*25,318+i*33,t);mug(g,x,239,true);}words(g,s,'……',332,220,'#d5c1db',12);}
  }
  function x0Front(g,s){if(s.effect==='x0_treat'){var index=Math.min(6,Math.floor(s.p*7)),pos=crowd[index];cookie(g,mix(s.actorX+78,pos[0]+18,(s.p*7)%1),mix(216,pos[1]+26,(s.p*7)%1));}if(s.effect==='x0_reveal'){heart(g,164,149,'#f1a6c6',2);}}
  window.StudioOriginalProps={
    actorX:function(id,effect,p,time){if(effect==='c0_rage')return 200+Math.round(Math.sin((time||0)/45)*2);if(effect==='x0_crowd')return 200-4*ease(p);return 200;},
    drawBehind:function(ctx,state){if(state.id==='C0')c0Behind(ctx,state);else if(state.id==='X0')x0Behind(ctx,state);else if(state.id==='Feline1')StudioConferenceProps.drawBehind(ctx,state);},
    drawFront:function(ctx,state){if(state.id==='C0')c0Front(ctx,state);else if(state.id==='X0')x0Front(ctx,state);else if(state.id==='Feline1')StudioConferenceProps.drawFront(ctx,state);}
  };
}());

/* Isolated, prop-led scenes: one real lead, seven AI badges. No NPC copies
 * or actor state captures are needed, so all props disappear on cancellation. */
(function(){
  'use strict';
  var scale=27/96,buffer=null,ctx=null;
  function supported(cue){return cue&&['C0','X0','Feline1'].indexOf(cue.performance)>=0;}
  function placement(cue){return supported(cue)?(StudioOriginalProps.actorX(cue.performance,cue.effect,cue.progress,cue.localMs)-200)*scale:0;}
  function draw(g,actor,cue,front){
    if(!supported(cue))return false;
    if(!buffer){buffer=document.createElement('canvas');buffer.width=576;buffer.height=336;ctx=buffer.getContext('2d');}
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,576,336);ctx.imageSmoothingEnabled=false;
    var state={id:cue.performance,effect:cue.effect,p:cue.progress,local:cue.localMs,frame:cue.frame,flipped:cue.mainDirection==='left',actorX:StudioOriginalProps.actorX(cue.performance,cue.effect,cue.progress,cue.localMs)};
    (front?StudioOriginalProps.drawFront:StudioOriginalProps.drawBehind)(ctx,state);
    g.save();g.imageSmoothingEnabled=false;g.translate(actor.renderX,actor.renderY);
    if(state.flipped)g.scale(-1,1);
    g.drawImage(buffer,-248*scale,-263*scale,576*scale,336*scale);g.restore();return true;
  }
  window.StudioOriginalPerformance={supported:supported,placement:placement,behind:function(g,a,c){return draw(g,a,c,false);},front:function(g,a,c){return draw(g,a,c,true);}};
}());
