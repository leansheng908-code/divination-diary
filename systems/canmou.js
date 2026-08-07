/**
 * 参考系统 (Canmou) 标签生成模块
 * 从 canmou.html 提取的纯计算逻辑
 *
 * 塔罗·印度占星·元维度·内容驱动 | v1.1 优化版
 * 10层标签: L1塔罗基础 / L2大阿卡纳 / L3小阿卡纳 / L4三牌解读 / L5印度27星宿 /
 *          L6九曜系统 / L7元维度 / L8内容驱动 / L9跨文化对应 / L10综合总评
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

// === 数据定义 ===
const MAJOR_ARCANA = [
  {num:0,name:"愚者",en:"The Fool",wx:"风",desc:"新的开始/冒险/纯真",zheng:"自由/新旅程/无限可能",ni:"鲁莽/不稳定/愚蠢"},
  {num:1,name:"魔术师",en:"The Magician",wx:"水星",desc:"创造/意志力/技巧",zheng:"主动/技能/沟通",ni:"操纵/滥用才能/欺骗"},
  {num:2,name:"女祭司",en:"The High Priestess",wx:"月亮",desc:"直觉/潜意识/神秘",zheng:"内在智慧/直觉/静默",ni:"隐秘/压抑/被动"},
  {num:3,name:"皇后",en:"The Empress",wx:"金星",desc:"丰饶/母性/创造",zheng:"丰盛/滋养/创造力",ni:"过度依赖/停滞/占有欲"},
  {num:4,name:"皇帝",en:"The Emperor",wx:"白羊",desc:"权威/结构/控制",zheng:"领导/秩序/稳定",ni:"专制/固执/僵化"},
  {num:5,name:"教皇",en:"The Hierophant",wx:"金牛",desc:"传统/信仰/教育",zheng:"传统/教导/精神引导",ni:"教条/保守/束缚"},
  {num:6,name:"恋人",en:"The Lovers",wx:"双子",desc:"选择/关系/和谐",zheng:"爱情/选择/和谐",ni:"分离/错误选择/不忠"},
  {num:7,name:"战车",en:"The Chariot",wx:"巨蟹",desc:"胜利/意志/前进",zheng:"胜利/决心/控制",ni:"失控/冲动/方向迷失"},
  {num:8,name:"力量",en:"Strength",wx:"狮子",desc:"勇气/耐心/内在力量",zheng:"勇气/柔韧/内在力量",ni:"软弱/自我怀疑/失去信心"},
  {num:9,name:"隐士",en:"The Hermit",wx:"处女",desc:"内省/独处/智慧",zheng:"内省/智慧/独处",ni:"孤立/固执/退缩"},
  {num:10,name:"命运之轮",en:"Wheel of Fortune",wx:"木星",desc:"命运/转折/循环",zheng:"好运/转折点/机遇",ni:"厄运/停滞/抗拒变化"},
  {num:11,name:"正义",en:"Justice",wx:"天秤",desc:"公正/因果/平衡",zheng:"公正/真相/平衡",ni:"不公/偏见/失衡"},
  {num:12,name:"倒吊人",en:"The Hanged Man",wx:"海王",desc:"牺牲/放下/新视角",zheng:"牺牲/顿悟/新视角",ni:"无谓牺牲/拖延/受害者心态"},
  {num:13,name:"死神",en:"Death",wx:"天蝎",desc:"结束/转化/重生",zheng:"结束/转变/重生",ni:"抗拒变化/停滞/恐惧"},
  {num:14,name:"节制",en:"Temperance",wx:"射手",desc:"平衡/调和/耐心",zheng:"平衡/调和/适度",ni:"失衡/过度/不协调"},
  {num:15,name:"恶魔",en:"The Devil",wx:"摩羯",desc:"束缚/欲望/物质",zheng:"雄心/物质成就/承诺",ni:"束缚/成瘾/贪欲"},
  {num:16,name:"高塔",en:"The Tower",wx:"火星",desc:"突变/破坏/觉醒",zheng:"突然觉醒/打破旧制",ni:"灾难/毁灭/混乱"},
  {num:17,name:"星星",en:"The Star",wx:"水瓶",desc:"希望/灵感/信念",zheng:"希望/灵感/宁静",ni:"失望/悲观/失去信心"},
  {num:18,name:"月亮",en:"The Moon",wx:"双鱼",desc:"幻象/恐惧/潜意识",zheng:"直觉/梦境/创造力",ni:"迷惑/恐惧/幻觉"},
  {num:19,name:"太阳",en:"The Sun",wx:"太阳",desc:"成功/快乐/活力",zheng:"成功/快乐/活力",ni:"暂时的挫折/过度乐观"},
  {num:20,name:"审判",en:"Judgement",wx:"冥王",desc:"觉醒/重生/召唤",zheng:"觉醒/重生/宽恕",ni:"自我谴责/错过召唤/犹豫"},
  {num:21,name:"世界",en:"The World",wx:"土星",desc:"完成/圆满/成就",zheng:"完成/圆满/成就",ni:"未完成/停滞/缺乏收尾"}
];

const SUITS = {权杖:{wx:"火",zg:"行动/激情/创造/意志",fw:"南"},圣杯:{wx:"水",zg:"情感/关系/直觉/心灵",fw:"西"},宝剑:{wx:"风",zg:"思维/冲突/决断/理性",fw:"东"},星币:{wx:"土",zg:"物质/财富/现实/稳定",fw:"北"}};

const NAKSHATRA = [
  {n:1,en:"Ashwini",cn:"阿湿维尼",deity:"双马神",wx:"火",desc:"速度/治疗/先驱"},
  {n:2,en:"Bharani",cn:"巴拉尼",deity:"阎摩",wx:"火",desc:"约束/创造/忍耐"},
  {n:3,en:"Krittika",cn:"克利提卡",deity:"火神",wx:"火",desc:"净化/锐利/意志"},
  {n:4,en:"Rohini",cn:"罗希尼",deity:"梵天",wx:"月",desc:"生长/丰盛/美感"},
  {n:5,en:"Mrigashira",cn:"姆里加希拉",deity:"月神",wx:"火",desc:"探索/温柔/寻觅"},
  {n:6,en:"Ardra",cn:"阿尔德拉",deity:"风暴神",wx:"风",desc:"风暴/净化/新生"},
  {n:7,en:"Punarvasu",cn:"普纳瓦苏",deity:"母亲神",wx:"风",desc:"回归/更新/光明"},
  {n:8,en:"Pushya",cn:"普夏",deity:"木星",wx:"火",desc:"滋养/繁荣/祝福"},
  {n:9,en:"Ashlesha",cn:"阿湿莱夏",deity:"蛇神",wx:"水",desc:"洞察/隐藏/缠缚"},
  {n:10,en:"Magha",cn:"马格哈",deity:"祖先",wx:"火",desc:"传承/权力/荣誉"},
  {n:11,en:"Purva Phalguni",cn:"普拉瓦法古尼",deity:"幸运神",wx:"火",desc:"享乐/慵懒/创造"},
  {n:12,en:"Uttara Phalguni",cn:"乌塔拉法古尼",deity:"太阳神",wx:"火",desc:"契约/友谊/帮助"},
  {n:13,en:"Hasta",cn:"哈斯塔",deity:"太阳神",wx:"风",desc:"灵巧/手艺/实现"},
  {n:14,en:"Chitra",cn:"奇特拉",deity:"建筑神",wx:"火",desc:"闪耀/艺术"},
  {n:15,en:"Swati",cn:"斯瓦提",deity:"风神",wx:"风",desc:"独立/灵活/平衡"},
  {n:16,en:"Vishakha",cn:"维沙卡",deity:"双神",wx:"火",desc:"目标/野心/双分"},
  {n:17,en:"Anuradha",cn:"阿努拉达",deity:"雷神",wx:"土",desc:"友谊/团结/追随"},
  {n:18,en:"Jyeshtha",cn:"杰什塔",deity:"守护神",wx:"火",desc:"长兄/权力/保护"},
  {n:19,en:"Mula",cn:"穆拉",deity:"Nirriti",wx:"风",desc:"根/调查/摧毁"},
  {n:20,en:"Purva Ashadha",cn:"普拉瓦阿沙达",deity:"水神",wx:"水",desc:"胜利/不可征服/力量"},
  {n:21,en:"Uttara Ashadha",cn:"乌塔拉阿沙达",deity:"太阳神",wx:"土",desc:"最终胜利/坚定/承诺"},
  {n:22,en:"Shravana",cn:"什拉瓦纳",deity:"毗湿奴",wx:"土",desc:"聆听/学习/传统"},
  {n:23,en:"Dhanishta",cn:"达尼什塔",deity:"八神",wx:"火",desc:"财富/音乐/节奏"},
  {n:24,en:"Shatabhisha",cn:"沙塔比沙",deity:"药神",wx:"风",desc:"治愈/秘密/百药"},
  {n:25,en:"Purva Bhadrapada",cn:"普拉瓦巴德拉",deity:"阿贾",wx:"火",desc:"灼烧/转化/灵性"},
  {n:26,en:"Uttara Bhadrapada",cn:"乌塔拉巴德拉",deity:"蛇神",wx:"水",desc:"智慧/深度/守护"},
  {n:27,en:"Revati",cn:"雷瓦提",deity:"牧神",wx:"水",desc:"丰盛/旅程/超越"}
];

const NAVAGRAHA = {
  "太阳(Surya)":{wx:"火",desc:"灵魂/权威/父亲/健康",zg:"自我意识/生命力"},
  "月亮(Chandra)":{wx:"水",desc:"心灵/情感/母亲/记忆",zg:"情绪/潜意识"},
  "火星(Mangala)":{wx:"火",desc:"能量/勇气/兄弟/冲突",zg:"行动力/勇气"},
  "水星(Budha)":{wx:"土",desc:"智力/沟通/商业/教育",zg:"思维/沟通"},
  "木星(Guru)":{wx:"风",desc:"智慧/财富/子女/导师",zg:"智慧/扩张"},
  "金星(Shukra)":{wx:"水",desc:"爱情/美感/艺术/享受",zg:"欲望/和谐"},
  "土星(Shani)":{wx:"风",desc:"业力/限制/长寿/责任",zg:"纪律/因果"},
  "罗睺(Rahu)":{wx:"风",desc:"欲望/错觉/外国/创新",zg:"执念/突破"},
  "计都(Ketu)":{wx:"风",desc:"灵性/解脱/神秘/放下",zg:"超脱/灵性"}
};

const YUANWEIDU = {
  "时间分辨率":{desc:"年/月/日/时四维时间戳精度",sys:"全部系统通用"},
  "空间分辨率":{desc:"方位/宫位/星宿空间编码",sys:"全部系统通用"},
  "系统权重":{desc:"不同术数系统的可信度/优先级权重",sys:"元层决策"},
  "跨系统共振":{desc:"多系统对同一事件的一致性判断",sys:"元层决策"},
  "时间衰减":{desc:"标签随时间推移的衰减系数",sys:"元层维护"},
  "置信度":{desc:"每个标签生成的置信度评分",sys:"元层维护"}
};

const NEIRONG = {
  "对话内容关键词":{desc:"从对话内容提取关键词触发相关术数标签"},
  "情绪状态映射":{desc:"PSI情绪状态映射到术数维度"},
  "事件类型匹配":{desc:"不同事件类型匹配不同术数系统"},
  "用户偏好权重":{desc:"用户对不同术数系统的偏好权重"},
  "历史命中率":{desc:"历史标签命中/验证率统计"},
  "场景适配":{desc:"不同场景(婚恋/财运/健康/出行)适配不同系统"},
  "融合输出":{desc:"多系统标签融合后的最终输出格式"}
};

// ✅ 十二消息卦-大阿卡纳完整映射 (12/12)
const XIAOXI_ARCANA = {
  "复(冬至阳生)":"愚者(新开始)",
  "临(阳长阴消)":"魔术师(意志创造)",
  "泰(阴阳平衡)":"太阳(光明圆满)",
  "大壮(阳气盛长)":"皇帝(力量掌控)",
  "夬(阳气决阴)":"正义(决断平衡)",
  "乾(纯阳圆满)":"世界(完成圆满)",
  "姤(夏至阴生)":"月亮(阴始暗生)",
  "遁(阴长阳退)":"隐士(退隐内省)",
  "否(天地不交)":"倒吊人(停滞悬置)",
  "观(阴盛阳伏)":"女祭司(静观直觉)",
  "剥(阴剥阳气)":"高塔(剥落崩塌)",
  "坤(纯阴含育)":"死神(终结转化)"
};

// === 工具函数 ===

// ✅ 优化点#2: 真实日历天数+时辰+种子化RNG+逆位
function dayOfYear(y, m, d) {
  const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
  let isLeap = (y%4===0 && y%100!==0) || y%400===0;
  let doy = d;
  for (let i = 0; i < m - 1; i++) doy += daysInMonth[i];
  if (m > 2 && isLeap) doy++;
  return doy;
}

    // ===== 核心计算逻辑 =====
    function daysFromEpoch(yr, mo, dy) {
        var total = 0;
        for (var i = 1900; i < yr; i++) {
            total += ((i % 4 === 0 && i % 100 !== 0) || i % 400 === 0) ? 366 : 365;
        }
        total += dayOfYear(yr, mo, dy) - 1;
        return total;
    }

    function rngBig(s) {
        var st = BigInt(s & 0x7FFFFFFF);
        var MULT = 1103515245n;
        var INC = 12345n;
        var MASK = 0x7FFFFFFFn;
        st = (st * MULT + INC) & MASK;
        return Number(st);
    }

    function _generateLabels(y, m, d, h) {
        var realDays = daysFromEpoch(y, m, d);
        var seed = realDays * 24 + h;

        var s1 = rngBig(seed);
        var s2 = rngBig(s1);
        var s3 = rngBig(s2);

        var pastCard = MAJOR_ARCANA[s1 % 22];
        var presentCard = MAJOR_ARCANA[s2 % 22];
        var futureCard = MAJOR_ARCANA[s3 % 22];
        var pastRev = s1 % 7 === 0;
        var presentRev = s2 % 7 === 0;
        var futureRev = s3 % 7 === 0;

        // L1: 塔罗基础
        var L1 = {
            '大阿卡纳': '22张',
            '小阿卡纳': '56张',
            '总牌数': '78张',
            '权杖元素': '火 (南)',
            '圣杯元素': '水 (西)',
            '宝剑元素': '风 (东)',
            '星币元素': '土 (北)',
            '过去牌': pastCard.num + '-' + pastCard.name + (pastRev ? ' (逆位)' : ''),
            '现在牌': presentCard.num + '-' + presentCard.name + (presentRev ? ' (逆位)' : ''),
            '未来牌': futureCard.num + '-' + futureCard.name + (futureRev ? ' (逆位)' : '')
        };

        // L2: 大阿卡纳22张
        var L2 = {};
        MAJOR_ARCANA.forEach(function(c) {
            L2[c.num + '_' + c.name] = {
                '英文': c.en,
                '星象': c.wx,
                '正位': c.zheng,
                '逆位': c.ni,
                '描述': c.desc
            };
        });

        // L3: 小阿卡纳四花色
        var L3 = {};
        for (var suit in SUITS) {
            var s = SUITS[suit];
            L3[suit] = s.wx + ' / ' + s.zg + ' / ' + s.fw;
        }

        // L4: 塔罗三牌解读
        var L4 = {
            '过去牌': pastCard.name,
            '过去牌意': pastRev ? pastCard.ni : pastCard.zheng,
            '过去逆位': pastRev ? '是' : '否',
            '现在牌': presentCard.name,
            '现在牌意': presentRev ? presentCard.ni : presentCard.zheng,
            '现在逆位': presentRev ? '是' : '否',
            '未来牌': futureCard.name,
            '未来牌意': futureRev ? futureCard.ni : futureCard.zheng,
            '未来逆位': futureRev ? '是' : '否'
        };

        // L5: 印度占星27星宿
        var L5 = {};
        NAKSHATRA.forEach(function(n) {
            L5[n.n + '_' + n.cn] = {
                '英文': n.en,
                '主神': n.deity,
                '五行': n.wx,
                '描述': n.desc
            };
        });

        // L6: 九曜系统
        var L6 = {};
        for (var name in NAVAGRAHA) {
            var g = NAVAGRAHA[name];
            L6[name] = {
                '五行': g.wx,
                '主管': g.desc,
                '作用': g.zg
            };
        }

        // L7: 元维度
        var L7 = {};
        for (var yname in YUANWEIDU) {
            var y2 = YUANWEIDU[yname];
            L7[yname] = y2.desc + ' (' + y2.sys + ')';
        }

        // L8: 内容驱动
        var L8 = {};
        for (var nname in NEIRONG) {
            L8[nname] = NEIRONG[nname].desc;
        }

        // L9: 跨文化对应
        var L9 = {
            '中国五行_西方塔罗': '火=权杖 / 水=圣杯 / 金=宝剑 / 土=星币 / 木=无直接对应(五行衍生:木生火→权杖)',
            '中国二十八宿_印度27星宿': '二十八宿分四象对应27星宿分三方(均基于月亮27.3天恒星月周期)',
            '中国天干_西方行星': '甲乙=木星 / 丙丁=火星 / 戊己=土星 / 庚辛=金星 / 壬癸=水星',
            '中国八卦_西方四元素': '坎=水 / 离=火 / 震巽=木(风) / 乾兑=金 / 坤艮=土',
            '中国地支_西方星座': '子=水瓶 / 丑=摩羯 / 寅=射手 / 卯=天蝎 / 辰=天秤 / 巳=处女 (基于恒星黄道逆序映射)',
            '十二消息卦_大阿卡纳': Object.keys(XIAOXI_ARCANA).map(function(k) { return k + '=' + XIAOXI_ARCANA[k]; }).join(' / '),
            '九宫飞星_西方占星宫位': '一白=第1宫 / 九紫=第9宫 / 五黄=中天 (近似映射)',
            '纳音五行_西方元素': '海中金=土象 / 炉中火=火象 / 大林木=木象等(30纳音按主元素归类)',
            '太岁_行星周期': '太岁12年 ≈ 木星11.86年公转周期(岁星纪年法)',
            '梅花易数_西方数字命理': '八卦数理 = 毕达哥拉斯数理(均为数字对应宇宙规律的数理系统)'
        };

        // L10: 综合总评
        var L10 = {
            '塔罗过去': pastCard.name + '-' + (pastRev ? '逆位:' + pastCard.ni : pastCard.zheng),
            '塔罗现在': presentCard.name + '-' + (presentRev ? '逆位:' + presentCard.ni : presentCard.zheng),
            '塔罗未来': futureCard.name + '-' + (futureRev ? '逆位:' + futureCard.ni : futureCard.zheng),
            '塔罗整体': (pastRev && futureRev) ? '转折' : '发展',
            '元维度数': '6',
            '内容驱动数': '7',
            '跨文化对应数': '10',
            '参考系统定位': '独立参考,不参与主排盘,用于跨文化对照',
            '融合策略': '中国术数为主,塔罗/印度为辅,元维度调控,内容驱动触发',
            '最终输出': '多系统标签向量+跨文化对照+元维度权重'
        };

        // 计算维度数
        var totalDims = 0;
        var allLayers = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10];
        for (var li = 0; li < allLayers.length; li++) {
            var layer = allLayers[li];
            var lkeys = Object.keys(layer);
            for (var lki = 0; lki < lkeys.length; lki++) {
                var lv = layer[lkeys[lki]];
                if (typeof lv === 'object' && lv !== null) {
                    totalDims += Object.keys(lv).length;
                } else if (lv !== null && lv !== '' && lv !== false) {
                    totalDims++;
                }
            }
        }

        return {
            layers: {
                'L1_塔罗基础': L1,
                'L2_大阿卡纳22张': L2,
                'L3_小阿卡纳四花色': L3,
                'L4_塔罗三牌解读': L4,
                'L5_印度27星宿': L5,
                'L6_九曜系统': L6,
                'L7_元维度': L7,
                'L8_内容驱动': L8,
                'L9_跨文化对应': L9,
                'L10_综合总评': L10
            },
            meta: {
                systemName: 'canmou',
                systemNameCn: '参考系统',
                totalDimensions: totalDims,
                seed: seed,
                timestamp: y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0') + ' ' + String(h).padStart(2, '0') + ':00',
                drawnCards: [pastCard.name, presentCard.name, futureCard.name]
            }
        };
    }

    // ===== 标准接口 =====
    window.Systems.canmou = function(year, month, day, hour, minute, options) {
        hour = hour || 12;
        minute = minute || 0;
        options = options || {};

        var result = _generateLabels(year, month, day, hour);
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
                    dimensions[layerName + '.' + key] = val;
                }
            }
        }

        // 生成摘要
        var l4 = layers['L4_塔罗三牌解读'] || {};
        var l10 = layers['L10_综合总评'] || {};
        var summary = '';
        if (l4['过去牌']) summary += l4['过去牌'];
        if (l4['现在牌']) summary += ' → ' + l4['现在牌'];
        if (l4['未来牌']) summary += ' → ' + l4['未来牌'];
        if (l10['塔罗整体']) summary += ' | ' + l10['塔罗整体'];

        return {
            dimensions: dimensions,
            name: '参考系统',
            meta: result.meta
        };
    };

})();
