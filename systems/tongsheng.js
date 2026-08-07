/**
 * 通胜择日 标签生成模块
 * 从 tongsheng.html 提取的纯计算逻辑
 *
 * 系统⑦ · 246维 · v1.1-optimized · 17层结构 + 5项理论驱动优化
 * 17层标签: L1基础排盘 / L2建除十二神 / L3二十八宿 / L4黄黑道神 / L5纳音五行 /
 *           L6六曜系统 / L7二十四山 / L8吉神系统 / L9凶煞系统 / L10地支关系 /
 *           L11三合三煞 / L12择日宜忌 / L13五行分析 / L14时辰择吉 / L15民俗择日 /
 *           L16星宿分类 / L17盘面总评
 * 5项理论驱动优化: #1六曜农历计算 #2二十八宿精确值日 #3天德月德天赦 #4四离四绝检测 #5综合宜忌分层评估
 * 干支来源优先级: options.ganzhi > 内置solarToGanzhi
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

// ===== 基础数据表 =====
var DIZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
var TIANGAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

// --- 建除十二神 ---
var JIANCHU=["建","除","满","平","定","执","破","危","成","收","开","闭"];
var JIANCHU_ATTR={
"建":{"jixiong":"黑道","desc":"万物生育之日","yi":"赴任/上任","ji":"动土/开仓"},
"除":{"jixiong":"黄道","desc":"除旧布新之日","yi":"治病/清扫/出行","ji":"嫁娶"},
"满":{"jixiong":"黑道","desc":"丰满圆满之日","yi":"祭祀/祈福","ji":"嫁娶/安葬"},
"平":{"jixiong":"黑道","desc":"平平无奇之日","yi":"修造/动土","ji":"开渠/掘井"},
"定":{"jixiong":"黄道","desc":"安定守成之日","yi":"冠笄/立券/交易","ji":"出行/词讼"},
"执":{"jixiong":"黄道","desc":"执持守固之日","yi":"捕捉/狩猎","ji":"开市/立券"},
"破":{"jixiong":"大凶","desc":"破坏衰败之日","yi":"破屋/坏垣","ji":"万事不宜"},
"危":{"jixiong":"黄道","desc":"危险但可成之日","yi":"祭祀/祈福/安床","ji":"登山/乘船"},
"成":{"jixiong":"大吉","desc":"成就成功之日","yi":"嫁娶/开市/入学/迁居","ji":"词讼"},
"收":{"jixiong":"黑道","desc":"收敛收藏之日","yi":"纳财/捕捉/开市","ji":"出行/安葬"},
"开":{"jixiong":"大吉","desc":"开张通达之日","yi":"开业/嫁娶/出行/迁居","ji":"安葬"},
"闭":{"jixiong":"大凶","desc":"封闭停滞之日","yi":"筑堤/塞穴","ji":"万事不宜"}
};

// --- 二十八宿 ---
var ERSHIBA_XIU=[
{name:"角",xiang:"青龙",fangwei:"东",wuxing:"木",jixiong:"吉",desc:"造作婚嫁添人口",yi:"造作/嫁娶/出行",ji:"葬埋"},
{name:"亢",xiang:"青龙",fangwei:"东",wuxing:"金",jixiong:"凶",desc:"婚姻不吉有灾殃",yi:"祭祀",ji:"嫁娶/修造"},
{name:"氐",xiang:"青龙",fangwei:"东",wuxing:"土",jixiong:"凶",desc:"凡事不吉有忧愁",yi:"种植",ji:"嫁娶/出行"},
{name:"房",xiang:"青龙",fangwei:"东",wuxing:"日",jixiong:"吉",desc:"田园进益人口安",yi:"祈福/嫁娶/造作",ji:"葬埋"},
{name:"心",xiang:"青龙",fangwei:"东",wuxing:"月",jixiong:"凶",desc:"凶恶之星惹灾殃",yi:"祭祀",ji:"嫁娶/出行"},
{name:"尾",xiang:"青龙",fangwei:"东",wuxing:"火",jixiong:"吉",desc:"造作百事皆如意",yi:"造作/嫁娶",ji:"葬埋"},
{name:"箕",xiang:"青龙",fangwei:"东",wuxing:"水",jixiong:"吉",desc:"造作仓廪福寿长",yi:"造仓/掘井",ji:"嫁娶"},
{name:"斗",xiang:"玄武",fangwei:"北",wuxing:"木",jixiong:"凶",desc:"婚姻祭祀不吉昌",yi:"开渠/穿井",ji:"嫁娶/葬埋"},
{name:"牛",xiang:"玄武",fangwei:"北",wuxing:"金",jixiong:"凶",desc:"凡事不利有灾殃",yi:"祭祀",ji:"嫁娶/动土"},
{name:"女",xiang:"玄武",fangwei:"北",wuxing:"土",jixiong:"凶",desc:"凡事不吉有忧愁",yi:"学艺",ji:"嫁娶/造作"},
{name:"虚",xiang:"玄武",fangwei:"北",wuxing:"日",jixiong:"凶",desc:"葬埋不可用此日",yi:"祭祀",ji:"葬埋/出行"},
{name:"危",xiang:"玄武",fangwei:"北",wuxing:"月",jixiong:"凶",desc:"凡事不利招灾殃",yi:"祭祀",ji:"登山/乘船"},
{name:"室",xiang:"玄武",fangwei:"北",wuxing:"火",jixiong:"吉",desc:"造作婚嫁福禄昌",yi:"造作/嫁娶/迁居",ji:"葬埋"},
{name:"壁",xiang:"玄武",fangwei:"北",wuxing:"水",jixiong:"吉",desc:"造作嫁娶事事昌",yi:"造作/嫁娶/入宅",ji:"葬埋"},
{name:"奎",xiang:"白虎",fangwei:"西",wuxing:"木",jixiong:"凶",desc:"凡事不吉有忧愁",yi:"学艺",ji:"嫁娶/造作"},
{name:"娄",xiang:"白虎",fangwei:"西",wuxing:"金",jixiong:"吉",desc:"婚姻祭祀大吉昌",yi:"嫁娶/祭祀/造作",ji:"葬埋"},
{name:"胃",xiang:"白虎",fangwei:"西",wuxing:"土",jixiong:"吉",desc:"造作嫁娶福禄昌",yi:"造作/嫁娶",ji:"葬埋"},
{name:"昴",xiang:"白虎",fangwei:"西",wuxing:"日",jixiong:"凶",desc:"凡事不吉有灾殃",yi:"祭祀",ji:"嫁娶/出行"},
{name:"毕",xiang:"白虎",fangwei:"西",wuxing:"月",jixiong:"吉",desc:"造作婚嫁皆如意",yi:"造作/嫁娶/开市",ji:"葬埋"},
{name:"觜",xiang:"白虎",fangwei:"西",wuxing:"火",jixiong:"凶",desc:"凡事不吉有忧愁",yi:"祭祀",ji:"嫁娶/动土"},
{name:"参",xiang:"白虎",fangwei:"西",wuxing:"水",jixiong:"吉",desc:"造作婚嫁福禄昌",yi:"造作/嫁娶",ji:"葬埋"},
{name:"井",xiang:"朱雀",fangwei:"南",wuxing:"木",jixiong:"吉",desc:"造作婚嫁皆如意",yi:"造作/嫁娶/祭祀",ji:"葬埋"},
{name:"鬼",xiang:"朱雀",fangwei:"南",wuxing:"金",jixiong:"凶",desc:"葬埋不可用此日",yi:"祭祀",ji:"嫁娶/葬埋"},
{name:"柳",xiang:"朱雀",fangwei:"南",wuxing:"土",jixiong:"凶",desc:"凡事不吉有忧愁",yi:"种植",ji:"嫁娶/造作"},
{name:"星",xiang:"朱雀",fangwei:"南",wuxing:"日",jixiong:"凶",desc:"凡事不吉有灾殃",yi:"祭祀",ji:"嫁娶/出行"},
{name:"张",xiang:"朱雀",fangwei:"南",wuxing:"月",jixiong:"吉",desc:"造作婚嫁福禄昌",yi:"造作/嫁娶/入宅",ji:"葬埋"},
{name:"翼",xiang:"朱雀",fangwei:"南",wuxing:"火",jixiong:"凶",desc:"凡事不吉有忧愁",yi:"祭祀",ji:"嫁娶/造作"},
{name:"轸",xiang:"朱雀",fangwei:"南",wuxing:"水",jixiong:"吉",desc:"造作婚嫁事事昌",yi:"造作/嫁娶/出行",ji:"葬埋"}
];

// --- 十二黄黑道 ---
var HUANG_HEI_DAO={
"青龙":{"dao":"黄道","jixiong":"吉","desc":"吉神，宜造作/嫁娶/出行"},
"明堂":{"dao":"黄道","jixiong":"吉","desc":"吉神，宜造作/嫁娶/上任"},
"金匮":{"dao":"黄道","jixiong":"吉","desc":"吉神，宜嫁娶/纳财/开市"},
"天德":{"dao":"黄道","jixiong":"吉","desc":"吉神，宜祈福/祭祀/嫁娶"},
"玉堂":{"dao":"黄道","jixiong":"吉","desc":"吉神，宜入宅/安床/开市"},
"司命":{"dao":"黄道","jixiong":"吉","desc":"吉神，宜祭祀/祈福/安葬"},
"白虎":{"dao":"黑道","jixiong":"凶","desc":"凶神，忌嫁娶/出行"},
"天刑":{"dao":"黑道","jixiong":"凶","desc":"凶神，忌上任/词讼"},
"朱雀":{"dao":"黑道","jixiong":"凶","desc":"凶神，忌词讼/出行"},
"天牢":{"dao":"黑道","jixiong":"凶","desc":"凶神，忌祭祀/上任"},
"玄武":{"dao":"黑道","jixiong":"凶","desc":"凶神，忌嫁娶/安葬"},
"勾陈":{"dao":"黑道","jixiong":"凶","desc":"凶神，忌造作/嫁娶"}
};
var HUANG_HEI_ORDER=["青龙","明堂","天刑","朱雀","金匮","天德","白虎","玉堂","天牢","玄武","司命","勾陈"];

// --- 六十甲子纳音五行 (30种) ---
var NAYIN={
"甲子乙丑":"海中金","丙寅丁卯":"炉中火","戊辰己巳":"大林木",
"庚午辛未":"路旁土","壬申癸酉":"剑锋金","甲戌乙亥":"山头火",
"丙子丁丑":"涧下水","戊寅己卯":"城头土","庚辰辛巳":"白蜡金",
"壬午癸未":"杨柳木","甲申乙酉":"泉中水","丙戌丁亥":"屋上土",
"戊子己丑":"霹雳火","庚寅辛卯":"松柏木","壬辰癸巳":"长流水",
"甲午乙未":"沙中金","丙申丁酉":"山下火","戊戌己亥":"平地木",
"庚子辛丑":"壁上土","壬寅癸卯":"金箔金","甲辰乙巳":"覆灯火",
"丙午丁未":"天河水","戊申己酉":"大驿土","庚戌辛亥":"钗钏金",
"壬子癸丑":"桑柘木","甲寅乙卯":"大溪水","丙辰丁巳":"沙中土",
"戊午己未":"天上火","庚申辛酉":"石榴木","壬戌癸亥":"大海水"
};

// --- 六冲/六合/三合/六害 ---
var LIUCHONG={"子":"午","丑":"未","寅":"申","卯":"酉","辰":"戌","巳":"亥"};
var LIUHE={"子":"丑","寅":"亥","卯":"戌","辰":"酉","巳":"申","午":"未"};
var LIUHAI={"子":"未","丑":"午","寅":"巳","卯":"辰","申":"亥","酉":"戌"};
var SANHE={"申子辰":"水局","亥卯未":"木局","寅午戌":"火局","巳酉丑":"金局"};
var SANSHA={"申子辰":"巳午未","亥卯未":"申酉戌","寅午戌":"亥子丑","巳酉丑":"寅卯辰"};

// --- 天乙贵人 ---
var TIANYI_GUIREN={"甲":"丑未","乙":"子申","丙":"亥酉","丁":"亥酉","戊":"丑未",
"己":"子申","庚":"丑未","辛":"午寅","壬":"卯巳","癸":"卯巳"};

// --- 喜神方位 ---
var XISHEN_FANGWEI={"甲":"艮(东北)","乙":"乾(西北)","丙":"坤(西南)","丁":"离(正南)",
"戊":"巽(东南)","己":"艮(东北)","庚":"乾(西北)","辛":"坤(西南)",
"壬":"离(正南)","癸":"巽(东南)"};

// --- 财神方位 ---
var CAISHEN_FANGWEI={"甲":"东北","乙":"东北","丙":"正西","丁":"正西",
"戊":"正北","己":"正北","庚":"正东","辛":"正东",
"壬":"正南","癸":"正南"};

// --- 六曜 ---
var LIUYAO=["大安","赤口","先胜","友引","先负","佛灭"];
var LIUYAO_ATTR={
"大安":{"jixiong":"大吉","desc":"万事大吉","yi":"婚嫁/开业/搬家/入学","ji":""},
"赤口":{"jixiong":"凶","desc":"午时吉余凶","yi":"正午行事","ji":"火/刃/开业"},
"先胜":{"jixiong":"吉","desc":"上午吉下午凶","yi":"上午急事","ji":"下午行事"},
"友引":{"jixiong":"吉","desc":"早晚吉午凶","yi":"婚嫁","ji":"丧事"},
"先负":{"jixiong":"平","desc":"上午凶下午吉","yi":"下午行事","ji":"上午急事/争讼"},
"佛灭":{"jixiong":"大凶","desc":"万事凶","yi":"无","ji":"万事不宜"}
};

// --- 二十四山 ---
var ERSHISI_SHAN=[
{shan:"壬",gua:"坎",wuxing:"水",yuan:"地",desc:"正北偏东"},
{shan:"子",gua:"坎",wuxing:"水",yuan:"天",desc:"正北"},
{shan:"癸",gua:"坎",wuxing:"水",yuan:"人",desc:"正北偏西"},
{shan:"丑",gua:"艮",wuxing:"土",yuan:"天",desc:"东北偏北"},
{shan:"艮",gua:"艮",wuxing:"土",yuan:"人",desc:"东北"},
{shan:"寅",gua:"艮",wuxing:"土",yuan:"地",desc:"东北偏东"},
{shan:"甲",gua:"震",wuxing:"木",yuan:"地",desc:"正东偏北"},
{shan:"卯",gua:"震",wuxing:"木",yuan:"天",desc:"正东"},
{shan:"乙",gua:"震",wuxing:"木",yuan:"人",desc:"正东偏南"},
{shan:"辰",gua:"巽",wuxing:"木",yuan:"天",desc:"东南偏东"},
{shan:"巽",gua:"巽",wuxing:"木",yuan:"人",desc:"东南"},
{shan:"巳",gua:"巽",wuxing:"木",yuan:"地",desc:"东南偏南"},
{shan:"丙",gua:"离",wuxing:"火",yuan:"地",desc:"正南偏东"},
{shan:"午",gua:"离",wuxing:"火",yuan:"天",desc:"正南"},
{shan:"丁",gua:"离",wuxing:"火",yuan:"人",desc:"正南偏西"},
{shan:"未",gua:"坤",wuxing:"土",yuan:"天",desc:"西南偏南"},
{shan:"坤",gua:"坤",wuxing:"土",yuan:"人",desc:"西南"},
{shan:"申",gua:"坤",wuxing:"土",yuan:"地",desc:"西南偏西"},
{shan:"庚",gua:"兑",wuxing:"金",yuan:"地",desc:"正西偏南"},
{shan:"酉",gua:"兑",wuxing:"金",yuan:"天",desc:"正西"},
{shan:"辛",gua:"兑",wuxing:"金",yuan:"人",desc:"正西偏北"},
{shan:"戌",gua:"乾",wuxing:"金",yuan:"天",desc:"西北偏西"},
{shan:"乾",gua:"乾",wuxing:"金",yuan:"人",desc:"西北"},
{shan:"亥",gua:"乾",wuxing:"金",yuan:"地",desc:"西北偏北"}
];

// --- 五行生克 ---
var WUXING_SHENG={"金":"水","水":"木","木":"火","火":"土","土":"金"};
var WUXING_KE={"金":"木","木":"土","土":"水","水":"火","火":"金"};

// --- 月建 ---
var YUEJIAN=["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];

// --- 四离四绝 ---
var SLJJ={"四离":["春分","夏至","秋分","冬至"],"四绝":["立春","立夏","立秋","立冬"],"desc":"季节交替大凶之日，逢吉不吉逢凶必凶"};

// --- 天德/月德/天赦查表 ---
var TIANDE_TABLE={"寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"亥","未":"甲","申":"癸","酉":"寅","戌":"丙","亥":"乙","子":"巳","丑":"庚"};
var YUEDE_TABLE={"寅":"丙","卯":"甲","辰":"壬","巳":"庚","午":"丙","未":"甲","申":"壬","酉":"庚","戌":"丙","亥":"甲","子":"壬","丑":"庚"};
var TIANSHA_DAYS=["戊寅","甲午","戊申","甲子"];

// --- 节气近似日期 ---
var JIEQI_DATES=[[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];
var MONTH_ZHI_BY_JIEQI=["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];

// --- 四离四绝节气近似 ---
var JIEQI_APPROX={"立春":[2,4],"春分":[3,20],"立夏":[5,5],"夏至":[6,21],"立秋":[8,7],"秋分":[9,22],"立冬":[11,7],"冬至":[12,21]};

// ===== 计算函数 =====
function solarToGanzhi(year,month,day){
var base=new Date(2024,0,1);
var target=new Date(year,month-1,day);
var daysDiff=Math.round((target-base)/86400000);
var dayIdx=((daysDiff%60)+60)%60;
var dayGan=TIANGAN[dayIdx%10];
var dayZhi=DIZHI[dayIdx%12];
var dayGz=dayGan+dayZhi;
var feb4=new Date(year,1,4);
var yearGan,yearZhi;
if(target<feb4){
yearGan=TIANGAN[((year-1-2024)%10+10)%10];
yearZhi=DIZHI[((year-1-2024)%12+12)%12];
}else{
yearGan=TIANGAN[((year-2024)%10+10)%10];
yearZhi=DIZHI[((year-2024)%12+12)%12];
}
return{yearGz:yearGan+yearZhi,monthGz:"估算",dayGz:dayGz,dayGan:dayGan,dayZhi:dayZhi,dayIdx:dayIdx};
}

// 干支解析: 优先 options.ganzhi, 否则内置 solarToGanzhi
function resolveGanzhi(year, month, day, options) {
    options = options || {};
    if (options.ganzhi && options.ganzhi.yearGz && options.ganzhi.dayGz) {
        var gz = options.ganzhi;
        var dayGz = gz.dayGz;
        return {
            yearGz: gz.yearGz,
            monthGz: gz.monthGz || '估算',
            dayGz: dayGz,
            dayGan: dayGz[0],
            dayZhi: dayGz[1],
            dayIdx: -1
        };
    }
    return solarToGanzhi(year, month, day);
}

function calcMonthZhi(year,month,day){
var targetMd=[month,day];
for(var i=0;i<12;i++){
var nextI=(i+1)%12;
var cur=JIEQI_DATES[i];
var nxt=JIEQI_DATES[nextI];
if(cur[0]>nxt[0]||(cur[0]==nxt[0]&&cur[1]>nxt[1])){
if(compareMd(targetMd,cur)>=0||compareMd(targetMd,nxt)<0){
return MONTH_ZHI_BY_JIEQI[i];
}
}else{
if(compareMd(targetMd,cur)>=0&&compareMd(targetMd,nxt)<0){
return MONTH_ZHI_BY_JIEQI[i];
}
}
}
if(compareMd(targetMd,[1,6])>=0&&compareMd(targetMd,[2,4])<0){return"丑";}
return"寅";
}

function compareMd(a,b){
if(a[0]!=b[0])return a[0]-b[0];
return a[1]-b[1];
}

function solarToLunarMd(year,month,day){
var lunarBase=new Date(1900,0,31);
var target=new Date(year,month-1,day);
var daysDiff=Math.round((target-lunarBase)/86400000);
if(daysDiff<0)return[1,1];
var lunarMonthAvg=29.53059;
var totalMonths=Math.floor(daysDiff/lunarMonthAvg);
var remainingDays=daysDiff-Math.floor(totalMonths*lunarMonthAvg);
var lunarMonth=(totalMonths%12)+1;
var lunarDay=remainingDays+1;
if(lunarDay>30){lunarMonth=(lunarMonth%12)+1;lunarDay-=30;}
if(lunarDay<1)lunarDay=1;
return[lunarMonth,lunarDay];
}

function calcLiuyaoLunar(year,month,day){
var md=solarToLunarMd(year,month,day);
var lunarMonth=md[0],lunarDay=md[1];
var remainder=(lunarMonth+lunarDay)%6;
var result=LIUYAO[remainder];
return{liuyao:result,jixiong:LIUYAO_ATTR[result].jixiong,desc:LIUYAO_ATTR[result].desc,lunarMonth:lunarMonth,lunarDay:lunarDay};
}

function calcXiuPrecise(year,month,day){
var xiuBase=new Date(2024,0,1);
var target=new Date(year,month-1,day);
var daysDiff=Math.round((target-xiuBase)/86400000);
var xiuIndex=((daysDiff%28)+28)%28;
var xiu=ERSHIBA_XIU[xiuIndex];
return{name:xiu.name,xiang:xiu.xiang,fangwei:xiu.fangwei,wuxing:xiu.wuxing,jixiong:xiu.jixiong,desc:xiu.desc,yi:xiu.yi,ji:xiu.ji,xuIndex:xiuIndex+1};
}

function calcJishen(monthZhi,dayGan,dayZhi){
var dayGz=dayGan+dayZhi;
var tiande=TIANDE_TABLE[monthZhi]||"无";
var yuede=YUEDE_TABLE[monthZhi]||"无";
var isTiansha=false;
for(var i=0;i<TIANSHA_DAYS.length;i++){if(TIANSHA_DAYS[i]==dayGz){isTiansha=true;break;}}
var tianyi=TIANYI_GUIREN[dayGan]||"无";
var jiCount=0;
if(tiande==dayGan)jiCount++;
if(yuede==dayGan)jiCount++;
if(isTiansha)jiCount++;
if(tianyi!="无")jiCount++;
return{tiande:tiande,tiandeLin:tiande==dayGan?"是":"否",yuede:yuede,yuedeLin:yuede==dayGan?"是":"否",tiansha:isTiansha?"是":"否",tianyi:tianyi,jiCount:jiCount};
}

function checkSiliSijue(year,month,day){
var target=new Date(year,month-1,day);
var results=[];
for(var name in JIEQI_APPROX){
var jq=JIEQI_APPROX[name];
var jieqiDate=new Date(year,jq[0]-1,jq[1]);
var prevDay=new Date(jieqiDate.getTime()-86400000);
if(target.getTime()==prevDay.getTime()){
if(name=="春分"||name=="夏至"||name=="秋分"||name=="冬至"){
results.push("四离日（"+name+"前一日）");
}else if(name=="立春"||name=="立夏"||name=="立秋"||name=="立冬"){
results.push("四绝日（"+name+"前一日）");
}
}
}
return{isHit:results.length>0?"是":"否",detail:results.length>0?results.join("; "):"无"};
}

function calcComprehensiveYiji(jianchu,huangHei,xiuJixiong,liuyaoJixiong,isSuiPo,isYuePo,siliSijue,jishenCount){
var level1Xiong=[];
var level2Xiong=[];
var level3Ji=[];
if(isSuiPo)level1Xiong.push("岁破日");
if(isYuePo)level1Xiong.push("月破日");
if(siliSijue)level1Xiong.push("四离四绝日");
if(jianchu=="破"||jianchu=="闭")level1Xiong.push(jianchu+"日(大凶)");
var heidaoNames=["白虎","天刑","朱雀","天牢","玄武","勾陈"];
for(var i=0;i<heidaoNames.length;i++){if(huangHei==heidaoNames[i]){level2Xiong.push(huangHei+"(黑道)");break;}}
if(xiuJixiong=="凶")level2Xiong.push("凶宿值日");
if(liuyaoJixiong=="大凶"||liuyaoJixiong=="凶")level2Xiong.push(liuyaoJixiong+"六曜");
var huangdaoNames=["青龙","明堂","金匮","天德","玉堂","司命"];
for(var i=0;i<huangdaoNames.length;i++){if(huangHei==huangdaoNames[i]){level3Ji.push(huangHei+"(黄道)");break;}}
if(xiuJixiong=="吉")level3Ji.push("吉宿值日");
if(liuyaoJixiong=="大吉"||liuyaoJixiong=="吉")level3Ji.push(liuyaoJixiong+"六曜");
if(jianchu=="成"||jianchu=="开")level3Ji.push(jianchu+"日(大吉)");
if(jianchu=="除"||jianchu=="危"||jianchu=="定"||jianchu=="执")level3Ji.push(jianchu+"日(黄道)");
if(jishenCount>0)level3Ji.push("吉神"+jishenCount+"位临日");
var verdict,verdictDesc;
if(level1Xiong.length>0){verdict="大凶";verdictDesc="诸事不宜";}
else if(level2Xiong.length>=2){verdict="凶";verdictDesc="凶煞叠加，重大事项不宜";}
else if(level2Xiong.length>0){
if(level3Ji.length>=2){verdict="平";verdictDesc="凶吉参半，吉神可解，常规可行";}
else{verdict="小凶";verdictDesc="有凶煞无吉解，谨慎行事";}
}
else if(level3Ji.length>=3){verdict="大吉";verdictDesc="吉神汇聚，宜办大事";}
else if(level3Ji.length>0){verdict="吉";verdictDesc="吉神临日，诸事可行";}
else{verdict="平";verdictDesc="平淡无奇，常规可行";}
return{verdict:verdict,verdictDesc:verdictDesc,level1Xiong:level1Xiong,level2Xiong:level2Xiong,level3Ji:level3Ji};
}

function getJianchu(dayZhi,monthZhi){
var jianPos=DIZHI.indexOf(monthZhi);
var dayPos=DIZHI.indexOf(dayZhi);
if(jianPos<0)jianPos=0;
if(dayPos<0)dayPos=0;
var offset=((dayPos-jianPos)%12+12)%12;
return JIANCHU[offset];
}

function getHuangHeiDao(dayZhi){
var zhiIdx=DIZHI.indexOf(dayZhi);
if(zhiIdx<0)zhiIdx=0;
return HUANG_HEI_ORDER[zhiIdx%12];
}

function getNayin(dayGan,dayZhi){
var key=dayGan+dayZhi;
for(var k in NAYIN){if(k.indexOf(key)>=0)return NAYIN[k];}
return"未知";
}

function getRichong(dayZhi){return LIUCHONG[dayZhi]||"未知";}
function getRiha(dayZhi){return LIUHAI[dayZhi]||"未知";}
function getSuiPo(yearZhi,dayZhi){var yearChong=LIUCHONG[yearZhi]||"";return dayZhi==yearChong;}
function getYuePo(monthZhi,dayZhi){var monthChong=LIUCHONG[monthZhi]||"";return dayZhi==monthChong;}
function getSanShaFangwei(yearZhi){for(var k in SANSHA){if(k.indexOf(yearZhi)>=0)return SANSHA[k];}return"未知";}

// ===== 标签生成函数 =====
function generateLabels(year, month, day, hour, minute, options) {
    options = options || {};

    var gz = resolveGanzhi(year, month, day, options);
    var yearGz = gz.yearGz, dayGz = gz.dayGz, dayGan = gz.dayGan, dayZhi = gz.dayZhi;
    var yearZhi = yearGz.charAt(yearGz.length - 1);
    var monthZhi = calcMonthZhi(year, month, day);
    var monthGanZhi = monthZhi;

    var jianchu = getJianchu(dayZhi, monthZhi);
    var huangHei = getHuangHeiDao(dayZhi);
    var nayin = getNayin(dayGan, dayZhi);
    var richong = getRichong(dayZhi);
    var riha = getRiha(dayZhi);
    var isSuiPo = getSuiPo(yearZhi, dayZhi);
    var isYuePo = getYuePo(monthZhi, dayZhi);
    var sanSha = getSanShaFangwei(yearZhi);
    var xishen = XISHEN_FANGWEI[dayGan] || "未知";
    var caishen = CAISHEN_FANGWEI[dayGan] || "未知";
    var tianyi = TIANYI_GUIREN[dayGan] || "未知";

    // 优化计算
    var liuyaoResult = calcLiuyaoLunar(year, month, day);
    var xiuResult = calcXiuPrecise(year, month, day);
    var jishenResult = calcJishen(monthZhi, dayGan, dayZhi);
    var siliResult = checkSiliSijue(year, month, day);
    var comprehensive = calcComprehensiveYiji(jianchu, huangHei, xiuResult.jixiong, liuyaoResult.jixiong, isSuiPo, isYuePo, siliResult.isHit == "是", jishenResult.jiCount);

    var jianchuAttr = JIANCHU_ATTR[jianchu] || {};
    var huangHeiAttr = HUANG_HEI_DAO[huangHei] || {};

    // L0 核心展示
    var L0 = {
        '建除值日': jianchu + '(' + (jianchuAttr.jixiong || '') + ')',
        '黄黑道': huangHei + '(' + (huangHeiAttr.dao || '') + ')',
        '二十八宿': xiuResult.name + '宿(' + xiuResult.xiang + ' · 第' + xiuResult.xuIndex + '宿)',
        '六曜': liuyaoResult.liuyao + '(' + liuyaoResult.jixiong + ')',
        '纳音五行': nayin + '(' + dayGz + ')',
        '日干支': dayGz,
        '年干支': yearGz,
        '月支': monthZhi,
        '日冲': '冲' + richong,
        '岁破': isSuiPo ? '岁破日' : '否',
        '月破': isYuePo ? '月破日' : '否',
        '喜神方位': xishen,
        '财神方位': caishen
    };

    // 综合宜忌判定
    var L_verdict = {
        '综合判定': comprehensive.verdict,
        '综合描述': comprehensive.verdictDesc,
        '大凶因素': comprehensive.level1Xiong.length > 0 ? comprehensive.level1Xiong.join('；') : '无',
        '中凶因素': comprehensive.level2Xiong.length > 0 ? comprehensive.level2Xiong.join('；') : '无',
        '吉神加分': comprehensive.level3Ji.length > 0 ? comprehensive.level3Ji.join('；') : '无'
    };

    // 优化卡片
    var L_opt = {
        '优化1_六曜农历': '农历' + liuyaoResult.lunarMonth + '月' + liuyaoResult.lunarDay + '日 → (' + liuyaoResult.lunarMonth + '+' + liuyaoResult.lunarDay + ')%6=' + ((liuyaoResult.lunarMonth + liuyaoResult.lunarDay) % 6) + ' | ' + liuyaoResult.liuyao + '(' + liuyaoResult.jixiong + ')',
        '优化2_二十八宿': '基准日2024-01-01=角宿，值宿:' + xiuResult.name + '宿(' + xiuResult.xiang + ')第' + xiuResult.xuIndex + '宿 · ' + xiuResult.wuxing + ' · ' + xiuResult.jixiong,
        '优化3_天德月德': '天德:' + jishenResult.tiande + (jishenResult.tiandeLin == '是' ? '(临日)' : '(未临)') + ' | 月德:' + jishenResult.yuede + (jishenResult.yuedeLin == '是' ? '(临日)' : '(未临)') + ' | 天赦:' + (jishenResult.tiansha == '是' ? '是' : '否'),
        '优化4_四离四绝': siliResult.isHit == '是' ? '命中！' + siliResult.detail : '否 — ' + siliResult.detail,
        '优化5_综合宜忌': comprehensive.verdict + ' — ' + comprehensive.verdictDesc
    };

    // L1 基础排盘
    var L1 = {
        '年干支': yearGz,
        '月支': monthZhi,
        '日干支': dayGz,
        '日干': dayGan,
        '日支': dayZhi,
        '年支': yearZhi,
        '建除值日': jianchu,
        '二十八宿': xiuResult.name + '宿(' + xiuResult.xiang + ')',
        '黄黑道': huangHei,
        '纳音五行': nayin,
        '六曜': liuyaoResult.liuyao,
        '日冲': '冲' + richong,
        '日害': '害' + riha,
        '喜神方位': xishen,
        '财神方位': caishen
    };

    // L2 建除十二神
    var L2 = {};
    for (var i = 0; i < JIANCHU.length; i++) {
        var name = JIANCHU[i];
        var attr = JIANCHU_ATTR[name];
        var isActive = name == jianchu;
        L2[name + (isActive ? '_今日' : '')] = attr.jixiong + ' | ' + attr.desc + ' | 宜:' + attr.yi + ' | 忌:' + attr.ji;
    }

    // L3 二十八宿
    var L3 = {};
    for (var i = 0; i < ERSHIBA_XIU.length; i++) {
        var xiu = ERSHIBA_XIU[i];
        var isActive = xiu.name == xiuResult.name;
        L3[(i + 1) + '.' + xiu.name + (isActive ? '_今日' : '')] = xiu.xiang + ' | ' + xiu.fangwei + ' | ' + xiu.wuxing + ' | ' + xiu.jixiong + ' | ' + xiu.desc + ' | 宜:' + xiu.yi + ' | 忌:' + xiu.ji;
    }

    // L4 黄黑道十二神
    var L4 = {};
    for (var i = 0; i < HUANG_HEI_ORDER.length; i++) {
        var name = HUANG_HEI_ORDER[i];
        var attr = HUANG_HEI_DAO[name];
        var isActive = name == huangHei;
        L4[name + (isActive ? '_今日' : '')] = attr.dao + ' | ' + attr.jixiong + ' | ' + attr.desc;
    }

    // L5 六十甲子纳音五行
    var L5 = {};
    for (var k in NAYIN) {
        var v = NAYIN[k];
        var isActive = v == nayin;
        L5[k + (isActive ? '_今日' : '')] = v + ' | 五行:' + v.charAt(v.length - 1);
    }

    // L6 六曜系统
    var L6 = {};
    for (var i = 0; i < LIUYAO.length; i++) {
        var name = LIUYAO[i];
        var attr = LIUYAO_ATTR[name];
        var isActive = name == liuyaoResult.liuyao;
        L6[name + (isActive ? '_今日' : '')] = attr.jixiong + ' | ' + attr.desc + ' | 宜:' + (attr.yi || '—') + (attr.ji ? ' | 忌:' + attr.ji : '');
    }

    // L7 二十四山
    var L7 = {};
    for (var i = 0; i < ERSHISI_SHAN.length; i++) {
        var shan = ERSHISI_SHAN[i];
        var isActive = shan.shan == dayZhi || shan.shan == dayGan;
        L7[shan.shan + (isActive ? '_今日' : '')] = shan.gua + ' | ' + shan.wuxing + ' | ' + shan.yuan + ' | ' + shan.desc;
    }

    // L8 吉神系统
    var L8 = {
        '天乙贵人': tianyi,
        '喜神方位': xishen,
        '财神方位': caishen,
        '天德': jishenResult.tiande + (jishenResult.tiandeLin == '是' ? '(临日)' : '(未临)'),
        '月德': jishenResult.yuede + (jishenResult.yuedeLin == '是' ? '(临日)' : '(未临)'),
        '岁德': '岁德星，年吉神',
        '天赦': jishenResult.tiansha == '是' ? '今日天赦' : '非天赦日',
        '福星': '福星贵人',
        '天官': '天官贵人，赐福之神',
        '青龙': huangHei == '青龙' ? '今日值神' : '—',
        '明堂': huangHei == '明堂' ? '今日值神' : '—',
        '金匮': huangHei == '金匮' ? '今日值神' : '—'
    };

    // L9 凶煞系统
    var L9 = {
        '太岁': yearZhi + (isSuiPo ? '(今日冲太岁)' : '(未冲)'),
        '岁破': isSuiPo ? '今日岁破' : '否',
        '月破': isYuePo ? '今日月破' : '否',
        '三煞': sanSha,
        '日冲': '冲' + richong,
        '日害': '害' + riha,
        '四离四绝': siliResult.isHit == '是' ? siliResult.detail : '否'
    };
    var heidaoList = ["白虎", "天刑", "朱雀", "天牢", "玄武", "勾陈"];
    for (var i = 0; i < heidaoList.length; i++) {
        var name = heidaoList[i];
        L9[name] = huangHei == name ? '今日值神' : '—';
    }

    // L10 地支关系
    var L10 = {};
    for (var i = 0; i < DIZHI.length; i++) {
        var dz = DIZHI[i];
        var isActive = dz == dayZhi;
        L10[dz + (isActive ? '_今日' : '')] = '六冲:' + (LIUCHONG[dz] || '') + ' | 六合:' + (LIUHE[dz] || '') + ' | 六害:' + (LIUHAI[dz] || '');
    }

    // L11 三合三煞
    var L11 = {};
    for (var k in SANHE) {
        var isActive = k.indexOf(yearZhi) >= 0;
        L11['三合_' + k + (isActive ? '_本命' : '')] = SANHE[k];
    }
    for (var k in SANSHA) {
        var isActive = k.indexOf(yearZhi) >= 0;
        L11['三煞_' + k + (isActive ? '_本命' : '')] = SANSHA[k];
    }

    // L12 择日宜忌
    var L12 = {
        '建除宜': jianchuAttr.yi || '',
        '建除忌': jianchuAttr.ji || '',
        '建除吉凶': jianchuAttr.jixiong || '',
        '星宿宜': xiuResult.yi,
        '星宿忌': xiuResult.ji,
        '星宿吉凶': xiuResult.jixiong,
        '黄黑道吉凶': huangHeiAttr.jixiong || '',
        '岁破': isSuiPo ? '是' : '否',
        '月破': isYuePo ? '是' : '否',
        '综合吉凶': comprehensive.verdict
    };

    // L13 五行分析
    var dayGanWx = ['木', '火', '土', '金', '水'][TIANGAN.indexOf(dayGan) % 5];
    var dayZhiWx = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'][DIZHI.indexOf(dayZhi)];
    var nayinWx = nayin.charAt(nayin.length - 1);
    var L13 = {
        '日干五行': dayGanWx,
        '日支五行': dayZhiWx,
        '纳音五行': nayin,
        '纳音属性': nayinWx,
        '纳音生': WUXING_SHENG[nayinWx] || '?',
        '纳音克': WUXING_KE[nayinWx] || '?',
        '年支五行': ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'][DIZHI.indexOf(yearZhi)],
        '月支五行': ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'][DIZHI.indexOf(monthZhi)],
        '日支冲': richong,
        '日支合': LIUHE[dayZhi] || ''
    };

    // L14 时辰择吉
    var L14 = {};
    var hourZhiList = ['子', '子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥'];
    var currentHourZhi = hourZhiList[hour];
    for (var i = 0; i < DIZHI.length; i++) {
        var dz = DIZHI[i];
        var shenName = HUANG_HEI_ORDER[(DIZHI.indexOf(dayZhi) + i) % 12];
        var shenAttr = HUANG_HEI_DAO[shenName] || {};
        var isActive = dz == currentHourZhi;
        L14[dz + '时' + (isActive ? '_当前' : '')] = shenName + ' | ' + (shenAttr.dao || '') + ' | ' + (shenAttr.jixiong || '');
    }

    // L15 民俗择日
    var comprehensiveAdvice = (isSuiPo || isYuePo || jianchu == '破' || jianchu == '闭') ? '诸事不宜' : '宜' + (jianchuAttr.yi || '');
    var L15 = {
        '建除口诀': '建满平收黑，除危定执黄；成开皆可用，闭破不相当',
        '今日建除': jianchu + '日(' + (jianchuAttr.jixiong || '') + ')',
        '今日星宿': xiuResult.name + '宿(' + xiuResult.jixiong + ')',
        '今日黄黑道': huangHei + '(' + (huangHeiAttr.jixiong || '') + ')',
        '今日纳音': nayin,
        '今日六曜': liuyaoResult.liuyao + '(' + liuyaoResult.jixiong + ')',
        '岁破日': isSuiPo ? '是' : '否',
        '月破日': isYuePo ? '是' : '否',
        '日冲生肖': '冲' + richong,
        '综合建议': comprehensiveAdvice
    };

    // L16 星宿分类宜忌
    var categories = {
        "木宿(角井奎斗)": {"宜": "开业嫁娶栽种", "忌": "拆屋伐木"},
        "金宿(亢鬼娄牛)": {"宜": "讨债签约五金", "忌": "破土放贷"},
        "土宿(氐柳胃女)": {"宜": "建房安葬囤货", "忌": "迁居拆改"},
        "日宿(房星昴虚)": {"宜": "祈福出行开市", "忌": "官非久病"},
        "月宿(心张毕危)": {"宜": "经商求医水产", "忌": "破土造坟"},
        "火宿(尾翼觜室)": {"宜": "拆旧冶炼驱邪", "忌": "入宅蓄水"},
        "水宿(箕轸参壁)": {"宜": "开渠水路远行", "忌": "生火筑台"}
    };
    var L16 = {};
    for (var k in categories) {
        var isActive = k.indexOf(xiuResult.name) >= 0;
        L16[k + (isActive ? '_今日' : '')] = '宜:' + categories[k]["宜"] + ' | 忌:' + categories[k]["忌"];
    }

    // L17 盘面总评
    var jiCount = 0, xiongCount = 0;
    if (jianchuAttr.jixiong == "黄道" || jianchuAttr.jixiong == "大吉") jiCount++;
    else if (jianchuAttr.jixiong == "黑道" || jianchuAttr.jixiong == "大凶") xiongCount++;
    if (xiuResult.jixiong == "吉") jiCount++;
    else if (xiuResult.jixiong == "凶") xiongCount++;
    if (huangHeiAttr.jixiong == "吉") jiCount++;
    else if (huangHeiAttr.jixiong == "凶") xiongCount++;
    if (liuyaoResult.jixiong == "大吉" || liuyaoResult.jixiong == "吉") jiCount++;
    else if (liuyaoResult.jixiong == "大凶" || liuyaoResult.jixiong == "凶") xiongCount++;
    if (isSuiPo) xiongCount += 2;
    if (isYuePo) xiongCount++;
    var overallJx = jiCount > xiongCount ? '吉' : (xiongCount > jiCount ? '凶' : '平');
    var L17 = {
        '整体吉凶': overallJx,
        '建除总评': jianchu + '日-' + (jianchuAttr.jixiong || ''),
        '星宿总评': xiuResult.name + '宿-' + xiuResult.jixiong,
        '黄黑道总评': huangHei + '-' + (huangHeiAttr.jixiong || ''),
        '六曜总评': liuyaoResult.liuyao + '-' + liuyaoResult.jixiong,
        '纳音': nayin,
        '日冲': '冲' + richong,
        '吉数': String(jiCount),
        '凶数': String(xiongCount),
        '综合建议': xiongCount >= 3 ? '诸事不宜' : (jiCount >= 4 ? '大吉日' : '平日常规')
    };

    var layers = {
        'L0_核心展示': L0,
        'L_verdict_综合宜忌': L_verdict,
        'L_opt_优化卡片': L_opt,
        'L1_基础排盘': L1,
        'L2_建除十二神': L2,
        'L3_二十八宿': L3,
        'L4_黄黑道神': L4,
        'L5_纳音五行': L5,
        'L6_六曜系统': L6,
        'L7_二十四山': L7,
        'L8_吉神系统': L8,
        'L9_凶煞系统': L9,
        'L10_地支关系': L10,
        'L11_三合三煞': L11,
        'L12_择日宜忌': L12,
        'L13_五行分析': L13,
        'L14_时辰择吉': L14,
        'L15_民俗择日': L15,
        'L16_星宿分类': L16,
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
            system_name: 'tongsheng',
            system_name_cn: '通胜择日',
            total_dimensions: totalDims,
            timestamp: year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':' + String(minute || 0).padStart(2, '0'),
            dayGz: dayGz,
            jianchu: jianchu,
            huangHei: huangHei,
            verdict: comprehensive.verdict
        }
    };
}

// ===== 标准接口 =====
window.Systems.tongsheng = function(year, month, day, hour, minute, options) {
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
    var l0 = layers['L0_核心展示'] || {};
    var l_verdict = layers['L_verdict_综合宜忌'] || {};
    var summary = '';
    if (l0['建除值日']) summary += l0['建除值日'];
    if (l0['黄黑道']) summary += ' | ' + l0['黄黑道'];
    if (l0['二十八宿']) summary += ' | ' + l0['二十八宿'];
    if (l_verdict['综合判定']) summary += ' | ' + l_verdict['综合判定'];

    return {
        dimensions: dimensions,
        name: '通胜择日',
        meta: result.meta
    };
};

})();
