/* Original Fractal Hub recipes. Native enums are zero-based. */
var FractalHubLibrary = (function () {
    var presets=[],categories=['Atmospheric','Fluid','Glitch','Granular','Grunge','Organic','Striped','Stylistic','Terrain'];
    // category, name, fractal, interpolation, contrast, brightness, width, height,
    // octaves, sub influence, sub scale, rotation, sub rotation, overflow, invert.
    // Independently tuned: no global brightness/contrast compensation.
    var rows=[
        [0,'Cloudbank',0,2,190,0,155,155,6,62,52],
        [0,'Rolling Smoke',5,3,210,-24,170,270,5,52,53,0,24],
        [0,'High Cirrus',0,2,165,-8,430,38,3,38,65,16],
        [0,'Thunderhead',2,2,240,-48,240,190,7,68,48],
        [0,'Veil of Mist',0,3,115,-6,300,140,2,30,68,-14],
        [0,'Rising Ember',6,3,185,-18,90,340,4,45,60],
        [0,'Solar Plume',5,3,160,-8,200,300,4,53,64,10,32],
        [0,'Electric Vapor',8,3,155,40,150,150,3,38,52],
        [0,'Distant Storm',0,2,240,-55,310,85,6,58,49],
        [0,'Rain Curtain',0,1,700,-160,4,270,2,30,60,12],
        [0,'Snow Flurry',7,3,1600,-680,13,13,1,0,50],
        [0,'Nebula Drift',4,3,175,-12,230,190,6,58,52,28,36],
        [1,'Liquid Silver',0,3,115,0,230,85,2,24,58,-12],
        [1,'Quiet Lagoon',0,3,180,-2,380,20,3,36,58],
        [1,'Tidal Ridges',2,3,140,-15,240,38,2,32,60,5],
        [1,'Mercury Pools',0,3,125,0,190,190,1,0,50],
        [1,'Oil Ribbon',0,3,130,0,95,270,2,26,60,24],
        [1,'Whirlpool',0,3,140,0,270,38,2,34,58],
        [1,'Foam Islands',8,3,150,24,70,70,2,28,42],
        [1,'Glass Ripple',0,3,110,0,210,65,2,26,60,25],
        [1,'Slow Current',4,3,140,-4,330,90,3,40,66,18],
        [1,'Molten Flow',5,3,160,-8,100,300,3,42,62,20,18],
        [1,'Undertow',0,3,150,-6,280,45,3,38,61,-18],
        [1,'Water Caustics',8,3,400,-100,75,75,1,0,50],
        [2,'Data Shards',0,0,260,-25,100,7,2,50,36],
        [2,'Signal Tear',4,0,500,-90,360,5,3,44,55],
        [2,'Pixel Storm',0,0,160,0,18,18,3,65,50],
        [2,'Dead Channel',0,0,150,-10,300,2,1,0,50],
        [2,'Block Cipher',0,0,180,0,72,72,1,0,50],
        [2,'Packet Loss',0,0,1600,-490,76,12,2,35,50],
        [2,'Raster Slip',0,1,280,-30,380,4,3,55,55,0,70],
        [2,'Bit Crush',0,0,220,-10,26,26,1,0,50,45],
        [2,'Scrambled Bars',0,0,500,-20,8,185,2,46,45],
        [2,'Broken Matrix',0,0,220,0,95,95,2,45,50],
        [2,'Digital Rain',0,0,1000,-320,7,72,3,35,50],
        [2,'Codec Ghost',0,0,220,-22,170,22,3,55,40,12,32],
        [3,'Fine Grain',0,3,120,0,4,4,1,0,50],
        [3,'Coarse Sand',0,3,240,0,17,17,3,45,50],
        [3,'Salt Crystals',0,0,1100,-280,15,15,1,0,50,28],
        [3,'Film Dust',0,3,3500,-1460,11,11,1,0,50],
        [3,'Pebble Bed',1,3,125,-28,45,45,1,0,50],
        [3,'Soft Speckle',0,3,500,-65,22,22,1,0,50],
        [3,'Pumice',3,3,210,-12,28,28,4,48,43],
        [3,'Metal Flakes',0,1,1200,-280,16,8,1,0,50,24],
        [3,'Powder',0,2,85,12,6,6,2,40,50],
        [3,'Soot',0,3,1000,-250,27,27,4,65,42,0,0,0,true],
        [3,'Scattered Seeds',0,3,1800,-510,25,35,1,0,50,35],
        [3,'Micro Pores',8,3,145,4,16,16,1,0,50],
        [4,'Weathered Plaster',0,2,180,12,145,145,8,78,44],
        [4,'Old Concrete',3,2,145,0,70,70,7,75,48],
        [4,'Scraped Paint',0,3,1100,70,170,62,4,58,42,-8],
        [4,'Charcoal Rub',0,2,360,5,110,160,6,64,37],
        [4,'Corroded Steel',0,3,280,-10,85,85,6,68,47],
        [4,'Water Stain',0,3,160,0,200,180,2,25,60],
        [4,'Dry Ink',0,2,1800,350,100,100,5,66,45],
        [4,'Cracked Lacquer',8,3,320,-110,125,125,1,0,50,0,0,0,true],
        [4,'Scuffed Vinyl',0,3,420,-100,380,3,4,55,42,-12],
        [4,'Burnt Paper',0,3,180,0,240,240,4,62,48],
        [4,'Oxide Bloom',0,3,210,0,140,140,5,60,45],
        [4,'Rough Canvas',0,1,140,0,7,160,4,50,48,0,90],
        [5,'Cell Membrane',8,3,190,28,130,130,1,0,50],
        [5,'Marble Vein',0,3,130,0,190,230,3,35,60,20],
        [5,'Tree Bark',3,3,200,-35,35,260,5,60,54,5],
        [5,'Mycelium',8,3,230,62,250,250,5,42,39,0,36],
        [5,'Lichen',0,3,420,-25,75,75,5,60,46],
        [5,'Soft Tissue',1,3,120,-32,160,160,2,24,58],
        [5,'Reptile Skin',0,3,150,0,48,48,1,0,50],
        [5,'Coral Branch',8,3,260,65,160,230,4,45,45,25,24],
        [5,'Wood Fiber',0,3,140,0,22,400,3,40,52,6],
        [5,'Muscle Strand',0,3,180,-2,17,280,3,45,57,-16],
        [5,'Moss Cushion',0,2,210,-10,80,80,8,78,50],
        [5,'Cellular Foam',1,3,150,-28,90,90,1,0,50],
        [6,'Silk Fold',0,3,115,0,55,460,2,25,58,14],
        [6,'Brushed Alloy',0,1,140,0,500,2,2,45,50],
        [6,'Wind Lines',0,3,200,-20,430,12,3,35,58,24],
        [6,'Vertical Static',0,0,160,0,5,300,2,50,50],
        [6,'Cross Grain',0,1,160,0,6,340,3,55,48,0,90],
        [6,'Ribbon Wave',0,3,110,0,65,500,1,0,50,25],
        [6,'Long Exposure',8,3,220,12,8,420,2,30,55,-22],
        [6,'Pleated Light',0,1,210,0,50,600,1,0,50],
        [6,'Zebra Current',0,3,2200,0,70,460,1,0,50],
        [6,'Etched Lines',0,3,130,0,380,25,2,25,58],
        [6,'Contour Bands',0,3,130,0,270,80,2,30,58,14],
        [6,'Thread Weave',0,0,160,0,4,180,4,50,50,45,90],
        [7,'Ink Islands',0,3,3000,-160,180,180,2,25,58],
        [7,'Opal Rings',0,3,110,0,260,260,1,0,50],
        [7,'Chrome Web',8,3,140,20,160,160,2,25,55],
        [7,'Paper Cut',0,0,190,0,150,150,2,50,50,45,45],
        [7,'Luminous Threads',8,3,200,46,210,210,3,35,50,0,48],
        [7,'Topographic Ink',0,3,110,0,250,250,4,34,58],
        [7,'Glass Cells',0,3,115,0,110,110,1,0,50],
        [7,'Folded Satin',0,3,120,0,140,330,2,25,60,30],
        [7,'Binary Bloom',0,0,300,0,75,75,3,60,42,35,45],
        [7,'Negative Space',0,3,2800,450,130,130,1,0,50],
        [7,'Graphite Swirl',0,3,260,-5,120,160,5,64,48],
        [7,'Liquid Contour',0,3,120,0,210,270,2,26,57],
        [8,'Mountain Range',0,2,145,0,210,170,7,65,51,24,12],
        [8,'Desert Dunes',0,3,160,0,300,55,2,25,61,20],
        [8,'Island Chain',0,3,200,0,175,175,5,45,50],
        [8,'Crater Field',1,3,135,-28,65,65,1,0,50],
        [8,'River Delta',8,3,180,22,230,200,4,35,42,0,32],
        [8,'Rocky Ridge',3,2,180,-18,95,95,7,65,48],
        [8,'Rolling Hills',0,3,150,0,210,210,3,30,60],
        [8,'Ice Shelf',0,3,160,0,180,180,4,40,50],
        [8,'Canyon Walls',0,3,130,0,80,270,4,36,58,12],
        [8,'Lava Plain',8,3,180,44,140,140,4,45,48],
        [8,'Erosion Map',0,2,180,-5,210,210,8,65,45,0,23],
        [8,'Continental Shelf',0,3,150,0,280,280,5,40,54]
    ];
    rows.forEach(function(r,i){
        presets.push({id:'fh-'+('000'+(i+1)).slice(-3),name:r[1],category:categories[r[0]],engine:r[12]?'fractal':'both',seed:137+i*97,referenceSize:512,finishes:[],values:{
            fractalType:r[2],noiseType:r[3],contrast:r[4],brightness:r[5],
            'transform/uniformScaling':r[6]===r[7],'transform/scale':r[6],'transform/scaleWidth':r[6],'transform/scaleHeight':r[7],'transform/rotation':r[11]||0,
            complexity:r[8],'subSettings/subInfluence':r[9],'subSettings/subScaling':r[10],'subSettings/subRotation':r[12]||0,
            overflow:r[13]||0,invert:!!r[14],evolution:0,opacity:100,blendingMode:0,blend:0,
            'transform/perspectiveOffset':false,'subSettings/subOffset':[0,0],'subSettings/centerSubscale':false
        }});
    });
    function fx(effect,label,values){return {effect:effect,label:label,values:values};}
    function warp(amount,size,complexity,kind){return fx('ec.distort.turbulentdisplace','Flow',{displacement:kind||0,amount:amount,size:size,complexity:complexity||2,offset:[0,0],pinning:1,'evolutionOptions/randomSeed':27});}
    function twirl(angle,radius){return fx('ec.distort.twirl','Swirl',{angle:angle,radius:radius,center:[0,0]});}
    function relief(amount,contrast,direction){return fx('ec.stylize.emboss','Relief',{relief:amount,contrast:contrast,direction:direction||135,blend:35});}
    // Display-referred hex is converted to the renderer's linear RGB palette values.
    function linear(hex){return [0,2,4].map(function(i){var n=parseInt(hex.slice(i,i+2),16)/255;return +(n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)).toFixed(6);}).join(',');}
    function map(stops,cycles,hard,label){return fx('ec.color.colorama',label||'Tone map',{'inputPhase/mode':0,'outputCycle/usePresetPalette':8,'outputCycle/palette':stops.map(function(s){return s[0]+':'+linear(s[1]);}).join(' '),'outputCycle/cycles':cycles||.999,'outputCycle/interpolatePalette':!hard,'modify/modifyAlpha':false});}
    function ramp(colors,label){return map(colors.map(function(c,i){return [i/(colors.length-1)*.999,c];}),.999,false,label||'Color map');}
    var chrome=[[0,'080b10'],[.18,'737b88'],[.38,'f7fbff'],[.46,'19212a'],[.52,'000205'],[.67,'b5c3cb'],[.82,'ffffff'],[.999,'181e26']];
    var silver=[[0,'080808'],[.20,'777777'],[.39,'ffffff'],[.46,'111111'],[.54,'000000'],[.72,'d0d0d0'],[.87,'ffffff'],[.999,'222222']];
    var ink=[[0,'faf9f4'],[.38,'faf9f4'],[.40,'171923'],[.43,'171923'],[.45,'faf9f4'],[.999,'faf9f4']];
    var fire=['030105','23041b','8c1230','e64b12','ffb82e','fff4c0'];
    var sea=['010c24','063a60','087e91','83d2d0','effff5'];
    var oxide=['131b21','3c484b','3c2b21','ac472a','d2924a','ded2ad'];
    var sand=['281e25','655044','ba8b57','e7c18b','fff0cb'];
    var moss=['080f13','182b24','3b5934','879b53','d5d4a0'];
    var lilac=['080a24','242560','7c3b8e','cf6e9b','f3b6aa','f6efdd'];
    function set(n,list){presets[n-1].finishes=list;}
    set(2,[warp(70,110,3)]);
    set(3,[warp(30,140,2,6)]);
    set(4,[ramp(['050918','182338','566477','c6ced3','ffffff'],'Storm light')]);
    set(5,[warp(100,180,1)]);
    set(6,[warp(65,85,3),ramp(fire,'Ember gradient')]);
    set(7,[warp(115,120,2,2),ramp(['05010b','3d0624','aa2140','fc7941','fff0a8'],'Solar gradient')]);
    set(8,[warp(70,120,2),ramp(['040816','103177','30b5df','e4fcff'],'Ion gradient')]);
    set(9,[warp(25,90,2)]);
    set(12,[warp(100,170,3),ramp(lilac,'Nebula gradient')]);
    set(13,[warp(110,135,2,2),map(silver,1.7)]);
    set(14,[warp(22,80,2),ramp(sea,'Lagoon gradient')]);
    set(15,[warp(45,95,2),relief(3,240,110)]);
    set(16,[warp(90,115,1,2),map(silver,1.2)]);
    set(17,[warp(130,145,2,2),map([[0,'050717'],[.16,'133d56'],[.3,'50c6b1'],[.42,'e6ce89'],[.50,'7d4d84'],[.64,'23274a'],[.78,'306887'],[.9,'bbd5d4'],[.999,'050717']],2.3,false,'Oil spectrum')]);
    set(18,[twirl(600,49),map(silver,1.5)]);
    set(19,[warp(65,65,2),ramp(['071f2a','22707b','b0d9cd','f8fff5'],'Sea foam')]);
    set(20,[warp(70,100,2),map(silver,3)]);
    set(21,[warp(150,160,2,2)]);
    set(22,[warp(100,100,2,2),ramp(['100c14','431528','a6382c','df8e49','ffe6a5'],'Molten copper')]);
    set(23,[warp(125,140,2,2),map(chrome,1.3)]);
    set(24,[warp(55,100,2),ramp(['01172b','03536f','209fba','d7fff6'],'Caustic light')]);
    set(25,[map([[0,'080e14'],[.27,'141e28'],[.50,'00a9b4'],[.72,'f4554d'],[.999,'f7ecca']],.999,true,'Data colors')]);
    set(27,[map([[0,'080e16'],[.25,'213d69'],[.50,'5a82a7'],[.75,'d4e4dc']],.999,true,'Pixel palette')]);
    set(28,[ramp(['040906','145332','79c985','e9ffce'],'Phosphor')]);
    set(29,[map([[0,'10131c'],[.22,'31516b'],[.43,'d05c4c'],[.64,'e9c87e'],[.84,'ede9dc']],.999,true,'Cipher palette')]);
    set(30,[ramp(['10121b','faf1dc'],'Paper signal')]);
    set(31,[warp(65,65,2,7)]);
    set(32,[map([[0,'14131c'],[.3,'5e366e'],[.6,'ce7294'],[.82,'eacda3']],.999,true,'Crushed palette')]);
    set(34,[map([[0,'111111'],[.22,'555555'],[.45,'b0b0b0'],[.7,'f5f5f5']],.999,true)]);
    set(35,[ramp(['020b0b','007764','77f4a4','edffe0'],'Terminal green')]);
    set(36,[warp(35,45,1,7),map([[0,'0d1320'],[.35,'163550'],[.55,'af6688'],[.72,'95c0bc'],[.999,'f8e3b9']],.999,true,'Corrupt signal')]);
    set(38,[relief(1.4,140),ramp(sand,'Sandstone')]);
    set(39,[relief(1.4,180)]);
    set(41,[relief(3,180)]);
    set(43,[relief(1.5,140)]);
    set(44,[map(chrome,1)]);
    set(48,[relief(1.5,160)]);
    set(49,[relief(3,170)]);
    set(50,[relief(.7,90)]);
    set(51,[ramp(['183641','38737b','dbd5b8','f4e9ca'],'Old turquoise paint')]);
    set(53,[ramp(oxide,'Rust patina')]);
    set(54,[map([[0,'ddd4b9'],[.32,'e8dfc5'],[.39,'83775d'],[.43,'c4b791'],[.55,'ddd0a8'],[.999,'eae0c6']],1,false,'Watermark')]);
    set(56,[warp(32,70,2)]);
    set(58,[map([[0,'09080a'],[.25,'251b16'],[.37,'715039'],[.44,'bc9d72'],[.52,'e2d5b4'],[.999,'efe4c6']],.999,false,'Scorched edge')]);
    set(59,[ramp(['10232c','315a59','5b8070','9c6d3c','c9aa73','e5d4aa'],'Verdigris')]);
    set(60,[relief(1.4,160)]);
    set(61,[warp(60,100,2)]);
    set(62,[warp(155,145,2,2),map([[0,'f1eee6'],[.32,'edeae1'],[.4,'9ba6a7'],[.43,'27373e'],[.46,'c6cecb'],[.55,'f7f3e7'],[.999,'e7e5dd']],3,false,'Stone veins')]);
    set(63,[warp(28,80,2),relief(2,180),ramp(['151415','3c2b24','796047','c2a379','e4d4ae'],'Bark')]);
    set(64,[warp(75,70,3)]);
    set(65,[ramp(moss,'Lichen pigment')]);
    set(66,[warp(95,105,2,2),ramp(['281628','864357','d78d8b','eac4b1','fff0dd'],'Tissue pigment')]);
    set(67,[warp(17,42,1),map([[0,'151515'],[.25,'2b2b2b'],[.42,'747474'],[.48,'eeeeee'],[.54,'333333'],[.75,'777777'],[.999,'cccccc']],1.2)]);
    set(68,[warp(70,70,3),ramp(['0c1427','346278','e68a7f','fff1d3'],'Coral')]);
    set(69,[warp(45,130,2),map([[0,'241714'],[.2,'6b3e28'],[.44,'bd8650'],[.51,'3b251d'],[.6,'a66e40'],[.999,'e4bc82']],2,false,'Wood rings')]);
    set(70,[warp(32,90,2),ramp(['210d21','642a43','bb656c','f0b6a2','ffe5ce'],'Fibers')]);
    set(71,[relief(2,250),ramp(['101b15','335234','6b8751','b6b879','e8deb1'],'Moss')]);
    set(72,[warp(50,80,2),map(silver,1)]);
    set(73,[warp(60,170,1),map(silver,1.1)]);
    set(74,[ramp(['161b22','57616b','bfc7cc','f2f4ef'],'Steel')]);
    set(75,[warp(45,120,2,6)]);
    set(77,[relief(1,150)]);
    set(78,[warp(90,160,2),map([[0,'121933'],[.24,'564978'],[.42,'c491ae'],[.51,'f7dfcf'],[.58,'8679a8'],[.78,'303858'],[.999,'121933']],2,false,'Ribbon gradient')]);
    set(79,[warp(20,130,1),ramp(['020814','133e76','2bb1d1','fff0ba'],'Light trails')]);
    set(80,[map(silver,2)]);
    set(81,[warp(75,130,2)]);
    set(82,[warp(30,100,1),map(ink,7)]);
    set(83,[warp(60,160,1),map([[0,'152c3c'],[.25,'3e7077'],[.50,'89ada1'],[.75,'e5cc96']],4,true,'Contour colors')]);
    set(84,[relief(1,150)]);
    set(85,[warp(45,120,2)]);
    set(86,[map([[0,'34344d'],[.17,'93bdc0'],[.35,'f3e4cb'],[.53,'ba92bd'],[.75,'657eab'],[.999,'34344d']],4,false,'Opal spectrum')]);
    set(87,[warp(80,110,2,2),map(silver,1.8)]);
    set(88,[map([[0,'172b36'],[.25,'d36d50'],[.45,'e5b879'],[.65,'f3e7ca'],[.85,'77a5a0']],.999,true,'Cut paper')]);
    set(89,[warp(115,130,3),ramp(['08071b','472c82','bf68c0','ffe0e5'],'Ultraviolet')]);
    set(90,[map(ink,8)]);
    set(91,[warp(60,75,2),map(silver,1.7)]);
    set(92,[warp(100,150,2,2),map([[0,'160d2d'],[.18,'4c2860'],[.39,'a765a2'],[.48,'f8d7c4'],[.57,'3c245b'],[.8,'b17aaf'],[.999,'160d2d']],1.4,false,'Amethyst satin')]);
    set(93,[map([[0,'080f1b'],[.28,'093e5c'],[.55,'21c0bd'],[.8,'f6dfbb']],.999,true,'Binary palette')]);
    set(95,[twirl(280,48)]);
    set(96,[warp(155,150,2,2),map([[0,'152c3c'],[.18,'53a3a6'],[.38,'e0dca8'],[.50,'e89672'],[.66,'a44d60'],[.82,'3a536f'],[.999,'152c3c']],3,true,'Liquid bands')]);
    set(97,[relief(5,350),ramp(['141e2c','3f4b53','827e6b','cbc5a7','ffffff'],'Alpine relief')]);
    set(98,[warp(40,120,1),relief(4,180,110),ramp(sand,'Dune light')]);
    set(99,[map([[0,'062038'],[.32,'12516a'],[.47,'42979b'],[.50,'d6c79e'],[.55,'64876b'],[.70,'395b45'],[.9,'998d6b'],[.999,'efe4c7']],.999,false,'Coastline')]);
    set(100,[relief(4,220)]);
    set(101,[warp(85,130,3),ramp(['bfc8b6','6f977f','216470','082b48'],'River channels')]);
    set(102,[relief(3,220)]);
    set(103,[relief(12,500),ramp(['122b30','31564b','779365','c4c394','f3e6bd'],'Meadow relief')]);
    set(104,[map([[0,'0c2d48'],[.34,'276d86'],[.45,'6db3bc'],[.48,'d4eae6'],[.64,'f5fcf1'],[.999,'ffffff']],.999,false,'Ice edge')]);
    set(105,[warp(40,110,2),map([[0,'301e27'],[.2,'754238'],[.4,'c47b51'],[.6,'e6b07c'],[.8,'f4d7a5']],3,true,'Sediment layers')]);
    set(106,[warp(55,90,2),map([[0,'090a11'],[.28,'181a20'],[.43,'4a1622'],[.60,'d03d13'],[.8,'ffa135'],[.999,'ffe9a1']],.999,false,'Lava fissures')]);
    set(107,[relief(3,230)]);
    set(108,[map([[0,'09162e'],[.3,'104b6b'],[.48,'2c8590'],[.53,'cbc59b'],[.60,'618373'],[.75,'576b4a'],[.88,'b3a076'],[.999,'f0e5ce']],.999,false,'Elevation zones')]);
    return {presets:presets,categories:categories};
})();
