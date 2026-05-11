
// Global error handler
window.onerror = function(msg, url, line, col, err) {
  var el = document.getElementById('content');
  if(el) el.innerHTML = '<div style="padding:40px;color:#e74c3c"><h2 style="color:#e74c3c">JS Error</h2><p>'+msg+'</p><p style="color:var(--text-muted);font-size:13px">Line: '+line+'</p></div>';
};

// ===== Themes =====
const THEMES = {
  "投资理念":{color:"#c9a84c",text:"#1a1511",desc:"价值投资、护城河、安全边际、长期持有"},
  "公司治理":{color:"#2d6a4f",desc:"管理层激励、董事会、股东关系"},
  "经济观点":{color:"#7f4f24",desc:"宏观经济、通货膨胀、利率"},
  "管理智慧":{color:"#a67c52",desc:"用人、企业文化、决策原则"},
  "收购与估值":{color:"#6b4c3b",desc:"收购标准、企业估值方法"},
  "保险业务":{color:"#4a6fa5",desc:"保险承保、浮存金、再保险"},
  "会计与财报":{color:"#8c6c4a",desc:"会计政策、财务报表解读"},
  "税务":{color:"#b5651d",desc:"税率、递延税项、税制改革"},
};

// ===== Entities =====
const ENTITIES = {
  "人物":{color:"#a67c52",items:[
    {name:"查理·芒格",kw:["芒格","Munger"],desc:"伯克希尔副董事长，55年搭档"},
    {name:"本杰明·格雷厄姆",kw:["格雷厄姆","Graham"],desc:"价值投资之父，导师"},
    {name:"阿吉特·贾因",kw:["阿吉特","Ajit Jain"],desc:"保险业务副主席"},
    {name:"格雷格·阿贝尔",kw:["格雷格·阿贝尔","Greg Abel"],desc:"接班人，副董事长"},
    {name:"凯瑟琳·格雷厄姆",kw:["凯瑟琳·格雷厄姆"],desc:"华盛顿邮报发行人"},
    {name:"汤姆·墨菲",kw:["汤姆·墨菲","Tom Murphy"],desc:"大都会/ABC公司CEO"},
  ]},
  "公司":{color:"#4a6fa5",items:[
    {name:"伯克希尔·哈撒韦",kw:["伯克希尔","Berkshire"],desc:"控股公司"},
    {name:"可口可乐",kw:["可口可乐","Coca-Cola"],desc:"持仓34年"},
    {name:"GEICO",kw:["GEICO","盖可保险"],desc:"保险子公司"},
    {name:"苹果",kw:["苹果","Apple"],desc:"第一大持仓"},
    {name:"美国运通",kw:["美国运通","运通"],desc:"核心持仓"},
  ]},
  "关键词":{color:"#7f4f24",items:[
    {name:"护城河",kw:["护城河"],desc:"企业持久竞争优势"},
    {name:"安全边际",kw:["安全边际"],desc:"格雷厄姆式核心"},
    {name:"浮存金",kw:["浮存金"],desc:"保险模式基石"},
    {name:"能力圈",kw:["能力圈"],desc:"只投自己懂的"},
    {name:"复利",kw:["复利"],desc:"世界第八大奇迹"},
  ]},
};

// ===== Globals =====
var mode = 'letters';
var currentYear = null;
var currentMunger = null;
var searchMode = false;
var activeThemes = {};
var activeEntities = {};
var kgChart = null;
var kgResizeHandler = null;
var entityBuilt = false;
var entityIndex = {};
var conceptBuilt = false;
var conceptIndex = {};

var D = {};
var ST = {};
var RELATIONS = {};
var kgModeFilter = {"人物":true,"公司":true,"关键词":true};

// ===== Utilities =====
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
function $(s,p){return(p||document).querySelector(s)}
function $$(s,p){return Array.from((p||document).querySelectorAll(s))}
function getData(){return mode==="letters"?LETTERS:mode==="meetings"?MEETINGS:mode==="munger"?MUNGER:[]}
function getPfx(){return mode==="letters"?"L-":mode==="meetings"?"M-":"MG-"}
function titleFor(y,m){if(m==="meetings")return y+" 年伯克希尔股东大会实录";if(m==="munger")return y+" 年芒格演讲";return y<=1969?y+" 年巴菲特致合伙人的信":y+" 年致伯克希尔·哈撒韦股东的信"}
function gL(y){var d=getData();for(var i=0;i<d.length;i++){if(d[i].year===y)return d[i]}return null}
function db(fn,d){var t;return function(){clearTimeout(t);t=setTimeout(fn,d)}}
function ctx(t,q){var i=t.toLowerCase().indexOf(q.toLowerCase());if(i<0)return t.slice(0,120);var s=Math.max(0,i-40);return(s>0?"...":"")+t.slice(s,s+120)+(s+120<t.length?"...":"")}
function hl(t,q){if(!q)return esc(t);var r=new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi");return esc(t).replace(r,"<span class=\"hl-sr\">$1</span>")}
function modePrefixId(p){return getPfx()+p}

// ===== Storage =====
(function(){var b=rJ("bb_bm",{});ST.bm=function(){return b};ST.isBM=function(p){return!!b[p]};ST.addBM=function(p,y,t){b[p]={pid:p,y:y,pr:t};wJ("bb_bm",b)};ST.rmBM=function(p){delete b[p];wJ("bb_bm",b)};var n=rJ("bb_nt",{});ST.nt=function(){return n};ST.getNT=function(p){return n[p]||null};ST.setNT=function(p,c){if(c.trim()){n[p]={c:c.trim()}}else{delete n[p]};wJ("bb_nt",n)};var p=rJ("bb_pr",{});ST.getPr=function(y){return p[y]||null};ST.svPr=function(y,t){p[y]={st:t};wJ("bb_pr",p)};ST.cln=function(v){Object.keys(b).forEach(function(k){if(!v.has(k)){delete b[k]}});wJ("bb_bm",b);Object.keys(n).forEach(function(k){if(!v.has(k)){delete n[k]}});wJ("bb_nt",n)}})()
function rJ(k,f){try{var r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){localStorage.setItem(k,JSON.stringify(f));return f}}
function wJ(k,d){try{localStorage.setItem(k,JSON.stringify(d));return true}catch(e){return false}}

// ===== gF =====
function gF(){
  if(mode==="meetings"||mode==="munger")return getData();
  var data=LETTERS;
  var tk=Object.keys(activeThemes);
  if(tk.length)data=data.filter(function(l){return l.themes.some(function(t){return activeThemes[t]})});
  var ek=Object.keys(activeEntities);
  if(ek.length){buildEntityIndex();data=data.filter(function(l){return ek.some(function(e){return entityIndex[e]&&entityIndex[e].years.has(l.year)})})}
  return data;
}

// ===== Entity Index =====
function buildEntityIndex(){
  if(entityBuilt)return;
  entityBuilt=true;
  LETTERS.forEach(function(l){
    l.paragraphs.forEach(function(p,pi){
      Object.keys(ENTITIES).forEach(function(cat){
        ENTITIES[cat].items.forEach(function(entity){
          entity.kw.forEach(function(kw){
            if(p.indexOf(kw)!==-1){
              if(!entityIndex[entity.name])entityIndex[entity.name]={years:{},refs:{}};
              if(!entityIndex[entity.name].years[l.year])entityIndex[entity.name].years[l.year]=true;
              if(!entityIndex[entity.name].refs[l.year])entityIndex[entity.name].refs[l.year]=[];
              entityIndex[entity.name].refs[l.year].push(pi);
            }
          });
        });
      });
    });
  });
}

