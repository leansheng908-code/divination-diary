/**
 * 经济周期 (Economic Cycle) 标签生成模块
 * 从 Python economic_cycle_label_dictionary.py 移植
 *
 * 周期定义:
 *   A恐慌：间隔[18,20,16]循环，54年大周期，起点1927
 *   B繁荣：间隔[9,10,8]循环，27年大周期，起点1926
 *   C艰难：间隔[7,11,9]循环，27年大周期，起点1924
 *
 * 段类型(4种):
 *   C→B：买入窗口 / B→A：卖出窗口 / A→C：持币窗口 / B→C：观望窗口
 */

window.Systems = window.Systems || {};

(function() {
    'use strict';

    // ===== Part 1: 周期计算引擎 =====

    var _CYCLES = {
        A: { start: 1927, intervals: [18, 20, 16] },
        B: { start: 1926, intervals: [9, 10, 8] },
        C: { start: 1924, intervals: [7, 11, 9] }
    };

    var _PHASE_PRIORITY = { C: 0, B: 1, A: 2 };
    var _PHASE_CN = { A: 'A恐慌', B: 'B繁荣', C: 'C艰难' };

    var _SEGMENT_TYPES = {
        'C,B': 'C→B',
        'B,A': 'B→A',
        'A,C': 'A→C',
        'B,C': 'B→C'
    };

    var _WINDOW_TYPES = {
        'C→B': '买入',
        'B→A': '卖出',
        'A→C': '持币',
        'B→C': '观望'
    };

    var _ACTION_MAP = {
        'C→B,早期': '建仓',
        'C→B,中期': '加仓',
        'C→B,晚期': '持有',
        'B→A,早期': '持有',
        'B→A,中期': '减仓',
        'B→A,晚期': '清仓',
        'A→C,早期': '空仓',
        'A→C,中期': '观望',
        'A→C,晚期': '准备',
        'B→C,早期': '持有',
        'B→C,中期': '观望',
        'B→C,晚期': '准备建仓'
    };

    function _generateCycleYears(phase, minYear, maxYear) {
        minYear = minYear || 1800;
        maxYear = maxYear || 2200;
        var cfg = _CYCLES[phase];
        var start = cfg.start;
        var intervals = cfg.intervals;
        var n = intervals.length;
        var years = [];

        // 向前生成
        var year = start;
        var idx = 0;
        while (year <= maxYear) {
            years.push(year);
            year += intervals[idx % n];
            idx++;
        }

        // 向后生成
        var revIntervals = intervals.slice().reverse();
        year = start;
        idx = 0;
        while (year > minYear) {
            year -= revIntervals[idx % n];
            if (year >= minYear) {
                years.push(year);
            }
            idx++;
        }

        // 去重并排序
        var unique = {};
        for (var i = 0; i < years.length; i++) {
            unique[years[i]] = true;
        }
        var result = Object.keys(unique).map(Number).sort(function(a, b) { return a - b; });
        return result;
    }

    function _generateAllTurningPoints(minYear, maxYear) {
        minYear = minYear || 1800;
        maxYear = maxYear || 2200;
        var points = [];
        var phases = ['A', 'B', 'C'];
        for (var pi = 0; pi < phases.length; pi++) {
            var phase = phases[pi];
            var yrs = _generateCycleYears(phase, minYear, maxYear);
            for (var i = 0; i < yrs.length; i++) {
                points.push([yrs[i], phase]);
            }
        }
        points.sort(function(a, b) {
            if (a[0] !== b[0]) return a[0] - b[0];
            return _PHASE_PRIORITY[a[1]] - _PHASE_PRIORITY[b[1]];
        });
        return points;
    }

    // ===== Part 2: 段判断引擎 =====

    function _findCurrentSegment(year, points) {
        if (!points) {
            points = _generateAllTurningPoints();
        }

        var pastIdx = null;
        for (var i = 0; i < points.length; i++) {
            if (points[i][0] <= year) {
                pastIdx = i;
            } else {
                break;
            }
        }

        if (pastIdx === null || pastIdx + 1 >= points.length) {
            return null;
        }

        var startYear = points[pastIdx][0];
        var startPhase = points[pastIdx][1];
        var endYear = points[pastIdx + 1][0];
        var endPhase = points[pastIdx + 1][1];

        var segType = _SEGMENT_TYPES[startPhase + ',' + endPhase];
        if (segType === undefined) {
            return null;
        }

        var nextSegType = null;
        if (pastIdx + 2 < points.length) {
            var nextEndPhase = points[pastIdx + 2][1];
            nextSegType = _SEGMENT_TYPES[endPhase + ',' + nextEndPhase] || null;
        }

        return {
            segmentType: segType,
            startYear: startYear,
            startPhase: startPhase,
            endYear: endYear,
            endPhase: endPhase,
            totalYears: endYear - startYear,
            nextSegmentType: nextSegType
        };
    }

    function _findNearestPhase(year, phase) {
        var years = _generateCycleYears(phase);
        var bestYear = years[0];
        var bestDist = Math.abs(years[0] - year);
        for (var i = 1; i < years.length; i++) {
            var dist = Math.abs(years[i] - year);
            if (dist < bestDist) {
                bestDist = dist;
                bestYear = years[i];
            }
        }
        return [bestYear, bestDist];
    }

    function _findPastSameSegments(segType, currentStart, points) {
        if (!points) {
            points = _generateAllTurningPoints();
        }

        var segments = [];
        for (var i = 0; i < points.length - 1; i++) {
            var sy = points[i][0];
            var sp = points[i][1];
            var ey = points[i + 1][0];
            var ep = points[i + 1][1];
            var st = _SEGMENT_TYPES[sp + ',' + ep];
            if (st === segType && ey < currentStart) {
                segments.push({
                    start: sy,
                    end: ey,
                    length: ey - sy
                });
            }
        }

        segments.sort(function(a, b) { return b.end - a.end; });
        return segments;
    }

    // ===== Part 3: 标签生成 =====

    function _countDims(d) {
        var count = 0;
        if (d === null || d === undefined) return 0;
        if (typeof d === 'object' && !Array.isArray(d)) {
            var keys = Object.keys(d);
            for (var i = 0; i < keys.length; i++) {
                count += _countDims(d[keys[i]]);
            }
        } else if (typeof d === 'string' || typeof d === 'number') {
            if (d !== '' && d !== null && d !== undefined) {
                count++;
            }
        } else if (Array.isArray(d)) {
            for (var j = 0; j < d.length; j++) {
                count += _countDims(d[j]);
            }
        }
        return count;
    }

    function _generateLabels(year, month, day, hour, minute) {
        var points = _generateAllTurningPoints();
        var seg = _findCurrentSegment(year, points);

        if (seg === null) {
            return {
                layers: { 'L1_周期定位': { '错误': '无法定位当前段' } },
                meta: { systemName: 'economic_cycle', error: true }
            };
        }

        var segType = seg.segmentType;
        var startYear = seg.startYear;
        var endYear = seg.endYear;
        var totalYears = seg.totalYears;
        var elapsed = year - startYear;
        var remaining = endYear - year;
        var progress = totalYears > 0 ? Math.round(elapsed / totalYears * 1000) / 10 : 100.0;

        // L1: 周期定位
        var nearestA = _findNearestPhase(year, 'A');
        var nearestB = _findNearestPhase(year, 'B');
        var nearestC = _findNearestPhase(year, 'C');

        var L1 = {
            '当前段类型': segType,
            '段起始年份': String(startYear),
            '段起始阶段': _PHASE_CN[seg.startPhase],
            '段结束年份': String(endYear),
            '段结束阶段': _PHASE_CN[seg.endPhase],
            '段总长度': String(totalYears),
            '段已走年数': String(elapsed),
            '段剩余年数': String(remaining),
            '段进度': progress + '%',
            '最近A恐慌': nearestA[0] + '年(距' + nearestA[1] + '年)',
            '最近B繁荣': nearestB[0] + '年(距' + nearestB[1] + '年)',
            '最近C艰难': nearestC[0] + '年(距' + nearestC[1] + '年)'
        };

        // L5: 投资窗口
        var stage;
        if (progress <= 33.3) {
            stage = '早期';
        } else if (progress <= 66.6) {
            stage = '中期';
        } else {
            stage = '晚期';
        }

        var windowType = _WINDOW_TYPES[segType];
        var action = _ACTION_MAP[segType + ',' + stage] || '观望';

        var risk;
        if (progress <= 33.3) {
            risk = '低';
        } else if (progress <= 66.6) {
            risk = '中';
        } else {
            risk = '高';
        }

        var nextWindowStr = '未知';
        if (seg.nextSegmentType) {
            var nw = _WINDOW_TYPES[seg.nextSegmentType] || '未知';
            nextWindowStr = nw + '(' + endYear + '年起)';
        }

        var L5 = {
            '窗口类型': windowType,
            '窗口阶段': stage,
            '操作建议': action,
            '风险等级': risk,
            '距窗口关闭': remaining + '年',
            '下一窗口': nextWindowStr
        };

        // L6: 历史对照 (无JSON历史文件，使用'待记录')
        var pastSegs = _findPastSameSegments(segType, startYear, points);

        var lastSegStr = '待记录';
        if (pastSegs.length >= 1) {
            var ps = pastSegs[0];
            lastSegStr = ps.start + '-' + ps.end + '年: 待记录';
        }

        var lastLastSegStr = '待记录';
        if (pastSegs.length >= 2) {
            var ps2 = pastSegs[1];
            lastLastSegStr = ps2.start + '-' + ps2.end + '年: 待记录';
        }

        var avgStr = '待记录';
        var vsAvg = '待记录';
        if (pastSegs.length > 0) {
            var sumLen = 0;
            for (var k = 0; k < pastSegs.length; k++) {
                sumLen += pastSegs[k].length;
            }
            var avgLength = sumLen / pastSegs.length;
            avgStr = (Math.round(avgLength * 10) / 10) + '年';
            var diff = totalYears - avgLength;
            if (Math.abs(diff) <= 1) {
                vsAvg = '正常';
            } else if (diff > 1) {
                vsAvg = '偏长(+' + (Math.round(diff * 10) / 10) + '年)';
            } else {
                vsAvg = '偏短(' + (Math.round(diff * 10) / 10) + '年)';
            }
        }

        var L6 = {
            '上一轮同段': lastSegStr,
            '上上轮同段': lastLastSegStr,
            '历史平均长度': avgStr,
            '当前vs均值': vsAvg
        };

        var totalDims = _countDims(L1) + _countDims(L5) + _countDims(L6);

        return {
            layers: {
                'L1_周期定位': L1,
                'L5_投资窗口': L5,
                'L6_历史对照': L6
            },
            meta: {
                systemName: 'economic_cycle',
                systemNameCn: '经济周期',
                totalDimensions: totalDims,
                trustLevels: {
                    'L1_周期定位': 'high',
                    'L5_投资窗口': 'medium',
                    'L6_历史对照': 'medium_low'
                },
                growthEnabled: true,
                growthNote: 'L6历史对照层支持自动成长，运行器可在新段完成时通过联网搜索追加事件记录'
            }
        };
    }

    // ===== 标准接口 =====

    window.Systems.economic_cycle = function(year, month, day, hour, minute, options) {
        hour = hour || 12;
        minute = minute || 0;
        options = options || {};

        var result = _generateLabels(year, month, day, hour, minute);
        var layers = result.layers;
        var dimensions = {};

        // 展平为 dimensions
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
        var l1 = layers['L1_周期定位'] || {};
        var l5 = layers['L5_投资窗口'] || {};
        var summaryParts = [];
        if (l1['当前段类型']) summaryParts.push(l1['当前段类型']);
        if (l5['窗口类型']) summaryParts.push(l5['窗口类型'] + '窗口');
        if (l1['段剩余年数']) summaryParts.push('剩余' + l1['段剩余年数'] + '年');

        return {
            dimensions: dimensions,
            name: '经济周期',
            meta: result.meta
        };
    };

})();
