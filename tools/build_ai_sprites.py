"""Animated AI studio guests — integer-grid art and independently redrawn limbs.

Run: python3 tools/build_ai_sprites.py
Requires Pillow for authoring only. No image generation or source images.
Credits and reference links: media/ai-studio/README.md.
"""
from pathlib import Path
import json
import zipfile
from PIL import Image, ImageDraw, ImageFont

STATE = 'idle'
PHASE = 0
CHARACTER = 'gpt'

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'media' / 'ai-studio'
OUT.mkdir(parents=True, exist_ok=True)
INK = '#28283f'
SKIN = '#ffe0ce'
SHADE = '#e8a9a3'
WHITE = '#fff9ed'
META = [
    ('gpt', 'GPT', '白发龙娘', '#94cbb9', 'DRAGON / WHITE'),
    ('deepseek', 'DeepSeek', '鲸鱼女仆', '#7aaff0', 'WHALE / OCEAN'),
    ('claude', 'Claude', '橙发书卷娘', '#e9a16f', 'SUN / STORY'),
    ('grok', 'Grok', '哥特双马尾', '#dba0ba', 'GOTHIC / X'),
    ('gemini', 'Gemini', '星光猫娘', '#b7a0ef', 'CAT / STARDUST'),
    ('kimi', 'Kimi', '月夜女仆', '#a9b7eb', 'MOON / MIDNIGHT'),
    ('doubao', 'Doubao', '短发豆包', '#b6d8e8', 'BOB / EVERYDAY'),
]


