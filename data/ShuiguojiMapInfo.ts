/**
* name 
*/
module gameshuiguoji.data {
	const BET_NAME: string[] = [
		"苹果", "橙子", "芒果", "铃铛",
		"西瓜", "星星", "七七", "Bar",
		"猜大", "猜小"
	];
	const LOTTERY_NAME: string[] = [
		"全屏奖", "大三元", "大四喜", "Lucky",
		"普通", "猜大小"
	];
	const FIRUT_NAME: string[] = [
		"苹果", "橙子", "芒果", "铃铛",
		"西瓜", "星星", "七七", "Bar",
		"幸运",
		"小苹果", "小橙子", "小芒果", "小铃铛",
		"小西瓜", "小星星", "小七七", "小Bar",
		"小幸运"
	];
	export class ShuiguojiMapInfo extends gamecomponent.object.MapInfoT<gamecomponent.object.PlayingCard> {
		//地图状态变更
		static EVENT_STATUS_CHECK: string = "ShuiguojiMapInfo.EVENT_STATUS_CHECK";
		//战斗体更新
		static EVENT_BATTLE_CHECK: string = "ShuiguojiMapInfo.EVENT_BATTLE_CHECK";
		//继续游戏状态
		static EVENT_STATUS_CONTINUE: string = "ShuiguojiMapInfo.EVENT_STATUS_CONTINUE";
		//牌局号
		static EVENT_GAME_NO: string = "ShuiguojiMapInfo.EVENT_GAME_NO";
		//倒计时时间戳更新
		static EVENT_COUNT_DOWN: string = "ShuiguojiMapInfo.EVENT_COUNT_DOWN";
		//游戏记录更新
		static EVENT_GAME_RECORD: string = "ShuiguojiMapInfo.EVENT_GAME_RECORD";
		//奖池更新
		static EVENT_JACKET_UPDATE: string = "ShuiguojiMapInfo.EVENT_JACKET_UPDATE";

		constructor(v: SceneObjectMgr) {
			super(v, () => { return new gamecomponent.object.MapInfoLogObject() });

		}

		//当对象更新发生时
		protected onUpdate(flags: number, mask: UpdateMask, strmask: UpdateMask): void {
			super.onUpdate(flags, mask, strmask);
			let isNew = flags & core.obj.OBJ_OPT_NEW;
			if (isNew || mask.GetBit(MapField.MAP_INT_BATTLE_INDEX)) {
				this._sceneObjectMgr.event(ShuiguojiMapInfo.EVENT_BATTLE_CHECK);
			}
			if (isNew || mask.GetBit(MapField.MAP_INT_MAP_BYTE1)) {
				this._sceneObjectMgr.event(ShuiguojiMapInfo.EVENT_STATUS_CONTINUE);
			}
			if (isNew || mask.GetBit(MapField.MAP_INT_COUNT_DOWN)) {
				this._sceneObjectMgr.event(ShuiguojiMapInfo.EVENT_COUNT_DOWN);
			}
			if (isNew || strmask.GetBit(MapField.MAP_STR_GAME_NO)) {
				this._sceneObjectMgr.event(ShuiguojiMapInfo.EVENT_GAME_NO);
			}
			if (isNew || strmask.GetBit(MapField.MAP_STR_GAME_RECORD)) {
				this._sceneObjectMgr.event(ShuiguojiMapInfo.EVENT_GAME_RECORD);
			}
			if (isNew || strmask.GetBit(MapField.MAP_INT_JACKPOT)) {
				this._sceneObjectMgr.event(ShuiguojiMapInfo.EVENT_JACKET_UPDATE);
			}

		}

