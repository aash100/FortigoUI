type Method = 'count' | 'sum' | 'average' | 'weightedAverage';

export class HeaderCalculationRequest {
    public key: string;
    public method: Method;
    public uiKey?: string;

    constructor(key: string, method: Method, uiKey?: string) {
        this.key = key;
        this.method = method;
        if (uiKey) {
            this.uiKey = uiKey;
        } else {
            this.uiKey = this.convertSnakeToCamelCase(key);
        }
    }

    private convertSnakeToCamelCase(snakeCase: string): string {
        return snakeCase.replace(new RegExp('_', 'g'), ' ').toLowerCase().split(' ').map((word) => {
            return word.replace(word[0], word[0].toUpperCase());
        }).join(' ').replace(new RegExp(' ', 'g'), '').replace(snakeCase[0].toUpperCase(), snakeCase[0].toLowerCase());
    }
}

export class HeaderCalculationResponse extends HeaderCalculationRequest {
    public result: string;

    constructor(key: string, method: Method, result: string) {
        super(key, method);
        this.result = result;
    }
}
