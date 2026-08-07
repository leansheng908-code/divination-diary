/**
 * 太乙神数 标签生成模块
 * 从 taiyi.html 提取的纯计算逻辑
 *
 * 三式之首 · 帝王之学 · 天人之学
 * 17层标签: L1基础排盘 / L2九宫属性 / L3十六神 / L4正宫间神 / L5核心八将 /
 *           L6主客算 / L7八门 / L8核心格局 / L9扩展格局 / L10五福太乙 /
 *           L11大游太乙 / L12三基太乙 / L13四神太乙 / L14阳九百六 /
 *           L15太乙四计 / L16旺衰主客 / L17盘面总评
 * 5项理论驱动优化: #1阴阳遁判断 #2阳九百六 #3太岁合神 #4参将计算 #5旺衰季节
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

// ===== 太乙九宫配置 =====
var TAIYI_GONG = {
1:{name:"乾宫",gua:"乾",wuxing:"金",fangwei:"西北",men:"天门",zhou:"冀州",qi:"绝阳",trigram:"☰",desc:"天之门，阳之极，君父之象"},
2:{name:"离宫",gua:"离",wuxing:"火",fangwei:"正南",men:"火门",zhou:"荆州",qi:"易气",trigram:"☲",desc:"火之门，文明之象，主光明"},
3:{name:"艮宫",gua:"艮",wuxing:"土",fangwei:"东北",men:"鬼门",zhou:"青州",qi:"和",trigram:"☶",desc:"鬼之门，止息之象，冬春之交"},
4:{name:"震宫",gua:"震",wuxing:"木",fangwei:"正东",men:"日门",zhou:"徐州",qi:"绝气",trigram:"☳",desc:"日之门，震动之象，阳气壮盛"},
5:{name:"中宫",gua:"中",wuxing:"土",fangwei:"中央",men:"无",zhou:"无",qi:"枢纽",trigram:"⊕",desc:"中天之枢纽，太乙不居，斡旋八方"},
6:{name:"兑宫",gua:"兑",wuxing:"金",fangwei:"正西",men:"月门",zhou:"雍州",qi:"绝气",trigram:"☱",desc:"月之门，肃杀之象，过中则亏"},
7:{name:"坤宫",gua:"坤",wuxing:"土",fangwei:"西南",men:"人门",zhou:"益州",qi:"和",trigram:"☷",desc:"人之门，厚德载物，阴气施令"},
8:{name:"坎宫",gua:"坎",wuxing:"水",fangwei:"正北",men:"水门",zhou:"兖州",qi:"易气",trigram:"☵",desc:"水之门，险陷之象，万物所归"},
9:{name:"巽宫",gua:"巽",wuxing:"木",fangwei:"东南",men:"风门",zhou:"扬州",qi:"绝阴",trigram:"☴",desc:"风之门，入伏之象，阴气渐长"}
};
var YANG_ORDER=[1,2,3,4,6,7,8,9];
var YIN_ORDER=[9,8,7,6,4,3,2,1];
// 十六神
var SHILIU_SHEN=[
{dizhi:"子",name:"地主",pos:"正宫",gong:8,wx:"水",desc:"阳气初发，万物阴生",zs:"动摇言语事"},
{dizhi:"丑",name:"阳德",pos:"间神",gong:null,wx:"土",desc:"二阳用事，布育万物",zs:"施恩育物事"},
{dizhi:"艮",name:"和德",pos:"正宫",gong:3,wx:"土",desc:"冬春将交，阴阳气合",zs:"和集成就事"},
{dizhi:"寅",name:"吕申",pos:"间神",gong:null,wx:"木",desc:"阳育大申，草木甲拆",zs:"运用主宰事"},
{dizhi:"卯",name:"高丛",pos:"正宫",gong:4,wx:"木",desc:"万物皆出，自地丛生",zs:"发挥事"},
{dizhi:"辰",name:"太阳",pos:"间神",gong:null,wx:"土",desc:"雷出震势，阳气大盛",zs:"危会兵戈事"},
{dizhi:"巽",name:"大旲",pos:"正宫",gong:9,wx:"木",desc:"春夏将交，暑气方盛",zs:"申命号令事"},
{dizhi:"巳",name:"大神",pos:"间神",gong:null,wx:"火",desc:"少阴用事，阴阳不测",zs:"毁拆破废事"},
{dizhi:"午",name:"大威",pos:"正宫",gong:2,wx:"火",desc:"阳附阴生，刑暴始行",zs:"光明威烈事"},
{dizhi:"未",name:"天道",pos:"间神",gong:null,wx:"土",desc:"火能生土，土王于未",zs:"阴私事"},
{dizhi:"坤",name:"大武",pos:"正宫",gong:7,wx:"土",desc:"夏秋将交，阴气施令",zs:"刑罚事"},
{dizhi:"申",name:"武德",pos:"间神",gong:null,wx:"金",desc:"万物欲死，荠麦将生",zs:"传送迁移事"},
{dizhi:"酉",name:"太簇",pos:"正宫",gong:6,wx:"金",desc:"万物皆成，有大品簇",zs:"更易肃杀事"},
{dizhi:"戌",name:"阴主",pos:"间神",gong:null,wx:"土",desc:"阳气不长，阴气用事",zs:"危期兵丧事"},
{dizhi:"乾",name:"阴德",pos:"正宫",gong:1,wx:"金",desc:"秋冬将交，阴前生阳",zs:"命令事"},
{dizhi:"亥",name:"大义",pos:"间神",gong:null,wx:"水",desc:"万物怀垢，群阳欲尽",zs:"计谋废弃事"}
];
var DIZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
var ZHENG_GONG=["子","午","卯","酉","乾","坤","艮","巽"];
var JIAN_SHEN=["寅","申","巳","亥","辰","戌","丑","未"];
// 计神表
var JISHEN_TABLE={子:{y:"寅",n:"申"},丑:{y:"丑",n:"未"},寅:{y:"子",n:"午"},卯:{y:"亥",n:"巳"},辰:{y:"戌",n:"辰"},巳:{y:"酉",n:"卯"},午:{y:"申",n:"寅"},未:{y:"未",n:"丑"},申:{y:"午",n:"子"},酉:{y:"巳",n:"亥"},戌:{y:"辰",n:"戌"},亥:{y:"卯",n:"酉"}};
// 八门
var BAMEN={开:{gong:"乾",fw:"西北",wx:"金",jx:"大吉",desc:"开向通达",yi:"出行/开业/嫁娶"},休:{gong:"坎",fw:"正北",wx:"水",jx:"大吉",desc:"休息安居",yi:"安养/筑室/和合"},生:{gong:"艮",fw:"东北",wx:"土",jx:"大吉",desc:"生育万物",yi:"种植/祈福/求嗣"},伤:{gong:"震",fw:"正东",wx:"木",jx:"大凶",desc:"疾病灾殃",yi:"忌行/忌战"},杜:{gong:"巽",fw:"东南",wx:"木",jx:"大凶",desc:"闭塞不通",yi:"忌行/忌谋"},景:{gong:"离",fw:"正南",wx:"火",jx:"小吉",desc:"鬼怪亡遗",yi:"上书/访道"},死:{gong:"坤",fw:"西南",wx:"土",jx:"大凶",desc:"死丧埋葬",yi:"忌行/忌战"},惊:{gong:"兑",fw:"正西",wx:"金",jx:"小凶",desc:"惊恐奔走",yi:"忌行/忌谋"}};
var BAMEN_ORDER=["开","休","生","伤","杜","景","死","惊"];
// 格局
var GEJU_CORE={杜塞:{jx:"凶",desc:"主客大小将落入中宫，将领失去联系",yj:"宜固守不宜出击"},对:{jx:"凶",desc:"文昌与太乙对冲宫位，大臣怀二心",yj:"防内乱"},格:{jx:"凶",desc:"始击或客大小将与太乙对冲，以下犯上",yj:"防叛乱"},掩:{jx:"凶",desc:"始击临太乙宫，遮掩袭击，君弱臣强",yj:"防蒙蔽"},囚:{jx:"凶",desc:"文昌或四将与太乙同宫，囚禁困守",yj:"防困厄"},关:{jx:"凶",desc:"主客大小将同宫，将相不和",yj:"防内斗"}};
var GEJU_EXT={迫:{jx:"凶",desc:"主客大将在太乙左右宫，臣下迫于上"},长数:{jx:"吉",desc:"主客算10-30，谋事长远"},短数:{jx:"凶",desc:"主客算10以下，谋事急促"},重阳数:{jx:"吉",desc:"三九自临(33/39)，阳之极盛"},重阴数:{jx:"凶",desc:"二六自临(22/26)，阴之极盛"},上和数:{jx:"大吉",desc:"奇偶阴阳互用"},下和数:{jx:"平",desc:"十二/十六/二十一/二十七等"},三才数:{jx:"吉",desc:"含天(十)地(五)人(一)三才俱全"},不和数:{jx:"凶",desc:"太乙在阳宫得奇数或阴宫得偶数"}};
var YANG_GONGS=[8,3,4,9];var YIN_GONGS=[2,1,6,7];
var WUFU_PATH=[1,9,3,7,5];
var DAYOU_PATH=[7,6,4,3,2,1,9,8];
var WX_SHENG={金:"水",水:"木",木:"火",火:"土",土:"金"};
var WX_KE={金:"木",木:"土",土:"水",水:"火",火:"金"};
var CHONG={1:9,9:1,2:8,8:2,3:7,7:3,4:6,6:4};

// ===== 辅助函数 =====
function getShenByDizhi(dz){for(var i=0;i<16;i++){if(SHILIU_SHEN[i].dizhi==dz)return SHILIU_SHEN[i];}return null;}
function getShenByName(n){for(var i=0;i<16;i++){if(SHILIU_SHEN[i].name==n)return SHILIU_SHEN[i];}return null;}

function getJiNian(year){return 10153917+year;}
function getNianZhi(year){var base=2024,bi=4;return DIZHI[((bi+(year-base))%12+12)%12];}
function getDun(year){
  var jn=getJiNian(year);
  var yuanIdx=Math.floor(jn/72)%5;
  if(yuanIdx%2==0)return{name:"阳遁",order:YANG_ORDER};
  return{name:"阴遁",order:YIN_ORDER};
}
function getTaiyiGong(year){
  var jn=getJiNian(year);
  var dun=getDun(year);
  var rem=jn%24;
  var gi=Math.floor(rem/3);
  var yig=rem%3;
  if(gi>=dun.order.length)gi=gi%dun.order.length;
  var gong=dun.order[gi];
  var tdr=["理天","理地","理人"][yig];
  return{gong:gong,tdr:tdr,dun:dun.name};
}
function getWenchang(year){
  var jn=getJiNian(year);
  var dun=getDun(year);
  var rem=jn%18;
  var startIdx;
  if(dun.name=="阳遁"){var s=getShenByName("武德");startIdx=SHILIU_SHEN.indexOf(s);}
  else{var s=getShenByName("吕申");startIdx=SHILIU_SHEN.indexOf(s);}
  var count=0,idx=startIdx;
  var dbl=dun.name=="阳遁"?["阴德","大武"]:["和德","大旲"];
  while(count<rem){
    idx=(idx+1)%16;count++;
    var shen=SHILIU_SHEN[idx];
    if(dbl.indexOf(shen.name)>=0&&count<rem){count++;}
  }
  return{dizhi:SHILIU_SHEN[idx].dizhi,name:SHILIU_SHEN[idx].name,gong:SHILIU_SHEN[idx].gong};
}
function getJishen(year){
  var nz=getNianZhi(year);
  var dun=getDun(year);
  var key=dun.name=="阳遁"?"y":"n";
  return JISHEN_TABLE[nz][key];
}
function getShiji(year){
  var wc=getWenchang(year);
  var js=getJishen(year);
  var jsIdx=-1,hdIdx=-1,wcIdx=-1;
  for(var i=0;i<16;i++){
    if(SHILIU_SHEN[i].dizhi==js)jsIdx=i;
    if(SHILIU_SHEN[i].name=="和德")hdIdx=i;
    if(SHILIU_SHEN[i].dizhi==wc.dizhi)wcIdx=i;
  }
  var shift=(hdIdx-jsIdx)%16;
  if(shift<0)shift+=16;
  var si=(wcIdx+shift)%16;
  return{dizhi:SHILIU_SHEN[si].dizhi,name:SHILIU_SHEN[si].name,gong:SHILIU_SHEN[si].gong};
}
function calcSuan(startDz,startGong,taiyiGong){
  var order=YANG_ORDER;
  if(startGong!=null){
    var suan=startGong;
    var sp=order.indexOf(startGong);
    var tp=order.indexOf(taiyiGong);
    var pos=(sp+1)%8;
    while(pos!=tp){suan+=order[pos];pos=(pos+1)%8;}
    return suan;
  }else{
    var suan=1;
    var si=-1;
    for(var i=0;i<16;i++){if(SHILIU_SHEN[i].dizhi==startDz)si=i;}
    var pos=(si+1)%16;
    while(SHILIU_SHEN[pos].gong==null){pos=(pos+1)%16;}
    var fg=SHILIU_SHEN[pos].gong;
    var fp=order.indexOf(fg);
    var tp=order.indexOf(taiyiGong);
    var p=fp;
    while(p!=tp){suan+=order[p];p=(p+1)%8;}
    return suan;
  }
}
function getDaJiang(suan){
  if(suan%10==0){return suan%9!=0?suan%9:9;}
  return suan%10;
}
function getCanJiang(dj){var r=(dj*3)%10;return r!=0?r:10;}
function getBamen(year){var jn=getJiNian(year);var rem=jn%240;return BAMEN_ORDER[Math.floor(rem/30)%8];}
function getWufu(year){var jn=getJiNian(year);return WUFU_PATH[Math.floor(jn/45)%5];}
function getDayou(year){var jn=getJiNian(year);return DAYOU_PATH[Math.floor(jn/36)%8];}

function checkGeju(tg,wdz,sdz,zda,kda,zcan,kcan){
  var g=[];
  var wg=getShenByDizhi(wdz).gong;
  var sg=getShenByDizhi(sdz).gong;
  if(wg&&CHONG[tg]==wg)g.push("对");
  if(sg&&CHONG[tg]==sg)g.push("格");
  if(sg&&sg==tg)g.push("掩");
  if(wg&&wg==tg)g.push("囚");
  if(zda==tg)g.push("囚(主大将)");
  if(kda==tg)g.push("囚(客大将)");
  if(zda==kda)g.push("关");
  if(zda==5||kda==5)g.push("杜塞");
  var order=YANG_ORDER;
  var tp=order.indexOf(tg);
  var left=order[(tp-1+8)%8];
  var right=order[(tp+1)%8];
  if(zda==left||zda==right)g.push("迫(主大将)");
  if(kda==left||kda==right)g.push("迫(客大将)");
  return g;
}
function checkYinyangShu(zs,ks,tg){
  var s=[];
  if(10<=zs&&zs<30)s.push("长数");else if(zs<10)s.push("短数");else s.push("过长数");
  if(10<=ks&&ks<30)s.push("长数");else if(ks<10)s.push("短数");else s.push("过长数");
  if(zs==33||zs==39||ks==33||ks==39)s.push("重阳数");
  if(zs==22||zs==26||ks==22||ks==26)s.push("重阴数");
  if([12,16,21,27,34,38].indexOf(zs)>=0||[12,16,21,27,34,38].indexOf(ks)>=0)s.push("下和数");
  if(YANG_GONGS.indexOf(tg)>=0&&zs%2==1)s.push("不和数");
  if(YIN_GONGS.indexOf(tg)>=0&&zs%2==0)s.push("不和数");
  return s;
}
function calcYangjiu(year){
  var jn=getJiNian(year);
  var yjMaj=jn%4560,yjMin=jn%456;
  var blMaj=jn%4320,blMin=jn%288;
  return{
    yj:{maj:4560,min:456,majPos:yjMaj,minPos:yjMin,isMaj:yjMaj<10,isMin:yjMin<10,desc:(yjMaj<10||yjMin<10)?"灾厄年":"非灾厄年"},
    bl:{maj:4320,min:288,majPos:blMaj,minPos:blMin,isMaj:blMaj<10,isMin:blMin<10,desc:(blMaj<10)?"大厄之终":(blMin<10?"小厄之年":"非厄年")}
  };
}
function getTaishuiHeshen(year){
  var nz=getNianZhi(year);
  var zi=DIZHI.indexOf(nz);
  var hs=DIZHI[(zi+2)%12];
  var hshen=getShenByDizhi(hs);
  return{taishui:nz,heshen:hs,heshenName:hshen?hshen.name:"未知"};
}
function getWangshuai(gong,nz){
  var gwx=TAIYI_GONG[gong].wuxing;
  var swx={寅:"木",卯:"木",辰:"木",巳:"火",午:"火",未:"火",申:"金",酉:"金",戌:"金",亥:"水",子:"水",丑:"水"};
  var wx=swx[nz];
  if(!wx)return"平";
  if(wx==gwx)return"旺";
  if(WX_SHENG[wx]==gwx)return"相";
  if(WX_KE[gwx]==wx)return"死";
  if(WX_KE[wx]==gwx)return"囚";
  return"休";
}
function ganzhi(year,month,day){
  var base=new Date(2024,0,1);
  var target=new Date(year,month-1,day);
  var days=Math.floor((target-base)/(1000*60*60*24));
  var gz=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  var zz=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  var di=days%60;var di2=((days%60)+60)%60;
  var dayGz=gz[di2%10]+zz[di2%12];
  var yz=zz[((4+(year-2024))%12+12)%12];
  var yg=gz[((0+(year-2024))%10+10)%10];
  return{yearGz:yg+yz,dayGz:dayGz};
}

// ===== 标签生成函数 =====
function generateLabels(year, month, day, hour, minute, options) {
    options = options || {};

    var jn = getJiNian(year);
    var ty = getTaiyiGong(year);
    var wc = getWenchang(year);
    var nz = getNianZhi(year);
    var js = getJishen(year);
    var sj = getShiji(year);
    var zs = calcSuan(wc.dizhi, wc.gong, ty.gong);
    var ks = calcSuan(sj.dizhi, sj.gong, ty.gong);
    var zd = getDaJiang(zs), zc = getCanJiang(zd);
    var kd = getDaJiang(ks), kc = getCanJiang(kd);
    var bm = getBamen(year);
    var wf = getWufu(year), dy = getDayou(year);
    var gj = checkGeju(ty.gong, wc.dizhi, sj.dizhi, zd, kd, zc, kc);
    var yys = checkYinyangShu(zs, ks, ty.gong);
    var ws = getWangshuai(ty.gong, nz);

    // 干支: 优先使用 options.ganzhi, 否则自行计算
    var gz;
    if (options.ganzhi && options.ganzhi.yearGz) {
        gz = { yearGz: options.ganzhi.yearGz, dayGz: options.ganzhi.dayGz || '' };
    } else {
        gz = ganzhi(year, month, day);
    }

    var yj = calcYangjiu(year);
    var ts = getTaishuiHeshen(year);
    var tg = TAIYI_GONG[ty.gong];
    var allGj = gj.concat(yys);
    var xiongN = 0, jiN = 0;
    allGj.forEach(function(g) {
        var info = GEJU_CORE[g] || GEJU_EXT[g] || {};
        if (info.jx && info.jx.indexOf("凶") >= 0) xiongN++;
        if (info.jx && info.jx.indexOf("吉") >= 0) jiN++;
    });

    // L1 基础排盘
    var L1 = {
        '积年数': String(jn),
        '阴阳遁': ty.dun,
        '太乙宫': ty.gong + '宫(' + tg.name + ')',
        '太乙天地人': ty.tdr,
        '文昌天目': wc.name + '(' + wc.dizhi + ')',
        '始击地目': sj.name + '(' + sj.dizhi + ')',
        '计神': js + '(' + getShenByDizhi(js).name + ')',
        '年支': nz,
        '年干支': gz.yearGz,
        '日干支': gz.dayGz,
        '主算': String(zs),
        '客算': String(ks),
        '五福太乙': wf + '宫(' + TAIYI_GONG[wf].name + ')',
        '合神_优化3': ts.heshen + '(' + ts.heshenName + ')',
        '阳九百六_优化2': yj.yj.desc + ' / ' + yj.bl.desc
    };

    // L2 九宫属性
    var L2 = {};
    for (var gn = 1; gn <= 9; gn++) {
        var gi2 = TAIYI_GONG[gn];
        L2[gn + '宫' + gi2.name] = gi2.wuxing + ' · ' + gi2.fangwei + ' · ' + gi2.men + ' · ' + gi2.qi + ' · ' + gi2.zhou;
    }

    // L3 十六神排布
    var L3 = {};
    SHILIU_SHEN.forEach(function(s) {
        L3[s.dizhi + '_' + s.name] = s.pos + ' ' + (s.gong || '间神') + ' ' + s.wx + ' | ' + s.desc + ' | 主:' + s.zs;
    });

    // L4 正宫与间神
    var L4 = {};
    ZHENG_GONG.forEach(function(dz) {
        var s = getShenByDizhi(dz);
        L4['正宫_' + dz + '_' + s.name] = s.gong + '宫 ' + TAIYI_GONG[s.gong].name + ' ' + s.wx;
    });
    JIAN_SHEN.forEach(function(dz) {
        var s = getShenByDizhi(dz);
        L4['间神_' + dz + '_' + s.name] = s.wx + ' | 主:' + s.zs;
    });

    // L5 核心八将
    var L5 = {
        '太乙': { '宫位': ty.gong + '宫 ' + tg.name, '属性': ty.tdr + ' | 北极星，整体趋势' },
        '文昌天目': { '宫位': wc.name + '(' + (wc.gong || '间神') + '宫)', '属性': '火星 | 文运内政，主方' },
        '始击地目': { '宫位': sj.name + '(' + (sj.gong || '间神') + '宫)', '属性': '填星 | 外部冲击，客方' },
        '计神': { '宫位': js + '(' + getShenByDizhi(js).name + ')', '属性': '岁星之使 | 筹度动静' },
        '主大将': { '宫位': zd + '宫', '属性': '金神太白精 | 主方核心力' },
        '主参将': { '宫位': zc + '宫', '属性': '水神 | 主方辅助力' },
        '客大将': { '宫位': kd + '宫', '属性': '水神辰星精 | 客方核心力' },
        '客参将': { '宫位': kc + '宫', '属性': '客方辅助力量' }
    };

    // L6 主客算分析
    var L6 = {
        '主算值': String(zs),
        '主算长短': (10 <= zs && zs < 30 ? '长数' : (zs < 10 ? '短数' : '过长数')),
        '主算含义': (10 <= zs && zs < 30 ? '谋事长远力量充足' : (zs < 10 ? '谋事急促力量不足' : '拖沓迟缓')),
        '主大将宫': String(zd),
        '主参将宫': String(zc),
        '主算和否': ([12, 16, 21, 27, 34, 38].indexOf(zs) >= 0 ? '和' : ((YANG_GONGS.indexOf(ty.gong) >= 0 && zs % 2 == 1) || (YIN_GONGS.indexOf(ty.gong) >= 0 && zs % 2 == 0) ? '不和' : '平')),
        '客算值': String(ks),
        '客算长短': (10 <= ks && ks < 30 ? '长数' : (ks < 10 ? '短数' : '过长数')),
        '客算含义': (10 <= ks && ks < 30 ? '谋事长远力量充足' : (ks < 10 ? '谋事急促力量不足' : '拖沓迟缓')),
        '客大将宫': String(kd),
        '客参将宫': String(kc),
        '客算和否': ([12, 16, 21, 27, 34, 38].indexOf(ks) >= 0 ? '和' : ((YANG_GONGS.indexOf(ty.gong) >= 0 && ks % 2 == 1) || (YIN_GONGS.indexOf(ty.gong) >= 0 && ks % 2 == 0) ? '不和' : '平'))
    };

    // L7 八门系统
    var L7 = {
        '值使门': bm + '门(' + BAMEN[bm].jx + ')',
        '值使方位': BAMEN[bm].fw,
        '值使含义': BAMEN[bm].desc,
        '值使宜': BAMEN[bm].yi
    };
    Object.keys(BAMEN).forEach(function(n) {
        var b = BAMEN[n];
        L7[n + '门'] = b.gong + ' ' + b.wx + ' ' + b.jx + ' | ' + b.desc;
    });

    // L8 核心格局
    var L8 = {};
    Object.keys(GEJU_CORE).forEach(function(n) {
        var trig = gj.indexOf(n) >= 0 || gj.some(function(x) { return x.indexOf(n) >= 0; });
        L8[n + (trig ? '_触发' : '_未触发')] = GEJU_CORE[n].jx + ' | ' + GEJU_CORE[n].desc + ' | ' + GEJU_CORE[n].yj;
    });

    // L9 扩展格局与阴阳数
    var L9 = {};
    Object.keys(GEJU_EXT).forEach(function(n) {
        var trig = yys.indexOf(n) >= 0;
        L9[n + (trig ? '_触发' : '_未触发')] = GEJU_EXT[n].jx + ' | ' + GEJU_EXT[n].desc;
    });
    L9['触发格局列表'] = gj.length > 0 ? gj.join(', ') : '无';
    L9['触发阴阳数列表'] = yys.length > 0 ? yys.join(', ') : '无';

    // L10 五福太乙
    var L10 = {
        '当前宫': wf + '宫(' + TAIYI_GONG[wf].name + ')',
        '五行': TAIYI_GONG[wf].wuxing,
        '行宫路径': WUFU_PATH.join('→'),
        '移宫周期': '45年',
        '含义': '福佑之神，主寿考灾祥'
    };

    // L11 大游太乙
    var L11 = {
        '当前宫': dy + '宫(' + TAIYI_GONG[dy].name + ')',
        '五行': TAIYI_GONG[dy].wuxing,
        '行宫路径': DAYOU_PATH.join('→'),
        '移宫周期': '36年',
        '含义': '大游太岁最凶，主兵革灾疫'
    };

    // L12 三基太乙
    var L12 = {
        '君基': '30年 | 君王之基，主国运 | 顺行八宫',
        '臣基': '3年 | 臣子之基，主辅相 | 顺行八宫',
        '民基': '1年 | 百姓之基，主民生 | 顺行十二支'
    };

    // L13 四神太乙
    var L13 = {
        '天乙': '3年 | 金精，顺行十二宫 | 起始6宫',
        '地乙': '3年 | 死丧最凶，顺行十二宫 | 起始9宫',
        '直符': '3年 | 旱涝虫蝗，顺行十二宫 | 起始5宫',
        '四神': '3年 | 水火金木为殃疾 | 起始1宫'
    };

    // L14 阳九百六
    var L14 = {
        '阳九状态': yj.yj.desc,
        '阳九大周期': yj.yj.maj + '年 (位置:' + yj.yj.majPos + ')',
        '阳九小周期': yj.yj.min + '年 (位置:' + yj.yj.minPos + ')',
        '阴六状态': yj.bl.desc,
        '阴六大周期': yj.bl.maj + '年 (位置:' + yj.bl.majPos + ')',
        '阴六小周期': yj.bl.min + '年 (位置:' + yj.bl.minPos + ')'
    };

    // L15 太乙四计
    var L15 = {
        '岁计': '年太乙，占国运大势 | 积年数入局',
        '月计': '月太乙，占月内运势 | 积月数入局',
        '日计': '日太乙，占日内吉凶 | 积日数入局',
        '时计': '时太乙，占时辰吉凶 | 积时数入局'
    };

    // L16 旺衰主客
    var L16 = {
        '太乙宫旺衰': ws,
        '太乙宫五行': tg.wuxing,
        '太乙宫气': tg.qi,
        '主客对比': zs > ks ? '主强客弱' : (ks > zs ? '客强主弱' : '主客均等'),
        '主算旺衰': (10 <= zs && zs < 30 ? '旺' : (zs < 10 ? '衰' : '过旺')),
        '客算旺衰': (10 <= ks && ks < 30 ? '旺' : (ks < 10 ? '衰' : '过旺')),
        '格局吉凶': gj.length > 0 ? '凶' : '平',
        '整体趋势': ty.tdr,
        '主大将同宫': zd == ty.gong ? '同宫(囚)' : '异宫',
        '客大将同宫': kd == ty.gong ? '同宫(囚)' : '异宫',
        '太岁': ts.taishui,
        '合神': ts.heshen + '(' + ts.heshenName + ')'
    };

    // L17 盘面总评
    var L17 = {
        '整体吉凶': xiongN > jiN ? '凶' : (jiN > xiongN ? '吉' : '平'),
        '主要格局': gj.length > 0 ? gj.join(', ') : '无特殊格局',
        '主算总评': '算' + zs + '(' + (10 <= zs && zs < 30 ? '长' : '短') + ')',
        '客算总评': '算' + ks + '(' + (10 <= ks && ks < 30 ? '长' : '短') + ')',
        '主客胜负': zs > ks ? '主胜' : (ks > zs ? '客胜' : '均势'),
        '太乙所在': ty.gong + '宫' + tg.name + ty.tdr,
        '值使门': bm + '门(' + BAMEN[bm].jx + ')',
        '格局总数': String(allGj.length),
        '吉数': String(jiN),
        '凶数': String(xiongN)
    };

    var layers = {
        'L1_基础排盘': L1,
        'L2_九宫属性': L2,
        'L3_十六神排布': L3,
        'L4_正宫间神': L4,
        'L5_核心八将': L5,
        'L6_主客算分析': L6,
        'L7_八门系统': L7,
        'L8_核心格局': L8,
        'L9_扩展格局': L9,
        'L10_五福太乙': L10,
        'L11_大游太乙': L11,
        'L12_三基太乙': L12,
        'L13_四神太乙': L13,
        'L14_阳九百六': L14,
        'L15_太乙四计': L15,
        'L16_旺衰主客': L16,
        'L17_盘面总评': L17
    };

    // 计算维度数
    var totalDims = 0;
    var layerNames = Object.keys(layers);
    for (var i = 0; i < layerNames.length; i++) {
        var ld = layers[layerNames[i]];
        var keys = Object.keys(ld);
        for (var j = 0; j < keys.length; j++) {
            var val = ld[keys[j]];
            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                totalDims += Object.keys(val).length;
            } else {
                totalDims++;
            }
        }
    }

    return {
        layers: layers,
        meta: {
            system_name: 'taiyi',
            system_name_cn: '太乙神数',
            total_dimensions: totalDims,
            timestamp: year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':' + String(minute || 0).padStart(2, '0'),
            jn: jn,
            dun: ty.dun,
            taiyiGong: ty.gong
        }
    };
}

// ===== 标准接口 =====
window.Systems.taiyi = function(year, month, day, hour, minute, options) {
    hour = hour || 12;
    minute = minute || 0;
    options = options || {};

    var result = generateLabels(year, month, day, hour, minute, options);
    var layers = result.layers;
    var dimensions = {};

    // 展平为 dimensions
    var layerNames = Object.keys(layers);
    for (var i = 0; i < layerNames.length; i++) {
        var layerName = layerNames[i];
        var layerData = layers[layerName];
        var keys = Object.keys(layerData);
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            var val = layerData[key];
            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                var subKeys = Object.keys(val);
                for (var k = 0; k < subKeys.length; k++) {
                    var subKey = subKeys[k];
                    var subVal = val[subKey];
                    if (subVal !== null && subVal !== '' && subVal !== false) {
                        dimensions[layerName + '.' + key + '.' + subKey] = subVal;
                    }
                }
            } else if (val !== null && val !== '' && val !== false) {
                if (Array.isArray(val)) {
                    dimensions[layerName + '.' + key] = val.join(', ');
                } else {
                    dimensions[layerName + '.' + key] = val;
                }
            }
        }
    }

    // 生成摘要
    var l1 = layers['L1_基础排盘'] || {};
    var l17 = layers['L17_盘面总评'] || {};
    var summary = '';
    if (l1['阴阳遁']) summary += l1['阴阳遁'];
    if (l1['太乙宫']) summary += ' | ' + l1['太乙宫'];
    if (l1['主算']) summary += ' | 主算:' + l1['主算'];
    if (l1['客算']) summary += ' | 客算:' + l1['客算'];
    if (l17['主客胜负']) summary += ' | ' + l17['主客胜负'];

    return {
        dimensions: dimensions,
        name: '太乙神数',
        meta: result.meta
    };
};

})();