// ===== showEntity =====
function showEntity(name){
  if(!entityIndex[name])return;
  var info=entityIndex[name];
  currentYear=null;
  var h="<div class=\"ev\"><h2>"+esc(name)+"</h2>";
  var years=Object.keys(info.years).sort(function(a,b){return b-a});
  years.forEach(function(y){
    h+="<div class=\"ev-ch\"><span class=\"ev-yb\">"+y+"</span>";
    (info.refs[y]||[]).forEach(function(pi){
      var item=gL(Number(y));
      if(item&&item.paragraphs[pi]){
        h+="<div class=\"ev-p\" data-year=\"'"+y+"'\" data-pi=\"'"+pi+"'\">"+esc(item.paragraphs[pi].substring(0,150))+"</div>";
      }
    });
    h+="</div>";
  });
  h+="</div>";
  D.ct.innerHTML=h;
  D.ct.querySelectorAll(".ev-p").forEach(function(el){
    el.addEventListener("click",function(){showContent(Number(el.dataset.year))});
  });
}

// ===== Theme =====
function toggleTheme(){
  var h=document.documentElement;h.classList.toggle("light");
  localStorage.setItem("bb_theme",h.classList.contains("light")?"light":"dark");
}
function loadTheme(){
  if(localStorage.getItem("bb_theme")==="light")document.documentElement.classList.add("light");
}

