/**
 * 八字四柱 标签生成模块
 * 从 bazi.html 提取的纯计算逻辑
 *
 * 系统⑥ · 260维 · v1.1-optimized · 理论先行三步法
 * 17层标签: L1四柱基础 / L2天干属性 / L3地支属性 / L4藏干 / L5十神系统 /
 *           L6纳音 / L7十二长生 / L8神煞 / L9格局 / L10宫位 / L11五行平衡 /
 *           L12刑冲合害 / L13大运流年 / L14旬空 / L15特殊组合 / L16命局层次 / L17六亲
 * 5项理论驱动优化: #1节气边界检测 #2大运起运计算 #3身强弱加权评分 #4用神取法 #5格局破格检查
 * 干支来源优先级: options.ganzhi > lunar-javascript > 内置solarToBazi
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

// ===== 基础数据表 =====
var TIANGAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var DIZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var GAN_WX={'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
var GAN_YY={'甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴'};
var ZHI_WX={'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
var ZHI_SX={'子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇','午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪'};
var WX_SHENG={'木':'火','火':'土','土':'金','金':'水','水':'木'};
var WX_KE={'木':'土','火':'金','土':'水','金':'木','水':'火'};
var ZHI_CANG={'子':[['癸','本气']],'丑':[['己','本气'],['癸','中气'],['辛','余气']],'寅':[['甲','本气'],['丙','中气'],['戊','余气']],'卯':[['乙','本气']],'辰':[['戊','本气'],['乙','中气'],['癸','余气']],'巳':[['丙','本气'],['庚','中气'],['戊','余气']],'午':[['丁','本气'],['己','中气']],'未':[['己','本气'],['丁','中气'],['乙','余气']],'申':[['庚','本气'],['壬','中气'],['戊','余气']],'酉':[['辛','本气']],'戌':[['戊','本气'],['辛','中气'],['丁','余气']],'亥':[['壬','本气'],['甲','中气']]};
var NAYIN={'甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火','戊辰':'大林木','己巳':'大林木','庚午':'路旁土','辛未':'路旁土','壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火','丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土','庚辰':'白蜡金','辛巳':'白蜡金','壬午':'杨柳木','癸未':'杨柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土','戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'长流水','癸巳':'长流水','甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木','庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆灯火','乙巳':'覆灯火','丙午':'天河水','丁未':'天河水','戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金','壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土','戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'};
var LIUJIAZI=[];for(var i=0;i<60;i++){LIUJIAZI.push(TIANGAN[i%10]+DIZHI[i%12])}
var WANG_SHUAI={'春':{'木':'旺','火':'相','水':'休','金':'囚','土':'死'},'夏':{'火':'旺','土':'相','木':'休','水':'囚','金':'死'},'长夏':{'土':'旺','金':'相','火':'休','木':'囚','水':'死'},'秋':{'金':'旺','水':'相','土':'休','火':'囚','木':'死'},'冬':{'水':'旺','木':'相','金':'休','土':'囚','火':'死'}};
var MONTH_TO_SEASON={'寅':'春','卯':'春','辰':'春','巳':'夏','午':'夏','未':'夏','申':'秋','酉':'秋','戌':'秋','亥':'冬','子':'冬','丑':'冬'};
var JIEQI=[[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];
var JIEQI_ZHI=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
var JIEQI_NAMES=['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
var WUHU_DUN={'甲':2,'己':2,'乙':4,'庚':4,'丙':6,'辛':6,'丁':8,'壬':8,'戊':0,'癸':0};
var WUSHU_DUN={'甲':0,'己':0,'乙':2,'庚':2,'丙':4,'辛':4,'丁':6,'壬':6,'戊':8,'癸':8};
var KONG_WANG={'甲子':['戌','亥'],'甲戌':['申','酉'],'甲申':['午','未'],'甲午':['辰','巳'],'甲辰':['寅','卯'],'甲寅':['子','丑']};
var GAN_HE={'甲己':'化土','乙庚':'化金','丙辛':'化水','丁壬':'化木','戊癸':'化火'};
var ZHI_LIUHE={'子丑':'化土','寅亥':'化木','卯戌':'化火','辰酉':'化金','巳申':'化水','午未':'化土'};
var ZHI_SANHE={'申子辰':'水局','寅午戌':'火局','巳酉丑':'金局','亥卯未':'木局'};
var ZHI_CHONG=[['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
var ZHI_SANHUI={'寅卯辰':'木方','巳午未':'火方','申酉戌':'金方','亥子丑':'水方'};
var CHANGSHENG={'甲':{'亥':'长生','子':'沐浴','丑':'冠带','寅':'临官','卯':'帝旺','辰':'衰','巳':'病','午':'死','未':'墓','申':'绝','酉':'胎','戌':'养'},'乙':{'午':'长生','巳':'沐浴','辰':'冠带','卯':'临官','寅':'帝旺','丑':'衰','子':'病','亥':'死','戌':'墓','酉':'绝','申':'胎','未':'养'},'丙':{'寅':'长生','卯':'沐浴','辰':'冠带','巳':'临官','午':'帝旺','未':'衰','申':'病','酉':'死','戌':'墓','亥':'绝','子':'胎','丑':'养'},'丁':{'酉':'长生','申':'沐浴','未':'冠带','午':'临官','巳':'帝旺','辰':'衰','卯':'病','寅':'死','丑':'墓','子':'绝','亥':'胎','戌':'养'},'戊':{'寅':'长生','卯':'沐浴','辰':'冠带','巳':'临官','午':'帝旺','未':'衰','申':'病','酉':'死','戌':'墓','亥':'绝','子':'胎','丑':'养'},'己':{'酉':'长生','申':'沐浴','未':'冠带','午':'临官','巳':'帝旺','辰':'衰','卯':'病','寅':'死','丑':'墓','子':'绝','亥':'胎','戌':'养'},'庚':{'巳':'长生','午':'沐浴','未':'冠带','申':'临官','酉':'帝旺','戌':'衰','亥':'病','子':'死','丑':'墓','寅':'绝','卯':'胎','辰':'养'},'辛':{'子':'长生','亥':'沐浴','戌':'冠带','酉':'临官','申':'帝旺','未':'衰','午':'病','巳':'死','辰':'墓','卯':'绝','寅':'胎','丑':'养'},'壬':{'申':'长生','酉':'沐浴','戌':'冠带','亥':'临官','子':'帝旺','丑':'衰','寅':'病','卯':'死','辰':'墓','巳':'绝','午':'胎','未':'养'},'癸':{'卯':'长生','寅':'沐浴','丑':'冠带','子':'临官','亥':'帝旺','戌':'衰','酉':'病','申':'死','未':'墓','午':'绝','巳':'胎','辰':'养'}};
var SANHE_GROUP={'申':'申子辰','子':'申子辰','辰':'申子辰','寅':'寅午戌','午':'寅午戌','戌':'寅午戌','巳':'巳酉丑','酉':'巳酉丑','丑':'巳酉丑','亥':'亥卯未','卯':'亥卯未','未':'亥卯未'};
var SHENSHA_GAN_TY={'甲':['丑','未'],'戊':['丑','未'],'庚':['丑','未'],'乙':['子','申'],'己':['子','申'],'丙':['亥','酉'],'丁':['亥','酉'],'壬':['卯','巳'],'癸':['卯','巳'],'辛':['午','寅']};
var SHENSHA_GAN_WC={'甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯'};
var SHENSHA_GAN_LU={'甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
var SHENSHA_GAN_YR={'甲':'卯','乙':'辰','丙':'午','丁':'未','戊':'午','己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑'};
var SHENSHA_SANHE={'驿马':{'申子辰':'寅','寅午戌':'申','巳酉丑':'亥','亥卯未':'巳'},'桃花':{'申子辰':'酉','寅午戌':'卯','巳酉丑':'午','亥卯未':'子'},'华盖':{'申子辰':'辰','寅午戌':'戌','巳酉丑':'丑','亥卯未':'未'},'将星':{'申子辰':'子','寅午戌':'午','巳酉丑':'酉','亥卯未':'卯'},'劫煞':{'申子辰':'巳','寅午戌':'亥','巳酉丑':'寅','亥卯未':'申'},'亡神':{'申子辰':'亥','寅午戌':'巳','巳酉丑':'申','亥卯未':'寅'},'灾煞':{'申子辰':'午','寅午戌':'子','巳酉丑':'卯','亥卯未':'酉'}};
var SHENSHA_DAY={'魁罡':['壬辰','庚戌','庚辰','戊戌'],'孤鸾煞':['乙巳','丁巳','辛亥','戊申','甲寅','壬子','丙午'],'阴阳差错':['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥'],'十恶大败':['甲辰','乙巳','壬申','丙申','丁亥','庚辰','戊戌','癸亥','辛巳','己丑'],'十灵日':['甲辰','乙亥','丙辰','丁酉','戊午','庚寅','辛亥','壬寅','癸未','庚戌']};
var JINSHEN=['甲子','甲午','己卯','己酉'];
var TIESHEN_DAY={'戊寅':'是','甲午':'是','戊申':'是','甲子':'是'};
var SHENSHA_ZHI_HL={'子':'卯','丑':'寅','寅':'丑','卯':'子','辰':'亥','巳':'戌','午':'酉','未':'申','申':'未','酉':'午','戌':'巳','亥':'辰'};
var SHENSHA_ZHI_TX={'子':'酉','丑':'申','寅':'未','卯':'午','辰':'巳','巳':'辰','午':'卯','未':'寅','申':'丑','酉':'子','戌':'亥','亥':'戌'};

// ===== 辅助函数 =====
function getShishen(dg,og){
var dw=GAN_WX[dg],ow=GAN_WX[og],same=GAN_YY[dg]==GAN_YY[og];
if(dw==ow)return same?'比肩':'劫财';
if(WX_SHENG[dw]==ow)return same?'食神':'伤官';
if(WX_KE[dw]==ow)return same?'偏财':'正财';
if(WX_KE[ow]==dg)return same?'七杀':'正官';
if(WX_SHENG[ow]==dw)return same?'偏印':'正印';
return '未知';
}
function getXun(jiazi){var idx=LIUJIAZI.indexOf(jiazi);return LIUJIAZI[Math.floor(idx/10)*10]}

function solarToBazi(year,month,day,hour){
var d=new Date(year,month-1,day);
var feb4=new Date(year,1,4);
var yg,yz;
if(d<feb4){yg=TIANGAN[((year-1-2024)%10+10)%10];yz=DIZHI[((year-1-2024)%12+12)%12]}else{yg=TIANGAN[((year-2024)%10+10)%10];yz=DIZHI[((year-2024)%12+12)%12]}
var mz=null;
for(var i=0;i<12;i++){if(month==JIEQI[i][0]){mz=day>=JIEQI[i][1]?JIEQI_ZHI[i]:JIEQI_ZHI[(i-1+12)%12];break}}
if(!mz)mz=month==1?'丑':'子';
var mgStart=WUHU_DUN[yg];var zhiOff=(DIZHI.indexOf(mz)-2+12)%12;
var mg=TIANGAN[(mgStart+zhiOff)%10];
var baseDate=new Date(2000,0,7);
var daysDiff=Math.round((d-baseDate)/(86400000));
var dayIdx=((daysDiff%60)+60)%60;
var dg=TIANGAN[dayIdx%10];var dz=DIZHI[dayIdx%12];
var hourZhi=['子','子','丑','丑','寅','寅','卯','卯','辰','辰','巳','巳','午','午','未','未','申','申','酉','酉','戌','戌','亥','亥'][hour];
var hgStart=WUSHU_DUN[dg];var hg=TIANGAN[(hgStart+DIZHI.indexOf(hourZhi))%10];
return{year:[yg,yz],month:[mg,mz],day:[dg,dz],hour:[hg,hourZhi]};
}

// 干支柱解析: 优先 options.ganzhi, 其次 lunar-javascript, 最后 solarToBazi
function resolvePillars(year, month, day, hour, minute, options) {
    options = options || {};
    // 1. 尝试 options.ganzhi
    if (options.ganzhi && options.ganzhi.yearGz && options.ganzhi.monthGz && options.ganzhi.dayGz && options.ganzhi.hourGz) {
        var gz = options.ganzhi;
        return {
            year: [gz.yearGz[0], gz.yearGz[1]],
            month: [gz.monthGz[0], gz.monthGz[1]],
            day: [gz.dayGz[0], gz.dayGz[1]],
            hour: [gz.hourGz[0], gz.hourGz[1]]
        };
    }
    // 2. 尝试 lunar-javascript
    if (typeof Solar !== 'undefined') {
        try {
            var solar = Solar.fromYmdHms(year, month, day, hour, minute || 0, 0);
            var lunar = solar.getLunar();
            var yg2 = lunar.getYearInGanZhi();
            var mg2 = lunar.getMonthInGanZhi();
            var dg2 = lunar.getDayInGanZhi();
            var hg2 = lunar.getTimeInGanZhi();
            return {
                year: [yg2[0], yg2[1]],
                month: [mg2[0], mg2[1]],
                day: [dg2[0], dg2[1]],
                hour: [hg2[0], hg2[1]]
            };
        } catch(e) { /* fallback */ }
    }
    // 3. 内置 solarToBazi
    return solarToBazi(year, month, day, hour);
}

