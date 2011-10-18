/* jquery.sparkline 1.6 - http://omnipotent.net/jquery.sparkline/
** Licensed under the New BSD License - see above site for details */

(function($){var defaults={common:{type:'line',lineColor:'#00f',fillColor:'#cdf',defaultPixelsPerValue:3,width:'auto',height:'auto',composite:false,tagValuesAttribute:'values',tagOptionsPrefix:'spark',enableTagOptions:false},line:{spotColor:'#f80',spotRadius:1.5,minSpotColor:'#f80',maxSpotColor:'#f80',lineWidth:1,normalRangeMin:undefined,normalRangeMax:undefined,normalRangeColor:'#ccc',drawNormalOnTop:false,chartRangeMin:undefined,chartRangeMax:undefined,chartRangeMinX:undefined,chartRangeMaxX:undefined},bar:{barColor:'#00f',negBarColor:'#f44',zeroColor:undefined,nullColor:undefined,zeroAxis:undefined,barWidth:4,barSpacing:1,chartRangeMax:undefined,chartRangeMin:undefined,chartRangeClip:false,colorMap:undefined},tristate:{barWidth:4,barSpacing:1,posBarColor:'#6f6',negBarColor:'#f44',zeroBarColor:'#999',colorMap:{}},discrete:{lineHeight:'auto',thresholdColor:undefined,thresholdValue:0,chartRangeMax:undefined,chartRangeMin:undefined,chartRangeClip:false},bullet:{targetColor:'red',targetWidth:3,performanceColor:'blue',rangeColors:['#D3DAFE','#A8B6FF','#7F94FF'],base:undefined},pie:{sliceColors:['#f00','#0f0','#00f']},box:{raw:false,boxLineColor:'black',boxFillColor:'#cdf',whiskerColor:'black',outlierLineColor:'#333',outlierFillColor:'white',medianColor:'red',showOutliers:true,outlierIQR:1.5,spotRadius:1.5,target:undefined,targetColor:'#4a2',chartRangeMax:undefined,chartRangeMin:undefined}};var VCanvas_base,VCanvas_canvas,VCanvas_vml;$.fn.simpledraw=function(width,height,use_existing){if(use_existing&&this[0].VCanvas){return this[0].VCanvas;}if(width===undefined){width=$(this).innerWidth();}if(height===undefined){height=$(this).innerHeight();}if($.browser.hasCanvas){return new VCanvas_canvas(width,height,this);}else if($.browser.msie){return new VCanvas_vml(width,height,this);}else{return false;}};var pending=[];$.fn.sparkline=function(uservalues,userOptions){return this.each(function(){var options=new $.fn.sparkline.options(this,userOptions);var render=function(){var values,width,height;if(uservalues==='html'||uservalues===undefined){var vals=this.getAttribute(options.get('tagValuesAttribute'));if(vals===undefined||vals===null){vals=$(this).html();}values=vals.replace(/(^\s*<!--)|(-->\s*$)|\s+/g,'').split(',');}else{values=uservalues;}width=options.get('width')=='auto'?values.length*options.get('defaultPixelsPerValue'):options.get('width');if(options.get('height')=='auto'){if(!options.get('composite')||!this.VCanvas){var tmp=document.createElement('span');tmp.innerHTML='a';$(this).html(tmp);height=$(tmp).innerHeight();$(tmp).remove();}}else{height=options.get('height');}$.fn.sparkline[options.get('type')].call(this,values,options,width,height);};if(($(this).html()&&$(this).is(':hidden'))||($.fn.jquery<"1.3.0"&&$(this).parents().is(':hidden'))||!$(this).parents('body').length){pending.push([this,render]);}else{render.call(this);}});};$.fn.sparkline.defaults=defaults;$.sparkline_display_visible=function(){for(var i=pending.length-1;i>=0;i--){var el=pending[i][0];if($(el).is(':visible')&&!$(el).parents().is(':hidden')){pending[i][1].call(el);pending.splice(i,1);}}};var UNSET_OPTION={};var normalizeValue=function(val){switch(val){case'undefined':val=undefined;break;case'null':val=null;break;case'true':val=true;break;case'false':val=false;break;default:var nf=parseFloat(val);if(val==nf){val=nf;}}return val;};$.fn.sparkline.options=function(tag,userOptions){var extendedOptions;this.userOptions=userOptions=userOptions||{};this.tag=tag;this.tagValCache={};var defaults=$.fn.sparkline.defaults;var base=defaults.common;this.tagOptionsPrefix=userOptions.enableTagOptions&&(userOptions.tagOptionsPrefix||base.tagOptionsPrefix);var tagOptionType=this.getTagSetting('type');if(tagOptionType===UNSET_OPTION){extendedOptions=defaults[userOptions.type||base.type];}else{extendedOptions=defaults[tagOptionType];}this.mergedOptions=$.extend({},base,extendedOptions,userOptions);};$.fn.sparkline.options.prototype.getTagSetting=function(key){var val,i,prefix=this.tagOptionsPrefix;if(prefix===false||prefix===undefined){return UNSET_OPTION;}if(this.tagValCache.hasOwnProperty(key)){val=this.tagValCache.key;}else{val=this.tag.getAttribute(prefix+key);if(val===undefined||val===null){val=UNSET_OPTION;}else if(val.substr(0,1)=='['){val=val.substr(1,val.length-2).split(',');for(i=val.length;i--;){val[i]=normalizeValue(val[i].replace(/(^\s*)|(\s*$)/g,''));}}else if(val.substr(0,1)=='{'){var pairs=val.substr(1,val.length-2).split(',');val={};for(i=pairs.length;i--;){var keyval=pairs[i].split(':',2);val[keyval[0].replace(/(^\s*)|(\s*$)/g,'')]=normalizeValue(keyval[1].replace(/(^\s*)|(\s*$)/g,''));}}else{val=normalizeValue(val);}this.tagValCache.key=val;}return val;};$.fn.sparkline.options.prototype.get=function(key){var tagOption=this.getTagSetting(key);if(tagOption!==UNSET_OPTION){return tagOption;}return this.mergedOptions[key];};$.fn.sparkline.line=function(values,options,width,height){var xvalues=[],yvalues=[],yminmax=[];for(var i=0;i<values.length;i++){var val=values[i];var isstr=typeof(values[i])=='string';var isarray=typeof(values[i])=='object'&&values[i]instanceof Array;var sp=isstr&&values[i].split(':');if(isstr&&sp.length==2){xvalues.push(Number(sp[0]));yvalues.push(Number(sp[1]));yminmax.push(Number(sp[1]));}else if(isarray){xvalues.push(val[0]);yvalues.push(val[1]);yminmax.push(val[1]);}else{xvalues.push(i);if(values[i]===null||values[i]=='null'){yvalues.push(null);}else{yvalues.push(Number(val));yminmax.push(Number(val));}}}if(options.get('xvalues')){xvalues=options.get('xvalues');}var maxy=Math.max.apply(Math,yminmax);var maxyval=maxy;var miny=Math.min.apply(Math,yminmax);var minyval=miny;var maxx=Math.max.apply(Math,xvalues);var minx=Math.min.apply(Math,xvalues);var normalRangeMin=options.get('normalRangeMin');var normalRangeMax=options.get('normalRangeMax');if(normalRangeMin!==undefined){if(normalRangeMin<miny){miny=normalRangeMin;}if(normalRangeMax>maxy){maxy=normalRangeMax;}}if(options.get('chartRangeMin')!==undefined&&(options.get('chartRangeClip')||options.get('chartRangeMin')<miny)){miny=options.get('chartRangeMin');}if(options.get('chartRangeMax')!==undefined&&(options.get('chartRangeClip')||options.get('chartRangeMax')>maxy)){maxy=options.get('chartRangeMax');}if(options.get('chartRangeMinX')!==undefined&&(options.get('chartRangeClipX')||options.get('chartRangeMinX')<minx)){minx=options.get('chartRangeMinX');}if(options.get('chartRangeMaxX')!==undefined&&(options.get('chartRangeClipX')||options.get('chartRangeMaxX')>maxx)){maxx=options.get('chartRangeMaxX');}var rangex=maxx-minx===0?1:maxx-minx;var rangey=maxy-miny===0?1:maxy-miny;var vl=yvalues.length-1;if(vl<1){this.innerHTML='';return;}var target=$(this).simpledraw(width,height,options.get('composite'));if(target){var canvas_width=target.pixel_width;var canvas_height=target.pixel_height;var canvas_top=0;var canvas_left=0;var spotRadius=options.get('spotRadius');if(spotRadius&&(canvas_width<(spotRadius*4)||canvas_height<(spotRadius*4))){spotRadius=0;}if(spotRadius){if(options.get('minSpotColor')||(options.get('spotColor')&&yvalues[vl]==miny)){canvas_height-=Math.ceil(spotRadius);}if(options.get('maxSpotColor')||(options.get('spotColor')&&yvalues[vl]==maxy)){canvas_height-=Math.ceil(spotRadius);canvas_top+=Math.ceil(spotRadius);}if(options.get('minSpotColor')||options.get('maxSpotColor')&&(yvalues[0]==miny||yvalues[0]==maxy)){canvas_left+=Math.ceil(spotRadius);canvas_width-=Math.ceil(spotRadius);}if(options.get('spotColor')||(options.get('minSpotColor')||options.get('maxSpotColor')&&(yvalues[vl]==miny||yvalues[vl]==maxy))){canvas_width-=Math.ceil(spotRadius);}}canvas_height--;var drawNormalRange=function(){if(normalRangeMin!==undefined){var ytop=canvas_top+Math.round(canvas_height-(canvas_height*((normalRangeMax-miny)/rangey)));var height=Math.round((canvas_height*(normalRangeMax-normalRangeMin))/rangey);target.drawRect(canvas_left,ytop,canvas_width,height,undefined,options.get('normalRangeColor'));}};if(!options.get('drawNormalOnTop')){drawNormalRange();}var path=[];var paths=[path];var x,y,vlen=yvalues.length;for(i=0;i<vlen;i++){x=xvalues[i];y=yvalues[i];if(y===null){if(i){if(yvalues[i-1]!==null){path=[];paths.push(path);}}}else{if(y<miny){y=miny;}if(y>maxy){y=maxy;}if(!path.length){path.push([canvas_left+Math.round((x-minx)*(canvas_width/rangex)),canvas_top+canvas_height]);}path.push([canvas_left+Math.round((x-minx)*(canvas_width/rangex)),canvas_top+Math.round(canvas_height-(canvas_height*((y-miny)/rangey)))]);}}var lineshapes=[];var fillshapes=[];var plen=paths.length;for(i=0;i<plen;i++){path=paths[i];if(!path.length){continue;}if(options.get('fillColor')){path.push([path[path.length-1][0],canvas_top+canvas_height-1]);fillshapes.push(path.slice(0));path.pop();}if(path.length>2){path[0]=[path[0][0],path[1][1]];}lineshapes.push(path);}plen=fillshapes.length;for(i=0;i<plen;i++){target.drawShape(fillshapes[i],undefined,options.get('fillColor'));}if(options.get('drawNormalOnTop')){drawNormalRange();}plen=lineshapes.length;for(i=0;i<plen;i++){target.drawShape(lineshapes[i],options.get('lineColor'),undefined,options.get('lineWidth'));}if(spotRadius&&options.get('spotColor')){target.drawCircle(canvas_left+Math.round(xvalues[xvalues.length-1]*(canvas_width/rangex)),canvas_top+Math.round(canvas_height-(canvas_height*((yvalues[vl]-miny)/rangey))),spotRadius,undefined,options.get('spotColor'));}if(maxy!=minyval){if(spotRadius&&options.get('minSpotColor')){x=xvalues[$.inArray(minyval,yvalues)];target.drawCircle(canvas_left+Math.round((x-minx)*(canvas_width/rangex)),canvas_top+Math.round(canvas_height-(canvas_height*((minyval-miny)/rangey))),spotRadius,undefined,options.get('minSpotColor'));}if(spotRadius&&options.get('maxSpotColor')){x=xvalues[$.inArray(maxyval,yvalues)];target.drawCircle(canvas_left+Math.round((x-minx)*(canvas_width/rangex)),canvas_top+Math.round(canvas_height-(canvas_height*((maxyval-miny)/rangey))),spotRadius,undefined,options.get('maxSpotColor'));}}}else{this.innerHTML='';}};$.fn.sparkline.bar=function(values,options,width,height){width=(values.length*options.get('barWidth'))+((values.length-1)*options.get('barSpacing'));var num_values=[];for(var i=0,vlen=values.length;i<vlen;i++){if(values[i]=='null'||values[i]===null){values[i]=null;}else{values[i]=Number(values[i]);num_values.push(Number(values[i]));}}var max=Math.max.apply(Math,num_values),min=Math.min.apply(Math,num_values);if(options.get('chartRangeMin')!==undefined&&(options.get('chartRangeClip')||options.get('chartRangeMin')<min)){min=options.get('chartRangeMin');}if(options.get('chartRangeMax')!==undefined&&(options.get('chartRangeClip')||options.get('chartRangeMax')>max)){max=options.get('chartRangeMax');}var zeroAxis=options.get('zeroAxis');if(zeroAxis===undefined){zeroAxis=min<0;}var range=max-min===0?1:max-min;var colorMapByIndex,colorMapByValue;if($.isArray(options.get('colorMap'))){colorMapByIndex=options.get('colorMap');colorMapByValue=null;}else{colorMapByIndex=null;colorMapByValue=options.get('colorMap');}var target=$(this).simpledraw(width,height,options.get('composite'));if(target){var color,canvas_height=target.pixel_height,yzero=min<0&&zeroAxis?canvas_height-Math.round(canvas_height*(Math.abs(min)/range))-1:canvas_height-1;for(i=values.length;i--;){var x=i*(options.get('barWidth')+options.get('barSpacing')),y,val=values[i];if(val===null){if(options.get('nullColor')){color=options.get('nullColor');val=(zeroAxis&&min<0)?0:min;height=1;y=(zeroAxis&&min<0)?yzero:canvas_height-height;}else{continue;}}else{if(val<min){val=min;}if(val>max){val=max;}color=(val<0)?options.get('negBarColor'):options.get('barColor');if(zeroAxis&&min<0){height=Math.round(canvas_height*((Math.abs(val)/range)))+1;y=(val<0)?yzero:yzero-height;}else{height=Math.round(canvas_height*((val-min)/range))+1;y=canvas_height-height;}if(val===0&&options.get('zeroColor')!==undefined){color=options.get('zeroColor');}if(colorMapByValue&&colorMapByValue[val]){color=colorMapByValue[val];}else if(colorMapByIndex&&colorMapByIndex.length>i){color=colorMapByIndex[i];}if(color===null){continue;}}target.drawRect(x,y,options.get('barWidth')-1,height-1,color,color);}}else{this.innerHTML='';}};$.fn.sparkline.tristate=function(values,options,width,height){values=$.map(values,Number);width=(values.length*options.get('barWidth'))+((values.length-1)*options.get('barSpacing'));var colorMapByIndex,colorMapByValue;if($.isArray(options.get('colorMap'))){colorMapByIndex=options.get('colorMap');colorMapByValue=null;}else{colorMapByIndex=null;colorMapByValue=options.get('colorMap');}var target=$(this).simpledraw(width,height,options.get('composite'));if(target){var canvas_height=target.pixel_height,half_height=Math.round(canvas_height/2);for(var i=values.length;i--;){var x=i*(options.get('barWidth')+options.get('barSpacing')),y,color;if(values[i]<0){y=half_height;height=half_height-1;color=options.get('negBarColor');}else if(values[i]>0){y=0;height=half_height-1;color=options.get('posBarColor');}else{y=half_height-1;height=2;color=options.get('zeroBarColor');}if(colorMapByValue&&colorMapByValue[values[i]]){color=colorMapByValue[values[i]];}else if(colorMapByIndex&&colorMapByIndex.length>i){color=colorMapByIndex[i];}if(color===null){continue;}target.drawRect(x,y,options.get('barWidth')-1,height-1,color,color);}}else{this.innerHTML='';}};$.fn.sparkline.discrete=function(values,options,width,height){values=$.map(values,Number);width=options.get('width')=='auto'?values.length*2:width;var interval=Math.floor(width/values.length);var target=$(this).simpledraw(width,height,options.get('composite'));if(target){var canvas_height=target.pixel_height,line_height=options.get('lineHeight')=='auto'?Math.round(canvas_height*0.3):options.get('lineHeight'),pheight=canvas_height-line_height,min=Math.min.apply(Math,values),max=Math.max.apply(Math,values);if(options.get('chartRangeMin')!==undefined&&(options.get('chartRangeClip')||options.get('chartRangeMin')<min)){min=options.get('chartRangeMin');}if(options.get('chartRangeMax')!==undefined&&(options.get('chartRangeClip')||options.get('chartRangeMax')>max)){max=options.get('chartRangeMax');}var range=max-min;for(var i=values.length;i--;){var val=values[i];if(val<min){val=min;}if(val>max){val=max;}var x=(i*interval),ytop=Math.round(pheight-pheight*((val-min)/range));target.drawLine(x,ytop,x,ytop+line_height,(options.get('thresholdColor')&&val<options.get('thresholdValue'))?options.get('thresholdColor'):options.get('lineColor'));}}else{this.innerHTML='';}};$.fn.sparkline.bullet=function(values,options,width,height){values=$.map(values,Number);width=options.get('width')=='auto'?'4.0em':width;var target=$(this).simpledraw(width,height,options.get('composite'));if(target&&values.length>1){var canvas_width=target.pixel_width-Math.ceil(options.get('targetWidth')/2),canvas_height=target.pixel_height,min=Math.min.apply(Math,values),max=Math.max.apply(Math,values);if(options.get('base')===undefined){min=min<0?min:0;}else{min=options.get('base');}var range=max-min;for(var i=2,vlen=values.length;i<vlen;i++){var rangeval=values[i],rangewidth=Math.round(canvas_width*((rangeval-min)/range));target.drawRect(0,0,rangewidth-1,canvas_height-1,options.get('rangeColors')[i-2],options.get('rangeColors')[i-2]);}var perfval=values[1],perfwidth=Math.round(canvas_width*((perfval-min)/range));target.drawRect(0,Math.round(canvas_height*0.3),perfwidth-1,Math.round(canvas_height*0.4)-1,options.get('performanceColor'),options.get('performanceColor'));var targetval=values[0],x=Math.round(canvas_width*((targetval-min)/range)-(options.get('targetWidth')/2)),targettop=Math.round(canvas_height*0.10),targetheight=canvas_height-(targettop*2);target.drawRect(x,targettop,options.get('targetWidth')-1,targetheight-1,options.get('targetColor'),options.get('targetColor'));}else{this.innerHTML='';}};$.fn.sparkline.pie=function(values,options,width,height){values=$.map(values,Number);width=options.get('width')=='auto'?height:width;var target=$(this).simpledraw(width,height,options.get('composite'));if(target&&values.length>1){var canvas_width=target.pixel_width,canvas_height=target.pixel_height,radius=Math.floor(Math.min(canvas_width,canvas_height)/2),total=0,next=0,circle=2*Math.PI;for(var i=values.length;i--;){total+=values[i];}if(options.get('offset')){next+=(2*Math.PI)*(options.get('offset')/360);}var vlen=values.length;for(i=0;i<vlen;i++){var start=next;var end=next;if(total>0){end=next+(circle*(values[i]/total));}target.drawPieSlice(radius,radius,radius,start,end,undefined,options.get('sliceColors')[i%options.get('sliceColors').length]);next=end;}}};var quartile=function(values,q){if(q==2){var vl2=Math.floor(values.length/2);return values.length%2?values[vl2]:(values[vl2]+values[vl2+1])/2;}else{var vl4=Math.floor(values.length/4);return values.length%2?(values[vl4*q]+values[vl4*q+1])/2:values[vl4*q];}};$.fn.sparkline.box=function(values,options,width,height){values=$.map(values,Number);width=options.get('width')=='auto'?'4.0em':width;var minvalue=options.get('chartRangeMin')===undefined?Math.min.apply(Math,values):options.get('chartRangeMin'),maxvalue=options.get('chartRangeMax')===undefined?Math.max.apply(Math,values):options.get('chartRangeMax'),target=$(this).simpledraw(width,height,options.get('composite')),vlen=values.length,lwhisker,loutlier,q1,q2,q3,rwhisker,routlier;if(target&&values.length>1){var canvas_width=target.pixel_width,canvas_height=target.pixel_height;if(options.get('raw')){if(options.get('showOutliers')&&values.length>5){loutlier=values[0];lwhisker=values[1];q1=values[2];q2=values[3];q3=values[4];rwhisker=values[5];routlier=values[6];}else{lwhisker=values[0];q1=values[1];q2=values[2];q3=values[3];rwhisker=values[4];}}else{values.sort(function(a,b){return a-b;});q1=quartile(values,1);q2=quartile(values,2);q3=quartile(values,3);var iqr=q3-q1;if(options.get('showOutliers')){lwhisker=undefined;rwhisker=undefined;for(var i=0;i<vlen;i++){if(lwhisker===undefined&&values[i]>q1-(iqr*options.get('outlierIQR'))){lwhisker=values[i];}if(values[i]<q3+(iqr*options.get('outlierIQR'))){rwhisker=values[i];}}loutlier=values[0];routlier=values[vlen-1];}else{lwhisker=values[0];rwhisker=values[vlen-1];}}var unitsize=canvas_width/(maxvalue-minvalue+1),canvas_left=0;if(options.get('showOutliers')){canvas_left=Math.ceil(options.get('spotRadius'));canvas_width-=2*Math.ceil(options.get('spotRadius'));unitsize=canvas_width/(maxvalue-minvalue+1);if(loutlier<lwhisker){target.drawCircle((loutlier-minvalue)*unitsize+canvas_left,canvas_height/2,options.get('spotRadius'),options.get('outlierLineColor'),options.get('outlierFillColor'));}if(routlier>rwhisker){target.drawCircle((routlier-minvalue)*unitsize+canvas_left,canvas_height/2,options.get('spotRadius'),options.get('outlierLineColor'),options.get('outlierFillColor'));}}target.drawRect(Math.round((q1-minvalue)*unitsize+canvas_left),Math.round(canvas_height*0.1),Math.round((q3-q1)*unitsize),Math.round(canvas_height*0.8),options.get('boxLineColor'),options.get('boxFillColor'));target.drawLine(Math.round((lwhisker-minvalue)*unitsize+canvas_left),Math.round(canvas_height/2),Math.round((q1-minvalue)*unitsize+canvas_left),Math.round(canvas_height/2),options.get('lineColor'));target.drawLine(Math.round((lwhisker-minvalue)*unitsize+canvas_left),Math.round(canvas_height/4),Math.round((lwhisker-minvalue)*unitsize+canvas_left),Math.round(canvas_height-canvas_height/4),options.get('whiskerColor'));target.drawLine(Math.round((rwhisker-minvalue)*unitsize+canvas_left),Math.round(canvas_height/2),Math.round((q3-minvalue)*unitsize+canvas_left),Math.round(canvas_height/2),options.get('lineColor'));target.drawLine(Math.round((rwhisker-minvalue)*unitsize+canvas_left),Math.round(canvas_height/4),Math.round((rwhisker-minvalue)*unitsize+canvas_left),Math.round(canvas_height-canvas_height/4),options.get('whiskerColor'));target.drawLine(Math.round((q2-minvalue)*unitsize+canvas_left),Math.round(canvas_height*0.1),Math.round((q2-minvalue)*unitsize+canvas_left),Math.round(canvas_height*0.9),options.get('medianColor'));if(options.get('target')){var size=Math.ceil(options.get('spotRadius'));target.drawLine(Math.round((options.get('target')-minvalue)*unitsize+canvas_left),Math.round((canvas_height/2)-size),Math.round((options.get('target')-minvalue)*unitsize+canvas_left),Math.round((canvas_height/2)+size),options.get('targetColor'));target.drawLine(Math.round((options.get('target')-minvalue)*unitsize+canvas_left-size),Math.round(canvas_height/2),Math.round((options.get('target')-minvalue)*unitsize+canvas_left+size),Math.round(canvas_height/2),options.get('targetColor'));}}else{this.innerHTML='';}};if($.browser.msie&&!document.namespaces.v){document.namespaces.add('v','urn:schemas-microsoft-com:vml','#default#VML');}if($.browser.hasCanvas===undefined){var t=document.createElement('canvas');$.browser.hasCanvas=t.getContext!==undefined;}VCanvas_base=function(width,height,target){};VCanvas_base.prototype={init:function(width,height,target){this.width=width;this.height=height;this.target=target;if(target[0]){target=target[0];}target.VCanvas=this;},drawShape:function(path,lineColor,fillColor,lineWidth){alert('drawShape not implemented');},drawLine:function(x1,y1,x2,y2,lineColor,lineWidth){return this.drawShape([[x1,y1],[x2,y2]],lineColor,lineWidth);},drawCircle:function(x,y,radius,lineColor,fillColor){alert('drawCircle not implemented');},drawPieSlice:function(x,y,radius,startAngle,endAngle,lineColor,fillColor){alert('drawPieSlice not implemented');},drawRect:function(x,y,width,height,lineColor,fillColor){alert('drawRect not implemented');},getElement:function(){return this.canvas;},_insert:function(el,target){$(target).html(el);}};VCanvas_canvas=function(width,height,target){return this.init(width,height,target);};VCanvas_canvas.prototype=$.extend(new VCanvas_base(),{_super:VCanvas_base.prototype,init:function(width,height,target){this._super.init(width,height,target);this.canvas=document.createElement('canvas');if(target[0]){target=target[0];}target.VCanvas=this;$(this.canvas).css({display:'inline-block',width:width,height:height,verticalAlign:'top'});this._insert(this.canvas,target);this.pixel_height=$(this.canvas).height();this.pixel_width=$(this.canvas).width();this.canvas.width=this.pixel_width;this.canvas.height=this.pixel_height;$(this.canvas).css({width:this.pixel_width,height:this.pixel_height});},_getContext:function(lineColor,fillColor,lineWidth){var context=this.canvas.getContext('2d');if(lineColor!==undefined){context.strokeStyle=lineColor;}context.lineWidth=lineWidth===undefined?1:lineWidth;if(fillColor!==undefined){context.fillStyle=fillColor;}return context;},drawShape:function(path,lineColor,fillColor,lineWidth){var context=this._getContext(lineColor,fillColor,lineWidth);context.beginPath();context.moveTo(path[0][0]+0.5,path[0][1]+0.5);for(var i=1,plen=path.length;i<plen;i++){context.lineTo(path[i][0]+0.5,path[i][1]+0.5);}if(lineColor!==undefined){context.stroke();}if(fillColor!==undefined){context.fill();}},drawCircle:function(x,y,radius,lineColor,fillColor){var context=this._getContext(lineColor,fillColor);context.beginPath();context.arc(x,y,radius,0,2*Math.PI,false);if(lineColor!==undefined){context.stroke();}if(fillColor!==undefined){context.fill();}},drawPieSlice:function(x,y,radius,startAngle,endAngle,lineColor,fillColor){var context=this._getContext(lineColor,fillColor);context.beginPath();context.moveTo(x,y);context.arc(x,y,radius,startAngle,endAngle,false);context.lineTo(x,y);context.closePath();if(lineColor!==undefined){context.stroke();}if(fillColor){context.fill();}},drawRect:function(x,y,width,height,lineColor,fillColor){return this.drawShape([[x,y],[x+width,y],[x+width,y+height],[x,y+height],[x,y]],lineColor,fillColor);}});VCanvas_vml=function(width,height,target){return this.init(width,height,target);};VCanvas_vml.prototype=$.extend(new VCanvas_base(),{_super:VCanvas_base.prototype,init:function(width,height,target){this._super.init(width,height,target);if(target[0]){target=target[0];}target.VCanvas=this;this.canvas=document.createElement('span');$(this.canvas).css({display:'inline-block',position:'relative',overflow:'hidden',width:width,height:height,margin:'0px',padding:'0px',verticalAlign:'top'});this._insert(this.canvas,target);this.pixel_height=$(this.canvas).height();this.pixel_width=$(this.canvas).width();this.canvas.width=this.pixel_width;this.canvas.height=this.pixel_height;var groupel='<v:group coordorigin="0 0" coordsize="'+this.pixel_width+' '+this.pixel_height+'"'+' style="position:absolute;top:0;left:0;width:'+this.pixel_width+'px;height='+this.pixel_height+'px;"></v:group>';this.canvas.insertAdjacentHTML('beforeEnd',groupel);this.group=$(this.canvas).children()[0];},drawShape:function(path,lineColor,fillColor,lineWidth){var vpath=[];for(var i=0,plen=path.length;i<plen;i++){vpath[i]=''+(path[i][0])+','+(path[i][1]);}var initial=vpath.splice(0,1);lineWidth=lineWidth===undefined?1:lineWidth;var stroke=lineColor===undefined?' stroked="false" ':' strokeWeight="'+lineWidth+'" strokeColor="'+lineColor+'" ';var fill=fillColor===undefined?' filled="false"':' fillColor="'+fillColor+'" filled="true" ';var closed=vpath[0]==vpath[vpath.length-1]?'x ':'';var vel='<v:shape coordorigin="0 0" coordsize="'+this.pixel_width+' '+this.pixel_height+'" '+stroke+fill+' style="position:absolute;left:0px;top:0px;height:'+this.pixel_height+'px;width:'+this.pixel_width+'px;padding:0px;margin:0px;" '+' path="m '+initial+' l '+vpath.join(', ')+' '+closed+'e">'+' </v:shape>';this.group.insertAdjacentHTML('beforeEnd',vel);},drawCircle:function(x,y,radius,lineColor,fillColor){x-=radius+1;y-=radius+1;var stroke=lineColor===undefined?' stroked="false" ':' strokeWeight="1" strokeColor="'+lineColor+'" ';var fill=fillColor===undefined?' filled="false"':' fillColor="'+fillColor+'" filled="true" ';var vel='<v:oval '+stroke+fill+' style="position:absolute;top:'+y+'px; left:'+x+'px; width:'+(radius*2)+'px; height:'+(radius*2)+'px"></v:oval>';this.group.insertAdjacentHTML('beforeEnd',vel);},drawPieSlice:function(x,y,radius,startAngle,endAngle,lineColor,fillColor){if(startAngle==endAngle){return;}if((endAngle-startAngle)==(2*Math.PI)){startAngle=0.0;endAngle=(2*Math.PI);}var startx=x+Math.round(Math.cos(startAngle)*radius);var starty=y+Math.round(Math.sin(startAngle)*radius);var endx=x+Math.round(Math.cos(endAngle)*radius);var endy=y+Math.round(Math.sin(endAngle)*radius);if(startx==endx&&starty==endy&&(endAngle-startAngle)<Math.PI){return;}var vpath=[x-radius,y-radius,x+radius,y+radius,startx,starty,endx,endy];var stroke=lineColor===undefined?' stroked="false" ':' strokeWeight="1" strokeColor="'+lineColor+'" ';var fill=fillColor===undefined?' filled="false"':' fillColor="'+fillColor+'" filled="true" ';var vel='<v:shape coordorigin="0 0" coordsize="'+this.pixel_width+' '+this.pixel_height+'" '+stroke+fill+' style="position:absolute;left:0px;top:0px;height:'+this.pixel_height+'px;width:'+this.pixel_width+'px;padding:0px;margin:0px;" '+' path="m '+x+','+y+' wa '+vpath.join(', ')+' x e">'+' </v:shape>';this.group.insertAdjacentHTML('beforeEnd',vel);},drawRect:function(x,y,width,height,lineColor,fillColor){return this.drawShape([[x,y],[x,y+height],[x+width,y+height],[x+width,y],[x,y]],lineColor,fillColor);}});})(jQuery);