// ===== fmt =====
function fmt(t){
  var e=esc(t);
  e=e.replace(/(巴菲特|芒格|查理|股东)[：:]/g,"<span class=\"hl-spk\">$1</span>：");
  e=e.replace(/(核心主题|要点提炼|关键数据|总结)[：:]/g,"<span class=\"hl-hd-s\">$1</span>：");
  e=e.replace(/(^|\s|（|\(|\[)(\d+)([、.,])/gm,"$1<span class=\"hl-num\">$2</span>$3");
  e=e.replace(/「([^」]*)」/g,"「<span class=\"hl-q\">$1</span>」");
  e=e.replace(/“([^”]*)”/g,"“<span class=\"hl-q\">$1</span>”");
  if(typeof CONCEPTS!=='undefined'&&CONCEPTS.length){
    for(var ci=0;ci<CONCEPTS.length;ci++){
      var cpt=CONCEPTS[ci];
      for(var cki=0;cki<cpt.keywords.length;cki++){
        var kw=cpt.keywords[cki];
        try{
          var re=new RegExp("(?![^<]*>)("+kw.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","g");
          e=e.replace(re,'<span class="hl-cpt" data-cpt="'+cpt.id+'">$1</span>');
        }catch(_){}
      }
    }
  }
  var entList=[];
  if(ENTITIES["人物"])ENTITIES["人物"].items.forEach(function(ent){entList.push({n:ent.name,kw:ent.kw})});
  if(ENTITIES["公司"])ENTITIES["公司"].items.forEach(function(ent){entList.push({n:ent.name,kw:ent.kw})});
  entList.sort(function(a,b){return b.n.length-a.n.length});
  entList.forEach(function(ei){
    ei.kw.forEach(function(kw){
      try{var re=new RegExp("(?![^<]*>)("+kw.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","g");e=e.replace(re,'<span class="hl-ent">$1</span>')}catch(_){}
    });
  });
  return e;
}

// ===== Sidebar =====
function renderSidebar(){
  var d=getData(),s=d.slice();
  if(mode!=="letters")s.sort(function(a,b){return b.year-a.year});
  if(mode==="letters")s.sort(function(a,b){return b.year!==a.year?b.year-a.year:d.indexOf(a)-d.indexOf(b)});
  D.scount.textContent=mode==="munger"?"共 "+d.length+" 篇":"共 "+d.length+" 年";
  D.yL.innerHTML=s.map(function(l){
    var idx=d.indexOf(l);
    var a=mode==="munger"?l.title===currentMunger:l.year===currentYear;
    var label;
    if(mode==="munger"){label=esc(l.title)}
    else if(l.title.indexOf("我最看好的股票")!==-1){label="📰 "+esc(l.title)}
    else{label=esc(titleFor(l.year,mode))}
    return '<li class="yi'+(a?" act":"")+'" data-idx="'+idx+'"><span>'+label+"</span>"+
      ((mode==="letters"||mode==="munger")?'<span class="yt">'+l.themes.map(function(t){var c=THEMES[t]?THEMES[t].color:"#666";return '<span class="ytd" style="background:'+c+'" title="'+esc(t)+'"></span>'}).join("")+"</span>":"")+"</li>";
  }).join("");
  D.yL.querySelectorAll(".yi").forEach(function(el){el.addEventListener("click",function(){
    var idx=Number(el.dataset.idx),d=getData();
    if(!d[idx])return;
    if(mode==="munger")showMungerContent(idx);
    else{if(searchMode)clearSearch();showContent(d[idx].year,d[idx])}
  })});
}

// ===== Theme Filter =====
function renderThemeFilter(){
  var data=LETTERS,all=Object.keys(THEMES);
  var cnts={};all.forEach(function(n){cnts[n]=0;var s=new Set;data.forEach(function(l){if(l.themes.indexOf(n)!==-1)s.add(l.year)});cnts[n]=s.size});
  var act=Object.keys(activeThemes).length;
  D.tF.innerHTML='<div class="tf-hd">'+
    '<span class="tf-cnt">'+(act?act+"/"+all.length+" 个":"全部 "+all.length+" 个")+"</span>"+
    (act?'<button class="tf-clr" id="tf-clr">清除</button>':"")+
    '</div><div class="tf-tg">'+
    all.map(function(n){var m=THEMES[n],a=!!activeThemes[n];
      return '<div class="tt'+(a?" act":"")+'" data-theme="'+esc(n)+'" style="'+(a?"background:"+m.color+";color:"+(m.text||"#fff"):"")+'"><span class="tt-d" style="background:'+m.color+'"></span><span>'+n+'</span><span class="tt-c">'+cnts[n]+"</span></div>"}).join("")+"</div>";
  D.tF.querySelectorAll(".tt").forEach(function(el){el.addEventListener("click",function(){
    var n=el.dataset.theme;if(activeThemes[n]){delete activeThemes[n]}else{activeThemes[n]=true}
    renderThemeFilter();renderSidebar()})});
  var clr=document.getElementById("tf-clr");if(clr)clr.addEventListener("click",function(){activeThemes={};renderThemeFilter();renderSidebar()});
}

// ===== Entity Filter =====
function renderEntityFilter(){
  if(mode!=="letters"&&mode!=="knowledgegraph"){if(D.eS)D.eS.style.display="none";return}
  if(D.eS)D.eS.style.display="";
  D.eF.innerHTML=Object.keys(ENTITIES).map(function(cat){
    var m=ENTITIES[cat];
    return '<div class="tf-hd" style="margin-top:4px;color:'+m.color+'">'+cat+'</div><div class="tf-tg">'+
      m.items.map(function(entity){
        var a=!!activeEntities[entity.name];
        return '<div class="tt'+(a?" act":"")+'" data-entity="'+esc(entity.name)+'" style="'+(a?"background:"+m.color+";color:#fff":"")+'"><span class="tt-d" style="background:'+m.color+'"></span><span>'+esc(entity.name)+"</span></div>";
      }).join("")+"</div>";
  }).join("");
  D.eF.querySelectorAll(".tt").forEach(function(el){el.addEventListener("click",function(){
    var n=el.dataset.entity;if(activeEntities[n]){delete activeEntities[n]}else{activeEntities[n]=true}
    renderEntityFilter();if(mode!=="knowledgegraph")renderSidebar()})});
  if(mode==="knowledgegraph"&&typeof renderKnowledgeGraph==="function")renderKnowledgeGraph();
}

// ===== Bookmarks =====
function renderBookmarks(){
  var b=ST.bm(),e=Object.keys(b).filter(function(k){return k.startsWith(getPfx())});
  if(!e.length){D.bL.innerHTML='<div class="be">暂无书签</div>';return}
  var items=e.map(function(id){return b[id]});items.sort(function(a,b){return b.y-a.y});
  D.bL.innerHTML=items.map(function(bm){var nt=ST.getNT(bm.pid);return '<div class="bi" data-pid="'+bm.pid+'"><div>'+esc(bm.pr)+'</div><div class="by">'+bm.y+(nt?" · 📝":"")+"</div></div>"}).join("");
  D.bL.querySelectorAll(".bi").forEach(function(el){el.addEventListener("click",function(){
    var raw=el.dataset.pid,r=raw.split("-"),pfx=r[0]+"-",y=Number(r[1]),pid=raw;
    if(pfx==="MG-"){var idx=MUNGER.findIndex(function(mg){return mg.year===y});if(idx>=0)showContent(idx)}else{showContent(y)}
    setTimeout(function(){var p=$('.par[data-pid="'+pid+'"]',D.ct);if(p){p.scrollIntoView({behavior:"smooth",block:"center"});p.style.transition="background .3s";p.style.background="rgba(201,168,76,0.18)";setTimeout(function(){p.style.background=""},1500)}},100)})
  });
}

// ===== History =====
function renderHistory(){
  var hist=[];try{hist=JSON.parse(localStorage.getItem("bb_rh"))||[]}catch(e){}
  if(!hist.length){D.hL.innerHTML='<div class="be">暂无阅读记录</div>';return}
  D.hL.innerHTML=hist.map(function(h,i){
    var s="";
    if(h.src==="munger")s=" 🧠";
    else if(h.src==="meetings")s=" 🎤";
    return '<div class="bi" data-idx="'+i+'"><div>'+esc(h.title||h.year+"年")+s+'</div><div class="by">'+h.year+(h.at?" · "+new Date(h.at).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):"")+"</div></div>";
  }).join("");
  D.hL.querySelectorAll(".bi").forEach(function(el){el.addEventListener("click",function(){
    var hi=hist[Number(el.dataset.idx)];
    if(!hi)return;
    if(hi.src==="munger"){if(mode!=="munger")switchMode("munger");showContent(hi.idx)}
    else{showContent(hi.year)}
  })});
}

// ===== Search =====
function onSearch(){
  var q=D.sI.value;if(!q.trim()){clearSearch();return}
  db(function(){if(!D.sI.value.trim()){clearSearch();return}performSearch(q)},300)();
}
function performSearch(q){
  if(D.prgBar)D.prgBar.style.width="0%";
  var d=getData(),r=searchData(q,d);searchMode=true;
  if(!r.length){D.ct.innerHTML='<div class="se"><p>未找到包含 <strong>\u201c'+esc(q)+'\u201d</strong> 的内容</p><p style="margin-top:12px;color:var(--text-muted);font-size:13px;">请尝试其他关键词</p></div>';return}
  var t=0;r.forEach(function(x){t+=x.mc});
  var h='<div class="sr"><h2>搜索结果：共 <span class="rc">'+r.length+" 项 / "+t+" 处匹配</span></h2>";
  r.forEach(function(x){h+='<div class="srg"><div class="srh" data-idx="'+x.idx+'">'+esc(x.item.title)+"</div>";x.ps.forEach(function(p){var sn=ctx(p.t,q);h+='<div class="srm" data-idx="'+x.idx+'" data-pi="'+p.i+'">'+hl(sn,q)+"</div>"});h+="</div>"});
  h+="</div>";D.ct.innerHTML=h;
  D.ct.querySelectorAll(".srm").forEach(function(el){el.addEventListener("click",function(){var idx=Number(el.dataset.idx),pi=Number(el.dataset.pi),d=getData(),item=d[idx];if(item){searchMode=false;D.sI.value="";showContent(item.year);setTimeout(function(){var pfx=getPfx(),p=$('.par[data-pid="'+pfx+item.year+"-"+pi+'"]',D.ct);if(p){p.scrollIntoView({behavior:"smooth",block:"center"});p.style.transition="background .5s";p.style.background="rgba(201,168,76,0.18)";setTimeout(function(){p.style.background=""},1500)}},100)}})});
  D.ct.querySelectorAll(".srh").forEach(function(el){el.addEventListener("click",function(){var d=getData(),item=d[Number(el.dataset.idx)];if(item){searchMode=false;D.sI.value="";showContent(item.year)}})});
}
function searchData(q,data){q=q.toLowerCase();var results=[];data.forEach(function(item,idx){var matches=[];item.paragraphs.forEach(function(p,i){if(p.toLowerCase().indexOf(q)!==-1)matches.push({i:i,t:p})});if(matches.length)results.push({idx:idx,item:item,ps:matches,mc:matches.length})});results.sort(function(a,b){return b.mc-a.mc});return results}
function clearSearch(){searchMode=false;D.sI.value="";if(currentYear!==null)showContent(currentYear);else{var d=getData();if(d.length)showContent(d[d.length-1].year)}}

// ===== showContent =====
function showContent(year, item){
  if(item){}
  else if(mode==="munger"){item=MUNGER[year];if(!item)return;showMungerContent(year);return}
  else{item=gL(year);if(!item)return}
  if(mode==="munger"){showMungerContent(year);return}
  currentYear=year;searchMode=false;D.sI.value="";
  renderSidebar();
  var bmk=ST.bm(),nts=ST.nt(),pfx=getPfx();
  var metaHtml="";
  if(mode==="meetings"&&item.date)metaHtml='<div class="meeting-meta">📅 '+item.date+"</div>";
  var themesHtml="";
  if(item.themes){themesHtml=item.themes.map(function(t){var m=THEMES[t];return '<span class="ltt" style="background:'+(m?m.color:"#666")+'">'+t+"</span>"}).join("")}
  var chars=0;item.paragraphs.forEach(function(p){chars+=p.length});
  var mins=Math.max(1,Math.round(chars/400));
  var statsHtml='<div class="lstats"><span>📄 '+item.paragraphs.length+" 段</span><span class=\"ls-d\"></span><span>📝 "+chars+" 字</span><span class=\"ls-d\"></span><span>⏱ ~"+mins+" 分钟</span></div>";
  var allYears=gF().slice().sort(function(a,b){return b.year-a.year});
  var ci=allYears.findIndex(function(l){return l.year===year});
  var prv=ci<allYears.length-1?allYears[ci+1].year:null;
  var nxt=ci>0?allYears[ci-1].year:null;
  var navHtml='<div class="ynav">'+(prv?'<a class="yn-pr" data-year="'+prv+'"><span class="yn-ar">←</span><span class="yn-d"><div class="yn-em">上一年</div><div class="yn-yr">'+prv+'</div></span></a>':'<div></div>')+(nxt?'<a class="yn-nx" data-year="'+nxt+'"><span class="yn-d"><div class="yn-em">下一年</div><div class="yn-yr">'+nxt+'</div></span><span class="yn-ar">→</span></a>':'<div></div>')+"</div>";
  D.ct.innerHTML='<div class="lv"><div class="lh"><h1>'+esc(item.title)+'</h1><div class="lm"><span class="lyb">'+item.year+"</span>"+themesHtml+'</div>'+metaHtml+(item.summary?'<div class="lsum"><span class="lsum-lb">📋 摘要</span><span class="lsum-ct">'+fmt(item.summary)+"</span></div>":"")+statsHtml+"</div>"+
    item.paragraphs.map(function(t,i){
      var pid=pfx+item.year+"-"+i,bb=!!bmk[pid],nn=!!nts[pid];
      return '<div class="par'+(bb?" bm":"")+'" data-pid="'+pid+'"><div class="pa">'+
        '<button class="bmb'+(bb?" act":"")+'" data-pid="'+pid+'">'+(bb?"★":"☆")+"</button>"+
        '<button class="ntb'+(nn?" act":"")+'" data-pid="'+pid+'">📝</button></div>'+
        '<div class="pt">'+fmt(t)+"</div>"+
        (nn?'<div class="ni" data-pid="'+pid+'">📝 '+esc(nts[pid].c)+"</div>":"")+
        '<div class="ne'+(nn?" vis":"")+'" data-pid="'+pid+'"><textarea placeholder="写笔记…">'+(nn?esc(nts[pid].c):"")+'</textarea>'+
        '<div class="na"><button class="nc">取消</button><button class="ns">保存</button></div></div></div>';
    }).join("")+navHtml+"</div>";
  D.ct.querySelectorAll(".bmb").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();togBM(b.dataset.pid)})});
  D.ct.querySelectorAll(".ntb").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();togNE(b.dataset.pid)})});
  D.ct.querySelectorAll(".nc").forEach(function(b){b.addEventListener("click",function(){var pid=b.closest(".ne").dataset.pid;hideNE(pid)})});
  D.ct.querySelectorAll(".ns").forEach(function(b){b.addEventListener("click",function(){var e=b.closest(".ne"),pid=e.dataset.pid;svNT(pid,e.querySelector("textarea").value)})});
  D.ct.querySelectorAll(".ne textarea").forEach(function(ta){ta.addEventListener("blur",function(){svNT(ta.closest(".ne").dataset.pid,ta.value)});ta.addEventListener("keydown",function(e){if(e.ctrlKey&&e.key==="Enter")svNT(ta.closest(".ne").dataset.pid,ta.value)})});
  D.ct.querySelectorAll(".ni").forEach(function(el){el.addEventListener("click",function(){togNE(el.dataset.pid)})});
  D.ct.querySelectorAll(".ynav a").forEach(function(el){el.addEventListener("click",function(){showContent(Number(el.dataset.year))})});
  var hist=[];try{hist=JSON.parse(localStorage.getItem("bb_rh"))||[]}catch(e){}
  hist=hist.filter(function(h){return h.year!==year});
  hist.unshift({year:year,title:item.title,at:Date.now(),src:mode});
  if(hist.length>15)hist=hist.slice(0,15);
  try{localStorage.setItem("bb_rh",JSON.stringify(hist))}catch(e){}
  renderHistory();
  var pv=ST.getPr(year);
  if(D.prgBar)D.prgBar.style.width="0%";
  if(pv)requestAnimationFrame(function(){D.ct.scrollTop=pv.st;if(D.prgBar&&D.ct.scrollHeight>D.ct.clientHeight){var pp=Math.min(pv.st/(D.ct.scrollHeight-D.ct.clientHeight)*100,100);if(pp<0)pp=0;D.prgBar.style.width=pp+"%"}});else D.ct.scrollTop=0;
  renderBookmarks();
}

