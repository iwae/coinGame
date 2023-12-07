import { Camera, Canvas, Node } from "cc";

class Globals {
    canvas:Canvas[] = [];
    cameras:Camera[] = [];
    layer2D:Node[]=[];
    layer3D:Node[]=[];
    player:Node;
    isPause = false;
    isMove = false;
}

const GLOBALS = new Globals;

export default GLOBALS;