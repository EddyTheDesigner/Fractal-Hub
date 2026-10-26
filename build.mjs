import {readFile,writeFile,mkdir} from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('./',import.meta.url);await mkdir(new URL('dist/',root),{recursive:true});
const library=await readFile(new URL('src/library.js',root),'utf8'),context={};vm.runInNewContext(library,context);
const thumbs={};
for(const p of context.FractalHubLibrary.presets){thumbs[p.id]=[];for(let f=0;f<4;f++)thumbs[p.id].push((await readFile(new URL('assets/frames/'+p.id+'-'+f+'.png',root))).toString('base64'));}
const code='// Fractal Hub 1.1.0 | Original EffectCraft ScriptUI panel | MIT\n'+library+'\n'+await readFile(new URL('src/core.js',root),'utf8')+'\nvar FractalHubThumbnails='+JSON.stringify(thumbs)+';\n'+await readFile(new URL('src/panel.js',root),'utf8');
new vm.Script(code,{filename:'Fractal Hub.jsx'});
await writeFile(new URL('dist/Fractal Hub.jsx',root),code);console.log('Built '+context.FractalHubLibrary.presets.length+' presets, '+(Buffer.byteLength(code)/1048576).toFixed(2)+' MiB.');