function checkJieqiBoundary(month,day){
var w=[];
for(var i=0;i<12;i++){if(JIEQI[i][0]==month&&Math.abs(day-JIEQI[i][1])<=3){w.push('近'+JIEQI_NAMES[i]+'('+JIEQI[i][0]+'月'+JIEQI[i][1]+'日±3天)，月柱可能有误，建议核实精确节气时刻')}}
return w;
}

function calcDayun(pillars,gender,year,month,day){
var yg=pillars.year[0];var isYang=GAN_YY[yg]=='阳';var isMale=gender=='male';
var forward=(isYang&&isMale)||(!isYang&&!isMale);
var birthDate=new Date(year,month-1,day);
var jieqiDates=[];
for(var i=0;i<12;i++){var jy=year;if(JIEQI[i][0]==1&&month>6)jy=year+1;else if(JIEQI[i][0]==12&&month<6)jy=year-1;jieqiDates.push({date:new Date(jy,JIEQI[i][0]-1,JIEQI[i][1]),zhi:JIEQI_ZHI[i]})}
jieqiDates.sort(function(a,b){return a.date-b.date});
var target=null;
if(forward){for(var j=0;j<jieqiDates.length;j++){if(jieqiDates[j].date>birthDate){target=jieqiDates[j].date;break}}}
else{for(var j=jieqiDates.length-1;j>=0;j--){if(jieqiDates[j].date<birthDate){target=jieqiDates[j].date;break}}}
if(!target)target=birthDate;
var daysDiff=Math.abs(Math.round((target-birthDate)/86400000));
var startAge=daysDiff/3.0;
var mg=pillars.month[0],mz=pillars.month[1];var monthJiazi=mg+mz;var monthIdx=LIUJIAZI.indexOf(monthJiazi);
var dyList=[];
for(var i=1;i<=8;i++){var idx=forward?(monthIdx+i)%60:((monthIdx-i)%60+60)%60;var dzJiazi=LIUJIAZI[idx];var sa=startAge+(i-1)*10;var ea=startAge+i*10;
dyList.push({step:i,jiazi:dzJiazi,gan:dzJiazi[0],zhi:dzJiazi[1],startAge:Math.round(sa*10)/10,endAge:Math.round(ea*10)/10,ss:getShishen(pillars.day[0],dzJiazi[0])})}
return{forward:forward?'顺排':'逆排',startAge:Math.round(startAge*10)/10,list:dyList};
}

