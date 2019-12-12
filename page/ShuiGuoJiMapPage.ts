/**
* 水果机
*/
module gameshuiguoji.page {
    import TextFieldU = utils.TextFieldU;
    const enum FRUIT_TYPE {
        TYPE_PINGGUO = 1,
        TYPE_CHENGZI = 2,
        TYPE_MANGGUO = 3,
        TYPE_LINGDANG = 4,
        TYPE_XIGUA = 5,
        TYPE_XINGXING = 6,
        TYPE_QIQI = 7,
        TYPE_BAR = 8,
        TYPE_LUCKEY = 9,
    }
    const ALL_FIRUT: number[] = [
        FRUIT_TYPE.TYPE_BAR, FRUIT_TYPE.TYPE_PINGGUO, FRUIT_TYPE.TYPE_PINGGUO, FRUIT_TYPE.TYPE_MANGGUO, FRUIT_TYPE.TYPE_XIGUA,
        FRUIT_TYPE.TYPE_XIGUA, FRUIT_TYPE.TYPE_LUCKEY, FRUIT_TYPE.TYPE_PINGGUO, FRUIT_TYPE.TYPE_CHENGZI, FRUIT_TYPE.TYPE_CHENGZI,
        FRUIT_TYPE.TYPE_LINGDANG, FRUIT_TYPE.TYPE_QIQI, FRUIT_TYPE.TYPE_QIQI, FRUIT_TYPE.TYPE_PINGGUO, FRUIT_TYPE.TYPE_MANGGUO,
        FRUIT_TYPE.TYPE_MANGGUO, FRUIT_TYPE.TYPE_XINGXING, FRUIT_TYPE.TYPE_XINGXING, FRUIT_TYPE.TYPE_LUCKEY, FRUIT_TYPE.TYPE_PINGGUO,
        FRUIT_TYPE.TYPE_LINGDANG, FRUIT_TYPE.TYPE_CHENGZI, FRUIT_TYPE.TYPE_LINGDANG, FRUIT_TYPE.TYPE_BAR
    ];
    const FIRUT_MUSIC: string[] = [
        "slot_z_apple.mp3", "slot_z_orange.mp3", "slot_z_mango.mp3", "slot_z_bell.mp3", "slot_z_water.mp3",
        "slot_z_star.mp3", "slot_z_77.mp3", "slot_z_bar.mp3"
    ];
    const ROOM_CHIP_CONFIG = [1, 5, 10, 20, 50, 100];
    const FRIUT_ALL_NUM = 8;

    export class ShuiGuoJiMapPage extends game.gui.base.Page {
        static readonly ALL_FIRUT_BS: number[] = [
            100, 5, 3, 15, 20,
            3, 0, 5, 3, 10,
            20, 3, 40, 5, 3,
            15, 30, 3, 0, 5,
            3, 10, 20, 50
        ];

        private _viewUI: ui.ajqp.game_ui.shuiguoji.ShuiGuoJiUI;
        private _sgjStory: ShuiguojiStory;
        private _sgjMapInfo: ShuiguojiMapInfo;

        private _curChip: number;//当前选择筹码
        private _curChipY: number;//当前选择筹码y轴位置
        private _chipUIList: Array<ui.ajqp.game_ui.tongyong.effect.Effect_cmUI> = [];//筹码UI集合

        private _playerGold: number = 0;
        private _playerGoldClip: ShuiguojiClip;//玩家金币

        private _allBetNum: number[];
        private _allBetClip: ShuiguojiClip[];//所有水果的下注
        private _allBetClipBg: ShuiguojiClip[];//所有水果的下注
        private _allBetBtn: Button[];//下注按钮
        private _allBetAni: Laya.FrameAnimation[];

        private _caiBet: number = 0;
        private _caiBetClip: ShuiguojiClip;//猜大小下注
        private _caiBetClipBg: ShuiguojiClip;
        private _caiNumber: number = 0;
        private _caiNumberClip: ShuiguojiClip;//猜大小数字
        private _caiNumberClipBg: ShuiguojiClip;//猜大小数字

        private _effPage: ShuiGuoJiEffectPage;

        private _isRequest: boolean = false;//是否请求协议中
        private _isPlayGame: boolean = false;//是否游戏中
        private _canCaiMoney: number = 0;//可以猜大小的中奖金额
        private _isAutoStart: boolean = false;//是否自动开始
        private _prizeMoneyCache: number = 0;
        private _isPlayDXEff: boolean = false;//播放比大小动画
        private _isOpenRewardTips: boolean = false;
        private _isCanResetBet: boolean = false;

