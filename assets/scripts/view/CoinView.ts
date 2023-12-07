import { _decorator, Component, Label, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CoinView')
export class CoinView extends Component {
    @property(Label)
    coinLabel: Label = null;

    get coin() {
        return this._coin;
    }
    set coin(value) {
        this._coin = Math.floor(value);
        this.coinLabel.string = "" + this._coin;
    }


    private _coin = 0;
    private _currentCoin = 0;


    addCoin(value) {
        this._currentCoin += value;
        const self = this.getComponent(CoinView);
        const t = value * 0.03 + 0.3;
        tween(self).to(t, { coin: this._currentCoin }).start();
    }
}

