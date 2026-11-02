/* Image loading, cache ownership and idle preparation. No game state is changed here. */
/* Prepare next-level pixels in idle turns without owning the Phaser loader or game state. */
function createNextLevelPreparer(options={}){
 const env=typeof globalThis==='object'?globalThis:{},fetchImage=options.fetch||env.fetch?.bind(env),ImageClass=options.Image||env.Image,urls=options.URL||env.URL;
 const later=options.setTimeout||env.setTimeout?.bind(env),clearLater=options.clearTimeout||env.clearTimeout?.bind(env);
 const idle=options.requestIdleCallback||env.requestIdleCallback?.bind(env),clearIdle=options.cancelIdleCallback||env.cancelIdleCallback?.bind(env);
 const isPreview=options.isPreview||(()=>false),makePreview=options.preparePreview||(()=>false),canWork=options.canWork||(()=>true),onError=options.onError||(()=>{});
 const previewImages=options.preparedPreviews||new Map();let current=null;
 const live=job=>current===job&&!job.controller.signal.aborted&&job.scene.active===true;
 const abortError=()=>Object.assign(new Error('Image preparation cancelled'),{name:'AbortError'});
 function cancel(){current?.controller.abort();current=null;}
 function turn(job){
  return new Promise(resolve=>{
   const signal=job.controller.signal;let handle=null,finished=false;
   const cleanup=()=>{signal.removeEventListener('abort',stop);if(handle!==null){if(idle&&clearIdle)clearIdle(handle);else clearLater(handle);}handle=null;};
   const finish=value=>{if(finished)return;finished=true;cleanup();resolve(value);},stop=()=>finish(false);
   const schedule=()=>{handle=idle?idle(run,{timeout:1500}):later(run,32);};
   const run=deadline=>{handle=null;if(!live(job))return finish(false);if(!canWork(job.scene)||deadline&&!deadline.didTimeout&&typeof deadline.timeRemaining==='function'&&deadline.timeRemaining()<4)return schedule();finish(true);};
   signal.addEventListener('abort',stop,{once:true});if(live(job))schedule();else finish(false);
  });
 }
 function cancellable(promise,signal){
  return new Promise((resolve,reject)=>{
   const stop=()=>{signal.removeEventListener('abort',stop);reject(abortError());};
   signal.addEventListener('abort',stop,{once:true});
   Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',stop);resolve(value);},error=>{signal.removeEventListener('abort',stop);reject(error);});
   if(signal.aborted)stop();
  });
 }
 async function decode(blob,job){
  const signal=job.controller.signal,image=new ImageClass(),url=urls.createObjectURL(blob);let accepted=false;
  try{
   image.decoding='async';
   await cancellable(new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Image could not be decoded'));image.src=url;}),signal);
   if(!live(job))throw abortError();
   if(typeof image.decode==='function')await cancellable(image.decode(),signal);
   if(!live(job))throw abortError();
   if(!(image.naturalWidth||image.width)||!(image.naturalHeight||image.height))throw new Error('Image has no dimensions');
   accepted=true;return image;
  }finally{
   image.onload=null;image.onerror=null;if(!accepted)image.src='';urls.revokeObjectURL(url);
  }
 }
 async function prepare(owner,scene,level,signal){
  cancel();
  if(!scene.active||signal.aborted||!fetchImage||!ImageClass||!urls?.createObjectURL)return false;
  const controller=new AbortController(),job={controller,scene};current=job;
  const stop=()=>controller.abort();signal.addEventListener('abort',stop,{once:true});
  const groups=new Map();
  for(const item of owner.missing('game',level)){
   if(item.path.startsWith('data:'))continue;
   if(!groups.has(item.path))groups.set(item.path,[]);groups.get(item.path).push(item);
  }
  const entries=[...groups];let next=0,ok=true;
  try{
   await Promise.all(Array.from({length:Math.min(2,entries.length)},async()=>{
    while(next<entries.length&&live(job)){
     const [path,items]=entries[next++];
     try{
      let image=owner.loadedByURL.get(path);
      if(!image){
       if(!await turn(job))return;
       const response=await fetchImage(path,{signal:controller.signal,credentials:'same-origin',cache:'default',priority:'low'});
       if(!response.ok)throw new Error('Image request failed: '+response.status);
       const blob=await response.blob();if(!live(job))return;
       if(!await turn(job))return;
       image=await decode(blob,job);if(!live(job))return;
       if(owner.loadedByURL.has(path))image=owner.loadedByURL.get(path);else owner.loadedByURL.set(path,image);
      }
      for(const item of items){
       if(!isPreview(item)||previewImages.get(item.key)===image)continue;
       if(!await turn(job))return;
       const ready=makePreview(item,image);
       if(!live(job))return;
       if(ready!==false)previewImages.set(item.key,image);else ok=false;
      }
     }catch(error){if(!live(job))return;ok=false;onError(path,error);}
    }
   }));
   return live(job)&&ok;
  }finally{
   signal.removeEventListener('abort',stop);if(current===job)current=null;
  }
 }
 return {prepare,cancel,preparedPreviews:previewImages,previewImages,isPreviewReady:(key,image)=>previewImages.get(key)===image};
}

function appleTouchDevice(nav=typeof navigator==='undefined'?{}:navigator){return /iPhone|iPad|iPod/.test(nav.userAgent||'')||(nav.platform==='MacIntel'&&nav.maxTouchPoints>1);}
function gameLoaderConfig(nav){return {imageLoadType:appleTouchDevice(nav)?'XHR':'HTMLImageElement',maxParallelDownloads:appleTouchDevice(nav)?4:32,timeout:20000,crossOrigin:null};}
/* Screen-scoped loading. Artwork and model data are unchanged. */
const AssetLoading={
 failed:new Set(),loadedByURL:new Map(),preparedPreviews:new Map(),
 orientation(){return typeof window!=='undefined'&&window.innerHeight>=window.innerWidth?'portrait':'landscape';},
 plan(mode,level=LEVELS[0]){
  const home=new Set(['logo','bg_start_landscape','bg_start_portrait','ui_button_round','ui_button_green','ui_panel','panel','ui_sign','level_sign','icon_lock','icon_back','icon_back_light','icon_settings','icon_settings_light','icon_sound','icon_mute','icon_sound_on_light','icon_sound_off_light']);
  const map=new Set(['icon_basket','icon_watering_can','icon_watering_can_pour','icon_arrow_down','icon_drop','icon_drop_empty','fx_sparkle','field_tile','map_butterfly','stepping_stone_1','stepping_stone_2','stepping_stone_3','deco_bench','deco_scarecrow','deco_pond']);
  const game=new Set(['bed_frame','seed_drawer','seed_box','seed','bg_game_landscape','bg_game_portrait']);
  const plants=new Set(PLANT_FILES.map(f=>f.key)),terrain=new Set(TERRAIN_FILES.map(f=>f.key)),types=Object.keys(level?.seeds||{});
  return IMAGE_FILES.filter(f=>{
   if(mode==='map')return true;
   if(mode==='backdrop')return f.key==='bg_'+level.background+'_'+this.orientation();
   if(/^bg_(?:start|game)_/.test(f.key)){const kind=mode==='home'||mode==='result'?'start':mode==='game'?'game':null;return !!kind&&f.key==='bg_'+kind+'_'+this.orientation();}
   if(mode==='home')return home.has(f.key);
   if(mode==='result')return home.has(f.key)||['icon_star','icon_star_empty'].includes(f.key);
   if(map.has(f.key))return false;
   if(terrain.has(f.key))return mode!=='game'||f.key!=='soil_rocks'||!!(level?.terrain?.includes('R')||level?.map?.some(row=>row.includes('R')));
   if(plants.has(f.key)){
    const adults=new Set([...types,...(types.includes('basil')?['tomato']:[]),...(types.includes('beans')?['onion']:[])]);
    return f.key.endsWith('_adult')?(mode==='rules'||[...adults].some(t=>f.key===t+'_adult')):(mode==='game'&&(f.key==='seed'||types.some(t=>f.key.startsWith(t+'_'))));
   }
   if(game.has(f.key))return mode==='game';
   return true;
  });
 },
 missing(mode,level){return this.plan(mode,level).filter(f=>!LoadedAssets.has(f.key)&&!this.failed.has(f.key));},
 fallbackKeys(scene,mode,level,planned=new Set(this.missing(mode,level).map(f=>f.key))){
  if(mode==='home'||mode==='result'||mode==='backdrop')return [];
  const types=mode==='map'?TYPES:Object.keys(level?.seeds||{});
  const keys=[...MISC_KEYS,...(mode==='game'||mode==='map'?PLANT_FILES.filter(f=>f.key==='seed'||types.some(t=>f.key.startsWith(t+'_'))).map(f=>f.key):[])];
  if([...this.failed].some(k=>k.startsWith('soil_')))for(const kind of ['sun','shade','rocks'])for(let v=0;v<SOIL_VARIANTS;v++)keys.push(`soil_${kind}_v${v}`);
  return [...new Set(keys)].filter(k=>!scene.textures.exists(k)&&!LoadedAssets.has(k)&&!planned.has(k));
 },
 queue(scene,mode,level,optional=false){
  const items=this.missing(mode,level),planned=new Set(items.map(f=>f.key)),fallbacks=new Set();
  const requiredFallbacks=this.fallbackKeys(scene,mode,level,planned);if(!items.length&&!requiredFallbacks.length)return items;
  const fallback=key=>{
   if(scene.textures.exists(key)||fallbacks.has(key))return;
   fallbacks.add(key);const size=key==='seed'||TYPES.some(t=>key.startsWith(t+'_'))?512:256;
   scene.load.svg(key,svgDataURI(textureSVG(key)),{width:size,height:size});
  };
  const terrainFallback=()=>{for(const kind of ['sun','shade','rocks'])for(let v=0;v<SOIL_VARIANTS;v++)fallback(`soil_${kind}_v${v}`);};
  const onError=file=>{
   // Optional Home preparation keeps successful files and lets Play retry failures.
   if(optional){console.warn('Could not prepare image: '+file.key+' — it will be retried when needed.');return;}
   if(file.key.startsWith('asset__')){
    const key=file.key.slice(7),item=IMAGE_FILES.find(f=>f.key===key),group=item?IMAGE_FILES.filter(f=>f.path===item.path):[{key}];
    console.warn('Missing image: '+(item?.path||file.url)+' — using fallback.');
    for(const alias of group){this.failed.add(alias.key);if(ART_KEYS.includes(alias.key))fallback(alias.key);}
    if(group.some(alias=>alias.key.startsWith('soil_')))terrainFallback();
   }else{scene.assetFailed=true;if(!scene.assetBatchActive)showStartupError(new Error('Fallback texture failed: '+file.key));else console.warn('Fallback texture failed: '+file.key);}
  };
  scene.load.on('loaderror',onError);
  const cleanup=()=>{scene.load.off('loaderror',onError);scene.load.off('complete',cleanup);scene.events.off('shutdown',cleanup);if(scene.assetQueueCleanup===cleanup)scene.assetQueueCleanup=null;};scene.assetQueueCleanup=cleanup;
  scene.load.once('complete',cleanup);scene.events.once('shutdown',cleanup);
  const queuedURLs=new Set();
  for(const item of items){if(this.loadedByURL.has(item.path)||queuedURLs.has(item.path))continue;queuedURLs.add(item.path);scene.load.image('asset__'+item.key,item.path);}
  for(const key of requiredFallbacks)fallback(key);
  return items;
 },
 install(scene,mode,level){
  const wanted=mode?new Set(this.plan(mode,level).map(f=>f.key)):null;
  // A single image download can satisfy several stable texture keys.
  const staged=new Map();
  for(const {key,path}of IMAGE_FILES){const override='asset__'+key;if(scene.textures.exists(override)){const image=scene.textures.get(override).source[0].image;staged.set(path,{key,override,image});this.loadedByURL.set(path,image);}}
  for(const {key,path}of IMAGE_FILES){
   if(wanted&&!wanted.has(key))continue;
   const entry=staged.get(path),image=entry?.image||this.loadedByURL.get(path);if(!image)continue;
   if(LoadedAssets.get(key)===path&&AssetImages.get(key)===image&&scene.textures.exists(key))continue;
   if(scene.textures.exists(key))scene.textures.remove(key);
   if(entry?.key===key)scene.textures.renameTexture(entry.override,key);else scene.textures.addImage(key,image);
   LoadedAssets.set(key,path);AssetImages.set(key,image);this.failed.delete(key);
   const type=TYPES.find(t=>key===t+'_adult');if(type&&this.preparedPreviews.get(key)!==image){AdultPreviews.delete(type);cacheAdultPreview(type,image,path);}
   if(TERRAIN_FILES.some(f=>f.key===key)&&this.preparedPreviews.get(key)!==image){TerrainPreviews.delete(key);cacheTerrainPreview(key,image,path);}
  }
 },
 ensure(scene,mode,level=scene.l,optional=false){
  if(scene.active===false)return Promise.resolve(false);
  this.install(scene,mode,level);
  if(!this.missing(mode,level).length&&!this.fallbackKeys(scene,mode,level).length)return Promise.resolve(true);
  if(scene.assetLoadPromise){const preparing=scene.assetBatchOptional;return scene.assetLoadPromise.then(ok=>ok||preparing?this.ensure(scene,mode,level,optional):false);}
  const promise=new Promise(resolve=>{
   let ended=false,timer=null;scene.assetFailed=false;scene.assetBatchActive=true;scene.assetBatchOptional=optional;
   const arm=()=>{window.clearTimeout(timer);timer=window.setTimeout(stalled,30000);};
   const stalled=()=>{if(document.hidden){arm();return;}finish(false,true);};
   const finish=(ok,reset=false)=>{
    if(ended)return;ended=true;window.clearTimeout(timer);scene.load.off('progress',arm);scene.load.off('filecomplete',arm);scene.load.off('complete',done);scene.events.off('shutdown',cancel);document.removeEventListener?.('visibilitychange',arm);scene.assetQueueCleanup?.();
    if(ok||reset)this.install(scene,mode,level);if(reset)scene.load.reset?.();scene.assetBatchActive=false;scene.assetBatchOptional=false;resolve(ok&&!scene.assetFailed&&(!optional||!this.missing(mode,level).length&&!this.fallbackKeys(scene,mode,level).length));
   };
   const done=()=>finish(true),cancel=()=>finish(false);
   scene.events.once('shutdown',cancel);this.queue(scene,mode,level,optional);scene.load.once('complete',done);scene.load.on('progress',arm);scene.load.on('filecomplete',arm);document.addEventListener?.('visibilitychange',arm);arm();scene.load.start();
  });
  const tracked=promise.finally(()=>{if(scene.assetLoadPromise===tracked)scene.assetLoadPromise=null;});
  scene.assetLoadPromise=tracked;return tracked;
 },
 warm(scene,level,signal){
  if(!this.preparer)this.preparer=createNextLevelPreparer({
   preparedPreviews:this.preparedPreviews,
   canWork:s=>!document.hidden&&!s.drag&&!s.seedGesture&&!s.assetLoadPromise&&(!s.modal||s.winning),
   isPreview:f=>f.key.endsWith('_adult')||TERRAIN_FILES.some(t=>t.key===f.key),
   preparePreview:(file,image)=>{
    const type=TYPES.find(t=>file.key===t+'_adult');
    if(type){AdultPreviews.delete(type);cacheAdultPreview(type,image,file.path);return AdultPreviews.has(type);}
    TerrainPreviews.delete(file.key);cacheTerrainPreview(file.key,image,file.path);return TerrainPreviews.has(file.key);
   }
  });
  return this.preparer.prepare(this,scene,level,signal);
 },
 refreshBackground(scene){
  if(!scene.active)return;
  const background=scene.worldScreen?.classList.contains('home-screen')?'start':'game',level={background},key=background+'/'+this.orientation();
  if(!this.missing('backdrop',level).length||scene.backgroundWanted===key)return;
  scene.backgroundWanted=key;
  return this.ensure(scene,'backdrop',level,true).then(()=>{if(scene.active)applyAssetDecor(false);}).finally(()=>{if(scene.backgroundWanted===key)scene.backgroundWanted=null;});
 }


};

