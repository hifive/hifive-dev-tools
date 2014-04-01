/**
 * SearchLogic
 *
 * @class
 * @name SearchLogic
 */

(function() {
	/**
	 * @class youtube.controller.ScreenController
	 */
	var screenController = {
		/**
		 * @memberOf youtube.controller.ScreenController
		 */
		__name: 'youtube.controller.ScreenController',

		/**
		 * プレイヤーオブジェクト
		 */
		_player: null,

		/**
		 * プレイヤーオブジェクトを設定する
		 *
		 * @memberOf youtube.controller.ScreenController
		 * @param player プレイヤーオブジェクト
		 */
		setPlayer: function(player) {
			this._player = player;
		},

		/**
		 * 動画情報を表示
		 *
		 * @memberOf youtube.controller.ScreenController
		 * @param entry
		 */
		update: function(entry) {
			// 動画情報を更新
			this.view.update(this.$find('.videoInfo'), 'videoInfo', entry);
		},

		/**
		 * 動画情報をクリア
		 *
		 * @memberOf youtube.controller.ScreenController
		 */
		clear: function(entry) {
			// 動画情報を更新
			this.$find('.videoInfo').html('');
		},

		/**
		 * idから動画を取得して再生
		 *
		 * @memberOf youtube.controller.ScreenController
		 */
		loadById: function(id) {
			// 現在表示中の動画情報をクリア
			this.clear();
			// idの動画を取得して再生
			this._player.loadVideoById(id);
		},

		/**
		 * 再生
		 *
		 * @memberOf youtube.controller.ScreenController
		 * @param id
		 */
		play: function(id) {
			this._player.playVideo();
		},
		/**
		 * 一時停止
		 */
		pause: function() {
			this._player.pauseVideo();
		},

		/**
		 * 停止
		 */
		stop: function() {
			this._player.stopVideo();
		},

		/**
		 * 頭出し
		 */
		cue: function() {
			this._player.seekTo(0, true);
		},

		/**
		 * 巻き戻し
		 */
		backword: function() {
			this._player.seekTo(this._player.getCurrentTime() - 15, true);
		},

		/**
		 * 早送り
		 */
		forward: function() {
			this._player.seekTo(this._player.getCurrentTime() + 15, true);
		}
	};

	h5.core.expose(screenController);
})();