export class Bukigi {
    guild_id: number;
    user_id: number;
    name: string;
    url: string;

    constructor(guild_id: number, user_id: number, name: string, url: string) {
        this.guild_id = guild_id;
        this.user_id = user_id;
        this.name = name;
        this.url = url;
    };

    static emptyBukigi() {
        return new Bukigi(0, 0, "", "");
    }
};