        private _testBtn: Button;
        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedDuang = false;
            this._delta = 0;
            this._asset = [
                DatingPath.atlas_dating_ui + "qifu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
                Path_game_shuiguoji.atlas_game_ui + "shuiguoji.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + 'dating.atlas',
                PathGameTongyong.atlas_game_ui_tongyong + "qifu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/bigwin.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general + "anniu.atlas",
                Path_game_shuiguoji.atlas_game_ui + "shuiguoji/effect/jinbi0.atlas",
                Path_game_shuiguoji.atlas_game_ui + "shuiguoji/effect/jinbi1.atlas",
                Path_game_shuiguoji.atlas_game_ui + "shuiguoji/effect/zhongjiang.atlas",
                Path.custom_atlas_scene + 'chip.atlas',
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.shuiguoji.ShuiGuoJiUI', ["game_ui.shuiguoji.JiangCiUI"]);
            this.addChild(this._viewUI);
            this._viewUI.mouseThrough = true;
            this._effPage = new ShuiGuoJiEffectPage(this._game, this._viewUI.box_main, this._viewUI);

            for (let i: number = 0; i < ROOM_CHIP_CONFIG.length; i++) {
                this._chipUIList.push(this._viewUI["btn_chip" + i]);
                this._chipUIList[i].btn_num.label = ROOM_CHIP_CONFIG[i] + "";
                this._chipUIList[i].btn_num.skin = StringU.substitute(PathGameTongyong.ui_tongyong_general + "tu_cm{0}.png", i);
                if (i == 0) {
                    this._curChipY = this._chipUIList[i].y - 10;
                }
            }

            //玩家金币
            this._playerGoldClip = new ShuiguojiClip(ShuiguojiClip.SGJ_GOLD);
            this._viewUI.clip_gold.visible = false;
            this._viewUI.clip_gold.parent.addChild(this._playerGoldClip);
            this._playerGoldClip.scale(0.8, 0.8);
            this._playerGoldClip.x = this._viewUI.clip_gold.x;
            this._playerGoldClip.y = this._viewUI.clip_gold.y + 2;

            this._allBetClip = [];
            this._allBetClipBg = [];
            this._allBetBtn = [];
            this._allBetNum = [];
            this._allBetAni = [];
            for (let i: number = 0; i < FRIUT_ALL_NUM; i++) {
                let uibet: ui.ajqp.game_ui.shuiguoji.component.BeiShuUI = this._viewUI["ui_bet_" + (i + 1)];
                this._allBetClipBg[i] = new ShuiguojiClip(ShuiguojiClip.SGJ_BET_SCORE);
                uibet.clip_bet.parent.addChild(this._allBetClipBg[i]);
                this._allBetClipBg[i].setText("8888", true);
                this._allBetClipBg[i].x = uibet.clip_bet.x;
                this._allBetClipBg[i].y = uibet.clip_bet.y;
                this._allBetClipBg[i].alpha = 0.4;
                this._allBetClipBg[i].gray = true;
                this._allBetClip[i] = new ShuiguojiClip(ShuiguojiClip.SGJ_BET_SCORE);
                uibet.clip_bet.visible = false;
                uibet.clip_bet.parent.addChild(this._allBetClip[i]);
                this._allBetClip[i].setText("0", true);
                this._allBetClip[i].x = uibet.clip_bet.x;
                this._allBetClip[i].y = uibet.clip_bet.y;
                this._allBetClip[i].anchorX = 1;
                this._allBetClip[i].right = 4;
                this._allBetBtn[i] = this._viewUI["btn_bet_" + (i + 1)];
                this._allBetNum[i] = 0;
                this._allBetAni[i] = this._viewUI["ani" + (i + 1)];
                this._allBetAni[i].gotoAndStop(1);
            }

            this._caiBetClipBg = new ShuiguojiClip(ShuiguojiClip.SGJ_BET_SCORE);
            this._viewUI.clip_win.parent.addChild(this._caiBetClipBg);
            this._caiBetClipBg.x = this._viewUI.clip_win.x;
            this._caiBetClipBg.y = this._viewUI.clip_win.y;
            this._caiBetClipBg.anchorX = 1;
            this._caiBetClipBg.right = 4;
            this._caiBetClipBg.setText("888888888", true);
            this._caiBetClipBg.alpha = 0.4;
            this._caiBetClipBg.gray = true;

            this._caiBetClip = new ShuiguojiClip(ShuiguojiClip.SGJ_BET_SCORE);
            this._viewUI.clip_win.visible = false;
            this._viewUI.clip_win.parent.addChild(this._caiBetClip);
            this._caiBetClip.x = this._viewUI.clip_win.x;
            this._caiBetClip.y = this._viewUI.clip_win.y;
            this._caiBetClip.anchorX = 1;
            this._caiBetClip.right = 4;
            this._caiBetClip.setText("0", true);

            this._caiNumberClipBg = new ShuiguojiClip(ShuiguojiClip.SGJ_BET_SCORE);
            this._viewUI.clip_num.parent.addChild(this._caiNumberClipBg);
            this._caiNumberClipBg.x = this._viewUI.clip_num.x;
            this._caiNumberClipBg.y = this._viewUI.clip_num.y;
            this._caiNumberClipBg.anchorX = 1;
            this._caiNumberClipBg.right = 4;
            this._caiNumberClipBg.setText("88", true);
            this._caiNumberClipBg.alpha = 0.4;
            this._caiNumberClipBg.gray = true;

            this._caiNumberClip = new ShuiguojiClip(ShuiguojiClip.SGJ_BET_SCORE);
            this._viewUI.clip_num.visible = false;
            this._viewUI.clip_num.parent.addChild(this._caiNumberClip);
            this._caiNumberClip.x = this._viewUI.clip_num.x;
            this._caiNumberClip.y = this._viewUI.clip_num.y;
            this._caiNumberClip.anchorX = 1;
            this._caiNumberClip.right = 4;
            this._caiNumberClip.setText("0", true);

            this._viewUI.ani9.gotoAndStop(1);

            if (isDebug) {
                this._testBtn = new Button(Path_game_shuiguoji.ui_shuiguoji + "btn_jt1.png", "测试")
                this._testBtn.x = 1160;
                this._testBtn.y = 460;
                this._testBtn.stateNum = 1;
                // this._viewUI.getChildAt(0).addChild(this._testBtn);
            }
            this._viewUI.box_left.left = this._game.isFullScreen ? 35 : 15;
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            //api充值不显示
            this._viewUI.btn_chongzhi.visible = !WebConfig.enterGameLocked;

            this._sgjStory = this._game.sceneObjectMgr.story as ShuiguojiStory;
            if (this._sgjStory) {
                this.onUpdateMapInfo();
            }
            if (this._testBtn) this._testBtn.on(LEvent.CLICK, this, this.onBtnClickWithTween);

            for (let i: number = 0; i < this._chipUIList.length; i++) {
                this._chipUIList[i] && this._chipUIList[i].on(LEvent.CLICK, this, this.onSelectChip, [i]);
            }

            for (let i: number = 0; i < this._allBetBtn.length; i++) {
                this._allBetBtn[i] && this._allBetBtn[i].on(LEvent.CLICK, this, this.onBtnBetClickWithTween);
            }
            for (let i: number = 0; i < this._allBetAni.length; i++) {
                this._allBetAni[i] && this._allBetAni[i].on(LEvent.COMPLETE, this, this.onBetAniComplete, [i]);
            }

            this._viewUI.btn_spread.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_fanhui.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_set.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_rule.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_record.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_cancel_bet.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_bet_all.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_left.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_right.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_big.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_small.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_chongzhi.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_start.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_cancel_auto.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_qifu.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_start.on(LEvent.MOUSE_DOWN, this, this.onStartDown);
            this._viewUI.btn_start.on(LEvent.MOUSE_UP, this, this.onStartUp);

            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAIN_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(ShuiguojiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
            this._game.qifuMgr.on(QiFuMgr.QIFU_FLY, this, this.qifuFly);

            this._viewUI.ui_jc.onOpen(this._game);
            this._viewUI.box_menu.zOrder = 99;
            this._viewUI.box_menu.visible = false;
            this._curChip = 0;
            this.onSelectChip(0);
            this.ResetBet();

            this._isOpenRewardTips = false;
            this._isCanResetBet = false;
            this.setRequest(false);
            this.setCanCaiMoney(0);
            this.setStartBtn(false);
            this.updatePlayerInfo();
            this.updatePlayerGold();
            this.onUpdateUnitOffline();
            this._prizeMoneyCache = 0;
            this.setCaiBet(0);
            this.setCaiNumber(0);

            this._game.playMusic(Path_game_shuiguoji.music_shuiguoji + "sgj_BGM.mp3");

        }

        private _curDiffTime: number;
        update(diff: number) {
            super.update(diff);
            if (!this._curDiffTime || this._curDiffTime < 0) {
                this._viewUI.btn_chongzhi.ani1.play(0, false);
                this._curDiffTime = TongyongPageDef.CZ_PLAY_DIFF_TIME;
            } else {
                this._curDiffTime -= diff;
            }
        }

        private onUpdateUnitOffline() {
            let mainPlayer = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            let mainPlayerInfo = mainPlayer.playerInfo;
            this._viewUI.txt_name.text = getMainPlayerName(mainPlayerInfo.nickname);
            this._viewUI.img_head.skin = TongyongUtil.getHeadUrl(mainPlayer.playerInfo.headimg, 2);
            this._viewUI.img_qifu.visible = TongyongUtil.getIsHaveQiFu(mainPlayer, this._game.sync.serverTimeBys);
            this._viewUI.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mainPlayer.playerInfo.headKuang);
            //vip标识
            this._viewUI.img_vip.visible = mainPlayer.playerInfo.vip_level > 0;
            this._viewUI.img_vip.skin = TongyongUtil.getVipUrl(mainPlayer.playerInfo.vip_level);
        }

