/**
 * 大六壬 (Da Liu Ren) 标签生成模块
 * 从 liuren.html 提取的纯计算逻辑
 * 17层 275+维度 + 5项理论驱动优化
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

    // ===== Part 1: 基础数据表 =====

    var TIANGAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var DIZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    var LIUSHIJIAZI = [];
    for (var i = 0; i < 60; i++) { LIUSHIJIAZI.push(TIANGAN[i%10] + DIZHI[i%12]); }

    var GAN_JI_GONG = {
        "甲":["寅","木"],"乙":["辰","土"],"丙":["巳","火"],"丁":["未","土"],
        "戊":["巳","火"],"己":["未","土"],"庚":["申","金"],"辛":["戌","土"],
        "壬":["亥","水"],"癸":["丑","土"]
    };

    var YUEJIANG = {
        "亥":["登明","雨水~春分"],"戌":["河魁","春分~谷雨"],"酉":["从魁","谷雨~小满"],
        "申":["传送","小满~夏至"],"未":["小吉","夏至~大暑"],"午":["胜光","大暑~处暑"],
        "巳":["太乙","处暑~秋分"],"辰":["天罡","秋分~霜降"],"卯":["太冲","霜降~小雪"],
        "寅":["功曹","小雪~冬至"],"丑":["大吉","冬至~大寒"],"子":["神后","大寒~雨水"]
    };

    var ZHONGQI_TO_YUEJIANG = [
        {m:1,d:20,j:"子"},{m:2,d:19,j:"亥"},{m:3,d:21,j:"戌"},{m:4,d:20,j:"酉"},
        {m:5,d:21,j:"申"},{m:6,d:21,j:"未"},{m:7,d:23,j:"午"},{m:8,d:23,j:"巳"},
        {m:9,d:23,j:"辰"},{m:10,d:24,j:"卯"},{m:11,d:22,j:"寅"},{m:12,d:22,j:"丑"}
    ];

    var TIANJIANG = {
        "贵人":{"wuxing":"土","jixiong":"吉","meaning":"尊贵首领贵人","person":"领导贵人名流官员","thing":"贵重物品重要事项","yiji":"百事吉利但逢空不验"},
        "腾蛇":{"wuxing":"火","jixiong":"凶","meaning":"虚惊怪异缠绕变化","person":"善变多疑之人宗教人士","thing":"虚诈怪异缠绕之事噩梦","yiji":"主精神恍惚得奇吉可解"},
        "朱雀":{"wuxing":"火","jixiong":"凶","meaning":"口舌是非文书信息","person":"口才好的人诉讼者","thing":"口舌官司文书信件消息","yiji":"主口舌争讼文书吉则利考"},
        "六合":{"wuxing":"木","jixiong":"吉","meaning":"合作婚姻中介和合","person":"中介媒人善于沟通者","thing":"合作交易婚姻谈判","yiji":"利合作婚姻交易谈判"},
        "勾陈":{"wuxing":"土","jixiong":"凶","meaning":"牵连滞留争斗田土","person":"固执之人争斗者","thing":"牵连滞留田土纠纷诉讼","yiji":"主事迟延牵连争斗"},
        "青龙":{"wuxing":"木","jixiong":"吉","meaning":"财富喜庆吉祥高贵","person":"富贵之人有才德者","thing":"财利喜庆升迁婚姻","yiji":"百事吉主财喜升迁"},
        "天空":{"wuxing":"土","jixiong":"凶","meaning":"空亡虚诈无实欺诈","person":"虚伪之人空口说白话者","thing":"虚无欺诈空亡不实之事","yiji":"主虚诈不实逢空则无"},
        "白虎":{"wuxing":"金","jixiong":"凶","meaning":"凶丧血光疾病道路","person":"凶悍之人重病者军人","thing":"血光丧服疾病凶灾","yiji":"主凶丧血光临吉则威"},
        "太常":{"wuxing":"土","jixiong":"吉","meaning":"衣食宴席印绶常任","person":"衣食无忧之人官员","thing":"衣食宴饮印绶官服","yiji":"主衣食宴饮印绶之喜"},
        "玄武":{"wuxing":"水","jixiong":"凶","meaning":"盗贼暗昧奸私逃亡","person":"盗贼小人暗昧之人","thing":"盗贼逃亡暗昧阴谋","yiji":"主盗贼暗昧得吉则智"},
        "太阴":{"wuxing":"金","jixiong":"吉","meaning":"阴私暗助女人婚姻","person":"女人阴私之人暗中助者","thing":"阴私暗中帮助婚姻","yiji":"主阴私暗助利婚姻"},
        "天后":{"wuxing":"水","jixiong":"吉","meaning":"妇女婚姻恩泽宠爱","person":"妇女贵妇已婚女性","thing":"婚姻恩泽宠信妇女事","yiji":"主婚姻恩泽妇女之事"}
    };

    var TIANJIANG_ORDER = ["贵人","腾蛇","朱雀","六合","勾陈","青龙","天空","白虎","太常","玄武","太阴","天后"];

    var GUIREN = {
        "甲":["丑","未"],"戊":["丑","未"],"庚":["丑","未"],
        "乙":["子","申"],"己":["子","申"],
        "丙":["亥","酉"],"丁":["亥","酉"],
        "壬":["巳","卯"],"癸":["巳","卯"],
        "辛":["午","寅"]
    };

    var XUN_KONG = {
        "甲子":["戌","亥"],"甲戌":["申","酉"],"甲申":["午","未"],
        "甲午":["辰","巳"],"甲辰":["寅","卯"],"甲寅":["子","丑"]
    };
    var XUN_SHOU_LIST = ["甲子","甲戌","甲申","甲午","甲辰","甲寅"];
    var XUN_SHOU_MAP = {};
    for (var i = 0; i < 6; i++) { for (var j = 0; j < 10; j++) { XUN_SHOU_MAP[LIUSHIJIAZI[i*10+j]] = XUN_SHOU_LIST[i]; } }

    var YIMA = {
        "申":"寅","子":"寅","辰":"寅","寅":"申","午":"申","戌":"申",
        "巳":"亥","酉":"亥","丑":"亥","亥":"巳","卯":"巳","未":"巳"
    };

    var KETI_LIST = {
        "元首课":"一上克下余无克·天地得位","重审课":"一下贼上余无克·臣诤君再三审",
        "知一课":"二克择比而用·事有两歧择一","涉害课":"俱比俱不比取涉深·历尽风霜",
        "遥克课":"四课无克取遥克·蒿矢弹射","昴星课":"无克无遥取昴星·阴伏阳转",
        "别责课":"三课无克别责合·刚柔取合","八专课":"二课俱无克·日阳辰阴",
        "伏吟课":"天地不动各居本位·事慢","反吟课":"天地相冲往来·事反复",
        "三光课":"用神日辰时旺将吉·万事通","三阳课":"日辰用旺贵人顺·天朗气清",
        "三奇课":"子戌寻大吉申午辰寅·福奇","六仪课":"六甲旬头发用·仪仗威严",
        "时泰课":"发用岁月方龙合财德·昌泰","龙德课":"太岁月将天乙发用·致福祥",
        "官爵课":"岁月年命驿马魁常·官爵","富贵课":"天乙旺气日辰年命生·富贵",
        "轩盖课":"三传午卯子·天驷华盖","铸印课":"戌加巳·铸印太常",
        "斫轮课":"太冲申上·卯轮庚斧","引从课":"三传引干支·车马蜂拥",
        "亨通课":"三传递生日辰·天生地生","繁昌课":"夫妻年为用·德合旺相",
        "荣华课":"贵旺禄马·干支年命吉","德庆课":"天德月德干支德·德庆",
        "合欢课":"日上递干合·吉将六合","和美课":"四课各合互合·和美",
        "斩关课":"魁罡日辰·重土塞门","闭口课":"旬尾加旬首·闭口不言",
        "游子课":"季用乘丁遇天马·走西东","三交课":"四仲加仲·三传皆仲阴合",
        "乱首课":"支加干克干·下犯上","赘婿课":"支临干被克·屈意从人",
        "冲破课":"日辰冲为用·反复破损","淫泆课":"后合乘卯酉·淫欲阴私",
        "芜淫课":"三课有克交克·两情相背","解离课":"日辰互克上·离散",
        "孤寡课":"四季前后·孤寡","度厄课":"三课上下克·长幼惊",
        "无禄课":"四上临下·以尊制卑","绝嗣课":"四下贼上·小人无礼",
        "迍福课":"八迍五福·吉凶驳","侵害课":"日辰六害·凶残",
        "刑伤课":"干支三刑用·刑伤","二烦课":"日月加四仲·斗系丑未",
        "天祸课":"四立绝神·昨日干加今干","天狱课":"墓作死囚·天罡日本",
        "天寇课":"分至前一日·月加离辰","天网课":"时用克日·天网",
        "魄化课":"死囚带白虎·凶祸","三阴课":"贵逆日辰后·死囚玄虎",
        "龙战课":"卯酉日年·事迍邅","死奇课":"月躔天罡·鬼墓",
        "灾厄课":"丧吊游魂·丘墓岁虎","殃咎课":"三传克日·神将克战",
        "九丑课":"子午卯酉·乙戊己辛壬","鬼墓课":"日辰鬼作墓·鬼克墓覆",
        "励德课":"日辰看前后·天乙二八门","盘珠课":"岁月日时皆在四课",
        "全局课":"三传三合局·同类欢会","玄胎课":"三传皆四孟·玄中有胎",
        "连珠课":"三传相连·贯珠","间传课":"间位作三传·事多间阻",
        "六阳课":"四课用传皆阳·如登三天","六阴课":"四课用传皆阴·似涉重渊"
    };

    var DIZHI_WUXING = {
        "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
        "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"
    };

    var DIZHI_LIUHE = {
        "子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯",
        "辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午"
    };

    var DIZHI_LIUCHONG = {
        "子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅",
        "卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳"
    };

    var DIZHI_SANHE = {
        "申子辰":"水","亥卯未":"木","寅午戌":"火","巳酉丑":"金"
    };

    var WUXING_SHENG = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
    var WUXING_KE = {"木":"土","土":"水","水":"火","火":"金","金":"木"};

    var JIU_ZONGMEN = ["贼克","比用","涉害","遥克","昴星","别责","八专","伏吟","反吟"];

    var WUSHU_DUN = {
        "甲":"甲","己":"甲","乙":"丙","庚":"丙","丙":"戊","辛":"戊",
        "丁":"庚","壬":"庚","戊":"壬","癸":"壬"
    };
    var DUNGAN_XIANGYI = {
        "甲":"首领·开始","乙":"转折·曲折","丙":"光明·显露",
        "丁":"希望·丁火","戊":"阻隔·厚重","己":"私欲·暗藏",
        "庚":"困难·阻碍","辛":"错误·失误","壬":"流动·变化","癸":"闭塞·终结"
    };

    var SI_KE_ORDER = ["一课(干阳)","二课(干阴)","三课(支阳)","四课(支阴)"];

    // ===== Part 2: 计算函数 =====

    function daysSince1900(year, month, day) {
        var d1 = Date.UTC(1900, 0, 1);
        var d2 = Date.UTC(year, month-1, day);
        return Math.round((d2 - d1) / 86400000);
    }

    function solar_to_bazi(year, month, day, hour) {
        var lichun_m = 2, lichun_d = 4;
        var gz_year;
        if (month < lichun_m || (month === lichun_m && day < lichun_d)) {
            gz_year = ((year - 1 - 4) % 60 + 60) % 60;
        } else {
            gz_year = ((year - 4) % 60 + 60) % 60;
        }
        var jieqi_for_month = {1:12, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:9, 11:10, 12:11};
        var month_branch = jieqi_for_month[month] || 1;
        var mg_idx = ((gz_year % 10) * 2 + month_branch) % 10;
        var mz_idx = ((month_branch + 2) % 12 + 12) % 12;
        var delta = daysSince1900(year, month, day);
        var gz_day_idx = ((10 + delta) % 60 + 60) % 60;
        var hour_zhi_idx = (Math.floor((hour + 1) / 2)) % 12;
        var day_gan_idx = gz_day_idx % 10;
        var hg_idx = ((day_gan_idx * 2 + hour_zhi_idx) % 10 + 10) % 10;
        return {
            year_gan: TIANGAN[gz_year % 10], year_zhi: DIZHI[gz_year % 12],
            year_ganzhi: LIUSHIJIAZI[gz_year],
            month_gan: TIANGAN[mg_idx], month_zhi: DIZHI[mz_idx],
            month_ganzhi: TIANGAN[mg_idx] + DIZHI[mz_idx],
            day_gan: TIANGAN[gz_day_idx % 10], day_zhi: DIZHI[gz_day_idx % 12],
            day_ganzhi: LIUSHIJIAZI[gz_day_idx],
            hour_gan: TIANGAN[hg_idx], hour_zhi: DIZHI[hour_zhi_idx],
            hour_ganzhi: TIANGAN[hg_idx] + DIZHI[hour_zhi_idx],
            day_gz_idx: gz_day_idx, hour_zhi_idx: hour_zhi_idx
        };
    }

    function get_yuejiang(month, day) {
        var current = "子";
        for (var i = 0; i < ZHONGQI_TO_YUEJIANG.length; i++) {
            var zq = ZHONGQI_TO_YUEJIANG[i];
            if (month > zq.m || (month === zq.m && day >= zq.d)) { current = zq.j; }
        }
        return current;
    }

    function arrange_tianpan(yuejiang, hour_zhi) {
        var yuejiang_idx = DIZHI.indexOf(yuejiang);
        var hour_idx = DIZHI.indexOf(hour_zhi);
        var offset = ((hour_idx - yuejiang_idx) % 12 + 12) % 12;
        var tianpan = {};
        for (var i = 0; i < 12; i++) { tianpan[DIZHI[i]] = DIZHI[(i + offset) % 12]; }
        return tianpan;
    }

    function get_si_ke(tianpan, day_gan, day_zhi) {
        var ganGong = GAN_JI_GONG[day_gan] || ["寅","木"];
        var gan_gong = ganGong[0];
        var ke1_top = tianpan[gan_gong] || gan_gong;
        var ke2_top = tianpan[ke1_top] || ke1_top;
        var ke3_top = tianpan[day_zhi] || day_zhi;
        var ke4_top = tianpan[ke3_top] || ke3_top;
        var si_ke = {};
        si_ke["一课(干阳)"] = [ke1_top, gan_gong];
        si_ke["二课(干阴)"] = [ke2_top, ke1_top];
        si_ke["三课(支阳)"] = [ke3_top, day_zhi];
        si_ke["四课(支阴)"] = [ke4_top, ke3_top];
        return si_ke;
    }

    function get_san_chuan_advanced(si_ke, day_gan, tianpan) {
        var ke_list = SI_KE_ORDER.map(function(k){ return si_ke[k]; });
        var day_gan_idx = TIANGAN.indexOf(day_gan);
        var day_gan_yang = (day_gan_idx % 2 === 0);
        var ke_ke = [];
        for (var idx = 0; idx < ke_list.length; idx++) {
            var top = ke_list[idx][0], bot = ke_list[idx][1];
            var tw = DIZHI_WUXING[top] || "土";
            var bw = DIZHI_WUXING[bot] || "土";
            if (WUXING_KE[tw] === bw) { ke_ke.push(["上克下", top, bot, idx]); }
            else if (WUXING_KE[bw] === tw) { ke_ke.push(["下贼上", top, bot, idx]); }
        }
        var zongmen = "贼克";
        var chuan_first = null;
        if (ke_ke.length === 0) { chuan_first = ke_list[0][0]; zongmen = "无克"; }
        else if (ke_ke.length === 1) { chuan_first = ke_ke[0][1]; zongmen = "贼克"; }
        else {
            var bi_list = [];
            for (var i = 0; i < ke_ke.length; i++) {
                var top = ke_ke[i][1];
                var top_idx = DIZHI.indexOf(top);
                var top_yang = (top_idx % 2 === 0);
                if (top_yang === day_gan_yang) { bi_list.push(ke_ke[i]); }
            }
            if (bi_list.length === 1) { chuan_first = bi_list[0][1]; zongmen = "比用"; }
            else if (bi_list.length > 1) {
                var shehai_list = [];
                for (var i = 0; i < bi_list.length; i++) {
                    var top = bi_list[i][1];
                    var top_wx = DIZHI_WUXING[top] || "土";
                    var ke_count = 0;
                    for (var j = 0; j < bi_list.length; j++) {
                        var b = bi_list[j][2];
                        var bw = DIZHI_WUXING[b] || "土";
                        if (WUXING_KE[bw] === top_wx) ke_count++;
                    }
                    shehai_list.push([bi_list[i][0], top, bi_list[i][2], bi_list[i][3], ke_count]);
                }
                shehai_list.sort(function(a, b){ return b[4] - a[4]; });
                chuan_first = shehai_list[0][1]; zongmen = "涉害";
            } else {
                var shehai_list = [];
                for (var i = 0; i < ke_ke.length; i++) {
                    var top = ke_ke[i][1];
                    var top_wx = DIZHI_WUXING[top] || "土";
                    var ke_count = 0;
                    for (var j = 0; j < ke_ke.length; j++) {
                        var b = ke_ke[j][2];
                        var bw = DIZHI_WUXING[b] || "土";
                        if (WUXING_KE[bw] === top_wx) ke_count++;
                    }
                    shehai_list.push([ke_ke[i][0], top, ke_ke[i][2], ke_ke[i][3], ke_count]);
                }
                shehai_list.sort(function(a, b){ return b[4] - a[4]; });
                chuan_first = shehai_list[0][1]; zongmen = "涉害";
            }
        }
        var chuan = [chuan_first];
        chuan.push(tianpan[chuan[0]] || chuan[0]);
        chuan.push(tianpan[chuan[1]] || chuan[1]);
        return { chuan: chuan, zongmen: zongmen };
    }

    function get_guiren(day_gan, hour_zhi) {
        var gr = GUIREN[day_gan] || ["丑","未"];
        var zhou = gr[0], ye = gr[1];
        var hour_idx = DIZHI.indexOf(hour_zhi);
        if (hour_idx >= 2 && hour_idx <= 7) { return { guiren: zhou, type: "昼贵" }; }
        else { return { guiren: ye, type: "夜贵" }; }
    }

    function arrange_tianjiang_fixed(tianpan, guiren, hour_zhi) {
        var guiren_dipan = null;
        for (var dizi in tianpan) { if (tianpan[dizi] === guiren) { guiren_dipan = dizi; break; } }
        if (guiren_dipan === null) guiren_dipan = "子";
        var dipan_idx = DIZHI.indexOf(guiren_dipan);
        var direction;
        if ([11,0,1,2,3,4].indexOf(dipan_idx) >= 0) { direction = 1; } else { direction = -1; }
        var guiren_idx = DIZHI.indexOf(guiren);
        var tianjiang = {};
        for (var i = 0; i < 12; i++) {
            var jiang = TIANJIANG_ORDER[i];
            var zhi = DIZHI[((guiren_idx + i * direction) % 12 + 12) % 12];
            tianjiang[jiang] = zhi;
        }
        return tianjiang;
    }

    function get_kongwang(hour_ganzhi) {
        var xun = XUN_SHOU_MAP[hour_ganzhi] || "甲子";
        return { kong: XUN_KONG[xun] || ["戌","亥"], xun_shou: xun };
    }

    function get_yima(day_zhi) { return YIMA[day_zhi] || "寅"; }

    function get_dizhi_wangshuai(zhi, month) {
        var zhi_wx = DIZHI_WUXING[zhi] || "土";
        var month_wx_map = {1:"水",2:"水",3:"木",4:"木",5:"木",6:"火",7:"火",8:"火",9:"土",10:"土",11:"土",12:"水"};
        var m_wx = month_wx_map[month] || "土";
        if (zhi_wx === m_wx) return "旺";
        if (WUXING_SHENG[zhi_wx] === m_wx) return "相";
        if (WUXING_KE[zhi_wx] === m_wx) return "死";
        if (WUXING_KE[m_wx] === zhi_wx) return "囚";
        if (WUXING_SHENG[m_wx] === zhi_wx) return "休";
        return "平";
    }

    function calc_dungan(day_gan, zhi) {
        var start_gan = WUSHU_DUN[day_gan] || "甲";
        var start_idx = TIANGAN.indexOf(start_gan);
        var zhi_idx = DIZHI.indexOf(zhi);
        return TIANGAN[(start_idx + zhi_idx) % 10];
    }

    function detect_keti_extended(si_ke, san_chuan, tianpan, day_gan, day_zhi) {
        var results = {};
        var ke_list = SI_KE_ORDER.map(function(k){ return si_ke[k]; });
        var ke_ke = [];
        for (var i = 0; i < ke_list.length; i++) {
            var top = ke_list[i][0], bot = ke_list[i][1];
            var tw = DIZHI_WUXING[top] || "土";
            var bw = DIZHI_WUXING[bot] || "土";
            if (WUXING_KE[tw] === bw) { ke_ke.push("上克下"); }
            else if (WUXING_KE[bw] === tw) { ke_ke.push("下贼上"); }
            else { ke_ke.push("无克"); }
        }
        var ke_count = 0;
        for (var i = 0; i < ke_ke.length; i++) { if (ke_ke[i] !== "无克") ke_count++; }
        var shangKeCount = 0;
        for (var i = 0; i < ke_ke.length; i++) { if (ke_ke[i] === "上克下") shangKeCount++; }
        var xiazeiCount = 0;
        for (var i = 0; i < ke_ke.length; i++) { if (ke_ke[i] === "下贼上") xiazeiCount++; }
        results["元首课"] = (ke_count === 1 && shangKeCount === 1);
        results["重审课"] = (ke_count === 1 && xiazeiCount === 1);
        results["知一课"] = (ke_count === 2);
        var yang_zhi = ["子","寅","辰","午","申","戌"];
        var all_yang = true;
        for (var i = 0; i < ke_list.length; i++) { if (yang_zhi.indexOf(ke_list[i][0]) < 0) { all_yang = false; break; } }
        for (var i = 0; i < san_chuan.length; i++) { if (yang_zhi.indexOf(san_chuan[i]) < 0) { all_yang = false; break; } }
        results["六阳课"] = all_yang;
        var yin_zhi = ["丑","卯","巳","未","酉","亥"];
        var all_yin = true;
        for (var i = 0; i < ke_list.length; i++) { if (yin_zhi.indexOf(ke_list[i][0]) < 0) { all_yin = false; break; } }
        for (var i = 0; i < san_chuan.length; i++) { if (yin_zhi.indexOf(san_chuan[i]) < 0) { all_yin = false; break; } }
        results["六阴课"] = all_yin;
        var c0 = DIZHI.indexOf(san_chuan[0]), c1 = DIZHI.indexOf(san_chuan[1]), c2 = DIZHI.indexOf(san_chuan[2]);
        var gap1 = ((c1 - c0) % 12 + 12) % 12;
        var gap2 = ((c2 - c1) % 12 + 12) % 12;
        results["间传课"] = ((gap1 === 2 && gap2 === 2) || (gap1 === 10 && gap2 === 10));
        results["连珠课"] = ((gap1 === 1 && gap2 === 1) || (gap1 === 11 && gap2 === 11));
        results["全局课"] = false;
        for (var he in DIZHI_SANHE) {
            var allIn = true;
            for (var i = 0; i < san_chuan.length; i++) { if (he.indexOf(san_chuan[i]) < 0) { allIn = false; break; } }
            if (allIn) { results["全局课"] = true; break; }
        }
        var si_meng = ["寅","巳","申","亥"];
        var allMeng = true;
        for (var i = 0; i < san_chuan.length; i++) { if (si_meng.indexOf(san_chuan[i]) < 0) { allMeng = false; break; } }
        results["玄胎课"] = allMeng;
        var si_zhong = ["子","午","卯","酉"];
        var allZhong = true;
        for (var i = 0; i < san_chuan.length; i++) { if (si_zhong.indexOf(san_chuan[i]) < 0) { allZhong = false; break; } }
        results["三交课"] = allZhong;
        var si_ji = ["辰","戌","丑","未"];
        var allJi = true;
        for (var i = 0; i < san_chuan.length; i++) { if (si_ji.indexOf(san_chuan[i]) < 0) { allJi = false; break; } }
        results["游子课"] = allJi;
        var allFu = true;
        for (var i = 0; i < 12; i++) { if (tianpan[DIZHI[i]] !== DIZHI[i]) { allFu = false; break; } }
        results["伏吟课"] = allFu;
        var allFan = true;
        for (var i = 0; i < 12; i++) {
            var expected = DIZHI_LIUCHONG[DIZHI[i]] || DIZHI[i];
            if (tianpan[DIZHI[i]] !== expected) { allFan = false; break; }
        }
        results["反吟课"] = allFan;
        return results;
    }

    function analyze_chuan_trend(san_chuan) {
        var c0_wx = DIZHI_WUXING[san_chuan[0]] || "土";
        var c1_wx = DIZHI_WUXING[san_chuan[1]] || "土";
        var c2_wx = DIZHI_WUXING[san_chuan[2]] || "土";
        var c0c1, c1c2, c0c2;
        if (WUXING_SHENG[c0_wx] === c1_wx) c0c1 = "初生中";
        else if (WUXING_KE[c0_wx] === c1_wx) c0c1 = "初克中";
        else if (WUXING_SHENG[c1_wx] === c0_wx) c0c1 = "中生初";
        else if (WUXING_KE[c1_wx] === c0_wx) c0c1 = "中克初";
        else if (c0_wx === c1_wx) c0c1 = "初中比和";
        else c0c1 = "初中无克";
        if (WUXING_SHENG[c1_wx] === c2_wx) c1c2 = "中生末";
        else if (WUXING_KE[c1_wx] === c2_wx) c1c2 = "中克末";
        else if (WUXING_SHENG[c2_wx] === c1_wx) c1c2 = "末生中";
        else if (WUXING_KE[c2_wx] === c1_wx) c1c2 = "末克中";
        else if (c1_wx === c2_wx) c1c2 = "中末比和";
        else c1c2 = "中末无克";
        if (WUXING_SHENG[c0_wx] === c2_wx) c0c2 = "初生末";
        else if (WUXING_KE[c0_wx] === c2_wx) c0c2 = "初克末";
        else if (WUXING_SHENG[c2_wx] === c0_wx) c0c2 = "末生初";
        else if (WUXING_KE[c2_wx] === c0_wx) c0c2 = "末克初";
        else if (c0_wx === c2_wx) c0c2 = "初末比和";
        else c0c2 = "初末无克";
        var trend;
        if (c0c1 === "初生中" && c1c2 === "中生末") trend = "递生·顺利渐进";
        else if (c0c1 === "初克中" && c1c2 === "中克末") trend = "递克·阻碍递增";
        else if (c0c2 === "初生末") trend = "初生末·始助终成";
        else if (c0c2 === "初克末") trend = "初克末·始阻终败";
        else if (c0c2 === "末生初") trend = "末生初·回光返照";
        else if (c0c2 === "末克初") trend = "末克初·终克始因";
        else if (c0_wx === c1_wx && c1_wx === c2_wx) trend = "三传同气·纯粹";
        else trend = "交错生克·复杂多变";
        return { c0c1: c0c1, c1c2: c1c2, c0c2: c0c2, trend: trend };
    }

    function find_chuan_tianjiang(chuan_zhi, tianpan, tianjiang) {
        var tianpan_val = tianpan[chuan_zhi] || chuan_zhi;
        for (var jiang_name in tianjiang) { if (tianjiang[jiang_name] === tianpan_val) { return jiang_name; } }
        return "未知";
    }

    // ===== Part 3: 标签生成 =====

    function _generate(year, month, day, hour, minute, options) {
        options = options || {};
        var bazi;

        // 优先使用 options.ganzhi 中的干支数据
        if (options.ganzhi && options.ganzhi.dayGz) {
            var gz = options.ganzhi;
            var yg = gz.yearGz || '';
            var mg = gz.monthGz || '';
            var dg = gz.dayGz || '';
            var hg = gz.hourGz || '';
            bazi = {
                year_gan: yg ? yg[0] : '', year_zhi: yg ? yg[1] : '', year_ganzhi: yg,
                month_gan: mg ? mg[0] : '', month_zhi: mg ? mg[1] : '', month_ganzhi: mg,
                day_gan: dg ? dg[0] : '', day_zhi: dg ? dg[1] : '', day_ganzhi: dg,
                hour_gan: hg ? hg[0] : '', hour_zhi: hg ? hg[1] : '', hour_ganzhi: hg,
                day_gz_idx: 0, hour_zhi_idx: DIZHI.indexOf(hg ? hg[1] : '子')
            };
        } else {
            bazi = solar_to_bazi(year, month, day, hour);
        }

        var yuejiang = get_yuejiang(month, day);
        var yj_info = YUEJIANG[yuejiang] || ["未知",""];
        var yuejiang_name = yj_info[0];
        var yuejiang_range = yj_info[1];

        var tianpan = arrange_tianpan(yuejiang, bazi.hour_zhi);
        var si_ke = get_si_ke(tianpan, bazi.day_gan, bazi.day_zhi);

        var sc_result = get_san_chuan_advanced(si_ke, bazi.day_gan, tianpan);
        var san_chuan = sc_result.chuan;
        var zongmen = sc_result.zongmen;

        var gr_result = get_guiren(bazi.day_gan, bazi.hour_zhi);
        var guiren = gr_result.guiren;
        var guiren_type = gr_result.type;

        var tianjiang = arrange_tianjiang_fixed(tianpan, guiren, bazi.hour_zhi);

        var kw_result = get_kongwang(bazi.hour_ganzhi);
        var kong = kw_result.kong;
        var xun_shou = kw_result.xun_shou;

        var yima = get_yima(bazi.day_zhi);

        var ganGong = GAN_JI_GONG[bazi.day_gan] || ["寅","木"];
        var gan_gong = ganGong[0];
        var gan_gong_wx = ganGong[1];

        var dungan_list = [];
        var chuan_names = ["初传","中传","末传"];
        for (var i = 0; i < 3; i++) {
            var dg = calc_dungan(bazi.day_gan, san_chuan[i]);
            var xy = DUNGAN_XIANGYI[dg] || "";
            dungan_list.push(dg + "(" + xy + ")");
        }

        var keti_ext = detect_keti_extended(si_ke, san_chuan, tianpan, bazi.day_gan, bazi.day_zhi);
        var ext_triggered_count = 0;
        for (var kn in keti_ext) { if (keti_ext[kn]) ext_triggered_count++; }

        var trend = analyze_chuan_trend(san_chuan);

        var chuan_tianjiang = [];
        for (var i = 0; i < 3; i++) {
            chuan_tianjiang.push(find_chuan_tianjiang(san_chuan[i], tianpan, tianjiang));
        }

        // 基础课体检测
        var all_chuan_meng = san_chuan.every(function(z){ return ["寅","申","巳","亥"].indexOf(z) >= 0; });
        var all_chuan_zhong = san_chuan.every(function(z){ return ["子","午","卯","酉"].indexOf(z) >= 0; });
        var all_chuan_ji = san_chuan.every(function(z){ return ["辰","戌","丑","未"].indexOf(z) >= 0; });
        var keti_results = {};
        for (var keti in KETI_LIST) {
            var desc = KETI_LIST[keti];
            var triggered = false;
            if (keti === "伏吟课") {
                var allSame = true;
                for (var d = 0; d < 12; d++) { if (tianpan[DIZHI[d]] !== DIZHI[d]) { allSame = false; break; } }
                triggered = allSame;
            } else if (keti === "反吟课") {
                var allFan = true;
                for (var d = 0; d < 12; d++) {
                    var exp = DIZHI_LIUCHONG[DIZHI[d]] || DIZHI[d];
                    if (tianpan[DIZHI[d]] !== exp) { allFan = false; break; }
                }
                triggered = allFan;
            } else if (keti === "玄胎课") { triggered = all_chuan_meng; }
            else if (keti === "三交课") { triggered = all_chuan_zhong; }
            else if (keti === "游子课") { triggered = all_chuan_ji; }
            else if (keti === "全局课") {
                for (var he in DIZHI_SANHE) {
                    var allIn = true;
                    for (var ci = 0; ci < san_chuan.length; ci++) { if (he.indexOf(san_chuan[ci]) < 0) { allIn = false; break; } }
                    if (allIn) { triggered = true; break; }
                }
            }
            keti_results[keti] = triggered ? ("✅" + desc) : "未触发";
        }

        // 覆盖扩展检测结果
        for (var kn2 in keti_ext) {
            if (keti_ext[kn2]) {
                var desc2 = KETI_LIST[kn2] || "";
                keti_results[kn2] = "✅" + desc2;
            }
        }

        var triggered_keti = [];
        for (var k in keti_results) { if (keti_results[k].indexOf("✅") >= 0) { triggered_keti.push(k); } }

        // 九宗门检测
        var ke_ke_count = 0;
        for (var ki = 0; ki < SI_KE_ORDER.length; ki++) {
            var kk = si_ke[SI_KE_ORDER[ki]];
            var tw = DIZHI_WUXING[kk[0]] || "土";
            var bw = DIZHI_WUXING[kk[1]] || "土";
            if (WUXING_KE[tw] === bw || WUXING_KE[bw] === tw) ke_ke_count++;
        }
        var zongmen_results = {};
        for (var zi = 0; zi < JIU_ZONGMEN.length; zi++) {
            var zm = JIU_ZONGMEN[zi];
            var trig = false;
            if (zm === "贼克" && ke_ke_count === 1) trig = true;
            else if (zm === "比用" && ke_ke_count === 2) trig = true;
            else if (zm === "涉害" && ke_ke_count >= 3) trig = true;
            else if (zm === "伏吟") {
                var allF = true;
                for (var d = 0; d < 12; d++) { if (tianpan[DIZHI[d]] !== DIZHI[d]) { allF = false; break; } }
                trig = allF;
            } else if (zm === "反吟") {
                var allR = true;
                for (var d = 0; d < 12; d++) {
                    var exp2 = DIZHI_LIUCHONG[DIZHI[d]] || DIZHI[d];
                    if (tianpan[DIZHI[d]] !== exp2) { allR = false; break; }
                }
                trig = allR;
            }
            zongmen_results[zm] = trig ? "✅触发" : "未触发";
        }

        // 主客分析
        var day_gan_wx = gan_gong_wx;
        var day_zhi_wx = DIZHI_WUXING[bazi.day_zhi] || "土";
        var gx;
        if (day_gan_wx === day_zhi_wx) gx = "干支比和";
        else if (WUXING_SHENG[day_gan_wx] === day_zhi_wx) gx = "干生支(利支)";
        else if (WUXING_SHENG[day_zhi_wx] === day_gan_wx) gx = "支生干(利干)";
        else if (WUXING_KE[day_gan_wx] === day_zhi_wx) gx = "干克支(干强)";
        else if (WUXING_KE[day_zhi_wx] === day_gan_wx) gx = "支克干(支强)";
        else gx = "无特殊关系";
        var zhengti_zhuke;
        if (day_gan_wx && WUXING_KE[day_gan_wx] === day_zhi_wx) zhengti_zhuke = "主胜客";
        else if (WUXING_KE[day_zhi_wx] === day_gan_wx) zhengti_zhuke = "客胜主";
        else zhengti_zhuke = "主客平衡";

        // 盘面总评
        var zhengti_jixiong;
        var tnames = triggered_keti.join("");
        if (triggered_keti.length > 0 && tnames.indexOf("凶") < 0) { zhengti_jixiong = "吉"; }
        else if (triggered_keti.some(function(k){ return (KETI_LIST[k] || "").indexOf("凶") >= 0; })) { zhengti_jixiong = "凶"; }
        else { zhengti_jixiong = "平"; }
        var kongwang_yingxiang;
        if (san_chuan.some(function(z){ return kong.indexOf(z) >= 0; })) { kongwang_yingxiang = "用神空亡·事难成"; }
        else { kongwang_yingxiang = "用神不空·事可成"; }
        var sanchuan_qushi;
        var is_di_sheng = true;
        for (var si = 0; si < 2; si++) {
            var wx1 = DIZHI_WUXING[san_chuan[si]] || "土";
            var wx2 = DIZHI_WUXING[san_chuan[si+1]] || "土";
            if (WUXING_SHENG[wx1] !== wx2) { is_di_sheng = false; break; }
        }
        sanchuan_qushi = is_di_sheng ? "递生·吉" : "非递生";
        var sike_vals = SI_KE_ORDER.map(function(k){ return si_ke[k][0] + "/" + si_ke[k][1]; });
        var unique_sike = new Set(sike_vals).size;
        var sike_wanbei = unique_sike === 4 ? "四课完备" : "四课不全";

        // === 构建 layers ===
        var layers = {};
        var chuan_meanings = ["事发端始·动机","事中变·移易之门","事归宿·结局定论"];

        // L1 基础排盘
        layers['L1_基础排盘'] = {
            '日干': bazi.day_gan,
            '日支': bazi.day_zhi,
            '日干支': bazi.day_ganzhi,
            '月将': yuejiang + '(' + yuejiang_name + ')',
            '月将范围': yuejiang_range,
            '占时': bazi.hour_zhi,
            '昼夜': guiren_type,
            '贵人': guiren,
            '空亡': kong.join(','),
            '旬首': xun_shou,
            '驿马': yima,
            '日干寄宫': gan_gong + '(' + gan_gong_wx + ')',
            '年干支': bazi.year_ganzhi,
            '月干支': bazi.month_ganzhi
        };

        // L2 天地盘
        layers['L2_天地盘'] = {};
        for (var i = 0; i < 12; i++) {
            var zhi = DIZHI[i];
            layers['L2_天地盘'][zhi + '→天盘'] = tianpan[zhi] || '';
        }

        // L3 四课
        layers['L3_四课'] = {};
        for (var ki = 0; ki < SI_KE_ORDER.length; ki++) {
            var kn = SI_KE_ORDER[ki];
            var kk = si_ke[kn];
            layers['L3_四课'][kn + '_上神'] = kk[0];
            layers['L3_四课'][kn + '_下神'] = kk[1];
        }

        // L4 三传
        layers['L4_三传'] = {};
        for (var i = 0; i < 3; i++) {
            var cn = chuan_names[i];
            var cz = san_chuan[i];
            var cwx = DIZHI_WUXING[cz] || "土";
            layers['L4_三传'][cn + '_地支'] = cz;
            layers['L4_三传'][cn + '_五行'] = cwx;
            layers['L4_三传'][cn + '_天将'] = chuan_tianjiang[i];
            layers['L4_三传'][cn + '_遁干'] = dungan_list[i];
            layers['L4_三传'][cn + '_旺衰'] = get_dizhi_wangshuai(cz, month);
            layers['L4_三传'][cn + '_含义'] = chuan_meanings[i];
        }

        // L5 十二天将分布
        layers['L5_十二天将分布'] = {};
        for (var i = 0; i < TIANJIANG_ORDER.length; i++) {
            var jiang = TIANJIANG_ORDER[i];
            layers['L5_十二天将分布'][jiang] = tianjiang[jiang] || '';
        }

        // L6 十二天将属性
        layers['L6_十二天将属性'] = {};
        for (var i = 0; i < TIANJIANG_ORDER.length; i++) {
            var jiang = TIANJIANG_ORDER[i];
            var attr = TIANJIANG[jiang] || {};
            layers['L6_十二天将属性'][jiang + '_五行'] = attr.wuxing || '';
            layers['L6_十二天将属性'][jiang + '_吉凶'] = attr.jixiong || '';
            layers['L6_十二天将属性'][jiang + '_核心象意'] = attr.meaning || '';
            layers['L6_十二天将属性'][jiang + '_人物象意'] = attr.person || '';
            layers['L6_十二天将属性'][jiang + '_事物象意'] = attr.thing || '';
            layers['L6_十二天将属性'][jiang + '_宜忌'] = attr.yiji || '';
        }

        // L7 十二月将属性
        layers['L7_十二月将属性'] = {};
        for (var i = 0; i < 12; i++) {
            var zhi = DIZHI[i];
            var yj = YUEJIANG[zhi] || ["未知",""];
            layers['L7_十二月将属性'][zhi] = yj[0] + '/' + yj[1];
        }

        // L8 课体格局判断
        layers['L8_课体格局判断'] = {};
        for (var keti in KETI_LIST) {
            var val = keti_results[keti] || "未触发";
            var shortDesc = val === "未触发" ? "未触发" : val.substring(1);
            layers['L8_课体格局判断'][keti] = shortDesc;
        }
        layers['L8_课体格局判断']['OPT4扩展'] = '共检测' + ext_triggered_count + '个触发';

        // L9 九宗门
        layers['L9_九宗门'] = {};
        for (var zi = 0; zi < JIU_ZONGMEN.length; zi++) {
            var zm = JIU_ZONGMEN[zi];
            layers['L9_九宗门'][zm] = zongmen_results[zm] || "未触发";
        }
        layers['L9_九宗门']['OPT2实际'] = '✅' + zongmen + '法取用';

        // L10 十干寄宫
        layers['L10_十干寄宫'] = {};
        for (var i = 0; i < TIANGAN.length; i++) {
            var gan = TIANGAN[i];
            var gp = GAN_JI_GONG[gan] || ["?","?"];
            layers['L10_十干寄宫'][gan] = '寄' + gp[0] + '宫/' + gp[1];
        }

        // L11 四课关系
        layers['L11_四课关系'] = {};
        for (var ki = 0; ki < SI_KE_ORDER.length; ki++) {
            var kn = SI_KE_ORDER[ki];
            var kk = si_ke[kn];
            var top = kk[0], bot = kk[1];
            var tw = DIZHI_WUXING[top] || "土";
            var bw = DIZHI_WUXING[bot] || "土";
            var rel;
            if (WUXING_KE[tw] === bw) rel = "上克下";
            else if (WUXING_KE[bw] === tw) rel = "下贼上";
            else if (tw === bw) rel = "比和";
            else if (WUXING_SHENG[tw] === bw) rel = "上生下";
            else if (WUXING_SHENG[bw] === tw) rel = "下生上";
            else rel = "无克";
            layers['L11_四课关系'][kn + '_关系'] = rel;
            layers['L11_四课关系'][kn + '_上神旺衰'] = get_dizhi_wangshuai(top, month);
        }

        // L12 三传趋势
        layers['L12_三传趋势'] = {};
        for (var i = 0; i < 3; i++) {
            var cn = chuan_names[i];
            layers['L12_三传趋势'][cn + '含义'] = chuan_meanings[i];
            layers['L12_三传趋势'][cn + '旺衰'] = get_dizhi_wangshuai(san_chuan[i], month);
        }
        layers['L12_三传趋势']['OPT5初中'] = trend.c0c1;
        layers['L12_三传趋势']['OPT5中末'] = trend.c1c2;
        layers['L12_三传趋势']['OPT5初末'] = trend.c0c2;
        layers['L12_三传趋势']['OPT5综合'] = trend.trend;

        // L13 贵人系统
        var gr = GUIREN[bazi.day_gan] || ["丑","未"];
        layers['L13_贵人系统'] = {
            '昼贵': gr[0],
            '夜贵': gr[1],
            '当前用贵': guiren,
            '贵人所在': tianjiang["贵人"] || ''
        };

        // L14 神煞
        layers['L14_神煞'] = {
            '驿马': yima,
            '空亡': kong.join(','),
            '日支六合': DIZHI_LIUHE[bazi.day_zhi] || '',
            '日支六冲': DIZHI_LIUCHONG[bazi.day_zhi] || '',
            '太岁': bazi.year_zhi,
            '月建': bazi.month_zhi
        };

        // L15 旺衰评估
        layers['L15_旺衰评估'] = {};
        for (var i = 0; i < 12; i++) {
            var zhi = DIZHI[i];
            layers['L15_旺衰评估'][zhi] = get_dizhi_wangshuai(zhi, month);
        }

        // L16 主客分析
        layers['L16_主客分析'] = {
            '日干(主)': bazi.day_gan + '(' + day_gan_wx + ')',
            '日支(客)': bazi.day_zhi + '(' + day_zhi_wx + ')',
            '干支关系': gx,
            '主旺衰': get_dizhi_wangshuai(gan_gong, month),
            '客旺衰': get_dizhi_wangshuai(bazi.day_zhi, month),
            '整体主客': zhengti_zhuke
        };

        // L17 盘面总评
        layers['L17_盘面总评'] = {
            '整体吉凶': zhengti_jixiong,
            '主要课体': triggered_keti.length > 0 ? triggered_keti.join(',') : '无特殊课体',
            '初传吉凶': (TIANJIANG[chuan_tianjiang[0]] || {}).jixiong || '',
            '末传吉凶': (TIANJIANG[chuan_tianjiang[2]] || {}).jixiong || '',
            '贵人吉凶': '贵人临身',
            '空亡影响': kongwang_yingxiang,
            '三传趋势': sanchuan_qushi,
            '四课完备': sike_wanbei,
            '格局数量': triggered_keti.length + '个',
            '总评': '课体' + triggered_keti.length + '个·三传' + san_chuan[0] + '→' + san_chuan[1] + '→' + san_chuan[2]
        };

        return { layers: layers, zongmen: zongmen, san_chuan: san_chuan, triggered_keti: triggered_keti };
    }

    // ===== 标准接口 =====

    window.Systems.liuren = function(year, month, day, hour, minute, options) {
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

        // 生成摘要
        var summaryParts = [];
        if (result.zongmen) summaryParts.push(result.zongmen + '法');
        if (result.san_chuan) summaryParts.push('三传:' + result.san_chuan.join('→'));
        if (result.triggered_keti && result.triggered_keti.length > 0) summaryParts.push('格局' + result.triggered_keti.length + '个');

        return {
            dimensions: dimensions,
            name: '大六壬',
            summary: summaryParts.join(' · ')
        };
    };

})();
