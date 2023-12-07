import { _decorator, Component, easing, Layers, Node, tween, UI, Vec3 } from 'cc';
import { aa } from '../frame/FrameCore';
import { ui } from '../frame/Enums';
import { CoinBarView } from '../view/CoinBarView';
import { PlayerCtrl } from '../combat/ctrl/PlayerCtrl';
import { CoinView } from '../view/CoinView';
const { ccclass, property } = _decorator;
const temp_V3_1 = new Vec3();
const temp_V3_2 = new Vec3();
const temp_V3_3 = new Vec3();
const coinScaled = new Vec3(4.8, 4.8, 4.8);

@ccclass('CoinMgr')
export class CoinMgr extends Component {

    _time = 0;
    _interval = 3;
    /* start coins */
    _coins = 50;
    _coinView: Node;
    _coinViewComp: CoinView;
    _coinBarView: Node;
    _coinBarViewComp: CoinBarView;
    _currentCoins = 0;
    _playerPos =new Vec3();

    async start() {
        this._coinView = await aa.res.getUI(ui.CoinView);
        this._coinViewComp = this._coinView.getComponent(CoinView);
        this._coinBarView = await aa.res.getUI(ui.CoinBarView);
        this._coinBarViewComp = this._coinBarView.getComponent(CoinBarView);

    }
    spawnCoins(dt) {
        if (this._coins > 0) {
            this._coins--;
            this.createCoin();
        }
        this._time += dt;
        if (this._time > this._interval) {
            this._time = 0;
            /* random coins */
            this._interval = 3 + 2 * Math.random();
            if (aa.layer3D[2].children.length < 75) {
                this._coins += Math.floor(6 + 6 * Math.random());
            }
        }
    }
    

    createCoin() {
        const x = -20 + Math.random() * 40;
        const z = -20 + Math.random() * 40;
        const coin = aa.res.getNode("Coin", aa.layer3D[2], Vec3.set(temp_V3_2, x, 0.5, z));
        coin.setScale(0.5, 0.5, 0.5);
        coin.setRotationFromEuler(90, 0, 0);
        coin.layer = Layers.Enum.DEFAULT;
    }
    collectCoins(dt, backCoins: Node[]) {
        const bl = backCoins.length;
        const t = Math.min(1,0.2+bl*0.02);
        aa.global.player.getComponent(PlayerCtrl).wave(t);
        /* 2D UI Node's wordposition to screen space pos*/
        aa.cameras[1].worldToScreen(this._coinView.worldPosition, temp_V3_3);
        const flyingPos = new Vec3();
        /* screen space pos to  3d world position under this camera*/
        aa.cameras[0].screenToWorld(temp_V3_3, flyingPos);
        this._coinViewComp.addCoin(bl);
        for (var i = bl - 1; i >= 0; i--) {
            const coin = backCoins[i];
            /* change layer */
            coin.parent = aa.layer3D[4];
            coin.layer = Layers.Enum.UI_3D;
            coin.setRotationFromEuler(90, 0, 0)
            const delay = i * dt;
            /* move and scale the coin */
            tween(coin).delay(delay).to(0.5 + delay, { position: flyingPos, scale: coinScaled }, { easing: 'fade' }).call(() => {
                aa.res.putNode(coin);
            }).start();
        }
    }
    updateCoinBar(backCoins: Node[]) {
        if (this._coinBarViewComp) {
            /* backcoins length */
            const bl = backCoins.length;
            Vec3.copy(temp_V3_1, this._playerPos);
            temp_V3_1.y += 1.5 + (bl + 1) * 0.075;
            aa.cameras[0].convertToUINode(temp_V3_1, aa.layer2D[4], temp_V3_1);
            this._coinBarView.position = temp_V3_1;
            if (this._currentCoins != bl) {
                this._currentCoins = bl;
                this._coinBarViewComp.coin = "Coins " + bl;
            }
        }
    }
    checkCoins() {
        const coins = aa.layer3D[2].children;
        const parent = aa.layer3D[3];
        const length = coins.length;
        for (var i = length - 1; i >= 0; i--) {
            const coin = coins[i];
            /* we use manhattanDis for better perf */
            const dis = aa.utils.getMdisXZ(coin.position, this._playerPos)
            if (dis < 0.5) {
                coin.parent = parent;
                coin.setRotationFromEuler(0, 0, 0)
            }
        }
    }
    moveCoins(dt, backCoins: Node[]){
        let bl = backCoins.length;
        /* coin move logic */
        if (!aa.global.isMove && bl > 0) {
            this.collectCoins(dt, backCoins);
        } else {
            if (bl >= 50) {
                this.collectCoins(dt, backCoins);
            } else {
                for (var i = bl - 1; i >= 0; i--) {
                    const coin = backCoins[i];
                    Vec3.copy(temp_V3_1, this._playerPos);
                    temp_V3_1.y += 1.4 + (bl - i) * 0.075;
                    const t = dt * (Math.max(1, (19 - (bl - i) * 0.35)));
                    coin.position = Vec3.lerp(temp_V3_2, coin.position, temp_V3_1, t);
                }
            }
        }
    }


    update(dt: number) {
        /* store player's pos */
        Vec3.copy(this._playerPos, aa.global.player.position);

        /* coin spawn logic */
        this.spawnCoins(dt);

        const backCoins =  aa.layer3D[3].children;
        this.moveCoins(dt, backCoins);
   
        /* coins check logic */
        this.checkCoins();
        /* coin bar logic */
        this.updateCoinBar(backCoins);
   
    }
}