class Sprite:
    def __init__(self):
        self.im = Image.new('RGBA', (96, 112))
        self.d = ImageDraw.Draw(self.im)
        self.state, self.phase, self.character = STATE, PHASE, CHARACTER

    def p(self, pts, fill, outline=INK, width=1):
        self.d.polygon(pts, fill=fill)
        if outline:
            self.d.line(pts + [pts[0]], fill=outline, width=width)

    def r(self, box, fill, outline=None):
        self.d.rectangle(box, fill=fill, outline=outline)

    def l(self, pts, fill, width=1):
        self.d.line(pts, fill=fill, width=width)

    def star(self, x, y, c, size=4):
        self.p([(x,y-size),(x+1,y-1),(x+size,y),(x+1,y+1),
                (x,y+size),(x-1,y+1),(x-size,y),(x-1,y-1)], c)

    def face(self, eyes=('#71689f', '#71689f'), mood='smile', warm=False):
        self.r((43,49,53,57),SKIN,INK)
        self.r((43,50,53,53),SHADE)
        self.p([(30,36),(34,35),(35,45),(31,45),(29,41)],SKIN)
        self.p([(62,35),(66,36),(67,41),(65,45),(61,45)],SKIN)
        self.p([(34,27),(60,27),(64,33),(64,43),(61,49),
                (55,52),(42,52),(35,49),(31,43),(31,33)],SKIN)
        self.l([(32,39),(33,44),(37,49),(43,51),(54,51),(59,49)],'#f0b9ad')
        self.r((39,32,56,38),'#ffe9d7')
        for i,(x,c) in enumerate(zip((36,53),eyes)):
            self.l([(x-1,38),(x+1,37),(x+5,37),(x+6,38)],INK)
            self.r((x,38,x+5,43),WHITE)
            self.r((x+1,38,x+4,43),c)
            self.r((x+2,38,x+3,40),INK)
            self.r((x+1,38,x+2,39),WHITE)
            self.r((x+3,42,x+4,43),'#d8e9f6')
            self.l([(x,44),(x+4,44)],'#bc827f')
            self.l([(x,34),(x+4,34)], '#8b6e75' if not warm else '#906749')
        self.r((34,45,38,46),'#f0a3a5')
        self.r((58,45,62,46),'#f0a3a5')
        if mood=='open':
            self.p([(45,47),(50,47),(49,50),(46,50)],'#934b65',outline=None)
            self.r((46,49,49,49),'#f4a4ac')
        elif mood=='cat':
            self.l([(44,48),(46,49),(48,47),(50,49),(52,48)],'#a96976')
        elif mood=='quiet':
            self.l([(46,48),(49,48)],'#ac717b')
        else:
            self.l([(45,48),(47,49),(49,49),(51,48)],'#a96976')

    def long_hair(self, base, shadow, light, twin=False):
        if twin:
            for flip in (False,True):
                pts=[(31,23),(23,25),(20,34),(22,44),(17,53),(21,63),
                     (15,74),(22,78),(30,72),(33,61),(29,51),(34,37)]
                if flip: pts=[(96-x,y) for x,y in pts]
                self.p(pts,base)
                self.l([(96-x if flip else x,y) for x,y in [(24,33),(26,43),(22,55),(26,65),(22,73)]],light)
        else:
            self.p([(34,19),(26,26),(25,42),(28,53),(24,62),(25,73),
                    (22,79),(28,83),(36,77),(43,73),(58,75),(65,81),
                    (73,78),(70,69),(73,61),(69,48),(69,31),(62,21)],base)
            self.p([(28,36),(30,51),(28,62),(30,74),(26,78),(34,75),(37,62),(34,40)],shadow,None)
            self.p([(63,34),(66,48),(65,58),(68,69),(66,77),(71,75),(69,61),(70,53)],shadow,None)
            self.l([(30,32),(29,43),(32,53),(29,65),(31,73)],light)
            self.l([(65,32),(65,44),(68,55),(66,64)],light)

    def cap(self, base, shade, light, bangs='swoop'):
        self.p([(29,37),(27,30),(29,22),(34,17),(42,14),(55,14),
                (63,18),(68,24),(69,32),(66,40),(62,35),(60,28),
                (53,27),(45,26),(38,29),(34,37)],base)
        self.p([(29,29),(31,23),(35,19),(43,16),(54,16),(60,19),(42,18),(35,23),(32,30)],light,None)
        if bangs=='part':
            self.p([(46,18),(41,23),(38,30),(33,36),(38,37),(44,32),(48,25),(51,32),(58,36),(65,35),(62,27),(56,20)],base)
            self.l([(49,19),(50,26),(54,31),(60,33)],light)
        elif bangs=='blunt':
            self.p([(34,23),(60,23),(64,33),(60,36),(56,35),(53,37),(49,35),(45,37),(41,34),(35,36),(32,33)],base)
            self.l([(36,25),(36,31)],light)
            self.l([(42,23),(43,31)],light)
            self.l([(53,23),(55,32)],light)
        else:
            self.p([(36,22),(54,18),(61,24),(64,33),(59,36),(54,33),(51,28),
                    (48,35),(43,39),(43,32),(39,35),(34,36),(31,33)],base)
            self.l([(52,22),(50,28),(46,33)],light)
            self.l([(38,23),(36,29),(35,32)],light)
        self.p([(29,31),(33,30),(33,44),(36,51),(31,49),(28,42)],base)
        self.p([(63,31),(66,32),(67,43),(64,49),(60,50),(63,42)],base)
        self.l([(29,36),(30,43),(32,46)],shade)
        self.l([(65,35),(65,42),(63,46)],shade)

    def legs(self, color=SKIN, shoes='#494360', tall=False):
        for x in (38,52):
            self.r((x,82,x+7,99),color,INK)
            self.r((x+1,83,x+2,96),'#fff2df' if color==SKIN else '#e6e2f4')
            self.p([(x,97),(x+7,97),(x+8,101),(x+7,103),(x-2,103),(x-2,100)],shoes)
            self.r((x,99,x+5,99),'#d8c9df')

    def bow(self,x,y,c):
        self.p([(x,y),(x-5,y-3),(x-5,y+3),(x,y+1),(x+5,y+3),(x+5,y-3)],c)
        self.r((x-1,y-1,x+1,y+1),WHITE,INK)