// ===== showMungerContent =====
function showMungerContent(idx){
  var item=MUNGER[idx];if(!item)return;
  currentMunger=item.title;searchMode=false;D.sI.value="";
  renderSidebar();
  var bmk=ST.bm(),nts=ST.nt(),pfx="MG-";
  var themesHtml="";
  if(item.themes){themesHtml=item.themes.map(function(t){var m=THEMES[t];return '<span class="ltt" style="background:'+(m?m.color:"#666")+'">'+t+"</span>"}).join("")}
  var chars=0;item.paragraphs.forEach(function(p){chars+=p.length});
  var mins=Math.max(1,Math.round(chars/400));
  var statsHtml='<div class="lstats"><span>📄 '+item.paragraphs.length+" 段</span><span class=\"ls-d\"></span><span>📝 "+chars+" 字</span><span class=\"ls-d\"></span><span>⏱ ~"+mins+" 分钟</span></div>";
  var navHtml='<div class="ynav">'+(idx<MUNGER.length-1?'<a class="yn-pr" data-idx="'+(idx+1)+'"><span class="yn-ar">←</span><span class="yn-d"><div class="yn-em">上一篇</div><div class="yn-yr">'+esc(MUNGER[idx+1].title)+"</div></span></a>":'<div></div>')+(idx>0?'<a class="yn-nx" data-idx="'+(idx-1)+'"><span class="yn-d"><div class="yn-em">下一篇</div><div class="yn-yr">'+esc(MUNGER[idx-1].title)+"</div></span><span class=\"yn-ar\">→</span></a>":'<div></div>')+"</div>";
  D.ct.innerHTML='<div class="lv"><div class="lh"><h1>'+esc(item.title)+'</h1><div class="lm"><span class="lyb">'+item.year+"</span>"+themesHtml+'</div>'+(item.summary?'<div class="lsum"><span class="lsum-lb">📋 摘要</span><span class="lsum-ct">'+fmt(item.summary)+"</span></div>":"")+statsHtml+"</div>"+
    item.paragraphs.map(function(t,i){
      var pid=pfx+item.year+"-"+i,bb=!!bmk[pid],nn=!!nts[pid];
      return '<div class="par'+(bb?" bm":"")+'" data-pid="'+pid+'"><div class="pa">'+
        '<button class="bmb'+(bb?" act":"")+'" data-pid="'+pid+'">'+(bb?"★":"☆")+"</button>"+
        '<button class="ntb'+(nn?" act":"")+'" data-pid="'+pid+'">📝</button></div>'+
        '<div class="pt">'+fmt(t)+"</div>"+
        (nn?'<div class="ni" data-pid="'+pid+'">📝 '+esc(nts[pid].c)+"</div>":"")+
        '<div class="ne'+(nn?" vis":"")+'" data-pid="'+pid+'"><textarea placeholder="写笔记…">'+(nn?esc(nts[pid].c):"")+'</textarea>'+
        '<div class="na"><button class="nc">取消</button><button class="ns">保存</button></div></div></div>';
    }).join("")+navHtml+"</div>";
  D.ct.querySelectorAll(".bmb").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();togBM(b.dataset.pid)})});
  D.ct.querySelectorAll(".ntb").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();togNE(b.dataset.pid)})});
  D.ct.querySelectorAll(".nc").forEach(function(b){b.addEventListener("click",function(){var pid=b.closest(".ne").dataset.pid;hideNE(pid)})});
  D.ct.querySelectorAll(".ns").forEach(function(b){b.addEventListener("click",function(){var e=b.closest(".ne"),pid=e.dataset.pid;svNT(pid,e.querySelector("textarea").value)})});
  D.ct.querySelectorAll(".ne textarea").forEach(function(ta){ta.addEventListener("blur",function(){svNT(ta.closest(".ne").dataset.pid,ta.value)});ta.addEventListener("keydown",function(e){if(e.ctrlKey&&e.key==="Enter")svNT(ta.closest(".ne").dataset.pid,ta.value)})});
  D.ct.querySelectorAll(".ni").forEach(function(el){el.addEventListener("click",function(){togNE(el.dataset.pid)})});
  D.ct.querySelectorAll(".ynav a").forEach(function(el){el.addEventListener("click",function(){showContent(Number(el.dataset.idx))})});
  var hist=[];try{hist=JSON.parse(localStorage.getItem("bb_rh"))||[]}catch(e){}
  hist=hist.filter(function(h){return h.year!==item.year||h.idx===undefined});
  hist.unshift({year:item.year,title:item.title,at:Date.now(),src:"munger",idx:idx});
  if(hist.length>15)hist=hist.slice(0,15);
  try{localStorage.setItem("bb_rh",JSON.stringify(hist))}catch(e){}
  renderHistory();renderBookmarks();
}