        /**按钮点击事件 带缓动 */
        protected onBtnBetClickWithTween(e: LEvent): void {
            let index: number = this._allBetBtn.indexOf(e.currentTarget as Button);
            if (index == -1) return;
            let soundurl: string = Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_" + (index + 1) + ".mp3";
            this._game.uiRoot.btnTween(e.currentTarget, this, this.onClickBet, e, soundurl);
        }

        protected onMouseClick(e: LEvent) {
            if (e.target != this._viewUI.btn_spread) {
                this.menuTween(false);
            }
        }

        //菜单栏
        private menuTween(isOpen: boolean) {
            if (isOpen) {
                this._viewUI.box_menu.visible = true;
                this._viewUI.box_menu.scale(0.2, 0.2);
                this._viewUI.box_menu.alpha = 0;
                Laya.Tween.to(this._viewUI.box_menu, { scaleX: 1, scaleY: 1, alpha: 1 }, 300, Laya.Ease.backInOut);
            } else {
                Laya.Tween.to(this._viewUI.box_menu, { scaleX: 0.2, scaleY: 0.2, alpha: 0 }, 300, Laya.Ease.backInOut, Handler.create(this, () => {
                    this._viewUI.box_menu.visible = false;
                }));
            }
        }

        private _isStartDownTime: number = 0;
        private onStartDown(e: LEvent): void {
            this._isStartDownTime = Laya.timer.currTimer;
        }

