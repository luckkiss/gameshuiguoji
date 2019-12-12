/**
* name 
*/
module gameshuiguoji.page {
	export class ShuiguojiPageDef extends game.gui.page.PageDef {
		static GAME_NAME: string;
		//水果机地图UI
		static PAGE_SHUIGUOJI_MAP: string = "1";
		//水果机规则
		static PAGE_SHUIGUOJI_RULE: string = "101";
		//水果机特效提示
		static PAGE_SHUIGUOJI_TIP_EFFECT: string = "5";
		//水果机中奖金额
		static PAGE_SHUIGUOJI_PRIZE: string = "6";


		static myinit(str: string) {
			super.myinit(str);
			ShuiguojiClip.init();
			PageDef._pageClassMap[ShuiguojiPageDef.PAGE_SHUIGUOJI_MAP] = ShuiGuoJiMapPage;
			PageDef._pageClassMap[ShuiguojiPageDef.PAGE_SHUIGUOJI_RULE] = ShuiGuoJiRulePage;
			PageDef._pageClassMap[ShuiguojiPageDef.PAGE_SHUIGUOJI_TIP_EFFECT] = ShuiGuoJiTipEffectPage;
			PageDef._pageClassMap[ShuiguojiPageDef.PAGE_SHUIGUOJI_PRIZE] = ShuiGuoJiPrizePage;

			this["__needLoadAsset"] = [
				DatingPath.atlas_dating_ui + "qifu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "logo.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				Path_game_shuiguoji.atlas_game_ui + "shuiguoji.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "qifu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/suiji.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/bigwin.atlas",
				Path_game_shuiguoji.atlas_game_ui + "shuiguoji/effect/jinbi0.atlas",
				Path_game_shuiguoji.atlas_game_ui + "shuiguoji/effect/jinbi1.atlas",
				Path_game_shuiguoji.atlas_game_ui + "shuiguoji/effect/zhongjiang.atlas",
				Path.custom_atlas_scene + 'chip.atlas',

				Path.map + 'pz_shuiguoji.png',
				Path.map_far + 'bg_shuiguoji.jpg'
			]

			if (WebConfig.needMusicPreload) {
				this["__needLoadAsset"] = this["__needLoadAsset"].concat([
					Path_game_shuiguoji.music_shuiguoji + "sgj_BGM.mp3",
					Path_game_shuiguoji.music_shuiguoji + "Bidaxiao.mp3",
					Path_game_shuiguoji.music_shuiguoji + "Bidaxiao_lose.mp3",
					Path_game_shuiguoji.music_shuiguoji + "Bidaxiao_win.mp3",
					Path_game_shuiguoji.music_shuiguoji + "composite3.mp3",
					Path_game_shuiguoji.music_shuiguoji + "dingzhuang.mp3",
					Path_game_shuiguoji.music_shuiguoji + "Jackpot.mp3",
					Path_game_shuiguoji.music_shuiguoji + "Lucky.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_1.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_2.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_3.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_4.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_5.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_6.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_7.mp3",
					Path_game_shuiguoji.music_shuiguoji + "pressed_fruit_8.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin_2.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin1.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin2.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin3.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin4.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin5.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin6.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_begin7.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_end.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_fast.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_hit1.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_slowdown.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_77.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_apple.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_bar.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_bell.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_big_slam.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_big_three.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_four.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_mango.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_orange.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_star.mp3",
					Path_game_shuiguoji.music_shuiguoji + "slot_z_water.mp3",
					Path_game_shuiguoji.music_shuiguoji + "Win.mp3",
				]);
			}
			
			this["__enterMapLv"] = Web_operation_fields.GAME_ROOM_CONFIG_SHUIGUOJI_1;
		}
	}
}