// ===== Bookmarks =====
function togBM(pid){
  var b=$('.bmb[data-pid="'+pid+'"]',D.ct);if(!b)return;
  var r=pid.split("-"),y=Number(r[1]),pfx=r[0]+"-",i=Number(r[2]);
  var data=getData(),item=data.find(function(l){return l.year===y});
  if(!item||!item.paragraphs[i])return;
  if(ST.isBM(pid)){ST.rmBM(pid);b.textContent="☆";b.classList.remove("act")}
  else{ST.addBM(pid,y,item.paragraphs[i]);b.textContent="★";b.classList.add("act")}
  var p=b.closest(".par");if(p)p.classList.toggle("bm");renderBookmarks();
}
function togNE(pid){var e=$('.ne[data-pid="'+pid+'"]',D.ct);if(!e)return;if(e.classList.contains("vis"))hideNE(pid);else showNE(pid)}
function showNE(pid){$$(".ne.vis",D.ct).forEach(function(e){e.classList.remove("vis")});var e=$('.ne[data-pid="'+pid+'"]',D.ct);if(e){e.classList.add("vis");e.querySelector("textarea").focus()}}
function hideNE(pid){var e=$('.ne[data-pid="'+pid+'"]',D.ct);if(e)e.classList.remove("vis")}
function svNT(pid,c){ST.setNT(pid,c);var b=$('.ntb[data-pid="'+pid+'"]',D.ct);if(b)b.classList.toggle("act",!!c.trim());var p=$('.par[data-pid="'+pid+'"]',D.ct);if(!p)return;var ex=p.querySelector(".ni");if(c.trim()){if(ex)ex.innerHTML="📝 "+esc(c.trim());else{var ind=document.createElement("div");ind.className="ni";ind.dataset.pid=pid;ind.innerHTML="📝 "+esc(c.trim());ind.addEventListener("click",function(){togNE(pid)});p.appendChild(ind)}}else{if(ex)ex.remove()}hideNE(pid)}

var PORTRAITS = {
  "沃伦·巴菲特":"portraits/buffett.jpg",
  "查理·芒格":"portraits/charlie_munger.jpg",
  "本杰明·格雷厄姆":"portraits/benjamin_graham.jpg",
  "阿吉特·贾因":"portraits/ajit_jain.jpg",
  "格雷格·阿贝尔":"portraits/greg_abel.jpg",
  "凯瑟琳·格雷厄姆":"portraits/katharine_graham.jpg",
  "汤姆·墨菲":"portraits/tom_murphy.svg"
};

function avi(name,size,color){
  var src=PORTRAITS[name];
  if(src)return '<img src="'+src+'" alt="" style="width:'+size+'px;height:'+size+'px;border-radius:50%;object-fit:cover;display:block">';
  return '<span style="background:'+color+';color:#fff;width:'+size+'px;height:'+size+'px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:'+Math.round(size*0.38)+'px;font-weight:700;line-height:1">'+name.charAt(0)+"</span>";
}

// ===== renderRelations =====
function renderRelations(){
  D.stitle.textContent="🔗 关系图";
  var h='<div class="rg"><div class="rg-b">'+
    avi("沃伦·巴菲特",72,"#c9a84c")+
    "<h2>沃伦·巴菲特</h2><p>1930年生于奥马哈，伯克希尔·哈撒韦董事长兼CEO。</p></div>";
  Object.keys(ENTITIES).forEach(function(cat){
    var m=ENTITIES[cat];
    h+='<div class="rg-g"><div class="rg-gh"><span style="color:'+m.color+'">'+cat+"</span></div><div class=\"rg-row\">";
    h+=m.items.map(function(item){
      return '<div class="rg-n" data-entity="'+esc(item.name)+'" style="border-left:3px solid '+m.color+'">'+
        avi(item.name,44,m.color)+
        '<span style="flex:1;min-width:0"><span style="color:'+m.color+';font-size:14px;font-weight:600;display:block">'+esc(item.name)+'</span>'+
        '<span style="font-size:11.5px;color:var(--text-muted);display:block;margin-top:2px">'+esc(item.desc)+"</span></span></div>";
    }).join("");
    h+="</div></div>";
  });
  h+="</div>";
  D.ct.innerHTML=h;
  D.ct.querySelectorAll(".rg-n").forEach(function(el){el.addEventListener("click",function(){showEntity(el.dataset.entity)})});
}

// ===== renderKnowledgeGraph =====
function renderKnowledgeGraph(){
  if(typeof echarts==="undefined"){D.ct.innerHTML='<div class="se"><p>ECharts 库加载失败</p></div>';return}
  D.stitle.textContent="🌐 知识图谱";D.scount.textContent="";
  var cats=Object.keys(kgModeFilter).filter(function(k){return kgModeFilter[k]});
  var nodes=[];var links=[];var idxMap={};
  nodes.push({name:"巴菲特",symbolSize:48,category:0,itemStyle:{color:"#c9a84c"}});
  LETTERS.forEach(function(l){l.themes.forEach(function(t){if(nodes.findIndex(function(n){return n.name===t})===-1){nodes.push({name:t,symbolSize:20,category:2,itemStyle:{color:THEMES[t]?THEMES[t].color:"#666"}})}if(links.findIndex(function(lk){return lk.source==="巴菲特"&&lk.target===t})===-1)links.push({source:"巴菲特",target:t})})});
  D.ct.innerHTML='<div class="kg"><div class="kg-container" id="kg-container"></div></div>';
  var dom=document.getElementById("kg-container");
  if(!dom)return;
  var chart=echarts.init(dom);
  chart.setOption({title:{text:"投资思想知识图谱",subtext:"主题关联",left:"center",textStyle:{color:"#eee4d6"},subtextStyle:{color:"#ad9e8e"}},tooltip:{},series:[{type:"graph",layout:"force",symbolSize:48,roam:true,label:{show:true,fontSize:12,color:"#dccfc0"},edgeSymbol:["circle","arrow"],edgeSymbolSize:[4,10],edgeLabel:{fontSize:12},force:{repulsion:500},data:nodes,links:links,lineStyle:{color:"#3a3028",width:2,curveness:0.3,cOpacity:0.7}}]});
  kgChart=chart;
}

