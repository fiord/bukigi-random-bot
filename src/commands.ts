

export const PING_COMMAND = {
    name: 'bukigi-ping',
    description: 'ping',
};

export const BUKIGI_MANAGER_COMMAND = {
    name: 'bukigi-manager',
    description: 'ブキ擬を登録/更新/削除するよ',
    register_modal_id: 'bukigi-random-register-modal',
    update_modal_id: 'bukigi-random-update-modal',
    options: [
        {
            name: 'register',
            type: 1, // SUB_COMMAND,
            description: 'ブキ擬の登録をするよ',
        },
        {
            name: 'list',
            type: 1, // SUB_COMMAND
            description: 'ブキ擬の一覧を表示するよ',
        },
        {
            name: 'update',
            type: 1, // SUB_COMMAND
            description: 'ブキ擬の更新をするよ',
            options: [
                {
                    name: 'name',
                    type: 3, // STRING
                    description: '更新するブキ擬の名前',
                    required: true,
                },
            ],
        },
        {
            name: 'delete',
            type: 1, // SUB_COMMAND
            description: 'ブキ擬の削除をするよ',
            options: [
                {
                    name: 'name',
                    type: 3, // STRING
                    description: '削除するブキ擬の名前',
                    required: true,
                },
            ],
        },
    ],
};

export const BUKIGI_RANDOM_COMMAND = {
    name: 'bukigi-random',
    description: '君のブキ擬からランダムに一人紹介するよ',
};