        private onStartUp(e: LEvent): void {
            this._isStartDownTime = 0;
        }

        private onBetAniComplete(index: number): void {
            this._allBetAni[index].gotoAndStop(1);
        }

        //下注
        private _clickBetTime: number = 0;
        private onClickBet(e: any, target: any): void {
            if (Laya.timer.currTimer < this._clickBetTime || this._isRequest) return;
            this._clickBetTime = Laya.timer.currTimer + 200;

            if (this._viewUI.btn_start.disabled) {
                return;
            }

            let index: number = this._allBetBtn.indexOf(target as Button);
            if (index == -1) return;
            if (this._prizeMoneyCache > 0) {
                this._prizeMoneyCache = 0;
                this.setCanCaiMoney(0);
                this.setCaiBet(0);
            }
            this.addFriutBet(this._curChip, index);
        }

        //重置下注
        private ResetBet(): void {
            if (Laya.timer.currTimer < this._clickBetTime || this._isRequest) return;
            this._clickBetTime = Laya.timer.currTimer + 200;

            if (this._viewUI.btn_start.disabled) {
                return;
            }

            if (this._prizeMoneyCache > 0) {
                this._prizeMoneyCache = 0;
                this.setCanCaiMoney(0);
                this.setCaiBet(0);
            }
            for (let i: number = 0; i < this._allBetNum.length; i++) {
                this.setFriutBet(0, i);
            }
        }

        //所有下注加1
        private BetAll(): void {
            if (Laya.timer.currTimer < this._clickBetTime || this._isRequest) return;
            this._clickBetTime = Laya.timer.currTimer + 200;

            if (this._viewUI.btn_start.disabled) {
                return;
            }
            if (this._prizeMoneyCache > 0) {
                this._prizeMoneyCache = 0;
                this.setCanCaiMoney(0);
                this.setCaiBet(0);
            }

            for (let i: number = 0; i < this._allBetNum.length; i++) {
                if (!this.addFriutBet(this._curChip, i)) break;
            }
        }

        //按钮缓动回调
        private _clickTime: number = 0;
        protected onBtnTweenEnd(e: any, target: any): void {
            if (Laya.timer.currTimer < this._clickTime) return;
            this._clickTime = Laya.timer.currTimer;

            switch (target) {
                case this._viewUI.btn_spread://菜单
                    this.menuTween(!this._viewUI.box_menu.visible);
                    break;
                case this._viewUI.btn_fanhui://退出
                    let isPlay: boolean = this._effPage && this._effPage.isPlaying;
                    if (isPlay) {
                        this._game.showTips("游戏中禁止退出，请先打完这局哦~");
                        // TongyongPageDef.ins.alertRecharge(StringU.substitute("游戏中禁止退出，请先打完这局哦~"), () => {
                        // }, () => {

                        // }, true, TongyongPageDef.TIPS_SKIN_STR["qd"], TongyongPageDef.TIPS_SKIN_STR["title_ts"]);
                        return;
                    }
                    this._game.sceneObjectMgr.off(ShuiguojiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
                    this._game.sceneObjectMgr.leaveStory(true);
                    break;
                case this._viewUI.btn_rule://规则
                    this._game.uiRoot.general.open(ShuiguojiPageDef.PAGE_SHUIGUOJI_RULE);
                    break;
                case this._viewUI.btn_set://设置
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_SETTING)
                    break;
                case this._viewUI.btn_qifu:
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_QIFU)
                    break;
                case this._viewUI.btn_record://战绩
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_RECORD, (page) => {
                        page.dataSource = ShuiguojiPageDef.GAME_NAME;
                    });
                    break;
                case this._viewUI.btn_left://减少猜大小下注量
                    if (this._isAutoStart) return;
                    if (this._canCaiMoney > 0 && !this._isRequest && this._caiBet >= this._canCaiMoney) {
                        this.setCaiBet(this._caiBet * 0.5);
                    }
                    break;
                case this._viewUI.btn_right://增加猜大小下注量
                    if (this._isAutoStart) return;
                    if (this._canCaiMoney > 0 && !this._isRequest && this._caiBet <= this._canCaiMoney) {
                        if (this._caiBet > this._playerGold) {
                            this._game.uiRoot.topUnder.showTips("老板,您的金币不够下注啦~");
                            return;
                        }
                        this.setCaiBet(this._caiBet * 2);
                    }
                    break;
                case this._viewUI.btn_big://猜大
                    if (this._isAutoStart) return;
                    if (this._canCaiMoney > 0 && !this._isRequest && this._caiBet > 0) {
                        let param: string = "1," + this._caiBet.toFixed(0);
                        this.setRequest(true);
                        this._game.network.call_shuiguoji_lottery(1, param);
                    }
                    break;
                case this._viewUI.btn_small://猜小
                    if (this._isAutoStart) return;
                    if (this._canCaiMoney > 0 && !this._isRequest && this._caiBet > 0) {
                        let param: string = "0," + this._caiBet.toFixed(0);
                        this.setRequest(true);
                        this._game.network.call_shuiguoji_lottery(1, param);
                    }
                    break;
                case this._viewUI.btn_start://开始
                    this.startBet();
                    break;
                case this._viewUI.btn_cancel_auto://取消自动
                    this.setStartBtn(false);
                    break;
                case this._viewUI.btn_bet_all://全部下注
                    this.BetAll();
                    break;
                case this._viewUI.btn_cancel_bet://取消下注
                    this.ResetBet();
                    break;
                case this._viewUI.btn_chongzhi://充值
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                    break;
                case this._testBtn://测试
                    let param: string = "";
                    for (let i: number = 0; i < this._allBetNum.length; i++) {
                        param += (i + 1) + "," + this._allBetNum[i] + ","
                    }