def gpt():
    s=Sprite(); h='#e9e6f5'; hs='#b0a7cd'; hl='#fffaf8'
    # Curled, segmented dragon tail.
    s.p([(62,73),(70,70),(75,61),(76,55),(81,60),(83,71),(79,82),(72,88),(61,90),(55,87),(62,83),(70,81),(74,75)],h)
    s.l([(80,64),(79,73),(75,80),(68,85),(60,86)],hs,2)
    for x,y in [(78,67),(77,73),(73,79),(66,83)]:s.l([(x-1,y),(x+2,y+2)],'#8c85aa')
    # Scalloped dragon wings, behind the hair and arms.
    for flip in (False,True):
        pts=[(35,48),(24,43),(15,40),(10,33),(9,46),(5,61),(15,55),(19,62),(26,56),(31,64),(37,58)]
        if flip:pts=[(96-x,y) for x,y in pts]
        s.p(pts,'#c9bddf')
        s.l([(96-x if flip else x,y) for x,y in [(33,53),(16,45),(10,51)]],hs)
        s.l([(96-x if flip else x,y) for x,y in [(16,45),(19,58)]],hs)
    s.long_hair(h,hs,hl)
    s.legs('#eee7f4','#a99dc5')
    # White ceremonial gown with a mint jewel and a front split.
    s.p([(37,53),(43,51),(48,55),(54,51),(60,54),(60,66),(65,78),(71,93),
         (62,96),(53,92),(48,84),(44,94),(32,97),(24,92),(32,75),(36,65)],'#faf6f0')
    s.p([(36,62),(41,68),(36,83),(33,92),(28,93),(34,77)],'#d3c9e2',None)
    s.p([(57,61),(54,69),(57,80),(65,93),(69,92),(62,76)],'#d3c9e2',None)
    s.l([(46,66),(42,78),(40,88)],'#ddd6ea')
    s.l([(52,66),(54,76),(59,90)],'#ddd6ea')
    for x in (32,39,59,66):s.r((x,92,x+2,93),hl)
    s.arms()
    s.p([(43,55),(48,58),(53,55),(51,63),(44,63)],'#c7bdda')
    s.star(48,62,'#87c8b6',3)
    s.face(('#9790c4','#9790c4'),'quiet')
    s.cap(h,hs,hl)
    # Swept back dragon horns.
    s.p([(32,22),(29,17),(31,11),(30,6),(34,9),(36,16),(36,20)],'#f0edf8')
    s.p([(60,20),(61,14),(65,9),(65,4),(69,8),(68,15),(65,21)],'#f0edf8')
    s.l([(31,12),(34,14)],hs);s.l([(63,13),(66,15)],hs)
    # Knot-shaped pale rosettes, simplified to readable pixels.
    for x,y in [(63,28),(32,62),(62,86)]:
        s.p([(x-2,y-2),(x+1,y-3),(x+3,y),(x+1,y+3),(x-2,y+2),(x-3,y)],hl,hs)
        s.r((x,y,x+1,y+1),hs)
    return s.im


def deepseek():
    s=Sprite(); h='#4568b2'; hs='#304980'; hl='#7299db'
    # Big whale fluke and curved tail, visible to the right.
    s.p([(61,77),(68,78),(75,74),(78,66),(79,61),(82,58),(86,60),
         (87,70),(83,80),(75,87),(63,88)],'#527cc4')
    s.p([(76,79),(81,71),(82,65),(85,62),(86,67),(86,74),(81,82),(73,86),(65,86)],'#84b8eb',None)
    # Broad, visibly forked whale flukes, distinct from Gemini's cat tail.
    s.p([(81,65),(80,58),(76,57),(72,53),(71,47),(76,48),(81,51),(84,55),
         (87,51),(92,48),(94,47),(94,52),(91,56),(87,59),(85,65)],'#527cc4')
    s.l([(74,50),(77,54),(82,57),(83,62)],'#a7d2ed')
    s.l([(87,56),(91,52)],'#8fbee6')
    s.long_hair(h,hs,hl)
    s.legs('#f9f7f0','#2d3c65')
    s.p([(35,55),(42,52),(54,52),(61,55),(61,66),(66,74),(72,83),
         (66,87),(29,87),(24,83),(31,71),(35,65)],'#354f88')
    s.p([(39,61),(56,61),(57,69),(64,82),(59,85),(36,85),(31,82),(39,68)],'#f6f5ef')
    s.p([(43,63),(45,67),(42,81),(38,83),(40,72)],'#d3e0ef',None)
    s.p([(54,66),(60,81),(56,83),(52,72)],'#d3e0ef',None)
    for x in range(26,69,6):s.r((x,84,x+3,87),WHITE,INK)
    s.arms()
    s.bow(48,56,'#789fd6');s.star(48,57,'#e9bf72',2)
    for y in (65,69):s.r((47,y,48,y+1),'#416196')
    # A tiny whale on the apron.
    s.p([(43,75),(45,73),(50,73),(53,75),(55,73),(55,77),(52,79),(45,79),(42,77)],'#6596d3',None)
    s.r((45,75,45,75),INK)
    s.face(('#548fcd','#548fcd'),'open')
    s.cap(h,hs,hl)
    # White ruffled maid headband.
    for x,y in [(27,26),(29,21),(33,17),(38,14),(44,12),(50,12),(56,14),(62,17),(66,22)]:
        s.p([(x-2,y),(x-2,y-4),(x+1,y-5),(x+4,y-3),(x+4,y+1)],WHITE)
    s.l([(28,27),(31,21),(37,17),(45,15),(53,15),(61,19),(66,26)],'#b5c9e5',2)
    # Whale-like ear fins and a wayward tuft.
    s.p([(29,39),(26,43),(20,45),(23,48),(30,47)],h)
    s.p([(66,39),(71,44),(77,45),(73,49),(65,47)],h)
    s.p([(46,14),(43,7),(35,5),(31,6),(36,2),(43,3),(48,8),(49,14)],h)
    s.bow(68,33,'#80b6e5')
    return s.im


