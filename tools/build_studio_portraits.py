"""Draw the three studio founders as native 96 x 112 pixel portraits.

Run: python3 tools/build_studio_portraits.py
Pillow is an authoring dependency only. All shapes use integer coordinates;
there are no resampled gameplay sprites, antialiasing, or external model calls.
The seven existing AI illustrations and original poster are preserved verbatim.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'media' / 'ai-studio' / 'portraits'
ORIGINAL = ROOT.parent / 'ai-pixel-party' / 'output'
INK = '#28283f'
SKIN = '#ffe0ce'
SKIN_D = '#e8a9a3'
WHITE = '#fff9ed'
IDS = ('gpt', 'deepseek', 'claude', 'grok', 'gemini', 'kimi', 'doubao')


class Pixel:
    def __init__(self):
        self.im = Image.new('RGBA', (96, 112))
        self.d = ImageDraw.Draw(self.im)

    def p(self, pts, fill, outline=INK, width=1):
        self.d.polygon(pts, fill=fill)
        if outline:
            self.d.line(pts + [pts[0]], fill=outline, width=width)

    def r(self, box, fill, outline=None):
        self.d.rectangle(box, fill=fill, outline=outline)

    def l(self, pts, fill, width=1):
        self.d.line(pts, fill=fill, width=width)

    def face(self, eye, cat=False):
        self.r((43, 49, 53, 58), SKIN, INK)
        self.r((43, 50, 53, 53), SKIN_D)
        self.p([(30,36),(34,35),(35,45),(31,45),(29,41)], SKIN)
        self.p([(62,35),(66,36),(67,41),(65,45),(61,45)], SKIN)
        self.p([(34,27),(60,27),(64,33),(64,43),(61,49),
                (55,52),(42,52),(35,49),(31,43),(31,33)], SKIN)
        self.l([(32,39),(33,44),(37,49),(43,51),(54,51),(59,49)], '#f0b9ad')
        self.r((39,32,56,38), '#ffe9d7')
        for x in (36,53):
            self.l([(x-1,38),(x+1,37),(x+5,37),(x+6,38)], INK)
            self.r((x,38,x+5,43), WHITE)
            self.r((x+1,38,x+4,43), eye)
            self.r((x+2,38,x+3,40), INK)
            self.r((x+1,38,x+2,39), WHITE)
            self.r((x+3,42,x+4,43), '#d8e9f6')
            self.l([(x,44),(x+4,44)], '#bc827f')
            self.l([(x,34),(x+4,34)], '#8b6e75')
        self.r((34,45,38,46), '#f0a3a5')
        self.r((58,45,62,46), '#f0a3a5')
        if cat:
            self.l([(44,48),(46,49),(48,47),(50,49),(52,48)], '#a96976')
        else:
            self.l([(45,48),(47,49),(49,49),(51,48)], '#a96976')

    def legs(self, cloth, shade, shoe, socks=False):
        for i,x in enumerate((38,52)):
            self.r((x,82,x+7,99), cloth, INK)
            self.r((x+1,83,x+2,96), shade)
            if socks:
                self.r((x+1,90,x+6,98), '#fff5ed')
                self.l([(x+1,90),(x+6,90)], '#b5a8c8')
            self.p([(x,97),(x+7,97),(x+8,101),(x+7,103),
                    (x-2,103),(x-2,100)], shoe)
            self.r((x,99,x+5,99), '#d8c9df')
            self.r((x-1,102,x+6,102), '#f7efe8')

    def cap(self, base, shadow, light, style='swoop'):
        self.p([(29,37),(27,30),(29,22),(34,17),(42,14),(55,14),
                (63,18),(68,24),(69,32),(66,40),(62,35),(60,28),
                (53,27),(45,26),(38,29),(34,37)], base)
        self.p([(29,29),(31,23),(35,19),(43,16),(54,16),(60,19),
                (42,18),(35,23),(32,30)], light, None)
        if style == 'part':
            self.p([(46,18),(41,23),(38,30),(33,36),(38,37),(44,32),
                    (48,25),(51,32),(58,36),(65,35),(62,27),(56,20)], base)
            self.l([(49,19),(50,26),(54,31),(60,33)], light)
        else:
            self.p([(36,22),(54,18),(61,24),(64,33),(59,36),(54,33),
                    (51,28),(48,35),(43,39),(43,32),(39,35),(34,36),(31,33)], base)
            self.l([(52,22),(50,28),(46,33)], light)
            self.l([(38,23),(36,29),(35,32)], light)
        self.p([(29,31),(33,30),(33,44),(36,51),(31,49),(28,42)], base)
        self.p([(63,31),(66,32),(67,43),(64,49),(60,50),(63,42)], base)
        self.l([(29,36),(30,43),(32,46)], shadow)
        self.l([(65,35),(65,42),(63,46)], shadow)

    def bow(self, x, y, color, dark, light, size=1):
        self.p([(x,y),(x-7,y-5),(x-8,y+4),(x-1,y+2),
                (x+6,y+5),(x+8,y-4),(x+1,y-1)], color)
        self.l([(x-6,y-2),(x-2,y)], light)
        self.l([(x+3,y),(x+6,y-2)], dark)
        self.r((x-1,y-1,x+1,y+2), light, dark)


def c0():
    s=Pixel()
    hair='#34313f'; hs='#211f30'; hl='#69647a'
    cloth='#3c4356'; cd='#272f40'; cl='#657087'; cyan='#68d1e1'
    s.legs('#4b7199', '#84a3c0', '#697d98')
    # Trousers have seams, a knee fold, and a soft cuff above each sneaker.
    for x in (38,52):
        s.l([(x+6,83),(x+6,96)], '#2e476e')
        s.l([(x+2,91),(x+5,92)], '#7a97b6')
        s.r((x+1,96,x+6,98), '#354e74')
        s.r((x-1,100,x+6,102), '#e9e7ed')
        s.r((x+1,99,x+5,99), cyan)
        s.r((x-1,103,x+6,104), '#8491aa')
    # Hood behind the neck and a dropped, oversized sweatshirt silhouette.
    s.p([(33,53),(40,50),(56,50),(64,54),(66,65),(61,69),(35,68),(30,62)], cd)
    s.l([(35,54),(42,52),(55,52),(61,55)], cl)
    s.p([(35,56),(43,54),(48,58),(54,54),(61,56),(64,70),
         (63,83),(33,83),(32,71)], cloth)
    s.p([(34,60),(39,61),(39,77),(35,81),(33,80)], cd, None)
    s.p([(56,59),(60,58),(63,71),(61,80),(57,78)], '#4c566c', None)
    s.l([(41,58),(45,61),(51,61),(56,57)], cyan)
    s.l([(42,60),(42,67)], '#a1e4e8')
    s.l([(54,60),(54,67)], '#3e9db8')
    s.r((41,67,43,69), '#bdebea')
    s.r((53,67,55,69), cyan)
    s.p([(39,73),(57,73),(58,80),(38,80)], cd)
    s.l([(40,74),(55,74)], cl)
    s.l([(42,75),(40,78)], '#536b85')
    s.l([(54,75),(56,78)], '#536b85')
    s.l([(34,82),(62,82)], '#3d9ab2', 2)
    s.r((58,80,60,82), '#b9eced')
    # Relaxed left arm and bent right arm holding a thin notebook computer.
    s.p([(33,57),(29,58),(26,64),(27,73),(31,76),(36,73),(35,65)], cloth)
    s.l([(29,61),(28,69),(31,72)], cl)
    s.r((27,71,33,75), cd, INK)
    s.l([(28,72),(32,72)], cyan)
    s.p([(28,76),(33,75),(34,79),(31,82),(28,80)], SKIN)
    s.r((29,77,31,78), '#ffedda')
    s.p([(62,57),(67,59),(70,67),(66,74),(61,71),(64,66)], cloth)
    s.l([(66,61),(68,66),(65,69)], cl)
    s.p([(64,69),(68,70),(68,75),(64,77),(61,74)], SKIN)
    s.p([(61,68),(75,67),(78,81),(64,83)], cd)
    s.p([(63,70),(73,69),(76,79),(66,81)], '#6c8c9f', '#a8dce0')
    s.l([(65,73),(68,75),(66,77)], '#bcebe9')
    s.l([(70,77),(73,77)], cyan)
    s.r((64,72,67,75), SKIN)
    s.face('#7389ad')
    # Deliberately jagged, short hair rather than the long-hair template.
    s.p([(28,35),(25,28),(29,19),(34,16),(37,12),(47,14),
         (52,11),(61,16),(65,17),(70,24),(68,35),(64,40),
         (61,34),(57,33),(54,29),(50,36),(45,33),(41,37),
         (38,33),(33,37),(31,43),(28,41)], hair)
    s.p([(28,28),(30,21),(36,18),(39,16),(47,17),(43,20),(34,23),(31,29)], hl, None)
    s.l([(51,15),(56,17),(60,17),(64,22)], '#514d63')
    s.l([(32,25),(31,33)], hs)
    s.l([(45,21),(43,27),(40,31)], '#514d63')
    s.l([(57,22),(58,28),(61,31)], hs)
    # Thin lens frames: eye color remains visible through the glass.
    for x in (34,51):
        s.l([(x,36),(x+10,36),(x+10,45),(x+1,45),(x,36)], '#8795b2')
        s.l([(x+1,37),(x+1,43)], '#c0d7e7')
        s.r((x+6,37,x+7,38), '#eefaf3')
    s.l([(44,39),(50,39)], '#94a9c4')
    s.l([(31,38),(34,39)], '#697692')
    s.l([(61,39),(65,37)], '#697692')
    # Cushioned headset with cyan seam and a small microphone.
    s.l([(26,32),(27,24),(31,17),(38,12),(53,11),(62,15),(68,23),(69,34)], INK, 4)
    s.l([(27,28),(29,22),(33,16),(40,13),(53,13),(61,17),(66,23)], '#737383')
    s.p([(24,31),(29,29),(32,33),(32,44),(29,49),(24,46),(23,40)], '#303545')
    s.p([(25,33),(28,32),(29,35),(29,43),(27,45),(25,43)], '#596274', '#484b62')
    s.l([(25,35),(25,42)], cyan)
    s.p([(65,32),(69,31),(72,35),(72,44),(69,48),(65,45)], '#303545')
    s.l([(69,35),(70,41)], '#55bccf', 2)
    s.l([(68,46),(64,49),(56,50)], '#687a8d', 2)
    s.r((53,48,57,50), '#3294aa', INK)
    s.r((54,48,55,48), '#b3e9eb')
    return s.im


def x0():
    s=Pixel()
    h='#71505e'; hs='#422d42'; hl='#b28291'
    purple='#564061'; pd='#34283f'; pl='#947493'
    pink='#ed84ae'; cream='#fff0e8'
    # Long hair pools behind the skirt, with native one-pixel strands.
    s.p([(34,19),(27,26),(25,42),(28,54),(23,66),(26,77),
         (21,87),(26,94),(36,90),(43,84),(57,86),(67,94),
         (75,90),(71,79),(75,70),(71,53),(70,31),(62,21)], h)
    s.p([(28,38),(30,52),(27,65),(31,77),(25,88),(31,90),
         (37,80),(35,57),(34,40)], hs, None)
    s.p([(63,36),(66,51),(65,61),(69,77),(67,88),(72,90),
         (70,77),(72,67),(69,52)], '#56374d', None)
    s.l([(30,33),(29,45),(32,57),(29,70),(31,81),(28,86)], hl)
    s.l([(65,33),(65,46),(68,57),(66,68),(69,79),(69,86)], hl)
    s.legs('#936d87', '#c2a1b4', '#51354f')
    # Polished Mary Janes and small ankle frills.
    for x in (38,52):
        s.r((x+1,95,x+6,97), '#d4b3c3')
        s.r((x+1,98,x+6,99), '#3e293f')
        s.r((x+3,98,x+4,99), '#edb6d1')
    s.p([(36,54),(42,53),(48,56),(55,53),(61,55),(62,66),
         (58,73),(38,73),(33,65)], cream)
    s.p([(36,56),(39,60),(38,69),(35,66)], '#cfb6c9', None)
    s.l([(54,57),(57,62),(56,69)], '#fefaf1')
    # Structured skirt with ribbon waist and three broad pleats.
    s.p([(37,69),(59,69),(63,80),(69,91),(61,94),(35,94),
         (28,91),(34,79)], purple)
    s.p([(36,74),(40,73),(37,90),(32,91)], pd, None)
    s.p([(47,73),(50,73),(52,93),(45,93)], '#735875', None)
    s.p([(57,74),(60,80),(64,91),(59,92)], '#735875', None)
    s.l([(42,75),(40,88),(40,91)], pl)
    s.l([(53,75),(55,87),(57,91)], '#b48aab')
    s.l([(31,91),(36,92),(60,92),(66,90)], '#c6a4bc')
    s.r((37,69,59,72), pd, INK)
    s.r((45,70,51,71), '#e6b6ce')
    s.bow(48,60,pink,'#af507b','#ffc3db')
    # Puff sleeves, cuffs, palette and brush are separate outlined silhouettes.
    s.p([(34,55),(29,56),(26,62),(28,68),(34,68),(38,61)], cream)
    s.l([(29,58),(28,62),(30,65)], '#d8bfd1')
    s.p([(29,68),(34,68),(33,76),(30,79),(27,76)], SKIN)
    s.r((28,67,34,69), '#e7d3e0', INK)
    s.p([(62,55),(67,58),(69,64),(67,69),(61,67),(59,61)], cream)
    s.l([(65,59),(67,64),(65,66)], '#d8bfd1')
    s.p([(63,69),(68,69),(70,74),(67,78),(63,76)], SKIN)
    s.p([(23,74),(28,71),(34,72),(39,77),(36,83),(28,84),
         (21,81),(20,77)], '#d7af7e', '#6e4f58')
    s.r((25,76,27,78), '#fff0ce')
    s.r((29,74,31,76), '#e57ba7')
    s.r((33,77,35,79), '#6ec2d7')
    s.r((28,80,30,81), '#9075c4')
    s.r((23,78,25,80), SKIN)
    s.l([(70,84),(73,52)], '#8e5c4f', 3)
    s.l([(70,83),(73,53)], '#d8b783')
    s.p([(71,52),(72,46),(75,43),(77,48),(75,54)], '#8c6da5')
    s.l([(73,47),(74,45),(75,49)], '#ef93bf')
    s.r((71,53,75,55), '#e5cca1', INK)
    s.r((67,71,72,74), SKIN, INK)
    s.face('#a485ca')
    s.cap(h,hs,hl,'part')
    s.bow(65,23,pink,'#af507b','#ffc3db')
    s.p([(64,25),(67,26),(70,39),(66,36),(64,30)], '#d86d9e')
    s.l([(67,29),(68,34)], '#ffc3db')
    # Tiny pearl on the bow knot and a restrained hair glint.
    s.r((65,22,66,23), '#fff4e9')
    s.l([(35,21),(40,19)], '#cf9dac')
    return s.im


def f1():
    s=Pixel()
    h='#fff2f7'; hs='#c8a9ce'; hm='#eacde3'; hl='#fffdf2'
    pink='#f4b4d3'; pd='#c77eac'; pl='#ffe4ef'; accent='#ee77aa'
    # Curved white tail remains outside the dress, on the rear side.
    s.p([(35,78),(27,83),(20,82),(14,77),(12,69),(13,61),
         (17,55),(22,54),(23,58),(20,64),(20,70),(24,74),
         (31,73)], h, '#867098')
    s.l([(16,73),(17,78),(22,80),(27,79)], hs, 2)
    s.l([(16,66),(17,61),(20,57)], hl)
    s.p([(16,55),(21,53),(24,56),(22,60),(17,60)], hm, '#9d7ca9')
    s.r((18,54,20,55), hl)
    s.legs(h,hl,'#c8659a',True)
    for x in (38,52):
        s.r((x+1,99,x+6,100), '#e688b4')
        s.r((x+2,98,x+5,98), '#ffd8e9')
    s.p([(36,54),(43,52),(48,55),(54,52),(61,55),(63,66),
         (58,74),(37,74),(33,65)], pink)
    s.p([(35,58),(40,61),(39,69),(35,68)], pd, None)
    s.l([(55,57),(59,62),(58,68)], pl)
    s.p([(39,53),(44,53),(48,58),(52,53),(57,54),(52,61),(44,61)], h)
    # Apron-like skirt with broad folds and one-pixel lace points.
    s.p([(37,69),(59,69),(64,81),(69,92),(61,95),(34,95),
         (28,91),(34,80)], pink)
    s.p([(35,75),(40,73),(37,91),(32,92)], pd, None)
    s.p([(46,73),(50,73),(52,93),(44,93)], '#f9cadd', None)
    s.p([(56,74),(61,83),(64,92),(59,93)], '#df95bf', None)
    s.l([(41,76),(39,88)], pl)
    s.l([(54,76),(56,89)], pl)
    s.l([(30,91),(35,93),(61,93),(67,91)], '#fff2f6', 2)
    for x,y in ((33,94),(39,95),(45,95),(51,95),(57,95),(63,94)):
        s.r((x,y,x+1,y+1), h)
    s.r((37,69,59,72), accent, '#ae568e')
    s.bow(60,71,'#f79dc4','#bf5d94','#ffe0ed')
    # Bell collar, readable at native resolution.
    s.l([(41,55),(47,60),(54,55)], '#bf5d94', 2)
    s.p([(46,60),(50,60),(52,63),(51,67),(46,68),(43,65)], '#e7bd74', '#8f6d64')
    s.l([(46,62),(48,61),(50,63)], '#ffe1a0')
    s.r((47,65,49,65), '#8c6a61')
    # Short sleeves; raised paw shows its pink pads.
    s.p([(35,56),(30,57),(27,63),(29,68),(35,68),(38,61)], pl)
    s.l([(28,64),(33,65)], '#c18cb5')
    s.p([(29,68),(34,68),(34,76),(30,79),(27,75)], h)
    s.p([(28,75),(31,74),(34,75),(35,79),(33,83),(28,82),(26,79)], hl)
    s.r((29,78,32,80), '#f1a8ca')
    s.p([(61,56),(66,57),(69,61),(66,67),(61,65),(59,61)], pl)
    s.l([(64,64),(68,61)], pd)
    s.p([(65,62),(67,59),(70,59),(73,63),(73,67),(69,71),(64,68)], h)
    s.p([(66,56),(66,53),(68,51),(70,52),(71,56),(74,54),
         (77,56),(77,60),(79,61),(78,66),(74,69),(68,67),(64,62)], hl, '#9d7ca9')
    s.r((68,55,69,57), '#f0a1c7')
    s.r((73,57,75,59), '#f0a1c7')
    s.r((74,62,76,64), '#f0a1c7')
    s.p([(68,60),(70,59),(73,62),(72,65),(69,65),(67,63)], '#ed8eba', None)
    # Ears are drawn behind the cap, with a sliver of dark rim and pink interior.
    s.p([(29,23),(26,6),(28,4),(39,15),(43,23)], h, '#9d7ca9')
    s.p([(56,21),(66,4),(69,5),(68,25)], h, '#9d7ca9')
    s.p([(30,12),(31,21),(37,19)], '#f5b0d3', None)
    s.p([(64,12),(60,20),(66,21)], '#f5b0d3', None)
    s.l([(28,7),(29,13)], hl)
    s.l([(66,7),(65,10)], hl)
    s.face('#d76b9f', True)
    s.cap(h,hs,hl)
    # Bobbed hair / side tufts, rather than the guests' long-hair silhouette.
    s.p([(28,30),(31,31),(32,44),(35,48),(31,53),(27,49),(26,40)], h, '#9d7ca9')
    s.l([(28,38),(28,45),(31,49)], hm)
    s.p([(64,30),(67,30),(69,39),(68,47),(64,52),(60,49),(63,44)], h, '#9d7ca9')
    s.l([(66,36),(67,43),(64,48)], hs)
    s.l([(34,22),(39,18),(44,17)], hl)
    return s.im


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original-dir', type=Path, default=ORIGINAL,
                        help='Optional original AI PIXEL PARTY output directory')
    parser.add_argument('--review-dir', type=Path, default=None,
                        help='Write integer-scaled review contact sheets here')
    args=parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    originals=args.original_dir
    if originals.exists():
        for ident in IDS:
            source=originals/'sprites'/(ident+'-96.png')
            if source.exists():
                shutil.copyfile(source,OUT/(ident+'.png'))
        poster=originals/'ai-pixel-party.png'
        if poster.exists():
            shutil.copyfile(poster,OUT.parent/'ai-pixel-party-original.png')
    # Existing archived originals remain valid when the optional source folder
    # is absent, so this script can be rerun from the repository alone.
    missing=[ident for ident in IDS if not (OUT/(ident+'.png')).exists()]
    if missing:
        raise SystemExit('Missing archived original portraits: '+', '.join(missing))
    for ident,draw in [('C0',c0),('X0',x0),('Feline1',f1)]:
        draw().save(OUT/(ident+'.png'), optimize=True)
    metadata={}
    for ident in ('C0','X0','Feline1')+IDS:
        path=OUT/(ident+'.png')
        with Image.open(path) as im:
            assert im.size==(96,112), (ident,im.size)
            assert im.mode=='RGBA', (ident,im.mode)
            metadata[ident]={'width':96,'height':112,'sha256':checksum(path)}
    (OUT/'manifest.json').write_text(json.dumps(metadata,indent=2)+'\n')
    if args.review_dir:
        args.review_dir.mkdir(parents=True,exist_ok=True)
        try: font=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',15)
        except OSError: font=ImageFont.load_default()
        def contact(ids,columns,name):
            cw,ch=220,285
            review=Image.new('RGB',(columns*cw,((len(ids)+columns-1)//columns)*ch),'#1b2235')
            d=ImageDraw.Draw(review)
            for index,ident in enumerate(ids):
                x=(index%columns)*cw;y=(index//columns)*ch
                d.rectangle((x+5,y+5,x+cw-6,y+ch-6),fill='#242c42',outline='#515b78')
                d.text((x+15,y+15),ident,fill='#e8e1ef',font=font)
                im=Image.open(OUT/(ident+'.png'))
                large=im.resize((192,224),Image.Resampling.NEAREST)
                review.paste(large,(x+14,y+46),large)
            review.save(args.review_dir/name)
        contact(('C0','X0','Feline1'),3,'studio-founders.png')
        contact(('C0','X0','Feline1')+IDS,5,'all-ten-portraits.png')
    print('Built 3 native portraits; preserved 7 originals and poster.')


if __name__=='__main__':
    main()