function calcShenStrongWeak(pillars){
var dg=pillars.day[0];var dayWx=GAN_WX[dg];
var allGan=[pillars.year[0],pillars.month[0],dg,pillars.hour[0]];
var allZhi=[pillars.year[1],pillars.month[1],pillars.day[1],pillars.hour[1]];
var score=0;var details=[];
var mz=pillars.month[1];var season=MONTH_TO_SEASON[mz]||'';
var ws=WANG_SHUAI[season]?WANG_SHUAI[season][dayWx]:'';
var wsScore={'旺':5,'相':3,'休':0,'囚':-3,'死':-5}[ws]||0;
score+=wsScore*5;details.push('月令'+ws+'(权重5): '+(wsScore*5>=0?'+':'')+wsScore*5);
var tgCount=0;
for(var i=0;i<4;i++){var cang=ZHI_CANG[allZhi[i]];for(var j=0;j<cang.length;j++){if(GAN_WX[cang[j][0]]==dayWx){var w=cang[j][1]=='本气'?3:cang[j][1]=='中气'?2:1;tgCount+=w}}}
score+=tgCount*3;details.push('通根(权重3): '+(tgCount*3>=0?'+':'')+tgCount*3);
var bjCount=0,yinCount=0;
for(var i=0;i<4;i++){if(allGan[i]==dg)continue;if(GAN_WX[allGan[i]]==dayWx)bjCount++;if(WX_SHENG[GAN_WX[allGan[i]]]==dayWx)yinCount++}
var tgScore=(bjCount+yinCount)*2;score+=tgScore*2;details.push('透干比劫印(权重2): '+(tgScore*2>=0?'+':'')+tgScore*2);
var shenfu=0;
for(var i=0;i<4;i++){if(allGan[i]==dg)continue;var gw=GAN_WX[allGan[i]];if(WX_SHENG[gw]==dayWx)shenfu+=1;else if(WX_SHENG[dayWx]==gw)shenfu-=1;else if(WX_KE[dayWx]==gw)shenfu-=1;else if(WX_KE[gw]==dayWx)shenfu-=1}
for(var i=0;i<4;i++){var cang=ZHI_CANG[allZhi[i]];for(var j=0;j<cang.length;j++){if(GAN_WX[cang[j][0]]==dayWx)continue;var gw=GAN_WX[cang[j][0]];if(WX_SHENG[gw]==dayWx)shenfu+=0.5;else if(WX_SHENG[dayWx]==gw)shenfu-=0.5;else if(WX_KE[dayWx]==gw)shenfu-=0.5;else if(WX_KE[gw]==dayWx)shenfu-=0.5}}
score+=Math.round(shenfu);details.push('生扶克泄(权重1): '+(Math.round(shenfu)>=0?'+':'')+Math.round(shenfu));
var result=score>=10?'身强':score<=-10?'身弱':'中和';
return{result:result,score:score,details:details.join('; '),ws:ws,tgCount:tgCount};
}

