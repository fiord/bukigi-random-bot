# bukigi-random-bot
ブキ擬ランダムボット

## コマンド一覧

- `bukigi-manager list`: 実行した人のブキ擬を一覧表示します
- `bukigi-manager register`: 実行した人のブキ擬として登録をします（フォームが出るよ）
- `bukigi-manager update <name>`: `name` で指定したブキ擬の情報を変更するよ（登録した人のみ可能。フォームが出るよ）
- `bukigi-manager delete <name>`: `name` で指定したブキ擬の情報を削除するよ（登録した人のみ可能）
- `bukigi-random`: 実行した人のブキ擬をランダムに 1 人選んで紹介するよ

## ブキ擬の情報について
下記の情報が登録時に要求されます。

- 名前: ブキ擬の名前（ブキ名が望ましいかと）
- URL: `bukigi-random` 実行時に紹介をしてくれます。その際の Discord のメッセージリンクを入れてあげてください。
