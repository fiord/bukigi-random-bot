const urlRegex = /^https:\/\/(discordapp\.com|discord\.com)\/channels\/(\d+)\/(\d+)\/(\d+)/;

export const urlValidator: (url: string) => boolean = (url) => {
    return urlRegex.test(url);
};

export class Embed {
    title: string;
    url: string;
    type: string;
    description: string;
    color: number;
    image?: {
        url: string;
    };

    constructor(title: string, url: string, description: string, color: number, imageUrl?: string) {
        this.title = title;
        this.url = url;
        this.type = "rich";
        this.description = description;
        this.color = color;
        if (imageUrl != null) {
            this.image = {
                url: imageUrl,
            };
        }
    }
};

export const getUrlContent: (url: string, token: string, title: string) => Promise<Embed[]> = async (url, token, title) => {
    const matches = url.match(urlRegex);
    if (!matches) {
        return [];
    }

    const [, , , channel_id, message_id] = matches;
    const response = await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages/${message_id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${token}`,
        }
    });
    const json = await response.json();
    console.log(json);

    const embeds = [
        new Embed(
            title,
            url,
            json.content,
            0x0099ff,
            json.attachments[0]?.url ?? "",
        ),
    ];

    return embeds;
};