                    this._game.network.call_shuiguoji_lottery(2, param);
                    break;

                default:
                    break;
            }
        }

        private startBet(): void {
            if (this._prizeMoneyCache > 0) {
                this._prizeMoneyCache = 0;
                this.setCanCaiMoney(0);
                this.setCaiBet(0);

                // return;
            }

            this._playerGold = 0;
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                this._playerGold = mainUnit.GetMoney();
            }
            let betMoney = this.callBetMoney();
            if (betMoney <= 0) {
                this.setStartBtn(false);
                this._game.uiRoot.topUnder.showTips("老板,请先下注啦~");
                return;
            }
            if (this._playerGold < betMoney) {
                this.setStartBtn(false);
                this._game.uiRoot.topUnder.showTips("老板,您的金币不够下注啦~");
                return;
            }

            let param: string = "";
            for (let i: number = 0; i < this._allBetNum.length; i++) {
                param += (i + 1) + "," + this._allBetNum[i] + ","
            }

            this.setRequest(true);
            this._viewUI.ui_jc.setPlayEff(true);
            // this.setCaiBet(0);
            this._prizeMoneyCache = 0;
            this._game.network.call_shuiguoji_lottery(0, param);
        }

        //帧间隔心跳
        deltaUpdate() {
            if (!this._viewUI) return;
            if (this._isStartDownTime > 0 && Laya.timer.currTimer > this._isStartDownTime + 1200) {
                let betMoney = this.callBetMoney();
                if (betMoney <= 0) {
                    this.setStartBtn(false);
                    this._game.uiRoot.topUnder.showTips("老板,请先下注啦~");
                } else {
                    this.setStartBtn(true);
                }
            }

            if (this._effPage) {
                this._effPage.Update(0);
            }

            if (this._isAutoStart && !this._isRequest) {
                if (!this.isPlayingEff()) {
                    this.startBet();
                }
            }

            if (this._isPlayDXEff) {
                this.setCaiNumber(Math.ceil(Math.random() * 14));
            }

            if (this._isOpenRewardTips && !this._game.uiRoot.general.isOpened(ShuiguojiPageDef.PAGE_SHUIGUOJI_PRIZE)) {
                this._isOpenRewardTips = false;
                this.updateStartBtn();
            }
        }

        //-----------------------------------------
        private setRequest(val: boolean): void {
            this._isRequest = val;
            this.updatePlayGame();
        }

        private setCanCaiMoney(val: number): void {
            this._canCaiMoney = val;
            if (val == 0) this._isPlayDXEff = false;
            this.updatePlayGame();
            if (val == 0) {
                this._viewUI.ani9.gotoAndStop(1);
            }
        }

        private updatePlayGame(): void {
            let isPlay: boolean = this._isRequest ? true : (this._canCaiMoney > 0 ? true : this.isPlayingEff());
            this.setPlayGame(isPlay);
        }

        private setPlayGame(val: boolean): void {
            this._isPlayGame = val;
            this.updateStartBtn();
        }

        private isPlayingEff(): boolean {
            return (this._effPage && this._effPage.isPlaying) || this._game.uiRoot.general.isOpened(ShuiguojiPageDef.PAGE_SHUIGUOJI_PRIZE);
        }

        //筹码-------------------
        //选择筹码
        private onSelectChip(index: number): void {
            if (this._curChip == ROOM_CHIP_CONFIG[index]) {
                return;
            }
            this._curChip = ROOM_CHIP_CONFIG[index];
            for (let i: number = 0; i < this._chipUIList.length; i++) {
                this._chipUIList[i].y = i == index ? this._curChipY - 10 : this._curChipY;
                this._chipUIList[i].img0.visible = this._chipUIList[i].img1.visible = i == index;
                if (i == index) {
                    this._chipUIList[i].ani1.play(0, true);
                } else {
                    this._chipUIList[i].ani1.gotoAndStop(0);
                }
            }
        }

        //-------------------------------
        //开始按钮
        private setStartBtn(isAuto: boolean): void {
            this._isStartDownTime = 0;
            this._isAutoStart = isAuto;
            this._viewUI.btn_cancel_auto.visible = isAuto;
            this._viewUI.btn_start.visible = !isAuto;
        }

        //开始按钮
        private updateStartBtn(): void {
            this._viewUI.btn_start.disabled = this.isPlayingEff() || this._isRequest || this._isPlayDXEff;
        }

        //下注------------------------------------------------
        //加注
        private addFriutBet(val: number, index: number): boolean {
            if (index < 0 || index >= this._allBetNum.length) return false;
            if (this._isCanResetBet) {
                this._isCanResetBet = false;
                for (let i: number = 0; i < this._allBetNum.length; i++) {
                    this.setFriutBet(0, i);
                }
            }
            if (val > this._playerGold) {
                this._game.uiRoot.topUnder.showTips("老板,您的金币不够下注啦~");
                return false;
            }
            if (val + this._allBetNum[index] > 9999) {
                this._game.uiRoot.topUnder.showTips("老板,已达到下注上限啦~");
                return false;
            }
            this.setFriutBet(this._allBetNum[index] + val, index);
            return true;
        }

        //设置下注
        private setFriutBet(val: number, index: number): boolean {
            if (index < 0 || index >= this._allBetNum.length) return;
            this._allBetNum[index] = val;
            // let valstr:string = this.getBetStr(val);
            this._allBetClip[index].setText(val, true);
            this.updatePlayerGold(true);
        }

        private getBetStr(val: number): string {
            if (val < 10) {
                return "000" + val;
            } else if (val < 100) {
                return "00" + val;
            } else if (val < 1000) {
                return "0" + val;
            } else {
                return val.toFixed(0);
            }
        }

        //计算下注总额
        private callBetMoney(): number {
            let totalBet: number = 0;
            for (let i: number = 0; i < this._allBetNum.length; i++) {
                totalBet += this._allBetNum[i];
            }
            return totalBet;
        }

        private _diff: number = 500;
        private _timeList: { [key: number]: number } = {};
        private _firstList: { [key: number]: number } = {};
        private playTween(img: LImage, index: number, isTween?: boolean) {
            if (!img) return;
            if (!this._timeList[index]) {
                this._timeList[index] = 0;
            }
            if (this._timeList[index] >= 2500) {
                this._timeList[index] = 0;
                this._firstList[index] = 0;
                img.visible = false;
                return;
            }
            Laya.Tween.to(img, { alpha: isTween ? 1 : 0.2 }, this._diff, Laya.Ease.linearNone, Handler.create(this, this.playTween, [img, index, !isTween]), this._firstList[index] ? this._diff : 0);
            this._timeList[index] += this._diff;
            this._firstList[index] = 1;
        }

        private _qifuTypeImgUrl: string;
        private qifuFly(dataSource: any): void {
            if (!dataSource) return;
            let dataInfo = dataSource;
            this._game.qifuMgr.showFlayAni(this._viewUI.img_head, this._viewUI, dataSource, (dataInfo) => {
                //相对应的玩家精灵做出反应
                this._qifuTypeImgUrl = TongyongUtil.getQFTypeImg(dataInfo.qf_id);
                this.updatePlayerInfo(dataInfo.qifu_index);
            }, true);
        }

        //--------------------------------------
        //界面底部玩家信息
        private updatePlayerInfo(qifu_index?: number): void {
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                let headImg = mainUnit.GetHeadImg();
                this._viewUI.txt_name.text = getMainPlayerName(mainUnit.GetName());

                let mainIdx = mainUnit.GetIndex();
                this._viewUI.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mainUnit.GetHeadKuangImg());
                //vip标识
                this._viewUI.img_vip.visible = mainUnit.GetVipLevel() > 0;
                this._viewUI.img_vip.skin = TongyongUtil.getVipUrl(mainUnit.GetVipLevel());
                //祈福成功 头像上就有动画
                if (qifu_index && mainIdx == qifu_index) {
                    this._viewUI.qifu_type.visible = true;
                    this._viewUI.qifu_type.skin = this._qifuTypeImgUrl;
                    this.playTween(this._viewUI.qifu_type, qifu_index);
                }
                //时间戳变化 才加上祈福标志
                if (TongyongUtil.getIsHaveQiFu(mainUnit, this._game.sync.serverTimeBys)) {
                    if (qifu_index && mainIdx == qifu_index) {
                        Laya.timer.once(2500, this, () => {
                            this._viewUI.img_qifu.visible = true;
                            this._viewUI.img_head.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                        })
                    }
                } else {
                    this._viewUI.img_qifu.visible = false;
                    this._viewUI.img_head.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                }
            }
        }

        //更新玩家金币
        private updatePlayerGold(isCalBet: boolean = false): void {
            //主玩家的座位
            this._playerGold = 0;
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                this._playerGold = mainUnit.GetMoney();
                if (isCalBet) {
                    let betMoney = this.callBetMoney();
                    this._playerGold -= betMoney;
                }
                this._playerGold -= this._prizeMoneyCache;
                if (this._canCaiMoney > 0) {
                    this._playerGold -= (this._caiBet - this._canCaiMoney)
                }
                this._playerGold = EnumToString.getPointBackNum(this._playerGold, 2);
                this._playerGoldClip && this._playerGoldClip.setText(this._playerGold, true);

                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    this._chipUIList[i].disabled = ROOM_CHIP_CONFIG[i] > this._playerGold;
                }
            }
        }

        //猜大小下注
        private setCaiBet(val: number): void {
            this._caiBet = val;
            this._caiBetClip && this._caiBetClip.setText(this._caiBet.toString(), true)
            this.updatePlayerGold();
        }

        //猜大小数字
        private setCaiNumber(val: number): void {
            this._caiNumber = val;
            this._caiNumberClip && this._caiNumberClip.setText(this._caiNumber.toFixed(0), true)
        }

        private onUpdateMapInfo(): void {
            let mapinfo = this._game.sceneObjectMgr.mapInfo;
            this._sgjMapInfo = mapinfo as ShuiguojiMapInfo;
            if (mapinfo) {
                this.onUpdateBattle();
            }
        }

        private onUpdateUnit() {
            if (!this._viewUI) return;
            this.updatePlayerInfo();
            this.updatePlayerGold();
        }

        //战斗结构体更新
        private _lotteryInfo: gamecomponent.object.BattleInfoSGJ;
        private onUpdateBattle() {
            if (!this._viewUI) return;
            if (!this._sgjMapInfo) return;
            let battleInfoMgr = this._sgjMapInfo.battleInfoMgr;
            if (!battleInfoMgr) return;
            for (let i = 0; i < battleInfoMgr.info.length; i++) {
                let info = battleInfoMgr.info[i];
                if (info instanceof gamecomponent.object.BattleInfoSGJ) {
                    this._lotteryInfo = info as gamecomponent.object.BattleInfoSGJ;

                    if (this._lotteryInfo.prizeType == 6) {
                        //猜大小

                        this.setCanCaiMoney(0);
                        this._isPlayDXEff = true;
                        this._prizeMoneyCache = this._lotteryInfo.prizeTotalMoney;
                        this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "Bidaxiao.mp3");
                        Laya.timer.once(3200, this, () => {
                            this._isPlayDXEff = false;
                            this.updateStartBtn();
                            this.setCaiBet(this._lotteryInfo.prizeTotalMoney);
                            this.setCaiNumber(this._lotteryInfo.prizeContent[0].money);
                            if (this._lotteryInfo.prizeContent[0].index == 0) {
                                this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "Bidaxiao_win.mp3");
                            } else {
                                this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "Bidaxiao_lose.mp3");
                            }
                        })
                        this.setRequest(false);
                    } else {
                        if (this._effPage) {
                            this._effPage.playEff(this._lotteryInfo, Handler.create(this, this.onEffComplete, null, false));
                        }
                        this._prizeMoneyCache = this._lotteryInfo.prizeTotalMoney;
                        this._isCanResetBet = true;
                        this.setCaiBet(0);
                        this.setCanCaiMoney(0);
                        this._viewUI.ui_jc.setJacketMoney(this.getJacketMoney());
                    }
                    this.setRequest(false);
                }
            }
        }

        private onEffComplete(callType: number, type: number, index: number, isFirst: boolean, totalIdx: number = 0, startIdx: number = 0, endIdx: number = 0): void {
            if (callType == 1) {
                //奖励点
                let firutType: number = ALL_FIRUT[index];
                let prizeMoney: number = this.getPrizeMoney(index);
                if (prizeMoney > 0) {

                    this.setCanCaiMoney(this._canCaiMoney + prizeMoney);
                    this.setCaiBet(this._caiBet + prizeMoney);
                    this._allBetAni[8 - firutType].play(1, false);
                    if (!this._viewUI.ani9.isPlaying) {
                        this._viewUI.ani9.play(1, true);
                    }
                }

                this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "dingzhuang.mp3");
                Laya.timer.once(200, this, () => {
                    this._game.playSound(Path_game_shuiguoji.music_shuiguoji + FIRUT_MUSIC[firutType - 1]);
                })
                if (isFirst) {
                    if (type == ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SAN_YUAN ||
                        type == ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SI_XI ||
                        type == ShuiGuoJiEffectPage.PRIZE_TYPE_PULL_SCREEN) {
                        let musicUrl: string = "slot_z_big_slam.mp3";
                        if (type == ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SAN_YUAN) {
                            musicUrl = "slot_z_big_three.mp3";
                        } else if (type == ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SI_XI) {
                            musicUrl = "slot_z_four.mp3";
                        }

                        Laya.timer.once(800, this, () => {
                            this._game.playSound(Path_game_shuiguoji.music_shuiguoji + musicUrl);
                            this._game.uiRoot.general.open(ShuiguojiPageDef.PAGE_SHUIGUOJI_TIP_EFFECT, (page: Page) => {
                                page.dataSource = type;
                            })
                        })
                    }
                    if (type == ShuiGuoJiEffectPage.PRIZE_TYPE_LUCKEY) {
                        this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "Lucky.mp3");
                    }
                }


            } else if (callType == 2) {
                //格子点
                if (totalIdx == startIdx + 1) {
                    let ranIndex: number = Math.floor(Math.random() * 7 + 1);
                    this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "slot_begin_2.mp3");
                } else if (totalIdx == endIdx - 6) {
                    this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "slot_slowdown.mp3");
                } else if (totalIdx > startIdx + 30 && totalIdx < endIdx - 6) {
                    if ((endIdx - totalIdx) % 9 == 0) {
                        this._game.playSound(Path_game_shuiguoji.music_shuiguoji + "slot_fast.mp3");
                    }
                }
            } else {
                //结束
                if (this._lotteryInfo.prizeTotalMoney > 0) {
                    this._isOpenRewardTips = true;
                    this._game.uiRoot.general.open(ShuiguojiPageDef.PAGE_SHUIGUOJI_PRIZE, (page: Page) => {
                        page.dataSource = this._lotteryInfo;
                    })
                }
                this._viewUI.ui_jc.setPlayEff(false);
                this._viewUI.ui_jc.setJacketMoney(0);
                this.updatePlayGame();
            }
        }

        private getPrizeMoney(index: number): number {
            if (!this._lotteryInfo || !this._lotteryInfo.prizeContent) return 0;
            for (let i: number = 0; i < this._lotteryInfo.prizeContent.length; i++) {
                if (this._lotteryInfo.prizeContent[i].index == index) {
                    return this._lotteryInfo.prizeContent[i].money;
                }
            }
            return 0;
        }

        private getJacketMoney(): number {
            if (!this._lotteryInfo || !this._lotteryInfo.jacketContent) return 0;
            let money: number = 0;
            for (let i: number = 0; i < this._lotteryInfo.jacketContent.length; i++) {
                money += this._lotteryInfo.jacketContent[i].money;
            }
            return money;
        }

        public close(): void {
            if (this._viewUI) {
                if (this._testBtn) {
                    this._testBtn.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                    this._testBtn.removeSelf();
                    this._testBtn.destroy();
                    this._testBtn = null;
                }
                this._viewUI.ui_jc && this._viewUI.ui_jc.destroy();

                this._viewUI.btn_spread.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_fanhui.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_set.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_rule.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_record.off(LEvent.CLICK, this, this.onBtnClickWithTween);

                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    this._chipUIList[i] && this._chipUIList[i].off(LEvent.CLICK, this, this.onSelectChip);
                }
                this._chipUIList.length = 0;

                for (let i: number = 0; i < this._allBetBtn.length; i++) {
                    this._allBetBtn[i] && this._allBetBtn[i].off(LEvent.CLICK, this, this.onBtnBetClickWithTween);
                }
                this._allBetBtn.length = 0;

                for (let i: number = 0; i < this._allBetAni.length; i++) {
                    this._allBetAni[i] && this._allBetAni[i].off(LEvent.COMPLETE, this, this.onBetAniComplete);
                }
                this._allBetAni.length = 0;

                this._viewUI.btn_cancel_bet.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_bet_all.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_qifu.off(LEvent.CLICK, this, this.onBtnClickWithTween);

                this._viewUI.btn_left.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_right.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_big.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_small.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_chongzhi.off(LEvent.CLICK, this, this.onBtnClickWithTween);

                this._viewUI.btn_start.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_cancel_auto.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_start.off(LEvent.MOUSE_DOWN, this, this.onStartDown);
                this._viewUI.btn_start.off(LEvent.MOUSE_UP, this, this.onStartUp);

            }

            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAIN_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.off(ShuiguojiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
            this._game.qifuMgr.off(QiFuMgr.QIFU_FLY, this, this.qifuFly);

            if (this._playerGoldClip) {
                this._playerGoldClip.removeSelf();
                this._playerGoldClip.destroy(true);
                this._playerGoldClip = null;
            }

            if (this._caiBetClip) {
                this._caiBetClip.removeSelf();
                this._caiBetClip.destroy(true);
                this._caiBetClip = null;
            }
            if (this._caiBetClipBg) {
                this._caiBetClipBg.removeSelf();
                this._caiBetClipBg.destroy(true);
                this._caiBetClipBg = null;
            }

            if (this._caiNumberClip) {
                this._caiNumberClip.removeSelf();
                this._caiNumberClip.destroy(true);
                this._caiNumberClip = null;
            }
            if (this._caiNumberClipBg) {
                this._caiNumberClipBg.removeSelf();
                this._caiNumberClipBg.destroy(true);
                this._caiNumberClipBg = null;
            }

            if (this._allBetClip) {
                for (let i: number = 0; i < this._allBetClip.length; i++) {
                    this._allBetClip[i].removeSelf();
                    this._allBetClip[i].destroy(true);
                    this._allBetClip[i] = null;
                }
                this._allBetClip.length = 0;
            }
            if (this._allBetClipBg) {
                for (let i: number = 0; i < this._allBetClipBg.length; i++) {
                    this._allBetClipBg[i].removeSelf();
                    this._allBetClipBg[i].destroy(true);
                    this._allBetClipBg[i] = null;
                }
                this._allBetClipBg.length = 0;
            }

            if (this._effPage) this._effPage.clear();
            this._game.stopAllSound();
            this._game.stopMusic();
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            super.close();
        }

        protected clear(): void {
            super.clear();
            if (this._viewUI) {
                this._viewUI.destroy();
                this._viewUI = null;
            }
            if (this._effPage) {
                this._effPage.destroy(true);
                this._effPage = null;
            }

            if (this._chipUIList) {
                this._chipUIList.length = 0;
            }
            if (this._playerGoldClip) {
                this._playerGoldClip.removeSelf();
                this._playerGoldClip.destroy(true);
                this._playerGoldClip = null;
            }
            if (this._allBetBtn) {
                this._allBetBtn.length = 0;
                this._allBetAni.length = 0;
                for (let i: number = 0; i < this._allBetClip.length; i++) {
                    this._allBetClip[i].removeSelf();
                    this._allBetClip[i].destroy(true);
                    this._allBetClip[i] = null;
                }
                this._allBetClip.length = 0;
            }
            if (this._caiBetClip) {
                this._caiBetClip.removeSelf();
                this._caiBetClip.destroy(true);
                this._caiBetClip = null;
            }
            if (this._caiBetClipBg) {
                this._caiBetClipBg.removeSelf();
                this._caiBetClipBg.destroy(true);
                this._caiBetClipBg = null;
            }
            if (this._caiNumberClip) {
                this._caiNumberClip.removeSelf();
                this._caiNumberClip.destroy(true);
                this._caiNumberClip = null;
            }
            if (this._caiNumberClipBg) {
                this._caiNumberClipBg.removeSelf();
                this._caiNumberClipBg.destroy(true);
                this._caiNumberClipBg = null;
            }

        }

    }
}