﻿// ==UserScript==
// @name         ConCon Rare List Maker
// @namespace    http://www.TakeAsh.net/
// @version      0.1.201511232230
// @description  make ConCon Rare List source
// @author       take-ash
// @match        http://c4.concon-collector.com/help/alllist
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

(function() {
    var forceName = ['－', '炎', '光', '風'];
    var bgColors = ['BGCOLOR(#7F7F7F):', 'BGCOLOR(#580000):', 'BGCOLOR(#505000):', 'BGCOLOR(#004000):'];
    var viewUrlBase = 'http://c4.concon-collector.com/view/default/';
    var rareListBasePage = 'レア狐魂一覧(仮)';
    var br = '<br>\n';

    var textarea = document.getElementsByTagName('textarea')[0];
    var csv = textarea.textContent || textarea.innerText;
    var lines = csv.split(/\n/);
    var fields = lines.shift()
        .replace(/"/g, '')
        .split(',');
    var rares = {};
    for (var i = 0, line; line = lines[i]; ++i) {
        var rareCC = new RareCC(line);
        if (rares[rareCC.same_id]) {
            rares[rareCC.same_id].ids.push(rareCC.id);
        } else {
            rares[rareCC.same_id] = rareCC;
        }
    }
    var lots = {};
    for (var id in rares) {
        var rareCC = rares[id];
        if (!lots[rareCC.lot_id]) {
            lots[rareCC.lot_id] = {};
        }
        if (!lots[rareCC.lot_id][rareCC.rarity]) {
            lots[rareCC.lot_id][rareCC.rarity] = {};
        }
        if (!lots[rareCC.lot_id][rareCC.rarity][rareCC.id]) {
            lots[rareCC.lot_id][rareCC.rarity][rareCC.id] = rareCC;
        }
    }
    var lotGroups = [];
    var groupTitles = [];
    for (var lot in lots) {
        var index = lot == 0 ?
            0 :
            Math.floor((lot - 1) / 10) + 1;
        var lotHeader = lot == 0 ?
            'ショップ, 開始時, シリアル, イベント, 生成装置' :
            '第' + lot + '弾';
        if (!lotGroups[index]) {
            lotGroups[index] = '- [[' + rareListBasePage + ']]' + br + '#contents' + br + br;
            groupTitles[index] = [];
        }
        lotGroups[index] += '* ' + lotHeader + br;
        groupTitles[index].push(lotHeader);
        for (var rarity in lots[lot]) {
            lotGroups[index] += '- レア度' + rarity + br;
            lotGroups[index] += '|~名前|~勢力|~元|~換毛数|~換毛|h' + br;
            for (var id in lots[lot][rarity]) {
                lotGroups[index] += lots[lot][rarity][id].ToTableItem();
            }
            lotGroups[index] += br;
        }
    }
    var indexPage = '';
    for (var i = 0, group; group = lotGroups[i]; ++i) {
        PrintNewWin(group);
        indexPage += '- [[' + groupTitles[i].join(', ') + '>' + rareListBasePage + '/' + i + ']]' + br;
    }
    PrintNewWin(indexPage);

    function RareCC(line) {
        var items = ('",' + line + ',"')
            .split(/","/);
        for (var i = 0, field; field = fields[i]; ++i) {
            this[field] = items[i + 1];
        }
        this.ids = [];
        this.ToTableItem = function() {
            var bgColor = bgColors[this.force_id];
            var furs = [];
            for (var i = 0, id; id = this.ids[i]; ++i) {
                furs.push('[[' + id + '>' + viewUrlBase + id + ']]');
            }
            var fur = furs.join(', ');
            return '|COLOR(white):' + bgColor + this.title + this.name +
                '|COLOR(white):' + bgColor + forceName[this.force_id] +
                '|' + bgColor + '[[' + this.id + '>' + viewUrlBase + this.id + ']]' +
                '|COLOR(white):' + bgColor + (this.ids.length ? this.ids.length : '') +
                '|' + bgColor + fur +
                '|' + br;
        };
    }

    function PrintNewWin(text) {
        var docNew = window.open('', '_blank')
            .document;
        docNew.open('text/html');
        docNew.write('<html><body>\n' + text + '</body></html>');
        docNew.close();
    }
})();

// EOF