// ===== renderStats =====
function renderStats(){
  D.stitle.textContent="📊 数据统计";
  // Aggregate all data sources
  var allSrc=[];
  LETTERS.forEach(function(l){allSrc.push({year:l.year,themes:l.themes||[],pars:l.paragraphs||[],source:"letters"})});
  MEETINGS.forEach(function(l){allSrc.push({year:l.year,themes:l.themes||[],pars:l.paragraphs||[],source:"meetings"})});
  var mData=typeof MUNGER!=="undefined"?MUNGER:[];
  mData.forEach(function(l){allSrc.push({year:l.year,themes:l.themes||[],pars:l.paragraphs||[],source:"munger"})});
  // Total stats
  var totalPars=0,totalChars=0;
  allSrc.forEach(function(l){l.pars.forEach(function(p){totalPars++;totalChars+=p.length})});
  // Theme years (unique years per theme across all sources)
  var themeYears={};
  allSrc.forEach(function(l){l.themes.forEach(function(t){if(!themeYears[t])themeYears[t]={};themeYears[t][l.year]=true})});
  var themeData=Object.keys(themeYears).sort(function(a,b){return Object.keys(themeYears[b]).length-Object.keys(themeYears[a]).length}).map(function(t){return{name:t,value:Object.keys(themeYears[t]).length}});
  // Entity mention years (top 15)
  if(!entityBuilt)buildEntityIndex();
  var entityList=Object.keys(entityIndex).map(function(n){return{name:n,years:Object.keys(entityIndex[n].years).length}}).sort(function(a,b){return b.years-a.years}).slice(0,15);
  // Entity category map
  var catMap={};
  if(typeof ENTITIES!=="undefined")Object.keys(ENTITIES).forEach(function(cat){ENTITIES[cat].items.forEach(function(item){catMap[item.name]=cat})});
  // Year trend (LETTERS sorted by year)
  var yearData=LETTERS.map(function(l){var pc=0,cc=0;(l.paragraphs||[]).forEach(function(p){pc++;cc+=p.length});return{year:l.year,paragraphs:pc,chars:cc}}).sort(function(a,b){return a.year-b.year});
  // Build HTML
  D.ct.innerHTML='<div class="dash"><div class="dash-g">'+
    '<div class="dash-c"><div class="dc-v">'+LETTERS.length+'</div><div class="dc-l">致股东的信</div></div>'+
    '<div class="dash-c"><div class="dc-v">'+MEETINGS.length+'</div><div class="dc-l">股东大会</div></div>'+
    '<div class="dash-c"><div class="dc-v">'+mData.length+'</div><div class="dc-l">芒格演讲</div></div>'+
    '<div class="dash-c"><div class="dc-v">'+totalPars.toLocaleString()+'</div><div class="dc-l">总段落数</div></div>'+
    '<div class="dash-c"><div class="dc-v">'+Math.round(totalChars/10000)+'万</div><div class="dc-l">总字数</div></div>'+
    '<div class="dash-c"><div class="dc-v">'+Object.keys(THEMES).length+'</div><div class="dc-l">主题分类</div></div>'+
    '</div>'+
    '<div class="dash-chart"><h3>📊 主题分布覆盖年数</h3><div class="dc-c" id="dc-theme"></div></div>'+
    '<div class="dash-chart"><h3>🔤 实体提及年数 Top 15</h3><div class="dc-c" id="dc-entity"></div></div>'+
    '<div class="dash-chart"><h3>📈 年度内容量趋势</h3><div class="dc-c" id="dc-trend"></div></div></div>';
  if(typeof echarts==="undefined")return;
  // Chart 1: Theme pie (donut)
  var thChart=echarts.init(document.getElementById("dc-theme"));
  thChart.setOption({tooltip:{trigger:"item",formatter:"{b}: {c} 年 ({d}%)"},
    series:[{type:"pie",radius:["30%","60%"],
      data:themeData.map(function(d){return{name:d.name,value:d.value,itemStyle:{color:THEMES[d.name]?THEMES[d.name].color:"#666"}}}),
      label:{color:"#dccfc0",fontSize:11,formatter:"{b}"},
      labelLine:{lineStyle:{color:"#3a3028"},length:8,length2:6},
      emphasis:{itemStyle:{shadowBlur:10,shadowColor:"rgba(0,0,0,0.5)"}}
    }],
    legend:{bottom:5,textStyle:{color:"#ad9e8e",fontSize:11},
      formatter:function(n){var v=0;themeData.forEach(function(d){if(d.name===n)v=d.value});return n+" ("+v+"年)"}
    }
  });
  // Chart 2: Entity bar (horizontal)
  var ecChart=echarts.init(document.getElementById("dc-entity"));
  ecChart.setOption({tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},
    grid:{left:120,right:20,top:10,bottom:20},
    xAxis:{type:"value",axisLabel:{color:"#6e5f51"},splitLine:{lineStyle:{color:"#28211b"}}},
    yAxis:{type:"category",data:entityList.map(function(d){return d.name}).reverse(),axisLabel:{color:"#dccfc0",fontSize:11}},
    series:[{type:"bar",data:entityList.slice().reverse().map(function(d){
      var cat=catMap[d.name]||"关键词",c=ENTITIES&&ENTITIES[cat]?ENTITIES[cat].color:"#7f4f24";
      return{value:d.years,itemStyle:{color:c}}
    }),barWidth:14}]
  });
  // Chart 3: Year trend line (dual axis)
  var trChart=echarts.init(document.getElementById("dc-trend"));
  trChart.setOption({tooltip:{trigger:"axis"},
    legend:{data:["段落数","字符数"],textStyle:{color:"#ad9e8e"}},
    grid:{left:50,right:20,top:30,bottom:40},
    xAxis:{type:"category",data:yearData.map(function(d){return d.year}),axisLabel:{color:"#6e5f51",fontSize:10,rotate:45},splitLine:{show:false}},
    yAxis:[
      {type:"value",name:"段落数",nameTextStyle:{color:"#6e5f51"},axisLabel:{color:"#6e5f51"},splitLine:{lineStyle:{color:"#28211b"}}},
      {type:"value",name:"字符数",nameTextStyle:{color:"#6e5f51"},axisLabel:{color:"#6e5f51"},splitLine:{show:false}}
    ],
    series:[
      {name:"段落数",type:"line",data:yearData.map(function(d){return d.paragraphs}),smooth:true,lineStyle:{color:"#c9a84c"},itemStyle:{color:"#c9a84c"},areaStyle:{color:"rgba(201,168,76,0.1)"}},
      {name:"字符数",type:"line",yAxisIndex:1,data:yearData.map(function(d){return d.chars}),smooth:true,lineStyle:{color:"#4a6fa5"},itemStyle:{color:"#4a6fa5"},areaStyle:{color:"rgba(74,111,165,0.1)"}}
    ]
  });
  // Resize handler
  var rt=null;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){thChart.resize();ecChart.resize();trChart.resize()},100)});
}