def claude():
    s=Sprite(); h='#d78b53'; hs='#9c5342'; hl='#f6bf79'
    s.long_hair(h,hs,hl)
    # Extra long copper locks curl around the skirt.
    s.p([(28,48),(22,61),(22,74),(17,80),(22,84),(29,80),(33,67)],h)
    s.l([(26,59),(25,73),(21,79),(24,79)],hl)
    s.p([(66,46),(74,61),(73,77),(78,82),(74,87),(68,83),(65,70)],h)
    s.l([(70,60),(70,75),(74,82)],hl)
    s.legs('#f4e7d4','#754c43')
    s.p([(37,54),(44,52),(54,53),(61,56),(59,68),(65,80),(71,94),
         (65,97),(30,97),(24,94),(31,76),(36,66)],'#fcf0dd')
    s.p([(36,65),(41,67),(34,89),(33,95),(26,93),(31,78)],'#35323e')
    s.p([(55,65),(59,66),(63,78),(68,93),(57,94),(52,75)],'#d28248')
    s.p([(40,69),(44,68),(41,90),(38,94),(35,93)],'#e4ccb3',None)
    s.l([(48,69),(47,93)],'#d2baa5')
    s.l([(51,74),(54,91)],'#e0c8ae')
    s.r((36,61,58,67),'#35323e',INK)
    s.r((46,62,50,65),'#d3a56b',INK)
    s.l([(26,92),(33,94),(62,94),(69,92)],'#b77e55')
    for x in (29,36,58,65):s.r((x,91,x+1,92),'#c69a65')
    # White poet sleeves and a brown book held to the chest.
    s.arms()
    s.bow(48,55,'#39313d')
    s.face(('#9a6645','#9a6645'),'smile',True)
    s.cap(h,hs,hl,'part')
    # Sunburst flower hairpiece.
    for dx,dy in [(0,-5),(3,-4),(5,0),(4,3),(0,5),(-4,3),(-5,0),(-3,-4)]:
        s.r((64+dx-1,23+dy-1,64+dx+1,23+dy+1),'#e5ac69',hs)
    s.r((62,21,66,25),'#f5d49c',hs)
    s.p([(64,28),(64,37),(67,34),(69,38),(69,28)],'#322b36')
    return s.im


def grok():
    s=Sprite(); h='#e2b77b'; hs='#ae795f'; hl='#ffe0a0'
    s.long_hair(h,hs,hl,True)
    # Little bat wings on the twin-tail ribbons.
    for flip in (False,True):
        pts=[(29,25),(24,17),(18,15),(18,22),(12,21),(15,29),(22,27),(27,31)]
        if flip:pts=[(96-x,y) for x,y in pts]
        s.p(pts,'#39313e')
    s.legs('#594052','#312c3c')
    s.p([(36,54),(43,53),(48,58),(54,53),(60,55),(59,67),(64,77),(73,89),
         (64,94),(55,90),(50,84),(42,93),(30,91),(24,87),(33,73),(36,65)],'#342f40')
    s.p([(39,69),(44,71),(37,86),(32,88),(29,86)],'#624451',None)
    s.p([(53,69),(58,70),(66,86),(63,90),(56,86)],'#6a263f')
    s.p([(56,82),(63,87),(69,88),(64,92),(59,90)],'#b35266')
    s.l([(38,71),(36,78),(31,86)],'#d0a370')
    s.l([(56,71),(59,78),(65,85)],'#d0a370')
    s.r((39,61,57,67),'#211f2e',INK)
    for y in (61,65):s.l([(43,y),(52,y+3)],'#c09b69')
    s.arms()
    s.bow(48,54,'#b65b70')
    s.face(('#5795bc','#5795bc'),'open')
    s.cap(h,hs,hl,'part')
    s.bow(26,28,'#322c3c');s.bow(69,28,'#322c3c')
    # Signature X-bladed poleaxe, raised beside the character.
    if s.state != 'work':
        s.r((14,31,17,100),'#49383d',INK)
        s.r((16,35,16,98),'#b88a62')
        s.p([(15,10),(9,6),(7,15),(3,20),(4,29),(10,36),(7,42),(14,38),
             (17,30),(23,37),(29,40),(27,33),(30,26),(30,18),(25,11),(23,5),(20,13),(16,18)],'#332d3d')
        s.l([(8,13),(8,21),(23,35)],'#c4a47f',2)
        s.l([(25,13),(25,21),(10,35)],'#c4a47f',2)
        s.l([(9,17),(23,31)],'#e5c99a')
        s.l([(24,17),(10,31)],'#e5c99a')
        s.r((13,69,18,73),SKIN,INK)
    return s.im


