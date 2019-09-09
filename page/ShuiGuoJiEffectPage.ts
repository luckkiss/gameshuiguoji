/**
* 水果机
*/
module gameshuiguoji.page {
    const PRIZE_TYPE_NUM: number = 5;              //几种奖励类型
    const LUCKEY_INDEXS: number[] = [6, 18];
    export class ShuiGuoJiEffectPage {
        static readonly PRIZE_TYPE_PULL_SCREEN: number = 1;      //全屏奖
        static readonly PRIZE_TYPE_DA_SAN_YUAN: number = 2;      //大三元
        static readonly PRIZE_TYPE_DA_SI_XI: number = 3;         //大四喜
        static readonly PRIZE_TYPE_LUCKEY: number = 4;           //luckey

        private _box: Box;
        private _grids: Box[];
        private _game: Game;
        private _imgs: LImage[] = [];
        private _effContainer: Laya.Sprite;
        private _totalNum: number = 0;
        constructor(game: Game, box: Box, view: ui.nqp.game_ui.shuiguoji.ShuiGuoJiUI) {
            this._game = game;
            this._box = box;
            this._grids = [];
            for (let i: number = 0; i < 100; i++) {
                let grid: Box = view["box_friut_" + (i + 1)];
                if (!grid) {
                    break;
                }
                this._grids[i] = grid;
            }
            this._totalNum = this._grids.length;
            this._effContainer = new Laya.Sprite();
            this._box.addChild(this._effContainer);
        }

        public Update(diff: number): void {
            let nowTime: number = Laya.timer.currTimer;
            this.updateEff(diff, nowTime);
            this.updateGrid(diff, nowTime);
        }

        //更新特效
        private updateEff(diff: number, nowTime: number): void {
            if (this._allEff.length > 0) {
                for (let i: number = this._allEff.length - 1; i >= 0; i--) {
                    let eff: ShuiGuoJiGridEff = this._allEff[i];
                    if (eff && eff.isPlaying) {
                        eff.Update(diff, nowTime);
                    } else {
                        ShuiGuoJiGridEff.ToPool(eff);
                        this._allEff.splice(i, 1);
                    }
                }
            }
        }

        private _allEff: ShuiGuoJiGridEff[] = [];
        private addEff(type: number, index: number, gridTime: number, completeFun: Laya.Handler = null, param1: number = 0, isNew: boolean = true): void {
            let idx: number = index % this._totalNum;
            let eff: ShuiGuoJiGridEff = ShuiGuoJiGridEff.GetPool();
            eff.play(type, index, gridTime, completeFun, param1);
            eff.x = this._grids[idx].x;
            eff.y = this._grids[idx].y;
            this._effContainer.addChild(eff);
            this._allEff.push(eff);
        }

