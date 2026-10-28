/* Footprint navigation for the studio's shallow, side-view floor.
 * Actors collide at their feet: tall furniture can hide a friend passing behind
 * it without turning its whole painted silhouette into an invisible wall. */
(function () {
  'use strict';
  var world = window.StudioWorld;
  var W = world ? world.width : 1280, MIN_X = 8, MAX_X = W - 8, MIN_Y = 126, MAX_Y = 178, STEP = 2;
  var COLS=(MAX_X-MIN_X)/STEP+1, ROWS=(MAX_Y-MIN_Y)/STEP+1, TOTAL=COLS*ROWS;
  // StudioWorld owns furniture footprints so a moved desk or shared sofa cannot
  // leave an invisible obstacle at its former position.
  var obstacles = world && world.obstacles ? world.obstacles.map(function (o) { return Object.assign({}, o); }) : [];
  // Leave the y178 foreground corridor clear even below the old refrigerator.
  // Horizontal padding represents both feet; vertical padding is much smaller
  // because the room is viewed almost straight-on rather than from overhead.
  function blocked(x,y){
    for(var i=0;i<obstacles.length;i++){
      var o=obstacles[i];
      if(x>=o.x-3&&x<=o.x+o.w+3&&y>=o.y-1&&y<=o.y+o.h+1)return true;
    }
    return false;
  }
  function isWalkable(x,y){
    return Number.isFinite(x)&&Number.isFinite(y)&&x>=MIN_X&&x<=MAX_X&&y>=MIN_Y&&y<=MAX_Y&&!blocked(x,y);
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function distance2(a,b){var x=a.x-b.x,y=a.y-b.y;return x*x+y*y;}
  var free=new Uint8Array(TOTAL), gx=new Int16Array(TOTAL), gy=new Int16Array(TOTAL);
  for(var row=0;row<ROWS;row++)for(var col=0;col<COLS;col++){
    var idx=row*COLS+col,x=MIN_X+col*STEP,y=MIN_Y+row*STEP;
    gx[idx]=x;gy[idx]=y;free[idx]=isWalkable(x,y)?1:0;
  }
  function nearest(x,y){
    if(typeof x==='object'){y=x.y;x=x.x;}
    x=clamp(Number(x)||MIN_X,MIN_X,MAX_X);y=clamp(Number(y)||MIN_Y,MIN_Y,MAX_Y);
    if(isWalkable(x,y))return{x:x,y:y};
    var best=-1,score=Infinity;
    for(var i=0;i<TOTAL;i++)if(free[i]){
      var dx=gx[i]-x,dy=gy[i]-y,s=dx*dx+dy*dy;
      if(s<score){score=s;best=i;}
    }
    return{x:gx[best],y:gy[best]};
  }
  function clearLine(a,b){
    if(!isWalkable(a.x,a.y)||!isWalkable(b.x,b.y))return false;
    var dx=b.x-a.x,dy=b.y-a.y;
    for(var i=0;i<obstacles.length;i++){
      var o=obstacles[i],left=o.x-3,right=o.x+o.w+3,top=o.y-1,bottom=o.y+o.h+1,lo=0,hi=1,t1,t2,temp;
      if(!dx){if(a.x<left||a.x>right)continue;}
      else{t1=(left-a.x)/dx;t2=(right-a.x)/dx;if(t1>t2){temp=t1;t1=t2;t2=temp;}lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)continue;}
      if(!dy){if(a.y<top||a.y>bottom)continue;}
      else{t1=(top-a.y)/dy;t2=(bottom-a.y)/dy;if(t1>t2){temp=t1;t1=t2;t2=temp;}lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)continue;}
      if(lo<=hi)return false;
    }
    return true;
  }
  // The static room has only a few rectangular footprints. A visibility graph
  // around their corners is substantially smaller than searching every floor
  // pixel every time ten friends choose new destinations.
  var corners=[];
  function addCorner(list,x,y,test){
    if(!test(x,y)||list.some(function(p){return p.x===x&&p.y===y;}))return;
    list.push({x:x,y:y});
  }
  [[MIN_X,MIN_Y],[MAX_X,MIN_Y],[MIN_X,MAX_Y],[MAX_X,MAX_Y]].forEach(function(p){addCorner(corners,p[0],p[1],isWalkable);});
  obstacles.forEach(function(o){
    var l=o.x-4,r=o.x+o.w+4,t=o.y-2,b=o.y+o.h+2;
    [[l,t],[r,t],[l,b],[r,b]].forEach(function(p){addCorner(corners,p[0],p[1],isWalkable);});
  });
  var edges=corners.map(function(a,i){return corners.map(function(b,j){return i!==j&&clearLine(a,b)?Math.sqrt(distance2(a,b)):Infinity;});});
  function hitsBox(a,b,o){
    var dx=b.x-a.x,dy=b.y-a.y,lo=0,hi=1,axes=[['x',o.left,o.right,dx],['y',o.top,o.bottom,dy]];
    for(var i=0;i<2;i++){
      var axis=axes[i],v=a[axis[0]],d=axis[3];
      if(!d){if(v<axis[1]||v>axis[2])return false;}
      else{var t1=(axis[1]-v)/d,t2=(axis[2]-v)/d;if(t1>t2){var swap=t1;t1=t2;t2=swap;}lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)return false;}
    }
    return lo<=hi;
  }
  function plan(from,to,options){
    var start=nearest(from),end=nearest(to),avoid=[];
    // A temporary friend's footprint must not seal the route's starting point or
    // a conversation endpoint. Parent callers can re-plan when a neighbour rests.
    if(options&&Array.isArray(options.avoid))options.avoid.forEach(function(o){
      var r=Math.max(3,Number(o.radius)||7),x=Number(o.x),y=Number(o.y);
      if(!Number.isFinite(x)||!Number.isFinite(y)||distance2(start,{x:x,y:y})<(r+3)*(r+3)||distance2(end,{x:x,y:y})<(r+10)*(r+10))return;
      avoid.push({left:x-r,right:x+r,top:y-5,bottom:y+5});
    });
    function available(x,y){return isWalkable(x,y)&&!avoid.some(function(o){return x>=o.left&&x<=o.right&&y>=o.top&&y<=o.bottom;});}
    function line(a,b){return clearLine(a,b)&&!avoid.some(function(o){return hitsBox(a,b,o);});}
    if(distance2(start,end)<.01)return distance2(from,end)>.01?[end]:[];
    if(line(start,end))return distance2(from,start)>.01?[start,end]:[end];
    var nodes=corners.slice(),base=nodes.length;
    avoid.forEach(function(o){
      [[o.left-1,o.top-1],[o.right+1,o.top-1],[o.left-1,o.bottom+1],[o.right+1,o.bottom+1]].forEach(function(p){addCorner(nodes,p[0],p[1],available);});
    });
    var si=nodes.length;nodes.push(start);var ei=nodes.length;nodes.push(end);
    var count=nodes.length,costs=new Float64Array(count),prev=new Int16Array(count),closed=new Uint8Array(count);
    costs.fill(Infinity);prev.fill(-1);costs[si]=0;
    var memo={};
    function edge(i,j){
      if(i<base&&j<base){var weight=edges[i][j];return weight!==Infinity&&(!avoid.length||!avoid.some(function(o){return hitsBox(nodes[i],nodes[j],o);}))?weight:Infinity;}
      var key=i<j?i+':'+j:j+':'+i;
      if(memo[key]!==undefined)return memo[key];
      return(memo[key]=line(nodes[i],nodes[j])?Math.sqrt(distance2(nodes[i],nodes[j])):Infinity);
    }
    while(true){
      var current=-1,best=Infinity;
      for(var i=0;i<count;i++)if(!closed[i]){var f=costs[i]+Math.sqrt(distance2(nodes[i],end));if(f<best){best=f;current=i;}}
      if(current<0)break;if(current===ei)break;closed[current]=1;
      for(var j=0;j<count;j++)if(j!==current&&!closed[j]){
        var tentative=costs[current]+edge(current,j);if(tentative>=costs[j])continue;costs[j]=tentative;prev[j]=current;
      }
    }
    if(prev[ei]<0)return[];
    var path=[],at=ei;while(at!==si){path.push(nodes[at]);at=prev[at];if(at<0)return[];}path.reverse();
    if(distance2(from,start)>.01)path.unshift(start);
    return path.map(function(p){return{x:p.x,y:p.y};});
  }
  function move(from,dx,dy){
    var p=nearest(from),origin={x:p.x,y:p.y},steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))*2));
    dx/=steps;dy/=steps;
    for(var i=0;i<steps;i++){
      var nx=p.x+dx,ny=p.y+dy;
      if(isWalkable(nx,ny)){p.x=nx;p.y=ny;continue;}
      // Sliding lets keyboard movement brush a table edge without teleporting.
      if(isWalkable(nx,p.y))p.x=nx;
      if(isWalkable(p.x,ny))p.y=ny;
    }
    if(!clearLine(origin,p)){
      var alongX={x:p.x,y:origin.y},alongY={x:origin.x,y:p.y};
      return clearLine(origin,alongX)?alongX:clearLine(origin,alongY)?alongY:origin;
    }
    return p;
  }
  window.StudioNavigation={plan:plan,move:move,nearest:nearest,isWalkable:isWalkable,clearLine:clearLine,
    obstacles:obstacles.map(function(o){return Object.assign({},o);}),bounds:{left:MIN_X,right:MAX_X,top:MIN_Y,bottom:MAX_Y}};
})();
