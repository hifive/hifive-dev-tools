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
	 * @class youtube.controller.PlaybackController
	 */
	var playbackController = {
		/**
		 * @memberOf youtube.controller.PlaybackController
		 */
		__name: 'youtube.controller.PlaybackController',

		/**
		 * @memberOf youtube.controller.PlaybackController
		 */
		__ready: function() {
			// ブロックする要素を追加
			// 操作パネルは初期状態は使用不可能にする
			var $block = $('<div>');
			var $root = $(this.rootElement);
			$block.addClass('h5-indicator a overlay');
			var height = $root.height();
			$block.css({
				height: height,
				position: 'relative',
				top: -height
			});
			$root.append($block);
		},

		/**
		 * プレイヤーの状態が変化した時に親から呼ばれるメソッド
		 *
		 * @memberOf youtube.controller.PlaybackController
		 * @param state
		 */
		update: function(state) {
			// プレイヤーの準備が終わって初めて呼ばれる
			// プレイヤーの準備が終わったら操作パネルを使用可能にする
			this.$find('.overlay').css('display', 'none');
			switch (state) {
			case 1:
				// 再生中
				// 再生ボタンを非表示にして一時停止ボタンを表示する
				this.$find('.play').addClass('hidden');
				this.$find('.pause').removeClass('hidden');
				break;
			case -1: // 未開始・停止
			case 2: // 一時停止中
				// 再生ボタンを表示して一時停止ボタンを非表示にする
				this.$find('.play').removeClass('hidden');
				this.$find('.pause').addClass('hidden');
				break;
			default:
				// その他、バッファリング中、頭出し済み、終了状態があるが、何もしない
			}
		},

		/**
		 * 再生ボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.play click': function() {
			this.trigger('play');
		},

		/**
		 * 一時停止ボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.pause click': function() {
			this.trigger('pause');
		},

		/**
		 * 停止ボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.stop click': function() {
			this.trigger('stop');
		},

		/**
		 * 頭出しボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.cue click': function() {
			this.trigger('cue');
		},

		/**
		 * 巻き戻しボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.backword click': function() {
			this.trigger('backword');
		},

		/**
		 * 早送りボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.forward click': function() {
			this.trigger('forward');
		},

		/**
		 * お気に入り登録ボタンクリック
		 *
		 * @memberOf youtube.controller.PlaybackController
		 */
		'.registFav click': function() {
			this.trigger('registFav');
		}
	};

	h5.core.expose(playbackController);
})();