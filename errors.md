# エラーコード対応表

### Generic
- -1: Unknown Interaction type
- -2: Unknown command(like /hoge)
- -3: Unknown modal id(in modal submission)

### Bukigi-Random
- 100: `guild_id` がリクエストに含まれなかったことによるもの。bot との DM だと無いです。bot がいるサーバでやりましょう。
- 101: [register] 存在するべきでない form の custom_id が送信されています。
- 102: [register] DB への INSERT に失敗しています。
- 103: [random] ブキ擬が登録されていません。