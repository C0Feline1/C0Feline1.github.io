/* A shared pixel home: ten work docks on the left, open living rooms beyond. */
(function () {
  'use strict';
  var WIDTH=1280, HEIGHT=300, FLOOR=128;
  var C={ink:'#0b0716',wall:'#1e1534',wallHi:'#2a1d45',trim:'#4a3a6a',
    wood:'#5a3a52',woodHi:'#79506b',woodLow:'#3a2438',pink:'#ff6fa6',
    cyan:'#4fe3ff',violet:'#b48cff',cream:'#e8d8e8',leaf:'#3fae83',leafHi:'#72d6a0',leafLow:'#23685f'};
  var cast=[
    ['C0','#4fe3ff','code'],['X0','#b48cff','art'],['Feline1','#ff9fc4','paw'],
    ['gpt','#94cbb9','think'],['deepseek','#7aaff0','ocean'],['claude','#e9a16f','book'],
    ['grok','#dba0ba','spark'],['gemini','#b8a1f2','stars'],['kimi','#bec8ed','moon'],['doubao','#b6d8e8','cookie']
  ];
  var workstations=cast.map(function(c,i){
    var x=24+i%5*88,y=i<5?146:240;
    return{id:c[0],name:window.StudioCast?StudioCast.name(c[0],'zh-CN'):c[0],color:c[1],kind:c[2],deskX:x,x:x+16,y:y,footY:y+3};
  });
  function rect(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  }
  function line(g, x0, y0, x1, y1, color) {
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    var dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, err = dx + dy;
    while (true) {
      rect(g, x0, y0, 1, 1, color);
      if (x0 === x1 && y0 === y1) break;
      var twice = 2 * err;
      if (twice >= dy) { err += dy; x0 += sx; }
      if (twice <= dx) { err += dx; y0 += sy; }
    }
  }
  function plaque(g, text, x, y, color) {
    var w = PX.textWidth(text) + 10;
    rect(g, x, y, w, 9, '#120d21');
    rect(g, x, y + 8, w, 1, '#4a345e');
    rect(g, x + 2, y + 3, 1, 2, color);
    PX.text(g, text, x + 5, y + 2, color);
  }
  function star(g, x, y, bright) {
    rect(g, x, y, 1, 1, bright ? '#e7e3fa' : '#75688f');
    if (bright) {
      rect(g, x - 1, y, 3, 1, '#c6b5ee');
      rect(g, x, y - 1, 1, 3, '#c6b5ee');
    }
  }
  function nightWindow(g, x, y, w, h, seed) {
    rect(g, x, y, w, h, C.ink);
    rect(g, x + 2, y + 2, w - 4, h - 4, '#15162d');
    for (var n = 0; n < 24; n++) {
      var xx = x + 5 + (n * 23 + seed * 7) % (w - 10);
      var yy = y + 5 + (n * 13 + seed * 3) % Math.max(8, h - 15);
      star(g, xx, yy, n % 13 === 0);
    }
    for (var b = 0; b < w - 7; b += 9) {
      var bh = 6 + (b * 3 + seed) % 16;
      rect(g, x + 3 + b, y + h - 3 - bh, 8, bh, b % 2 ? '#21203d' : '#26223f');
      if (b % 3 === 0) rect(g, x + 5 + b, y + h - 5 - bh, 2, 2, '#7a627f');
    }
    rect(g, x, y, w, 2, C.trim); rect(g, x, y + h - 2, w, 2, C.trim);
    rect(g, x, y, 2, h, C.trim); rect(g, x + w - 2, y, 2, h, C.trim);
    for (var m = x + 48; m < x + w - 5; m += 48) rect(g, m, y + 2, 2, h - 4, '#443454');
    rect(g, x - 2, y + h, w + 4, 3, '#5a466e');
    rect(g, x + 5, y + 5, 1, h - 12, '#302c50');
  }
  function books(g, x, y, count) {
    var colors = [C.pink, C.cyan, '#b48cff', '#d0ad78', '#5dbba0', '#8a7aa8'];
    rect(g, x - 3, y, count * 4 + 5, 3, C.wood);
    rect(g, x - 3, y + 3, count * 4 + 5, 1, '#2a1828');
    for (var b = 0; b < count; b++) {
      var h = 8 + b * 7 % 6;
      rect(g, x + b * 4, y - h, 3, h, colors[b % colors.length]);
      rect(g, x + b * 4, y - h + 2, 2, 1, '#d8c9d6');
    }
  }
  function plant(g, x, bottom, size, pot) {
    var s = size || 1;
    rect(g, x - 5 * s, bottom - 8 * s, 10 * s, 7 * s, pot || '#7a3a58');
    rect(g, x - 6 * s, bottom - 9 * s, 12 * s, 2 * s, '#a56a81');
    rect(g, x - 4 * s, bottom - 2 * s, 8 * s, 2 * s, '#493044');
    rect(g, x, bottom - 25 * s, s, 17 * s, C.leafLow);
    [[-7, -20, 7, 4], [1, -25, 6, 4], [-5, -31, 5, 5], [1, -17, 8, 4], [-6, -13, 6, 3]].forEach(function (p, i) {
      rect(g, x + p[0] * s, bottom + p[1] * s, p[2] * s, p[3] * s, i % 2 ? C.leafHi : C.leaf);
      rect(g, x + (p[0] + 1) * s, bottom + (p[1] + 1) * s, Math.max(1, p[2] - 3) * s, s, C.leafLow);
    });
  }
  function rug(g,x,y,w,h,base,edge){
    rect(g,x,y,w,h,base);rect(g,x+2,y+1,w-4,1,edge);rect(g,x+2,y+h-2,w-4,1,edge);
    for(var n=x+7;n<x+w-4;n+=14){rect(g,n,y+3,3,1,edge);rect(g,n,y+h-4,3,1,edge);}
  }
  function shell(g){
    rect(g,0,0,WIDTH,HEIGHT,C.wall);rect(g,0,80,WIDTH,48,C.wallHi);
    for(var y=FLOOR;y<HEIGHT;y++){
      var row=Math.floor((y-FLOOR)/6),shift=row%2*23;
      for(var x=0;x<WIDTH;x++){
        var plank=Math.floor((x+shift)/46);
        rect(g,x,y,1,1,(y-FLOOR)%6===0||(x+shift)%46===0?'#1e1220':plank%2?'#3a2436':'#33202f');
      }
    }
    rect(g,0,125,WIDTH,1,'#ff4fa3');rect(g,0,126,WIDTH,2,'#3a1838');rect(g,0,128,WIDTH,2,'#4a2e44');
    [478,746,1006].forEach(function(x){rect(g,x,0,3,125,'#30223f');rect(g,x+1,15,1,105,'#604969');});
    rect(g,0,0,2,126,C.trim);rect(g,WIDTH-2,0,2,126,C.trim);
    rug(g,17,143,437,13,'#302538','#59445f');rug(g,17,237,437,15,'#302538','#59445f');
    // A subtle runner links the rooms; it stays painted floor, never a collider.
    rect(g,477,280,790,8,'#3b293b');rect(g,481,281,782,1,'#584052');
    for(var seam=492;seam<1260;seam+=32)rect(g,seam,286,8,1,'#61465b');
    if(window.StudioFurnishings)StudioFurnishings.paintFloor(g);
  }
  function studioWall(g){
    plaque(g,'LITTLE FAMILY / WORKROOM',18,7,C.cyan);
    nightWindow(g,18,24,172,51,4);nightWindow(g,292,24,154,51,8);
    // Keep the two familiar studio posters beside the expanded shared desks.
    rect(g,207,25,30,40,C.pink);rect(g,208,26,28,38,'#1a1030');
    for(var n=0;n<14;n++)rect(g,210+n*7%24,29+n*11%18,1,1,n%3?'#ffd45e':'#fff');
    star(g,222,41,true);PX.text(g,'STAR',214,53,'#ff9fc4');PX.text(g,'DREAM',212,58,'#ff9fc4');
    rect(g,247,31,22,28,C.cyan);rect(g,248,32,20,26,'#0c1a2a');
    PX.text(g,'V07',251,34,C.cyan);rect(g,254,46,7,2,'#dde8fa');rect(g,256,48,3,2,'#dde8fa');
    books(g,207,88,14);books(g,387,88,9);
    rect(g,56,33,7,5,'#fff6d8');
    // Task boards hang below the windows, leaving the aisle between rows open.
    [[86,'#94cbb9'],[310,'#b48cff']].forEach(function(p){
      rect(g,p[0],78,65,12,'#281e35');rect(g,p[0]+2,80,61,8,'#42334b');
      for(var i=0;i<6;i++){var xx=p[0]+5+i*9;rect(g,xx,81,6,5,i%2?p[1]:'#d8b98b');rect(g,xx+1,83,4,1,'#6d576a');}
    });
  }
  function commonWall(g){
    plaque(g,'COMMON ROOM / TEA BREAK',494,7,'#d9b38c');
    nightWindow(g,502,25,106,49,11);books(g,647,76,11);
    // Snapshots, a clock, and a pencilled shopping list make a lived-in wall.
    rect(g,617,28,60,30,'#8b6655');rect(g,619,30,56,26,'#ad8970');
    for(var i=0;i<4;i++){var px=622+i*12;rect(g,px,34,9,16,'#f0dfcf');rect(g,px+1,35,7,9,cast[(i+2)%cast.length][1]);rect(g,px+2,45,5,1,'#b6a08e');}
    rect(g,700,34,20,20,'#7a5d75');rect(g,702,36,16,16,'#ddd4c5');rect(g,709,39,1,7,'#4f405d');rect(g,709,45,5,1,'#4f405d');
    rect(g,698,70,24,22,'#c3aa88');rect(g,700,72,20,18,'#e6d7be');
    for(var ln=0;ln<4;ln++)rect(g,703,76+ln*3,12-ln%2*3,1,'#9d8370');
    // Pendant shades stay on the wall, well above paths and heads.
    [544,656].forEach(function(x){rect(g,x,15,1,67,'#685665');rect(g,x-7,82,15,3,'#a78385');rect(g,x-5,85,11,3,'#e4ba93');});
  }
  function creativeWall(g){
    plaque(g,'STAR ATELIER / PLAY TOGETHER',763,7,C.violet);
    nightWindow(g,766,24,218,48,15);books(g,801,88,10);books(g,945,88,7);
    // Pinned sketches and colour chips, with an open rehearsal floor in front.
    [[759,94],[786,99],[949,96],[973,99]].forEach(function(p,i){
      rect(g,p[0],p[1],18,20,'#47364e');rect(g,p[0]+1,p[1]+1,16,18,'#d4c3b1');
      line(g,p[0]+3,p[1]+12,p[0]+8,p[1]+5,i%2?'#8b779b':'#a77a86');
      line(g,p[0]+8,p[1]+5,p[0]+13,p[1]+13,'#a77a86');rect(g,p[0]+8,p[1],2,2,'#b48cff');
    });
    rect(g,852,81,50,5,'#74516b');
    ['#d99bb5','#d7bd84','#85b7b8','#a38bc1','#d6c8db'].forEach(function(c,i){rect(g,855+i*9,78,7,6,c);});
  }
  function gardenWall(g){
    plaque(g,'MOON GARDEN / WIND DOWN',1022,7,'#a0c6cc');
    g.save();g.translate(312,0);glasshouse(g);g.restore();
    nightWindow(g,1021,27,54,47,19);books(g,1041,87,8);
    // A little garland over the quiet nook.
    for(var i=0;i<11;i++){var x=1104+i*14,y=64+Math.round(Math.sin(i/10*Math.PI)*8);rect(g,x,y,13,1,'#685e73');rect(g,x+4,y+1,2,3,i%3?'#c1a1bd':'#e3c397');}
  }
  function glasshouse(g) {
    // A stepped glass roof with a crescent moon and city stars behind it.
    rect(g, 776, 47, 174, 67, '#101c2a');
    for (var y = 19; y < 48; y++) {
      var inset = Math.max(0, Math.ceil((47 - y) * 1.45));
      rect(g, 776 + inset, y, 174 - inset * 2, 1, '#141a2d');
    }
    for (var n = 0; n < 30; n++) star(g, 783 + n * 29 % 158, 51 + n * 17 % 57, n % 17 === 0);
    rect(g, 887, 25, 7, 1, '#d7d3ee'); rect(g, 885, 26, 10, 2, '#d7d3ee');
    rect(g, 884, 28, 11, 8, '#d7d3ee'); rect(g, 886, 36, 8, 2, '#d7d3ee');
    rect(g, 889, 24, 7, 10, '#141a2d');
    line(g, 776, 47, 818, 18, '#657784');
    line(g, 818, 18, 907, 18, '#657784');
    line(g, 907, 18, 949, 47, '#657784');
    line(g, 776, 48, 818, 19, '#354d5f');
    line(g, 907, 19, 949, 48, '#354d5f');
    line(g, 863, 18, 863, 112, '#496579');
    line(g, 818, 18, 807, 48, '#3c5369');
    line(g, 907, 18, 918, 48, '#3c5369');
    rect(g, 775, 47, 176, 2, '#596e80');
    [776, 807, 833, 890, 918, 948].forEach(function (x) { rect(g, x, 49, 2, 64, '#354d60'); });
    rect(g, 776, 81, 174, 2, '#304657');
    rect(g, 775, 112, 176, 3, '#596278');
    rect(g, 783, 53, 1, 23, '#294352');
    line(g, 819, 23, 804, 40, '#2e3a53');
    line(g, 915, 26, 935, 41, '#2e3a53');
    // Hanging pots and a shelf fill the greenhouse without crowding the workers.
    [792, 938].forEach(function (x, i) {
      rect(g, x, 48, 1, 11 + i * 4, '#89938c');
      rect(g, x - 4, 59 + i * 4, 9, 4, '#88556b');
      rect(g, x - 3, 63 + i * 4, 7, 2, '#573b52');
      rect(g, x - 5, 55 + i * 4, 3, 5, C.leaf);
      rect(g, x - 1, 53 + i * 4, 4, 7, C.leafHi);
      rect(g, x + 3, 58 + i * 4, 3, 9, C.leafLow);
    });
    rect(g, 849, 91, 40, 3, '#76546a');
    plant(g, 859, 91, 0.5, '#906374'); plant(g, 878, 91, 0.5, '#886e79');
    rect(g, 852, 94, 2, 7, '#463749'); rect(g, 884, 94, 2, 7, '#463749');
  }
  function chair(g, d) {
    var x = d.deskX;
    rect(g, x + 2, 127, 27, 2, '#25192b');
    rect(g, x + 5, 90, 20, 28, '#100c1c');
    rect(g, x + 7, 92, 16, 21, '#40334e');
    rect(g, x + 9, 94, 12, 2, d.color);
    rect(g, x + 6, 114, 20, 4, '#3f2b45');
    rect(g, x + 14, 118, 3, 8, '#1a1226');
    rect(g, x + 7, 126, 18, 2, '#1a1226');
    rect(g, x + 8, 128, 2, 1, '#80718c');
    rect(g, x + 22, 128, 2, 1, '#80718c');
  }
  function deskKeepsake(g, d) {
    var x = d.deskX, y = 111;
    // Deliberately small silhouettes sit below the owner's face.
    if (d.kind === 'art') {
      rect(g, x + 3, y - 4, 10, 3, '#bca4aa');
      [[4, '#ff9fc4'], [7, '#64d6dc'], [10, '#d8bc72']].forEach(function (p) {
        rect(g, x + p[0], y - 5, 2, 2, p[1]);
      });
      rect(g, x + 5, y - 10, 1, 5, '#c9a278');
    } else if (d.kind === 'paw') {
      rect(g, x + 4, y - 5, 6, 5, '#b9698f');
      rect(g, x + 5, y - 4, 4, 3, '#edb0c9');
      rect(g, x + 4, y - 3, 6, 1, '#f9c9dd');
      rect(g, x + 10, y - 1, 3, 1, '#df93ba');
    } else if (d.kind === 'ocean') {
      rect(g, x + 3, y - 3, 10, 3, '#6c9bb9');
      rect(g, x + 4, y - 5, 8, 2, '#b6d6df');
      rect(g, x + 5, y - 4, 5, 1, '#3c617c');
      rect(g, x + 7, y - 6, 2, 1, '#e3b986');
    } else if (d.kind === 'book' || d.kind === 'moon') {
      rect(g, x + 3, y - 4, 12, 3, d.kind === 'book' ? '#b3785b' : '#7885ae');
      rect(g, x + 4, y - 5, 5, 3, '#e6d7c5');
      rect(g, x + 10, y - 5, 4, 3, '#c9bdc0');
      rect(g, x + 9, y - 5, 1, 4, '#6b586b');
      if (d.kind === 'moon') {
        rect(g, x + 6, y - 9, 5, 3, '#bdb8da');
        rect(g, x + 8, y - 10, 4, 3, '#302344');
      }
    } else if (d.kind === 'stars') {
      rect(g, x + 3, y - 3, 10, 3, '#604e85');
      star(g, x + 6, y - 6, true); star(g, x + 11, y - 9, true);
      rect(g, x + 5, y - 4, 6, 1, '#ba9ddd');
    } else if (d.kind === 'spark') {
      rect(g, x + 3, y - 5, 6, 5, '#4d3b53');
      rect(g, x + 4, y - 5, 4, 1, '#dba0ba');
      rect(g, x + 8, y - 4, 3, 3, '#6a526c');
      rect(g, x + 12, y - 2, 4, 2, '#c9aa7b');
    } else if (d.kind === 'cookie') {
      rect(g, x + 4, y - 7, 8, 7, '#6d929e');
      rect(g, x + 5, y - 9, 6, 2, '#c8d7d3');
      rect(g, x + 5, y - 5, 6, 4, '#b8d2d4');
      rect(g, x + 7, y - 4, 3, 3, '#d8b282');
      rect(g, x + 8, y - 3, 1, 1, '#75534d');
      rect(g, x + 12, y - 2, 4, 2, '#e5c492');
    } else {
      rect(g, x + 4, y - 5, 6, 5, d.kind === 'think' ? '#a5bdb1' : '#809ba4');
      rect(g, x + 9, y - 4, 3, 3, '#8c7e97');
      rect(g, x + 5, y - 5, 4, 1, '#eee0e5');
      rect(g, x + 13, y - 2, 5, 2, '#c1b7c3');
    }
  }
  function paintWorkstation(g, d) {
    var x = d.deskX, mx = x + 39;
    rect(g, x, 111, 70, 3, C.wood); rect(g, x + 1, 111, 68, 1, '#95647b');
    rect(g, x, 114, 70, 2, C.woodLow);
    rect(g, x + 2, 116, 3, 12, C.woodLow); rect(g, x + 65, 116, 3, 12, C.woodLow);
    rect(g, x + 2, 127, 3, 2, '#281b30'); rect(g, x + 65, 127, 3, 2, '#281b30');
    rect(g, x + 23, 108, 18, 3, '#171220'); rect(g, x + 25, 108, 14, 1, '#8a6c8d');
    for (var k = 0; k < 5; k++) rect(g, x + 25 + k * 3, 110, 2, 1, '#58445e');
    rect(g, x + 44, 109, 4, 2, '#aaa0b8');
    rect(g, mx, 82, 30, 22, '#0a0812'); rect(g, mx + 1, 83, 28, 19, '#101b2b');
    rect(g, mx + 13, 104, 4, 5, '#171220'); rect(g, mx + 9, 109, 12, 2, '#171220');
    rect(g, mx + 2, 84, 26, 1, '#31405a');
    rect(g, mx + 26, 102, 1, 1, d.color);
    var cast=window.StudioCast&&StudioCast.get(d.id),name=cast?StudioCast.name(d.id):d.name;
    if(cast){g.font='7px "Fusion Pixel", "PingFang SC", monospace';g.textBaseline='top';}
    var labelW = (cast?Math.ceil(g.measureText(name).width):PX.textWidth(name)) + 6, labelX = Math.round(x + 54 - labelW / 2);
    rect(g, labelX, 73, labelW, 9, '#120d20');
    rect(g, labelX, 73, labelW, 1, d.color); rect(g, labelX, 81, labelW, 1, '#65516f');
    if(cast){g.fillStyle=d.color;g.fillText(name,labelX+3,74);}else PX.text(g, name, labelX + 3, 75, d.color);
    deskKeepsake(g, d);
  }
  var stationCaches=[],stationLabels=[];
  function refreshLabels(){stationCaches=[];stationLabels=[];}
  window.addEventListener('c0-language-change',refreshLabels);
  function stationScreen(g,d,a,phase){
      var active = a && a.state === 'work' && (!a.path || !a.path.length) && Math.abs(a.x - d.x) < 7 && Math.abs(a.y - d.y) < 5;
      var mx = d.deskX + 39;
      if (!active) {
        rect(g, mx + 5, 88, 19, 1, '#38495e'); rect(g, mx + 5, 91, 12, 1, '#29384d');
        rect(g, mx + 19, 98, 5, 1, d.color); return;
      }
      if (d.kind === 'art' || d.kind === 'stars') {
        rect(g, mx + 3, 87, 24, 13, '#2c263f');
        [d.color, '#78b8c4', '#c596b2', '#dabd85'].forEach(function (c, n) {
          rect(g, mx + 5 + n * 5, 89, 4, 4 + (phase + n) % 6, c);
        });
      } else if (d.kind === 'ocean') {
        for (var bar = 0; bar < 12; bar++) {
          var h = 3 + (bar * 7 + phase) % 11;
          rect(g, mx + 3 + bar * 2, 100 - h, 1, h, bar % 3 ? '#4489b3' : '#9bd6e7');
        }
      } else if (d.kind === 'book' || d.kind === 'moon') {
        rect(g, mx + 4, 87, 22, 12, d.kind === 'book' ? '#d7b7a5' : '#b9bfd2');
        for (var ln = 0; ln < 4; ln++) rect(g, mx + 6, 89 + ln * 2, 10 + (ln + phase) % 3 * 3, 1, '#796d80');
      } else {
        for (var row = 0; row < 5; row++) rect(g, mx + 4 + row % 2 * 3, 87 + row * 3, 6 + (row * 7 + phase) % 14, 1, row % 2 ? '#687f94' : d.color);
      }
      rect(g, mx + 23, 99, 2, 1, phase % 2 ? d.color : '#182539');
      rect(g, d.deskX + 23 + phase % 2, 108, 3, 2, '#efd3da');
      rect(g, d.deskX + 32 - phase % 2, 108, 3, 2, '#efd3da');
  }
  function drawWorkstations(g,actors,tick,bounds,depth){
    var byId={},phase=Math.floor((Number(tick)||0)/10);
    (actors||[]).forEach(function(a){byId[a.id]=a;});
    workstations.forEach(function(d,i){
      if(depth!==undefined&&d.footY!==depth)return;
      var dy=d.y-126;
      if(bounds&&(d.deskX+82<bounds.left||d.deskX>bounds.right||d.y+4<bounds.top||72+dy>bounds.bottom))return;
      var label=window.StudioCast?StudioCast.name(d.id):d.name;
      if(!stationCaches[i]||stationLabels[i]!==label){
        stationLabels[i]=label;var cache=PX.make(82,58),p=cache.getContext('2d');
        p.translate(-d.deskX,-72);paintWorkstation(p,d);stationCaches[i]=cache;
      }
      g.save();g.translate(0,dy);g.drawImage(stationCaches[i],d.deskX,72);stationScreen(g,d,byId[d.id],phase);g.restore();
    });
  }
  var occluders=[];
  // Position is assigned once; the same delta moves the drawing and its footprint.
  var positions={
    'office-server':[452,67], 'cowork-server':[457,179], 'office-plant':[2,161], 'cowork-plant':[484,125],
    'garden-pot':[1240,147],bed:[1134,202],easel:[784,179],'cat-bed':[1210,247],fridge:[684,130],
    sofa:[530,164],'tea-table':[548,219],lamp:[1092,153],'snack-counter':[622,108]
  };
  var geometry={
    bed:[2,8,57,23],easel:[3,19,12,9],'cat-bed':[2,6,39,11],fridge:[2,26,24,17],
    'office-server':[0,70,30,7],'office-plant':[2,25,12,6],'cowork-plant':[3,27,10,6],
    'cowork-server':[0,53,17,7],sofa:[0,17,64,14],'tea-table':[2,10,37,14],lamp:[2,70,11,4],
    'snack-counter':[2,48,59,18],'garden-pot':[4,19,9,7]
  };
  function prop(id,x,y,w,h,footY,paint){
    var place=positions[id]||[x,y],originalX=x,originalY=y,cache=null,shape=geometry[id];
    var item={id:id,x:place[0],y:place[1],w:w,h:h,footY:place[1]+footY-y,draw:function(g){
      if(!cache){cache=PX.make(w,h);var p=cache.getContext('2d');p.translate(-originalX,-originalY);paint(p);}
      g.drawImage(cache,item.x,item.y);
    }};
    if(shape)item.obstacle={id:id,x:item.x+shape[0],y:item.y+shape[1],w:shape[2],h:shape[3]};
    occluders.push(item);
  }
  prop('office-server', 284, 52, 31, 77, 129, function (g) {
    rect(g, 284, 52, 30, 76, '#0a0812'); rect(g, 284, 52, 30, 2, '#2a2240');
    rect(g, 284, 52, 2, 76, '#2a2240'); rect(g, 312, 52, 2, 76, '#2a2240');
    for (var rack=0;rack<9;rack++) {
      rect(g, 288, 58+rack*7, 22, 5, '#17122a');
      rect(g, 290, 60+rack*7, 2, 1, rack%3?'#5dff8f':'#253b30');
      rect(g, 294, 60+rack*7, 2, 1, '#397c5b');
    }
  });
  prop('cowork-server', 615, 69, 18, 60, 129, function (g) {
    rect(g, 615, 69, 17, 59, '#0a0812'); rect(g, 615, 69, 17, 2, '#40364f');
    for (var rack=0;rack<7;rack++) {
      rect(g, 617, 74+rack*7, 13, 5, '#221a31');
      rect(g, 619, 76+rack*7, 2, 1, rack%3?'#65b9b2':'#ce8fae');
      rect(g, 624, 76+rack*7, 4, 1, '#51445e');
    }
  });
  prop('office-plant', 260, 98, 18, 31, 129, function (g) {
    rect(g, 262, 118, 12, 10, '#7a3a2a'); rect(g, 262, 118, 12, 2, '#5a2a20');
    [[268,106,'#3fae6a'],[263,111,'#2f8a55'],[272,110,'#2f8a55'],[266,100,'#5ad08a']].forEach(function(p){
      rect(g,p[0],p[1],4,9,p[2]);rect(g,p[0]+1,p[1]-2,2,2,p[2]);
    });
  });
  prop('cowork-plant', 413, 95, 18, 34, 128, function (g) { plant(g,421,127,1,'#6a3e54'); });
  prop('garden-pot', 942, 135, 18, 28, 162, function (g) { plant(g,950,161,.8,'#76516b'); });
  prop('bed', 2, 143, 60, 33, 174, function (g) {
    rect(g, 2, 145, 59, 29, '#241425');
    rect(g, 4, 143, 7, 29, '#70405b'); rect(g, 5, 145, 55, 4, '#70405b');
    rect(g, 11, 150, 14, 8, '#d4b5c8'); rect(g, 12, 151, 12, 2, '#9d6683');
    rect(g, 25, 149, 32, 17, '#7b4263'); rect(g, 28, 150, 25, 2, '#b75883');
    rect(g, 7, 170, 4, 5, '#4a2e44'); rect(g, 54, 170, 4, 5, '#4a2e44');
  });
  prop('easel', 145, 135, 18, 28, 163, function (g) {
    rect(g, 145, 135, 17, 15, '#49303d'); rect(g, 147, 137, 13, 11, '#c6a980');
    rect(g, 152, 150, 3, 12, '#684639'); rect(g, 148, 160, 11, 2, '#684639');
  });
  prop('cat-bed', 172, 153, 44, 18, 170, function (g) {
    rect(g, 172, 154, 43, 15, '#281426'); rect(g, 174, 153, 39, 8, '#7a3a58');
    rect(g, 178, 154, 31, 4, '#ff7eaf');
    rect(g, 176, 167, 4, 3, '#563149'); rect(g, 207, 167, 4, 3, '#563149');
  });
  prop('fridge', 280, 132, 29, 46, 176, function (g) {
    rect(g, 280, 176, 28, 2, '#1b1220'); rect(g, 282, 137, 24, 38, '#171322');
    rect(g, 283, 138, 22, 35, '#8992b4'); rect(g, 285, 139, 18, 33, '#c5c9d9');
    rect(g, 285, 156, 18, 2, '#73809e');
    rect(g, 299, 144, 2, 8, '#38425b'); rect(g, 299, 162, 2, 7, '#38425b');
    rect(g, 286, 142, 6, 1, '#4fe3ff'); rect(g, 286, 144, 4, 1, '#4fe3ff');
    rect(g, 285, 174, 5, 2, '#38425b'); rect(g, 298, 174, 5, 2, '#38425b');
    rect(g, 285, 133, 8, 4, '#39243b'); rect(g, 286, 132, 6, 2, '#ff9fc4'); rect(g, 288, 134, 2, 2, '#ffd45e');
  });
  prop('sofa', 650, 126, 65, 32, 157, function (g) {
    rect(g, 651, 133, 61, 24, '#241b2e'); rect(g, 654, 126, 56, 23, '#6b4b79');
    rect(g, 657, 128, 50, 14, '#84618e'); rect(g, 658, 129, 48, 1, '#b28aab');
    rect(g, 679, 130, 1, 11, '#664571'); rect(g, 653, 140, 59, 12, '#8b5e85');
    rect(g, 656, 141, 53, 2, '#b185a2');
    rect(g, 650, 135, 6, 17, '#543c63'); rect(g, 708, 135, 6, 17, '#543c63');
    rect(g, 655, 152, 4, 5, '#201725'); rect(g, 704, 152, 4, 5, '#201725');
    rect(g, 695, 132, 9, 8, '#cf94ad'); rect(g, 697, 133, 5, 1, '#edbed0');
  });
  prop('tea-table', 723, 137, 42, 25, 161, function (g) {
    rect(g, 723, 148, 41, 3, '#23192c'); rect(g, 725, 145, 37, 3, '#8e5c70');
    rect(g, 727, 145, 33, 1, '#c39199');
    rect(g, 728, 151, 3, 10, '#533547'); rect(g, 756, 151, 3, 10, '#533547');
    rect(g, 746, 139, 7, 6, '#bcc3d2'); rect(g, 748, 137, 3, 2, '#dde0e7');
    rect(g, 753, 140, 3, 2, '#9297b3'); rect(g, 745, 141, 2, 1, C.cream);
    rect(g, 734, 142, 5, 3, '#e5c1c9'); rect(g, 738, 142, 2, 2, '#a37995'); rect(g, 756, 142, 3, 2, '#d6ae7e');
  });
  prop('lamp', 761, 85, 15, 75, 159, function (g) {
    rect(g, 767, 94, 2, 64, '#655168'); rect(g, 762, 157, 13, 2, '#251b30');
    rect(g, 761, 88, 14, 6, '#b8a0bd'); rect(g, 764, 85, 8, 3, '#d9bdd0'); rect(g, 763, 93, 10, 2, '#e8ccb1');
  });
  prop('snack-counter', 883, 96, 64, 67, 162, function (g) {
    rect(g, 885, 118, 59, 39, '#4c3646'); rect(g, 883, 116, 63, 4, '#9a6b79'); rect(g, 885, 116, 59, 1, '#c995a0');
    rect(g, 889, 123, 51, 26, '#30273a'); rect(g, 891, 125, 22, 21, '#213846'); rect(g, 916, 125, 22, 21, '#213846');
    rect(g, 891, 135, 47, 1, '#5f617a'); rect(g, 914, 125, 1, 21, '#8a788c');
    [895, 903, 920, 929].forEach(function (x, i) {
      rect(g, x, 128, 5, 6, [C.pink, '#cfa269', C.cyan, C.violet][i]); rect(g, x + 1, 126, 3, 2, '#e2d6df');
      rect(g, x, 140, 5, 5, i % 2 ? '#d9b991' : '#aa91b8');
    });
    rect(g, 888, 157, 4, 5, '#251c29'); rect(g, 936, 157, 4, 5, '#251c29');
    rect(g, 919, 96, 18, 20, '#a4a1b4'); rect(g, 921, 98, 14, 12, '#343445');
    rect(g, 924, 100, 6, 1, C.cyan); rect(g, 924, 104, 6, 4, '#53556a');
    rect(g, 925, 110, 4, 4, '#eee0e1'); rect(g, 921, 114, 13, 2, '#626074');
    rect(g, 890, 111, 7, 5, '#edcad0'); rect(g, 891, 110, 5, 1, '#fff0e6');
  });

  if(window.StudioFurnishings)occluders=occluders.concat(StudioFurnishings.items);
  workstations.forEach(function(d){
    occluders.push({id:'chair-'+d.id,x:d.deskX+2,y:d.y-36,w:28,h:40,footY:d.y-1,draw:function(g){g.save();g.translate(0,d.y-126);chair(g,d);g.restore();}});
  });
  var obstacles=occluders.filter(function(o){return!!o.obstacle;}).map(function(o){return Object.assign({id:o.id},o.obstacle);});
  workstations.forEach(function(d){
    obstacles.push({id:'desk-'+d.id+'-left',x:d.deskX+2,y:d.y-2,w:3,h:4});
    obstacles.push({id:'desk-'+d.id+'-right',x:d.deskX+65,y:d.y-2,w:3,h:4});
  });
  var hangouts=[
    {id:'studio-aisle',x:239,y:178},{id:'sofa',x:562,y:211},{id:'tea',x:610,y:250},
    {id:'kitchen',x:693,y:203},{id:'easel',x:817,y:216},{id:'stage',x:910,y:249},
    {id:'arcade',x:975,y:206},{id:'reading',x:1061,y:247},{id:'cat',x:1195,y:265},{id:'garden',x:1246,y:207}
  ];
  window.StudioWorld={
    width:WIDTH,height:HEIGHT,floorY:FLOOR,
    zones:[{id:'office',x:0,end:480,label:'FAMILY WORKROOM'},
      {id:'cowork',x:480,end:748,label:'COMMON ROOM'},
      {id:'atelier',x:748,end:1008,label:'STAR ATELIER',logZone:'garden'},
      {id:'garden',x:1008,end:WIDTH,label:'MOON GARDEN'}],
    workstations:workstations,workstationDepths:workstations.map(function(d){return d.footY;}).filter(function(y,i,rows){return rows.indexOf(y)===i;}).sort(function(a,b){return a-b;}),obstacles:obstacles,occluders:occluders,hangouts:hangouts,
    performanceSpots:[{x:910,y:248},{x:885,y:253},{x:944,y:248},{x:600,y:268}],
    catHome:{x:1215,target:1230,y:258},photoStart:836,photoY:HEIGHT-2,
    build:function(){
      var canvas=PX.make(WIDTH,HEIGHT),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
      shell(g);studioWall(g);commonWall(g);creativeWall(g);gardenWall(g);return canvas;
    },
    drawWorkstations:drawWorkstations,refreshLabels:refreshLabels,
    drawAmbience:function(g,tick,bounds){
      if(bounds.left<480){
        [positions['office-server'],positions['cowork-server']].forEach(function(p,k){
          for(var i=0;i<(k?7:9);i++)rect(g,p[0]+(k?4:6),p[1]+8+i*7,2,1,(Math.floor(tick/13)+i)%3?'#5dca9b':'#284638');
        });
      }
      if(bounds.right>620&&bounds.left<680)for(var i=0;i<3;i++){
        var rise=(tick/7+i*4)%10;rect(g,632+Math.round(Math.sin(rise)),121-rise,1,1,'#bcaeb8');
      }
    },
    foreground:function(g){drawWorkstations(g,[],0);}
  };
})();
