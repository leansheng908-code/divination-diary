// ============================================================
// 中医术数系统模块 (zhongyi.js)
// 从 zhongyi.html 提取的纯计算逻辑
// 接口: window.Systems.zhongyi(year, month, day, hour, minute, options)
// ============================================================

window.Systems = window.Systems || {};
window.Systems.zhongyi = function(year, month, day, hour, minute, options) {
    options = options || {};

    // ============================================================
    // Part 1: 基础数据表（从Python源码移植）
    // ============================================================

    var DIZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    var TIANGAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

    var ZIWULIUZHU={
    "子":{"经脉":"胆经(足少阳胆经)","wuxing":"木","流注":"当令","desc":"子时胆经旺，一阳初生，宜安睡养胆","养生":"安睡/勿熬夜"},
    "丑":{"经脉":"肝经(足厥阴肝经)","wuxing":"木","流注":"当令","desc":"丑时肝经旺，藏血解毒，宜深度睡眠","养生":"深度睡眠"},
    "寅":{"经脉":"肺经(手太阴肺经)","wuxing":"金","流注":"当令","desc":"寅时肺经旺，气血由静转动，宜安睡","养生":"安睡/勿早起剧烈"},
    "卯":{"经脉":"大肠经(手阳明大肠经)","wuxing":"金","流注":"当令","desc":"卯时大肠经旺，宜排便排毒","养生":"晨起饮水/排便"},
    "辰":{"经脉":"胃经(足阳明胃经)","wuxing":"土","流注":"当令","desc":"辰时胃经旺，宜进早餐","养生":"吃好早餐"},
    "巳":{"经脉":"脾经(足太阴脾经)","wuxing":"土","流注":"当令","desc":"巳时脾经旺，运化水谷精微","养生":"工作学习最佳时段"},
    "午":{"经脉":"心经(手少阴心经)","wuxing":"火","流注":"当令","desc":"午时心经旺，宜午休养心","养生":"午休15-30分钟"},
    "未":{"经脉":"小肠经(手太阳小肠经)","wuxing":"火","流注":"当令","desc":"未时小肠经旺，吸收营养","养生":"午餐消化/勿剧烈"},
    "申":{"经脉":"膀胱经(足太阳膀胱经)","wuxing":"水","流注":"当令","desc":"申时膀胱经旺，宜多饮水排毒","养生":"多喝水/运动"},
    "酉":{"经脉":"肾经(足少阴肾经)","wuxing":"水","流注":"当令","desc":"酉时肾经旺，藏精纳气","养生":"休息/勿过劳"},
    "戌":{"经脉":"心包经(手厥阴心包经)","wuxing":"火","流注":"当令","desc":"戌时心包经旺，宜散步放松","养生":"散步/听音乐"},
    "亥":{"经脉":"三焦经(手少阳三焦经)","wuxing":"火","流注":"当令","desc":"亥时三焦经旺，宜安睡养百脉","养生":"安睡/勿兴奋"}
    };

    var LINGGUI_BAFA={
    "公孙":{"经脉":"脾经","通脉":"冲脉","配穴":"内关","八卦":"乾","desc":"胃心胸疾患"},
    "内关":{"经脉":"心包经","通脉":"阴维脉","配穴":"公孙","八卦":"艮","desc":"胃心胸疾患"},
    "后溪":{"经脉":"小肠经","通脉":"督脉","配穴":"申脉","八卦":"巽","desc":"项强耳疾"},
    "申脉":{"经脉":"膀胱经","通脉":"阳蹻脉","配穴":"后溪","八卦":"震","desc":"项强耳疾"},
    "足临泣":{"经脉":"胆经","通脉":"带脉","配穴":"外关","八卦":"兑","desc":"目锐眦耳后疾"},
    "外关":{"经脉":"三焦经","通脉":"阳维脉","配穴":"足临泣","八卦":"坎","desc":"目锐眦耳后疾"},
    "列缺":{"经脉":"肺经","通脉":"任脉","配穴":"照海","八卦":"离","desc":"肺系咽喉胸膈疾"},
    "照海":{"经脉":"肾经","通脉":"阴蹻脉","配穴":"列缺","八卦":"坤","desc":"肺系咽喉胸膈疾"}
    };

    var FEITENG_BAFA={
    "甲己":"公孙(乾)","乙庚":"内关(艮)","丙辛":"足临泣(兑)",
    "丁壬":"照海(坤)","戊癸":"列缺(离)","子午":"后溪(巽)",
    "丑未":"申脉(震)","寅申":"外关(坎)"
    };

    var WUYUN={
    "甲己":{"运":"土运","太过不及":"甲太过/己不及","对应":"脾胃","特征":"湿气偏盛"},
    "乙庚":{"运":"金运","太过不及":"庚太过/乙不及","对应":"肺大肠","特征":"燥气偏盛"},
    "丙辛":{"运":"水运","太过不及":"丙太过/辛不及","对应":"肾膀胱","特征":"寒气偏盛"},
    "丁壬":{"运":"木运","太过不及":"壬太过/丁不及","对应":"肝胆","特征":"风气偏盛"},
    "戊癸":{"运":"火运","太过不及":"戊太过/癸不及","对应":"心小肠","特征":"火气偏盛"}
    };

    var LIUQI_SITIAN={
    "子午":{"司天":"少阴君火","在泉":"阳明燥金","desc":"火气司天，金气在泉"},
    "丑未":{"司天":"太阴湿土","在泉":"太阳寒水","desc":"湿气司天，寒气在泉"},
    "寅申":{"司天":"少阳相火","在泉":"厥阴风木","desc":"火气司天，风气在泉"},
    "卯酉":{"司天":"阳明燥金","在泉":"少阴君火","desc":"金气司天，火气在泉"},
    "辰戌":{"司天":"太阳寒水","在泉":"太阴湿土","desc":"寒气司天，湿气在泉"},
    "巳亥":{"司天":"厥阴风木","在泉":"少阳相火","desc":"风气司天，火气在泉"}
    };

    var LIUQI_ZHUQI=[
    {"name":"初气(厥阴风木)","time":"大寒~春分","wuxing":"木","desc":"风气主令"},
    {"name":"二气(少阴君火)","time":"春分~小满","wuxing":"火","desc":"热气主令"},
    {"name":"三气(少阳相火)","time":"小满~大暑","wuxing":"火","desc":"火气主令"},
    {"name":"四气(太阴湿土)","time":"大暑~秋分","wuxing":"土","desc":"湿气主令"},
    {"name":"五气(阳明燥金)","time":"秋分~小雪","wuxing":"金","desc":"燥气主令"},
    {"name":"终气(太阳寒水)","time":"小雪~大寒","wuxing":"水","desc":"寒气主令"}
    ];

    var LIUQI_KEQI_ORDER=["厥阴风木","少阴君火","太阴湿土","少阳相火","阳明燥金","太阳寒水"];

    var NAJIA={
    "甲":{"经脉":"胆经","wuxing":"木","穴位":"足窍阴/侠溪/足临泣"},
    "乙":{"经脉":"肝经","wuxing":"木","穴位":"大敦/行间/太冲"},
    "丙":{"经脉":"小肠经","wuxing":"火","穴位":"少泽/前谷/后溪"},
    "丁":{"经脉":"心经","wuxing":"火","穴位":"少冲/少府/神门"},
    "戊":{"经脉":"胃经","wuxing":"土","穴位":"厉兑/内庭/足三里"},
    "己":{"经脉":"脾经","wuxing":"土","穴位":"隐白/太白/太白"},
    "庚":{"经脉":"大肠经","wuxing":"金","穴位":"商阳/二间/三间"},
    "辛":{"经脉":"肺经","wuxing":"金","穴位":"少商/鱼际/太渊"},
    "壬":{"经脉":"膀胱经","wuxing":"水","穴位":"至阴/通谷/束骨"},
    "癸":{"经脉":"肾经","wuxing":"水","穴位":"涌泉/然谷/太溪"}
    };

    var NAZI={
    "子":"胆经","丑":"肝经","寅":"肺经","卯":"大肠经",
    "辰":"胃经","巳":"脾经","午":"心经","未":"小肠经",
    "申":"膀胱经","酉":"肾经","戌":"心包经","亥":"三焦经"
    };

    var WUXING_SHENG={"金":"水","水":"木","木":"火","火":"土","土":"金"};
    var WUXING_KE={"金":"木","木":"土","土":"水","水":"火","火":"金"};

    var XIAOXI_GUA={
    "子":{"卦":"复","desc":"一阳来复","阴阳":"1阳5阴"},
    "丑":{"卦":"临","desc":"二阳浸长","阴阳":"2阳4阴"},
    "寅":{"卦":"泰","desc":"三阳开泰","阴阳":"3阳3阴"},
    "卯":{"卦":"大壮","desc":"四阳壮盛","阴阳":"4阳2阴"},
    "辰":{"卦":"夬","desc":"五阳决阴","阴阳":"5阳1阴"},
    "巳":{"卦":"乾","desc":"纯阳之体","阴阳":"6阳0阴"},
    "午":{"卦":"姤","desc":"一阴始生","阴阳":"5阳1阴"},
    "未":{"卦":"遁","desc":"二阴渐长","阴阳":"4阳2阴"},
    "申":{"卦":"否","desc":"天地不交","阴阳":"3阳3阴"},
    "酉":{"卦":"观","desc":"四阴观省","阴阳":"2阳4阴"},
    "戌":{"卦":"剥","desc":"五阴剥阳","阴阳":"1阳5阴"},
    "亥":{"卦":"坤","desc":"纯阴之体","阴阳":"0阳6阴"}
    };

    var WUXING_ZANGFU={
    "木":{"脏腑":"肝胆","生":"火(心)","克":"土(脾)","季节":"春"},
    "火":{"脏腑":"心小肠","生":"土(脾)","克":"金(肺)","季节":"夏"},
    "土":{"脏腑":"脾胃","生":"金(肺)","克":"水(肾)","季节":"长夏"},
    "金":{"脏腑":"肺大肠","生":"水(肾)","克":"木(肝)","季节":"秋"},
    "水":{"脏腑":"肾膀胱","生":"木(肝)","克":"火(心)","季节":"冬"}
    };

    // ============================================================
    // Part 2: 优化相关数据表
    // ============================================================

    var JIEQI_DATES={
    "大寒":[1,20],"立春":[2,4],"雨水":[2,19],
    "春分":[3,20],"清明":[4,5],"谷雨":[4,20],
    "立夏":[5,5],"小满":[5,21],"芒种":[6,6],
    "夏至":[6,21],"小暑":[7,7],"大暑":[7,23],
    "立秋":[8,7],"处暑":[8,23],"白露":[9,7],
    "秋分":[9,23],"寒露":[10,8],"霜降":[10,23],
    "立冬":[11,7],"小雪":[11,22],"大雪":[12,7],
    "冬至":[12,22],"小寒":[1,5]
    };

    var MONTH_JIE=[
    {name:"小寒",m:1,d:5,zhi:"丑"},
    {name:"立春",m:2,d:4,zhi:"寅"},
    {name:"惊蛰",m:3,d:6,zhi:"卯"},
    {name:"清明",m:4,d:5,zhi:"辰"},
    {name:"立夏",m:5,d:5,zhi:"巳"},
    {name:"芒种",m:6,d:6,zhi:"午"},
    {name:"小暑",m:7,d:7,zhi:"未"},
    {name:"立秋",m:8,d:7,zhi:"申"},
    {name:"白露",m:9,d:7,zhi:"酉"},
    {name:"寒露",m:10,d:8,zhi:"戌"},
    {name:"立冬",m:11,d:7,zhi:"亥"},
    {name:"大雪",m:12,d:7,zhi:"子"}
    ];

    var WUHU_DUN={"甲":2,"己":2,"乙":4,"庚":4,"丙":6,"辛":6,"丁":8,"壬":8,"戊":0,"癸":0};
    var GAN_NUM={"甲":1,"乙":2,"丙":3,"丁":4,"戊":5,"己":6,"庚":7,"辛":8,"壬":9,"癸":10};
    var ZHI_NUM={"子":1,"丑":2,"寅":3,"卯":4,"辰":5,"巳":6,"午":7,"未":8,"申":9,"酉":10,"戌":11,"亥":12};

    var LINGGUI_JIUGONG={
    1:["坎","申脉","膀胱经","阳蹻脉"],
    2:["坤","照海","肾经","阴蹻脉"],
    3:["震","外关","三焦经","阳维脉"],
    4:["巽","足临泣","胆经","带脉"],
    5:["中","公孙","脾经","冲脉"],
    6:["乾","公孙","脾经","冲脉"],
    7:["兑","足临泣","胆经","带脉"],
    8:["艮","内关","心包经","阴维脉"],
    9:["离","列缺","肺经","任脉"]
    };

    var YANG_GAN={"甲":1,"丙":1,"戊":1,"庚":1,"壬":1};
    var WUSHU_DUN={"甲":0,"己":0,"乙":2,"庚":2,"丙":4,"辛":4,"丁":6,"壬":6,"戊":8,"癸":8};

    var WUYUN_WUXING={"土运":"土","金运":"金","水运":"水","木运":"木","火运":"火"};
    var NIANZHI_WUXING={
    "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
    "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"
    };
    var SITIAN_WUXING={
    "少阴君火":"火","太阴湿土":"土","少阳相火":"火",
    "阳明燥金":"金","太阳寒水":"水","厥阴风木":"木"
    };
    var ZHUQI_WUXING={
    "初气(厥阴风木)":"木","二气(少阴君火)":"火","三气(少阳相火)":"火",
    "四气(太阴湿土)":"土","五气(阳明燥金)":"金","终气(太阳寒水)":"水"
    };
    var KEQI_WUXING={
    "厥阴风木":"木","少阴君火":"火","太阴湿土":"土",
    "少阳相火":"火","阳明燥金":"金","太阳寒水":"水"
    };

    // ============================================================
    // Part 3: 干支推算函数
    // ============================================================

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
            yearZhi=DIZHI[((year-1-2024+4)%12+12)%12];
        }else{
            yearGan=TIANGAN[((year-2024)%10+10)%10];
            yearZhi=DIZHI[((year-2024+4)%12+12)%12];
        }
        return{yearGz:yearGan+yearZhi,dayGz:dayGz,dayGan:dayGan,dayZhi:dayZhi,yearGan:yearGan,yearZhi:yearZhi};
    }

    function calcMonthZhi(year,month,day){
        var md=month*100+day;
        var i;
        for(i=11;i>=0;i--){
            var jie=MONTH_JIE[i];
            var jieMd=jie.m*100+jie.d;
            if(md>=jieMd){return jie.zhi;}
        }
        return"丑";
    }

    function calcMonthGanZhi(year,month,day,yearGan){
        var monthZhi=calcMonthZhi(year,month,day);
        var zhiIdx=DIZHI.indexOf(monthZhi);
        var yinIdx=DIZHI.indexOf("寅");
        var monthOffset=((zhiIdx-yinIdx)%12+12)%12;
        var startGanIdx=WUHU_DUN[yearGan]||0;
        var monthGanIdx=(startGanIdx+monthOffset)%10;
        var monthGan=TIANGAN[monthGanIdx];
        return monthGan+monthZhi;
    }

    function calcHourZhi(hour){
        return DIZHI[Math.floor((hour%24+1)/2)%12];
    }

    function calcHourGan(dayGan,hourZhi){
        var zhiIdx=DIZHI.indexOf(hourZhi);
        var startIdx=WUSHU_DUN[dayGan]||0;
        var hourGanIdx=(startIdx+zhiIdx)%10;
        return TIANGAN[hourGanIdx];
    }

    function getWuyun(yearGan){
        var key;
        for(key in WUYUN){
            if(WUYUN.hasOwnProperty(key)){
                if(key.indexOf(yearGan)>=0){return WUYUN[key];}
            }
        }
        return{};
    }

    function getLiuqi(yearZhi){
        var key;
        for(key in LIUQI_SITIAN){
            if(LIUQI_SITIAN.hasOwnProperty(key)){
                if(key.indexOf(yearZhi)>=0){return LIUQI_SITIAN[key];}
            }
        }
        return{};
    }

    // ============================================================
    // Part 4: 优化计算函数
    // ============================================================

    function getZhuqiPrecise(month,day){
        function jq(name){var d=JIEQI_DATES[name];return d[0]*100+d[1];}
        var cur=month*100+day;
        if(cur>=jq("小雪")||cur<jq("大寒")){return LIUQI_ZHUQI[5];}
        else if(cur<jq("春分")){return LIUQI_ZHUQI[0];}
        else if(cur<jq("小满")){return LIUQI_ZHUQI[1];}
        else if(cur<jq("大暑")){return LIUQI_ZHUQI[2];}
        else if(cur<jq("秋分")){return LIUQI_ZHUQI[3];}
        else{return LIUQI_ZHUQI[4];}
    }

    function calcLingguiBafa(dayGan,dayZhi,hourGan,hourZhi){
        var isYangDay=YANG_GAN.hasOwnProperty(dayGan);
        var dayGanNum=GAN_NUM[dayGan]||1;
        var dayZhiNum=ZHI_NUM[dayZhi]||1;
        var hourGanNum=GAN_NUM[hourGan]||1;
        var hourZhiNum=ZHI_NUM[hourZhi]||1;
        var total=dayGanNum+dayZhiNum+hourGanNum+hourZhiNum;
        var divisor=isYangDay?9:6;
        var remainder=total%divisor;
        if(remainder===0){remainder=divisor;}
        var result=LINGGUI_JIUGONG[remainder]||["?","?","?","?"];
        return{
            dayGan:dayGan,dayGanNum:dayGanNum,dayZhi:dayZhi,dayZhiNum:dayZhiNum,
            hourGan:hourGan,hourGanNum:hourGanNum,hourZhi:hourZhi,hourZhiNum:hourZhiNum,
            total:total,isYangDay:isYangDay,divisor:divisor,remainder:remainder,
            xue:result[1],bagua:result[0],jingmai:result[2],tongmai:result[3]
        };
    }

    function calcKeqiSixSteps(sitian){
        var sitianIdx=LIUQI_KEQI_ORDER.indexOf(sitian);
        if(sitianIdx<0){return[];}
        var startIdx=((sitianIdx-2)%6+6)%6;
        var steps=[];
        var i;
        for(i=0;i<6;i++){
            var qiIdx=(startIdx+i)%6;
            var qiName=LIUQI_KEQI_ORDER[qiIdx];
            var stepNum=i+1;
            var position="";
            if(stepNum===3){position="司天";}
            else if(stepNum===6){position="在泉";}
            else{position="间气("+stepNum+")";}
            steps.push({step:stepNum,keqi:qiName,position:position});
        }
        return steps;
    }

    function calcYunqiXianghe(yearGan,yearZhi,wuyunInfo,liuqiInfo){
        var yun=wuyunInfo["运"]||"";
        var yunWx=WUYUN_WUXING[yun]||"";
        var sitian=liuqiInfo["司天"]||"";
        var sitianWx=SITIAN_WUXING[sitian]||"";
        var nianzhiWx=NIANZHI_WUXING[yearZhi]||"";
        var isYangGan=YANG_GAN.hasOwnProperty(yearGan);
        var isTaiGuo=isYangGan;
        var isBuJi=!isYangGan;
        var isTianfu=(yunWx===sitianWx)&&yunWx!=="";
        var isSuihui=(yunWx===nianzhiWx)&&yunWx!=="";
        var isTaiyi=isTianfu&&isSuihui;
        var isPingqi=false;
        if(isTaiGuo&&sitianWx){if(WUXING_KE[sitianWx]===yunWx){isPingqi=true;}}
        if(isBuJi&&sitianWx){if(WUXING_SHENG[sitianWx]===yunWx){isPingqi=true;}}
        var category,desc;
        if(isTaiyi){category="太乙天符";desc="岁运五行=司天五行=年支五行，气化最强，易爆发流行病";}
        else if(isTianfu){category="天符";desc="岁运五行=司天五行，气化极强，气候剧烈波动";}
        else if(isSuihui){category="岁会";desc="岁运五行=年支五行，病势缓和持久";}
        else if(isPingqi){category="平气";desc="太过被克制/不及得资助，气化均衡，气候平稳";}
        else{category="运气异化";desc="运与气不同化，需具体分析";}
        return{
            yun:yun,yunWx:yunWx,sitianWx:sitianWx,nianzhiWx:nianzhiWx,
            tianfu:isTianfu,suihui:isSuihui,taiyi:isTaiyi,pingqi:isPingqi,
            category:category,desc:desc
        };
    }

    function calcKezhuJialin(keqiSteps){
        var results=[];
        var xiangdeCount=0;
        var buxiangdeCount=0;
        var i;
        for(i=0;i<keqiSteps.length;i++){
            var step=keqiSteps[i];
            var stepNum=step.step;
            var keqiName=step.keqi;
            var zhuqi=LIUQI_ZHUQI[i];
            var zhuqiName=zhuqi.name;
            var keWx=KEQI_WUXING[keqiName]||"";
            var zhuWx=ZHUQI_WUXING[zhuqiName]||"";
            var relation="",climate="",severity="";
            if(keWx===zhuWx){relation="同气";climate="平和";xiangdeCount++;}
            else if(WUXING_SHENG[keWx]===zhuWx){relation="客生主";climate="平和";xiangdeCount++;}
            else if(WUXING_SHENG[zhuWx]===keWx){relation="主生客";climate="平和";xiangdeCount++;}
            else if(WUXING_KE[keWx]===zhuWx){relation="客克主(客胜从)";climate="反常";severity="从证(较轻)";buxiangdeCount++;}
            else if(WUXING_KE[zhuWx]===keWx){relation="主克客(主胜逆)";climate="反常";severity="逆证(较重)";buxiangdeCount++;}
            else{relation="无直接关系";climate="一般";xiangdeCount++;}
            results.push({step:stepNum,zhuqi:zhuqiName,keqi:keqiName,zhuWx:zhuWx,keWx:keWx,relation:relation,climate:climate,severity:severity});
        }
        var overall="平和";
        if(xiangdeCount<4){overall=buxiangdeCount>=3?"偏反常":"一般";}
        var disease="气候平和，发病较少";
        if(overall==="偏反常"){disease="气候反常，疾病多发";}
        else if(overall==="一般"){disease="气候一般，注意调养";}
        return{steps:results,xiangdeCount:xiangdeCount,buxiangdeCount:buxiangdeCount,overall:overall,disease:disease};
    }

    // ============================================================
    // 主计算逻辑
    // ============================================================

    // 干支推算（优先使用options.ganzhi）
    var gz, yearGz, dayGz, dayGan, dayZhi, yearGan, yearZhi, monthGz, hourZhi, hourGan;
    if (options.ganzhi && options.ganzhi.yearGz) {
        yearGz = options.ganzhi.yearGz;
        yearGan = yearGz.charAt(0);
        yearZhi = yearGz.charAt(yearGz.length - 1);
        dayGz = options.ganzhi.dayGz || '';
        dayGan = options.ganzhi.dayGan || dayGz.charAt(0);
        dayZhi = options.ganzhi.dayZhi || dayGz.charAt(dayGz.length - 1);
        monthGz = options.ganzhi.monthGz || calcMonthGanZhi(year, month, day, yearGan);
        hourZhi = options.ganzhi.hourGz ? options.ganzhi.hourGz.charAt(options.ganzhi.hourGz.length - 1) : calcHourZhi(hour);
        hourGan = options.ganzhi.hourGan || calcHourGan(dayGan, hourZhi);
    } else {
        gz = solarToGanzhi(year, month, day);
        yearGz = gz.yearGz;
        dayGz = gz.dayGz;
        dayGan = gz.dayGan;
        dayZhi = gz.dayZhi;
        yearGan = gz.yearGan;
        yearZhi = gz.yearZhi;
        monthGz = calcMonthGanZhi(year, month, day, yearGan);
        hourZhi = calcHourZhi(hour);
        hourGan = calcHourGan(dayGan, hourZhi);
    }

    // 五运六气
    var wuyun = getWuyun(yearGan);
    var liuqi = getLiuqi(yearZhi);
    var ziwu = ZIWULIUZHU[hourZhi] || {};
    var najia = NAJIA[dayGan] || {};
    var nazi = NAZI[hourZhi] || "未知";
    var xiaoxi = XIAOXI_GUA[hourZhi] || {};

    // 优化计算
    var zhuqiPrecise = getZhuqiPrecise(month, day);
    var linggui = calcLingguiBafa(dayGan, dayZhi, hourGan, hourZhi);
    var sitian = liuqi["司天"] || "?";
    var keqiSteps = calcKeqiSixSteps(sitian);
    var yunqi = calcYunqiXianghe(yearGan, yearZhi, wuyun, liuqi);
    var kezhu = calcKezhuJialin(keqiSteps);

    // ============================================================
    // 构建维度数据
    // ============================================================

    var dimensions = {};

    // L1 基础排盘 (14维)
    dimensions["年干支"] = yearGz;
    dimensions["月干支"] = monthGz;
    dimensions["日干支"] = dayGz;
    dimensions["年干"] = yearGan;
    dimensions["年支"] = yearZhi;
    dimensions["日干"] = dayGan;
    dimensions["日支"] = dayZhi;
    dimensions["时干"] = hourGan;
    dimensions["时支"] = hourZhi;
    dimensions["五运"] = (wuyun["运"] || '?') + '(' + (wuyun["太过不及"] || '?') + ')';
    dimensions["司天"] = liuqi["司天"] || '?';
    dimensions["在泉"] = liuqi["在泉"] || '?';
    dimensions["当令经脉"] = ziwu["经脉"] || '?';
    dimensions["纳甲经"] = (najia["经脉"] || '?') + '(' + (najia["wuxing"] || '?') + ')';
    dimensions["纳子经"] = nazi;

    // L2 子午流注当令信息 (12维)
    dimensions["当令经脉_全称"] = ziwu["经脉"] || '?';
    dimensions["当令五行"] = ziwu.wuxing || '?';
    dimensions["当令流注"] = ziwu["流注"] || '?';
    dimensions["当令描述"] = ziwu["desc"] || '?';
    dimensions["当令养生"] = ziwu["养生"] || '?';
    dimensions["子午流注_全表"] = ZIWULIUZHU;

    // L3 灵龟八法 (8维)
    dimensions["灵龟_八脉交会穴表"] = LINGGUI_BAFA;
    dimensions["灵龟_开穴"] = linggui.xue;
    dimensions["灵龟_八卦"] = linggui.bagua;
    dimensions["灵龟_经脉"] = linggui.jingmai;
    dimensions["灵龟_通脉"] = linggui.tongmai;
    dimensions["灵龟_日干数"] = linggui.dayGanNum;
    dimensions["灵龟_总数"] = linggui.total;
    dimensions["灵龟_余数"] = linggui.remainder;
    dimensions["灵龟_日类"] = linggui.isYangDay ? '阳日(除9)' : '阴日(除6)';

    // L4 飞腾八法 (8维)
    dimensions["飞腾八法_表"] = FEITENG_BAFA;

    // L5 五运系统 (5维)
    dimensions["五运_运"] = wuyun["运"] || '?';
    dimensions["五运_太过不及"] = wuyun["太过不及"] || '?';
    dimensions["五运_对应脏腑"] = wuyun["对应"] || '?';
    dimensions["五运_特征"] = wuyun["特征"] || '?';
    dimensions["五运_全表"] = WUYUN;

    // L6 六气司天在泉 (6维)
    dimensions["六气_司天"] = liuqi["司天"] || '?';
    dimensions["六气_在泉"] = liuqi["在泉"] || '?';
    dimensions["六气_描述"] = liuqi["desc"] || '?';
    dimensions["六气_全表"] = LIUQI_SITIAN;

    // L7 六气主气 (6维)
    dimensions["当前主气"] = zhuqiPrecise.name;
    dimensions["当前主气_时间"] = zhuqiPrecise.time;
    dimensions["当前主气_五行"] = zhuqiPrecise.wuxing;
    dimensions["当前主气_描述"] = zhuqiPrecise.desc;
    dimensions["六气主气_全表"] = LIUQI_ZHUQI;

    // L8 纳甲法 (10维)
    dimensions["纳甲_本日经脉"] = najia["经脉"] || '?';
    dimensions["纳甲_本日五行"] = najia.wuxing || '?';
    dimensions["纳甲_本日穴位"] = najia["穴位"] || '?';
    dimensions["纳甲_全表"] = NAJIA;

    // L9 纳子法 (12维)
    dimensions["纳子_本时经脉"] = nazi;
    dimensions["纳子_全表"] = NAZI;

    // L10 十二消息卦 (12维)
    dimensions["消息卦"] = xiaoxi["卦"] || '?';
    dimensions["消息卦_描述"] = xiaoxi["desc"] || '?';
    dimensions["消息卦_阴阳比"] = xiaoxi["阴阳"] || '?';
    dimensions["十二消息卦_全表"] = XIAOXI_GUA;

    // L11 五行脏腑 (5维)
    dimensions["五行脏腑_全表"] = WUXING_ZANGFU;

    // L12 时辰养生建议 (12维)
    dimensions["时辰养生_全表"] = ZIWULIUZHU;

    // L13 六气客气推算 (6维) - OPT3
    dimensions["客气六步"] = keqiSteps;

    // L14 运气相合分析 - OPT4
    dimensions["运气相合_分类"] = yunqi.category;
    dimensions["运气相合_描述"] = yunqi.desc;
    dimensions["运气相合_岁运五行"] = yunqi.yunWx;
    dimensions["运气相合_司天五行"] = yunqi.sitianWx;
    dimensions["运气相合_年支五行"] = yunqi.nianzhiWx;
    dimensions["运气相合_天符"] = yunqi.tianfu;
    dimensions["运气相合_岁会"] = yunqi.suihui;
    dimensions["运气相合_太乙天符"] = yunqi.taiyi;
    dimensions["运气相合_平气"] = yunqi.pingqi;

    // L15 经络流注时序 (12维)
    var liuShi = [];
    for (var i = 0; i < 12; i++) {
        var dzA = DIZHI[i];
        var dzB = DIZHI[(i + 1) % 12];
        var infoA = ZIWULIUZHU[dzA] || {};
        var infoB = ZIWULIUZHU[dzB] || {};
        liuShi.push({
            from: dzA, to: dzB,
            fromJing: infoA["经脉"] || '?',
            toJing: infoB["经脉"] || '?',
            wuxingRelation: (infoA.wuxing || '?') + '→' + (infoB.wuxing || '?')
        });
    }
    dimensions["经络流注时序"] = liuShi;

    // L16 当令详细分析 (10维)
    dimensions["当令_时辰"] = hourZhi;
    dimensions["当令_经脉"] = ziwu["经脉"] || '?';
    dimensions["当令_五行"] = ziwu.wuxing || '?';
    dimensions["当令_描述"] = ziwu["desc"] || '?';
    dimensions["当令_养生"] = ziwu["养生"] || '?';
    dimensions["当令_纳甲经脉"] = najia["经脉"] || '?';
    dimensions["当令_纳甲五行"] = najia.wuxing || '?';
    dimensions["当令_纳子经脉"] = nazi;
    dimensions["当令_消息卦"] = (xiaoxi["卦"] || '?') + '(' + (xiaoxi["desc"] || '?') + ')';
    dimensions["当令_阴阳比"] = xiaoxi["阴阳"] || '?';

    // L17 盘面总评 (10维)
    dimensions["总评_年运"] = (wuyun["运"] || '?') + '-' + (wuyun["太过不及"] || '?');
    dimensions["总评_司天在泉"] = (liuqi["司天"] || '?') + '/' + (liuqi["在泉"] || '?');
    dimensions["总评_当令经脉"] = ziwu["经脉"] || '?';
    dimensions["总评_当令五行"] = ziwu.wuxing || '?';
    dimensions["总评_养生建议"] = ziwu["养生"] || '?';
    dimensions["总评_运气相合"] = yunqi.category;
    dimensions["总评_脏腑重点"] = wuyun["对应"] || '?';
    dimensions["总评_气候特征"] = wuyun["特征"] || '?';
    dimensions["总评_消息卦象"] = xiaoxi["卦"] || '?';
    dimensions["总评_综合建议"] = "调养" + (wuyun["对应"] || '?') + "，" + (ziwu["养生"] || '?');

    // OPT5 客主加临分析
    dimensions["客主加临"] = kezhu;

    return { dimensions: dimensions, name: "中医术数" };
};
