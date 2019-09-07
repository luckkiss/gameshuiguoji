/**
* name 
*/
module gameshuiguoji.page {
	export class ShuiGuoJiPrizePage extends game.gui.base.Page {
		private _viewUI: ui.game_ui.shuiguoji.ZhongJiangLUI;
		private _goldClip: ShuiguojiClip;
		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._isNeedBlack = true;
			this._isClickBlack = false;
			this._asset = [
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				Path_game_shuiguoji.atlas_game_ui + "shuiguoji.atlas",
				Path.custom_atlas_scene + 'chip.atlas',

			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.shuiguoji.ZhongJiangLUI');
			this.addChild(this._viewUI);

			this._goldClip = new ShuiguojiClip(ShuiguojiClip.SGJ_PRIZE_GOLD);
			this._goldClip.scaleX = this._viewUI.clip_num.scaleX;
			this._goldClip.scaleY = this._viewUI.clip_num.scaleY;
			this._goldClip.anchorX = 0.5;
			this._goldClip.centerX = 0;
			this._goldClip.centerY = 0;
			this._viewUI.clip_num.parent.addChild(this._goldClip);
			this._viewUI.clip_num.visible = false;
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			if (this.dataSource.jacketContent.length > 0) {
				this._viewUI.img_type.skin = Path_game_shuiguoji.ui_shuiguoji + "win_3.png";
			} else {
				let beishu: number = this.callBeishu();
				this.showCoinEff(beishu >= 20);
				if (beishu < 10) {
					this._viewUI.img_type.skin = Path_game_shuiguoji.ui_shuiguoji + "win_0.png";
				} else if (beishu < 31) {
					this._viewUI.img_type.skin = Path_game_shuiguoji.ui_shuiguoji + "win_1.png";
				} else {
					this._viewUI.img_type.skin = Path_game_shuiguoji.ui_shuiguoji + "win_2.png";
				}
			}
			this._goldClip.setText(this.dataSource.prizeTotalMoney, true);
			if (this._viewUI["ani1"]) {
				this._viewUI["ani1"].on(LEvent.COMPLETE, this, this.onPlayComplte);
				this._viewUI["ani1"].play(1, false);
			} else {
				Laya.timer.once(1200, this, this.close);
			}
		}

		private showCoinEff(val: boolean): void {
			this._viewUI.ui_coin_0.visible = val;
			this._viewUI.ui_coin_1.visible = val;
			this._viewUI.ui_coin_2.visible = val;
			this._viewUI.ui_coin_3.visible = val;
		}

		private callBeishu(): number {
			let all: any[] = this.dataSource.prizeContent;
			if (!all) return 0;
			let beishu: number = 0;
			for (let i: number = 0; i < all.length; i++) {
				let obj: any = all[i];
				beishu += ShuiGuoJiMapPage.ALL_FIRUT_BS[obj.index];
			}
			return beishu;
		}

		private onPlayComplte(): void {
			this.close();
		}

		public close(): void {
			if (this._viewUI) {
				if (this._viewUI["ani1"]) {
					this._viewUI["ani1"].off(LEvent.COMPLETE, this, this.onPlayComplte);
				}
				if (this._goldClip) {
					this._goldClip.removeSelf();
					this._goldClip.destroy();
					this._goldClip = null;
				}
			}
			Laya.timer.clearAll(this);
			super.close();
		}
	}

}