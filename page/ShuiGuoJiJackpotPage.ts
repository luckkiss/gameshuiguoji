/**
* name 
*/
module gameshuiguoji.page {
	import Path_game_shuiguoji = gameshuiguoji.data.Path;
	const DATA: any[] = [
		{
			icon: Path_game_shuiguoji.ui_shuiguoji + "tu_bar100.png",
			syPer: 0.5,
			curJD: 0,
			totalJD: 20
		},
		{
			icon: Path_game_shuiguoji.ui_shuiguoji + "tu_77_1.png",
			syPer: 0.3,
			curJD: 0,
			totalJD: 20
		},
		{
			icon: Path_game_shuiguoji.ui_shuiguoji + "tu_xx.png",
			syPer: 0.15,
			curJD: 0,
			totalJD: 20
		},
		{
			icon: Path_game_shuiguoji.ui_shuiguoji + "tu_xg.png",
			syPer: 0.05,
			curJD: 0,
			totalJD: 20
		}
	];
	export class ShuiGuoJiJackpotPage extends ui.ajqp.game_ui.shuiguoji.JiangCiUI {
		private _game: Game;
		private _jackpotClip: ShuiguojiClip;
		private _sgjMapInfo: ShuiguojiMapInfo;
		private _mainPlayer: PlayerData;
		constructor() {
			super();
			this._jackpotClip = new ShuiguojiClip(ShuiguojiClip.SGJ_GOLD);
			this._jackpotClip.x = this.clip_num.x;
			this._jackpotClip.y = this.clip_num.y;
			this._jackpotClip.scaleX = this.clip_num.scaleX;
			this._jackpotClip.scaleY = this.clip_num.scaleY;
			this._jackpotClip.anchorX = this.clip_num.anchorX;
			this._jackpotClip.anchorY = this.clip_num.anchorY;
			this.clip_num.parent.addChild(this._jackpotClip);
			this.clip_num.visible = false;

			this.box_info.visible = false;
		}


		onOpen(game: Game) {
			this._game = game;
			this.btn_xia.on(LEvent.CLICK, this, this.onBtnClickHandle);
			this.btn_shang.on(LEvent.CLICK, this, this.onBtnClickHandle);
			this.box_info.visible = false;
			this.btn_xia.visible = true;
			this.list_jack.vScrollBarSkin = "";
			this.list_jack.scrollBar.elasticDistance = 100;
			this.list_jack.itemRender = ListJiangCiItem;
			this.list_jack.renderHandler = new Handler(this, this.renderHandler);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAIN_UNIT_CHANGE, this, this.updateMainUnit);
			this._game.sceneObjectMgr.on(ShuiguojiMapInfo.EVENT_JACKET_UPDATE, this, this.updateJackpot);
			this._isPlayEff = false;
			this._jacketMoney = 0;
			this.onUpdateMapInfo();
			this.updateMainUnit();
			this.onUpdatePlayerInfo();
			this.updateJackpot();
		}

		private onUpdateMapInfo(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			this._sgjMapInfo = mapinfo as ShuiguojiMapInfo;
			if (mapinfo) {
				this.updateJackpot();
			}
		}

		private renderHandler(cell: ListJiangCiItem, index: number) {
			if (cell) {
				cell.setData(this._game, cell.dataSource);
			}
		}

		private updateJackpot(): void {
			if (this._sgjMapInfo) {
				let jackPotMoney = TongyongUtil.getMoneyChange(this._sgjMapInfo.GetJackpot()) / 10
				this._jackpotClip.setText(EnumToString.getPointBackNum(jackPotMoney + this._jacketMoney, 2), true);
			}
		}

		private _jacketMoney: number = 0;
		public setJacketMoney(val: number): void {
			this._jacketMoney = val;
			this.updateJackpot();
		}

		private _isPlayEff: boolean = false;
		public setPlayEff(val: boolean): void {
			this._isPlayEff = val;
			if (!val) this.onUpdatePlayerInfo();
		}

		private updateMainUnit(): void {
			if (this._mainPlayer) {
				//先移除旧的
				this._mainPlayer.removeListene(PlayerDataField.PLAYERDATA_INT_SGJ_COUNT, this, this.onUpdatePlayerInfo);
			}
			this._mainPlayer = this._game.sceneObjectMgr.mainPlayer;
			if (this._mainPlayer) {
				this._mainPlayer.AddListen(PlayerDataField.PLAYERDATA_INT_SGJ_COUNT, this, this.onUpdatePlayerInfo);
				this.onUpdatePlayerInfo();
			}
		}

		private onUpdatePlayerInfo(first: boolean = true) {
			if (!WebConfig.info) return;
			if (this._isPlayEff) return;
			let data: any[] = [];
			for (let i: number = 0; i < DATA.length; i++) {
				let obj: any = {
					curCount: this._mainPlayer ? this._mainPlayer.GetSgjCount(i) : 0,
					temp: DATA[i]
				}
				data.push(obj);
			}

			this.list_jack.dataSource = data;
		}

		protected onBtnClickHandle(e: LEvent): void {
			if (!this._game) return;
			this._game.uiRoot.btnTween(e.currentTarget)
			switch (e.currentTarget) {
				case this.btn_xia:
					this.box_info.y = -this.box_info.height;
					this.box_info.visible = true;
					Laya.Tween.to(this.box_info, { y: 0 }, 400, Laya.Ease.linearNone);
					this.btn_xia.visible = false;
					break;
				case this.btn_shang:
					this.box_info.y = 0;
					Laya.Tween.to(this.box_info, { y: -this.box_info.height }, 400, Laya.Ease.linearNone, Handler.create(this, this.shangCOmplete, null, true));
					break;

				default:
					break;
			}
		}

		private shangCOmplete(): void {
			this.btn_xia.visible = true;
		}

		public destroy(): void {
			if (this._sgjMapInfo) {
				this._sgjMapInfo = null;
			}

			if (this._mainPlayer) {
				//先移除旧的
				this._mainPlayer.removeListene(PlayerDataField.PLAYERDATA_INT_SGJ_COUNT, this, this.onUpdatePlayerInfo);
				this._mainPlayer = null;
			}
			if (this._game) {
				this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
				this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAIN_UNIT_CHANGE, this, this.updateMainUnit);
				this._game.sceneObjectMgr.off(ShuiguojiMapInfo.EVENT_JACKET_UPDATE, this, this.updateJackpot);
			}
			this.btn_xia.off(LEvent.CLICK, this, this.onBtnClickHandle);
			this.btn_shang.off(LEvent.CLICK, this, this.onBtnClickHandle);

			if (this._jackpotClip) {
				this._jackpotClip.removeSelf();
				this._jackpotClip.destroy();
				this._jackpotClip = null;
			}
			super.destroy();
		}
	}
	class ListJiangCiItem extends ui.ajqp.game_ui.shuiguoji.component.JiangCiMiZiUI {
		private _game: Game;
		private _data: any;//"ddz","niuniu","zjh"
		setData(game: Game, data: any) {
			this._game = game;
			this._data = data;
			let syPer: number = data.temp.syPer;
			let curJD: number = data.curCount;
			let totalJD: number = data.temp.totalJD;
			this.txt_title.text = syPer + "%";
			this.img_icon.skin = data.temp.icon;
			this.txt_jindu.text = curJD + "/" + totalJD;
			this.pro_jindu.value = curJD / totalJD;

		}
	}
}