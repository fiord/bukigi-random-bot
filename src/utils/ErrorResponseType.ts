export class ErrorWithStatus extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super();

        this.status = status;
        this.message = message;
    }

    getMessage() {
        return `${this.message}（エラーコード: ${this.status}）`;
    }
};