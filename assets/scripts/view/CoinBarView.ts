import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CoinBarView')
export class CoinBarView extends Component {
    @property(Label)
    coinBarLabel: Label = null;
   

    set coin(v){
        this.coinBarLabel.string = v;
    }
    get coin(){
        return this.coinBarLabel.string;
    }
 
}