function determineYongshen(pillars,shenResult,gejuType){
var dg=pillars.day[0];var dayWx=GAN_WX[dg];var mz=pillars.month[1];
var allGan=[pillars.year[0],pillars.month[0],dg,pillars.hour[0]];
var allZhi=[pillars.year[1],pillars.month[1],pillars.day[1],pillars.hour[1]];
var methods=[];
if(gejuType=='从格'){methods.push(['从势法','顺势而为，从强者之势'])}
else{if(shenResult=='身强')methods.push(['扶抑法','克泄耗(官杀/食伤/财星)']);else if(shenResult=='身弱')methods.push(['扶抑法','生扶(印星/比劫)']);else methods.push(['扶抑法','中和平衡，视大运定喜忌'])}
if(mz=='亥'||mz=='子'||mz=='丑')methods.push(['调候法','命局偏寒，需暖(丙丁火)调候']);
else if(mz=='巳'||mz=='午'||mz=='未')methods.push(['调候法','命局偏热，需凉(壬癸水)调候']);
else methods.push(['调候法','气候适中，调候非主要矛盾']);
var wxCount={'木':0,'火':0,'土':0,'金':0,'水':0};
for(var i=0;i<4;i++){wxCount[GAN_WX[allGan[i]]]++;wxCount[ZHI_WX[allZhi[i]]]++}
var bingWx='',bingCnt=0;
for(var w in wxCount){if(wxCount[w]>bingCnt){bingCnt=wxCount[w];bingWx=w}}
if(bingWx!=dayWx&&bingCnt>=4){var yaoWx=WX_KE[bingWx];methods.push(['病药法','病在'+bingWx+'过旺，药取'+yaoWx+'克制'])}
if(gejuType=='从格'){var otherWx='',otherCnt=0;for(var w in wxCount){if(w!=dayWx&&wxCount[w]>otherCnt){otherCnt=wxCount[w];otherWx=w}}methods.push(['从势法','从'+otherWx+'之势，顺势不逆'])}
return{methods:methods,main:methods.length>0?methods[0][1]:'',count:methods.length};
}

function checkConggeBreak(pillars){
var dg=pillars.day[0];var dayWx=GAN_WX[dg];
var allGan=[pillars.year[0],pillars.month[0],dg,pillars.hour[0]];
var allZhi=[pillars.year[1],pillars.month[1],pillars.day[1],pillars.hour[1]];
var pn=['年','月','日','时'];
var factors=[];
for(var i=0;i<4;i++){if(allGan[i]==dg)continue;var gw=GAN_WX[allGan[i]];if(WX_SHENG[gw]==dayWx)factors.push(pn[i]+'干'+allGan[i]+'为印星透出，破从格');if(gw==dayWx)factors.push(pn[i]+'干'+allGan[i]+'为比劫透出，破从格')}
for(var i=0;i<4;i++){var cang=ZHI_CANG[allZhi[i]];var benqi=cang[0][0];if(GAN_WX[benqi]==dayWx)factors.push(pn[i]+'支'+allZhi[i]+'本气'+benqi+'为日主同类，有根不从')}
return{broken:factors.length>0,factors:factors.length>0?factors:['无破格因素，从格成立']};
}

