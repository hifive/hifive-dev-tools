/*
 * Copyright (c) 2007 Edward Benson
 * Copyright (C) 2012-2014 NS Solutions Corporation
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * version 1.0.h5mod
 * gitCommitId : 77423d67d2e34680e128be6d9e1fe616c45a9cc4
 */
(function(){var h=function(a,b){for(var c=b.exec(a),d=[],e;null!=c;)e=c.index,0!=e&&(a.substring(0,e),d.push(a.substring(0,e)),a=a.slice(e)),d.push(c[0]),a=a.slice(c[0].length),c=b.exec(a);""==!a&&d.push(a);return d},i=function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};EJS=function(a){a="string"==typeof a?{view:a}:a;this.set_options(a);if(a.precompiled)this.template={},this.template.process=a.precompiled,EJS.update(this.name,this);else{if(a.element){if("string"==typeof a.element){var b=
a.element;a.element=document.getElementById(a.element);if(null==a.element)throw b+"does not exist!";}this.text=a.element.value?a.element.value:a.element.innerHTML;this.name=a.element.id;this.type="["}else if(a.url){a.url=EJS.endExt(a.url,this.extMatch);this.name=this.name?this.name:a.url;var b=a.url,c=EJS.get(this.name,this.cache);if(c)return c;if(c==EJS.INVALID_PATH)return null;try{this.text=EJS.request(b+(this.cache?"":"?"+Math.random()))}catch(d){}if(null==this.text)throw{type:"EJS",message:"There is no template at "+
b};}c=new EJS.Compiler(this.text,this.type);c.compile(a,this.name);EJS.update(this.name,this);this.template=c}};EJS.prototype={render:function(a,b){a=a||{};this._extra_helpers=b;var c=new EJS.Helpers(a,b||{});return this.template.process.call(a,a,c)},update:function(a,b){"string"==typeof a&&(a=document.getElementById(a));if(null==b)return _template=this,function(b){EJS.prototype.update.call(_template,a,b)};"string"==typeof b?(params={},params.url=b,_template=this,params.onComplete=function(b){b=eval(b.responseText);
EJS.prototype.update.call(_template,a,b)},EJS.ajax_request(params)):a.innerHTML=this.render(b)},out:function(){return this.template.out},set_options:function(a){this.type=a.type||EJS.type;this.cache=null!=a.cache?a.cache:EJS.cache;this.text=a.text||null;this.name=a.name||null;this.ext=a.ext||EJS.ext;this.extMatch=RegExp(this.ext.replace(/\./,"."))}};EJS.endExt=function(a,b){if(!a)return null;b.lastIndex=0;return a+(b.test(a)?"":this.ext)};EJS.Scanner=function(a,b,c){i(this,{left_delimiter:b+"%",right_delimiter:"%"+
c,double_left:b+"%%",double_right:"%%"+c,left_equal:b+"%=",left_equal_noescape:b+"%:=",left_comment:b+"%#"});this.SplitRegexp="["==b?/(\[%%)|(%%\])|(\[%=)|(\[%:=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/:RegExp("("+this.double_left+")|(%%"+this.double_right+")|("+this.left_equal_noescape+")|("+this.left_equal+")|("+this.left_comment+")|("+this.left_delimiter+")|("+this.right_delimiter+"\n)|("+this.right_delimiter+")|(\n)");this.source=a;this.stag=null;this.lines=0};EJS.Scanner.to_text=function(a){return null==
a||void 0===a?"":a instanceof Date?a.toDateString():a.toString?a.toString():""};EJS.Scanner.prototype={scan:function(a){var b=this.SplitRegexp;if(""==!this.source)for(var c=h(this.source,/\n/),d=0;d<c.length;d++)this.scanline(c[d],b,a)},scanline:function(a,b,c){this.lines++;a=h(a,b);for(b=0;b<a.length;b++){var d=a[b];if(null!=d)try{c(d,this)}catch(e){throw{type:"EJS.Scanner",line:this.lines};}}}};EJS.Buffer=function(a,b){this.line=[];this.script="";this.pre_cmd=a;this.post_cmd=b;for(var c=0;c<this.pre_cmd.length;c++)this.push(a[c])};
EJS.Buffer.prototype={push:function(a){this.line.push(a)},cr:function(){this.script+=this.line.join("; ");this.line=[];this.script+="\n"},close:function(){if(0<this.line.length){for(var a=0;a<this.post_cmd.length;a++)this.push(pre_cmd[a]);this.script+=this.line.join("; ");this.line=null}}};EJS.Compiler=function(a,b){this.pre_cmd=["var ___ViewO = [];"];this.post_cmd=[];this.source=" ";if(null!=a&&("string"==typeof a?(a=a.replace(/\r\n/g,"\n"),this.source=a=a.replace(/\r/g,"\n")):a.innerHTML&&(this.source=
a.innerHTML),"string"!=typeof this.source))this.source="";var b=b||"<",c=">";switch(b){case "[":c="]";break;case "<":break;default:throw b+" is not a supported deliminator";}this.scanner=new EJS.Scanner(this.source,b,c);this.out=""};EJS.Compiler.prototype={compile:function(a,b){a=a||{};this.out="";var c=new EJS.Buffer(this.pre_cmd,this.post_cmd),d="",e=function(a){a=a.replace(/\\/g,"\\\\");a=a.replace(/\n/g,"\\n");return a=a.replace(/"/g,'\\"')};this.scanner.scan(function(a,b){if(null==b.stag)switch(a){case "\n":d+=
"\n";c.push('___ViewO.push("'+e(d)+'");');c.cr();d="";break;case b.left_delimiter:case b.left_equal:case b.left_equal_noescape:case b.left_comment:b.stag=a;0<d.length&&c.push('___ViewO.push("'+e(d)+'")');d="";break;case b.double_left:d+=b.left_delimiter;break;default:d+=a}else switch(a){case b.right_delimiter:switch(b.stag){case b.left_delimiter:"\n"==d[d.length-1]?(d=d.substr(0,d.length-1),c.push(d),c.cr()):c.push(d);break;case b.left_equal_noescape:c.push("___ViewO.push((EJS.Scanner.to_text("+d+
")))");break;case b.left_equal:c.push("___ViewO.push((EJS.Scanner.to_text(h5.u.str.escapeHtml("+d+"))))")}b.stag=null;d="";break;case b.double_right:d+=b.right_delimiter;break;default:d+=a}});0<d.length&&c.push('___ViewO.push("'+e(d)+'")');c.close();this.out=c.script+";";var g="/*"+b+"*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {"+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";try{eval(g)}catch(h){if("undefined"!=typeof JSLINT){JSLINT(this.out);
for(var f=0;f<JSLINT.errors.length;f++)if(g=JSLINT.errors[f],"Unnecessary semicolon."!=g.reason)throw g.line++,f=Error(),f.lineNumber=g.line,f.message=g.reason,a.view&&(f.fileName=a.view),f;}else throw h;}}};EJS.config=function(a){EJS.cache=null!=a.cache?a.cache:EJS.cache;EJS.type=null!=a.type?a.type:EJS.type;EJS.ext=null!=a.ext?a.ext:EJS.ext;var b=EJS.templates_directory||{};EJS.templates_directory=b;EJS.get=function(a,d){return!1==d?null:b[a]?b[a]:null};EJS.update=function(a,d){null!=a&&(b[a]=d)};
EJS.INVALID_PATH=-1};EJS.config({cache:!0,type:"<",ext:".ejs"});EJS.Helpers=function(a,b){this._data=a;this._extras=b;i(this,b)};EJS.Helpers.prototype={view:function(a,b,c){c||(c=this._extras);b||(b=this._data);return(new EJS(a)).render(b,c)},to_text:function(a,b){return null==a||void 0===a?b||"":a instanceof Date?a.toDateString():a.toString?a.toString().replace(/\n/g,"<br />").replace(/''/g,"'"):""}};EJS.newRequest=function(){for(var a=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new XMLHttpRequest},
function(){return new ActiveXObject("Microsoft.XMLHTTP")}],b=0;b<a.length;b++)try{var c=a[b]();if(null!=c)return c}catch(d){}};EJS.request=function(a){var b=new EJS.newRequest;b.open("GET",a,!1);try{b.send(null)}catch(c){return null}return 404==b.status||2==b.status||0==b.status&&""==b.responseText?null:b.responseText};EJS.ajax_request=function(a){a.method=a.method?a.method:"GET";var b=new EJS.newRequest;b.onreadystatechange=function(){if(4==b.readyState)a.onComplete(b)};b.open(a.method,a.url);b.send(null)}})();