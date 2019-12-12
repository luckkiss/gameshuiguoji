/**
* name 
*/
module gameshuiguoji.page {
	export class ShuiGuoJiRulePage extends game.gui.base.Page {
		private _viewUI: ui.ajqp.game_ui.shuiguoji.ShuiGuoJi_GuiZeUI;
		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._isNeedBlack = true;
			this._isClickBlack = true;
			this._asset = [
				Path_game_shuiguoji.atlas_game_ui + "shuiguoji.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.shuiguoji.ShuiGuoJi_GuiZeUI');
			this.addChild(this._viewUI);

		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.panel_rule.vScrollBarSkin = "";
			this._viewUI.panel_rule.vScrollBar.autoHide = true;
			this._viewUI.panel_rule.vScrollBar.elasticDistance = 100;
		}

		public close(): void {
			if (this._viewUI) {

			}
			super.close();
		}
	}
}