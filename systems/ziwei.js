/**
 * 紫微斗数 (Zi Wei Dou Shu) 标签生成模块
 * 从 ziwei.html 提取的纯计算逻辑
 * 17层 399维 + 5项优化 → 455维
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

    // ===== Part 1: 基础数据表 =====

    var TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    var ZHI_WUXING = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
    var GAN_WUXING = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
    var GAN_YINYANG = {'甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴'};

    var JIAZI = [];
    for (var i = 0; i < 60; i++) { JIAZI.push(TIANGAN[i%10] + DIZHI[i%12]); }

    var NAYIN_60 = [
        '海中金','海中金','炉中火','炉中火','大林木','大林木','路旁土','路旁土',
        '剑锋金','剑锋金','山头火','山头火','涧下水','涧下水','城墙土','城墙土',
        '白蜡金','白蜡金','杨柳木','杨柳木','井泉水','井泉水','屋上土','屋上土',
        '霹雳火','霹雳火','松柏木','松柏木','长流水','长流水','砂石金','砂石金',
        '山下火','山下火','平地木','平地木','壁上土','壁上土','金箔金','金箔金',
        '覆灯火','覆灯火','天河水','天河水','大驿土','大驿土','钗钏金','钗钏金',
        '桑柘木','桑柘木','大溪水','大溪水','沙中土','沙中土','天上火','天上火',
        '石榴木','石榴木','大海水','大海水'
    ];

    var NAYIN_WUXING_TO_JU = {'金':4,'木':3,'水':2,'火':6,'土':5};

    var JIEQI_APPROX = {1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7};

    var STARS_14 = {
        '紫微':{'wuxing':'阴土','huaqi':'尊','xixi':'领导型','star_system':'紫微星系','douxi':'北斗','alias':'帝星','core_trait':'尊贵领导大局观','strengths':'大局观强、组织力强、有责任感','weaknesses':'孤高、不善表达、独占性强','suitable':'管理者、官员、企业家','gan_zhi':'己土','classification':'领导型','palace_pref':'喜午丑未庙旺','anti':'忌空劫煞星冲照'},
        '天机':{'wuxing':'阴木','huaqi':'善','xixi':'分析型','star_system':'紫微星系','douxi':'南斗','alias':'谋星','core_trait':'智慧谋略机敏','strengths':'分析力强、善策划、应变灵活','weaknesses':'多虑、易动摇、想太多不行动','suitable':'策划、咨询、研究、写作','gan_zhi':'乙木','classification':'分析型','palace_pref':'喜子午卯酉庙旺','anti':'忌煞星、驿马过重'},
        '太阳':{'wuxing':'阳火','huaqi':'贵','xixi':'分析型','star_system':'紫微星系','douxi':'中天','alias':'官禄主','core_trait':'光明博爱付出','strengths':'开朗、有威严、照顾他人','weaknesses':'操劳过度、易被人利用','suitable':'管理者、公关、教育、政治','gan_zhi':'丙火','classification':'分析型','palace_pref':'喜卯辰巳午庙旺、昼生','anti':'忌夜生、煞星'},
        '武曲':{'wuxing':'阴金','huaqi':'财','xixi':'领导型','star_system':'紫微星系','douxi':'北斗','alias':'财星','core_trait':'刚毅果断执行','strengths':'理财能力强、决策果断、执行力强','weaknesses':'刚硬、不善变通、人情淡薄','suitable':'金融、财务、技术、武职','gan_zhi':'辛金','classification':'领导型','palace_pref':'喜辰戌丑未庙旺','anti':'忌火铃羊陀'},
        '天同':{'wuxing':'阳水','huaqi':'福','xixi':'支援型','star_system':'紫微星系','douxi':'南斗','alias':'福星','core_trait':'温和福气享福','strengths':'人缘好、随和、不与人争','weaknesses':'被动、缺乏斗志、易懒散','suitable':'服务、福利、文化、艺术','gan_zhi':'壬水','classification':'支援型','palace_pref':'喜巳亥申子庙旺','anti':'忌煞星空劫'},
        '廉贞':{'wuxing':'阴火','huaqi':'囚','xixi':'分析型','star_system':'紫微星系','douxi':'北斗','alias':'囚星','core_trait':'原则桃花复杂','strengths':'有手腕、有人脉、果断','weaknesses':'感情复杂、桃花纠纷、情绪化','suitable':'政治、外交、销售、艺术','gan_zhi':'丁火','classification':'分析型','palace_pref':'喜申辰戌丑未庙旺','anti':'忌煞星+桃花混杂'},
        '天府':{'wuxing':'阳土','huaqi':'权','xixi':'领导型','star_system':'天府星系','douxi':'南斗','alias':'库星','core_trait':'财富稳定保守','strengths':'理财能力强、生活稳定','weaknesses':'过于保守、缺乏创新','suitable':'金融、行政、企业管理','gan_zhi':'戊土','classification':'领导型','palace_pref':'喜卯酉寅辰戌丑未庙旺','anti':'忌空劫煞星'},
        '太阴':{'wuxing':'阴水','huaqi':'富','xixi':'支援型','star_system':'天府星系','douxi':'中天','alias':'富星','core_trait':'细腻感性财富','strengths':'有理财天赋、善于持家','weaknesses':'易多愁善感、消极','suitable':'财务、文秘、艺术、服务','gan_zhi':'癸水','classification':'支援型','palace_pref':'喜酉戌亥子丑寅庙旺、夜生','anti':'忌昼生、煞星'},
        '贪狼':{'wuxing':'阳木','huaqi':'桃花','xixi':'支援型','star_system':'天府星系','douxi':'北斗','alias':'桃花星','core_trait':'多才欲望交际','strengths':'才华横溢、灵活多变','weaknesses':'多欲、桃花纠纷、难专注','suitable':'艺术、销售、社交、演艺','gan_zhi':'甲木','classification':'支援型','palace_pref':'喜辰戌丑未庙旺','anti':'忌煞星空劫'},
        '巨门':{'wuxing':'阴水','huaqi':'暗','xixi':'分析型','star_system':'天府星系','douxi':'北斗','alias':'暗星','core_trait':'口才争议研究','strengths':'口才好、分析力强、有研究精神','weaknesses':'多嘴、易与人争、口舌是非多','suitable':'教师、律师、辩论、写作','gan_zhi':'癸水','classification':'分析型','palace_pref':'喜卯酉寅申子午庙旺','anti':'忌煞星阴煞'},
        '天相':{'wuxing':'阴水','huaqi':'印','xixi':'领导型','star_system':'天府星系','douxi':'南斗','alias':'印星','core_trait':'调和辅助协调','strengths':'善于协调、人缘好','weaknesses':'依赖性强、缺乏主见','suitable':'行政、秘书、协调、咨询','gan_zhi':'壬水','classification':'领导型','palace_pref':'喜子午丑寅申庙旺','anti':'忌煞星冲破'},
        '天梁':{'wuxing':'阳土','huaqi':'荫','xixi':'支援型','star_system':'天府星系','douxi':'南斗','alias':'荫星','core_trait':'保护长辈荫庇','strengths':'有长者缘、能遇贵人','weaknesses':'固执、爱管闲事','suitable':'管理、教师、长辈型工作','gan_zhi':'戊土','classification':'支援型','palace_pref':'喜子午卯酉寅辰戌丑未庙旺','anti':'忌煞星阴煞'},
        '七杀':{'wuxing':'阴金','huaqi':'将','xixi':'领导型','star_system':'天府星系','douxi':'北斗','alias':'将星','core_trait':'刚毅果断孤傲','strengths':'决策果断、执行力强、敢于开拓','weaknesses':'性情刚硬、易得罪人、孤独','suitable':'军警、创业、外科、运动员','gan_zhi':'庚金','classification':'领导型','palace_pref':'喜寅申辰戌丑未庙旺','anti':'忌煞星重重'},
        '破军':{'wuxing':'阴水','huaqi':'耗','xixi':'领导型','star_system':'天府星系','douxi':'北斗','alias':'耗星','core_trait':'破坏开创变革','strengths':'敢于创新、有魄力','weaknesses':'不稳定、易大起大落、人际关系动荡','suitable':'创业、变革型工作、自由职业','gan_zhi':'壬水','classification':'领导型','palace_pref':'喜子午辰戌丑未庙旺','anti':'忌空劫煞星'}
    };

    var MIAO_WANG_TABLE = {
        '紫微':{'午':'庙','丑':'庙','未':'庙','卯':'旺','酉':'旺','寅':'旺','申':'旺','巳':'旺','亥':'旺','辰':'闲','戌':'闲','子':'平'},
        '天机':{'子':'庙','午':'庙','卯':'旺','酉':'旺','寅':'得','申':'得','辰':'平','戌':'平','巳':'平','亥':'平','丑':'陷','未':'陷'},
        '太阳':{'卯':'庙','辰':'庙','巳':'庙','午':'庙','寅':'旺','未':'得','申':'利','酉':'平','戌':'陷','亥':'陷','子':'陷','丑':'陷'},
        '武曲':{'辰':'庙','戌':'庙','丑':'庙','未':'庙','子':'旺','午':'旺','寅':'得','申':'得','卯':'利','酉':'利','巳':'陷','亥':'陷'},
        '天同':{'巳':'庙','亥':'庙','子':'旺','申':'旺','寅':'得','卯':'平','酉':'平','辰':'平','戌':'平','丑':'陷','未':'陷','午':'陷'},
        '廉贞':{'申':'庙','辰':'庙','戌':'庙','丑':'庙','未':'庙','子':'得','午':'得','卯':'得','酉':'得','寅':'得','巳':'陷','亥':'陷'},
        '天府':{'卯':'庙','酉':'庙','寅':'庙','辰':'庙','戌':'庙','丑':'庙','未':'庙','子':'旺','午':'旺','申':'得','巳':'得','亥':'得'},
        '太阴':{'酉':'庙','戌':'庙','亥':'庙','子':'庙','丑':'庙','寅':'庙','未':'旺','申':'旺','卯':'陷','辰':'陷','巳':'陷','午':'陷'},
        '贪狼':{'辰':'庙','戌':'庙','丑':'庙','未':'庙','子':'旺','午':'旺','卯':'得','酉':'得','寅':'平','申':'平','巳':'陷','亥':'陷'},
        '巨门':{'卯':'庙','酉':'庙','寅':'庙','申':'庙','子':'旺','午':'旺','巳':'旺','亥':'旺','辰':'平','戌':'平','丑':'陷','未':'陷'},
        '天相':{'子':'庙','午':'庙','丑':'庙','寅':'庙','申':'庙','巳':'旺','亥':'旺','未':'得','辰':'平','戌':'平','卯':'陷','酉':'陷'},
        '天梁':{'子':'庙','午':'庙','卯':'庙','酉':'庙','寅':'庙','辰':'庙','戌':'庙','丑':'庙','未':'庙','申':'旺','巳':'旺','亥':'旺'},
        '七杀':{'寅':'庙','申':'庙','辰':'庙','戌':'庙','丑':'庙','未':'庙','子':'旺','午':'旺','卯':'旺','酉':'旺','巳':'陷','亥':'陷'},
        '破军':{'子':'庙','午':'庙','辰':'旺','戌':'旺','丑':'旺','未':'旺','寅':'得','申':'得','巳':'陷','亥':'陷','卯':'陷','酉':'陷'}
    };

    var SIHUA_TABLE = {
        '甲':{'禄':'廉贞','权':'破军','科':'武曲','忌':'太阳'},
        '乙':{'禄':'天机','权':'天梁','科':'紫微','忌':'太阴'},
        '丙':{'禄':'天同','权':'天机','科':'文昌','忌':'廉贞'},
        '丁':{'禄':'太阴','权':'天同','科':'天机','忌':'巨门'},
        '戊':{'禄':'贪狼','权':'太阴','科':'右弼','忌':'天机'},
        '己':{'禄':'武曲','权':'贪狼','科':'天梁','忌':'文曲'},
        '庚':{'禄':'太阳','权':'武曲','科':'太阴','忌':'天同'},
        '辛':{'禄':'巨门','权':'太阳','科':'文曲','忌':'文昌'},
        '壬':{'禄':'天梁','权':'紫微','科':'左辅','忌':'武曲'},
        '癸':{'禄':'破军','权':'巨门','科':'太阴','忌':'贪狼'}
    };

    var LUCUN_TABLE = {'甲':2,'乙':3,'丙':5,'丁':6,'戊':5,'己':6,'庚':8,'辛':9,'壬':11,'癸':0};

    var KUI_YUE_TABLE = {
        '甲':{'魁':1,'钺':7},'戊':{'魁':1,'钺':7},'庚':{'魁':1,'钺':7},
        '乙':{'魁':0,'钺':8},'己':{'魁':0,'钺':8},
        '丙':{'魁':11,'钺':9},'丁':{'魁':11,'钺':9},
        '辛':{'魁':6,'钺':2},
        '壬':{'魁':3,'钺':5},'癸':{'魁':3,'钺':5}
    };

    var YIJI_STARS = [
        ['天官','官贵'],['天福','福气'],['天厨','食禄'],
        ['天刑','刑伤'],['天姚','桃花'],['解神','化解'],
        ['天巫','玄学'],['天月','疾病'],['阴煞','阴邪'],
        ['台辅','辅佐'],['封诰','封赏'],['天哭','悲伤'],
        ['天虚','空虚'],['龙池','才艺'],['凤阁','才艺'],
        ['红鸾','婚恋'],['天喜','喜庆'],['孤辰','孤独'],
        ['寡宿','孤独'],['蜚廉','是非'],['破碎','破耗'],
        ['华盖','孤高'],['咸池','桃花'],['天德','贵人'],
        ['月德','贵人'],['天才','才智'],['天寿','寿命'],
        ['三台','贵助'],['八座','贵助']
    ];

    var ZIWEI_SYSTEM_OFFSETS = {'紫微':0,'天机':-1,'太阳':-3,'武曲':-4,'天同':-5,'廉贞':-7};
    var TIANFU_SYSTEM_OFFSETS = {'天府':0,'太阴':1,'贪狼':2,'巨门':3,'天相':4,'天梁':5,'七杀':6,'破军':10};

    var PALACES = ['命宫','兄弟宫','夫妻宫','子女宫','财帛宫','疾厄宫','迁移宫','交友宫','官禄宫','田宅宫','福德宫','父母宫'];
    var OPPOSITE_PALACE = {0:6,1:7,2:8,3:9,4:10,5:11,6:0,7:1,8:2,9:3,10:4,11:5};
    var SANHE_PALACES = {
        0:[4,8],1:[5,9],2:[6,10],3:[7,11],
        4:[0,8],5:[1,9],6:[2,10],7:[3,11],
        8:[0,4],9:[1,5],10:[2,6],11:[3,7]
    };

    var WU_HU_DUN = {'甲':0,'乙':2,'丙':4,'丁':6,'戊':8,'己':0,'庚':2,'辛':4,'壬':6,'癸':8};
    var WU_SHU_DUN = {'甲':0,'乙':2,'丙':4,'丁':6,'戊':8,'己':0,'庚':2,'辛':4,'壬':6,'癸':8};

    var GEJU_DEFINITIONS = [
        {name:'极向离明格',type:'贵格',desc:'紫微在午宫坐命，无煞而有吉星守照'},
        {name:'君臣庆会格',type:'贵格',desc:'紫微坐命，左右魁钺昌曲等吉星会照'},
        {name:'紫府同宫格',type:'贵格',desc:'紫微天府在寅申同宫坐命'},
        {name:'紫府朝垣格',type:'贵格',desc:'紫微天府三方四正照命'},
        {name:'机巨同临格',type:'贵格',desc:'天机巨门在卯宫坐命'},
        {name:'机月同梁格',type:'贵格',desc:'天机太阴天同天梁在三方四正交会'},
        {name:'善荫朝纲格',type:'贵格',desc:'天机天梁在辰戌守命'},
        {name:'日照雷门格',type:'贵格',desc:'太阳天梁在卯宫守命，白天生人'},
        {name:'金灿光辉格',type:'贵格',desc:'太阳在午宫守命'},
        {name:'日月并明格',type:'贵格',desc:'太阳在辰巳太阴在酉戌皆旺'},
        {name:'明珠出海格',type:'贵格',desc:'太阳在辰太阴在戌对照'},
        {name:'月朗天门格',type:'贵格',desc:'太阴在亥宫坐命，夜生人'},
        {name:'月生沧海格',type:'富格',desc:'太阴在子宫守田宅宫'},
        {name:'府相朝垣格',type:'贵格',desc:'天府天相在三方拱合命宫'},
        {name:'将星得地格',type:'贵格',desc:'武曲庙旺坐命，有吉星加会'},
        {name:'武贪同行格',type:'贵格',desc:'武曲贪狼同宫或对照坐命'},
        {name:'火贪格',type:'富格',desc:'火星贪狼同宫坐命，有禄存化禄'},
        {name:'七杀朝斗格',type:'贵格',desc:'七杀在寅申坐命，紫微在对宫'},
        {name:'石中隐玉格',type:'贵格',desc:'巨门在子午坐命，有科权禄照会'},
        {name:'三奇嘉会格',type:'贵格',desc:'化禄化权化科俱在三方四正'},
        {name:'双禄交流格',type:'富格',desc:'禄存和化禄俱在三方四正'},
        {name:'权禄巡逢格',type:'贵格',desc:'化禄和化权俱在三方四正'},
        {name:'文星拱命格',type:'贵格',desc:'文昌文曲俱在三方四正'},
        {name:'坐贵向贵格',type:'贵格',desc:'天魁坐命天钺在对宫或反之'},
        {name:'天乙拱命格',type:'贵格',desc:'天魁天钺俱在三方四正'},
        {name:'日月夹命格',type:'贵格',desc:'太阳太阴在命宫邻宫相夹'},
        {name:'左右夹命格',type:'贵格',desc:'左辅右弼在命宫邻宫相夹'},
        {name:'昌曲夹命格',type:'贵格',desc:'文昌文曲在命宫邻宫相夹'},
        {name:'擎羊入庙格',type:'武贵格',desc:'擎羊坐命于丑辰未戌'},
        {name:'贪武同行格',type:'贵格',desc:'武曲贪狼在辰戌丑未同宫坐命'}
    ];

    var STAR_COMBINATIONS = [
        {name:'杀破狼',stars:['七杀','破军','贪狼'],desc:'三合相聚，开创力强，人生变动多'},
        {name:'紫府',stars:['紫微','天府'],desc:'权威与守成并重，管理力强'},
        {name:'机月同梁',stars:['天机','太阴','天同','天梁'],desc:'宜幕僚、专业工作'},
        {name:'日月',stars:['太阳','太阴'],desc:'光明与柔美并济'},
        {name:'武贪',stars:['武曲','贪狼'],desc:'务实与才艺并存'},
        {name:'府相',stars:['天府','天相'],desc:'财库与印信相辅'},
        {name:'巨日',stars:['巨门','太阳'],desc:'表达力强，须防口舌'},
        {name:'机巨',stars:['天机','巨门'],desc:'智慧与口才并重'},
        {name:'阳梁',stars:['太阳','天梁'],desc:'贵人与荫庇'},
        {name:'同梁',stars:['天同','天梁'],desc:'福气与荫助'},
        {name:'廉杀',stars:['廉贞','七杀'],desc:'变革动荡，破旧立新'},
        {name:'廉贪',stars:['廉贞','贪狼'],desc:'桃花与欲望交织'},
        {name:'武杀',stars:['武曲','七杀'],desc:'刚毅果断，事业心强'},
        {name:'武破',stars:['武曲','破军'],desc:'破旧立新，财源变动'},
        {name:'紫杀',stars:['紫微','七杀'],desc:'权威与决断'}
    ];

    // ===== Part 2: 计算函数 =====

    function mod(n, m) { return ((n % m) + m) % m; }

    function solarToBazi(year, month, day, hour, minute) {
        var yearGanIdx = mod(year - 4, 10);
        var yearZhiIdx = mod(year - 4, 12);
        var yearGan = TIANGAN[yearGanIdx];
        var yearZhi = DIZHI[yearZhiIdx];
        var monthZhiIdx = ((month + 9) % 12) + 2;
        if (monthZhiIdx >= 12) monthZhiIdx -= 12;
        var monthZhi = DIZHI[monthZhiIdx];
        var startGan = WU_HU_DUN[yearGan];
        var monthGanIdx = mod(startGan + monthZhiIdx - 2, 10);
        var monthGan = TIANGAN[monthGanIdx];
        var baseDate = new Date(2000, 0, 7);
        var targetDate = new Date(year, month - 1, day);
        var dayDiff = Math.round((targetDate.getTime() - baseDate.getTime()) / 86400000);
        var dayIdx = mod(dayDiff + 54, 60);
        var dayGan = TIANGAN[dayIdx % 10];
        var dayZhi = DIZHI[dayIdx % 12];
        var timeZhiIdx = Math.floor((hour * 2 + (minute >= 30 ? 1 : 0)) / 2);
        if (timeZhiIdx >= 12) timeZhiIdx -= 12;
        if (timeZhiIdx === 0 && hour < 1) timeZhiIdx = 0;
        var timeZhi = DIZHI[timeZhiIdx];
        var startShi = WU_SHU_DUN[dayGan];
        var timeGanIdx = mod(startShi + timeZhiIdx, 10);
        var timeGan = TIANGAN[timeGanIdx];
        return {year_gan:yearGan,year_zhi:yearZhi,year_gan_idx:yearGanIdx,year_zhi_idx:yearZhiIdx,
            month_gan:monthGan,month_zhi:monthZhi,month_zhi_idx:monthZhiIdx,
            day_gan:dayGan,day_zhi:dayZhi,day_idx:dayIdx,
            time_gan:timeGan,time_zhi:timeZhi,time_zhi_idx:timeZhiIdx};
    }

    function solarToLunarApprox(year, month, day) {
        var lunarMonth = month;
        var lunarDay = day;
        if (month === 1 || (month === 2 && day < 17)) {
            lunarMonth = (month === 1) ? 12 : 1;
            lunarDay = (month === 1) ? (day + 15) : day;
        }
        if (lunarMonth < 1) lunarMonth = 1;
        if (lunarMonth > 12) lunarMonth = 12;
        if (lunarDay < 1) lunarDay = 1;
        if (lunarDay > 30) lunarDay = 30;
        return [lunarMonth, lunarDay];
    }

    function getMingGong(lunarMonth, timeZhiIdx) { return mod(2 + (lunarMonth - 1) - timeZhiIdx, 12); }
    function getShenGong(lunarMonth, timeZhiIdx) { return mod(2 + (lunarMonth - 1) + timeZhiIdx, 12); }

    function getMingGongGan(yearGan, mingGongZhiIdx) {
        var startGan = WU_HU_DUN[yearGan];
        var ganIdx = mod(startGan + mingGongZhiIdx - 2, 10);
        return TIANGAN[ganIdx];
    }

    function getWuxingJu(mingGongGan, mingGongZhi) {
        var ganIdx = TIANGAN.indexOf(mingGongGan);
        var zhiIdx = DIZHI.indexOf(mingGongZhi);
        var jiaziIdx = mod(ganIdx * 12 + zhiIdx, 60);
        for (var i = 0; i < 60; i++) { if (JIAZI[i] === mingGongGan + mingGongZhi) { jiaziIdx = i; break; } }
        var nayin = NAYIN_60[jiaziIdx];
        var nayinWuxing = nayin.charAt(nayin.length - 1);
        var ju = NAYIN_WUXING_TO_JU[nayinWuxing] || 2;
        return [ju, nayin];
    }

    function getZiweiPos(ju, lunarDay) {
        var shang = Math.floor(lunarDay / ju);
        var yu = lunarDay % ju;
        var pos;
        if (yu === 0) { pos = mod(1 + (shang - 1), 12); }
        else { pos = mod(1 + shang, 12); if ((shang + yu) % 2 === 1) { pos = mod(pos - 1, 12); } else { pos = mod(pos + 1, 12); } }
        return pos;
    }

    function getZiweiPosCorrected(ju, lunarDay) {
        if (ju < 2 || ju > 6) return 0;
        if (lunarDay < 1) lunarDay = 1;
        if (lunarDay > 30) lunarDay = 30;
        var shang = Math.floor(lunarDay / ju);
        var yu = lunarDay % ju;
        var pos;
        if (yu === 0) { if (shang === 1) { pos = 1; } else { pos = mod(2 + shang - 1, 12); } }
        else {
            var x = ju - yu;
            var y = Math.floor((lunarDay + x) / ju);
            if (x % 2 === 0) { pos = mod(2 + y + x - 1, 12); }
            else { var steps = y - x; if (steps <= 0) { pos = mod(2 + steps, 12); } else { pos = mod(2 + steps - 1, 12); } }
        }
        return mod(pos, 12);
    }

    function placeAll14Stars(ziweiPos) {
        var starPositions = {};
        for (var star in ZIWEI_SYSTEM_OFFSETS) { if (ZIWEI_SYSTEM_OFFSETS.hasOwnProperty(star)) { starPositions[star] = mod(ziweiPos + ZIWEI_SYSTEM_OFFSETS[star], 12); } }
        var tianfuPos = mod(12 - ziweiPos, 12);
        if (tianfuPos === 12) tianfuPos = 0;
        for (var star2 in TIANFU_SYSTEM_OFFSETS) { if (TIANFU_SYSTEM_OFFSETS.hasOwnProperty(star2)) { starPositions[star2] = mod(tianfuPos + TIANFU_SYSTEM_OFFSETS[star2], 12); } }
        return { positions: starPositions, tianfuPos: tianfuPos };
    }

    function getSihua(yearGan) { return SIHUA_TABLE[yearGan] || {}; }
    function getLucun(yearGan) { return LUCUN_TABLE[yearGan] || 0; }
    function getQingyangTuoluo(lucunPos) { return [mod(lucunPos + 1, 12), mod(lucunPos - 1, 12)]; }
    function getKuiYue(yearGan) { return KUI_YUE_TABLE[yearGan] || {魁:0, 钺:0}; }
    function getZuofuYoubi(lunarMonth) { return [mod(4 + lunarMonth - 1, 12), mod(10 - (lunarMonth - 1), 12)]; }
    function getWenchangWenqu(timeZhiIdx) { return [mod(10 - timeZhiIdx, 12), mod(4 + timeZhiIdx, 12)]; }
    function getDikongDijie(timeZhiIdx) { return [mod(11 + timeZhiIdx, 12), mod(11 - timeZhiIdx, 12)]; }

    function getHuoxingLingxing(yearZhiIdx, timeZhiIdx) {
        var sanheGroups = [[2,6,10],[8,0,4],[5,9,1],[11,3,7]];
        var startsHuo = [1,2,3,3];
        var startsLing = [10,11,0,0];
        for (var i = 0; i < sanheGroups.length; i++) {
            if (sanheGroups[i].indexOf(yearZhiIdx) >= 0) { return [mod(startsHuo[i] - timeZhiIdx, 12), mod(startsLing[i] - timeZhiIdx, 12)]; }
        }
        return [0, 0];
    }

    function getTianma(yearZhiIdx) {
        var sanheGroups = [[2,6,10],[8,0,4],[5,9,1],[11,3,7]];
        var targets = [8,2,11,5];
        for (var i = 0; i < sanheGroups.length; i++) { if (sanheGroups[i].indexOf(yearZhiIdx) >= 0) return targets[i]; }
        return 0;
    }

    function getMiaoWang(star, palaceZhiIdx) {
        var zhi = DIZHI[palaceZhiIdx];
        var table = MIAO_WANG_TABLE[star] || {};
        return table[zhi] || '平';
    }

    function getPalaceStars(starPositions, palaceIdx) {
        var result = [];
        for (var s in starPositions) { if (starPositions.hasOwnProperty(s) && starPositions[s] === palaceIdx) { result.push(s); } }
        return result;
    }

    function getSanheSizhengStars(starPositions, palaceIdx) {
        var sanhe = SANHE_PALACES[palaceIdx];
        var opposite = OPPOSITE_PALACE[palaceIdx];
        var allPalaces = [palaceIdx].concat(sanhe).concat([opposite]);
        var stars = {};
        for (var s in starPositions) { if (starPositions.hasOwnProperty(s) && allPalaces.indexOf(starPositions[s]) >= 0) { stars[s] = starPositions[s]; } }
        return stars;
    }

    function arrangeYijiStarsCorrectly(yearZhiIdx, lunarMonth, timeZhiIdx, mingGongIdx) {
        var positions = {};
        positions['红鸾'] = mod(3 - yearZhiIdx, 12);
        positions['天喜'] = mod(positions['红鸾'] + 6, 12);
        positions['天刑'] = mod(9 + lunarMonth - 1, 12);
        positions['天姚'] = mod(positions['天刑'] + 4, 12);
        positions['华盖'] = mod(4 + yearZhiIdx, 12);
        positions['龙池'] = mod(4 + yearZhiIdx, 12);
        positions['凤阁'] = mod(10 - yearZhiIdx, 12);
        var guchengMap = {0:3,4:3,8:3,2:9,6:9,10:9,5:1,9:1,1:1,11:7,3:7,7:7};
        positions['孤辰'] = guchengMap[yearZhiIdx] || 0;
        var guasuMap = {0:5,4:5,8:5,2:11,6:11,10:11,5:7,9:7,1:7,11:3,3:3,7:3};
        positions['寡宿'] = guasuMap[yearZhiIdx] || 0;
        positions['天哭'] = mod(6 - yearZhiIdx, 12);
        positions['天虚'] = mod(6 + yearZhiIdx, 12);
        var xianchiMap = {0:8,4:8,8:8,2:3,6:3,10:3,5:0,9:0,1:0,11:6,3:6,7:6};
        positions['咸池'] = xianchiMap[yearZhiIdx] || 0;
        positions['解神'] = mod(10 - (lunarMonth - 1), 12);
        var tianwuMonths = [5,8,11,2,5,8,11,2,5,8,11,2];
        positions['天巫'] = tianwuMonths[(lunarMonth - 1) % 12];
        var tianyueMonths = [10,5,4,2,7,3,11,7,2,6,10,2];
        positions['天月'] = tianyueMonths[(lunarMonth - 1) % 12];
        positions['阴煞'] = mod(2 - (lunarMonth - 1), 12);
        positions['台辅'] = mod(6 + timeZhiIdx, 12);
        positions['封诰'] = mod(2 + timeZhiIdx, 12);
        positions['天才'] = mingGongIdx;
        positions['天寿'] = mod(mingGongIdx + yearZhiIdx, 12);
        var zuofuYoubi = getZuofuYoubi(lunarMonth);
        positions['三台'] = mod(zuofuYoubi[0] + timeZhiIdx, 12);
        positions['八座'] = mod(zuofuYoubi[1] - timeZhiIdx, 12);
        positions['天德'] = mod(9 + yearZhiIdx, 12);
        positions['月德'] = mod(5 + yearZhiIdx, 12);
        var posuiMap = {0:8,4:8,8:8,2:3,6:3,10:3,5:0,9:0,1:0,11:6,3:6,7:6};
        positions['破碎'] = posuiMap[yearZhiIdx] || 0;
        var feilianMap = {0:8,1:9,2:10,3:11,4:0,5:1,6:2,7:3,8:4,9:5,10:6,11:7};
        positions['蜚廉'] = feilianMap[yearZhiIdx] || 0;
        return positions;
    }

    function getYijiPositionsWithGan(yearGan, yearZhiIdx, lunarMonth, timeZhiIdx, mingGongIdx) {
        var positions = arrangeYijiStarsCorrectly(yearZhiIdx, lunarMonth, timeZhiIdx, mingGongIdx);
        var tianguan = {'甲':7,'乙':5,'丙':5,'丁':2,'戊':9,'己':9,'庚':11,'辛':7,'壬':1,'癸':9};
        positions['天官'] = tianguan[yearGan] || 0;
        var tianfu = {'甲':9,'乙':3,'丙':11,'丁':2,'戊':3,'己':7,'庚':5,'辛':6,'壬':11,'癸':5};
        positions['天福'] = tianfu[yearGan] || 0;
        var tianchu = {'甲':5,'乙':6,'丙':5,'丁':7,'戊':8,'己':9,'庚':11,'辛':0,'壬':2,'癸':3};
        positions['天厨'] = tianchu[yearGan] || 0;
        return positions;
    }

    function calcDaxianWithJu(mingGongIdx, yearGan, gender, ju) {
        var isYangGan = ['甲','丙','戊','庚','壬'].indexOf(yearGan) >= 0;
        var isMale = gender === 'male';
        var direction = ((isYangGan && isMale) || (!isYangGan && !isMale)) ? 1 : -1;
        var startAge = ju;
        var daxianList = [];
        for (var i = 0; i < 12; i++) {
            var daxianIdx = mod(mingGongIdx + direction * i, 12);
            var ageStart = startAge + i * 10;
            var ageEnd = ageStart + 9;
            daxianList.push({idx:daxianIdx, age_range:ageStart + '-' + ageEnd + '岁', palace:PALACES[mod(daxianIdx - mingGongIdx, 12)]});
        }
        return daxianList;
    }

    function calcLiunianExtended(year, mingGongIdx, starPositions) {
        var currentZhiIdx = mod(year - 4, 12);
        var currentGanIdx = mod(year - 4, 10);
        var currentGan = TIANGAN[currentGanIdx];
        var currentZhi = DIZHI[currentZhiIdx];
        var liunianMinggong = currentZhiIdx;
        var liunianSihua = SIHUA_TABLE[currentGan] || {};
        var sihuaLuogong = {};
        for (var huaType in liunianSihua) {
            if (liunianSihua.hasOwnProperty(huaType)) {
                var star = liunianSihua[huaType];
                var pos = starPositions[star] || 0;
                var palaceName = PALACES[mod(pos - mingGongIdx, 12)];
                sihuaLuogong['化' + huaType] = {star:star, palace:DIZHI[pos] + '宫(' + palaceName + ')', liunian_palace:PALACES[mod(pos - liunianMinggong, 12)]};
            }
        }
        var liunianPalaces = {};
        for (var i = 0; i < PALACES.length; i++) { var palaceIdx = mod(liunianMinggong + i, 12); liunianPalaces[PALACES[i]] = DIZHI[palaceIdx] + '宫'; }
        var palacesStr = [];
        for (var k in liunianPalaces) { if (liunianPalaces.hasOwnProperty(k)) palacesStr.push(k + ':' + liunianPalaces[k]); }
        return {
            '流年干支': currentGan + currentZhi,
            '流年命宫': currentZhi + '宫',
            '流年命宫地支': currentZhi,
            '流年化禄': liunianSihua['禄'] || '',
            '流年化权': liunianSihua['权'] || '',
            '流年化科': liunianSihua['科'] || '',
            '流年化忌': liunianSihua['忌'] || '',
            '化禄落宫': (sihuaLuogong['化禄'] || {}).palace || '',
            '化权落宫': (sihuaLuogong['化权'] || {}).palace || '',
            '化科落宫': (sihuaLuogong['化科'] || {}).palace || '',
            '化忌落宫': (sihuaLuogong['化忌'] || {}).palace || '',
            '流年十二宫': palacesStr.join('、')
        };
    }

    function checkGeju(starPositions, mingGongIdx, sihua, auxStars, miaoWangMap) {
        var matched = [];
        var mingStars = [];
        for (var s in starPositions) { if (starPositions.hasOwnProperty(s) && starPositions[s] === mingGongIdx) mingStars.push(s); }
        var sanhe = SANHE_PALACES[mingGongIdx];
        var opposite = OPPOSITE_PALACE[mingGongIdx];
        var sfSzPalaces = [mingGongIdx].concat(sanhe).concat([opposite]);
        var sfSzStars = [];
        for (var s2 in starPositions) { if (starPositions.hasOwnProperty(s2) && sfSzPalaces.indexOf(starPositions[s2]) >= 0) sfSzStars.push(s2); }
        var auxInSf = {};
        for (var sn in auxStars) { if (auxStars.hasOwnProperty(sn) && sfSzPalaces.indexOf(auxStars[sn]) >= 0) auxInSf[sn] = auxStars[sn]; }
        for (var gi = 0; gi < GEJU_DEFINITIONS.length; gi++) {
            var geju = GEJU_DEFINITIONS[gi];
            var name = geju.name;
            var matchedFlag = false;
            if (name === '极向离明格') { if (mingStars.indexOf('紫微') >= 0 && mingGongIdx === 6) matchedFlag = true; }
            else if (name === '紫府同宫格') { if (mingStars.indexOf('紫微') >= 0 && mingStars.indexOf('天府') >= 0) matchedFlag = true; }
            else if (name === '君臣庆会格') { if (mingStars.indexOf('紫微') >= 0 && (auxInSf['左辅'] || auxInSf['右弼'])) matchedFlag = true; }
            else if (name === '机巨同临格') { if (mingStars.indexOf('天机') >= 0 && mingStars.indexOf('巨门') >= 0) matchedFlag = true; }
            else if (name === '机月同梁格') { var ss = {}; sfSzStars.forEach(function(x){ ss[x] = true; }); if (ss['天机'] && ss['太阴'] && ss['天同'] && ss['天梁']) matchedFlag = true; }
            else if (name === '善荫朝纲格') { if (mingStars.indexOf('天机') >= 0 && mingStars.indexOf('天梁') >= 0) matchedFlag = true; }
            else if (name === '日照雷门格') { if (mingStars.indexOf('太阳') >= 0 && mingGongIdx === 3) matchedFlag = true; }
            else if (name === '金灿光辉格') { if (mingStars.indexOf('太阳') >= 0 && mingGongIdx === 6) matchedFlag = true; }
            else if (name === '府相朝垣格') { var ss2 = {}; sfSzStars.forEach(function(x){ ss2[x] = true; }); if (ss2['天府'] && ss2['天相']) matchedFlag = true; }
            else if (name === '将星得地格') { if (mingStars.indexOf('武曲') >= 0 && (miaoWangMap['武曲'] === '庙' || miaoWangMap['武曲'] === '旺')) matchedFlag = true; }
            else if (name === '火贪格') { if (mingStars.indexOf('贪狼') >= 0 && auxInSf['火星']) matchedFlag = true; }
            else if (name === '七杀朝斗格') { if (mingStars.indexOf('七杀') >= 0 && (mingGongIdx === 2 || mingGongIdx === 8)) matchedFlag = true; }
            else if (name === '石中隐玉格') { if (mingStars.indexOf('巨门') >= 0 && (mingGongIdx === 0 || mingGongIdx === 6)) matchedFlag = true; }
            else if (name === '三奇嘉会格') { var sihuaSet = {}; for (var hk in sihua) { if (sihua.hasOwnProperty(hk)) sihuaSet[sihua[hk]] = true; } var cnt = 0; sfSzStars.forEach(function(x){ if (sihuaSet[x]) cnt++; }); if (cnt >= 3) matchedFlag = true; }
            else if (name === '双禄交流格') { if (auxInSf['禄存']) { var luStar = sihua['禄'] || ''; if (sfSzStars.indexOf(luStar) >= 0) matchedFlag = true; } }
            else if (name === '文星拱命格') { if (auxInSf['文昌'] && auxInSf['文曲']) matchedFlag = true; }
            else if (name === '坐贵向贵格') { if (auxInSf['天魁'] && auxInSf['天钺']) matchedFlag = true; }
            else if (name === '擎羊入庙格') { if (auxStars['擎羊'] && (auxStars['擎羊'] === 1 || auxStars['擎羊'] === 3 || auxStars['擎羊'] === 7 || auxStars['擎羊'] === 9)) matchedFlag = true; }
            else if (name === '武贪同行格') { if (mingStars.indexOf('武曲') >= 0 && mingStars.indexOf('贪狼') >= 0) matchedFlag = true; }
            else if (name === '紫府朝垣格') { var ss3 = {}; sfSzStars.forEach(function(x){ ss3[x] = true; }); if (ss3['紫微'] && ss3['天府'] && mingStars.indexOf('紫微') < 0) matchedFlag = true; }
            else if (name === '日月并明格') { if (mingStars.indexOf('太阳') >= 0 && (mingGongIdx === 3 || mingGongIdx === 4)) matchedFlag = true; }
            else if (name === '明珠出海格') { var sp = starPositions['太阳'] || -1; var mp = starPositions['太阴'] || -1; if ((sp === 4 && mp === 10) || (sp === 10 && mp === 4)) matchedFlag = true; }
            else if (name === '月朗天门格') { if (mingStars.indexOf('太阴') >= 0 && mingGongIdx === 11) matchedFlag = true; }
            else if (name === '权禄巡逢格') { var ss4 = {}; sfSzStars.forEach(function(x){ ss4[x] = true; }); var qStar = sihua['权'] || ''; var lStar = sihua['禄'] || ''; if (ss4[qStar] && ss4[lStar]) matchedFlag = true; }
            else if (name === '天乙拱命格') { if (auxInSf['天魁'] && auxInSf['天钺']) matchedFlag = true; }
            else if (name === '日月夹命格') { var sp2 = starPositions['太阳'] || -1; var mp2 = starPositions['太阴'] || -1; var nb = [mod(mingGongIdx - 1, 12), mod(mingGongIdx + 1, 12)]; if (nb.indexOf(sp2) >= 0 && nb.indexOf(mp2) >= 0) matchedFlag = true; }
            else if (name === '左右夹命格') { var zp = auxStars['左辅'] || -1; var yp = auxStars['右弼'] || -1; var nb2 = [mod(mingGongIdx - 1, 12), mod(mingGongIdx + 1, 12)]; if (nb2.indexOf(zp) >= 0 && nb2.indexOf(yp) >= 0) matchedFlag = true; }
            else if (name === '昌曲夹命格') { var wp = auxStars['文昌'] || -1; var qp = auxStars['文曲'] || -1; var nb3 = [mod(mingGongIdx - 1, 12), mod(mingGongIdx + 1, 12)]; if (nb3.indexOf(wp) >= 0 && nb3.indexOf(qp) >= 0) matchedFlag = true; }
            else if (name === '贪武同行格') { if (mingStars.indexOf('贪狼') >= 0 && mingStars.indexOf('武曲') >= 0) matchedFlag = true; }
            if (matchedFlag) matched.push({name:name, type:geju.type, desc:geju.desc});
        }
        return matched;
    }

    function checkGejuExtended(starPositions, mingGongIdx, sihua, auxStars, miaoWangMap, hour, lunarMonth) {
        var matched = [];
        var mingStars = [];
        for (var s in starPositions) { if (starPositions.hasOwnProperty(s) && starPositions[s] === mingGongIdx) mingStars.push(s); }
        var sanhe = SANHE_PALACES[mingGongIdx];
        var opposite = OPPOSITE_PALACE[mingGongIdx];
        var sfSzPalaces = [mingGongIdx].concat(sanhe).concat([opposite]);
        var sfSzStars = [];
        for (var s2 in starPositions) { if (starPositions.hasOwnProperty(s2) && sfSzPalaces.indexOf(starPositions[s2]) >= 0) sfSzStars.push(s2); }
        var auxInSf = {};
        for (var sn in auxStars) { if (auxStars.hasOwnProperty(sn) && sfSzPalaces.indexOf(auxStars[sn]) >= 0) auxInSf[sn] = auxStars[sn]; }
        for (var gi = 0; gi < GEJU_DEFINITIONS.length; gi++) {
            var geju = GEJU_DEFINITIONS[gi];
            var name = geju.name;
            var matchedFlag = false;
            if (name === '极向离明格') { if (mingStars.indexOf('紫微') >= 0 && mingGongIdx === 6) matchedFlag = true; }
            else if (name === '紫府同宫格') { if (mingStars.indexOf('紫微') >= 0 && mingStars.indexOf('天府') >= 0) matchedFlag = true; }
            else if (name === '君臣庆会格') { if (mingStars.indexOf('紫微') >= 0 && (auxInSf['左辅'] || auxInSf['右弼'])) matchedFlag = true; }
            else if (name === '机巨同临格') { if (mingStars.indexOf('天机') >= 0 && mingStars.indexOf('巨门') >= 0) matchedFlag = true; }
            else if (name === '机月同梁格') { var ss = {}; sfSzStars.forEach(function(x){ ss[x] = true; }); if (ss['天机'] && ss['太阴'] && ss['天同'] && ss['天梁']) matchedFlag = true; }
            else if (name === '善荫朝纲格') { if (mingStars.indexOf('天机') >= 0 && mingStars.indexOf('天梁') >= 0) matchedFlag = true; }
            else if (name === '日照雷门格') { if (mingStars.indexOf('太阳') >= 0 && mingGongIdx === 3 && hour >= 7 && hour <= 16) matchedFlag = true; }
            else if (name === '金灿光辉格') { if (mingStars.indexOf('太阳') >= 0 && mingGongIdx === 6) matchedFlag = true; }
            else if (name === '府相朝垣格') { var ss2 = {}; sfSzStars.forEach(function(x){ ss2[x] = true; }); if (ss2['天府'] && ss2['天相']) matchedFlag = true; }
            else if (name === '将星得地格') { if (mingStars.indexOf('武曲') >= 0 && (miaoWangMap['武曲'] === '庙' || miaoWangMap['武曲'] === '旺')) matchedFlag = true; }
            else if (name === '火贪格') { if (mingStars.indexOf('贪狼') >= 0 && auxInSf['火星']) matchedFlag = true; }
            else if (name === '七杀朝斗格') { if (mingStars.indexOf('七杀') >= 0 && (mingGongIdx === 2 || mingGongIdx === 8)) matchedFlag = true; }
            else if (name === '石中隐玉格') { if (mingStars.indexOf('巨门') >= 0 && (mingGongIdx === 0 || mingGongIdx === 6)) matchedFlag = true; }
            else if (name === '三奇嘉会格') { var sihuaSet = {}; for (var hk in sihua) { if (sihua.hasOwnProperty(hk)) sihuaSet[sihua[hk]] = true; } var cnt = 0; sfSzStars.forEach(function(x){ if (sihuaSet[x]) cnt++; }); if (cnt >= 3) matchedFlag = true; }
            else if (name === '双禄交流格') { if (auxInSf['禄存']) { var luStar = sihua['禄'] || ''; if (sfSzStars.indexOf(luStar) >= 0) matchedFlag = true; } }
            else if (name === '文星拱命格') { if (auxInSf['文昌'] && auxInSf['文曲']) matchedFlag = true; }
            else if (name === '坐贵向贵格') { if (auxInSf['天魁'] && auxInSf['天钺']) matchedFlag = true; }
            else if (name === '擎羊入庙格') { if (auxStars['擎羊'] && (auxStars['擎羊'] === 1 || auxStars['擎羊'] === 3 || auxStars['擎羊'] === 7 || auxStars['擎羊'] === 9)) matchedFlag = true; }
            else if (name === '武贪同行格') { if (mingStars.indexOf('武曲') >= 0 && mingStars.indexOf('贪狼') >= 0) matchedFlag = true; }
            else if (name === '紫府朝垣格') { var ss3 = {}; sfSzStars.forEach(function(x){ ss3[x] = true; }); if (ss3['紫微'] && ss3['天府'] && mingStars.indexOf('紫微') < 0) matchedFlag = true; }
            else if (name === '日月并明格') { var sunPos = starPositions['太阳'] || -1; var moonPos = starPositions['太阴'] || -1; var sunWang = (sunPos === 4 || sunPos === 5 || sunPos === 6); var moonWang = (moonPos === 9 || moonPos === 10 || moonPos === 11 || moonPos === 0 || moonPos === 1); if (sunWang && moonWang) matchedFlag = true; }
            else if (name === '明珠出海格') { var sp = starPositions['太阳'] || -1; var mp = starPositions['太阴'] || -1; if ((sp === 4 && mp === 10) || (sp === 10 && mp === 4)) matchedFlag = true; }
            else if (name === '月朗天门格') { if (mingStars.indexOf('太阴') >= 0 && mingGongIdx === 11) matchedFlag = true; }
            else if (name === '月生沧海格') { var moonPos2 = starPositions['太阴'] || -1; var tianzhaiIdx = mod(mingGongIdx + 9, 12); if (moonPos2 === 0 && moonPos2 === tianzhaiIdx) matchedFlag = true; }
            else if (name === '权禄巡逢格') { var ss4 = {}; sfSzStars.forEach(function(x){ ss4[x] = true; }); var qStar = sihua['权'] || ''; var lStar = sihua['禄'] || ''; if (ss4[qStar] && ss4[lStar]) matchedFlag = true; }
            else if (name === '天乙拱命格') { if (auxInSf['天魁'] && auxInSf['天钺']) matchedFlag = true; }
            else if (name === '日月夹命格') { var sp2 = starPositions['太阳'] || -1; var mp2 = starPositions['太阴'] || -1; var nb = [mod(mingGongIdx - 1, 12), mod(mingGongIdx + 1, 12)]; if (nb.indexOf(sp2) >= 0 && nb.indexOf(mp2) >= 0) matchedFlag = true; }
            else if (name === '左右夹命格') { var zp = auxStars['左辅'] || -1; var yp = auxStars['右弼'] || -1; var nb2 = [mod(mingGongIdx - 1, 12), mod(mingGongIdx + 1, 12)]; if (nb2.indexOf(zp) >= 0 && nb2.indexOf(yp) >= 0) matchedFlag = true; }
            else if (name === '昌曲夹命格') { var wp = auxStars['文昌'] || -1; var qp = auxStars['文曲'] || -1; var nb3 = [mod(mingGongIdx - 1, 12), mod(mingGongIdx + 1, 12)]; if (nb3.indexOf(wp) >= 0 && nb3.indexOf(qp) >= 0) matchedFlag = true; }
            else if (name === '贪武同行格') { if (mingStars.indexOf('贪狼') >= 0 && mingStars.indexOf('武曲') >= 0) matchedFlag = true; }
            if (matchedFlag) matched.push({name:name, type:geju.type, desc:geju.desc});
        }
        return matched;
    }

    // ===== Part 3: 标签生成 =====

    function _generate(year, month, day, hour, minute, options) {
        options = options || {};
        var gender = options.gender || 'male';
        var juNames = {2:'水二局',3:'木三局',4:'金四局',5:'土五局',6:'火六局'};

        // 四柱 - 优先使用 options.ganzhi
        var bazi;
        var lunarMonth, lunarDay;

        if (options.ganzhi && options.ganzhi.dayGz) {
            var gz = options.ganzhi;
            var yg = gz.yearGz || '';
            var mg = gz.monthGz || '';
            var dg = gz.dayGz || '';
            var hg = gz.hourGz || '';
            bazi = {
                year_gan: yg ? yg[0] : '', year_zhi: yg ? yg[1] : '',
                year_gan_idx: yg ? TIANGAN.indexOf(yg[0]) : 0,
                year_zhi_idx: yg ? DIZHI.indexOf(yg[1]) : 0,
                month_gan: mg ? mg[0] : '', month_zhi: mg ? mg[1] : '',
                month_zhi_idx: mg ? DIZHI.indexOf(mg[1]) : 0,
                day_gan: dg ? dg[0] : '', day_zhi: dg ? dg[1] : '', day_idx: 0,
                time_gan: hg ? hg[0] : '', time_zhi: hg ? hg[1] : '',
                time_zhi_idx: hg ? DIZHI.indexOf(hg[1]) : 0
            };
            // 使用 options.ganzhi 中的农历信息
            if (gz.lunarMonth && gz.lunarDay) {
                lunarMonth = gz.lunarMonth;
                lunarDay = gz.lunarDay;
            } else {
                var lunarArr = solarToLunarApprox(year, month, day);
                lunarMonth = lunarArr[0]; lunarDay = lunarArr[1];
            }
        } else {
            bazi = solarToBazi(year, month, day, hour, minute || 0);
            var lunarArr2 = solarToLunarApprox(year, month, day);
            lunarMonth = lunarArr2[0]; lunarDay = lunarArr2[1];
        }

        // 命宫身宫
        var mingGongIdx = getMingGong(lunarMonth, bazi.time_zhi_idx);
        var shenGongIdx = getShenGong(lunarMonth, bazi.time_zhi_idx);
        var mingGongGan = getMingGongGan(bazi.year_gan, mingGongIdx);
        var mingGongZhi = DIZHI[mingGongIdx];

        // 五行局
        var juArr = getWuxingJu(mingGongGan, mingGongZhi);
        var ju = juArr[0], nayin = juArr[1];

        // 紫微星定位 (OPT5修正版)
        var ziweiPosOrig = getZiweiPos(ju, lunarDay);
        var ziweiPosNew = getZiweiPosCorrected(ju, lunarDay);
        var ziweiPos = ziweiPosNew;
        var ziweiChanged = (ziweiPosNew !== ziweiPosOrig);

        // 安十四主星
        var starArr = placeAll14Stars(ziweiPos);
        var starPositions = starArr.positions;
        var tianfuPos = starArr.tianfuPos;

        // 四化
        var sihua = getSihua(bazi.year_gan);

        // 辅星煞星
        var lucunPos = getLucun(bazi.year_gan);
        var qyArr = getQingyangTuoluo(lucunPos);
        var qingyang = qyArr[0], tuoluo = qyArr[1];
        var kuiYue = getKuiYue(bazi.year_gan);
        var zfArr = getZuofuYoubi(lunarMonth);
        var zuofu = zfArr[0], youbi = zfArr[1];
        var wcArr = getWenchangWenqu(bazi.time_zhi_idx);
        var wenchang = wcArr[0], wenqu = wcArr[1];
        var dkArr = getDikongDijie(bazi.time_zhi_idx);
        var dikong = dkArr[0], dijie = dkArr[1];
        var hxArr = getHuoxingLingxing(bazi.year_zhi_idx, bazi.time_zhi_idx);
        var huoxing = hxArr[0], lingxing = hxArr[1];
        var tianma = getTianma(bazi.year_zhi_idx);

        var auxStars = {
            '禄存':lucunPos, '擎羊':qingyang, '陀罗':tuoluo,
            '天魁':kuiYue['魁'], '天钺':kuiYue['钺'],
            '左辅':zuofu, '右弼':youbi,
            '文昌':wenchang, '文曲':wenqu,
            '地空':dikong, '地劫':dijie,
            '火星':huoxing, '铃星':lingxing,
            '天马':tianma
        };

        // 庙旺平陷
        var miaoWangMap = {};
        for (var star in starPositions) { if (starPositions.hasOwnProperty(star)) { miaoWangMap[star] = getMiaoWang(star, starPositions[star]); } }

        // === 构建各层数据 ===
        var layers = {};

        // L1: 基础排盘
        layers['L1_基础排盘'] = {
            '年柱': bazi.year_gan + bazi.year_zhi,
            '月柱': bazi.month_gan + bazi.month_zhi,
            '日柱': bazi.day_gan + bazi.day_zhi,
            '时柱': bazi.time_gan + bazi.time_zhi,
            '命宫地支': mingGongZhi,
            '身宫地支': DIZHI[shenGongIdx],
            '命宫干支': mingGongGan + mingGongZhi,
            '五行局': juNames[ju] || (ju + '局')
        };

        // L2: 主星坐宫
        layers['L2_主星坐宫'] = {};
        for (var s1 in STARS_14) {
            if (STARS_14.hasOwnProperty(s1)) {
                var pos1 = starPositions[s1] !== undefined ? starPositions[s1] : 0;
                var pn1 = PALACES[mod(pos1 - mingGongIdx, 12)];
                layers['L2_主星坐宫'][s1 + '所在宫'] = DIZHI[pos1] + '宫(' + pn1 + ')';
            }
        }

        // L3: 主星庙旺
        layers['L3_主星庙旺'] = {};
        for (var s2 in STARS_14) {
            if (STARS_14.hasOwnProperty(s2)) { layers['L3_主星庙旺'][s2 + '庙旺'] = miaoWangMap[s2] || '平'; }
        }

        // L4: 主星属性
        layers['L4_主星属性'] = {};
        for (var s3 in STARS_14) {
            if (STARS_14.hasOwnProperty(s3)) {
                var attrs = STARS_14[s3];
                layers['L4_主星属性'][s3 + '_五行'] = attrs['wuxing'];
                layers['L4_主星属性'][s3 + '_化气'] = attrs['huaqi'];
                layers['L4_主星属性'][s3 + '_星系'] = attrs['star_system'];
                layers['L4_主星属性'][s3 + '_斗分'] = attrs['douxi'];
                layers['L4_主星属性'][s3 + '_分类'] = attrs['classification'];
                layers['L4_主星属性'][s3 + '_核心特质'] = attrs['core_trait'];
                layers['L4_主星属性'][s3 + '_喜忌'] = '喜:' + attrs['palace_pref'] + '; 忌:' + attrs['anti'];
            }
        }

        // L5: 十二宫吉凶
        layers['L5_十二宫吉凶'] = {};
        for (var i5 = 0; i5 < PALACES.length; i5++) {
            var pIdx5 = mod(mingGongIdx + i5, 12);
            var pStars5 = getPalaceStars(starPositions, pIdx5);
            var pMw5 = {}; pStars5.forEach(function(s){ pMw5[s] = miaoWangMap[s] || '平'; });
            var ausp5 = 0, inausp5 = 0;
            pStars5.forEach(function(s){ var mw = miaoWangMap[s] || '平'; if (mw === '庙' || mw === '旺') ausp5++; if (mw === '陷' || mw === '平') inausp5++; });
            var auxHere5 = {};
            for (var ak in auxStars) { if (auxStars.hasOwnProperty(ak) && auxStars[ak] === pIdx5) auxHere5[ak] = true; }
            var jx5 = '吉'; if (ausp5 > inausp5) jx5 = '吉'; else if (inausp5 > ausp5) jx5 = '凶'; else jx5 = '平';
            layers['L5_十二宫吉凶'][PALACES[i5] + '_主星'] = pStars5.length ? pStars5.join('、') : '空宫';
            layers['L5_十二宫吉凶'][PALACES[i5] + '_庙旺'] = pStars5.length ? pStars5.map(function(s){ return s + '(' + pMw5[s] + ')'; }).join('、') : '无';
            layers['L5_十二宫吉凶'][PALACES[i5] + '_吉凶'] = jx5;
            layers['L5_十二宫吉凶'][PALACES[i5] + '_辅煞'] = Object.keys(auxHere5).length ? Object.keys(auxHere5).join('、') : '无';
        }

        // L6: 四化系统
        layers['L6_四化系统'] = {};
        var sihuaEffects = {'禄':'增益财禄人缘','权':'增强权力掌控','科':'提升名声贵人','忌':'阻碍执念波折'};
        for (var ht in sihua) {
            if (sihua.hasOwnProperty(ht)) {
                var siStar = sihua[ht];
                var siPos = starPositions[siStar] !== undefined ? starPositions[siStar] : 0;
                var siPn = PALACES[mod(siPos - mingGongIdx, 12)];
                layers['L6_四化系统']['化' + ht + '_星曜'] = siStar;
                layers['L6_四化系统']['化' + ht + '_落宫'] = DIZHI[siPos] + '宫(' + siPn + ')';
                layers['L6_四化系统']['化' + ht + '_效果'] = sihuaEffects[ht] || '';
            }
        }

        // L7: 六吉星
        layers['L7_六吉星'] = {};
        var jxNames = {'左辅':'同辈助力','右弼':'同辈助力带监管','天魁':'男性长辈提携','天钺':'女性长辈提携','文昌':'正规学业文书','文曲':'才艺口才技能'};
        var jxList = ['左辅','右弼','天魁','天钺','文昌','文曲'];
        for (var ji = 0; ji < jxList.length; ji++) {
            var jn = jxList[ji];
            var jp = auxStars[jn] !== undefined ? auxStars[jn] : 0;
            var jpn = PALACES[mod(jp - mingGongIdx, 12)];
            var jco = getPalaceStars(starPositions, jp);
            layers['L7_六吉星'][jn + '_宫位'] = DIZHI[jp] + '宫(' + jpn + ')';
            layers['L7_六吉星'][jn + '_同宫'] = jco.length ? jco.join('、') : '无主星';
            layers['L7_六吉星'][jn + '_助力'] = jxNames[jn] || '';
        }

        // L8: 六煞星
        layers['L8_六煞星'] = {};
        var sxNames = {'擎羊':'刑伤冲动','陀罗':'拖延反复','火星':'暴躁急进','铃星':'隐忍阴沉','地空':'不聚财空虚','地劫':'破财漂泊'};
        var sxList = ['擎羊','陀罗','火星','铃星','地空','地劫'];
        for (var si = 0; si < sxList.length; si++) {
            var sn = sxList[si];
            var sp = auxStars[sn] !== undefined ? auxStars[sn] : 0;
            var spn = PALACES[mod(sp - mingGongIdx, 12)];
            var sco = getPalaceStars(starPositions, sp);
            layers['L8_六煞星'][sn + '_宫位'] = DIZHI[sp] + '宫(' + spn + ')';
            layers['L8_六煞星'][sn + '_同宫'] = sco.length ? sco.join('、') : '无主星';
            layers['L8_六煞星'][sn + '_破坏'] = sxNames[sn] || '';
        }

        // L9: 禄马配置
        var lucunPn = PALACES[mod(lucunPos - mingGongIdx, 12)];
        var tianmaPn = PALACES[mod(tianma - mingGongIdx, 12)];
        layers['L9_禄马配置'] = {
            '禄存_宫位': DIZHI[lucunPos] + '宫(' + lucunPn + ')',
            '禄存_格局': (Math.abs(lucunPos - tianma) === 4 || Math.abs(lucunPos - tianma) === 8) ? '禄马交驰' : (lucunPos === mingGongIdx ? '禄存守命' : '禄存入库'),
            '天马_宫位': DIZHI[tianma] + '宫(' + tianmaPn + ')',
            '天马_格局': (tianma !== mingGongIdx) ? '驿马星动' : '马入命宫'
        };

        // L10: 乙级星(原版简化计算)
        layers['L10_乙级星原版'] = {};
        for (var yi = 0; yi < YIJI_STARS.length; yi++) {
            var ysName = YIJI_STARS[yi][0];
            var ysFunc = YIJI_STARS[yi][1];
            var yPos = mod(mingGongIdx + ysName.length * 3 + ysName.charCodeAt(0) + bazi.year_zhi_idx, 12);
            var yPn = PALACES[mod(yPos - mingGongIdx, 12)];
            layers['L10_乙级星原版'][ysName + '_宫位'] = DIZHI[yPos] + '宫(' + yPn + ')';
            layers['L10_乙级星原版'][ysName + '_功能'] = ysFunc;
        }

        // L10b: OPT1 乙级星正确安星法
        var yijiPositions = getYijiPositionsWithGan(bazi.year_gan, bazi.year_zhi_idx, lunarMonth, bazi.time_zhi_idx, mingGongIdx);
        layers['L10b_乙级星正确安星'] = {};
        for (var yi2 = 0; yi2 < YIJI_STARS.length; yi2++) {
            var ysName2 = YIJI_STARS[yi2][0];
            var ysFunc2 = YIJI_STARS[yi2][1];
            var yPos2 = yijiPositions[ysName2] !== undefined ? yijiPositions[ysName2] : 0;
            var yPn2 = PALACES[mod(yPos2 - mingGongIdx, 12)];
            layers['L10b_乙级星正确安星'][ysName2 + '_宫位'] = DIZHI[yPos2] + '宫(' + yPn2 + ')';
            layers['L10b_乙级星正确安星'][ysName2 + '_功能'] = ysFunc2;
        }

        // L11: 格局判断(原版)
        layers['L11_格局判断原版'] = {};
        var matchedGejuOrig = checkGeju(starPositions, mingGongIdx, sihua, auxStars, miaoWangMap);
        var matchedNamesOrig = {};
        matchedGejuOrig.forEach(function(g){ matchedNamesOrig[g.name] = true; });
        for (var gi2 = 0; gi2 < GEJU_DEFINITIONS.length; gi2++) {
            layers['L11_格局判断原版'][GEJU_DEFINITIONS[gi2].name] = matchedNamesOrig[GEJU_DEFINITIONS[gi2].name] ? '✅成立' : '—不成立';
        }

        // L11b: OPT4 格局检测补全
        layers['L11b_格局检测补全'] = {};
        var matchedGejuExt = checkGejuExtended(starPositions, mingGongIdx, sihua, auxStars, miaoWangMap, hour, lunarMonth);
        var matchedNamesExt = {};
        matchedGejuExt.forEach(function(g){ matchedNamesExt[g.name] = true; });
        for (var gi3 = 0; gi3 < GEJU_DEFINITIONS.length; gi3++) {
            layers['L11b_格局检测补全'][GEJU_DEFINITIONS[gi3].name] = matchedNamesExt[GEJU_DEFINITIONS[gi3].name] ? '✅成立' : '—不成立';
        }
        layers['L11b_格局检测补全']['OPT4修正说明'] = '日照雷门格(加白天条件), 日月并明格(修正为太阳巳午+太阴酉戌亥), 月生沧海格(新增太阴子宫守田宅)';

        // L12: 三方四正
        layers['L12_三方四正'] = {};
        for (var i12 = 0; i12 < PALACES.length; i12++) {
            var pIdx12 = mod(mingGongIdx + i12, 12);
            var sanhe12 = SANHE_PALACES[pIdx12];
            var opp12 = OPPOSITE_PALACE[pIdx12];
            layers['L12_三方四正'][PALACES[i12] + '_本宫星'] = getPalaceStars(starPositions, pIdx12).join('、') || '空';
            layers['L12_三方四正'][PALACES[i12] + '_对宫星'] = getPalaceStars(starPositions, opp12).join('、') || '空';
            var sanheStars = getPalaceStars(starPositions, sanhe12[0]).concat(getPalaceStars(starPositions, sanhe12[1]));
            var uniqueSanhe = [];
            sanheStars.forEach(function(s){ if (uniqueSanhe.indexOf(s) < 0) uniqueSanhe.push(s); });
            layers['L12_三方四正'][PALACES[i12] + '_三合星'] = uniqueSanhe.join('、') || '空';
            var sfStars12 = getSanheSizhengStars(starPositions, pIdx12);
            layers['L12_三方四正'][PALACES[i12] + '_四正汇聚'] = Object.keys(sfStars12).length + '颗主星';
        }

        // L13: 大限系统(原版)
        layers['L13_大限系统原版'] = {};
        var isYangGan13 = ['甲','丙','戊','庚','壬'].indexOf(bazi.year_gan) >= 0;
        var isMale13 = gender === 'male';
        var dir13 = ((isYangGan13 && isMale13) || (!isYangGan13 && !isMale13)) ? 1 : -1;
        for (var i13 = 0; i13 < 12; i13++) {
            var dxIdx13 = mod(mingGongIdx + dir13 * i13, 12);
            var dxStars13 = getPalaceStars(starPositions, dxIdx13);
            var dxPn13 = PALACES[mod(dxIdx13 - mingGongIdx, 12)];
            layers['L13_大限系统原版']['第' + (i13+1) + '限_年龄'] = (i13*10+1) + '-' + (i13*10+10) + '岁';
            layers['L13_大限系统原版']['第' + (i13+1) + '限_宫位'] = DIZHI[dxIdx13] + '宫(' + dxPn13 + ')';
            layers['L13_大限系统原版']['第' + (i13+1) + '限_主星'] = dxStars13.length ? dxStars13.join('、') : '空宫';
        }

        // L13b: OPT2 大限起运按五行局
        layers['L13b_大限起运按五行局'] = {};
        var daxianListOpt = calcDaxianWithJu(mingGongIdx, bazi.year_gan, gender, ju);
        for (var i13b = 0; i13b < daxianListOpt.length; i13b++) {
            var dxOpt = daxianListOpt[i13b];
            var dxStarsOpt = getPalaceStars(starPositions, dxOpt.idx);
            layers['L13b_大限起运按五行局']['第' + (i13b+1) + '限_年龄'] = dxOpt.age_range;
            layers['L13b_大限起运按五行局']['第' + (i13b+1) + '限_宫位'] = DIZHI[dxOpt.idx] + '宫(' + dxOpt.palace + ')';
            layers['L13b_大限起运按五行局']['第' + (i13b+1) + '限_主星'] = dxStarsOpt.length ? dxStarsOpt.join('、') : '空宫';
        }
        layers['L13b_大限起运按五行局']['OPT2说明'] = '起运年龄=' + ju + '岁(五行局数), 阳' + (gender === 'male' ? '男' : '女') + (isYangGan13 ? '顺行' : (gender === 'male' ? '逆行' : '顺行'));

        // L14: 流年系统(原版)
        layers['L14_流年系统原版'] = {};
        var curZhiIdx14 = mod(year - 4, 12);
        var curGanIdx14 = mod(year - 4, 10);
        var curGan14 = TIANGAN[curGanIdx14];
        var lnSihua14 = SIHUA_TABLE[curGan14] || {};
        layers['L14_流年系统原版']['流年干支'] = curGan14 + DIZHI[curZhiIdx14];
        layers['L14_流年系统原版']['流年命宫'] = DIZHI[curZhiIdx14] + '宫';
        layers['L14_流年系统原版']['流年化禄'] = lnSihua14['禄'] || '';
        layers['L14_流年系统原版']['流年化权'] = lnSihua14['权'] || '';
        layers['L14_流年系统原版']['流年化科'] = lnSihua14['科'] || '';
        layers['L14_流年系统原版']['流年化忌'] = lnSihua14['忌'] || '';

        // L14b: OPT3 流年系统完善
        layers['L14b_流年系统完善'] = calcLiunianExtended(year, mingGongIdx, starPositions);

        // L15: 星曜组合
        layers['L15_星曜组合'] = {};
        for (var ci = 0; ci < STAR_COMBINATIONS.length; ci++) {
            var combo = STAR_COMBINATIONS[ci];
            var cStars = combo.stars;
            var cPositions = cStars.map(function(s){ return starPositions[s] !== undefined ? starPositions[s] : -1; });
            var samePalace = cPositions.length > 0 && cPositions.every(function(p){ return p === cPositions[0] && p >= 0; });
            var sanheCheck = false;
            if (cStars.length === 3 && cPositions[0] >= 0) {
                var sp15 = SANHE_PALACES[cPositions[0]];
                if (sp15.indexOf(cPositions[1]) >= 0 && sp15.indexOf(cPositions[2]) >= 0) sanheCheck = true;
            }
            var status15;
            if (samePalace) status15 = '同宫';
            else if (sanheCheck) status15 = '三合会照';
            else if (cPositions[0] >= 0 && cPositions[1] >= 0 && Math.abs(cPositions[0] - cPositions[1]) === 6) status15 = '对宫';
            else status15 = '分散';
            layers['L15_星曜组合'][combo.name] = status15 + ' - ' + combo.desc;
        }

        // L16: 宫位互涉
        layers['L16_宫位互涉'] = {};
        for (var i16 = 0; i16 < PALACES.length; i16++) {
            var pIdx16 = mod(mingGongIdx + i16, 12);
            var oppIdx16 = OPPOSITE_PALACE[pIdx16];
            var oppName16 = PALACES[mod(oppIdx16 - mingGongIdx, 12)];
            layers['L16_宫位互涉'][PALACES[i16] + '_对宫'] = oppName16;
        }

        // L17: 命盘格局
        var mingStars17 = getPalaceStars(starPositions, mingGongIdx);
        var mingMw17 = {}; mingStars17.forEach(function(s){ mingMw17[s] = miaoWangMap[s] || '平'; });
        var strongCnt17 = 0, weakCnt17 = 0;
        for (var mw17 in mingMw17) { if (mingMw17[mw17] === '庙' || mingMw17[mw17] === '旺') strongCnt17++; if (mingMw17[mw17] === '陷') weakCnt17++; }
        var panStrength = '命宫中等'; if (strongCnt17 > weakCnt17) panStrength = '命宫强'; else if (weakCnt17 > strongCnt17) panStrength = '命宫弱';
        var gejuGuige = 0, gejuFuge = 0;
        matchedGejuExt.forEach(function(g){ if (g.type === '贵格' || g.type === '武贵格') gejuGuige++; if (g.type === '富格') gejuFuge++; });
        var level17 = '杂格'; if (gejuGuige >= 2) level17 = '贵格突出'; else if (gejuFuge >= 2) level17 = '富格突出'; else if (gejuGuige + gejuFuge >= 1) level17 = '有成格';
        var shaCnt17 = 0, jiCnt17 = 0;
        var sfAll17 = [mingGongIdx].concat(SANHE_PALACES[mingGongIdx]).concat([OPPOSITE_PALACE[mingGongIdx]]);
        ['擎羊','陀罗','火星','铃星','地空','地劫'].forEach(function(s){ if (sfAll17.indexOf(auxStars[s] || -1) >= 0) shaCnt17++; });
        ['左辅','右弼','天魁','天钺','文昌','文曲'].forEach(function(s){ if (sfAll17.indexOf(auxStars[s] || -1) >= 0) jiCnt17++; });

        layers['L17_命盘格局'] = {
            '命宫主星': mingStars17.length ? mingStars17.join('、') : '空宫',
            '命宫庙旺': mingStars17.length ? mingStars17.map(function(s){ return s + '(' + mingMw17[s] + ')'; }).join('、') : '空宫',
            '命盘强弱': panStrength,
            '富贵层次': level17,
            '成立格局数': matchedGejuExt.length + '个',
            '成立格局名': matchedGejuExt.length ? matchedGejuExt.map(function(g){ return g.name; }).join('、') : '无成格',
            '三方四正吉星数': jiCnt17 + '颗',
            '三方四正煞星数': shaCnt17 + '颗',
            '身宫位置': DIZHI[shenGongIdx] + '宫(' + PALACES[mod(shenGongIdx - mingGongIdx, 12)] + ')',
            '五行局纳音': nayin
        };
        if (ziweiChanged) layers['L17_命盘格局']['OPT5修正'] = '紫微星位置从' + DIZHI[ziweiPosOrig] + '宫修正为' + DIZHI[ziweiPosNew] + '宫';

        return { layers: layers, mingGongZhi: mingGongZhi, ju: ju, nayin: nayin, ziweiPos: ziweiPos, sihua: sihua, matchedGejuExt: matchedGejuExt };
    }

    // ===== 标准接口 =====

    window.Systems.ziwei = function(year, month, day, hour, minute, options) {
        hour = hour || 12;
        minute = minute || 0;
        options = options || {};

        var result = _generate(year, month, day, hour, minute, options);
        var layers = result.layers;
        var dimensions = {};

        var layerKeys = Object.keys(layers);
        for (var i = 0; i < layerKeys.length; i++) {
            var layerName = layerKeys[i];
            var layerData = layers[layerName];
            var dk = Object.keys(layerData);
            for (var j = 0; j < dk.length; j++) {
                var key = dk[j];
                var val = layerData[key];
                if (val !== null && val !== '' && val !== false) {
                    dimensions[layerName + '.' + key] = val;
                }
            }
        }

        var summaryParts = [];
        if (result.mingGongZhi) summaryParts.push('命宫:' + result.mingGongZhi + '宫');
        if (result.nayin) summaryParts.push(result.nayin);
        if (result.sihua) summaryParts.push('禄→' + (result.sihua['禄'] || '') + ' 忌→' + (result.sihua['忌'] || ''));
        if (result.matchedGejuExt && result.matchedGejuExt.length > 0) summaryParts.push('格局' + result.matchedGejuExt.length + '个');

        return {
            dimensions: dimensions,
            name: '紫微斗数',
            summary: summaryParts.join(' · ')
        };
    };

})();