def gemini():
    s=Sprite(); h='#787bda'; hs='#514a96'; hl='#a1b8f1'
    # Long gradient hair, tufted cat tail and a coat with floating panels.
    s.p([(64,80),(71,84),(79,82),(81,75),(78,70),(75,68),(77,64),(82,65),
         (87,72),(87,81),(81,89),(72,91),(63,88)],'#8e73d3')
    s.p([(79,70),(83,73),(84,79),(81,83),(78,83),(80,77)],'#bda1ed',None)
    s.long_hair(h,hs,hl)
    s.p([(27,57),(24,68),(26,80),(23,85),(30,87),(37,79),(36,67)],'#a47de0')
    s.p([(65,54),(70,63),(69,76),(75,81),(71,85),(62,78),(61,64)],'#ac84e2')
    s.l([(27,66),(29,76),(28,82)],'#d5b2f2')
    s.l([(67,65),(66,73),(70,79)],'#d5b2f2')
    s.legs(SKIN,'#685ba2')
    s.p([(37,54),(44,53),(48,57),(54,52),(60,56),(58,66),(53,70),(43,69),(37,64)],'#403969')
    s.p([(39,64),(44,65),(53,64),(56,68),(53,73),(42,73),(39,70)],SKIN)
    s.p([(40,72),(56,71),(61,78),(65,82),(57,84),(51,82),(44,85),(34,82)],'#554c91')
    s.l([(35,81),(42,83),(51,80),(59,82),(63,81)],'#dfc5f2',2)
    s.arms()
    s.l([(35,58),(40,68),(32,81)],'#c6a8ef')
    s.l([(59,58),(56,66),(63,78)],'#c6a8ef')
    s.star(48,58,'#b9dce9',3)
    s.star(49,74,'#d9c18f',2)
    s.face(('#4e9ec1','#d2a657'),'cat')
    s.cap(h,hs,hl)
    # Cat ears with lilac interiors.
    s.p([(29,25),(27,10),(32,13),(39,19)],h)
    s.p([(58,18),(65,8),(68,26)],h)
    s.p([(29,14),(30,21),(34,19)],'#eeb6d3',None)
    s.p([(64,13),(61,19),(66,22)],'#eeb6d3',None)
    s.star(65,28,'#d1b0ef',4)
    return s.im


def kimi():
    s=Sprite(); h='#e0dfed'; hs='#a6a6cf'; hl='#fff8f9'
    s.long_hair(h,hs,hl)
    s.p([(28,43),(24,54),(26,65),(22,74),(26,83),(33,79),(36,66),(32,56)],h)
    s.p([(66,44),(72,56),(70,67),(75,75),(70,84),(63,79),(61,64)],h)
    s.l([(27,54),(29,64),(25,74),(28,79)],hl)
    s.l([(69,56),(67,66),(71,75)],hl)
    s.legs('#f1edf6','#343b62')
    s.p([(35,55),(42,52),(55,53),(62,56),(59,69),(65,82),(69,94),
         (62,97),(53,95),(47,91),(41,97),(29,95),(25,92),(32,76),(36,66)],'#353b6a')
    s.p([(40,64),(54,64),(57,78),(61,93),(53,94),(48,90),(43,94),(34,93),(39,75)],'#e7e1f1')
    for x in (40,45,51,56):s.l([(x,75),(x-2 if x<48 else x+2,92)],'#bdb8d8')
    s.p([(35,64),(41,68),(36,81),(32,90),(29,90),(33,76)],'#59628c')
    s.p([(57,65),(62,68),(65,83),(67,91),(62,92),(58,80)],'#59628c')
    s.l([(29,91),(33,93),(41,94)],'#a1a7cc')
    s.l([(58,93),(65,94),(68,92)],'#a1a7cc')
    # Constellations embroidered on the cloak.
    for x,y in [(34,76),(31,86),(61,75),(64,86)]:
        s.r((x,y,x,y),'#e9e6ec');s.r((x+2,y+3,x+2,y+3),'#b9c7f0')
    s.arms()
    s.r((39,60,56,67),'#2a304f',INK)
    for y in (61,65):s.l([(42,y),(53,y)],'#9da6c3')
    s.bow(48,55,'#293454')
    # Small K charm, not a full product logo.
    s.r((58,76,63,83),'#242d50',INK)
    s.l([(59,78),(59,81)],'#d5d6ee')
    s.l([(62,78),(60,79),(62,81)],'#d5d6ee')
    s.face(('#7d98c2','#7d98c2'),'quiet')
    s.cap(h,hs,hl)
    for x,y in [(30,21),(34,17),(39,14),(45,13),(51,13),(57,15)]:
        s.r((x-1,y-3,x+2,y),WHITE,hs)
    s.l([(29,24),(34,19),(40,16),(49,15),(58,18)],'#b6b8d6')
    s.bow(66,24,'#303b6a')
    s.l([(66,28),(69,36)],'#d6c7a0')
    # Crescent moon accessory on the ribbon.
    s.p([(65,18),(62,20),(61,24),(63,27),(67,28),(70,26),(66,26),(64,23),(64,20)],'#e9d6a0')
    return s.im


