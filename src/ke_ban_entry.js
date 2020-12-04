import $ from "jquery";
import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");
import { getTodayDate, get_pay_term_start_date, get_pay_term_end_date } from "./ke_ban";

// 申込可能な稼働日の期間を設定する
$(() => {
    const today = getTodayDate();
    document.getElementById("available_term").innerText = `${get_pay_term_start_date(today).format("YYYY年MM月DD日(ddd)")}〜${get_pay_term_end_date(today).format("YYYY年MM月DD日(ddd)")}`;
});

// 申込締切日を設定する
$(() => {
    const today = getTodayDate();
    document.getElementById("apply_deadline").innerText = `${get_pay_term_end_date(today).format("YYYY年MM月DD日(ddd)")} 23:59`;
});

// 案内ページを開いた月について、手数料率のtableを生成する
$(() => {
    const today = getTodayDate();

    const getRateJson = (today) => {
        const week_terms = ((today) => {
            const first = today.date(1);

            const getTermEnd = (date) => {
                // 日曜日、もしくは月の末日を返す
                let target = date;
                while ((target.day() !== 0) && (target.date() !== target.endOf("month").date())) {
                    console.log("processing get term end...");
                    target = target.add(1, "day");
                    if ((target.day() === 0) || (target.date() === target.endOf("month").date())) {
                        return target;
                    }
                }

                return target;
            };
            const getNextTermStart = (date) => {
                // 現状は常にTermEndの翌日
                return date.add(1, "day");
            };

            const terms = [];
            let term_start = first;
            while (term_start.month() === today.month()) {
                console.log("processing get terms...");
                const term_end = getTermEnd(term_start);
                terms.push({
                    "start": term_start,
                    "end": term_end
                });

                term_start = getNextTermStart(term_end);
            }

            return terms;
        })(today);

        const rates = [
            "5.7%",
            "5.5%",
            "5.3%",
            "5.1%",
            "4.9%",
            "4.9%",
        ];
        return week_terms.map((week, i) => {
            return {
                "稼働した日時": `${week.start.format("YYYY年MM月DD日(ddd)")}〜${week.end.format("YYYY年MM月DD日(ddd)")}`,
                "手数料率": rates[i],
            };
        });
    };

    const rate_json = getRateJson(today);

    // script by https://qiita.com/kunihiro9216/items/15339509604d66fdb961
    // table要素を生成
    const table = document.createElement("table");
    table.className = "schedule";

    const colgroup = document.createElement("colgroup");
    const col_term = document.createElement("col");
    col_term.className = "week_term_col";
    colgroup.appendChild(col_term);
    const col_rate = document.createElement("col");
    colgroup.appendChild(col_rate);
    table.appendChild(colgroup);

    // ヘッダーを作成
    const header_tr = document.createElement("tr");
    for (const key in rate_json[0]) {
        // th要素を生成
        const th = document.createElement("th");
        // th要素内にテキストを追加
        th.textContent = key;
        // th要素をtr要素の子要素に追加
        header_tr.appendChild(th);
    }
    // tr要素をtable要素の子要素に追加
    const table_head = document.createElement("thead");
    table_head.appendChild(header_tr);
    table.appendChild(table_head);

    // テーブル本体を作成
    const table_body = document.createElement("tbody");
    for (let i = 0; i < rate_json.length; i++) {
        // tr要素を生成
        const body_tr = document.createElement("tr");
        // th・td部分のループ
        for (const key in rate_json[0]) {
            // td要素を生成
            const td = document.createElement("td");
            // td要素内にテキストを追加
            td.textContent = rate_json[i][key];
            // td要素をtr要素の子要素に追加
            body_tr.appendChild(td);
        }
        // tr要素をtable要素の子要素に追加
        table_body.appendChild(body_tr);
    }
    table.appendChild(table_body);
    // 生成したtable要素を追加する
    document.getElementById("rate_table").replaceChild(table, document.getElementById("sample_table"));
});
