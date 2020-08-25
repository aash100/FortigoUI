import { Style } from './style.model';

type IconAlign = 'left' | 'right';

export class SnackbarModel {
    message: string;
    icon?: Icon;
    action?: Action;

    constructor(message: string, icon?: Icon, action?: Action) {
        this.message = message;
        if (icon) {
            this.icon = icon;
        } else {
            this.icon = new Icon();
        }
        if (action) {
            this.action = action;
        } else {
            this.action = new Action();
        }
    }
}

export class Icon {
    name: string;
    alignment?: IconAlign;
    style?: Style;
    constructor() {
        this.alignment = 'left';
        this.style = new Style();
        this.style['font-size'] = 'inherit';
        this.style.color = '#E66006';
    }
}

export class Action {
    label?: string;
    icon?: Icon;
    button: Style;

    constructor() {
        this.icon = new Icon();
        this.icon.alignment = 'right';
        this.icon.style = new Style();
        this.icon.style['font-size'] = 'inherit';
        this.icon.style.color = '#E66006';
        this.button = new Style();
        this.button.float = 'right';
        this.button['align-self'] = 'flex-end';
    }
}
