/*
 * Copyright (C) 2012-2014 NS Solutions Corporation
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
 * hifive
 */

/* ------ h5.diag ------ */
(function() {
	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	// =============================
	// Production
	// =============================

	// =============================
	// Development Only
	// =============================

	/* del begin */

	/* del end */

	// =========================================================================
	//
	// Cache
	//
	// =========================================================================
	// =========================================================================
	//
	// Privates
	//
	// =========================================================================
	// =============================
	// Variables
	// =============================
	// =============================
	// Functions
	// =============================
	// -------------  h5scopeglobalsから流用 -------------
	var isFunction = (function() {
		// Android3以下、iOS4以下は正規表現をtypeofで判定すると"function"を返す
		// それらのブラウザでは、toStringを使って判定する
		if (typeof new RegExp() === 'function') {
			var toStringObj = Object.prototype.toString;
			return function(obj) {
				return toStringObj.call(obj) === '[object Function]';
			};
		}
		// 正規表現のtypeofが"function"にならないブラウザなら、typeofがfunctionなら関数と判定する
		return function(obj) {
			return typeof obj === 'function';
		};
	})();

	var handlerMap = {};


	// =========================================================================
	//
	// Body
	//
	// =========================================================================
	function addHandler(type, handler) {
		if ($.inArray(handler, handlerMap[type]) !== -1 || !isFunction(handler)) {
			// 同じハンドラは登録しない
			// 関数でなければ登録しない
			return;
		}
		handlerMap[type] = handlerMap[type] || [];
		handlerMap[type].push(handler);
	}

	function removeHandler(type, handler) {
		var handlers = handlerMap[type];
		if (!handlers) {
			return;
		}
		var index = $.inArray(handler, handlers);
		if (index === -1) {
			return;
		}
		handlers.splice(index, 1);
	}

	function dispatch(event) {
		var handlers = handlerMap[event.type];
		if (!handlers) {
			return;
		}
		// ハンドラ実行中にaddHandler/removeHandlerされても、この時点で登録されているハンドラを実行する
		handlers = handlers.slice(0);

		// ハンドラを実行
		for (var i = 0, l = handlers.length; i < l; i++) {
			handlers[i].call(event.target, event);
		}
	}

	// =============================
	// Expose to window
	// =============================
	h5.u.obj.expose('h5.diag', {
		addHandler: addHandler,
		removeHandler: removeHandler,
		dispatch: dispatch
	});
})();