// ===== switchMode =====
function switchMode(m){
  mode=m;currentYear=null;searchMode=false;D.sI.value="";
  var sb=$("#sb"),sbOv=$("#sb-ov");
  if(sb)sb.classList.remove("open");if(sbOv)sbOv.classList.remove("open");
  D.tab.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("act",t.dataset.mode===m)});
  D.ts.style.display=mode==="letters"||mode==="knowledgegraph"?"":"none";
  if(D.eS)D.eS.style.display=mode==="letters"||mode==="knowledgegraph"?"":"none";
  if(m!=="knowledgegraph"&&kgChart){kgChart.dispose();kgChart=null;if(kgResizeHandler){window.removeEventListener("resize",kgResizeHandler);kgResizeHandler=null}}
  if(m==="relations"){D.stitle.textContent="🔗 关系图";renderRelations();return}
  if(m==="knowledgegraph"){D.stitle.textContent="🌐 知识图谱";renderKnowledgeGraph();return}
  if(m==="stats"){D.stitle.textContent="📊 数据统计";renderStats();return}
  if(m==="munger"){D.stitle.textContent="🧠 芒格演讲";D.ts.style.display="none";if(D.eS)D.eS.style.display="none";renderSidebar();renderBookmarks();renderHistory();updateStats();currentMunger=null;var dm=MUNGER;if(dm.length){showMungerContent(dm.length-1)}else{D.ct.innerHTML='<div class="se"><p>暂无数据</p></div>'};return}
  D.stitle.textContent=mode==="letters"?"📖 致股东的信":"🎤 股东大会";
  renderSidebar();renderThemeFilter();renderEntityFilter();renderBookmarks();renderHistory();updateStats();
  var d=getData();
  if(d.length){showContent(d[d.length-1].year)}else{D.ct.innerHTML='<div class="se"><p>暂无数据</p></div>'}
}

// ===== init =====
function iD(){
  D.tab=$("#tabs");D.yL=$("#year-list");D.tF=$("#theme-filter");D.ct=$("#content");
  D.sI=$("#search-input");D.bL=$("#bookmark-list");D.ts=$("#theme-section");
  D.eS=$("#entity-section");D.eF=$("#entity-filter");
  D.stL=$("#stat-letters");D.stM=$("#stat-meetings");D.stMunger=$("#stat-munger");D.stT=$("#stat-themes");
  D.stitle=$("#sidebar-title");D.scount=$("#sidebar-count");
  D.wt=$("#welcome-title");D.wd=$("#welcome-desc");
  D.thBtn=$("#th-btn");D.btt=$("#btt");D.prgBar=$("#prg-bar-in");
  D.randBtn=$("#rand-btn");D.hL=$("#history-list");D.hS=$("#history-section");
}

function updateStats(){
  D.stL.textContent=LETTERS.length;D.stM.textContent=MEETINGS.length;
  if(D.stMunger)D.stMunger.textContent=typeof MUNGER!=="undefined"?MUNGER.length:0;
  D.stT.textContent=Object.keys(THEMES).length;
}

function toggleSection(id){
  var bd=document.getElementById(id+"-bd");if(!bd)return;
  var ar=bd.previousElementSibling?bd.previousElementSibling.querySelector(".sbs-ar"):null;
  if(bd.style.maxHeight&&bd.style.maxHeight!=="0px"){bd.style.maxHeight="0px";if(ar)ar.classList.remove("ar")}else{bd.style.maxHeight=bd.scrollHeight+"px";if(ar)ar.classList.add("ar")}
  try{var s=JSON.parse(localStorage.getItem("bb_sb")||"{}")||{};s[id]=bd.style.maxHeight!=="0px";localStorage.setItem("bb_sb",JSON.stringify(s))}catch(e){}
}

function restoreSections(){
  try{var s=JSON.parse(localStorage.getItem("bb_sb")||"{}")||{};Object.keys(s).forEach(function(id){if(s[id]){var bd=document.getElementById(id+"-bd");if(bd){bd.style.maxHeight=bd.scrollHeight+"px";var ar=bd.previousElementSibling?bd.previousElementSibling.querySelector(".sbs-ar"):null;if(ar)ar.classList.add("ar")}}})}catch(e){}
}

// ===== Concept Cross-referencing =====
function buildConceptIndex(){
  if(conceptBuilt)return;
  conceptBuilt=true;
  if(typeof CONCEPTS==="undefined")return;
  var allData=[];
  if(typeof LETTERS!=="undefined")LETTERS.forEach(function(d){allData.push({src:"letters",item:d})});
  if(typeof MEETINGS!=="undefined")MEETINGS.forEach(function(d){allData.push({src:"meetings",item:d})});
  if(typeof MUNGER!=="undefined")MUNGER.forEach(function(d){allData.push({src:"munger",item:d})});
  CONCEPTS.forEach(function(cpt){
    var info={desc:cpt.desc,related:cpt.related,occurrences:[]};
    allData.forEach(function(entry){
      var item=entry.item;
      item.paragraphs.forEach(function(p,pi){
        cpt.keywords.forEach(function(kw){
          if(p.toLowerCase().indexOf(kw.toLowerCase())!==-1){
            info.occurrences.push({source:entry.src,year:item.year,title:item.title,pid:(entry.src==="letters"?"L-":entry.src==="meetings"?"M-":"MG-")+item.year+"-"+pi,text:p.substring(0,120)+(p.length>120?"...":"")});
          }
        });
      });
    });
    var seen={};
    info.occurrences=info.occurrences.filter(function(o){var k=o.pid;if(seen[k])return false;seen[k]=true;return true});
    conceptIndex[cpt.id]=info;
  });
}

function ensureConceptPanel(){
  if(document.getElementById("cp"))return;
  var ctn=document.getElementById("content");if(!ctn)return;
  var ov=document.createElement("div");ov.className="cp-ov";ov.id="cp-ov";
  var cp=document.createElement("div");cp.className="cp";cp.id="cp";
  cp.innerHTML='<div class="cp-hd"><h2 id="cp-title">概念</h2><button class="cp-cls" id="cp-cls">✕</button></div><div class="cp-desc" id="cp-desc"></div><div class="cp-rel" id="cp-rel"></div><div class="cp-oc" id="cp-oc"></div>';
  var wl=ctn.querySelector(".wl");
  if(wl){ctn.insertBefore(ov,wl);ctn.insertBefore(cp,wl)}
  else{ctn.appendChild(ov);ctn.appendChild(cp)}
  document.getElementById("cp-cls").addEventListener("click",closeConceptPanel);
}

