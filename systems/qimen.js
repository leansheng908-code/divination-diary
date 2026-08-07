/**
 * 奇门遁甲 (Qi Men Dun Jia) 标签生成模块
 * 从 qimen.html 提取的纯计算逻辑
 * 17层 402维度 + 5项理论驱动优化
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

    // ===== Part 1: 基础数据表 =====

    var TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var LIUSHIJIAZI = [];
    for (var i = 0; i < 60; i++) { LIUSHIJIAZI.push(TIANGAN[i%10] + DIZHI[i%12]); }

    var JIUGONG = {
        1:{gua:'坎',wx:'水',fang:'北'},
        2:{gua:'坤',wx:'土',fang:'西南'},
        3:{gua:'震',wx:'木',fang:'东'},
        4:{gua:'巽',wx:'木',fang:'东南'},
        5:{gua:'中',wx:'土',fang:'中央'},
        6:{gua:'乾',wx:'金',fang:'西北'},
        7:{gua:'兑',wx:'金',fang:'西'},
        8:{gua:'艮',wx:'土',fang:'东北'},
        9:{gua:'离',wx:'火',fang:'南'}
    };
    var JIUGONG_ORDER = [1,2,3,4,5,6,7,8,9];
    var SANQI_LIUYI = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];
    var LIUJIA_DUN = {'甲子':'戊','甲戌':'己','甲申':'庚','甲午':'辛','甲辰':'壬','甲寅':'癸'};

    var XUN_SHOU = {};
    var xun_list = [['甲子',0],['甲戌',10],['甲申',20],['甲午',30],['甲辰',40],['甲寅',50]];
    for (var xi = 0; xi < xun_list.length; xi++) {
        var xn = xun_list[xi][0], si = xun_list[xi][1];
        for (var j = 0; j < 10; j++) { XUN_SHOU[LIUSHIJIAZI[si+j]] = xn; }
    }

    var XUN_KONG = {
        '甲子':['戌','亥'],'甲戌':['申','酉'],'甲申':['午','未'],
        '甲午':['辰','巳'],'甲辰':['寅','卯'],'甲寅':['子','丑']
    };

    var JIUXING = {
        '天蓬':{'wuxing':'水','palace':1,'yinyang':'阳','jixiong':'大凶','trait':'胆大冒险暗中行事破财盗贼','wang':'寅卯月','xiu':'申酉月','xiang':'亥子月','si':'辰戌丑未月','qiu':'巳午月'},
        '天芮':{'wuxing':'土','palace':2,'yinyang':'阴','jixiong':'凶','trait':'疾病问题学习师长积累土地','wang':'寅卯月','xiu':'申酉月','xiang':'辰戌丑未月','si':'巳午月','qiu':'亥子月'},
        '天冲':{'wuxing':'木','palace':3,'yinyang':'阳','jixiong':'次吉','trait':'行动开拓迅速冲劲竞争雷动','wang':'巳午月','xiu':'辰戌丑未月','xiang':'寅卯月','si':'申酉月','qiu':'亥子月'},
        '天辅':{'wuxing':'木','palace':4,'yinyang':'阳','jixiong':'吉','trait':'文化教育学业辅佐文雅传播','wang':'巳午月','xiu':'辰戌丑未月','xiang':'寅卯月','si':'申酉月','qiu':'亥子月'},
        '天禽':{'wuxing':'土','palace':5,'yinyang':'阳','jixiong':'吉','trait':'中正统摄厚重综合判断调和','wang':'巳午月','xiu':'辰戌丑未月','xiang':'辰戌丑未月','si':'寅卯月','qiu':'申酉月'},
        '天心':{'wuxing':'金','palace':6,'yinyang':'阴','jixiong':'吉','trait':'医药领导谋划管理贵重玄学','wang':'辰戌丑未月','xiu':'寅卯月','xiang':'申酉月','si':'巳午月','qiu':'亥子月'},
        '天柱':{'wuxing':'金','palace':7,'yinyang':'阴','jixiong':'凶','trait':'口舌破坏惊恐争讼声音变革','wang':'辰戌丑未月','xiu':'寅卯月','xiang':'申酉月','si':'巳午月','qiu':'亥子月'},
        '天任':{'wuxing':'土','palace':8,'yinyang':'阳','jixiong':'吉','trait':'承担勤恳厚道田宅地产积累','wang':'巳午月','xiu':'申酉月','xiang':'辰戌丑未月','si':'寅卯月','qiu':'亥子月'},
        '天英':{'wuxing':'火','palace':9,'yinyang':'阴','jixiong':'小凶','trait':'光明文书外表名声急躁血光','wang':'辰戌丑未月','xiu':'申酉月','xiang':'寅卯月','si':'亥子月','qiu':'辰戌丑未月'}
    };
    var JIUXING_ORDER = ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英'];

    var BAMEN = {
        '开门':{'wuxing':'金','palace':6,'jixiong':'吉','meaning':'开通开拓开张贵人远行','yi':'求官面见贵人开业出行求职寻人','ji':'嫁娶丧事藏匿','wang':'戌亥月'},
        '休门':{'wuxing':'水','palace':1,'jixiong':'吉','meaning':'休养休息安静求和消极避祸','yi':'休养求医谈和避难调解求安宁','ji':'急事用兵出击强求','wang':'子月'},
        '生门':{'wuxing':'土','palace':8,'jixiong':'大吉','meaning':'生发生意求财置业生子','yi':'求财做生意开店置业求子谈合作','ji':'诉讼求战损人','wang':'丑寅月'},
        '伤门':{'wuxing':'木','palace':3,'jixiong':'凶','meaning':'伤害损伤官非车祸争斗','yi':'捕猎追逃讨债用兵需要冲击之事','ji':'出行嫁娶签约谈合作','wang':'卯月'},
        '杜门':{'wuxing':'木','palace':4,'jixiong':'平','meaning':'闭塞隐藏阻碍躲避修行','yi':'躲避灾祸隐居修炼保密藏匿','ji':'开店求名谈生意嫁娶求人','wang':'辰巳月'},
        '景门':{'wuxing':'火','palace':9,'jixiong':'平','meaning':'文书文章考试上书火光传播','yi':'考试上书发表写作广告求名声面试','ji':'诉讼嫁娶暗中行事','wang':'午月'},
        '死门':{'wuxing':'土','palace':2,'jixiong':'大凶','meaning':'死亡丧事停滞绝灭坟墓损失','yi':'丧葬捕猎钓鱼占病情捕逃','ji':'嫁娶出行求医求财谈生意','wang':'辰戌丑未月'},
        '惊门':{'wuxing':'金','palace':7,'jixiong':'凶','meaning':'惊恐官非口舌是非诉讼变故','yi':'诉讼用兵口舌博弈打官司','ji':'嫁娶出行谈合作求和求医','wang':'酉月'}
    };
    var BAMEN_ORDER = ['休门','生门','伤门','杜门','景门','死门','惊门','开门'];

    var BASHEN = {
        '值符':{'wuxing':'土','jixiong':'最吉','meaning':'尊贵领导贵人高级事物','person':'领导老板负责人名人有地位的人','thing':'重要事项高价值物品贵重资产重要文件','yiji':'百恶消散事急可从值符方出'},
        '腾蛇':{'wuxing':'火','jixiong':'凶','meaning':'虚诈惊疑变化缠绕','person':'多疑善变虚伪者宗教玄学人士','thing':'变化多的事虚假成分多的事惊疑感的事','yiji':'出方主精神恍惚恶梦惊悸得奇得门无妨'},
        '太阴':{'wuxing':'金','jixiong':'吉','meaning':'隐秘策划暗处细腻','person':'女人女友策划者秘书文人心思细腻的人','thing':'隐私之事私下安排暗中谋划','yiji':'密谋策划避难藏兵贵人暗中帮助'},
        '六合':{'wuxing':'木','jixiong':'吉','meaning':'合作婚姻谈判媒介','person':'人缘好的人中介媒人教师医生善于沟通的人','thing':'多人参与合作谈判交易签约婚姻嫁娶','yiji':'利于谈判交易婚姻嫁娶合作'},
        '白虎':{'wuxing':'金','jixiong':'凶','meaning':'凶猛伤灾阻隔刚硬','person':'脾气刚烈的人军警执法者好斗的人重病之人','thing':'不顺冲突受伤阻碍争斗官非','yiji':'防备凶煞行兵打仗凶杀打斗'},
        '玄武':{'wuxing':'水','jixiong':'凶','meaning':'偷盗谎言口舌聪明','person':'聪明多智的人盗贼小人善于伪装的人','thing':'暗昧不明之事道听途说偷盗逃亡','yiji':'提防奸细盗贼得奇门则无妨'},
        '九地':{'wuxing':'土','jixiong':'吉','meaning':'厚重保守缓慢收藏','person':'低调踏实的人老人守成者','thing':'低旧矮慢陈年旧事稳定发展','yiji':'屯兵固守播种养殖利于守成'},
        '九天':{'wuxing':'金','jixiong':'吉','meaning':'高远主动开拓威严','person':'领导长辈父辈志向远大的人积极行动的人','thing':'启动开拓远行高处公开扩大','yiji':'行兵扬兵主动出击大展鸿图'}
    };
    var BASHEN_ORDER = ['值符','腾蛇','太阴','六合','白虎','玄武','九地','九天'];

    var JIEQI_JU = {
        '冬至':['阳',1,7,4],'小寒':['阳',2,8,5],'大寒':['阳',3,9,6],
        '立春':['阳',8,5,2],'雨水':['阳',9,6,3],'惊蛰':['阳',1,7,4],
        '春分':['阳',3,9,6],'清明':['阳',4,1,7],'谷雨':['阳',5,2,8],
        '立夏':['阳',4,1,7],'小满':['阳',5,2,8],'芒种':['阳',6,3,9],
        '夏至':['阴',9,3,6],'小暑':['阴',8,2,5],'大暑':['阴',7,1,4],
        '立秋':['阴',2,5,8],'处暑':['阴',1,4,7],'白露':['阴',9,3,6],
        '秋分':['阴',7,1,4],'寒露':['阴',6,9,3],'霜降':['阴',5,8,2],
        '立冬':['阴',6,9,3],'小雪':['阴',5,8,2],'大雪':['阴',4,7,1]
    };
    var JIEQI_DATES = {
        '小寒':[1,6],'大寒':[1,20],'立春':[2,4],'雨水':[2,19],
        '惊蛰':[3,6],'春分':[3,21],'清明':[4,5],'谷雨':[4,20],
        '立夏':[5,6],'小满':[5,21],'芒种':[6,6],'夏至':[6,21],
        '小暑':[7,7],'大暑':[7,23],'立秋':[8,8],'处暑':[8,23],
        '白露':[9,8],'秋分':[9,23],'寒露':[10,8],'霜降':[10,23],
        '立冬':[11,7],'小雪':[11,22],'大雪':[12,7],'冬至':[12,22]
    };
    var JIEQI_SEQUENCE = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨',
        '立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑',
        '白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];

    var YIMA = {
        '申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申',
        '巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳'
    };

    var GEJU_LIST = {
        '青龙返首':{'type':'吉','condition':'戊加丙','desc':'天盘戊加地盘丙，母子相顾，百事皆吉'},
        '飞鸟跌穴':{'type':'吉','condition':'丙加戊','desc':'天盘丙加地盘戊，如鸟归巢，百事吉'},
        '三奇得使':{'type':'吉','condition':'乙丙丁加临值使门','desc':'三奇加临值使门，百无禁忌'},
        '玉女守门':{'type':'吉','condition':'值使门落宫遇地盘丁奇','desc':'利于宴会喜乐婚姻之事'},
        '三奇升殿':{'type':'吉','condition':'乙临震/丙临离/丁临兑','desc':'三奇到禄地，百事皆宜'},
        '天显时格':{'type':'吉','condition':'六甲旬首值班时','desc':'伏吟局但不为凶反为吉'},
        '奇仪相合':{'type':'吉','condition':'乙庚/丙辛/丁壬/甲己/戊癸同宫','desc':'凡事有和合之象主和解'},
        '门宫和义':{'type':'吉','condition':'门生宫为和/宫生门为义','desc':'遇吉门凡事皆吉'},
        '三奇贵人升殿':{'type':'吉','condition':'乙到震丙到离丁到兑','desc':'三奇到临官位百事皆宜'},
        '奇游禄位':{'type':'吉','condition':'乙到震丙到巽丁到离','desc':'三奇到临官位上官赴任大吉'},
        '天遁':{'type':'吉','condition':'丙奇+生门+丁奇','desc':'百事生旺利于行军求官经商婚姻'},
        '地遁':{'type':'吉','condition':'乙奇+开门+己','desc':'宜安营扎寨埋伏建筑修造'},
        '人遁':{'type':'吉','condition':'丁奇+休门+太阴','desc':'宜探密伏藏和谈求贤结婚交易'},
        '风遁':{'type':'吉','condition':'乙奇+吉门+巽宫','desc':'宜顺水推舟利于出行迁移'},
        '云遁':{'type':'吉','condition':'乙奇+吉门+辛','desc':'宜求雨立营寨造军械'},
        '龙遁':{'type':'吉','condition':'乙奇或癸+吉门+坎宫','desc':'宜修桥凿井水战掩捕'},
        '虎遁':{'type':'吉','condition':'庚+开门+兑宫或乙辛+生门+艮宫','desc':'宜安营扎寨设隐埋伏修筑建造'},
        '神遁':{'type':'吉','condition':'丙奇+生门+九天','desc':'宜攻虚开路造像教化'},
        '鬼遁':{'type':'吉','condition':'丁奇+杜门+九地','desc':'宜偷营扎寨设伪伏虚'},
        '青龙逃走':{'type':'凶','condition':'乙加辛','desc':'百事皆凶破财离散'},
        '白虎猖狂':{'type':'凶','condition':'辛加乙','desc':'出入惊恐远行灾祸婚姻大凶'},
        '朱雀投江':{'type':'凶','condition':'丁加癸','desc':'文书牵连音信沉溺口舌官司'},
        '腾蛇夭矫':{'type':'凶','condition':'癸加丁','desc':'口舌官司虚惊不宁合作散伙'},
        '荧入太白':{'type':'凶','condition':'丙加庚','desc':'贼必去测出行必走求财折本'},
        '太白入荧':{'type':'凶','condition':'庚加丙','desc':'贼必来需防偷营占病大凶'},
        '大格':{'type':'凶','condition':'庚加癸','desc':'寅申相冲百事凶'},
        '小格':{'type':'凶','condition':'庚加壬','desc':'壬水流动百事凶'},
        '伏吟':{'type':'凶','condition':'星门在本宫不动','desc':'伏吟为最凶纵得吉门不堪使'},
        '反吟':{'type':'凶','condition':'星门在对冲宫','desc':'反吟反复多变纵得吉门不堪使'},
        '五不遇时':{'type':'凶','condition':'时干克日干','desc':'时干来克日干上号日月损光明'}
    };

    var SANQI_LIUYI_ATTR = {
        '戊':{'wuxing':'土','meaning':'本金资本手头现金甲子遁戊','category':'六仪'},
        '己':{'wuxing':'土','meaning':'墓土暗昧甲戌遁己','category':'六仪'},
        '庚':{'wuxing':'金','meaning':'阻碍仇人男方甲申遁庚','category':'六仪'},
        '辛':{'wuxing':'金','meaning':'错误刑伤小路甲午遁辛','category':'六仪'},
        '壬':{'wuxing':'水','meaning':'流动道路变化甲辰遁壬','category':'六仪'},
        '癸':{'wuxing':'水','meaning':'天网关闭终止甲寅遁癸','category':'六仪'},
        '丁':{'wuxing':'火','meaning':'玉女文书钥匙消息女贵人','category':'三奇(星奇)'},
        '丙':{'wuxing':'火','meaning':'月奇男性贵人权威火焰','category':'三奇(月奇)'},
        '乙':{'wuxing':'木','meaning':'日奇女方中医文章花草柔性','category':'三奇(日奇)'}
    };

    var CHONG_GONG = {1:9,2:8,3:7,4:6,5:5,6:4,7:3,8:2,9:1};
    var XUN_SHOU_ZHI = {'甲子':'子','甲戌':'戌','甲申':'申','甲午':'午','甲辰':'辰','甲寅':'寅'};
    var GAN_WUXING = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
    var WUXING_SHENG = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
    var WUXING_KE = {'木':'土','土':'水','水':'火','火':'金','金':'木'};
    var ZHI_TO_GONG_PRECISE = {
        '子':1,'丑':8,'寅':8,'卯':3,'辰':4,'巳':4,
        '午':9,'未':2,'申':2,'酉':7,'戌':6,'亥':6
    };

    // ===== Part 2: 计算函数 =====

    function solar_to_bazi(year, month, day, hour) {
        var lichun_month = 2, lichun_day = 4;
        var gz_year;
        if (month < lichun_month || (month === lichun_month && day < lichun_day)) {
            gz_year = ((year - 1 - 4) % 60 + 60) % 60;
        } else {
            gz_year = ((year - 4) % 60 + 60) % 60;
        }
        var jieqi_for_month = {1:['小寒',12],2:['立春',1],3:['惊蛰',2],4:['清明',3],
            5:['立夏',4],6:['芒种',5],7:['小暑',6],8:['立秋',7],
            9:['白露',8],10:['寒露',9],11:['立冬',10],12:['大雪',11]};
        var jq_info = jieqi_for_month[month] || ['立春',1];
        var jq_name = jq_info[0], prev_month_idx = jq_info[1];
        var jq_date = JIEQI_DATES[jq_name] || [month,1];
        var jq_m = jq_date[0], jq_d = jq_date[1];
        var month_branch_idx;
        if (day < jq_d) { month_branch_idx = prev_month_idx; } else { month_branch_idx = month; }
        var year_gan_idx = gz_year % 10;
        var gz_month_gan = (year_gan_idx * 2 + month_branch_idx) % 10;
        var gz_month_zhi = (month_branch_idx + 2) % 12;
        var mg = TIANGAN[gz_month_gan];
        var mz = DIZHI[gz_month_zhi];
        var base_date = new Date(1900, 0, 1);
        var target_date = new Date(year, month - 1, day);
        var delta_days = Math.round((target_date - base_date) / (86400000));
        var base_gz_idx = 10;
        var gz_day_idx = ((base_gz_idx + delta_days) % 60 + 60) % 60;
        var hour_zhi_idx = Math.floor((hour + 1) / 2) % 12;
        var day_gan_idx = gz_day_idx % 10;
        var hour_gan_idx = (day_gan_idx * 2 + hour_zhi_idx) % 10;
        var gz_hour_idx = hour_gan_idx * 12 + hour_zhi_idx;
        return {
            'year_gan': TIANGAN[gz_year % 10], 'year_zhi': DIZHI[gz_year % 12], 'year_ganzhi': LIUSHIJIAZI[gz_year],
            'month_gan': mg, 'month_zhi': mz, 'month_ganzhi': mg + mz,
            'day_gan': TIANGAN[gz_day_idx % 10], 'day_zhi': DIZHI[gz_day_idx % 12], 'day_ganzhi': LIUSHIJIAZI[gz_day_idx],
            'hour_gan': TIANGAN[hour_gan_idx], 'hour_zhi': DIZHI[hour_zhi_idx], 'hour_ganzhi': TIANGAN[hour_gan_idx] + DIZHI[hour_zhi_idx],
            'day_gz_idx': gz_day_idx, 'hour_gz_idx': gz_hour_idx
        };
    }

    function get_jieqi(month, day) {
        var current_jieqi = '冬至';
        for (var qi = 0; qi < JIEQI_SEQUENCE.length; qi++) {
            var jq = JIEQI_SEQUENCE[qi];
            var jd = JIEQI_DATES[jq];
            var jm = jd[0], jdd = jd[1];
            if (month > jm || (month === jm && day >= jdd)) { current_jieqi = jq; }
        }
        return current_jieqi;
    }

    function get_yuan(day_ganzhi) {
        var futou = XUN_SHOU[day_ganzhi] || '甲子';
        if (futou === '甲子' || futou === '甲午') { return ['上元', futou]; }
        else if (futou === '甲申' || futou === '甲寅') { return ['中元', futou]; }
        else { return ['下元', futou]; }
    }

    function determine_ju(month, day, day_ganzhi) {
        var jieqi = get_jieqi(month, day);
        var yuan_result = get_yuan(day_ganzhi);
        var yuan = yuan_result[0], futou = yuan_result[1];
        if (!JIEQI_JU[jieqi]) { jieqi = '冬至'; }
        var jq_arr = JIEQI_JU[jieqi];
        var dun_type = jq_arr[0], shang = jq_arr[1], zhong = jq_arr[2], xia = jq_arr[3];
        var ju;
        if (yuan === '上元') { ju = shang; }
        else if (yuan === '中元') { ju = zhong; }
        else { ju = xia; }
        return [dun_type, ju, jieqi, yuan, futou];
    }

    function arrange_dipan(dun_type, ju) {
        var dipan = {};
        if (dun_type === '阳') {
            var order = [];
            for (var i = 0; i < 18; i++) { order.push(JIUGONG_ORDER[i % 9]); }
            var start_idx = ju - 1;
            for (var i = 0; i < 9; i++) { dipan[order[start_idx + i]] = SANQI_LIUYI[i]; }
        } else {
            var rev = [];
            for (var i = 8; i >= 0; i--) { rev.push(JIUGONG_ORDER[i]); }
            var order = [];
            for (var i = 0; i < 18; i++) { order.push(rev[i % 9]); }
            var start_idx = 9 - ju;
            for (var i = 0; i < 9; i++) { dipan[order[start_idx + i]] = SANQI_LIUYI[i]; }
        }
        return dipan;
    }

    function find_xun_shou(hour_ganzhi) { return XUN_SHOU[hour_ganzhi] || '甲子'; }

    function find_zhifu_zhishi(dipan, xun_shou) {
        var dun_gan = LIUJIA_DUN[xun_shou] || '戊';
        var zhifu_palace = null;
        for (var palace in dipan) {
            if (dipan.hasOwnProperty(palace)) {
                if (dipan[palace] === dun_gan) { zhifu_palace = parseInt(palace); break; }
            }
        }
        if (zhifu_palace === null) { zhifu_palace = 1; }
        var zhifu_star = '天蓬';
        for (var star in JIUXING) {
            if (JIUXING.hasOwnProperty(star)) {
                if (JIUXING[star]['palace'] === zhifu_palace) { zhifu_star = star; break; }
            }
        }
        var zhishi_door = '休门';
        for (var door in BAMEN) {
            if (BAMEN.hasOwnProperty(door)) {
                if (BAMEN[door]['palace'] === zhifu_palace) { zhishi_door = door; break; }
            }
        }
        return [zhifu_star, zhishi_door, zhifu_palace, dun_gan];
    }

    function arrange_tianpan(dipan, dun_type, zhifu_star, zhifu_palace, hour_gan) {
        var shi_gan_palace = null;
        for (var palace in dipan) {
            if (dipan.hasOwnProperty(palace)) {
                if (dipan[palace] === hour_gan) { shi_gan_palace = parseInt(palace); break; }
            }
        }
        if (shi_gan_palace === null) { shi_gan_palace = 1; }
        var tianpan = {};
        var zhifu_idx = JIUXING_ORDER.indexOf(zhifu_star);
        var palaces = [];
        var start = shi_gan_palace;
        if (dun_type === '阳') {
            for (var i = 0; i < 9; i++) { palaces.push(JIUGONG_ORDER[(JIUGONG_ORDER.indexOf(start) + i) % 9]); }
        } else {
            var rev_order = JIUGONG_ORDER.slice().reverse();
            for (var i = 0; i < 9; i++) { palaces.push(rev_order[(rev_order.indexOf(start) + i) % 9]); }
        }
        for (var i = 0; i < 9; i++) {
            var star = JIUXING_ORDER[(zhifu_idx + i) % 9];
            tianpan[palaces[i]] = star;
        }
        return tianpan;
    }

    function arrange_tianpan_gan(dipan, tianpan) {
        var tianpan_gan = {};
        for (var palace in tianpan) {
            if (tianpan.hasOwnProperty(palace)) {
                var star = tianpan[palace];
                var star_original_palace = JIUXING[star]['palace'];
                tianpan_gan[parseInt(palace)] = dipan[star_original_palace] || '戊';
            }
        }
        return tianpan_gan;
    }

    function arrange_renpan_fixed(dun_type, zhishi_door, zhifu_palace, hour_zhi, xun_shou) {
        var gong_seq = [];
        for (var i = 0; i < JIUGONG_ORDER.length; i++) { if (JIUGONG_ORDER[i] !== 5) gong_seq.push(JIUGONG_ORDER[i]); }
        if (dun_type === '阴') { gong_seq = gong_seq.slice().reverse(); }
        var xun_shou_zhi = XUN_SHOU_ZHI[xun_shou] || '子';
        var hour_zhi_idx = DIZHI.indexOf(hour_zhi);
        var xun_shou_zhi_idx = DIZHI.indexOf(xun_shou_zhi);
        var offset = ((hour_zhi_idx - xun_shou_zhi_idx) % 12 + 12) % 12;
        var zhifu_gong_idx = gong_seq.indexOf(zhifu_palace);
        if (zhifu_gong_idx === -1) zhifu_gong_idx = 0;
        var zhishi_landing_idx = (zhifu_gong_idx + offset) % 8;
        var zhishi_idx = BAMEN_ORDER.indexOf(zhishi_door);
        var renpan = {};
        for (var i = 0; i < 8; i++) {
            var door = BAMEN_ORDER[(zhishi_idx + i) % 8];
            renpan[gong_seq[(zhishi_landing_idx + i) % 8]] = door;
        }
        return renpan;
    }

    function arrange_shenpan(dun_type, tianpan, zhifu_star) {
        var shenpan = {};
        var zhifu_tianpan_gong = null;
        for (var palace in tianpan) {
            if (tianpan.hasOwnProperty(palace)) {
                if (tianpan[palace] === zhifu_star) { zhifu_tianpan_gong = parseInt(palace); break; }
            }
        }
        if (zhifu_tianpan_gong === null) zhifu_tianpan_gong = 1;
        var gong_seq = [];
        for (var i = 0; i < JIUGONG_ORDER.length; i++) { if (JIUGONG_ORDER[i] !== 5) gong_seq.push(JIUGONG_ORDER[i]); }
        if (dun_type === '阴') { gong_seq = gong_seq.slice().reverse(); }
        var zhifu_gong_idx = gong_seq.indexOf(zhifu_tianpan_gong);
        if (zhifu_gong_idx === -1) zhifu_gong_idx = 0;
        for (var i = 0; i < 8; i++) {
            var shen = BASHEN_ORDER[i];
            shenpan[gong_seq[(zhifu_gong_idx + i) % 8]] = shen;
        }
        return shenpan;
    }

    function get_kongwang(hour_ganzhi) {
        var xun = XUN_SHOU[hour_ganzhi] || '甲子';
        var kong_zhi = XUN_KONG[xun] || ['戌','亥'];
        var kong_gongs = [];
        for (var i = 0; i < kong_zhi.length; i++) { kong_gongs.push(ZHI_TO_GONG_PRECISE[kong_zhi[i]] || 1); }
        return [kong_gongs, kong_zhi];
    }

    function get_yima(day_zhi) { return YIMA[day_zhi] || '寅'; }

    function get_star_wangshuai(star, month) {
        var star_wuxing = JIUXING[star]['wuxing'];
        var month_wuxing_map = {1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火',10:'土',11:'水',12:'水'};
        var m_wuxing = month_wuxing_map[month] || '土';
        var wuxing_shengke = {
            '水,水':'相','水,木':'旺','水,火':'休','水,土':'囚','水,金':'死',
            '木,木':'相','木,火':'旺','木,土':'休','木,金':'囚','木,水':'死',
            '火,火':'相','火,土':'旺','火,金':'休','火,水':'囚','火,木':'死',
            '土,土':'相','土,金':'旺','土,水':'休','土,木':'囚','土,火':'死',
            '金,金':'相','金,水':'旺','金,木':'休','金,火':'囚','金,土':'死'
        };
        var key = star_wuxing + ',' + m_wuxing;
        return wuxing_shengke[key] || '平';
    }

    function check_geju_extended(dipan, tianpan, tianpan_gan, renpan, shenpan, hour_gan, day_gan, zhishi_door, zhifu_palace) {
        var results = {};
        for (var palace = 1; palace <= 9; palace++) {
            if (palace === 5) continue;
            var tg = tianpan_gan[palace] || '';
            var dg = dipan[palace] || '';
            if (tg === '戊' && dg === '丙') results['青龙返首'] = palace;
            if (tg === '丙' && dg === '戊') results['飞鸟跌穴'] = palace;
            if (tg === '乙' && dg === '辛') results['青龙逃走'] = palace;
            if (tg === '辛' && dg === '乙') results['白虎猖狂'] = palace;
            if (tg === '丁' && dg === '癸') results['朱雀投江'] = palace;
            if (tg === '癸' && dg === '丁') results['腾蛇夭矫'] = palace;
            if (tg === '丙' && dg === '庚') results['荧入太白'] = palace;
            if (tg === '庚' && dg === '丙') results['太白入荧'] = palace;
            if (tg === '庚' && dg === '癸') results['大格'] = palace;
            if (tg === '庚' && dg === '壬') results['小格'] = palace;
        }
        for (var palace in tianpan) {
            if (tianpan.hasOwnProperty(palace)) {
                var p = parseInt(palace);
                if (p !== 5 && JIUXING[tianpan[palace]]['palace'] === p) { results['伏吟'] = p; break; }
            }
        }
        for (var palace in tianpan) {
            if (tianpan.hasOwnProperty(palace)) {
                var p = parseInt(palace);
                if (p !== 5 && JIUXING[tianpan[palace]]['palace'] === (CHONG_GONG[p] || p)) { results['反吟'] = p; break; }
            }
        }
        var shi_gan_wx = GAN_WUXING[hour_gan] || '土';
        var day_gan_wx = GAN_WUXING[day_gan] || '土';
        if (WUXING_KE[shi_gan_wx] === day_gan_wx) results['五不遇时'] = true;
        var sanqi_deshi_pairs = [
            ['乙','己','乙奇得使(甲戌)'],['乙','辛','乙奇得使(甲午)'],
            ['丙','戊','丙奇得使(甲子)'],['丙','庚','丙奇得使(甲申)'],
            ['丁','壬','丁奇得使(甲辰)'],['丁','癸','丁奇得使(甲寅)']
        ];
        for (var palace = 1; palace <= 9; palace++) {
            if (palace === 5) continue;
            var tg = tianpan_gan[palace] || '';
            var dg = dipan[palace] || '';
            for (var pi = 0; pi < sanqi_deshi_pairs.length; pi++) {
                if (tg === sanqi_deshi_pairs[pi][0] && dg === sanqi_deshi_pairs[pi][1]) {
                    results['三奇得使_' + sanqi_deshi_pairs[pi][2]] = palace;
                }
            }
        }
        var zhishi_palace = null;
        for (var p in renpan) { if (renpan.hasOwnProperty(p)) { if (renpan[p] === zhishi_door) { zhishi_palace = parseInt(p); break; } } }
        if (zhishi_palace && dipan[zhishi_palace] === '丁') results['玉女守门'] = zhishi_palace;
        for (var palace in tianpan) {
            if (tianpan.hasOwnProperty(palace)) {
                var p = parseInt(palace);
                var tg = tianpan_gan[p] || '';
                if (tg === '乙' && p === 3) results['三奇升殿_乙奇'] = p;
                if (tg === '丙' && p === 9) results['三奇升殿_丙奇'] = p;
                if (tg === '丁' && p === 7) results['三奇升殿_丁奇'] = p;
            }
        }
        for (var palace = 1; palace <= 9; palace++) {
            if (palace === 5) continue;
            var tg = tianpan_gan[palace] || '';
            var dg = dipan[palace] || '';
            var star = tianpan[palace] || '';
            var door = renpan[palace] || '';
            var shen = shenpan[palace] || '';
            if (tg === '丙' && door === '生门' && dg === '丁') results['天遁'] = palace;
            if (tg === '乙' && door === '开门' && dg === '己') results['地遁'] = palace;
            if (tg === '丁' && door === '休门' && shen === '太阴') results['人遁'] = palace;
            if (tg === '乙' && palace === 4 && (door === '开门' || door === '休门' || door === '生门')) results['风遁'] = palace;
            if (tg === '乙' && dg === '辛' && (door === '开门' || door === '休门' || door === '生门')) results['云遁'] = palace;
            if ((tg === '乙' || tg === '癸') && palace === 1 && (door === '开门' || door === '休门' || door === '生门')) results['龙遁'] = palace;
            if (tg === '庚' && door === '开门' && palace === 7) results['虎遁'] = palace;
            if (tg === '丙' && door === '生门' && shen === '九天') results['神遁'] = palace;
            if (tg === '丁' && door === '杜门' && shen === '九地') results['鬼遁'] = palace;
        }
        var he_pairs = [['乙','庚'],['庚','乙'],['丙','辛'],['辛','丙'],['丁','壬'],['壬','丁'],['戊','癸'],['癸','戊']];
        for (var palace = 1; palace <= 9; palace++) {
            if (palace === 5) continue;
            var tg = tianpan_gan[palace] || '';
            var dg = dipan[palace] || '';
            for (var hi = 0; hi < he_pairs.length; hi++) {
                if (tg === he_pairs[hi][0] && dg === he_pairs[hi][1]) { results['奇仪相合_' + tg + '+' + dg] = palace; }
            }
        }
        for (var palace = 1; palace <= 9; palace++) {
            if (palace === 5) continue;
            var door = renpan[palace] || '';
            if (!door) continue;
            var door_wx = BAMEN[door] ? BAMEN[door]['wuxing'] : '';
            var gong_wx = JIUGONG[palace] ? JIUGONG[palace]['wx'] : '';
            if (WUXING_SHENG[door_wx] === gong_wx) results['门宫和_' + door + '生' + palace + '宫'] = palace;
            else if (WUXING_SHENG[gong_wx] === door_wx) results['门宫义_' + palace + '宫生' + door] = palace;
        }
        for (var palace = 1; palace <= 9; palace++) {
            if (palace === 5) continue;
            var door = renpan[palace] || '';
            if (!door) continue;
            var door_wx = BAMEN[door] ? BAMEN[door]['wuxing'] : '';
            var gong_wx = JIUGONG[palace] ? JIUGONG[palace]['wx'] : '';
            if (WUXING_KE[door_wx] === gong_wx) results['门迫_' + door + '克' + palace + '宫'] = palace;
        }
        return results;
    }

    function analyze_zhuke(dipan, day_gan, hour_gan) {
        var ri_gan_gong = null, shi_gan_gong = null;
        for (var p in dipan) {
            if (dipan.hasOwnProperty(p)) {
                if (dipan[p] === day_gan) ri_gan_gong = parseInt(p);
                if (dipan[p] === hour_gan) shi_gan_gong = parseInt(p);
            }
        }
        var result = {
            '主方(日干)': ri_gan_gong ? day_gan + '在' + ri_gan_gong + '宫' : day_gan + '不在地盘',
            '客方(时干)': shi_gan_gong ? hour_gan + '在' + shi_gan_gong + '宫' : hour_gan + '不在地盘',
            '主宫五行': ri_gan_gong ? JIUGONG[ri_gan_gong]['wx'] : '未知',
            '客宫五行': shi_gan_gong ? JIUGONG[shi_gan_gong]['wx'] : '未知',
            '主客生克': '未知',
            '整体主客': '未知'
        };
        if (ri_gan_gong && shi_gan_gong) {
            var ri_wx = JIUGONG[ri_gan_gong]['wx'];
            var shi_wx = JIUGONG[shi_gan_gong]['wx'];
            if (ri_wx === shi_wx) { result['主客生克'] = '比和(势均力敌)'; result['整体主客'] = '主客均势'; }
            else if (WUXING_SHENG[ri_wx] === shi_wx) { result['主客生克'] = '主生客(利客)'; result['整体主客'] = '客胜主'; }
            else if (WUXING_SHENG[shi_wx] === ri_wx) { result['主客生克'] = '客生主(利主)'; result['整体主客'] = '主胜客'; }
            else if (WUXING_KE[ri_wx] === shi_wx) { result['主客生克'] = '主克客(利主)'; result['整体主客'] = '主胜客'; }
            else if (WUXING_KE[shi_wx] === ri_wx) { result['主客生克'] = '客克主(利客)'; result['整体主客'] = '客胜主'; }
        }
        return result;
    }

    function calc_gan_shengke(dipan, tianpan_gan) {
        var result = {};
        for (var palace = 1; palace <= 9; palace++) {
            var tg = tianpan_gan[palace] || '';
            var dg = dipan[palace] || '';
            if (!tg || !dg) { result[palace + '宫天地盘干关系'] = '未知'; continue; }
            var tg_wx = GAN_WUXING[tg] || '土';
            var dg_wx = GAN_WUXING[dg] || '土';
            if (tg_wx === dg_wx) result[palace + '宫天地盘干关系'] = tg + '+' + dg + ' 比和';
            else if (WUXING_SHENG[tg_wx] === dg_wx) result[palace + '宫天地盘干关系'] = tg + '生' + dg + ' 天盘生地盘';
            else if (WUXING_SHENG[dg_wx] === tg_wx) result[palace + '宫天地盘干关系'] = dg + '生' + tg + ' 地盘生天盘';
            else if (WUXING_KE[tg_wx] === dg_wx) result[palace + '宫天地盘干关系'] = tg + '克' + dg + ' 天盘克地盘';
            else if (WUXING_KE[dg_wx] === tg_wx) result[palace + '宫天地盘干关系'] = dg + '克' + tg + ' 地盘克天盘';
            else result[palace + '宫天地盘干关系'] = tg + '+' + dg;
        }
        return result;
    }

    function findGongForGan(dipan, gan) {
        var gongs = [];
        for (var p in dipan) { if (dipan.hasOwnProperty(p) && dipan[p] === gan) gongs.push(parseInt(p)); }
        return gongs;
    }

    function findGongForVal(tianpan, star) {
        var gongs = [];
        for (var p in tianpan) { if (tianpan.hasOwnProperty(p) && tianpan[p] === star) gongs.push(parseInt(p)); }
        return gongs;
    }

    // ===== Part 3: 标签生成 =====

    function _generate(year, month, day, hour, minute, options) {
        options = options || {};
        var bazi;

        if (options.ganzhi && options.ganzhi.dayGz) {
            var gz = options.ganzhi;
            var yg = gz.yearGz || '';
            var mg = gz.monthGz || '';
            var dg = gz.dayGz || '';
            var hg = gz.hourGz || '';
            bazi = {
                'year_gan': yg ? yg[0] : '', 'year_zhi': yg ? yg[1] : '', 'year_ganzhi': yg,
                'month_gan': mg ? mg[0] : '', 'month_zhi': mg ? mg[1] : '', 'month_ganzhi': mg,
                'day_gan': dg ? dg[0] : '', 'day_zhi': dg ? dg[1] : '', 'day_ganzhi': dg,
                'hour_gan': hg ? hg[0] : '', 'hour_zhi': hg ? hg[1] : '', 'hour_ganzhi': hg,
                'day_gz_idx': 0, 'hour_gz_idx': 0
            };
        } else {
            bazi = solar_to_bazi(year, month, day, hour);
        }

        var ju_result = determine_ju(month, day, bazi['day_ganzhi']);
        var dun_type = ju_result[0], ju = ju_result[1], jieqi = ju_result[2], yuan = ju_result[3], futou = ju_result[4];
        var dipan = arrange_dipan(dun_type, ju);
        var xun_shou = find_xun_shou(bazi['hour_ganzhi']);
        var zf_result = find_zhifu_zhishi(dipan, xun_shou);
        var zhifu_star = zf_result[0], zhishi_door = zf_result[1], zhifu_palace = zf_result[2], dun_gan = zf_result[3];
        var tianpan = arrange_tianpan(dipan, dun_type, zhifu_star, zhifu_palace, bazi['hour_gan']);
        var shenpan = arrange_shenpan(dun_type, tianpan, zhifu_star);
        var tianpan_gan = arrange_tianpan_gan(dipan, tianpan);
        var renpan = arrange_renpan_fixed(dun_type, zhishi_door, zhifu_palace, bazi['hour_zhi'], xun_shou);
        var kw_result = get_kongwang(bazi['hour_ganzhi']);
        var kong_gongs = kw_result[0], kong_zhis = kw_result[1];
        var yima = get_yima(bazi['day_zhi']);
        var geju_ext = check_geju_extended(dipan, tianpan, tianpan_gan, renpan, shenpan, bazi['hour_gan'], bazi['day_gan'], zhishi_door, zhifu_palace);
        var zhuke = analyze_zhuke(dipan, bazi['day_gan'], bazi['hour_gan']);
        var gan_shengke = calc_gan_shengke(dipan, tianpan_gan);

        var layers = {};

        // L1 基础排盘
        layers['L1_基础排盘'] = {
            '阴阳遁': dun_type + '遁' + ju + '局',
            '局数': String(ju),
            '节气': jieqi,
            '三元': yuan,
            '符头': futou,
            '旬首': xun_shou,
            '值符星': zhifu_star,
            '值使门': zhishi_door,
            '时干': bazi['hour_gan'],
            '日干': bazi['day_gan'],
            '空亡地支': kong_zhis.join(','),
            '驿马': yima
        };

        // L2 九宫属性
        layers['L2_九宫属性'] = {};
        for (var g = 1; g <= 9; g++) {
            var ginfo = JIUGONG[g];
            layers['L2_九宫属性'][g + '宫'] = ginfo['gua'] + '/' + ginfo['wx'] + '/' + ginfo['fang'];
        }

        // L3 地盘干分布
        layers['L3_地盘干分布'] = {};
        for (var g = 1; g <= 9; g++) {
            layers['L3_地盘干分布'][g + '宫地盘干'] = dipan[g] || '';
        }

        // L4 天盘星分布
        layers['L4_天盘星分布'] = {};
        for (var g = 1; g <= 9; g++) {
            var star = tianpan[g] || '';
            layers['L4_天盘星分布'][g + '宫天盘星'] = star;
        }

        // L4b 天盘干分布 OPT1
        layers['L4b_天盘干分布'] = {};
        for (var g = 1; g <= 9; g++) {
            layers['L4b_天盘干分布'][g + '宫天盘干'] = tianpan_gan[g] || '';
        }

        // L5 九星完整属性
        layers['L5_九星属性'] = {};
        for (var si = 0; si < JIUXING_ORDER.length; si++) {
            var star = JIUXING_ORDER[si];
            var attr = JIUXING[star];
            var ws = get_star_wangshuai(star, month);
            layers['L5_九星属性'][star + '_五行'] = attr['wuxing'];
            layers['L5_九星属性'][star + '_本位宫'] = attr['palace'] + '宫';
            layers['L5_九星属性'][star + '_阴阳'] = attr['yinyang'];
            layers['L5_九星属性'][star + '_吉凶'] = attr['jixiong'];
            layers['L5_九星属性'][star + '_核心特质'] = attr['trait'];
            layers['L5_九星属性'][star + '_旺相月'] = attr['wang'];
            layers['L5_九星属性'][star + '_当前旺衰'] = ws;
        }

        // L6 人盘门分布
        layers['L6_人盘门分布'] = {};
        for (var g = 1; g <= 9; g++) {
            if (g === 5) continue;
            layers['L6_人盘门分布'][g + '宫八门'] = renpan[g] || '';
        }

        // L6b 人盘门分布修正 OPT2
        layers['L6b_人盘门分布修正'] = {};
        for (var g = 1; g <= 9; g++) {
            if (g === 5) continue;
            layers['L6b_人盘门分布修正'][g + '宫八门'] = renpan[g] || '';
        }

        // L7 八门完整属性
        layers['L7_八门属性'] = {};
        for (var di = 0; di < BAMEN_ORDER.length; di++) {
            var door = BAMEN_ORDER[di];
            var attr = BAMEN[door];
            layers['L7_八门属性'][door + '_五行'] = attr['wuxing'];
            layers['L7_八门属性'][door + '_本位宫'] = attr['palace'] + '宫';
            layers['L7_八门属性'][door + '_吉凶'] = attr['jixiong'];
            layers['L7_八门属性'][door + '_核心含义'] = attr['meaning'];
            layers['L7_八门属性'][door + '_宜'] = attr['yi'];
            layers['L7_八门属性'][door + '_忌'] = attr['ji'];
            layers['L7_八门属性'][door + '_旺月'] = attr['wang'];
        }

        // L8 神盘神分布
        layers['L8_神盘神分布'] = {};
        for (var g = 1; g <= 9; g++) {
            if (g === 5) continue;
            layers['L8_神盘神分布'][g + '宫八神'] = shenpan[g] || '';
        }

        // L9 八神完整属性
        layers['L9_八神属性'] = {};
        for (var bi = 0; bi < BASHEN_ORDER.length; bi++) {
            var shen = BASHEN_ORDER[bi];
            var attr = BASHEN[shen];
            layers['L9_八神属性'][shen + '_五行'] = attr['wuxing'];
            layers['L9_八神属性'][shen + '_吉凶'] = attr['jixiong'];
            layers['L9_八神属性'][shen + '_核心象意'] = attr['meaning'];
            layers['L9_八神属性'][shen + '_人物象意'] = attr['person'];
            layers['L9_八神属性'][shen + '_事物象意'] = attr['thing'];
            layers['L9_八神属性'][shen + '_宜忌'] = attr['yiji'];
        }

        // L10 三奇六仪属性
        layers['L10_三奇六仪属性'] = {};
        for (var qi = 0; qi < SANQI_LIUYI.length; qi++) {
            var gan = SANQI_LIUYI[qi];
            var attr = SANQI_LIUYI_ATTR[gan];
            layers['L10_三奇六仪属性'][gan] = attr['wuxing'] + '/' + attr['category'] + '/' + attr['meaning'];
        }

        // L11 格局吉凶判断
        layers['L11_格局吉凶'] = {};
        for (var gn in GEJU_LIST) {
            if (!GEJU_LIST.hasOwnProperty(gn)) continue;
            var ginfo = GEJU_LIST[gn];
            var triggered = geju_ext[gn] !== undefined;
            layers['L11_格局吉凶'][gn] = triggered ? '✅' + ginfo['type'] + '·' + ginfo['desc'] : '—不成立';
        }

        // L11b 格局扩展检测 OPT3
        layers['L11b_格局扩展检测'] = {};
        var sortedKeys = Object.keys(geju_ext).sort();
        for (var ki = 0; ki < sortedKeys.length; ki++) {
            var gname = sortedKeys[ki];
            var val = geju_ext[gname];
            layers['L11b_格局扩展检测'][gname] = String(val);
        }

        // L12 宫位综合信息
        layers['L12_宫位综合信息'] = {};
        for (var g = 1; g <= 9; g++) {
            var ginfo = JIUGONG[g];
            layers['L12_宫位综合信息'][g + '宫_宫位五行'] = ginfo['wx'];
            layers['L12_宫位综合信息'][g + '宫_地盘干'] = dipan[g] || '';
            layers['L12_宫位综合信息'][g + '宫_天盘星'] = tianpan[g] || '';
            var starName = tianpan[g] || '';
            layers['L12_宫位综合信息'][g + '宫_星吉凶'] = JIUXING[starName] ? JIUXING[starName]['jixiong'] : '';
            layers['L12_宫位综合信息'][g + '宫_天盘干'] = tianpan_gan[g] || '';
            if (g !== 5) {
                var doorName = renpan[g] || '';
                var shenName = shenpan[g] || '';
                layers['L12_宫位综合信息'][g + '宫_八门'] = doorName;
                layers['L12_宫位综合信息'][g + '宫_门吉凶'] = BAMEN[doorName] ? BAMEN[doorName]['jixiong'] : '';
                layers['L12_宫位综合信息'][g + '宫_八神'] = shenName;
                layers['L12_宫位综合信息'][g + '宫_神吉凶'] = BASHEN[shenName] ? BASHEN[shenName]['jixiong'] : '';
            } else {
                layers['L12_宫位综合信息'][g + '宫_八门'] = '中宫无门';
                layers['L12_宫位综合信息'][g + '宫_门吉凶'] = '无';
                layers['L12_宫位综合信息'][g + '宫_八神'] = '中宫无神';
                layers['L12_宫位综合信息'][g + '宫_神吉凶'] = '无';
            }
        }

        // L12b 天地盘干生克 OPT5
        layers['L12b_天地盘干生克'] = {};
        for (var g = 1; g <= 9; g++) {
            layers['L12b_天地盘干生克'][g + '宫天地盘干关系'] = gan_shengke[g + '宫天地盘干关系'] || '未知';
        }

        // L13 用神取用
        layers['L13_用神取用'] = {};
        var yg2 = findGongForGan(dipan, bazi['year_gan']);
        layers['L13_用神取用']['年干落宫'] = bazi['year_gan'] + '在' + (yg2.length ? yg2.join(',') + '宫' : '[未落地盘]');
        var mg2 = findGongForGan(dipan, bazi['month_gan']);
        layers['L13_用神取用']['月干落宫'] = bazi['month_gan'] + '在' + (mg2.length ? mg2.join(',') + '宫' : '[未落地盘]');
        var dg2 = findGongForGan(dipan, bazi['day_gan']);
        layers['L13_用神取用']['日干落宫'] = bazi['day_gan'] + '在' + (dg2.length ? dg2.join(',') + '宫' : '[未落地盘]');
        var hg2 = findGongForGan(dipan, bazi['hour_gan']);
        layers['L13_用神取用']['时干落宫'] = bazi['hour_gan'] + '在' + (hg2.length ? hg2.join(',') + '宫' : '[未落地盘]');
        var zf2 = findGongForVal(tianpan, zhifu_star);
        layers['L13_用神取用']['值符(领导贵人)'] = zhifu_star + '在' + zf2.join(',') + '宫';
        var zs_gongs = [];
        for (var p in renpan) { if (renpan.hasOwnProperty(p) && renpan[p] === zhishi_door) zs_gongs.push(parseInt(p)); }
        layers['L13_用神取用']['值使(执行方向)'] = zhishi_door + '在' + zs_gongs.join(',') + '宫';
        var lh_gongs = [];
        for (var p in shenpan) { if (shenpan.hasOwnProperty(p) && shenpan[p] === '六合') lh_gongs.push(parseInt(p)); }
        layers['L13_用神取用']['六合(合作中介)'] = '六合在' + (lh_gongs.length ? lh_gongs.join(',') + '宫' : '[未排]');
        var sm_gongs = [];
        for (var p in renpan) { if (renpan.hasOwnProperty(p) && renpan[p] === '生门') sm_gongs.push(parseInt(p)); }
        layers['L13_用神取用']['生门(财运求财)'] = '生门在' + (sm_gongs.length ? sm_gongs.join(',') + '宫' : '[未排]');
        var rr_gongs = [];
        for (var p in tianpan) { if (tianpan.hasOwnProperty(p) && tianpan[p] === '天芮') rr_gongs.push(parseInt(p)); }
        layers['L13_用神取用']['天芮(疾病问题)'] = '天芮在' + (rr_gongs.length ? rr_gongs.join(',') + '宫' : '[未排]');
        var xg_gongs = [];
        for (var p in tianpan) { if (tianpan.hasOwnProperty(p) && tianpan[p] === '天心') xg_gongs.push(parseInt(p)); }
        layers['L13_用神取用']['天心(医药治疗)'] = '天心在' + (xg_gongs.length ? xg_gongs.join(',') + '宫' : '[未排]');

        // L14 空亡驿马
        var zhi_to_gong_map = {'子':1,'丑':8,'寅':8,'卯':3,'辰':4,'巳':4,'午':9,'未':2,'申':2,'酉':7,'戌':6,'亥':6};
        var yimaGong = zhi_to_gong_map[yima] || 1;
        layers['L14_空亡驿马'] = {
            '时空亡宫': kong_gongs.join(','),
            '时空亡地支': kong_zhis.join(','),
            '时驿马': yima,
            '驿马宫': String(yimaGong)
        };

        // L15 旺衰评估
        layers['L15_旺衰评估'] = {};
        for (var si = 0; si < JIUXING_ORDER.length; si++) {
            var star = JIUXING_ORDER[si];
            var ws = get_star_wangshuai(star, month);
            layers['L15_旺衰评估'][star] = ws;
        }

        // L16 主客分析 OPT4
        layers['L16_主客分析'] = {
            '主方(日干)': zhuke['主方(日干)'],
            '客方(时干)': zhuke['客方(时干)'],
            '主宫五行': zhuke['主宫五行'],
            '客宫五行': zhuke['客宫五行'],
            '主客生克': zhuke['主客生克'],
            '整体主客': zhuke['整体主客']
        };

        // L17 盘面总评
        var ji_men = [], xiong_men = [], ji_xing = [], xiong_xing = [], ji_shen = [], xiong_shen = [];
        for (var p in renpan) {
            if (renpan.hasOwnProperty(p)) {
                var d = renpan[p]; var dj3 = BAMEN[d] ? BAMEN[d]['jixiong'] : '';
                if (dj3.indexOf('吉') >= 0) ji_men.push(p);
                if (dj3.indexOf('凶') >= 0) xiong_men.push(p);
            }
        }
        for (var p in tianpan) {
            if (tianpan.hasOwnProperty(p)) {
                var s = tianpan[p]; var sj3 = JIUXING[s] ? JIUXING[s]['jixiong'] : '';
                if (sj3.indexOf('吉') >= 0 || sj3.indexOf('次吉') >= 0) ji_xing.push(p);
                if (sj3.indexOf('凶') >= 0) xiong_xing.push(p);
            }
        }
        for (var p in shenpan) {
            if (shenpan.hasOwnProperty(p)) {
                var sh = shenpan[p]; var sj4 = BASHEN[sh] ? BASHEN[sh]['jixiong'] : '';
                if (sj4.indexOf('吉') >= 0) ji_shen.push(p);
                if (sj4.indexOf('凶') >= 0) xiong_shen.push(p);
            }
        }
        var jiNames = ['青龙返首','飞鸟跌穴','三奇得使','玉女守门','三奇升殿','天遁','地遁','人遁','风遁','云遁','龙遁','虎遁','神遁','鬼遁','奇仪相合','门宫和','门宫义'];
        var xiongNames = ['青龙逃走','白虎猖狂','朱雀投江','腾蛇夭矫','荧入太白','太白入荧','大格','小格','伏吟','反吟','五不遇时','门迫'];
        var triggered_ji = [], triggered_xiong = [];
        for (var gn in geju_ext) {
            if (!geju_ext.hasOwnProperty(gn)) continue;
            var isJi2 = false;
            for (var ji2 = 0; ji2 < jiNames.length; ji2++) { if (gn === jiNames[ji2] || gn.indexOf(jiNames[ji2]) === 0) { isJi2 = true; break; } }
            if (isJi2) { triggered_ji.push(gn); continue; }
            var isXiong2 = false;
            for (var xi3 = 0; xi3 < xiongNames.length; xi3++) { if (gn === xiongNames[xi3] || gn.indexOf(xiongNames[xi3]) === 0) { isXiong2 = true; break; } }
            if (isXiong2) triggered_xiong.push(gn);
        }
        var overallJi = (ji_men.length + ji_xing.length + ji_shen.length) > (xiong_men.length + xiong_xing.length + xiong_shen.length);
        var shi_gan_gong = null;
        for (var p in dipan) { if (dipan.hasOwnProperty(p) && dipan[p] === bazi['hour_gan']) shi_gan_gong = parseInt(p); }
        layers['L17_盘面总评'] = {
            '整体吉凶': overallJi ? '吉' : '凶',
            '用宫(时干宫)': shi_gan_gong ? shi_gan_gong + '宫' : '未知',
            '吉门数量': String(ji_men.length),
            '凶门数量': String(xiong_men.length),
            '吉星数量': String(ji_xing.length),
            '凶星数量': String(xiong_xing.length),
            '吉神数量': String(ji_shen.length),
            '凶神数量': String(xiong_shen.length),
            '成立吉格': triggered_ji.length ? triggered_ji.join(',') : '无',
            '成立凶格': triggered_xiong.length ? triggered_xiong.join(',') : '无'
        };

        return { layers: layers, dun_type: dun_type, ju: ju, zhifu_star: zhifu_star, zhishi_door: zhishi_door };
    }

    // ===== 标准接口 =====

    window.Systems.qimen = function(year, month, day, hour, minute, options) {
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
        if (result.dun_type && result.ju) summaryParts.push(result.dun_type + '遁' + result.ju + '局');
        if (result.zhifu_star) summaryParts.push('值符:' + result.zhifu_star);
        if (result.zhishi_door) summaryParts.push('值使:' + result.zhishi_door);

        return {
            dimensions: dimensions,
            name: '奇门遁甲',
            summary: summaryParts.join(' · ')
        };
    };

})();