        private clearEffByIndex(index: number): boolean {
            for (let i: number = 0; i < this._allEff.length; i++) {
                let eff: ShuiGuoJiGridEff = this._allEff[i];
                if (eff && eff.index == index) {
                    ShuiGuoJiGridEff.ToPool(eff);
                    this._allEff.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

        private clearEff(): void {
            for (let i: number = 0; i < this._allEff.length; i++) {
                let eff: ShuiGuoJiGridEff = this._allEff[i];
                ShuiGuoJiGridEff.ToPool(eff);
            }
            this._allEff = [];
        }



        private _lottery: gamecomponent.object.BattleInfoSGJ = null;
        private _prizeType: number = 0;
        private _prizes: any[] = []
        private _completeFun: Laya.Handler = null;

        private _isEnd: boolean = true;
        private _isPlaying: boolean = false;
        private _endRewardIdx: number[] = [];
        private _startIdx: number = 0;
        private _endIdx: number = 0;
        private _curIdx: number = 0;
        private _curTime: number = 0;
        private _updateTime: number = 0;

        private _fsRewardNum = 0;

        //是否播放特效哦
        public get isPlaying(): boolean {
            return this._isPlaying;
        }

        //更新格子
        private updateGrid(diff: number, nowTime: number): void {
            if (!this._isEnd && nowTime >= this._updateTime) {
                let tt: number = nowTime - this._curTime;
                for (let i: number = this._curIdx; i <= this._endIdx; i++) {
                    let updateInfo: any = this.calIdxUpdateInfo(this._prizeType, i);
                    if (!updateInfo) continue;
                    tt -= updateInfo.time;
                    let isNew: boolean = tt < 0;
                    if (i == this._endIdx) {
                        //结束了
                        this._curIdx = i;
                        this._startIdx = this._endIdx % this._totalNum;

                        if (updateInfo.efftype == ShuiGuoJiGridEff.TYPE_FULL_SCREEN) this._fsRewardNum++;
                        if (updateInfo.efftype != -1) {
                            this.addEff(updateInfo.efftype, i, updateInfo.time, null, this._fsRewardNum, isNew);

                            if (this._endRewardIdx.indexOf(i) != -1 || updateInfo.efftype == ShuiGuoJiGridEff.TYPE_FULL_SCREEN) {
                                this.onRewardComplete(i, updateInfo.start, updateInfo.end);
                            }
                        }
                        this.onComplete();
                    } else {
                        if (i > this._curIdx) {
                            if (updateInfo.efftype == ShuiGuoJiGridEff.TYPE_FULL_SCREEN) this._fsRewardNum++;
                            if (updateInfo.efftype != -1) {
                                this.addEff(updateInfo.efftype, i, updateInfo.time, null, this._fsRewardNum, isNew);

                                if (this._endRewardIdx.indexOf(i) != -1 || updateInfo.efftype == ShuiGuoJiGridEff.TYPE_FULL_SCREEN) {
                                    this.onRewardComplete(i, updateInfo.start, updateInfo.end);
                                } else {
                                    this.onGridComplete(i, updateInfo.start, updateInfo.end);
                                }
                            }
                        }
                        if (tt < 0) {
                            this._curIdx = i;
                            this._curTime = nowTime - tt - updateInfo.time;
                            this._updateTime = this._curTime + updateInfo.time;
                            break;
                        }

                    }


                }


            }

        }

        private onGridComplete(index: number, start: number, end: number): void {
            if (this._completeFun) {
                this._completeFun.runWith([2, this._prizeType, index % this._totalNum, false, index, start, end]);
            }
        }

        private onRewardComplete(index: number, start: number, end: number): void {
            if (this._completeFun) {
                let idx: number = index % this._totalNum;
                let isFirst: boolean = this._prizes[0].index == idx;
                if (this._prizeType == ShuiGuoJiEffectPage.PRIZE_TYPE_PULL_SCREEN) {
                    isFirst = this._fsRewardNum == 1;
                }
                this._completeFun.runWith([1, this._prizeType, idx, isFirst, index, start, end]);
            }
        }

        private onComplete(): void {
            this._isEnd = true;

            Laya.timer.once(1500, this, () => {
                this._isPlaying = false;
                if (this._completeFun) {
                    this._completeFun.runWith([0, this._prizeType, 0, false]);
                }
                this.clearEff();
                if (this._prizeType == ShuiGuoJiEffectPage.PRIZE_TYPE_PULL_SCREEN) {
                    for (let i: number = 0; i < this._totalNum; i++) {
                        this.addEff(ShuiGuoJiGridEff.TYPE_TWINKLE, i, 0);
                    }
                } else {
                    for (let i: number = 0; i < this._prizes.length; i++) {
                        this.addEff(ShuiGuoJiGridEff.TYPE_TWINKLE, this._prizes[i].index, 0);
                    }
                }
            });
        }


        private checkLotteryInfo(info: gamecomponent.object.BattleInfoSGJ, ): boolean {
            if (!info || !info.prizeContent || !info.prizeType) return false;
            if (info.prizeType < 1 || info.prizeType > PRIZE_TYPE_NUM) return false;
            return info.prizeContent.length > 0;
        }

        public playEff(info: gamecomponent.object.BattleInfoSGJ, completeFun: Laya.Handler = null): void {
            if (this._isPlaying || !this.checkLotteryInfo(info)) {
                if (!this._isPlaying) {
                    logd("ShuiGuoJiEffectPage.playEff() info is error" + info);
                }
                return;
            }
            this.clear();
            this._lottery = info;
            this._prizeType = info.prizeType;
            this._prizes = info.prizeContent;
            this._completeFun = completeFun;

            this._isEnd = false;
            this._isPlaying = true;
            this._endRewardIdx = [];
            this._curIdx = this._startIdx;
            this._curTime = Laya.timer.currTimer;
            this._endIdx = this.calEndIndex(this._prizeType, this._prizes, this._curIdx, this._endRewardIdx);
            let updateInfo: any = this.calIdxUpdateInfo(this._prizeType, this._curIdx);
            this._updateTime = updateInfo.time;
            this.addEff(updateInfo.efftype, this._curIdx, updateInfo.time);
        }

        //计算结束为止
        private calEndIndex(type: number, prizes: any[], startIndex: number, endIndexs: number[]): number {
            if (!prizes || prizes.length == 0) {
                return startIndex;
            }
            if (!endIndexs) endIndexs = [];

            let endIndex: number = startIndex;
            switch (type) {
                case ShuiGuoJiEffectPage.PRIZE_TYPE_PULL_SCREEN:
                    //全屏奖
                    endIndex += this._totalNum * 4 + this.randomPSRewardIdx();
                    endIndexs[0] = endIndex;
                    break;
                default:
                    for (let i: number = 0; i < prizes.length; i++) {
                        //先转两圈
                        endIndex += this._totalNum * 1;
                        let yEndIndex: number = endIndex % this._totalNum;
                        endIndex += prizes[i].index - yEndIndex;
                        if (prizes[i].index <= yEndIndex) {
                            endIndex += this._totalNum;
                        }
                        if (i == 0) {
                            //第一个奖励多转一圈
                            endIndex += this._totalNum * 3;
                        }
                        endIndexs[i] = endIndex;
                    }
                    break;
            }

            return endIndex;
        }

        //随机一个全屏开始中奖项
        private randomPSRewardIdx(): number {
            let ranArr: number[] = [];
            for (let i: number = 0; i < this._totalNum; i++) {
                if (!this.isLuckeyIndex(i)) {
                    ranArr.push(i);
                }
            }

            let ran: number = Math.floor(Math.random() * ranArr.length);
            return ranArr[ran];
        }

        //lucky索引
        private isLuckeyIndex(index: number): boolean {
            index %= this._totalNum;
            return LUCKEY_INDEXS.indexOf(index) != -1;
        }

        //计算每个位置刷新信息
        private calIdxUpdateInfo(type: number, index: number): any {
            if (index < this._startIdx || index > this._endIdx) return null;

            let info: any = {
                time: 0,
                efftype: ShuiGuoJiGridEff.TYPE_TRAIL,
                start: this._startIdx,
                end: this._endIdx
            }
            if (index == this._endIdx) {
                //最后一个
                if (type == ShuiGuoJiEffectPage.PRIZE_TYPE_PULL_SCREEN) {
                    info.efftype = ShuiGuoJiGridEff.TYPE_FULL_SCREEN;
                } else {
                    info.efftype = ShuiGuoJiGridEff.TYPE_TWINKLE;
                }
                return info;
            }

            let startRewardIdx: number = this._startIdx;
            let endRewardIdx: number = -1;
            let curCircle: number = 0;
            for (let i: number = 0; i < this._endRewardIdx.length; i++) {
                if (index < this._endRewardIdx[i]) {
                    curCircle = i;
                    endRewardIdx = this._endRewardIdx[i];
                    if (i > 0) startRewardIdx = this._endRewardIdx[i - 1];
                    break;
                }
            }
            if (endRewardIdx == -1 || endRewardIdx <= startRewardIdx) {
                return null;
            }

            info.start = startRewardIdx;
            info.end = endRewardIdx;

            //第一圈
            let chaIdx: number = 0;
            let beishu: number = 1;
            if (curCircle == 0) {
                //头
                chaIdx = index - startRewardIdx;
                if (chaIdx < 3) {
                    beishu += (3 - chaIdx);
                } else {
                    //尾
                    chaIdx = endRewardIdx - index;
                    if (type == ShuiGuoJiEffectPage.PRIZE_TYPE_PULL_SCREEN) {
                        //全屏奖
                        if (chaIdx == this._totalNum - 1) {
                            //弹满堂红特效，时间长点
                            beishu = 3500 / ShuiGuoJiGridEff.UPDATE_TIME + 5;
                        } else if (chaIdx < this._totalNum - 1) {
                            beishu = 1.5;
                        } else if (chaIdx < this._totalNum + 5) {
                            beishu += (this._totalNum + 5 - chaIdx) * 3;
                        }
                        if (chaIdx < this._totalNum) {
                            info.efftype = ShuiGuoJiGridEff.TYPE_FULL_SCREEN;
                        }
                        //特殊处理luckey
                        // if (this.isLuckeyIndex(index)){
                        //     info.time = 0;
                        //     info.efftype = -1;
                        // }
                    } else {
                        if (chaIdx < 6) {
                            beishu += (6 - chaIdx) * 3;
                        }
                    }
                }

            } else if (curCircle == 1) {
                //头
                beishu = 0.4;
                info.efftype = ShuiGuoJiGridEff.TYPE_GRID_TIME_SHOW;
                chaIdx = index - startRewardIdx;
                if (chaIdx < 3) {
                    beishu += (3 - chaIdx) * 0.4;
                    if (chaIdx == 0) {
                        info.efftype = ShuiGuoJiGridEff.TYPE_TWINKLE;
                        switch (type) {
                            case ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SAN_YUAN:
                            case ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SI_XI:
                                //弹大三元和大四喜特效时间长点
                                beishu = 3500 / ShuiGuoJiGridEff.UPDATE_TIME + 5;
                                break;
                            default:
                                beishu = 50;
                                break;
                        }
                    }
                } else {
                    //尾
                    chaIdx = endRewardIdx - index;
                    if (chaIdx < 6) {
                        beishu += (6 - chaIdx) * 1.2;
                    }
                    if (chaIdx == 1) {

                    }
                }
            } else {
                //头
                beishu = 0.4;
                info.efftype = ShuiGuoJiGridEff.TYPE_GRID_TIME_SHOW;
                chaIdx = index - startRewardIdx;
                if (chaIdx < 3) {
                    beishu += (3 - chaIdx) * 0.4;
                    if (chaIdx == 0) {
                        beishu = 50;
                        info.efftype = ShuiGuoJiGridEff.TYPE_TWINKLE;
                    }
                } else {
                    //尾
                    chaIdx = endRewardIdx - index;
                    if (chaIdx < 6) {
                        beishu += (6 - chaIdx) * 1.2;
                    }
                }
            }
            info.time = beishu * ShuiGuoJiGridEff.UPDATE_TIME;
            return info;


        }

        //清除
        public clear(): void {
            this._lottery = null;
            this._prizeType = 0;
            this._prizes = [];
            if (this._completeFun) {
                this._completeFun.recover();
                this._completeFun = null;
            }
            this._fsRewardNum = 0;

            this._isEnd = true;
            this._isPlaying = false;
            this._endRewardIdx = [];
            Laya.timer.clearAll(this);
            if (this._allEff) {
                for (let i: number = 0; i < this._allEff.length; i++) {
                    ShuiGuoJiGridEff.ToPool(this._allEff[i]);
                    this._allEff[i] = null;
                }
                this._allEff.length = 0;
            }

            this.clearEff();
        }

        // 释放函数
        destroy(destroyChild?: boolean): void {
            this.clear();

            this._box = null;
            this._grids.length = 0;
            this._grids = null;
            this._game = null;
            this._imgs = null;
            if (this._effContainer) {
                this._effContainer.removeSelf();
                this._effContainer.destroy();
                this._effContainer = null;
            }
        }














    }
}