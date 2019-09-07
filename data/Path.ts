/**
* 路径配置
*/
module gameshuiguoji.data {
	export class Path {
		static readonly music_shuiguoji: string = 'music/shuiguoji/';
		static readonly ui_shuiguoji: string = "shuiguoji_ui/game_ui/shuiguoji/";
		static readonly ui_shuiguoji_effect: string = Path.ui_shuiguoji + "effect/";
		static readonly ui_shuiguoji_effect_zhongjiang: string = Path.ui_shuiguoji_effect + "zhongjiang/";
		static readonly atlas_game_ui: string = "shuiguoji_res/atlas/shuiguoji_ui/game_ui/";
	}
}