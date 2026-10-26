/* Fractal Hub — native EffectCraft integration. No project edits during browsing. */
var FractalHub = (function () {
    var F={version:'1.1.0',library:FractalHubLibrary,section:'Fractal Hub'};
    F.assert=function(ok,message){if(!ok)throw new Error(message);};
    F.clone=function(v){return JSON.parse(JSON.stringify(v));};
    F.number=function(v,min,max,label){F.assert(String(v).trim()!=='',label+' needs a number.');var n=Number(v);F.assert(isFinite(n)&&n>=min&&n<=max,label+' must be between '+min+' and '+max+'.');return n;};
    F.comp=function(){var c=app.project.activeItem;F.assert(c instanceof CompItem,'Open a composition first.');return c;};
    F.load=function(key,fallback){try{return JSON.parse(app.settings.getSetting(F.section,key));}catch(e){return fallback;}};
    F.save=function(key,value){app.settings.saveSetting(F.section,key,JSON.stringify(value));};
    F.noise=function(e){return e&&(e.effect==='ec.noise.fractal'||e.effect==='ec.noise.turbulent');};
    F.effects=function(c,l){var tree=app.run('layer.tree',{comp:c.id,layer:l.id,depth:5});for(var i=0;i<tree.properties.children.length;i++)if(tree.properties.children[i].match==='effects')return tree.properties.children[i].children;return [];};
    F.selectedEffect=function(l,effects){
        var selected;try{selected=l.selectedProperties;}catch(staleSnapshot){return null;}
        for(var i=selected.length-1;i>=0;i--){var p=selected[i],depth=0;
            // A removed effect can remain in the host's selectedProperties snapshot.
            try{while(p&&depth++<12){var parent=p.parentProperty;if(parent&&parent.matchName==='ADBE Effect Parade')return effects[p.propertyIndex-1]||null;p=parent;}}catch(staleSelection){}
        }
        return null;
    };
    F.target=function(l,effects,mode){
        var chosen=F.selectedEffect(l,effects);if(F.noise(chosen))return chosen;
        if(chosen)for(var j=0;j<effects.length;j++)if(F.noise(effects[j])&&F.finishes(effects,effects[j]).some(function(e){return e.uid===chosen.uid;}))return effects[j];
        if(mode==='replace')for(var i=effects.length-1;i>=0;i--)if(F.noise(effects[i]))return effects[i];
        return null;
    };
    F.engine=function(p,preferred){return p.engine==='both'?(preferred==='turbulent'?'turbulent':'fractal'):p.engine;};
    // Only contiguous, explicitly named Fractal Hub finishes belong to a recipe.
    // Unrelated effects are never swept up by replacement or preset capture.
    F.finishes=function(effects,noise){
        if(!noise||noise.name.indexOf('FH · ')!==0)return [];
        var out=[],start=Number(noise.path.split('#')[1]),prefix=noise.name+' / ';
        for(var i=start;i<effects.length;i++){if(effects[i].name.indexOf(prefix)!==0)break;out.push(effects[i]);}
        return out;
    };
    F.finishScale=function(id){return id==='ec.distort.turbulentdisplace'?['amount','size']:id==='ec.stylize.emboss'?['relief']:[];};
    F.finishPoints=function(id){return id==='ec.distort.turbulentdisplace'?['offset']:id==='ec.distort.twirl'?['center']:[];};
    // Native Turbulent Displace mixes the instance UID into its random seed.
    // Invert that 32-bit mix so previews, repeated applications and saved recipes agree.
    F.flowSeed=function(uid,seed){return ((uid^0x7d15)+Math.imul(seed,0x9e3779b9))>>>0;};
    F.flowParameter=function(uid,target){return Math.imul((target-(uid^0x7d15))>>>0,0x144cbc89)>>>0;};
    F.finishValues=function(fx,p,width,height,fit){
        var v=F.clone(fx.values),s=fit===false?1:Math.min(width,height)/(p.referenceSize||512);
        F.finishScale(fx.effect).forEach(function(k){if(v[k]!==undefined)v[k]*=s;});
        F.finishPoints(fx.effect).forEach(function(k){var pt=v[k]||[0,0];v[k]=[width/2+pt[0]*s,height/2+pt[1]*s];});
        if(fx.effect==='ec.distort.twirl'&&fit!==false)v.radius*=Math.min(width,height)/Math.max(width,height);
        return v;
    };
    F.values=function(p,engine,width,height,randomize,fit){
        var v=F.clone(p.values),scale=fit===false?1:Math.min(width,height)/(p.referenceSize||512);
        ['transform/scale','transform/scaleWidth','transform/scaleHeight'].forEach(function(k){if(v[k]!==undefined)v[k]=Math.max(1,Math.min(10000,v[k]*scale));});
        if(v['subSettings/subOffset'])v['subSettings/subOffset']=v['subSettings/subOffset'].map(function(n){return n*scale;});
        // Offset is saved relative to the layer's centre, in reference-size pixels.
        var offset=v['transform/offset']||[0,0];v['transform/offset']=[width/2+offset[0]*scale,height/2+offset[1]*scale];
        delete v['evolutionOptions/seed'];delete v['evolutionOptions/randomSeed'];delete v['evolutionOptions/cycleEvolution'];delete v['evolutionOptions/cycle'];delete v['evolutionOptions/turbulenceFactor'];
        var seed=randomize?Math.floor(Math.random()*100001):p.seed;
        if(engine==='turbulent'){
            delete v['subSettings/subRotation'];delete v['subSettings/subOffset'];delete v['subSettings/centerSubscale'];
            v['evolutionOptions/randomSeed']=seed;v['evolutionOptions/turbulenceFactor']=p.turbulence===undefined?.5:p.turbulence;
        }else{v['evolutionOptions/seed']=seed;v['evolutionOptions/cycleEvolution']=false;v['evolutionOptions/cycle']=1;}
        return v;
    };
    F.apply=function(p,options,newSolid){
        F.assert(p&&p.values,'Select a preset first.');var c=F.comp(),o=options||{},engine=F.engine(p,o.engine),mode=o.mode==='add'?'add':'replace',animation=o.animation||'none';
        F.assert(engine==='fractal'||engine==='turbulent','Unsupported noise engine.');
        F.assert(['none','evolve','loop'].indexOf(animation)>=0,'Choose a valid animation mode.');
        F.assert(animation!=='loop'||engine==='fractal','Seamless loops require Fractal Noise. Choose Fractal Noise in settings.');
        var speed=animation==='evolve'?F.number(o.speed,-3600,3600,'Speed'):60;
        var duration=animation==='loop'?F.number(o.duration,1/c.frameRate,3600,'Loop duration'):4;
        var layers=newSolid?[null]:c.selectedLayers;
        F.assert(layers.length,'Select one or more layers, or use the + icon to create a noise solid.');
        var plans=[],steps=[],stabilizers=[];
        function push(command,params){steps.push({command:command,params:params});return steps.length;}
        layers.forEach(function(l){
            if(l){F.assert(!l.locked,'Unlock '+l.name+' first.');F.assert(!(l instanceof CameraLayer)&&!(l instanceof LightLayer)&&!l.nullLayer,'Choose footage, a solid, text or a shape layer.');}
            var effects=l?F.effects(c,l):[],old=l?F.target(l,effects,mode):null;
            var width=l?l.width:c.width,height=l?l.height:c.height;
            F.assert(width>0&&height>0,'This layer has no renderable dimensions.');
            plans.push({layer:l,old:old,finishes:F.finishes(effects,old),count:effects.length,width:width,height:height});
        });
        plans.forEach(function(plan){
            var l=plan.layer,lid=l?l.id:'$'+push('layer.newSolid',{comp:c.id,name:'FH · '+p.name,color:[0,0,0],width:plan.width,height:plan.height,pixelAspect:c.pixelAspect})+'.layer';
            plan.finishes.forEach(function(e){push('effect.remove',{comp:c.id,layer:lid,effect:e.uid});});
            if(plan.old)push('effect.remove',{comp:c.id,layer:lid,effect:plan.old.uid});
            var fxStep=push('effect.apply',{comp:c.id,layers:[lid],effect:'ec.noise.'+engine});
            var fxRef='$'+fxStep+'.effects.0',index=plan.count-plan.finishes.length+(plan.old?0:1),path='effects/#'+index,refs=[fxRef];
            var values=F.values(p,engine,plan.width,plan.height,!!o.randomize,o.fit);
            if(animation==='loop'){values['evolutionOptions/cycleEvolution']=true;values['evolutionOptions/cycle']=1;}
            Object.keys(values).forEach(function(k){push('prop.set',{comp:c.id,layer:lid,path:path+'/'+k,value:values[k]});});
            var ep=path+'/evolution',base=Number(values.evolution)||0;
            if(animation==='evolve')push('prop.setExpression',{comp:c.id,layer:lid,path:ep,expression:String(base)+' + time * '+speed,enabled:true});
            if(animation==='loop'){
                var start=c.workAreaStart;
                push('prop.addKey',{comp:c.id,layer:lid,path:ep,time:start,timeBase:'comp',value:base});
                push('prop.addKey',{comp:c.id,layer:lid,path:ep,time:start+duration,timeBase:'comp',value:base+360});
                push('prop.setExpression',{comp:c.id,layer:lid,path:ep,expression:'loopOut("cycle")',enabled:true});
            }
            push('prop.renameGroup',{comp:c.id,layer:lid,prop:fxRef,name:'FH · '+p.name});
            (p.finishes||[]).forEach(function(fx,j){
                var step=push('effect.apply',{comp:c.id,layers:[lid],effect:fx.effect}),ref='$'+step+'.effects.0',fp='effects/#'+(index+j+1);
                refs.push(ref);var fv=F.finishValues(fx,p,plan.width,plan.height,o.fit);
                Object.keys(fv).forEach(function(k){push('prop.set',{comp:c.id,layer:lid,path:fp+'/'+k,value:fv[k]});});
                push('prop.renameGroup',{comp:c.id,layer:lid,prop:ref,name:'FH · '+p.name+' / '+(j+1)+' '+fx.label});
                if(fx.effect==='ec.distort.turbulentdisplace')stabilizers.push({step:step,layer:lid,index:plan.old?Number(plan.old.path.split('#')[1])+j+1:index+j+1,seed:o.randomize?Math.floor(Math.random()*4294967296):(fx.renderSeed===undefined?(p.seed+j*997)>>>0:fx.renderSeed)});
            });
            if(plan.old)refs.forEach(function(ref,j){push('effect.reorder',{comp:c.id,layer:lid,effect:ref,index:Number(plan.old.path.split('#')[1])+j});});
        });
        var result,applied=false,failure=null;
        app.beginUndoGroup('Fractal Hub · '+p.name);
        try{
            result=app.run('engine.batch',{label:'Fractal Hub · '+p.name,atomic:true,steps:steps});applied=true;
            var seedSteps=stabilizers.map(function(s){
                var uid=result.results[s.step-1].effects[0],layer=s.layer;
                if(typeof layer==='string'&&layer.charAt(0)==='$')layer=result.results[Number(layer.split('.')[0].slice(1))-1].layer;
                var seed=F.flowParameter(uid,s.seed);
                // A constant expression preserves all 32 bits; the native UI slider is narrower.
                return {command:'prop.setExpression',params:{comp:c.id,layer:layer,path:'effects/#'+s.index+'/evolutionOptions/randomSeed',expression:'// Fractal Hub stable flow\n'+seed,enabled:true}};
            });
            if(seedSteps.length)app.run('engine.batch',{label:'Fractal Hub flow seeds',atomic:true,steps:seedSteps});
        }catch(e){failure=e;}finally{app.endUndoGroup();}
        if(failure){if(applied)app.run('edit.undo',{});throw failure;}
        return {count:plans.length,engine:engine,result:result};
    };
    F.capture=function(name){
        name=String(name||'').trim();F.assert(name.length&&name.length<=64,'Use a preset name of 1–64 characters.');
        var c=F.comp(),layers=c.selectedLayers;F.assert(layers.length===1,'Select one layer containing a noise effect.');
        var l=layers[0],effects=F.effects(c,l),e=F.target(l,effects,'replace');F.assert(e,'Select a Fractal Noise or Turbulent Noise effect.');
        var values={},prefix=e.path+'/';
        function visit(n){if(n.children)n.children.forEach(visit);else if(n.path&&n.path.indexOf(prefix)===0)values[n.path.slice(prefix.length)]=F.clone(n.value);}
        visit(e);var engine=e.effect==='ec.noise.fractal'?'fractal':'turbulent';
        var seed=values[engine==='fractal'?'evolutionOptions/seed':'evolutionOptions/randomSeed'];
        var offset=values['transform/offset'];values['transform/offset']=[offset[0]-l.width/2,offset[1]-l.height/2];
        var finishes=F.finishes(effects,e).map(function(fx){
            var fv={},pre=fx.path+'/';
            function read(n){if(n.children)n.children.forEach(read);else if(n.path&&n.path.indexOf(pre)===0)fv[n.path.slice(pre.length)]=F.clone(n.value);}
            read(fx);F.finishPoints(fx.effect).forEach(function(k){if(fv[k])fv[k]=[fv[k][0]-l.width/2,fv[k][1]-l.height/2];});
            if(fx.effect==='ec.distort.twirl')fv.radius*=Math.max(l.width,l.height)/Math.min(l.width,l.height);
            var out={effect:fx.effect,label:fx.name.slice(e.name.length+3).replace(/^\d+ /,''),values:fv};
            if(fx.effect==='ec.distort.turbulentdisplace'){
                var effect=l.property('ADBE Effect Parade').property(Number(fx.path.split('#')[1]));
                out.renderSeed=F.flowSeed(fx.uid,effect.property('Evolution Options').property('Random Seed').valueAtTime(c.time,false));
            }
            return out;
        });
        return {id:'user-'+new Date().getTime(),name:name,category:'User presets',engine:engine,seed:seed,values:values,finishes:finishes,referenceSize:Math.min(l.width,l.height),turbulence:values['evolutionOptions/turbulenceFactor']};
    };
    F.readUsers=function(){var a=F.load('users',[]);return a instanceof Array?a.filter(function(p){return p&&typeof p.id==='string'&&typeof p.name==='string'&&p.values&&typeof p.values==='object'&&['fractal','turbulent'].indexOf(p.engine)>=0;}).slice(0,100):[];};
    F.captureThumbnail=function(){
        var c=F.comp();F.assert(app.project.file,'Save the project before capturing a thumbnail.');
        var file=new File(app.project.file.parent.fsName+'/.fractal-hub-thumb-'+new Date().getTime()+'.png');
        try{F.assert(file.open('w'),'Enable script file access to capture thumbnails.');file.close();app.run('comp.saveFrameAs',{comp:c.id,path:file.fsName,time:c.time,scale:Math.min(1,128/Math.max(c.width,c.height))});file.encoding='BINARY';F.assert(file.open('r'),'Cannot read thumbnail.');var bytes=file.read();file.close();return F.encode(bytes);}finally{if(file.exists)file.remove();}
    };
    F.decode=function(s){var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',out=[],bits=0,value=0;for(var i=0;i<s.length;i++){var n=chars.indexOf(s.charAt(i));if(n<0)continue;value=(value<<6)|n;bits+=6;if(bits>=8){bits-=8;out.push(String.fromCharCode((value>>bits)&255));}}return out.join('');};
    F.encode=function(s){var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',out='';for(var i=0;i<s.length;i+=3){var a=s.charCodeAt(i)&255,b=i+1<s.length?s.charCodeAt(i+1)&255:0,c=i+2<s.length?s.charCodeAt(i+2)&255:0,n=(a<<16)|(b<<8)|c;out+=chars[(n>>>18)&63]+chars[(n>>>12)&63]+(i+1<s.length?chars[(n>>>6)&63]:'=')+(i+2<s.length?chars[n&63]:'=');}return out;};
    return F;
})();