def doubao():
    s=Sprite(); h='#514034'; hs='#332b2b'; hl='#82614b'
    # A simple brown bob, based on the actual official avatar.
    s.p([(32,19),(25,26),(24,39),(25,54),(29,58),(39,57),(58,57),
         (67,57),(70,52),(69,29),(62,19),(49,15)],h)
    s.p([(25,34),(27,49),(27,55),(32,56),(32,31)],hs,None)
    s.p([(64,28),(66,40),(65,55),(69,53),(68,32)],hs,None)
    s.legs(SKIN,'#f0e7da')
    s.p([(36,55),(42,53),(54,53),(60,56),(64,65),(59,70),(55,66),
         (56,78),(39,78),(39,66),(34,70),(29,65)],'#fff4e9')
    # Charcoal pinafore, white T-shirt, low shoes.
    s.p([(39,57),(42,57),(43,64),(53,64),(54,57),(57,57),(57,71),
         (62,86),(58,90),(36,90),(33,86),(38,71)],'#42434b')
    s.p([(39,74),(42,76),(40,86),(37,87),(36,85)],'#5f626b',None)
    s.l([(53,71),(56,85),(57,88)],'#696a74')
    s.r((43,68,53,75),'#535762',INK)
    s.r((47,69,48,70),'#e9d8b9')
    s.arms()
    s.face(('#72513f','#72513f'),'smile',True)
    # Off-centre part and a clean jaw-length cut; no maid accessories.
    s.p([(27,40),(26,30),(29,22),(36,17),(46,14),(54,15),(58,19),
         (63,18),(67,23),(69,30),(67,41),(63,39),(61,30),(55,24),
         (48,25),(39,30),(33,35),(32,52),(28,53)],h)
    s.p([(29,30),(32,24),(39,20),(48,17),(54,17),(46,20),(39,24),(33,30)],hl,None)
    s.l([(31,34),(30,43),(30,49)],'#6b503f')
    s.p([(62,31),(66,32),(67,51),(64,54),(61,53)],h)
    s.l([(64,36),(64,49)],hl)
    s.l([(36,34),(39,33),(41,34)],'#63483b')
    s.l([(54,34),(57,33),(60,35)],'#63483b')
    # Small everyday tote with an abstract blue chat bubble.
    if s.state != 'work':
        s.l([(35,66),(28,78),(28,83)],'#ceb798',2)
        s.p([(21,79),(31,79),(35,92),(20,92)],'#e8ceab')
        s.r((24,84,29,88),'#8bb8d1')
        s.r((25,89,26,89),'#8bb8d1')
    return s.im

# Animation rig. Limbs are redrawn per pose beneath dress hems and hair instead
# of sliding the completed PNG. Feet share a stable ground row (y=103).
LEG_COLORS = {
    'gpt': ('#eee7f4', '#a99dc5'),
    'deepseek': ('#f9f7f0', '#2d3c65'),
    'claude': ('#f4e7d4', '#754c43'),
    'grok': ('#594052', '#312c3c'),
    'gemini': (SKIN, '#685ba2'),
    'kimi': ('#f1edf6', '#343b62'),
    'doubao': (SKIN, '#f0e7da'),
}
SLEEVES = {
    'gpt': ('#f8f3f4', '#d3c9e2', True),
    'deepseek': ('#36558f', '#789fd6', True),
    'claude': ('#fff3df', '#ccb19e', True),
    'grok': ('#493746', '#70515c', False),
    'gemini': ('#555397', '#b6a1e6', True),
    'kimi': ('#32395e', '#a1a7cc', True),
    'doubao': ('#fff4e9', '#d5c7b7', False),
}