function findShensha(pillars){
var dg=pillars.day[0],dz=pillars.day[1];
var yz=pillars.year[1],mz=pillars.month[1],hz=pillars.hour[1];
var allZhi=[yz,mz,dz,hz];var allGan=[pillars.year[0],pillars.month[0],dg,pillars.hour[0]];
var dayJiazi=dg+dz;var res={};
var ty=SHENSHA_GAN_TY[dg]||[];res['天乙贵人']=ty.filter(function(z){return allZhi.indexOf(z)>=0});
var wc=SHENSHA_GAN_WC[dg]||'';res['文昌贵人']=allZhi.indexOf(wc)>=0?wc:'';
var lu=SHENSHA_GAN_LU[dg]||'';res['禄神']=allZhi.indexOf(lu)>=0?lu:'';
var yr=SHENSHA_GAN_YR[dg]||'';res['羊刃']=allZhi.indexOf(yr)>=0?yr:'';
var ygGroup=SANHE_GROUP[yz]||'';
for(var name in SHENSHA_SANHE){var t=SHENSHA_SANHE[name][ygGroup]||'';res[name]=allZhi.indexOf(t)>=0?t:''}
res['红鸾']=allZhi.indexOf(SHENSHA_ZHI_HL[yz]||'')>=0?SHENSHA_ZHI_HL[yz]:'';
res['天喜']=allZhi.indexOf(SHENSHA_ZHI_TX[yz]||'')>=0?SHENSHA_ZHI_TX[yz]:'';
for(var name in SHENSHA_DAY){res[name]=SHENSHA_DAY[name].indexOf(dayJiazi)>=0?'是':''}
res['进神']=JINSHEN.indexOf(dayJiazi)>=0?'是':'';
res['天赦']=TIESHEN_DAY[dayJiazi]||'';
var xun=getXun(dayJiazi);var kw=KONG_WANG[xun]||[];
res['空亡']=kw.filter(function(z){return allZhi.indexOf(z)>=0});
var chongMap={};for(var i=0;i<ZHI_CHONG.length;i++){chongMap[ZHI_CHONG[i][0]]=ZHI_CHONG[i][1];chongMap[ZHI_CHONG[i][1]]=ZHI_CHONG[i][0]}
var fr=chongMap[yr]||'';res['飞刃']=allZhi.indexOf(fr)>=0?fr:'';
return res;
}

function getWuxingBalance(pillars){
var allGan=[pillars.year[0],pillars.month[0],pillars.day[0],pillars.hour[0]];
var allZhi=[pillars.year[1],pillars.month[1],pillars.day[1],pillars.hour[1]];
var dg=pillars.day[0];var mz=pillars.month[1];var wxCount={'木':0,'火':0,'土':0,'金':0,'水':0};
for(var i=0;i<4;i++){wxCount[GAN_WX[allGan[i]]]++}
for(var i=0;i<4;i++){wxCount[ZHI_WX[allZhi[i]]]++;var cang=ZHI_CANG[allZhi[i]];for(var j=0;j<cang.length;j++)wxCount[GAN_WX[cang[j][0]]]+=0.5}
var maxWx='',minWx='',maxV=-1,minV=999;
for(var w in wxCount){if(wxCount[w]>maxV){maxV=wxCount[w];maxWx=w}if(wxCount[w]<minV){minV=wxCount[w];minWx=w}}
var missing=[];for(var w in wxCount){if(wxCount[w]==0)missing.push(w)}
var season=MONTH_TO_SEASON[pillars.month[1]]||'';var ws=WANG_SHUAI[season]?WANG_SHUAI[season][GAN_WX[dg]]:'';
var tonggen=[];var pn=['年','月','日','时'];
for(var i=0;i<4;i++){var cang=ZHI_CANG[allZhi[i]];for(var j=0;j<cang.length;j++){if(GAN_WX[cang[j][0]]==GAN_WX[dg])tonggen.push(pn[i]+'支'+cang[j][1]+cang[j][0])}}
var zhiWxAll=allZhi.map(function(z){return ZHI_WX[z]});
var coldWarm=mz=='亥'||mz=='子'||mz=='丑'?'寒':(mz=='巳'||mz=='午'||mz=='未'?'暖':(mz=='寅'||mz=='卯'||mz=='辰'?'温':'凉'));
return{count:wxCount,max:maxWx,min:minWx,missing:missing,ws:ws,deling:ws=='旺'||ws=='相'?'是':'否',tonggen:tonggen,coldWarm:coldWarm};
}