function showConceptPanel(cptId){
  if(typeof CONCEPTS==="undefined")return;
  var cpt=null;
  for(var i=0;i<CONCEPTS.length;i++){if(CONCEPTS[i].id===cptId){cpt=CONCEPTS[i];break}}
  if(!cpt)return;
  if(!conceptBuilt)buildConceptIndex();
  var info=conceptIndex[cptId];
  ensureConceptPanel();
  document.getElementById("cp-title").textContent=cpt.name;
  document.getElementById("cp-desc").textContent=cpt.desc;
  var relEl=document.getElementById("cp-rel");
  if(cpt.related&&cpt.related.length){
    relEl.innerHTML=cpt.related.map(function(r){
      var rc=null;
      for(var i=0;i<CONCEPTS.length;i++){if(CONCEPTS[i].name===r||CONCEPTS[i].id===r){rc=CONCEPTS[i];break}}
      return '<span class="cp-rel-tg" data-cpt="'+(rc?rc.id:"")+'">'+r+"</span>";
    }).join("");
    relEl.querySelectorAll(".cp-rel-tg").forEach(function(el){el.addEventListener("click",function(){showConceptPanel(el.dataset.cpt)})});
  }else{relEl.innerHTML=""}
  var ocEl=document.getElementById("cp-oc");
  if(info&&info.occurrences&&info.occurrences.length){
    var byYear={};
    info.occurrences.forEach(function(o){if(!byYear[o.year])byYear[o.year]=[];byYear[o.year].push(o)});
    var years=Object.keys(byYear).sort(function(a,b){return b-a});
    ocEl.innerHTML='<div class="cp-oc-hd">共 '+info.occurrences.length+" 处出现</div>"+
      years.map(function(y){return byYear[y].map(function(o){
        var icon=o.source==="letters"?"📖":o.source==="meetings"?"🎤":"🧠";
        return '<div class="cp-oc-it" data-pid="'+o.pid+'" data-source="'+o.source+'" data-year="'+o.year+'">'+
          '<div class="cp-oc-y">'+icon+" "+o.year+" · "+esc(o.title.substring(0,30))+"</div>"+
          '<div class="cp-oc-p">'+esc(o.text)+"</div></div>";
      }).join("")}).join("");
    ocEl.querySelectorAll(".cp-oc-it").forEach(function(el){el.addEventListener("click",function(){
      var src=el.dataset.source,y=Number(el.dataset.year);
      if(src==="munger"){if(mode!=="munger")switchMode("munger");var idx=0;for(var i=0;i<MUNGER.length;i++){if(MUNGER[i].year===y){idx=i;break}}showContent(idx)}
      else{showContent(y)}
      closeConceptPanel();
      setTimeout(function(){
        var pid=el.dataset.pid;
        var p=document.querySelector('.par[data-pid="'+pid+'"]');
        if(p){p.scrollIntoView({behavior:"smooth",block:"center"});p.style.transition="background .3s";p.style.background="rgba(201,168,76,0.18)";setTimeout(function(){p.style.background=""},1500)}
      },200)
    })});
  }else{ocEl.innerHTML='<div class="cp-oc-hd">暂无出现</div>'}
  document.getElementById("cp").classList.add("open");
  document.getElementById("cp-ov").classList.add("open");
}

function closeConceptPanel(){
  var cpEl=document.getElementById("cp");if(cpEl)cpEl.classList.remove("open");
  var ovEl=document.getElementById("cp-ov");if(ovEl)ovEl.classList.remove("open");
}

// ===== Toggle sections =====
document.querySelectorAll(".sbs-hd").forEach(function(el){el.addEventListener("click",function(){toggleSection(el.closest(".sbs").id)})});

// ===== Click handlers for concept terms =====
document.addEventListener("click",function(e){
  var t=e.target.closest(".hl-cpt");
  if(t&&t.dataset.cpt){try{showConceptPanel(t.dataset.cpt)}catch(ex){alert("概念面板错误: "+ex.message)};e.preventDefault()}
});

// ===== Init =====
function init(){
  iD();loadTheme();
  renderSidebar();renderThemeFilter();renderEntityFilter();renderBookmarks();renderHistory();updateStats();
  switchMode("letters");
  restoreSections();
  D.tab.querySelectorAll(".tab").forEach(function(t){t.addEventListener("click",function(){switchMode(t.dataset.mode)})});
  D.thBtn.addEventListener("click",toggleTheme);
  var cpCls=document.getElementById("cp-cls");if(cpCls)cpCls.addEventListener("click",closeConceptPanel);
  var cpOv=document.getElementById("cp-ov");if(cpOv)cpOv.addEventListener("click",closeConceptPanel);
  D.randBtn.addEventListener("click",function(){
    var pool=gF();if(!pool.length)return;
    var item=pool[Math.floor(Math.random()*pool.length)];
    if(searchMode)clearSearch();
    if(mode==="munger"){var idx=MUNGER.indexOf(item);if(idx>=0)showContent(idx)}
    else{showContent(item.year)}
  });
  var hmBtn=$("#hm-btn"),sbOv=$("#sb-ov"),sb=$("#sb");
  if(hmBtn)hmBtn.addEventListener("click",function(){sb.classList.toggle("open");if(sbOv)sbOv.classList.toggle("open")});
  if(sbOv)sbOv.addEventListener("click",function(){sb.classList.remove("open");sbOv.classList.remove("open")});
  D.btt.addEventListener("click",function(){D.ct.scrollTo({top:0,behavior:"smooth"})});
  D.sI.addEventListener("input",onSearch);
  D.sI.addEventListener("keydown",function(e){if(e.key==="Escape")clearSearch()});
  document.addEventListener("keydown",function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==="f"){e.preventDefault();D.sI.focus()}
    if(!searchMode&&!e.ctrlKey&&!e.metaKey){
      if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();var f=getData();if(mode==="munger"){var ci=MUNGER.indexOf(f.find(function(l){return l.title===currentMunger}));if(ci===-1)return;var cn=e.key==="ArrowDown"?Math.min(ci+1,f.length-1):Math.max(ci-1,0);if(cn!==ci)showContent(cn)}else{var s=f.slice().sort(function(a,b){return b.year-a.year});var idx=s.findIndex(function(l){return l.year===currentYear});if(idx===-1)return;var n=e.key==="ArrowDown"?Math.min(idx+1,s.length-1):Math.max(idx-1,0);if(n!==idx)showContent(s[n].year)}}
    }
  });
  D.ct.addEventListener("scroll",function(){
    if(currentYear!==null&&!searchMode)ST.svPr(currentYear,D.ct.scrollTop);
    if(D.prgBar&&!searchMode){var p=Math.min(D.ct.scrollTop/(D.ct.scrollHeight-D.ct.clientHeight)*100,100);if(p<0)p=0;D.prgBar.style.width=p+"%"}
    if(D.btt)D.btt.classList.toggle("vis",D.ct.scrollTop>300);
  });
  var all=new Set();
  LETTERS.forEach(function(l){l.paragraphs.forEach(function(_,i){all.add("L-"+l.year+"-"+i)})});
  MEETINGS.forEach(function(m){m.paragraphs.forEach(function(_,i){all.add("M-"+m.year+"-"+i)})});
  ST.cln(all);
  D.ct.addEventListener("click",function(e){var t=e.target.closest(".hl-ent");if(t)showEntity(t.textContent)});
}

document.addEventListener("DOMContentLoaded",init);
