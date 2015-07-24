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

			// ---------------
			// diagイベント名
			// ---------------
			/** diagイベント名 コントローラバインド時 */
			DIAG_EVENT_CONTROLLER_BOUND: 'controllerBound',
			/** diagイベント名 コントローラアンバインド時 */
			DIAG_EVENT_CONTROLLER_UNBOUND: 'controllerUnbound',
			/** diagイベント名 ロジック化時 */
			DIAG_EVENT_LOGIC_BOUND: 'logicBound',
			/** diagイベント名 メソッド実行直前 */
			DIAG_EVENT_BEFORE_METHOD_INVOKE: 'beforeMethodInvoke',
			/** diagイベント名 メソッド実行直後 */
			DIAG_EVENT_AFTER_METHOD_INVOKE: 'afterMethodInvoke',
			/** diagイベント名 非同期メソッド完了時 */
			DIAG_EVENT_ASYNC_METHOD_COMPLETE: 'asyncMethodComplete',
			/** diagイベント名 ログ出力時 */
			DIAG_EVENT_LOG: 'log',
			/** diagイベント名 エラー発生時 */
			DIAG_EVENT_ERROR: 'error'
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