		public getBattleInfoToString(): string {
			let playerArr: any[] = this._battleInfoMgr.users;
			if (!playerArr) return "";
			let selfSeat: number = -1;
			for (let i: number = 0; i < playerArr.length; i++) {
				let player = playerArr[i];
				if (player && this._sceneObjectMgr.mainPlayer.GetAccount() == player.account) {
					//找到自己了
					selfSeat = i + 1;
					break;
				}
			}
			if (selfSeat == -1) return "";
			let infoArr: gamecomponent.object.BattleInfoBase[] = this._battleInfoMgr.info;
			if (!infoArr) return "";

			let totalStr: string = "";
			let betArr: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			let betStrArr: string[] = [];
			let lotteryStr: string = "";
			let winStrArr: string[] = [];
			let jacketStrArr: string[] = [];
			let settleStr: string = "";
			for (let i: number = 0; i < infoArr.length; i++) {
				let info = infoArr[i];
				if (info.SeatIndex == selfSeat) {
					//自己的战斗日志
					if (info instanceof gamecomponent.object.BattleInfoAreaBet) {
						//下注信息
						betArr[info.BetIndex - 1] += info.BetVal;
					} else if (info instanceof gamecomponent.object.BattleInfoSettle) {
						//结算
						settleStr = info.SettleVal > 0 ? "+" + EnumToString.getPointBackNum(info.SettleVal, 2) : "" + EnumToString.getPointBackNum(info.SettleVal, 2);
					}

				} else if (info instanceof gamecomponent.object.BattleInfoSGJ) {
					//开奖信息
					lotteryStr = LOTTERY_NAME[info.prizeType - 1];
					if (info.prizeType == Web_operation_fields.GAME_CARD_BIG_TYPE_SGJ_CDX) {
						//猜大小
						winStrArr.push((info.prizeContent[0].money > 7 ? "大" : "小") + "(" + info.prizeContent[0].money + ")");
					} else {
						for (let j: number = 0; j < info.prizeContent.length; j++) {
							if (info.prizeType == Web_operation_fields.GAME_CARD_BIG_TYPE_SGJ_XYJ && j == 0) {
								continue;
							}
							let obj: any = info.prizeContent[j];
							winStrArr.push(FIRUT_NAME[obj.type - 1]);
						}
						//奖池信息
						for (let j: number = 0; j < info.jacketContent.length; j++) {
							let obj: any = info.jacketContent[j];
							jacketStrArr.push(FIRUT_NAME[obj.type - 1] + "(+" + obj.money + ")");
						}

						//特殊处理
						if (info.prizeType == Web_operation_fields.GAME_CARD_BIG_TYPE_SGJ_PT) {
							lotteryStr = winStrArr[0];
						}
						if (info.jacketContent.length > 0) {
							lotteryStr = "JACKPOT";
						}
					}
					//开奖信息都出来了，就不再继续找了
					break;
				}

			}

			for (let i: number = 0; i < betArr.length; i++) {
				if (betArr[i] > 0) {
					betStrArr.push(BET_NAME[i] + "(" + betArr[i] + ")");
				}
			}

			//开奖信息
			totalStr += "开　　奖：|" + lotteryStr + "#";
			//中奖信息
			totalStr += this.getBattleStrByArr(winStrArr, "中　　奖：", 5);
			//下注信息
			totalStr += this.getBattleStrByArr(betStrArr, "玩家下注：", 4);
			//奖池信息
			if (jacketStrArr.length > 0) totalStr += this.getBattleStrByArr(jacketStrArr, "奖池盈利：", 4);
			//结算信息
			totalStr += "玩家盈利：|" + settleStr;

			return totalStr;
		}

		private getBattleStrByArr(arr: string[], title: string, num: number = 3): string {
			let str: string = "";
			let len: number = Math.ceil(arr.length / num);
			for (let i: number = 0; i < len; i++) {
				if (i == 0) {
					str += title + "|";
				} else {
					str += "   |";
				}
				for (let j: number = 0; j < num; j++) {
					let index: number = i * num + j;
					if (index < arr.length) {
						str += arr[index] + " , ";
					}
				}
				str = str.substr(0, str.length - 3);
				str += "#";
			}
			return str;
		}
	}
}