def animated_legs(self, color=SKIN, shoes='#494360', tall=False):
    color, shoes = LEG_COLORS[self.character]
    moving = self.state in ('walk', 'run')
    stride = ([-4, 0, 4, 0] if self.state == 'walk' else [-7, 0, 7, 0])[self.phase % 4] if moving else 0
    for i,hip in enumerate((42,56)):
        step = stride if i == 0 else -stride
        # Passing foot rises while the planted foot stays on the baseline.
        lift = (3 if self.state == 'run' else 2) if moving and ((self.phase + i * 2) % 4 == 1) else 0
        knee, foot = hip + round(step / 2), hip + step
        this_color = SKIN if self.character == 'grok' and i == 1 else color
        self.p([(hip-4,82),(hip+3,82),(knee+3,92-lift),
                (foot+3,99-lift),(foot-4,99-lift),(knee-4,92-lift)],this_color)
        self.l([(hip-2,85),(knee-2,92-lift),(foot-2,97-lift)],'#fff0dc' if this_color == SKIN else '#e6e2f4')
        if self.character == 'gemini':
            top = 89 if i == 0 else 94
            self.p([(knee-4,top-lift),(knee+3,top-lift),(foot+4,100-lift),(foot-5,100-lift)],'#f2edf7')
            self.l([(knee-1,top+2-lift),(foot-1,97-lift)],'#c2b9e0')
        if self.character == 'doubao':
            self.p([(knee-4,93-lift),(knee+3,93-lift),(foot+3,99-lift),(foot-4,99-lift)],'#fbf8ef')
        if self.character == 'deepseek':
            self.l([(hip-3,88),(hip+2,88)],'#49699c',2)
        self.p([(foot-4,97-lift),(foot+3,97-lift),(foot+5,101-lift),
                (foot+3,103-lift),(foot-6,103-lift),(foot-6,100-lift)],shoes)
        self.r((foot-3,99-lift,foot+2,99-lift),'#d8c9df')
        if self.character == 'doubao':
            self.l([(foot-5,102-lift),(foot+3,102-lift)],WHITE)


