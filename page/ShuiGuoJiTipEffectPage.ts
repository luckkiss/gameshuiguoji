/**
* name 
*/
module gameshuiguoji.page {
	export class ShuiGuoJiTipEffectPage extends game.gui.base.Page {
		private _viewUI: ui.nqp.game_ui.shuiguoji.DaSanYuanUI;

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
			this._viewUI = this.createView('game_ui.shuiguoji.DaSanYuanUI');
			this.addChild(this._viewUI);
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			if (this.dataSource == ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SAN_YUAN) {
				this._viewUI.img_result.skin = Path_game_shuiguoji.ui_shuiguoji + "tu_dsy.png";
			} else if (this.dataSource == ShuiGuoJiEffectPage.PRIZE_TYPE_DA_SI_XI) {
				this._viewUI.img_result.skin = Path_game_shuiguoji.ui_shuiguoji + "tu_dsx.png";
			} else {
				this._viewUI.img_result.skin = Path_game_shuiguoji.ui_shuiguoji + "tu_mth.png";
			}
			this._viewUI.ani1.on(LEvent.COMPLETE, this, this.onPlayComplte);
			this._viewUI.ani1.play(1, false);
		}

		private onPlayComplte(): void {
			this.close();
		}

		public close(): void {
			if (this._viewUI) {
				this._viewUI.ani1.off(LEvent.COMPLETE, this, this.onPlayComplte);
			}
			Laya.timer.clearAll(this);
			super.close();
		}
	}

}