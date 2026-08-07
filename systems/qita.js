// ============================================================
// 其他术数系统模块 (qita.js)
// 从 qita.html 提取的纯计算逻辑
// 接口: window.Systems.qita(year, month, day, hour, minute, options)
// ============================================================

window.Systems = window.Systems || {};
window.Systems.qita = function(year, month, day, hour, minute, options) {
    options = options || {};

    // ============================================================
    // Part 1: 基础数据表（从Python适配器v1.1-optimized移植）
    // ============================================================
    var DIZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    var TIANGAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

    var XIAOLIUREN=[
    {name:"大安",dizhi:"寅",wuxing:"木",jixiong:"吉",desc:"事事安稳",xiang:"青龙",yi:"求财/谋事/出行"},
    {name:"留连",dizhi:"卯",wuxing:"水",jixiong:"凶",desc:"事多拖延",xiang:"玄武",yi:"不宜急事"},
    {name:"速喜",dizhi:"辰",wuxing:"火",jixiong:"吉",desc:"喜事速至",xiang:"朱雀",yi:"求财/谋事/求名"},
    {name:"赤口",dizhi:"巳",wuxing:"金",jixiong:"凶",desc:"口舌是非",xiang:"白虎",yi:"防口舌/防官非"},
    {name:"小吉",dizhi:"午",wuxing:"水",jixiong:"吉",desc:"小有吉利",xiang:"六合",yi:"求财/谋事/婚恋"},
    {name:"空亡",dizhi:"未",wuxing:"土",jixiong:"大凶",desc:"万事落空",xiang:"勾陈",yi:"万事不宜"}
    ];

    var JIUGONG_FEIXING={
    1:{name:"一白",gua:"坎",wuxing:"水",fangwei:"正北",desc:"桃花文昌",jixiong:"吉",zhuguan:"事业/人缘"},
    2:{name:"二黑",gua:"坤",wuxing:"土",fangwei:"西南",desc:"病符星",jixiong:"凶",zhuguan:"疾病/健康"},
    3:{name:"三碧",gua:"震",wuxing:"木",fangwei:"正东",desc:"禄存星",jixiong:"凶",zhuguan:"口舌/是非"},
    4:{name:"四绿",gua:"巽",wuxing:"木",fangwei:"东南",desc:"文曲星",jixiong:"吉",zhuguan:"学业/文昌"},
    5:{name:"五黄",gua:"中",wuxing:"土",fangwei:"中宫",desc:"廉贞大煞",jixiong:"大凶",zhuguan:"灾祸/意外"},
    6:{name:"六白",gua:"乾",wuxing:"金",fangwei:"西北",desc:"武曲星",jixiong:"吉",zhuguan:"权力/贵人"},
    7:{name:"七赤",gua:"兑",wuxing:"金",fangwei:"正西",desc:"破军星",jixiong:"凶",zhuguan:"破财/口舌"},
    8:{name:"八白",gua:"艮",wuxing:"土",fangwei:"东北",desc:"左辅星",jixiong:"大吉",zhuguan:"财运/置业"},
    9:{name:"九紫",gua:"离",wuxing:"火",fangwei:"正南",desc:"右弼星",jixiong:"大吉",zhuguan:"姻缘/喜庆"}
    };

    var SANYUAN_JIUYUN=[
    {yun:"一运",start:1864,end:1883,star:1,yuan:"上元"},
    {yun:"二运",start:1884,end:1903,star:2,yuan:"上元"},
    {yun:"三运",start:1904,end:1923,star:3,yuan:"上元"},
    {yun:"四运",start:1924,end:1943,star:4,yuan:"中元"},
    {yun:"五运",start:1944,end:1963,star:5,yuan:"中元"},
    {yun:"六运",start:1964,end:1983,star:6,yuan:"中元"},
    {yun:"七运",start:1984,end:2003,star:7,yuan:"下元"},
    {yun:"八运",start:2004,end:2023,star:8,yuan:"下元"},
    {yun:"九运",start:2024,end:2043,star:9,yuan:"下元"}
    ];

    var WUGE={
    "天格":{desc:"姓氏笔画+1(单姓)或两姓笔画之和(复姓)",zhuguan:"祖上/长辈/先天运",importance:"一般"},
    "人格":{desc:"姓氏末字+名字首字笔画",zhuguan:"主运/性格/核心命运",importance:"最重要"},
    "地格":{desc:"名字笔画之和(单名+1)",zhuguan:"早年运/基础运",importance:"一般"},
    "总格":{desc:"姓名总笔画",zhuguan:"晚年运/总体命运",importance:"一般"},
    "外格":{desc:"总格-人格+1",zhuguan:"人际运/社交运",importance:"一般"}
    };

    var SHULI_81={
    1:"大吉",2:"凶",3:"大吉",4:"凶",5:"大吉",
    6:"大吉",7:"吉",8:"吉",9:"凶",10:"凶",
    11:"大吉",12:"凶",13:"大吉",14:"凶",15:"大吉",
    16:"大吉",17:"吉",18:"吉",19:"凶",20:"凶",
    21:"大吉",22:"凶",23:"大吉",24:"大吉",25:"吉",
    26:"凶",27:"吉",28:"凶",29:"吉",30:"凶",
    31:"大吉",32:"大吉",33:"大吉",34:"大凶",35:"吉",
    36:"凶",37:"吉",38:"吉",39:"吉",40:"凶",
    41:"大吉",42:"凶",43:"凶",44:"凶",45:"大吉",
    46:"凶",47:"大吉",48:"大吉",49:"凶",50:"凶",
    51:"吉",52:"大吉",53:"凶",54:"凶",55:"凶",
    56:"凶",57:"吉",58:"大吉",59:"凶",60:"凶",
    61:"大吉",62:"凶",63:"大吉",64:"凶",65:"大吉",
    66:"凶",67:"大吉",68:"大吉",69:"凶",70:"凶",
    71:"吉",72:"凶",73:"大吉",74:"凶",75:"吉",
    76:"凶",77:"吉",78:"凶",79:"凶",80:"吉",
    81:"大吉"
    };

    var CEZI_PIANPANG={
    "人(亻)":{wuxing:"金",desc:"主信义/仁慈"},
    "水(氵)":{wuxing:"水",desc:"主智慧/流动"},
    "火(灬)":{wuxing:"火",desc:"主礼节/热情"},
    "木":{wuxing:"木",desc:"主仁慈/成长"},
    "土":{wuxing:"土",desc:"主信实/厚重"},
    "金(钅)":{wuxing:"金",desc:"主刚毅/决断"},
    "日":{wuxing:"火",desc:"主光明/正气"},
    "月":{wuxing:"水",desc:"主阴柔/变化"},
    "山":{wuxing:"土",desc:"主稳固/阻碍"},
    "心(忄)":{wuxing:"火",desc:"主思考/情感"}
    };

    var WUXING_BIHUA={
    "木":[1,2,11,12,21,22,31,32,41,42,51,52],
    "火":[3,4,13,14,23,24,33,34,43,44,53,54],
    "土":[5,6,15,16,25,26,35,36,45,46,55,56],
    "金":[7,8,17,18,27,28,37,38,47,48,57,58],
    "水":[9,10,19,20,29,30,39,40,49,50,59,60]
    };

    var TAISUI={
    "子":{太岁:"甲子金辩",方位:"正北"},
    "丑":{太岁:"乙丑陈材",方位:"东北"},
    "寅":{太岁:"丙寅耿章",方位:"东北偏东"},
    "卯":{太岁:"丁卯沈兴",方位:"正东"},
    "辰":{太岁:"戊辰赵达",方位:"东南偏东"},
    "巳":{太岁:"己巳郭灿",方位:"东南偏南"},
    "午":{太岁:"庚午王清",方位:"正南"},
    "未":{太岁:"辛未李素",方位:"西南偏南"},
    "申":{太岁:"壬申刘旺",方位:"西南偏西"},
    "酉":{太岁:"癸酉康忠",方位:"正西"},
    "戌":{太岁:"甲戌誓广",方位:"西北偏西"},
    "亥":{太岁:"乙亥吴保",方位:"西北偏北"}
    };

    var WUXING_SHENG={金:"水",水:"木",木:"火",火:"土",土:"金"};
    var WUXING_KE={金:"木",木:"土",土:"水",水:"火",火:"金"};

    var SANSHA={
    "申":"南方(巳午未)","子":"南方(巳午未)","辰":"南方(巳午未)",
    "亥":"西方(申酉戌)","卯":"西方(申酉戌)","未":"西方(申酉戌)",
    "寅":"北方(亥子丑)","午":"北方(亥子丑)","戌":"北方(亥子丑)",
    "巳":"东方(寅卯辰)","酉":"东方(寅卯辰)","丑":"东方(寅卯辰)"
    };

    var FEIXING_POSITIONS=["中宫","乾(西北)","兑(正西)","艮(东北)","离(正南)","坎(正北)","坤(西南)","震(正东)","巽(东南)"];

    var LIU_CHONG={子:"午",丑:"未",寅:"申",卯:"酉",辰:"戌",巳:"亥",午:"子",未:"丑",申:"寅",酉:"卯",戌:"辰",亥:"巳"};
    var LIU_HE={子:"丑",丑:"子",寅:"亥",卯:"戌",辰:"酉",巳:"申",午:"未",未:"午",申:"巳",酉:"辰",戌:"卯",亥:"寅"};
    var XIANG_XING={
    "寅":["巳","申"],"巳":["寅","申"],"申":["寅","巳"],
    "丑":["戌","未"],"戌":["丑","未"],"未":["丑","戌"],
    "子":["卯"],"卯":["子"],
    "辰":["辰"],"午":["午"],"酉":["酉"],"亥":["亥"]
    };
    var XIANG_HAI={子:"未",丑:"午",寅:"巳",卯:"辰",申:"亥",酉:"戌",未:"子",午:"丑",巳:"寅",辰:"卯",亥:"申",戌:"酉"};

    // ============================================================
    // Part 2: 计算函数（从Python适配器移植）
    // ============================================================

    function solarToGanzhi(year,month,day){
        var baseDate=new Date(2024,0,1);
        var targetDate=new Date(year,month-1,day);
        var daysDiff=Math.round((targetDate-baseDate)/(1000*60*60*24));
        var dayIdx=((daysDiff%60)+60)%60;
        var dayGan=TIANGAN[dayIdx%10];
        var dayZhi=DIZHI[dayIdx%12];
        var yearZhi=DIZHI[((4+(year-2024))%12+12)%12];
        var yearGan=TIANGAN[((0+(year-2024))%10+10)%10];
        return{yearGz:yearGan+yearZhi,dayGz:dayGan+dayZhi};
    }

    function getXiaoliuren(month,day,hourZhiIdx){
        var monthPos=(month-1)%6;
        var dayPos=((monthPos+day-1)%6+6)%6;
        var hourPos=((dayPos+hourZhiIdx)%6+6)%6;
        return{month:XIAOLIUREN[monthPos],day:XIAOLIUREN[dayPos],hour:XIAOLIUREN[hourPos]};
    }

    function getCurrentYun(year){
        for(var i=0;i<SANYUAN_JIUYUN.length;i++){
            var yun=SANYUAN_JIUYUN[i];
            if(yun.start<=year&&yun.end>=year){return yun;}
        }
        return SANYUAN_JIUYUN[SANYUAN_JIUYUN.length-1];
    }

    function getAnnualStar(year){
        var yun=getCurrentYun(year);
        var yunStar=yun.star;
        var yearsIntoYun=year-yun.start;
        var centerStar=((yunStar-yearsIntoYun)%9+9)%9;
        if(centerStar===0){centerStar=9;}
        return centerStar;
    }

    // OPT1: 计算年度风水关键方位
    function calcFengshuiPositions(annualStar){
        var positions={};
        for(var i=0;i<FEIXING_POSITIONS.length;i++){
            var pos=FEIXING_POSITIONS[i];
            var star=((annualStar-1+i)%9+9)%9+1;
            if(star===5){positions["五黄方位"]=pos+"("+JIUGONG_FEIXING[5].name+"大煞)";}
            else if(star===2){positions["二黑方位"]=pos+"("+JIUGONG_FEIXING[2].name+"病符)";}
            else if(star===8){positions["财星方位"]=pos+"("+JIUGONG_FEIXING[8].name+"财运)";}
            else if(star===9){positions["喜星方位"]=pos+"("+JIUGONG_FEIXING[9].name+"喜庆)";}
            else if(star===4){positions["文昌方位"]=pos+"("+JIUGONG_FEIXING[4].name+"学业)";}
        }
        return positions;
    }

    // OPT4: 小六壬三宫五行生克分析
    function calcXiaoliurenShengke(xlrMonth,xlrDay,xlrHour){
        var wxM=xlrMonth.wuxing;
        var wxD=xlrDay.wuxing;
        var wxH=xlrHour.wuxing;
        function relation(a,b){
            if(a===b){return"比和";}
            if(WUXING_SHENG[a]===b){return"生(→)";}
            if(WUXING_SHENG[b]===a){return"被生(←)";}
            if(WUXING_KE[a]===b){return"克(→)";}
            if(WUXING_KE[b]===a){return"被克(←)";}
            return"无关系";
        }
        var relMd=relation(wxM,wxD);
        var relDh=relation(wxD,wxH);
        var shengCount=0,keCount=0;
        if(relMd.indexOf("生")>=0){shengCount++;}
        if(relMd.indexOf("克")>=0){keCount++;}
        if(relDh.indexOf("生")>=0){shengCount++;}
        if(relDh.indexOf("克")>=0){keCount++;}
        var trend;
        if(shengCount>=2){trend="顺畅(相生链强)";}
        else if(keCount>=2){trend="阻碍(相克链强)";}
        else if(shengCount>=1&&keCount>=1){trend="波折(生克并存)";}
        else{trend="平稳(关系中性)";}
        return{
            "月→日五行":wxM+"→"+wxD+"("+relMd+")",
            "日→时五行":wxD+"→"+wxH+"("+relDh+")",
            "三宫五行链":wxM+"→"+wxD+"→"+wxH,
            "生克趋势":trend,
            "生链数":shengCount,
            "克链数":keCount
        };
    }

    // OPT5: 太岁冲合刑害分析
    function calcTaisuiRelation(yearZhi,dayZhi){
        var relations=[];
        if(LIU_CHONG[yearZhi]===dayZhi){relations.push("冲(日支"+dayZhi+"冲太岁"+yearZhi+")");}
        if(LIU_HE[yearZhi]===dayZhi){relations.push("合(日支"+dayZhi+"合太岁"+yearZhi+")");}
        var xingList=XIANG_XING[yearZhi]||[];
        for(var i=0;i<xingList.length;i++){
            if(xingList[i]===dayZhi){relations.push("刑(日支"+dayZhi+"刑太岁"+yearZhi+")");break;}
        }
        if(XIANG_HAI[yearZhi]===dayZhi){relations.push("害(日支"+dayZhi+"害太岁"+yearZhi+")");}
        if(relations.length===0){relations.push("无特殊关系");}
        var hasChong=false,hasXing=false,hasHai=false,hasHe=false;
        for(var j=0;j<relations.length;j++){
            if(relations[j].indexOf("冲")>=0){hasChong=true;}
            if(relations[j].indexOf("刑")>=0){hasXing=true;}
            if(relations[j].indexOf("害")>=0){hasHai=true;}
            if(relations[j].indexOf("合")>=0){hasHe=true;}
        }
        var advice;
        if(hasChong){advice="日冲太岁，行事需谨慎";}
        else if(hasXing){advice="日刑太岁，注意纠纷";}
        else if(hasHai){advice="日害太岁，注意小人口舌";}
        else if(hasHe){advice="日合太岁，诸事顺遂";}
        else{advice="与太岁无冲合刑害，平稳";}
        return{"关系类型":relations.join("、"),"综合建议":advice};
    }

    // 辅助函数: 数理统计
    function countShuli(target){
        var count=0;
        for(var num=1;num<=81;num++){
            if(SHULI_81[num]===target){count++;}
        }
        return count;
    }

    // 辅助函数: 飞星标记
    function buildFeixingMarks(annualStar){
        var marks=[];
        for(var i=0;i<FEIXING_POSITIONS.length;i++){
            var pos=FEIXING_POSITIONS[i];
            var star=((annualStar-1+i)%9+9)%9+1;
            if(star===5){marks.push("⚠️五黄@"+pos);}
            else if(star===2){marks.push("⚠️二黑@"+pos);}
            else if(star===8){marks.push("💰财星@"+pos);}
            else if(star===9){marks.push("🎉喜星@"+pos);}
            else if(star===4){marks.push("📚文昌@"+pos);}
        }
        return marks.join(" · ");
    }

    // ============================================================
    // 主计算逻辑
    // ============================================================

    // 干支推算（优先使用options.ganzhi）
    var yearGz, dayGz, yearZhi, yearGan, dayZhi;
    if (options.ganzhi && options.ganzhi.yearGz) {
        yearGz = options.ganzhi.yearGz;
        yearGan = yearGz.charAt(0);
        yearZhi = yearGz.charAt(yearGz.length - 1);
        dayGz = options.ganzhi.dayGz || '';
        dayZhi = options.ganzhi.dayZhi || dayGz.charAt(dayGz.length - 1);
    } else {
        var gz = solarToGanzhi(year, month, day);
        yearGz = gz.yearGz;
        dayGz = gz.dayGz;
        yearZhi = yearGz.charAt(yearGz.length - 1);
        yearGan = yearGz.charAt(0);
        dayZhi = dayGz.charAt(dayGz.length - 1);
    }

    var hourZhiIdx = Math.floor(((hour % 24 + 1) / 2) % 12);
    var hourZhi = DIZHI[hourZhiIdx];

    // 小六壬
    var xlr = getXiaoliuren(month, day, hourZhiIdx);
    var xlrMonth = xlr.month, xlrDay = xlr.day, xlrHour = xlr.hour;

    // 飞星
    var currentYun = getCurrentYun(year);
    var annualStar = getAnnualStar(year);
    var taisui = TAISUI[yearZhi] || {太岁:"?", 方位:"?"};
    var yunStarInfo = JIUGONG_FEIXING[currentYun.star];

    // OPT1: 风水方位
    var fengshuiPos = calcFengshuiPositions(annualStar);
    var sansha = SANSHA[yearZhi] || "未知";

    // OPT4: 小六壬三宫生克
    var xlrShengke = calcXiaoliurenShengke(xlrMonth, xlrDay, xlrHour);

    // OPT5: 太岁冲合刑害
    var taisuiRel = calcTaisuiRelation(yearZhi, dayZhi);

    // 综合判断
    var jiCount = 0, xiongCount = 0;
    var arr = [xlrMonth, xlrDay, xlrHour];
    for (var i = 0; i < 3; i++) {
        if (arr[i].jixiong === "吉" || arr[i].jixiong === "大吉") jiCount++;
        if (arr[i].jixiong === "凶" || arr[i].jixiong === "大凶") xiongCount++;
    }
    var zongheJianyi;
    if (jiCount >= 2 && JIUGONG_FEIXING[annualStar].jixiong.indexOf("吉") >= 0) { zongheJianyi = "吉"; }
    else if (xiongCount >= 2) { zongheJianyi = "凶"; }
    else { zongheJianyi = "平"; }

    // ============================================================
    // 构建维度数据
    // ============================================================

    var dimensions = {};

    // L1 基础排盘 (12维)
    dimensions["年干支"] = yearGz;
    dimensions["日干支"] = dayGz;
    dimensions["年支"] = yearZhi;
    dimensions["年干"] = yearGan;
    dimensions["时支"] = hourZhi;
    dimensions["小六壬月宫"] = xlrMonth.name;
    dimensions["小六壬日宫"] = xlrDay.name;
    dimensions["小六壬时宫"] = xlrHour.name;
    dimensions["当前元运"] = currentYun.yun + "(" + currentYun.yuan + ")";
    dimensions["年飞星入中"] = annualStar + "(" + JIUGONG_FEIXING[annualStar].name + ")";
    dimensions["太岁"] = taisui["太岁"];
    dimensions["太岁方位"] = taisui["方位"];

    // L2 小六壬六宫 (6维)
    dimensions["小六壬_六宫全表"] = XIAOLIUREN;

    // L3 小六壬三宫排盘 (18维)
    dimensions["小六壬_月宫"] = xlrMonth.name;
    dimensions["小六壬_月宫五行"] = xlrMonth.wuxing;
    dimensions["小六壬_月宫吉凶"] = xlrMonth.jixiong;
    dimensions["小六壬_月宫描述"] = xlrMonth.desc;
    dimensions["小六壬_月宫象意"] = xlrMonth.xiang;
    dimensions["小六壬_月宫宜"] = xlrMonth.yi;
    dimensions["小六壬_月宫地支"] = xlrMonth.dizhi;
    dimensions["小六壬_日宫"] = xlrDay.name;
    dimensions["小六壬_日宫五行"] = xlrDay.wuxing;
    dimensions["小六壬_日宫吉凶"] = xlrDay.jixiong;
    dimensions["小六壬_日宫描述"] = xlrDay.desc;
    dimensions["小六壬_日宫象意"] = xlrDay.xiang;
    dimensions["小六壬_日宫宜"] = xlrDay.yi;
    dimensions["小六壬_日宫地支"] = xlrDay.dizhi;
    dimensions["小六壬_时宫"] = xlrHour.name;
    dimensions["小六壬_时宫五行"] = xlrHour.wuxing;
    dimensions["小六壬_时宫吉凶"] = xlrHour.jixiong;
    dimensions["小六壬_时宫描述"] = xlrHour.desc;
    dimensions["小六壬_时宫象意"] = xlrHour.xiang;
    dimensions["小六壬_时宫宜"] = xlrHour.yi;
    dimensions["小六壬_时宫地支"] = xlrHour.dizhi;

    // L4 九宫飞星九星 (9维)
    dimensions["九宫飞星_九星全表"] = JIUGONG_FEIXING;

    // L5 三元九运 (9维)
    dimensions["三元九运_全表"] = SANYUAN_JIUYUN;

    // L6 姓名学五格 (5维)
    dimensions["姓名学_五格全表"] = WUGE;

    // L7 81数理吉凶 (81维)
    dimensions["数理81_全表"] = SHULI_81;
    dimensions["数理81_大吉数"] = countShuli("大吉");
    dimensions["数理81_吉数"] = countShuli("吉");
    dimensions["数理81_凶数"] = countShuli("凶");
    dimensions["数理81_大凶数"] = countShuli("大凶");

    // L8 五行笔画对应 (5维)
    dimensions["五行笔画_全表"] = WUXING_BIHUA;

    // L9 测字术偏旁 (10维)
    dimensions["测字术_偏旁全表"] = CEZI_PIANPANG;

    // L10 太岁系统 (12维)
    dimensions["太岁_全表"] = TAISUI;

    // L11 年飞星九宫分布 (9维) - OPT3
    var feixingGrid = [];
    for (var i = 0; i < FEIXING_POSITIONS.length; i++) {
        var pos = FEIXING_POSITIONS[i];
        var star = ((annualStar - 1 + i) % 9 + 9) % 9 + 1;
        var starInfo = JIUGONG_FEIXING[star];
        var mark = "";
        if (star === 5) mark = "⚠️五黄大煞";
        else if (star === 2) mark = "⚠️二黑病符";
        else if (star === 8) mark = "💰财星";
        else if (star === 9) mark = "🎉喜星";
        else if (star === 4) mark = "📚文昌";
        feixingGrid.push({
            position: pos, star: star, name: starInfo.name,
            wuxing: starInfo.wuxing, jixiong: starInfo.jixiong,
            zhuguan: starInfo.zhuguan, mark: mark
        });
    }
    dimensions["年飞星_九宫分布"] = feixingGrid;

    // L12 元运分析 (8维)
    dimensions["元运_当前运"] = currentYun.yun;
    dimensions["元运_当前元"] = currentYun.yuan;
    dimensions["元运_运期"] = currentYun.start + "-" + currentYun.end;
    dimensions["元运_当运星"] = currentYun.star + "_" + yunStarInfo.name;
    dimensions["元运_运星五行"] = yunStarInfo.wuxing;
    dimensions["元运_运星吉凶"] = yunStarInfo.jixiong;
    dimensions["元运_运星主管"] = yunStarInfo.zhuguan;
    dimensions["元运_运星描述"] = yunStarInfo.desc;

    // L13 小六壬综合分析 (16维) - OPT4
    dimensions["小六壬_月宫吉凶"] = xlrMonth.jixiong;
    dimensions["小六壬_日宫吉凶"] = xlrDay.jixiong;
    dimensions["小六壬_时宫吉凶"] = xlrHour.jixiong;
    dimensions["小六壬_三宫五行"] = xlrMonth.wuxing + "-" + xlrDay.wuxing + "-" + xlrHour.wuxing;
    dimensions["小六壬_月宫象意"] = xlrMonth.xiang;
    dimensions["小六壬_日宫象意"] = xlrDay.xiang;
    dimensions["小六壬_时宫象意"] = xlrHour.xiang;
    dimensions["小六壬_综合吉凶"] = zongheJianyi;
    dimensions["小六壬_月宫宜"] = xlrMonth.yi;
    dimensions["小六壬_时宫宜"] = xlrHour.yi;
    dimensions["小六壬_月→日五行"] = xlrShengke["月→日五行"];
    dimensions["小六壬_日→时五行"] = xlrShengke["日→时五行"];
    dimensions["小六壬_三宫五行链"] = xlrShengke["三宫五行链"];
    dimensions["小六壬_生克趋势"] = xlrShengke["生克趋势"];
    dimensions["小六壬_生链数"] = xlrShengke["生链数"];
    dimensions["小六壬_克链数"] = xlrShengke["克链数"];

    // L14 年度风水 (10维) - OPT1
    dimensions["风水_年飞星"] = annualStar + "_" + JIUGONG_FEIXING[annualStar].name;
    dimensions["风水_入中五行"] = JIUGONG_FEIXING[annualStar].wuxing;
    dimensions["风水_入中吉凶"] = JIUGONG_FEIXING[annualStar].jixiong;
    dimensions["风水_太岁方位"] = taisui["方位"];
    dimensions["风水_三煞方位"] = sansha;
    dimensions["风水_五黄方位"] = fengshuiPos["五黄方位"] || "未知";
    dimensions["风水_二黑方位"] = fengshuiPos["二黑方位"] || "未知";
    dimensions["风水_财星方位"] = fengshuiPos["财星方位"] || "未知";
    dimensions["风水_喜星方位"] = fengshuiPos["喜星方位"] || "未知";
    dimensions["风水_文昌方位"] = fengshuiPos["文昌方位"] || "未知";
    dimensions["风水_飞星标记"] = buildFeixingMarks(annualStar);

    // L15 姓名学数理 (10维)
    dimensions["姓名学_天格含义"] = "祖上根基与先天禀赋";
    dimensions["姓名学_人格含义"] = "主运，一生核心命运";
    dimensions["姓名学_地格含义"] = "早年(36岁前)运势";
    dimensions["姓名学_总格含义"] = "晚年(36岁后)总体运势";
    dimensions["姓名学_外格含义"] = "人际关系与社交运";
    dimensions["姓名学_三才配置"] = "天/人/地三格五行相生相克";
    dimensions["姓名学_阴阳配置"] = "笔画奇偶阴阳平衡";
    dimensions["姓名学_五行补益"] = "通过姓名五行补八字所缺";
    dimensions["姓名学_数理吉凶"] = "81数理判断各格吉凶(OPT2已补全1-81)";
    dimensions["姓名学_喜用神配合"] = "姓名五行配合八字喜用神";

    // L16 综合术数信息 (10维)
    dimensions["综合_小六壬月宫"] = xlrMonth.name;
    dimensions["综合_小六壬日宫"] = xlrDay.name;
    dimensions["综合_小六壬时宫"] = xlrHour.name;
    dimensions["综合_年飞星"] = JIUGONG_FEIXING[annualStar].name;
    dimensions["综合_元运"] = currentYun.yun;
    dimensions["综合_太岁"] = taisui["太岁"];
    dimensions["综合_太岁方位"] = taisui["方位"];
    dimensions["综合_小六壬总评"] = "月" + xlrMonth.name + "→日" + xlrDay.name + "→时" + xlrHour.name;
    dimensions["综合_飞星总评"] = JIUGONG_FEIXING[annualStar].name + "入中(" + JIUGONG_FEIXING[annualStar].jixiong + ")";
    dimensions["综合_风水要点"] = currentYun.yun + "当令" + yunStarInfo.name + "(" + yunStarInfo.zhuguan + ")";

    // L17 盘面总评 (12维) - OPT5
    dimensions["总评_小六壬"] = "月" + xlrMonth.name + "日" + xlrDay.name + "时" + xlrHour.name;
    dimensions["总评_飞星"] = JIUGONG_FEIXING[annualStar].name + "入中-" + JIUGONG_FEIXING[annualStar].jixiong;
    dimensions["总评_元运"] = currentYun.yun + "-" + yunStarInfo.name + "(" + yunStarInfo.zhuguan + ")";
    dimensions["总评_太岁"] = taisui["太岁"] + "(" + taisui["方位"] + ")";
    dimensions["总评_吉宫数"] = jiCount;
    dimensions["总评_凶宫数"] = xiongCount;
    dimensions["总评_时宫吉凶"] = xlrHour.jixiong;
    dimensions["总评_飞星吉凶"] = JIUGONG_FEIXING[annualStar].jixiong;
    dimensions["总评_元运吉凶"] = yunStarInfo.jixiong;
    dimensions["总评_综合建议"] = zongheJianyi;
    dimensions["总评_太岁日支关系"] = taisuiRel["关系类型"];
    dimensions["总评_太岁建议"] = taisuiRel["综合建议"];

    return { dimensions: dimensions, name: "其他术数" };
};
