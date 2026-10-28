/* Seven tiny instruments, Mandarin tone contours, ellipsis ticks and scene music. */
(function(){
  'use strict';
  var context=null,nodes=[],enabled=false,lastKey=null,volume=.25,sceneEnabled=true;
  var contours={1:[1.2,1.2],2:[.88,1.24],3:[.94,.7,1.08],4:[1.25,.73],5:[1,1]};
  var profiles={};window.StudioCast.list.forEach(function(c){profiles[c.id]=c.sound;});
  var pauseSound={base:310,cutoff:1000,attack:.003,decay:.18,waves:[['sine',1,.8,0],['sine',2,.2,0]]};
  var musicSound={base:440,cutoff:1700,attack:.005,decay:.35,waves:[['triangle',1,.8,0],['sine',2,.2,0]]};
  function stop(){nodes.slice().forEach(function(n){try{n.stop();}catch(e){/* Already ended. */}});nodes=[];lastKey=null;}
  function plan(units,seconds){
    var weight=units.reduce(function(sum,u){return sum+u.weight;},0),space=Math.max(.3,seconds-.35),at=.12;
    return units.map(function(u,i){var duration=space*u.weight/weight,neighbor=(units[i-1]&&units[i-1].char||'')+(units[i+1]&&units[i+1].char||''),dots=/[…。.]/.test(u.char)&&/[…。.]/.test(neighbor);var cue={char:u.char,tone:u.tone,start:at,duration:duration,dots:dots};at+=duration;return cue;});
  }
  function pip(cue,at,speed,profile,level,frequency){
    profile=profile||profiles.doubao;level=level===undefined?1:level;
    var duration=Math.max(.025,Math.min(.14,cue.duration*.78/speed)),gain=context.createGain(),filter=context.createBiquadFilter();
    filter.type='lowpass';filter.frequency.setValueAtTime(profile.cutoff,at);filter.Q.setValueAtTime(.55,at);filter.connect(gain);gain.connect(context.destination);
    var peak=volume*.13*level,attack=Math.min(profile.attack,duration*.2),remaining=profile.waves.length;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(peak,at+attack);gain.gain.linearRampToValueAtTime(peak*profile.decay,at+duration*.55);gain.gain.linearRampToValueAtTime(0,at+duration);
    profile.waves.forEach(function(part){
      var oscillator=context.createOscillator(),partial=context.createGain();oscillator.type=part[0];oscillator.detune.setValueAtTime(part[3],at);partial.gain.setValueAtTime(part[2],at);
      var curve=frequency?[1,1]:(contours[cue.tone]||contours[5]);curve.forEach(function(r,i){var when=at+duration*i/(curve.length-1),hz=(frequency||profile.base)*part[1]*r;if(i===0)oscillator.frequency.setValueAtTime(hz,when);else oscillator.frequency.linearRampToValueAtTime(hz,when);});
      oscillator.connect(partial);partial.connect(filter);nodes.push(oscillator);oscillator.onended=function(){var i=nodes.indexOf(oscillator);if(i>=0)nodes.splice(i,1);oscillator.disconnect();partial.disconnect();if(--remaining===0){filter.disconnect();gain.disconnect();}};oscillator.start(at);oscillator.stop(at+duration+.01);
    });
    if(profile.echo){
      // A second, quieter voice follows the first; both share the tone contour.
      var echo=profile.echo,second=Object.assign({},profile,{echo:null,waves:profile.waves.map(function(part){return [part[0],part[1],part[2],part[3]+echo.detune];})});
      pip(cue,at+echo.delay/speed,speed,second,level*echo.gain,frequency);
    }
  }
  async function open(){var Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('audio-unavailable');if(!context)context=new Audio();await context.resume();if(context.state!=='running')throw new Error('audio-suspended');}
  async function enable(value){if(!value){enabled=false;stop();return false;}await open();enabled=true;return true;}
  var danceLead={base:740,cutoff:3000,attack:.003,decay:.42,waves:[['square',1,.55,0],['triangle',2,.45,0]]};
  var danceBass={base:145,cutoff:700,attack:.004,decay:.6,waves:[['triangle',1,.8,0],['sine',.5,.2,0]]};
  var danceKick={base:94,cutoff:450,attack:.002,decay:.12,waves:[['sine',1,1,0]]};
  var danceTick={base:2600,cutoff:4200,attack:.001,decay:.08,waves:[['triangle',1,1,0]]};
  function midi(note){return 440*Math.pow(2,(note-69)/12);}
  function danceScene(now,local,seconds,speed,offset){
    // Original two-bar chip-dance phrase; not a transcription of the reference track.
    var step=60/132/2,lead=[74,0,77,74,81,79,0,77,72,74,77,0,79,77,74,72],bass=[50,50,45,48];
    offset=offset||0;
    for(var index=Math.ceil((offset+local/1000-.04)/step);index*step<offset+seconds-.00001;index++){
      var t=index*step-offset-local/1000;if(t<-.04)continue;var at=now+Math.max(0,t)/speed,n=index%16;
      if(lead[n])pip({tone:5,duration:.17},at,speed,danceLead,.47,midi(lead[n]));
      if(index%2===0){pip({tone:5,duration:.18},at,speed,danceBass,.4,midi(bass[Math.floor(n/4)]));pip({tone:4,duration:.14},at,speed,danceKick,.55);}
      else pip({tone:5,duration:.04},at,speed,danceTick,.12);
      if(index%4===2)pip({tone:5,duration:.055},at,speed,danceTick,.2,1550);
    }
  }
  function scene(effect,now,local,seconds,speed,id,musicOffset){
    if(!sceneEnabled)return;
    if(id==='grok'&&(effect==='dance'||effect==='turn')){danceScene(now,local,seconds,speed,musicOffset);return;}
    var melody=effect==='dance'||effect==='turn'?[261.63,329.63,392,329.63,440,392,329.63,293.66]:effect==='twins'?[659.25,830.61,987.77]:effect==='tea'||effect==='return'||effect==='login'?[523.25,659.25,783.99]:effect==='banned'?[392,329.63,261.63]:[];
    var step=melody.length>4?seconds/melody.length:.15;
    melody.forEach(function(hz,i){var offset=.03+i*step-local/1000;if(offset>=0)pip({tone:5,duration:Math.min(.15,step*.7)},now+offset/speed,speed,musicSound,.26,hz);});
  }
  function sync(key,units,local,seconds,playing,speed,effect,musicOffset){
    var cues=plan(units,seconds),count=cues.filter(function(u){return u.start*1000<=local;}).length;
    if(!playing){if(lastKey!==null)stop();return units.length;}
    if(!enabled||!context||context.state!=='running')return count;
    if(key!==lastKey){stop();lastKey=key;var now=context.currentTime+.008,profile=profiles[key.split(':')[0]]||profiles.doubao;
      cues.forEach(function(cue){var delay=cue.start-local/1000;if(delay<0)return;if(cue.tone)pip(cue,now+delay/speed,speed,profile);else if(cue.dots)pip({tone:5,duration:.055},now+delay/speed,speed,pauseSound,.5);});
      scene(effect,now,local,seconds,speed,key.split(':')[0],musicOffset);
    }
    return count;
  }
  async function audition(id,kind){
    await open();stop();var now=context.currentTime+.03,profile=profiles[id]||profiles.doubao;
    if(kind==='dots'){[0,.25,.57].forEach(function(t,i){pip({tone:5,duration:.07},now+t,1,pauseSound,.55,340-i*35);});}
    else if(kind==='music'){scene('dance',now,0,id==='grok'?60/132*16:2.2,1,id,0);}
    else [1,2,3,4].forEach(function(t,i){pip({tone:t,duration:.18},now+i*.24,1,profile);});
  }
  window.StudioVoice={enable:enable,stop:stop,sync:sync,audition:audition,setVolume:function(value){volume=Math.max(0,Math.min(1,value));stop();},setScene:function(value){sceneEnabled=value;stop();},isEnabled:function(){return enabled;},plan:plan};
}());
