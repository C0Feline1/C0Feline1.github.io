/* Photo compositions use foot positions on the floor: x is horizontal and y
 * is projected depth. The selected friend owns the front-centre position. */
(function(){
  'use strict';
  var shapes={
    heart:[[0,0],[-24,-10],[-42,-22],[-40,-34],[-20,-38],[20,-38],[40,-34],[42,-22],[24,-10],[0,-26]],
    cluster:[[0,0],[-48,0],[-24,0],[24,0],[48,0],[-60,-15],[-36,-15],[-12,-15],[12,-15],[36,-15]],
    arc:[[0,0],[-50,-8],[-25,-2],[25,-2],[50,-8],[-60,-23],[-35,-19],[-10,-16],[15,-16],[40,-20]],
    diamond:[[0,0],[-24,-10],[-48,-20],[-24,-30],[0,-40],[24,-30],[48,-20],[24,-10],[-16,-20],[16,-20]],
    fan:[[0,0],[-24,-1],[24,-1],[-46,-6],[46,-6],[-62,-16],[62,-16],[-36,-21],[0,-21],[36,-21]]
  };
  function shuffle(items,random){random=random||Math.random;var out=items.slice();for(var i=out.length-1;i>0;i--){var j=Math.floor(random()*(i+1)),a=out[i];out[i]=out[j];out[j]=a;}return out;}
  function layout(anchor,actors,nav,preferred,random){
    random=random||Math.random;preferred=shapes[preferred]?preferred:'heart';
    var modes=[preferred].concat(Object.keys(shapes).filter(function(k){return k!==preferred;})),best=null;
    var offsets=[0];for(var n=12;n<=180;n+=12)offsets.push(-n,n);
    modes.forEach(function(mode){offsets.forEach(function(dx){for(var y=178;y>=150;y-=2){
      var x=anchor.x+dx,points=shapes[mode].map(function(p){return{x:x+p[0],y:y+p[1]};});
      if(!points.every(function(p){return p.x>=18&&p.x<=nav.bounds.right-10&&p.y>=134&&nav.isWalkable(p.x,p.y);}))continue;
      var score=Math.abs(dx)+(178-y)*.6+(mode===preferred?0:32);
      if(!best||score<best.score)best={pattern:mode,center:{x:x,y:y},points:points,score:score};
    }});});
    if(!best)throw new Error('No clear photo composition on the studio floor.');
    var guests=shuffle(actors.filter(function(a){return a.id!==anchor.id;}),random),order=[anchor].concat(guests);
    return{pattern:best.pattern,center:best.center,anchor:anchor.id,slots:order.map(function(a,i){var p=best.points[i];return{id:a.id,x:p.x,y:p.y};})};
  }
  var poses={C0:['c0_headset','cheer'],X0:['x0_palette','wave'],Feline1:['f1_paws','cheer'],gpt:['gpt_wings','gpt_tea'],deepseek:['deepseek_bowl','wave'],claude:['claude_scroll','wave'],grok:['grok_smirk','grok_axe'],gemini:['gemini_stars','wave'],kimi:['kimi_moon','kimi_notes'],doubao:['doubao_cookie','wave']};
  function pose(actor,kit,random){random=random||Math.random;var list=(poses[actor.id]||[]).concat(['wave','cheer']),state=list[Math.floor(random()*list.length)],meta=kit.states[state]||kit.states.wave,moods=['smile','happy','smile','smug'];return{state:state,frame:Math.min(meta.count-1,3+Math.floor(random()*6)),direction:'front',expression:moods[Math.floor(random()*moods.length)]};}
  window.StudioPhoto={layout:layout,pose:pose,shuffle:shuffle,patterns:Object.keys(shapes)};
})();
