/*
    Version 1
    申込みアプリ(159)のレコードを、工務店と締日ごとに金額をまとめ、回収アプリ(160)に新規レコードとして挿入する。

    申込みアプリでの対象レコードは、下記の全ての条件を満たすもの。
        状態が「支払予定明細送付済」 かつ 回収IDが未入力

    回収アプリに新規レコードとして追加したあと、
    申込みレコードの回収IDフィールドに回収アプリ側のレコード番号を入力する。
*/

(function () {
    "use strict";

    const KINTONE_GET_MAX_SIZE = 500;

    const APP_ID_APPLY = 159;
    const recordId_APPLY = 'レコード番号';
    const statusField_APPLY = '状態';
    const statusCodeReady_APPLY = '支払予定明細送付済'
    const constructionShopId_APPLY = 'constructionShopId';
    const closingDay_APPLY = 'closingDay';
    const applicant_APPLY = '支払先正式名称';
    const totalReceivables_APPLY = 'totalReceivables';
    const paymentDate_APPLY = 'paymentDate';
    const collectId_APPLY = 'collectId';

    const APP_ID_COLLECT = 160;
    const recordId_COLLECT = 'レコード番号';
    const constructionShopId_COLLECT = 'constructionShopId';
    const closingDate_COLLECT = 'closingDate';
    const deadline_COLLECT = 'deadline';
    const statusField_COLLECT = 'collectStatus';
    const statusDefault_COLLECT = 'クラウドサイン送信待ち';
    const scheduledCollectableAmount_COLLECT = 'scheduledCollectableAmount';

    const APP_ID_KOMUTEN = 96;
    const constructionShopId_KOMUTEN = 'id';
    const originalPaymentDate_KOMUTEN = 'original';

    kintone.events.on('app.record.index.show', function(event) {
        if (need_insert_records()) {
            var button = getInsertCollectRecordButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function need_insert_records() {``
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById('insertCollect') === null;
    }

    function getInsertCollectRecordButton() {
        var insertCollect = document.createElement('button');
        insertCollect.id = 'insertCollect';
        insertCollect.innerText = '債権譲渡契約準備を開始';
        insertCollect.addEventListener('click', clickInsertCollect);
        return insertCollect;
    }

    // ボタンクリック時の処理を定義
    function clickInsertCollect() {
        var clicked_ok = confirm('支払明細送付済みの申込みを、工務店と締日ごとにまとめ、回収アプリにレコード追加します。');
        if (!clicked_ok) {
            alert('処理は中断されました。');
            return;
        }

        var applies = [];

        // 対象となるレコードを申込みアプリからとりあえず全件取得
        getAppliesReadyForCollect()
        .then((insert_targets_array) => {
            if (insert_targets_array.length <= 0) {
                throw new Error('状態が 支払予定明細送付済 かつ\n回収IDが 未入力 のレコードは存在しませんでした。\n回収アプリのレコードを作り直したい場合は、\n回収アプリのレコード詳細画面から\n「回収レコード削除」ボタンを押してください。');
            }

            // 取得した申込みレコードはあとで使うので保持しておく
            applies = applies.concat(insert_targets_array);

            // 取得したレコードを元に、回収アプリにレコードを追加する。
            return insertCollectRecords(insert_targets_array);
        })
        .then((inserted_ids) => {
            console.log('insert completed.');
            console.log(inserted_ids);
            if (!inserted_ids.length > 0) {
                throw new Error('レコード追加に失敗しました。');
            }

            // 回収アプリのレコード番号を、申込みレコードに紐付ける
            return assignCollectIdsToApplies(applies, inserted_ids);
        })
        .then((updated_apply_records) => {
            console.log('update completed.');
            console.log(updated_apply_records);
            if (!updated_apply_records.length > 0) {
                throw new Error('申込みレコードと回収レコードの紐付けに失敗しました。');
            }

            alert(`${updated_apply_records.length}件 の申込みレコードを回収アプリに登録しました。`);
            alert('ページを更新します。');
            window.location.reload();
        }, (err) => {
            alert(err.message);
        });
    }

    function getAppliesReadyForCollect() {
        return new kintone.Promise((resolve, reject) => {
            new kintone.Promise((rslv) => {
                console.log('申込みアプリの中で支払予定明細送付済 かつ 回収IDが未入力のレコードを全て取得する。');

                var request_body = {
                    'app': APP_ID_APPLY,
                    'fields': [
                        recordId_APPLY,
                        constructionShopId_APPLY,
                        closingDay_APPLY,
                        applicant_APPLY,
                        totalReceivables_APPLY,
                        paymentDate_APPLY
                    ],
                    'query': `${statusField_APPLY} in (\"${statusCodeReady_APPLY}\") and ${collectId_APPLY} = \"\" order by レコード番号 asc`,
                    'size': KINTONE_GET_MAX_SIZE
                };

                kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', request_body, (resp) => {
                    rslv(resp.id);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
            })
            .then(async (cursor_id) => {
                var request_body = {
                    'id': cursor_id
                };

                var apply_records = [];
                var record_remaining = true;
                do {
                    var resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', request_body);
                    apply_records = apply_records.concat(resp.records);
                    record_remaining = resp.next;
                } while (record_remaining);

                // カーソルからすべてのレコードを取得すると、カーソルは自動的に削除される。

                console.log('all target records are');
                console.log(apply_records);
                resolve(apply_records);
            });
        });
    }

    function insertCollectRecords(insert_targets_array) {
        return new kintone.Promise((resolve, reject) => {
            console.log('回収アプリにレコード挿入できる形にデータを加工する。');

            // 渡されてくるのは {constructionShopId: {…}, 支払先正式名称: {…}, totalReceivables: {…}, closingDay: {…}, paymentDate: {…}} のオブジェクトの配列
            // 各keyに対応するフィールド値へのアクセスは、array[0].constructionShopId.valueのようにする。

            // まず工務店IDと締日だけ全て抜き出す
            var key_pairs = [];
            insert_targets_array.map((obj) => {
                key_pairs.push({
                    [constructionShopId_APPLY]: obj[constructionShopId_APPLY]['value'],
                    [closingDay_APPLY]: obj[closingDay_APPLY]['value']
                });
            });

            // 抜き出した工務店IDと締日のペアについて、重複なしのリストを作る。
            // ロジックとしては、filterを利用するよく知られた重複削除のロジックと同じ。
            // 今回はオブジェクトの配列なので、インデックスを探す上でindexOfが使えない代わりにfindIndexを使っている。
            var not_duplicated_key_pairs = key_pairs.filter((key_pair1, key_pairs_index, self_arr) => {
                var target_index = self_arr.findIndex(((key_pair2) => {
                    var same_constructionShopId = (key_pair1[constructionShopId_APPLY] === key_pair2[constructionShopId_APPLY]);
                    var same_closingDay = (key_pair1[closingDay_APPLY] === key_pair2[closingDay_APPLY]);

                    return (same_constructionShopId && same_closingDay)
                }));

                var not_dpl = (target_index === key_pairs_index);
                return not_dpl;
            });

            console.log('not_duplicated_key_pairs is');
            console.log(not_duplicated_key_pairs);

            // 工務店マスタから回収日の情報を取得
            new kintone.Promise(async (rslv) => {
                var cursor_body = {
                    'app': APP_ID_KOMUTEN,
                    'fields': [constructionShopId_KOMUTEN, originalPaymentDate_KOMUTEN],
                    'query': 'order by レコード番号 asc',
                    'size': KINTONE_GET_MAX_SIZE
                }

                var cursor_resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', cursor_body);

                var request_body = {
                    'id': cursor_resp.id
                }

                var komuten_records = [];
                var record_remaining = true;
                do {
                    var resp = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', request_body);
                    komuten_records = komuten_records.concat(resp.records);
                    record_remaining = resp.next;
                } while (record_remaining);

                var rslv_obj = {};
                komuten_records.map((komuten_record) => {
                    rslv_obj[komuten_record[constructionShopId_KOMUTEN]['value']] = komuten_record[originalPaymentDate_KOMUTEN]['value'];
                });

                rslv(rslv_obj);
            })
            .then((komuten_info) => {
                // 重複なしの工務店IDと締日のペアを元に、INSERT用のレコードを作成。
                var request_body = {
                    'app': APP_ID_COLLECT,
                    'records': []
                };

                not_duplicated_key_pairs.map((key_pair) => {
                    var new_record = {};
                    new_record[constructionShopId_COLLECT] = {};
                    new_record[constructionShopId_COLLECT]['value'] = key_pair[constructionShopId_APPLY];

                    new_record[closingDate_COLLECT] = {};
                    new_record[closingDate_COLLECT]['value'] = key_pair[closingDay_APPLY];

                    // 工務店マスタの入力内容から回収期限を計算。
                    var original_payment_date_str = komuten_info[String(key_pair[constructionShopId_APPLY])];
                    new_record[deadline_COLLECT] = {};
                    new_record[deadline_COLLECT]['value'] = getDeadline(key_pair[closingDay_APPLY], original_payment_date_str);

                    new_record[statusField_COLLECT] = {};
                    new_record[statusField_COLLECT]['value'] = statusDefault_COLLECT;

                    // 工務店IDと締日が同じ申込みレコードを抽出
                    var target_records = insert_targets_array.filter((obj) => {
                        return (obj[constructionShopId_APPLY]['value'] === new_record[constructionShopId_COLLECT]['value']
                        && obj[closingDay_APPLY]['value'] === new_record[closingDate_COLLECT]['value']);
                    });

                    // 抽出した中から申込金額を合計
                    var totalAmount = target_records.reduce((total, record_obj) => {
                        return total + Number(record_obj[totalReceivables_APPLY]['value']);
                    }, 0);

                    new_record[scheduledCollectableAmount_COLLECT] = {'value': totalAmount};

                    request_body.records.push(new_record);
                });

                // INSERT実行
                console.log('insert request body is');
                console.log(request_body);
                kintone.api(kintone.api.url('/k/v1/records', true), 'POST', request_body, (resp) => {
                    resolve(resp.ids);
                });
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    function getDeadline(closingDay, original_payment_date_str) {
        var splitted = closingDay.split('-');
        var closing = new Date(Number(splitted[0]), Number(splitted[1])-1, Number(splitted[2]));

        // 工務店マスタの通常の支払日の入力書式は 翌(々|)月(末|\d{1,2}日) となる
        // '翌'の数と'々'の数を合計して、何ヶ月後か判定する
        var months_later = (original_payment_date_str.match(/翌/g) || []).length + (original_payment_date_str.match(/々/g) || []).length;

        // 年をまたいだ場合、Yearも計算される
        // 第二引数にはデフォルトでgetDate()の値が渡される。その時、30日までしかない月なのに31日の値が入ってきたりすると月が進んでしまうので、1を渡しておく。
        var deadline = closing;
        deadline.setMonth(deadline.getMonth() + Number(months_later), 1);

        // 日付を判定してセット。末日かそうでないかで場合分け
        if (original_payment_date_str.match(/末/)) {
            // 月の末日をセット。0を指定すると'前月の'最終日がセットされる。
            deadline.setMonth(deadline.getMonth() + 1);
            deadline.setDate(0);
        } else {
            // 数字だけ抜き出して日付とする
            var date = original_payment_date_str.replace(/[^0-9]/g, '');
            deadline.setDate(Number(date));
        }

        return [deadline.getFullYear(), deadline.getMonth()+1, deadline.getDate()].join('-');
    }

    function assignCollectIdsToApplies(applies, inserted_ids) {
        return new kintone.Promise((resolve, reject) => {
            new kintone.Promise((rslv) => {
                console.log('申込みレコードに回収レコードのレコード番号を振る');

                // 先ほど回収アプリに挿入したレコードのidを使って、そのまま回収アプリからGET。取得上限の500件は超えない想定
                var in_query = '(\"' + inserted_ids.join('\",\"') + '\")';
                var request_body = {
                    'app': APP_ID_COLLECT,
                    'fields': [recordId_COLLECT, constructionShopId_COLLECT, closingDate_COLLECT],
                    'query': `${recordId_COLLECT} in ${in_query}`
                };
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', request_body
                , (resp) => {
                    rslv(resp.records);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
            })
            .then((collect_records) => {
                var put_records = []

                // 工務店IDと締日が同じ申込みレコードの回収IDフィールドに、回収レコードのレコード番号をセット
                collect_records.map((collect_record) => {
                    console.log('collect_record is');
                    applies.map((apply_record) => {
                        console.log(collect_record);
                        var same_constructionShopId = (apply_record[constructionShopId_APPLY]['value'] === collect_record[constructionShopId_COLLECT]['value']);
                        var same_closingDay = (apply_record[closingDay_APPLY]['value'] === collect_record[closingDate_COLLECT]['value']);

                        if (same_constructionShopId && same_closingDay) {
                            put_records.push({
                                'id': apply_record[recordId_APPLY]['value'],
                                'record': {
                                    [collectId_APPLY]: {'value': collect_record[recordId_COLLECT]['value']}
                                }
                            });
                        }
                    });
                });

                // レコード更新
                var request_body = {
                    'app': APP_ID_APPLY,
                    'records': put_records
                }

                kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body
                , (resp) => {
                    resolve(resp.records);
                }, (err) => {
                    console.log(err);
                    reject(err);
                });
            })
        })
    }
})();