function getGeju(pillars){
var dg=pillars.day[0];var mz=pillars.month[1];
var allGan=[pillars.year[0],pillars.month[0],dg,pillars.hour[0]];
var allZhi=[pillars.year[1],pillars.month[1],pillars.day[1],pillars.hour[1]];
var cang=ZHI_CANG[mz];var benqi=cang[0][0];var benqiSs=getShishen(dg,benqi);
var wxAll=allGan.map(function(g){return GAN_WX[g]}).concat(allZhi.map(function(z){return ZHI_WX[z]}));
var wxCnt={};for(var i=0;i<wxAll.length;i++){wxCnt[wxAll[i]]=(wxCnt[wxAll[i]]||0)+1}
var mostWx='',mostCnt=0;for(var w in wxCnt){if(wxCnt[w]>mostCnt){mostCnt=wxCnt[w];mostWx=w}}
var zwMap={'木':'曲直格','火':'炎上格','土':'稼穑格','金':'从革格','水':'润下格'};
var ssGejuMap={'正官':'正官格','七杀':'七杀格','正财':'正财格','偏财':'偏财格','正印':'正印格','偏印':'偏印格','食神':'食神格','伤官':'伤官格','比肩':'建禄格','劫财':'月刃格'};
var dayWx=GAN_WX[dg];var dayCnt=wxCnt[dayWx]||0;
var gejuType,gejuDetail;
if(mostCnt>=7&&dayWx==mostWx){gejuType='专旺格';gejuDetail=zwMap[mostWx]||''}
else if(dayCnt<=1){var otherWx='',otherCnt=0;for(var w in wxCnt){if(w!=dayWx&&wxCnt[w]>otherCnt){otherCnt=wxCnt[w];otherWx=w}}var congMap={};congMap[WX_KE[dayWx]]='从财格';congMap[dayWx]='从杀格';congMap[WX_SHENG[dayWx]]='从儿格';gejuType='从格';gejuDetail=congMap[otherWx]||'从势格'}
else{gejuType='正格';gejuDetail=ssGejuMap[benqiSs]||'待定'}
var season=MONTH_TO_SEASON[mz]||'';var ws=WANG_SHUAI[season]?WANG_SHUAI[season][dayWx]:'';
var shengCnt=wxCnt[WX_SHENG[dayWx]]||0;
var shen=(ws=='旺'||ws=='相')&&(dayCnt+shengCnt)>=3?'身强':(ws=='死'||ws=='囚')&&(dayCnt+shengCnt)<=2?'身弱':'中和';
var yongshen=shen=='身强'?'克泄耗(官杀/食伤/财星)':shen=='身弱'?'生扶(印星/比劫)':'调候通关';
var tiaohou=(mz=='亥'||mz=='子'||mz=='丑')?'需暖(丙丁火)':(mz=='巳'||mz=='午'||mz=='未')?'需凉(壬癸水)':'适中';
return{benqiSs:benqiSs,type:gejuType,detail:gejuDetail,shen:shen,yongshen:yongshen,tiaohou:tiaohou};
}

function findXingChongHeHai(pillars){
var allZhi=[pillars.year[1],pillars.month[1],pillars.day[1],pillars.hour[1]];
var allGan=[pillars.year[0],pillars.month[0],pillars.day[0],pillars.hour[0]];
var pn=['年','月','日','时'];var res={};
var liuhe={};for(var key in ZHI_LIUHE){liuhe[key]='化'+ZHI_LIUHE[key].replace('化','');var rev=key[1]+key[0];liuhe[rev]=liuhe[key]}
var ganhe={};for(var key in GAN_HE){ganhe[key]=GAN_HE[key];var rev=key[1]+key[0];ganhe[rev]=GAN_HE[key]}
var chongMap={};for(var i=0;i<ZHI_CHONG.length;i++){chongMap[ZHI_CHONG[i][0]+ZHI_CHONG[i][1]]=true;chongMap[ZHI_CHONG[i][1]+ZHI_CHONG[i][0]]=true}
res['天干五合']=[];res['天干相冲']=[];res['地支六合']=[];res['地支六冲']=[];res['地支三合局']=[];res['地支三会局']=[];
for(var i=0;i<4;i++){for(var j=i+1;j<4;j++){var gk=allGan[i]+allGan[j];if(ganhe[gk])res['天干五合'].push(pn[i]+pn[j]+'合('+ganhe[gk]+')');var zk=allZhi[i]+allZhi[j];if(liuhe[zk])res['地支六合'].push(pn[i]+pn[j]+'合('+liuhe[zk]+')');if(chongMap[zk])res['地支六冲'].push(pn[i]+pn[j]+'冲')}}
var zhiSet={};for(var i=0;i<4;i++)zhiSet[allZhi[i]]=true;
for(var g in ZHI_SANHE){var gs=g.split('');if(zhiSet[gs[0]]&&zhiSet[gs[1]]&&zhiSet[gs[2]])res['地支三合局'].push(ZHI_SANHE[g])}
for(var g in ZHI_SANHUI){var gs=g.split('');if(zhiSet[gs[0]]&&zhiSet[gs[1]]&&zhiSet[gs[2]])res['地支三会局'].push(ZHI_SANHUI[g])}
return res;
}

