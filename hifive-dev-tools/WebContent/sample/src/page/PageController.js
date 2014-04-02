/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function() {
	/**
	 * @class youtube.controller.PageController
	 */
	var pageController = {
		/**
		 * @memberOf youtube.controller.PageController
		 */
		__name: 'youtube.controller.PageController',

		/**
		 * 使用するテンプレート
		 *
		 * @memberOf youtube.controller.PageController
		 */
		__templates: 'template/youtube.ejs',

		/**
		 * ロジック
		 *
		 * @memberOf youtube.controller.PageController
		 */
		pageLogic: youtube.logic.PageLogic,

		/**
		 * プレイヤーの操作や動画タイトル、詳細を表示するコントローラ
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_screenController: youtube.controller.ScreenController,

		/**
		 * 動画検索を行うコントローラ
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_searchController: youtube.controller.SearchController,

		/**
		 * プレイヤーの操作パネルについてのコントローラ
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_playbackController: youtube.controller.PlaybackController,

		/**
		 * お気に入りリストについてのコントローラ
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_favoriteController: youtube.controller.FavoriteController,

		/**
		 * 動画のコメントについてのコントローラ
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_commentController: youtube.controller.CommentController,


		/**
		 * @memberOf youtube.controller.PageController
		 */
		__meta: {
			_screenController: {
				rootElement: '.screen'
			},
			_playbackController: {
				rootElement: '.controll'
			},
			_favoriteController: {
				rootElement: '.favorite'
			},
			_commentController: {
				rootElement: '.comment'
			}
		},

		/**
		 * プレイヤーオブジェクト取得についてのdeferredオブジェクト
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_playerLoadDfd: h5.async.deferred(),

		/**
		 * 現在再生中のビデオID
		 *
		 * @memberOf youtube.controller.PageController
		 */
		_currentVideoId: null,

		/**
		 * @memberOf youtube.controller.PageController
		 */
		__ready: function() {
			// インジケータを表示
			this.indicator({
				message: 'プレイヤー準備中',
				promises: this._playerLoadDfd.promise()
			}).show();
		},

		/**
		 * Youtubeのプレイヤーの準備ができたときに呼ばれるイベント
		 *
		 * @memberOf youtube.controller.PageController
		 * @param {Object} context
		 * @param {Object} context.evArg.player プレイヤーオブジェクト
		 */
		'{rootElement} playerReady': function(context) {
			var player = context.evArg.player;
			// スクリーンコントローラにプレイヤーオブジェクトをセット
			this._screenController.setPlayer(player);
			// プレイヤーのロードまちのdeferredをresolve
			this._playerLoadDfd.resolve();
		},

		/**
		 * 動画のロードが要求されたときに呼ばれるイベント。
		 * <p>
		 * idを引数にとる
		 * </p>
		 *
		 * @memberOf youtube.controller.PageController
		 * @param {Object} context
		 * @param {String} context.evArg.id 動画id
		 */
		'{rootElement} loadById': function(context) {
			// 動画ID
			var id = context.evArg.id;
			// コメントをクリア
			this._commentController.clear();
			// 動画を再生
			this._screenController.loadById(id);
		},

		/**
		 * プレイヤーの状態が変わった時に呼ばれるイベント
		 *
		 * @memberOf youtube.controller.PageController
		 * @param context
		 * @param {Object} context.evArg.player プレーヤーオブジェクト
		 * @param {Integer} context.evArg.state プレーヤーの状態
		 */
		'{rootElement} stateChange': function(context) {
			var state = context.evArg.state;
			// コントロール部品を更新
			this._playbackController.update(state);

			if (state === 1) {
				// 再生状態になった場合
				var player = context.evArg.player;
				var id = player.getVideoData().video_id;
				if (id === this._currentVideoId) {
					// 現在再生中のものと変わらないなら何もしない
					return;
				}
				this._currentVideoId = id;
				// 動画の詳細情報を取得
				this.pageLogic.loadEntry(id).done(this.own(function(entry) {
					// コメントを更新
					this._commentController.update(entry);
					// 動画情報を表示
					this._screenController.update(entry);
				}));
			}
		},

		/**
		 * 再生中の動画の再生
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} play': function() {
			this._screenController.play();
		},

		/**
		 * 動画の一時停止
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} pause': function() {
			this._screenController.pause();
		},

		/**
		 * 再生中の動画の停止
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} stop': function() {
			this._screenController.stop();
		},

		/**
		 * 再生中の動画の頭出し
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} cue': function() {
			this._screenController.cue();
		},

		/**
		 * 再生中の動画の巻き戻し
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} backword': function() {
			this._screenController.backword();
		},

		/**
		 * 再生中の動画の早送り
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} forward': function() {
			this._screenController.forward();
		},

		/**
		 * 再生中の動画をお気に入りに登録
		 *
		 * @memberOf youtube.controller.PageController
		 */
		'{rootElement} registFav': function() {
			this.pageLogic.getEntry().done(this.own(function(entry) {
				this._favoriteController.favorite(entry);
			}));
		}
	};

	h5.core.expose(pageController);
})();