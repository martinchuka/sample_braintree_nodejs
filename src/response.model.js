

export class ResponseModel {
    constructor(ctx) {
        this._status = 404;
        this._data = [];
        this._statusText = '';
        this.ctx = ctx;
    }


    set status(value) {
        this._status = value;
        this.ctx.response.status = value;
    }

    set data(value) {
        this._data = value;
    }

    set statusText(value) {
        this._statusText = value;
    }

    get response(){
        return {
            data: this._data,
            status: this._status,
            statusText: this._statusText
        }
    }

}