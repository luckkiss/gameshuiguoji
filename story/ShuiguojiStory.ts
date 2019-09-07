/**
* name 水果机剧情
*/
module gameshuiguoji.story {
	export class ShuiguojiStory extends gamecomponent.story.StoryNormalBase {
		private _sgjMapInfo: ShuiguojiMapInfo;

		constructor(v: Game, mapid: string, maplv: number) {
			super(v, mapid, maplv);
			this.init();
		}

		init() {
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this.onIntoNewMap();
		}

		private onIntoNewMap(info?: MapAssetInfo): void {
			if (!info) return;

			this.onMapInfoChange();
			this._game.uiRoot.closeAll();
			this._game.uiRoot.HUD.open(ShuiguojiPageDef.PAGE_SHUIGUOJI_MAP);
		}

		private onMapInfoChange(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			if (mapinfo) {
				this._sgjMapInfo = mapinfo as ShuiguojiMapInfo;
				this._sgjMapInfo.on(MapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);
				this.onUpdateState();
			}
		}

		private onUpdateState(): void {

		}

		createofflineUnit() {

		}

		enterMap() {
			//各种判断
			this._game.network.call_match_game(this._mapid, this.maplv);
			return true;
		}

		leavelMap() {
			//各种判断
			this._game.network.call_leave_game();
			return true;
		}

		removeListen() {
			if (this._sgjMapInfo) {
				this._sgjMapInfo.off(MapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);
				this._sgjMapInfo = null;
			}
		}

		clear() {
			this.removeListen();
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.uiRoot.general.close(ShuiguojiPageDef.PAGE_SHUIGUOJI_MAP);
		}

		update(diff: number) {

		}
	}
}