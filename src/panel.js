/* Native ScriptUI gallery; all artwork and icons are original. */
var FractalHubTick = function () {};
(function (thisObj) {
    var F=FractalHub,ui=thisObj instanceof Panel?thisObj:new Window('palette','Fractal Hub',undefined,{resizeable:true});
    var colors={bg:[.105,.112,.125,1],well:[.075,.082,.094,1],raised:[.15,.16,.18,1],edge:[.23,.25,.28,1],text:[.88,.91,.94,1],muted:[.50,.55,.61,1],accent:[.48,.78,.72,1],blue:[.44,.66,.95,1],gold:[.95,.74,.37,1],error:[.98,.53,.48,1]};
    var defaults={engine:'fractal',mode:'replace',animation:'none',speed:60,duration:4,randomize:false,fit:true,preview:true,columns:3};
    var options=F.load('options',{});if(!options||typeof options!=='object'||options instanceof Array)options={};Object.keys(defaults).forEach(function(k){if(options[k]===undefined)options[k]=defaults[k];});
    if([2,3,4,5].indexOf(options.columns)<0)options.columns=3;
    var users=F.readUsers(),favorites=F.load('favorites',[]);if(!(favorites instanceof Array))favorites=[];
    var selected=null,hovered=null,tick=0,timer=null,tiles=[],imageCache={},favoriteOnly=false,collapsed={},busy=false;
    var width=options.columns*100+(options.columns-1)*8;
    ui.orientation='column';ui.alignChildren=['fill','top'];ui.spacing=8;ui.margins=12;ui.preferredSize=[width+24,720];ui.minimumSize=[232,310];
    function dim(c){return [c.size.width||c.size[0]||100,c.size.height||c.size[1]||30];}
    function linear(c){return c.slice(0,3).map(function(v){return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).concat([c.length>3?c[3]:1]);}
    function pen(g,c,w){return g.newPen(g.PenType.SOLID_COLOR,linear(c),w||1);}
    function brush(g,c){return g.newBrush(g.BrushType.SOLID_COLOR,linear(c));}
    function rectangle(g,x,y,w,h,fill,stroke){g.newPath();g.rectPath(x,y,w,h);if(fill)g.fillPath(brush(g,fill));if(stroke)g.strokePath(pen(g,stroke));}
    function line(g,points,c,w,close){g.newPath();points.forEach(function(p,i){if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1]);});if(close)g.closePath();g.strokePath(pen(g,c,w));}
    function circle(g,x,y,r,c,fill){g.newPath();g.ellipsePath(x-r,y-r,r*2,r*2);if(fill)g.fillPath(brush(g,c));else g.strokePath(pen(g,c,1.5));}
    function text(g,s,x,y,c,size){g.drawString(String(s),pen(g,c||colors.text),x,y,ScriptUI.newFont('dialog','REGULAR',size||12));}
    function truncate(g,s,w,size){while(s.length>2&&g.measureString(s,ScriptUI.newFont('dialog','REGULAR',size))[0]>w)s=s.slice(0,-2)+'…';return s;}
    function star(g,x,y,c,filled){var p=[];for(var i=0;i<10;i++){var a=(-90+i*36)*Math.PI/180,r=i%2?3.2:7;p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}line(g,p,c,1.35,true);if(filled)g.fillPath(brush(g,c));}
    function icon(g,kind,x,y,c){
        var p=function(a,w,close){line(g,a.map(function(v){return [x+v[0],y+v[1]];}),c,w||1.5,close);};
        if(kind==='apply'){p([[-6,-6],[1,0],[-6,6]]);p([[1,-6],[8,0],[1,6]]);}
        if(kind==='plus'){p([[-7,0],[7,0]]);p([[0,-7],[0,7]]);}
        if(kind==='star')star(g,x,y,c,false);
        if(kind==='gear'){circle(g,x,y,5,c);circle(g,x,y,1.8,c);for(var i=0;i<8;i++){var a=i*Math.PI/4;p([[Math.cos(a)*6,Math.sin(a)*6],[Math.cos(a)*8,Math.sin(a)*8]],2);}}
        if(kind==='grid')for(var gy=-1;gy<=1;gy++)for(var gx=-1;gx<=1;gx++)rectangle(g,x+gx*5-1,y+gy*5-1,2,2,c);
        if(kind==='search'){circle(g,x-2,y-2,4.5,c);p([[2,2],[7,7]]);}
        if(kind==='save'){p([[-7,-7],[5,-7],[7,-5],[7,7],[-7,7]],1.5,true);p([[-3,-7],[-3,-1],[3,-1],[3,-7]]);p([[-3,7],[-3,2],[3,2],[3,7]]);}
        if(kind==='trash'){p([[-7,-5],[7,-5]]);p([[-4,-5],[-3,7],[3,7],[4,-5]]);p([[-2,-8],[2,-8]]);}
        if(kind==='dice'){rectangle(g,x-7,y-7,14,14,null,c);[[-4,-4],[4,4],[-4,4],[4,-4],[0,0]].forEach(function(v){circle(g,x+v[0],y+v[1],1,c,true);});}
        if(kind==='play')p([[-4,-7],[7,0],[-4,7]],1.5,true);
        if(kind==='pause'){p([[-3,-6],[-3,6]],2.5);p([[3,-6],[3,6]],2.5);}
        if(kind==='close'){p([[-5,-5],[5,5]]);p([[5,-5],[-5,5]]);}
        if(kind==='camera'){p([[-8,-4],[-4,-4],[-2,-7],[3,-7],[5,-4],[8,-4],[8,7],[-8,7]],1.5,true);circle(g,x,y+1,3,c);}
        if(kind==='info'){circle(g,x,y,7,c);p([[0,0],[0,4]]);circle(g,x,y-3,1,c,true);}
    }
    function row(parent){var r=parent.add('group');r.orientation='row';r.alignChildren=['left','center'];r.spacing=6;r.margins=0;return r;}
    function button(parent,name,tip,kind,fn){var b=parent.add('button',undefined,'',{name:name});b.preferredSize=[30,30];b.minimumSize=[30,30];b.maximumSize=[30,30];b.helpTip=tip;b.active=false;b.hot=false;b.icon=kind;
        b.onDraw=function(){var g=this.graphics,s=dim(this);rectangle(g,0,0,s[0],s[1],this.active?colors.raised:(this.hot?colors.raised:colors.bg));icon(g,this.icon,s[0]/2,s[1]/2,this.enabled===false?colors.edge:(this.active?colors.accent:colors.muted));};
        b.addEventListener('mouseover',function(){b.hot=true;});b.addEventListener('mouseout',function(){b.hot=false;});
        b.onClick=function(){act(fn);};return b;
    }
    function act(fn){if(busy)return;busy=true;try{fn();}catch(e){say(e.message||String(e),true);}finally{busy=false;}}
    function say(s,error){status.text=s;status.helpTip=s;status.error=!!error;}
    function persist(){F.save('options',options);}
    function all(){return F.library.presets.concat(users);}
    function isFavorite(p){return favorites.indexOf(p.id)>=0;}
    function toggleFavorite(p){F.assert(p,'Select a preset first.');var n=favorites.indexOf(p.id);if(n>=0)favorites.splice(n,1);else favorites.push(p.id);F.save('favorites',favorites);updateSelection();if(favoriteOnly)rebuild();}
    function imageFor(p,frame){var data=p.thumbnail?[p.thumbnail]:FractalHubThumbnails[p.id];if(!data)return null;frame=frame%data.length;var key=p.id+':'+frame;if(!imageCache[key])imageCache[key]=ScriptUI.newImage(F.decode(data[frame]));return imageCache[key];}
    function choose(p){selected=p;updateSelection();say(p.name+' · '+p.category);}
    function updateSelection(){selectedLabel.text=selected?selected.name:'Select a texture';selectedLabel.helpTip=selected?selected.name+' · '+selected.category:'Select a thumbnail. Double-click to apply.';applyButton.enabled=!!selected;newButton.enabled=!!selected;favoriteButton.enabled=!!selected;favoriteButton.active=!!selected&&isFavorite(selected);removeButton.enabled=!!selected&&selected.id.indexOf('user-')===0;captureButton.enabled=removeButton.enabled;}
    function apply(newSolid){var r=F.apply(selected,options,newSolid);say(selected.name+' → '+r.count+' layer'+(r.count===1?'':'s')+' · '+(r.engine==='fractal'?'FN':'TN'));}
    var header=row(ui);
    var brand=header.add('statictext',undefined,'Fractal Hub',{name:'brand'});brand.alignment=['fill','center'];brand.preferredSize=[width-74,36];
    brand.onDraw=function(){var g=this.graphics;circle(g,11,17,9,colors.accent);circle(g,14,14,5,colors.accent);circle(g,16,12,2,colors.accent);text(g,options.columns===2?'FRACTAL':'FRACTAL HUB',30,9,colors.text,options.columns===2?11:14);};
    button(header,'help','About Fractal Hub and shortcuts','info',help);
    button(header,'settings','Animation, noise engine and application settings','gear',settings);
    var searchRow=row(ui);button(searchRow,'searchAll','Search across all categories','search',function(){category.selection=0;rebuild();search.active=true;});
    var search=searchRow.add('edittext',undefined,'',{name:'search'});search.alignment=['fill','center'];search.preferredSize=[width-72,28];search.helpTip='Search preset names and categories';search.onChanging=function(){if(search.text)category.selection=0;rebuild();};
    button(searchRow,'clearSearch','Clear search','close',function(){search.text='';rebuild();});
    var filterRow=row(ui),categories=['All textures'].concat(F.library.categories).concat(['User presets']);
    var category=filterRow.add('dropdownlist',undefined,categories,{name:'category'});category.selection=1;category.alignment=['fill','center'];category.preferredSize=[width-108,28];category.helpTip='Preset category';category.onChange=function(){rebuild();};
    var filterButton=button(filterRow,'favoriteFilter','Show favorites only','star',function(){favoriteOnly=!favoriteOnly;filterButton.active=favoriteOnly;rebuild();});
    var previewButton=button(filterRow,'hoverPreview','Motion previews · move across a tile to scrub its frames','play',function(){options.preview=!options.preview;previewButton.active=options.preview;persist();stopHover();});previewButton.active=options.preview;
    button(filterRow,'density','Grid density: cycle 2, 3, 4 or 5 columns','grid',function(){options.columns=options.columns===5?2:options.columns+1;persist();width=options.columns*100+(options.columns-1)*8;ui.preferredSize=[width+24,720];brand.preferredSize=[width-74,36];search.preferredSize=[width-72,28];category.preferredSize=[width-108,28];selectedLabel.preferredSize=[width-108,32];status.preferredSize=[width,19];count.preferredSize=[width-144,30];rebuild();});
    var selectionRow=row(ui),selectedLabel=selectionRow.add('statictext',undefined,'Select a texture',{name:'selectedName'});selectedLabel.alignment=['fill','center'];selectedLabel.preferredSize=[width-108,32];
    selectedLabel.onDraw=function(){var g=this.graphics,s=dim(this);text(g,truncate(g,this.text,s[0]-3,12),0,8,selected?colors.text:colors.muted,12);};
    var favoriteButton=button(selectionRow,'favorite','Favorite selected preset · Ctrl-click a tile also toggles its star','star',function(){toggleFavorite(selected);});
    var newButton=button(selectionRow,'newSolid','Create a new solid with the selected preset','plus',function(){apply(true);});
    var applyButton=button(selectionRow,'apply','Apply to selected layers · double-click a thumbnail to apply','apply',function(){apply(false);});applyButton.active=true;
    var status=ui.add('statictext',undefined,'108 original textures · hover to explore',{name:'status'});status.preferredSize=[width,19];
    status.onDraw=function(){var g=this.graphics,s=dim(this);text(g,truncate(g,this.text,s[0],10),0,2,this.error?colors.error:colors.muted,10);};
    var gallery=ui.add('group',undefined,{name:'gallery'});gallery.orientation='column';gallery.alignChildren=['fill','top'];gallery.spacing=7;gallery.margins=0;
    var foot=row(ui);var count=foot.add('statictext',undefined,'',{name:'count'});count.alignment=['fill','center'];count.preferredSize=[width-144,30];
    count.onDraw=function(){text(this.graphics,this.text,0,8,colors.muted,10);};
    var seedButton=button(foot,'randomSeed','Randomize seed when applying','dice',function(){options.randomize=!options.randomize;seedButton.active=options.randomize;persist();say(options.randomize?'Seed randomized on apply':'Preset seed preserved');});seedButton.active=options.randomize;
    button(foot,'savePreset','Save the selected noise and its Fractal Hub finishes as a user preset','save',savePreset);
    var captureButton=button(foot,'captureThumbnail','Capture the current composition as this user preset’s thumbnail','camera',function(){F.assert(selected&&selected.id.indexOf('user-')===0,'Select a user preset.');selected.thumbnail=F.captureThumbnail();F.save('users',users);delete imageCache[selected.id+':0'];rebuild();say('Composition thumbnail captured');});
    var removeButton=button(foot,'deletePreset','Delete selected user preset','trash',removePreset);
    function stopHover(){if(hovered)hovered.hot=false;hovered=null;tick=0;if(timer!==null){app.cancelTask(timer);timer=null;}}
    function tile(parent,p){var b=parent.add('button',undefined,'',{name:'preset_'+p.id});b.preferredSize=[100,100];b.minimumSize=[100,100];b.maximumSize=[100,100];b.preset=p;b.hot=false;b.helpTip=p.name+' · '+p.category+'\nDouble-click to apply. Ctrl-click to favorite.';
        b.onDraw=function(){var g=this.graphics,s=dim(this),frame=this.hot&&options.preview?[0,1,2,3,2,1][tick%6]:0,img=imageFor(p,frame),active=selected&&selected.id===p.id;
            rectangle(g,0,0,s[0],s[1],colors.well);if(img)g.drawImage(img,2,2,s[0]-4,s[1]-4);else{icon(g,'save',s[0]/2,s[1]/2-8,colors.muted);text(g,'USER',s[0]/2-13,s[1]/2+8,colors.muted,9);}
            if(active||this.hot){rectangle(g,1,1,s[0]-2,s[1]-2,null,active?colors.accent:colors.text);if(active)rectangle(g,1,1,3,s[1]-2,colors.accent);}
            if(isFavorite(p)){rectangle(g,s[0]-23,4,19,19,colors.well);star(g,s[0]-13,13,colors.gold,true);}
            var label=p.engine==='both'?'F/T':p.engine==='turbulent'?'TN':'FN';rectangle(g,5,5,label==='F/T'?26:22,15,colors.well);text(g,label,8,6,p.engine==='both'?colors.accent:colors.blue,9);
            if(this.hot){rectangle(g,2,s[1]-27,s[0]-4,25,[.04,.05,.06,.94]);text(g,truncate(g,p.name,s[0]-12,10),6,s[1]-20,colors.text,10);}
        };
        b.onClick=function(){act(function(){choose(p);});};
        // EffectCraft supplies double-click count through the mouse event, not onDoubleClick.
        b.addEventListener('click',function(e){act(function(){if(e.ctrlKey||e.metaKey)toggleFavorite(p);else if(e.detail===2){choose(p);apply(false);}});});
        b.addEventListener('mouseover',function(){stopHover();hovered=b;b.hot=true;tick=0;if(options.preview&&FractalHubThumbnails[p.id])timer=app.scheduleTask('FractalHubTick()',180,true);});
        // Some desktop builds expose scheduleTask without servicing timers. Pointer scrubbing
        // always works and previews motion without changing the project or using a service.
        b.addEventListener('mousemove',function(e){if(options.preview&&hovered===b)tick=Math.max(0,Math.min(3,Math.floor(e.clientX/dim(b)[0]*4)));});
        b.addEventListener('mouseout',function(){if(hovered===b)stopHover();});tiles.push(b);
    }
    FractalHubTick=function(){if(hovered&&options.preview)tick++;};
    function rebuild(){
        stopHover();while(gallery.children.length)gallery.remove(gallery.children[0]);tiles=[];
        var query=String(search.text||'').toLowerCase().trim(),cat=category.selection?category.selection.text:'All textures';
        var list=all().filter(function(p){return (cat==='All textures'||p.category===cat)&&(!favoriteOnly||isFavorite(p))&&(!query||(p.name+' '+p.category).toLowerCase().indexOf(query)>=0);});
        var names=F.library.categories.concat(['User presets']);
        names.forEach(function(name){var items=list.filter(function(p){return p.category===name;});if(!items.length)return;
            var heading=gallery.add('button',undefined,'',{name:'category_'+name.replace(/ /g,'_')});heading.preferredSize=[width,25];heading.helpTip='Expand or collapse '+name;
            heading.onDraw=function(){var g=this.graphics,s=dim(this);rectangle(g,0,0,s[0],s[1],colors.bg);line(g,collapsed[name]?[[3,8],[8,12],[3,16]]:[[2,10],[6,14],[10,10]],colors.muted,1.3);text(g,name,17,5,colors.text,11);text(g,String(items.length),s[0]-20,5,colors.muted,10);};
            heading.onClick=function(){collapsed[name]=!collapsed[name];rebuild();};
            if(!collapsed[name]){var r;items.forEach(function(p,i){if(i%options.columns===0){r=row(gallery);r.spacing=8;r.alignment=['left','top'];}tile(r,p);});}
        });
        if(!list.length){var empty=gallery.add('statictext',undefined,favoriteOnly?'No favorites here yet.':'No matching textures.',{name:'empty'});empty.preferredSize=[width,90];}
        count.text=list.length+' / '+all().length+' textures';updateSelection();ui.layout.layout(true);
    }
    function settings(){var d=new Window('dialog','Fractal Hub · Settings');d.orientation='column';d.alignChildren=['fill','top'];d.margins=18;d.spacing=12;
        function choice(label,name,items,index){var r=row(d);var t=r.add('statictext',undefined,label);t.preferredSize=[115,25];var b=r.add('dropdownlist',undefined,items,{name:name});b.preferredSize=[205,28];b.selection=index;return b;}
        function field(label,name,value){var r=row(d);var t=r.add('statictext',undefined,label);t.preferredSize=[115,25];var b=r.add('edittext',undefined,String(value),{name:name});b.preferredSize=[205,26];return b;}
        var engine=choice('Noise engine','noiseEngine',['Fractal Noise','Turbulent Noise'],options.engine==='turbulent'?1:0);
        var mode=choice('On apply','applyMode',['Replace existing noise','Add unless noise is selected'],options.mode==='add'?1:0);
        var animation=choice('Evolution','animation',['Still','Continuous','Seamless loop'],['none','evolve','loop'].indexOf(options.animation));
        var speed=field('Degrees / second','speed',options.speed),duration=field('Loop seconds','duration',options.duration);
        var fit=d.add('checkbox',undefined,'Fit texture scale to layer',{name:'fitScale'});fit.value=options.fit;
        var seed=d.add('checkbox',undefined,'Randomize seed on apply',{name:'randomize'});seed.value=options.randomize;
        var preview=d.add('checkbox',undefined,'Motion previews on hover / pointer scrub',{name:'animatePreview'});preview.value=options.preview;
        var note=d.add('statictext',undefined,'Loops use Fractal Noise. FN-only presets keep their engine.',{name:'settingsNote'});note.preferredSize=[350,25];
        function enabled(){speed.enabled=animation.selection.index===1;duration.enabled=animation.selection.index===2;}animation.onChange=enabled;enabled();
        var actions=row(d);actions.alignment=['right','top'];var cancel=actions.add('button',undefined,'Cancel',{name:'cancel'}),save=actions.add('button',undefined,'Save',{name:'saveSettings'});cancel.helpTip='Discard these setting changes';save.helpTip='Save browser preferences';
        cancel.onClick=function(){d.close(0);};save.onClick=function(){try{var next=F.clone(options);next.engine=engine.selection.index?'turbulent':'fractal';next.mode=mode.selection.index?'add':'replace';next.animation=['none','evolve','loop'][animation.selection.index];
            if(next.animation==='evolve')next.speed=F.number(speed.text,-3600,3600,'Speed');if(next.animation==='loop'){next.duration=F.number(duration.text,.01,3600,'Loop duration');F.assert(next.engine==='fractal','Choose Fractal Noise for seamless loops.');}
            next.fit=fit.value;next.randomize=seed.value;next.preview=preview.value;F.save('options',next);options=next;seedButton.active=options.randomize;previewButton.active=options.preview;stopHover();d.close(1);say('Settings saved');}catch(e){note.text=e.message;}};
        d.center();d.show();
    }
    function savePreset(){var p=F.capture('Untitled');F.assert(users.length<100,'The user library holds up to 100 presets. Remove one first.');var d=new Window('dialog','Save noise preset');d.orientation='column';d.alignChildren=['fill','top'];d.margins=16;d.add('statictext',undefined,'Save current noise settings');var name=d.add('edittext',undefined,'My texture',{name:'presetName'});name.preferredSize=[280,28];var note=d.add('statictext',undefined,'Evolution options are chosen when applying.',{name:'saveNote'});var actions=row(d);var cancel=actions.add('button',undefined,'Cancel',{name:'cancel'}),save=actions.add('button',undefined,'Save',{name:'saveUserPreset'});cancel.helpTip='Cancel saving';save.helpTip='Save this native noise preset';cancel.onClick=function(){d.close(0);};save.onClick=function(){try{var value=String(name.text).trim();F.assert(value.length&&value.length<=64,'Use a name of 1–64 characters.');p.name=value;var next=users.concat([p]);F.save('users',next);users=next;selected=p;category.selection=categories.length-1;search.text='';favoriteOnly=false;filterButton.active=false;d.close(1);rebuild();say('Preset saved · camera icon captures a comp thumbnail');}catch(e){note.text=e.message;}};d.center();d.show();}
    function removePreset(){F.assert(selected&&selected.id.indexOf('user-')===0,'Select a user preset.');var p=selected,d=new Window('dialog','Remove user preset');d.orientation='column';d.margins=16;var note=d.add('statictext',undefined,'Remove “'+p.name+'” from your library?');var actions=row(d);var cancel=actions.add('button',undefined,'Cancel',{name:'cancel'}),remove=actions.add('button',undefined,'Remove',{name:'confirmRemove'});cancel.onClick=function(){d.close(0);};remove.onClick=function(){try{var next=users.filter(function(q){return q.id!==p.id;});F.save('users',next);users=next;favorites=favorites.filter(function(id){return id!==p.id;});F.save('favorites',favorites);selected=null;d.close(1);rebuild();say('User preset removed');}catch(e){note.text=e.message;}};d.show();}
    function help(){var d=new Window('dialog','Fractal Hub 1.0');d.orientation='column';d.margins=18;d.alignChildren=['fill','top'];var t=d.add('statictext',undefined,'108 original native noise presets\n\nClick to select · double-click to apply\nCtrl-click to favorite · + creates a solid\nHover to see a name and motion preview\nGrid icon changes the number of columns\n\nFN: Fractal · TN: Turbulent · F/T: either\nBuilt-in previews show Fractal Noise.\n\nApplied effects remain editable and undoable.\nIndependent EffectCraft implementation.',{multiline:true});t.preferredSize=[320,260];var close=d.add('button',undefined,'Close',{name:'closeHelp'});close.onClick=function(){d.close();};d.show();}
    ui.onClose=function(){stopHover();FractalHubTick=function(){};return true;};
    ui.onResize=ui.onResizing=function(){ui.layout.resize();};
    rebuild();updateSelection();if(ui instanceof Window){ui.center();ui.show();}
})(this);
