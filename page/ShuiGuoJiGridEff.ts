/**
* 水果机
*/
module gameshuiguoji.page {
    import Path_game_shuiguoji = gameshuiguoji.data.Path;
    const SKIN_COLOR = {
        SKIN_YELLOW: Path_game_shuiguoji.ui_shuiguoji + "tu_xz.png",//金色
        SKIN_PURPLE: Path_game_shuiguoji.ui_shuiguoji + "tu_xz1.png",//紫色
    }
    const IMG_WIDTH: number = 90;
    const IMG_HEIGHT: number = 90;

    export class ShuiGuoJiGridEff extends Laya.Sprite {
        static readonly UPDATE_TIME: number = 30;//刷新时间单位（毫秒) 
        static readonly TRAIL_TIME: number = ShuiGuoJiGridEff.UPDATE_TIME * 6;//拖尾持续时间
        static readonly TRAIL_TIME_LIMIT: number = ShuiGuoJiGridEff.UPDATE_TIME * 2;//低于这个时间就产生拖尾效果
        static readonly TYPE_NORMAL: number = 0;             //正常显示
        static readonly TYPE_GRID_TIME_SHOW: number = 1;     //格子时间内显示
        static readonly TYPE_TRAIL: number = 2;              //拖尾
        static readonly TYPE_TWINKLE: number = 3;            //闪烁
        static readonly TYPE_FULL_SCREEN: number = 4;        //全屏奖效果
        static readonly TYPE_SHORT_SHOW: number = 5;        //短显

        private _img: Laya.Image;
        private _type: number = 0;
        private _index: number = -1;
        private _isPlaying: boolean = false;
        private _startTime: number = 0;
        private _gridTime: number = 0;
        private _completeFun: Laya.Handler = null;
        private _param1: number = 0;

        private _gridEndTime: number = 0;
        private _trailEndTime: number = 0;
        private _psTwinkleTime: number = 0;
        constructor() {
            super();
            this.width = IMG_WIDTH;
            this.height = IMG_HEIGHT;

            this._img = new Laya.Image(SKIN_COLOR.SKIN_YELLOW);
            this._img.anchorX = 0.5;
            this._img.anchorY = 0.5;
            this._img.centerX = 0;
            this._img.centerY = 0;
            this._img.blendMode = Laya.BlendMode.LIGHT;
            this._img.visible = false;
            this.addChild(this._img);

        }

        public get type(): number {
            return this._type;
        }

        public get index(): number {
            return this._index;
        }

        public get isPlaying(): boolean {
            return this._isPlaying;
        }

        public Update(diff: number, nowTime: number): void {
            if (this._isPlaying) {
                switch (this._type) {
                    case ShuiGuoJiGridEff.TYPE_GRID_TIME_SHOW:
                        if (nowTime > this._gridEndTime) {
                            this.onComplete();
                        }
                        break;
                    case ShuiGuoJiGridEff.TYPE_TRAIL:
                        if (nowTime > this._gridEndTime) {
                            if (this._gridTime < ShuiGuoJiGridEff.TRAIL_TIME_LIMIT) {
                                //产生拖尾
                                if (nowTime > this._trailEndTime) {
                                    this.onComplete();
                                } else {
                                    let tt: number = this._trailEndTime - nowTime;
                                    let per: number = tt / ShuiGuoJiGridEff.TRAIL_TIME;
                                    this._img.alpha = per;
                                }
                            } else {
                                this.onComplete();
                            }
                        }
                        break;
                    case ShuiGuoJiGridEff.TYPE_TWINKLE:
                        this.updateTwinkle();
                        break;
                    case ShuiGuoJiGridEff.TYPE_FULL_SCREEN:
                        if (nowTime > this._psTwinkleTime) {
                            //开始闪烁
                            let tt: number = nowTime % (ShuiGuoJiGridEff.UPDATE_TIME * 6);
                            if (tt < ShuiGuoJiGridEff.UPDATE_TIME * 3) {
                                this._img.skin = this._index % 2 == 0 ? SKIN_COLOR.SKIN_YELLOW : SKIN_COLOR.SKIN_PURPLE;
                            } else {
                                this._img.skin = this._index % 2 != 0 ? SKIN_COLOR.SKIN_YELLOW : SKIN_COLOR.SKIN_PURPLE;
                            }
                        }
                        break;
                    case ShuiGuoJiGridEff.TYPE_SHORT_SHOW:
                        if (nowTime > this._gridEndTime) {
                            this.onComplete();
                        }
                        break;
                }
            }
        }
        /*
        ** 播放接口play
        ** type--特效类型
        ** gridTime--格子存在时间（毫秒）
        ** completeFun--回调函数
        */
        public play(type: number, index: number, gridTime: number, completeFun: Laya.Handler = null, param1: number = 0): ShuiGuoJiGridEff {
            if (this._isPlaying) return;
            this.clear();

            this._type = type;
            this._index = index;
            this._isPlaying = true;
            this._img.visible = true;
            this._gridTime = gridTime;
            this._completeFun = completeFun;
            this._startTime = Laya.timer.currTimer;
            this._param1 = param1;

            switch (type) {
                case ShuiGuoJiGridEff.TYPE_GRID_TIME_SHOW:
                    this.gridTimeShowEff();
                    break;
                case ShuiGuoJiGridEff.TYPE_TRAIL:
                    this.trailEff();
                    break;
                case ShuiGuoJiGridEff.TYPE_TWINKLE:
                    this.twinkleEff();
                    break;
                case ShuiGuoJiGridEff.TYPE_FULL_SCREEN:
                    this.pullScreenEff();
                    break;
                case ShuiGuoJiGridEff.TYPE_SHORT_SHOW:
                    this.gridShortShowEff();
                    break;
                default:
                    this._type = ShuiGuoJiGridEff.TYPE_NORMAL;
                    this.normalEff();
                    break;
            }
            return this;
        }