// ===== 标签生成函数 =====
function generateLabels(year, month, day, hour, minute, options) {
    options = options || {};
    var gender = options.gender || 'male';

    var pillars = resolvePillars(year, month, day, hour, minute, options);
    var dg = pillars.day[0];
    var allGan = [pillars.year[0], pillars.month[0], dg, pillars.hour[0]];
    var allZhi = [pillars.year[1], pillars.month[1], pillars.day[1], pillars.hour[1]];
    var pn = ['年', '月', '日', '时'];

    var geju = getGeju(pillars);
    var shen = calcShenStrongWeak(pillars);
    var yongshen = determineYongshen(pillars, shen.result, geju.type);
    var dayun = calcDayun(pillars, gender, year, month, day);
    var jieqiWarn = checkJieqiBoundary(month, day);
    var ss = findShensha(pillars);
    var wb = getWuxingBalance(pillars);
    var xch = findXingChongHeHai(pillars);
    var dayJiazi = dg + pillars.day[1];
    var nayin = NAYIN[dayJiazi] || '';

    // 十神分布
    var ssCount = {'比肩':0,'劫财':0,'食神':0,'伤官':0,'偏财':0,'正财':0,'七杀':0,'正官':0,'偏印':0,'正印':0};
    for (var i = 0; i < 4; i++) {
        if (i != 2) { var s = getShishen(dg, allGan[i]); ssCount[s]++; }
        var cang = ZHI_CANG[allZhi[i]];
        for (var j = 0; j < cang.length; j++) { var s2 = getShishen(dg, cang[j][0]); ssCount[s2]++; }
    }

    // L1 四柱基础
    var L1 = {};
    for (var i = 0; i < 4; i++) {
        L1[pn[i] + '柱天干'] = allGan[i];
        L1[pn[i] + '柱地支'] = allZhi[i];
    }

    // L2 天干属性
    var L2 = {};
    for (var i = 0; i < 4; i++) {
        L2[pn[i] + '干五行'] = GAN_WX[allGan[i]];
        L2[pn[i] + '干阴阳'] = GAN_YY[allGan[i]];
    }

    // L3 地支属性
    var L3 = {};
    for (var i = 0; i < 4; i++) {
        L3[pn[i] + '支五行'] = ZHI_WX[allZhi[i]];
        L3[pn[i] + '支生肖'] = ZHI_SX[allZhi[i]];
    }

    // L4 藏干
    var L4 = {};
    for (var i = 0; i < 4; i++) {
        var cang = ZHI_CANG[allZhi[i]];
        for (var j = 0; j < cang.length; j++) {
            L4[pn[i] + '支' + cang[j][1]] = cang[j][0] + '(' + getShishen(dg, cang[j][0]) + ')';
        }
    }

    // L5 十神系统
    var L5 = {};
    for (var i = 0; i < 4; i++) {
        if (i != 2) L5[pn[i] + '干十神'] = getShishen(dg, allGan[i]);
    }
    for (var s in ssCount) { L5['十神_' + s] = String(ssCount[s]); }

    // L6 纳音
    var L6 = {};
    for (var i = 0; i < 4; i++) {
        var jiazi = allGan[i] + allZhi[i];
        L6[pn[i] + '柱纳音'] = NAYIN[jiazi] || '';
    }

    // L7 十二长生
    var L7 = {};
    for (var i = 0; i < 4; i++) {
        var cs = CHANGSHENG[dg] || {};
        L7[pn[i] + '支长生'] = cs[allZhi[i]] || '';
    }

    // L8 神煞(详细)
    var L8 = {};
    var ssOrder = ['天乙贵人','文昌贵人','禄神','羊刃','驿马','桃花','华盖','将星','劫煞','亡神','灾煞','红鸾','天喜','魁罡','孤鸾煞','阴阳差错','十恶大败','十灵日','进神','天赦','飞刃','空亡'];
    for (var i = 0; i < ssOrder.length; i++) {
        var name = ssOrder[i];
        var val = ss[name];
        L8[name] = Array.isArray(val) ? (val.length > 0 ? val.join(',') : '-') : (val || '-');
    }

    // L9 格局
    var L9 = {
        '月令本气十神': geju.benqiSs,
        '格局类型': geju.type,
        '格局细分': geju.detail,
        '身强弱': geju.shen,
        '用神方向': geju.yongshen,
        '调候': geju.tiaohou
    };

    // L10 宫位
    var L10 = {};
    var gwm = {'年':'祖业宫','月':'父母宫','日':'夫妻宫','时':'子女宫'};
    for (var i = 0; i < 4; i++) { L10[pn[i] + '柱宫位'] = gwm[pn[i]]; }

    // L11 五行平衡(详细)
    var L11 = {};
    for (var w in wb.count) { L11['五行_' + w] = String(wb.count[w]); }
    L11['最旺'] = wb.max;
    L11['最弱'] = wb.min;
    L11['月令旺衰'] = wb.ws;
    L11['得令'] = wb.deling;

    // L12 刑冲合害(详细)
    var L12 = {};
    for (var k in xch) { L12[k] = xch[k].length > 0 ? xch[k].join(',') : '无'; }

    // L13 大运流年
    var L13 = {};
    L13['大运排法'] = dayun.forward;
    L13['起运岁数'] = String(dayun.startAge);
    for (var i = 0; i < dayun.list.length; i++) {
        var dy = dayun.list[i];
        L13['大运' + dy.step] = dy.jiazi + '(' + dy.startAge + '-' + dy.endAge + '岁) ' + dy.ss;
    }

    // L14 旬空
    var L14 = {};
    var xun = getXun(dayJiazi);
    var kw = KONG_WANG[xun] || [];
    L14['旬'] = xun;
    L14['空亡地支'] = kw.join(',');
    var kwP = [];
    for (var i = 0; i < 4; i++) { if (kw.indexOf(allZhi[i]) >= 0) kwP.push(pn[i]); }
    L14['空亡宫位'] = kwP.length > 0 ? kwP.join(',') : '无';

    // L15 特殊组合
    var L15 = {};
    var allSameGan = allGan[0]==allGan[1]&&allGan[1]==allGan[2]&&allGan[2]==allGan[3];
    var allSameZhi = allZhi[0]==allZhi[1]&&allZhi[1]==allZhi[2]&&allZhi[2]==allZhi[3];
    L15['天元一气'] = allSameGan ? '是' : '否';
    L15['地元一气'] = allSameZhi ? '是' : '否';
    L15['魁罡日'] = SHENSHA_DAY['魁罡'].indexOf(dayJiazi) >= 0 ? '是' : '否';
    L15['十恶大败'] = SHENSHA_DAY['十恶大败'].indexOf(dayJiazi) >= 0 ? '是' : '否';
    L15['进神'] = JINSHEN.indexOf(dayJiazi) >= 0 ? '是' : '否';

    // L16 命局层次
    var L16 = {};
    L16['寒暖'] = wb.coldWarm;
    var hasChong = false;
    for (var k in xch) { if (xch[k].length > 0 && k.indexOf('冲') >= 0) hasChong = true; }
    L16['动静'] = hasChong ? '动' : '静';
    var yangCnt = 0;
    for (var i = 0; i < 4; i++) if (GAN_YY[allGan[i]] == '阳') yangCnt++;
    L16['刚柔'] = yangCnt >= 3 ? '刚' : (yangCnt <= 1 ? '柔' : '刚柔并济');

    // L17 六亲
    var L17 = {};
    L17['父母星'] = ssCount['正印'] > 0 ? '正印' : (ssCount['偏印'] > 0 ? '偏印' : '缺');
    L17['兄弟星'] = ssCount['比肩'] > 0 ? '比肩' : (ssCount['劫财'] > 0 ? '劫财' : '缺');
    L17['子女星'] = ssCount['食神'] > 0 ? '食神' : (ssCount['伤官'] > 0 ? '伤官' : '缺');
    L17['配偶星'] = ssCount['正财'] > 0 ? '正财' : (ssCount['偏财'] > 0 ? '偏财' : '缺');
    L17['事业星'] = ssCount['正官'] > 0 ? '正官' : (ssCount['七杀'] > 0 ? '七杀' : '缺');
    L17['贵人星'] = (ss['天乙贵人'] && ss['天乙贵人'].length > 0) ? '有' : '无';
    L17['桃花星'] = ss['桃花'] ? '有' : '无';

    // 命局核心
    var L0 = {
        '日主': dg + ' ' + GAN_WX[dg],
        '日主阴阳': GAN_YY[dg],
        '格局类型': geju.type + '·' + geju.detail,
        '身强弱_优化3': shen.result + ' (' + shen.score + '分)',
        '月令旺衰': shen.ws,
        '用神_优化4': yongshen.main,
        '调候': geju.tiaohou,
        '纳音日柱': nayin,
        '大运排法_优化2': dayun.forward + ' ' + dayun.startAge + '岁起',
        '身强强弱明细': shen.details,
        '用神方法数': String(yongshen.count)
    };

    // 节气预警
    var L_warn = {};
    if (jieqiWarn.length > 0) {
        L_warn['节气边界预警_优化1'] = jieqiWarn.join('; ');
    }

    // 破格检查
    var L_break = {};
    if (geju.type == '从格') {
        var cg = checkConggeBreak(pillars);
        L_break['破格检查_优化5'] = cg.broken ? '从格被破格' : '从格成立';
        L_break['破格因素'] = cg.factors.join('; ');
    }

    // 五行平衡
    var L_wb = {};
    for (var w in wb.count) { L_wb['五行_' + w] = String(wb.count[w]); }
    L_wb['最旺'] = wb.max;
    L_wb['最弱'] = wb.min;
    L_wb['缺失'] = wb.missing.length > 0 ? wb.missing.join(',') : '无';
    L_wb['得令'] = wb.deling;
    L_wb['寒暖'] = wb.coldWarm;
    L_wb['通根'] = wb.tonggen.length > 0 ? wb.tonggen.join(',') : '无';

    // 十神分布
    var L_ss = {};
    for (var s in ssCount) { L_ss[s] = String(ssCount[s]); }

    var layers = {
        'L0_命局核心': L0,
        'L1_四柱基础': L1,
        'L2_天干属性': L2,
        'L3_地支属性': L3,
        'L4_藏干': L4,
        'L5_十神系统': L5,
        'L6_纳音': L6,
        'L7_十二长生': L7,
        'L8_神煞详细': L8,
        'L9_格局': L9,
        'L10_宫位': L10,
        'L11_五行平衡': L11,
        'L12_刑冲合害': L12,
        'L13_大运流年': L13,
        'L14_旬空': L14,
        'L15_特殊组合': L15,
        'L16_命局层次': L16,
        'L17_六亲': L17
    };

    // 添加可选层
    if (Object.keys(L_warn).length > 0) layers['L_warn_节气预警'] = L_warn;
    if (Object.keys(L_break).length > 0) layers['L_break_破格检查'] = L_break;
    layers['L_wb_五行平衡详细'] = L_wb;
    layers['L_ss_十神分布'] = L_ss;

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
            system_name: 'bazi',
            system_name_cn: '八字四柱',
            total_dimensions: totalDims,
            timestamp: year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':' + String(minute || 0).padStart(2, '0'),
            dayMaster: dg,
            geju: geju.type + '·' + geju.detail,
            shenStrong: shen.result,
            gender: gender,
            pillars: {
                year: allGan[0] + allZhi[0],
                month: allGan[1] + allZhi[1],
                day: allGan[2] + allZhi[2],
                hour: allGan[3] + allZhi[3]
            }
        }
    };
}

// ===== 标准接口 =====
window.Systems.bazi = function(year, month, day, hour, minute, options) {
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
    var l0 = layers['L0_命局核心'] || {};
    var summary = '';
    if (l0['日主']) summary += '日主:' + l0['日主'];
    if (l0['格局类型']) summary += ' | ' + l0['格局类型'];
    if (l0['身强弱_优化3']) summary += ' | ' + l0['身强弱_优化3'];

    return {
        dimensions: dimensions,
        name: '八字四柱',
        meta: result.meta
    };
};

})();