def animated_arms(self):
    state,phase = self.state,self.phase
    col,shade,long = SLEEVES[self.character]
    moving = state in ('walk','run')
    swing = ([-3,0,3,0] if state == 'walk' else [-6,0,6,0])[phase%4] if moving else 0
    for i,shoulder in enumerate((35,60)):
        side = -1 if i == 0 else 1
        if state == 'work':
            elbow = (shoulder + side * 5,65)
            hand = (42 if i == 0 else 54,70 + ((phase+i)%2)*2)
        elif state == 'wave' and i == 1:
            elbow = (70,59)
            hand = (74+phase*3,48-phase*2)
        elif state == 'run':
            elbow = (shoulder + side*6,65 + (swing if i == 0 else -swing)//2)
            hand = (shoulder - side*3,64 + (swing if i == 0 else -swing))
        else:
            elbow = (shoulder + side*4,65)
            hand = (shoulder + side*5 + (swing if i == 0 else -swing),75 + (1 if state == 'idle' and phase == 1 else 0))
        ex,ey=elbow;hx,hy=hand
        # Upper arm and sleeve, with a narrow shaded seam.
        self.p([(shoulder-3,55),(shoulder+3,55),(ex+3,ey),
                (ex+2,ey+3),(ex-3,ey+3),(shoulder-5,60)],col)
        self.l([(shoulder+side*2,59),(ex+side*2,ey)],shade)
        if self.character == 'deepseek':
            self.p([(shoulder-3,55),(shoulder+3,55),(shoulder+side*4+3,60),
                    (shoulder+side*4+2,64),(shoulder+side*4-3,64),(shoulder-5,60)],WHITE)
        if long:
            self.p([(ex-3,ey-2),(ex+3,ey-2),(hx+3,hy-3),(hx+1,hy+1),
                    (hx-4,hy),(ex-4,ey+2)],col)
            self.l([(ex+side*2,ey),(hx+side*2,hy-3)],shade)
            if self.character in ('kimi','deepseek'):
                self.p([(hx-4,hy-4),(hx+3,hy-4),(hx+3,hy-1),(hx-4,hy-1)],WHITE)
        else:
            self.p([(ex-3,ey-1),(ex+2,ey-1),(hx+3,hy-2),
                    (hx+2,hy+2),(hx-3,hy+2)],SKIN)
        self.p([(hx-3,hy-2),(hx+1,hy-3),(hx+3,hy-1),(hx+3,hy+2),
                (hx,hy+4),(hx-3,hy+2)],SKIN)
        self.r((hx-2,hy,hx+1,hy+1),'#ffedda')
        if state=='wave' and i==1:
            # Raised fingers change angle, rather than simply moving an arm crop.
            self.l([(hx-2,hy-2),(hx-3,hy-6)],INK,2)
            self.l([(hx,hy-2),(hx,hy-7)],INK,2)
            self.l([(hx+2,hy-2),(hx+3,hy-6)],INK,2)
            self.l([(hx-2,hy-2),(hx-3,hy-5)],SKIN)
            self.l([(hx,hy-2),(hx,hy-6)],SKIN)
            self.l([(hx+2,hy-2),(hx+3,hy-5)],SKIN)
    if self.character == 'claude' and state not in ('work','run'):
        self.p([(25,61),(37,57),(42,74),(29,78)],'#6a403a')
        self.p([(27,62),(36,59),(40,73),(30,75)],'#955a45','#dbb17b')
        self.star(34,66,'#efcf94',3)
        self.r((28,72,32,75),SKIN,INK)


original_face = Sprite.face

def animated_face(self,*args,**kwargs):
    original_face(self,*args,**kwargs)
    if self.state == 'idle' and self.phase == 1:
        for x in (36,53):
            self.r((x-1,37,x+6,44),SKIN)
            self.l([(x-1,40),(x+1,42),(x+4,42),(x+6,40)],INK)
            self.r((x,44,x+4,44),'#f0b9ad')


Sprite.legs = animated_legs
Sprite.arms = animated_arms
Sprite.face = animated_face

STATES = [('idle',2),('walk',4),('run',4),('work',2),('wave',2)]


def pose(name,state,phase):
    global STATE,PHASE,CHARACTER
    STATE,PHASE,CHARACTER=state,phase,name
    im=globals()[name]()
    # Add a tiny gait bob while limb geometry remains independently animated.
    if state in ('walk','run') and phase%2:
        result=Image.new('RGBA',im.size)
        result.alpha_composite(im,(0,-1 if state=='walk' else -2))
        im=result
    return im


def main():
    atlas=Image.new('RGBA',(14*96,7*112))
    preview=Image.new('RGB',(14*96,7*132),'#232a41')
    pd=ImageDraw.Draw(preview)
    try: f=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',10)
    except OSError: f=ImageFont.load_default()
    animations={};offset=0
    for state,count in STATES:
        animations[state]={'offset':offset,'count':count}
        offset+=count
    for row,(name,display,*rest) in enumerate(META):
        frames=[];col=0
        for state,count in STATES:
            for phase in range(count):
                im=pose(name,state,phase)
                atlas.alpha_composite(im,(col*96,row*112))
                preview.paste(im,(col*96,row*132),im)
                pd.text((col*96+3,row*132+112),f'{name} {state}{phase}',font=f,fill='white')
                frames.append(im)
                col+=1
        # Individual GIFs support fast manual animation review without a browser.
        demo=[]
        for indices in ([0]*8+[1]+[0]*8,list(range(2,6))*3,list(range(6,10))*3,[10,11]*4,[12,13]*4):
            for index in indices:
                fr=Image.new('RGB',(288,336),'#232a41')
                big=frames[index].resize((288,336),Image.Resampling.NEAREST)
                fr.paste(big,(0,0),big);demo.append(fr)
        demo[0].save(OUT/f'{name}-preview.gif',save_all=True,append_images=demo[1:],duration=120,loop=0,optimize=True)
    atlas.save(OUT/'characters.png',optimize=True)
    preview.save(OUT/'frames-preview.png',optimize=True)
    (OUT/'atlas.json').write_text(json.dumps({'width':96,'height':112,'columns':14,'states':animations,'characters':[{'id':m[0],'name':m[1],'color':m[3]} for m in META]},indent=2,ensure_ascii=False))
    print(f'Built {len(META)*14} frames: {OUT / "characters.png"} ({(OUT / "characters.png").stat().st_size:,} bytes)')


if __name__=='__main__': main()