        private normalEff(): void {
            this._img.skin = SKIN_COLOR.SKIN_YELLOW;
        }

        private gridTimeShowEff(): void {
            this._img.skin = SKIN_COLOR.SKIN_YELLOW;
            this._gridEndTime = this._startTime + this._gridTime;
        }

        private trailEff(): void {
            this._img.skin = SKIN_COLOR.SKIN_YELLOW;
            this._gridEndTime = this._startTime + this._gridTime;
            this._trailEndTime = this._gridEndTime + ShuiGuoJiGridEff.TRAIL_TIME;
        }

        private twinkleEff(): void {
            this.updateTwinkle();
        }

        private updateTwinkle(): void {
            let time: number = Laya.timer.currTimer % 1000;
            let idx: number = Math.floor(time / 100);
            this._img.skin = Path_game_shuiguoji.ui_shuiguoji_effect_zhongjiang + (10000 + idx) + ".png";

        }

        private pullScreenEff(): void {
            this._img.skin = SKIN_COLOR.SKIN_YELLOW;
            if (this._param1 < 1) this._param1 = 1
            this._psTwinkleTime = this._startTime + ShuiGuoJiGridEff.UPDATE_TIME * (3 + 2 / this._param1);
        }

        private gridShortShowEff(): void {
            this._img.skin = SKIN_COLOR.SKIN_YELLOW;
            this._gridEndTime = this._startTime + 6;
        }

        private onComplete(): void {
            if (this._completeFun) {
                this._completeFun.runWith([this, this._index, this._type]);
            }
            this.clear();
        }

        //闪烁系数函数
        private twinkleRatio(tt: number, cycleTime: number): number {
            if (cycleTime <= 0) return 0;
            tt %= cycleTime;
            let halfCycleTime: number = cycleTime / 2;
            if (tt < halfCycleTime) {
                let per: number = tt / halfCycleTime;
                return 1 - per;
            } else {
                tt -= halfCycleTime;
                let per: number = tt / halfCycleTime;
                return per;
            }
        }

        public clear(): void {
            this._img.visible = false;
            this._img.alpha = 1;
            this._img.scale(1, 1);
            this._img.skin = "";
            this._type = ShuiGuoJiGridEff.TYPE_NORMAL;
            this._index = -1;
            this._isPlaying = false;
            this._completeFun = null;
        }



        private static _pool: ShuiGuoJiGridEff[] = [];
        public static GetPool(): ShuiGuoJiGridEff {
            let eff: ShuiGuoJiGridEff;
            if (ShuiGuoJiGridEff._pool.length > 0) {
                eff = ShuiGuoJiGridEff._pool.shift();
            } else {
                eff = new ShuiGuoJiGridEff();
            }
            return eff;
        }

        public static ToPool(eff: ShuiGuoJiGridEff): void {
            if (!eff) return;

            eff.clear();
            eff.removeSelf();
            if (ShuiGuoJiGridEff._pool.length > 8) {
                eff.destroy(true);
            } else {
                ShuiGuoJiGridEff._pool.push(eff);
            }

        }

    }
}