// Underscore.js 1.2.0
// (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function q(a,c,d){if(a===c)return a!==0||1/a==1/c;if(a==null)return a===c;var e=typeof a;if(e!=typeof c)return false;if(!a!=!c)return false;if(b.isNaN(a))return b.isNaN(c);var f=b.isString(a),g=b.isString(c);if(f||g)return f&&g&&String(a)==String(c);f=b.isNumber(a);g=b.isNumber(c);if(f||g)return f&&g&&+a==+c;f=b.isBoolean(a);g=b.isBoolean(c);if(f||g)return f&&g&&+a==+c;f=b.isDate(a);g=b.isDate(c);if(f||g)return f&&g&&a.getTime()==c.getTime();f=b.isRegExp(a);g=b.isRegExp(c);if(f||g)return f&&g&&a.source==c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase;if(e!="object")return false;if(a._chain)a=a._wrapped;if(c._chain)c=c._wrapped;if(b.isFunction(a.isEqual))return a.isEqual(c);for(e=d.length;e--;)if(d[e]==a)return true;d.push(a);e=0;f=true;if(a.length===+a.length||c.length===+c.length){if(e=a.length,f=e==c.length)for(;e--;)if(!(f=e in a==e in c&&q(a[e],c[e],d)))break}else{for(var h in a)if(l.call(a,h)&&(e++,!(f=l.call(c,h)&&q(a[h],c[h],d))))break;if(f){for(h in c)if(l.call(c,h)&&!e--)break;f=!e}}d.pop();return f}var r=this,F=r._,n={},k=Array.prototype,o=Object.prototype,i=k.slice,G=k.unshift,u=o.toString,l=o.hasOwnProperty,v=k.forEach,w=k.map,x=k.reduce,y=k.reduceRight,z=k.filter,A=k.every,B=k.some,p=k.indexOf,C=k.lastIndexOf,o=Array.isArray,H=Object.keys,s=Function.prototype.bind,b=function(a){return new m(a)};typeof module!=="undefined"&&module.exports?(module.exports=b,b._=b):r._=b;b.VERSION="1.2.0";var j=b.each=b.forEach=function(a,c,b){if(a!=null)if(v&&a.forEach===v)a.forEach(c,b);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(b,a[e],e,a)===n)break}else for(e in a)if(l.call(a,e)&&c.call(b,a[e],e,a)===n)break};b.map=function(a,c,b){var e=[];if(a==null)return e;if(w&&a.map===w)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=d!==void 0;a==null&&(a=[]);if(x&&a.reduce===x)return e&&(c=b.bind(c,e)),f?a.reduce(c,d):a.reduce(c);j(a,function(a,b,i){f?d=c.call(e,d,a,b,i):(d=a,f=true)});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){a==null&&(a=[]);if(y&&a.reduceRight===y)return e&&(c=b.bind(c,e)),d!==void 0?a.reduceRight(c,d):a.reduceRight(c);a=(b.isArray(a)?a.slice():b.toArray(a)).reverse();return b.reduce(a,c,d,e)};b.find=b.detect=function(a,c,b){var e;D(a,function(a,g,h){if(c.call(b,a,g,h))return e=a,true});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.filter===z)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(A&&a.every===A)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,a,g,h)))return n});return e};var D=b.some=b.any=function(a,c,d){var c=c||b.identity,e=false;if(a==null)return e;if(B&&a.some===B)return a.some(c,d);j(a,function(a,b,h){if(e|=c.call(d,a,b,h))return n});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(p&&a.indexOf===p)return a.indexOf(c)!=-1;D(a,function(a){if(b=a===c)return true});return b};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(c.call?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var c=[],b;j(a,function(a,f){f==0?c[0]=a:(b=Math.floor(Math.random()*(f+1)),c[f]=c[b],c[b]=a)});return c};b.sortBy=function(a,c,d){return b.pluck(b.map(a,function(a,b,g){return{value:a,criteria:c.call(d,a,b,g)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,b){var d={};j(a,function(a,f){var g=b(a,f);(d[g]||(d[g]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:a.toArray?a.toArray():b.isArray(a)?i.call(a):b.isArguments(a)?i.call(a):b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,a.length-b):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a){return b.reduce(a,function(a,d){if(b.isArray(d))return a.concat(b.flatten(d));a[a.length]=d;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,e=[];b.reduce(d,function(d,g,h){if(0==h||(c===true?b.last(d)!=g:!b.include(d,g)))d[d.length]=g,e[e.length]=a[h];return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a,c){return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d)return d=b.sortedIndex(a,c),a[d]===c?d:-1;if(p&&a.indexOf===p)return a.indexOf(c);for(d=0,e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(C&&a.lastIndexOf===C)return a.lastIndexOf(b);for(var d=a.length;d--;)if(a[d]===b)return d;return-1};b.range=function(a,b,d){arguments.length<=1&&(b=a||0,a=0);for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;)g[f++]=a,a+=d;return g};b.bind=function(a,b){if(a.bind===s&&s)return s.apply(a,i.call(arguments,1));var d=i.call(arguments,2);return function(){return a.apply(b,d.concat(i.call(arguments)))}};b.bindAll=function(a){var c=i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var b=c.apply(this,arguments);return l.call(d,b)?d[b]:d[b]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};var E=function(a,b,d){var e;return function(){var f=this,g=arguments,h=function(){e=null;a.apply(f,g)};d&&clearTimeout(e);if(d||!e)e=setTimeout(h,b)}};b.throttle=function(a,b){return E(a,b,false)};b.debounce=function(a,b){return E(a,b,true)};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments));return b.apply(this,d)}};b.compose=function(){var a=i.call(arguments);return function(){for(var b=i.call(arguments),d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return function(){if(--a<1)return b.apply(this,arguments)}};b.keys=H||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],d;for(d in a)l.call(a,d)&&(b[b.length]=d);return b};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)b[d]!==void 0&&(a[d]=b[d])});return a};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return q(a,b,[])};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(l.call(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=o||function(a){return u.call(a)==="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return!(!a||!l.call(a,"callee"))};b.isFunction=function(a){return!(!a||!a.constructor||!a.call||!a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};b.isNumber=function(a){return!!(a===0||a&&a.toExponential&&a.toFixed)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||u.call(a)=="[object Boolean]"};b.isDate=function(a){return!(!a||!a.getTimezoneOffset||!a.setUTCFullYear)};b.isRegExp=function(a){return!(!a||!a.test||!a.exec||!(a.ignoreCase||a.ignoreCase===false))};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.noConflict=function(){r._=F;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.mixin=function(a){j(b.functions(a),function(c){I(c,b[c]=a[c])})};var J=0;b.uniqueId=function(a){var b=J++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};b.template=function(a,c){var d=b.templateSettings,d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.escape,function(a,b){return"',_.escape("+b.replace(/\\'/g,"'")+"),'"}).replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||null,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');",d=new Function("obj",d);return c?d(c):d};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var t=function(a,c){return c?b(a).chain():a},I=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);G.call(a,this._wrapped);return t(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){b.apply(this._wrapped,arguments);return t(this._wrapped,this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return t(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}})();