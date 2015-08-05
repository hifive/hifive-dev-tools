/*
 * Copyright (C) 2013-2015 NS Solutions Corporation
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
 * hifive Developer Tool
 */
(function() {
	// =============================
	// Expose to window
	// =============================
	h5.u.obj.expose('h5devtool', {
		consts: {
			/** DvelopperToolのバージョン */
			H5_DEV_TOOL_VERSION: '{version}',

			/** postMessageで使用するオリジン */
			TARGET_ORIGIN: location.href.split('/').slice(0, 3).join('/'),

			// ---------------
			// メソッドタイプ
			// ---------------
			METHOD_TYPE_LIFECYCLE: 'lifecycle',
			METHOD_TYPE_EVENT_HANDLER: 'eventhandler',
			METHOD_TYPE_PUBLIC: 'public',
			METHOD_TYPE_PRIVATE: 'private',

			CONTROLLER_LIFECYCLE_METHODS: ['__construct', '__init', '__ready', '__unbind',
					'__dispose'],
			LOGIC_LIFECYCLE_METHODS: ['__construct', '__ready'],

			// ---------------------
			// ポストメッセージのイベントタイプ名
			// ---------------------
			/** オーバレイの設定(子→親) */
			POST_MSG_TYPE_SET_OVERLAY: 'setOverlay',
			/** イベントハンドラターゲットの取得 */
			POST_MSG_TYPE_GET_EVENT_HANDLER_TARGETS: 'getEventhandlerTargets',
			/** イベントハンドラターゲットの取得完了通知 */
			POST_MSG_TYPE_SET_EVENT_HANDLER_TARGETS: 'setEventhandlerTargets',
			/** イベントハンドラの実行 */
			POST_MSG_TYPE_GET_EXECUTE_EVENT_HANDLER: 'executeEventhandler',

			/** コントローラバインド時 */
			POST_MSG_TYPE_DIAG_CONTROLLER_BOUND: 'controllerBound',
			/** コントローラアンバインド時 */
			POST_MSG_TYPE_DIAG_CONTROLLER_UNBOUND: 'controllerUnbound',
			/** ロジック化時 */
			POST_MSG_TYPE_DIAG_LOGIC_BOUND: 'logicBound',
			/** メソッド実行直前 */
			POST_MSG_TYPE_DIAG_BEFORE_METHOD_INVOKE: 'beforeMethodInvoke',
			/** メソッド実行直後 */
			POST_MSG_TYPE_DIAG_AFTER_METHOD_INVOKE: 'afterMethodInvoke',
			/** 非同期メソッド完了時 */
			POST_MSG_TYPE_DIAG_ASYNC_METHOD_COMPLETE: 'asyncMethodComplete',
			/** ログ出力時 */
			POST_MSG_TYPE_DIAG_LOG: 'log',
			/** エラー発生時 */
			POST_MSG_TYPE_DIAG_ERROR: 'error'
		},
		util: {
			/**
			 * イベントリスナをネイティブでバインド
			 *
			 * @param {Object} target addEventlisterたはatacheEvent
			 * @param {String} event イベント名
			 * @param {Function} listener イベントリスナ
			 */
			bindListener: function bindListener(target, event, listener) {
				// targetが別ウィンドウオブジェクトの場合、以下の問題があるためネイティブでバインドする必要がある
				// # jQuery1系でIEの場合、unload時にjQueryがjQueryキャッシュを削除しようとする。
				// # win.jQuery111012331231のようなオブジェクトをdeleteで消そうとしていて、
				// # IEの場合はwindowオブジェクトに対してdeleteできないのでエラーになる。
				// # windowの場合はdeleteを使用しないようになっているが、別windowの場合はdeleteが使われてしまう。
				if (target.addEventListener) {
					target.addEventListener(event, listener);
				} else {
					target.attachEvent('on' + event, listener);
				}
			},
			/**
			 * コントローラまたはロジックがすでにdisposeされているかどうかを判定する
			 *
			 * @param {Controller|Logic} target
			 * @returns {Boolean}
			 */
			isDisposed: function(target) {
				// コントローラとロジック共通で見たいので__nameがあるかどうかでチェックしている
				return !target.__name;
			}
		}
	});
})();