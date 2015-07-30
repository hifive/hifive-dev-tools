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
(function() {
	// 必要なモジュールが無い場合は読み込み中止
	if (!window.h5 || !h5.diag) {
		// hifive自体がロードされていない、またはdiagモジュールがロードされていないならロードを中止する
		throw new Error('ディベロッパツールに必要なモジュールがロードされていません。diagモジュールを持つhifiveをロードする必要があります');
		return;
	}

	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	// =============================
	// Production
	// =============================
	/** DvelopperToolのバージョン */
	var H5_DEV_TOOL_VERSION = '{version}';
	/** 子ロジック判定用のsuffix */
	var SUFFIX_LOGIC = 'Logic';
	/** postMessageで使用するオリジン */
	var TARGET_ORIGIN = h5devtool.consts.TARGET_ORIGIN;
	/** オーバレイのボーダーの幅 */
	var OVERLAY_BORDER_WIDTH = 3;
	// ---------------
	// メソッドタイプ
	// ---------------
	/** ライフサイクル */
	var METHOD_TYPE_LIFECYCLE = h5devtool.consts.METHOD_TYPE_LIFECYCLE;
	/** イベントハンドラ */
	var METHOD_TYPE_EVENT_HANDLER = h5devtool.consts.METHOD_TYPE_EVENT_HANDLER;
	/** パブリック */
	var METHOD_TYPE_PUBLIC = h5devtool.consts.METHOD_TYPE_PUBLIC;
	/** プライベート */
	var METHOD_TYPE_PRIVATE = h5devtool.consts.METHOD_TYPE_PRIVATE;
	/** コントローラライフサイクルメソッド */
	var CONTROLLER_LIFECYCLE_METHODS = h5devtool.consts.CONTROLLER_LIFECYCLE_METHODS;
	/** ロジックライフサイクルメソッド */
	var LOGIC_LIFECYCLE_METHODS = h5devtool.consts.LOGIC_LIFECYCLE_METHODS;

	// ---------------------
	// ポストメッセージのイベントタイプ名
	// ---------------------
	/** オーバレイの設定(子→親) */
	var POST_MSG_TYPE_SET_OVERLAY = h5devtool.consts.POST_MSG_TYPE_SET_OVERLAY;
	/** イベントハンドラターゲットの取得 */
	var POST_MSG_TYPE_GET_EVENT_HANDLER_TARGETS = h5devtool.consts.POST_MSG_TYPE_GET_EVENT_HANDLER_TARGETS;
	/** イベントハンドラターゲットの取得完了通知 */
	var POST_MSG_TYPE_SET_EVENT_HANDLER_TARGETS = h5devtool.consts.POST_MSG_TYPE_SET_EVENT_HANDLER_TARGETS;
	/** イベントハンドラの実行 */
	var POST_MSG_TYPE_GET_EXECUTE_EVENT_HANDLER = h5devtool.consts.POST_MSG_TYPE_GET_EXECUTE_EVENT_HANDLER;

	// diagイベントタイプ
	/** コントローラバインド時 */
	var POST_MSG_TYPE_DIAG_CONTROLLER_BOUND = h5devtool.consts.POST_MSG_TYPE_DIAG_CONTROLLER_BOUND;
	/** コントローラアンバインド時 */
	var POST_MSG_TYPE_DIAG_CONTROLLER_UNBOUND = h5devtool.consts.POST_MSG_TYPE_DIAG_CONTROLLER_UNBOUND;
	/** ロジック化時 */
	var POST_MSG_TYPE_DIAG_LOGIC_BOUND = h5devtool.consts.POST_MSG_TYPE_DIAG_LOGIC_BOUND;
	/** メソッド実行直前 */
	var POST_MSG_TYPE_DIAG_BEFORE_METHOD_INVOKE = h5devtool.consts.POST_MSG_TYPE_DIAG_BEFORE_METHOD_INVOKE;
	/** メソッド実行直後 */
	var POST_MSG_TYPE_DIAG_AFTER_METHOD_INVOKE = h5devtool.consts.POST_MSG_TYPE_DIAG_AFTER_METHOD_INVOKE;
	/** 非同期メソッド完了時 */
	var POST_MSG_TYPE_DIAG_ASYNC_METHOD_COMPLETE = h5devtool.consts.POST_MSG_TYPE_DIAG_ASYNC_METHOD_COMPLETE;
	/** ログ出力時 */
	var POST_MSG_TYPE_DIAG_LOG = h5devtool.consts.POST_MSG_TYPE_DIAG_LOG;
	/** エラー発生時 */
	var POST_MSG_TYPE_DIAG_ERROR = h5devtool.consts.POST_MSG_TYPE_DIAG_ERROR;

	/**
	 * スタイル定義
	 */
	var STYLE_ORG_PAGE = [{
		selector: '.h5devtool-overlay, .h5devtool-overlay *',
		rule: {
			position: 'absolute',
			zIndex: 10000,
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box'
		}
	}, {
		selector: '.h5devtool-overlay .body',
		rule: {
			height: '100%',
			width: '100%',
			opacity: '0.2',
			filter: 'alpha(opacity=20)',
			backgroundColor: 'rgb(64, 214, 255)'
		}
	}, {
		selector: '.h5devtool-overlay.eventHandlerOverlay .body',
		rule: {
			backgroundColor: 'rgb(128,255,198)'
		}
	}, {
		selector: '.h5devtool-overlay .border',
		rule: {
			opacity: '0.3',
			filter: 'alpha(opacity=30)',
			position: 'absolute',
			borderTopWidth: '3px',
			borderLeftWidth: '3px',
			borderBottomWidth: 0,
			borderRightWidth: 0,
			borderColor: 'rgb(64, 214, 255)'
		}
	}, {
		selector: '.h5devtool-overlay .border',
		rule: {
			borderStyle: 'dashed'
		}
	}, {
		selector: '.h5devtool-overlay.rootController .border',
		rule: {
			borderStyle: 'solid'
		}
	}, {
		selector: '.h5devtool-overlay.eventHandlerOverlay .border',
		rule: {
			borderStyle: 'dashed',
			borderColor: 'rgb(128,255,198)'
		}
	}, {
		selector: '.h5devtool-overlay.selectedOverlay .body',
		rule: {
			display: 'none'
		}
	}, {
		selector: '.h5devtool-overlay.selectedOverlay',
		rule: {
			height: '0!important',
			width: '0!important'
		}
	}];
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
	var bindListener = h5devtool.util.bindListener;

	// =========================================================================
	//
	// Privates
	//
	// =========================================================================
	// =============================
	// Variables
	// =============================
	/**
	 * devtoolウィンドウオブジェクト
	 */
	var devtoolWindow = null;

	/**
	 * アスペクトのかかった関数のtoString()結果を取得する。アスペクトが掛かっているかどうかの判定で使用する。
	 */
	var aspectFunctionStr = null;

	/**
	 * idとディベロッパツールコンテキストのマップ
	 * <p>
	 * インスタンス化時にインスタンスにidを振る
	 * </p>
	 */
	var devtoolContextMap = {};

	/**
	 * インスタンスid採番用シーケンス
	 */
	var instanceIdSeq = h5.core.data.createSequence();

	/**
	 * プロミスid採番用シーケンス
	 */
	var promiseIdSeq = h5.core.data.createSequence();

	/**
	 * devtoolで使用するビュー
	 *
	 * @type {View}
	 */
	var devtoolView = h5.core.view.createView();

	/**
	 * 現在表示中のオーバレイ管理オブジェクト
	 */
	var currentOverlay = {};

	/**
	 * 現在選択中のイベントハンドラターゲット
	 */
	currentSelectedEventHandlerTargets = null;

	// =============================
	// Functions
	// =============================
	/**
	 * h5scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param {String} str 文字列
	 * @returns {String} エスケープ済文字列
	 */
	function escapeRegex(str) {
		return str.replace(/\W/g, '\\$&');
	}

	/**
	 * h5scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param {String|RegExp} target 値
	 * @returns {RegExp} オブジェクト
	 */
	function getRegex(target) {
		if ($.type(target) === 'regexp') {
			return target;
		}
		var str = '';
		if (target.indexOf('*') !== -1) {
			var array = $.map(target.split('*'), function(n) {
				return escapeRegex(n);
			});
			str = array.join('.*');
		} else {
			str = target;
		}
		return new RegExp('^' + str + '$');
	}

	/**
	 * h5scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param {Any} obj
	 * @returns {Boolean}
	 */
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

	/**
	 * h5.core.__compileAspectsから流用
	 *
	 * @param {Object|Object[]} aspects アスペクト設定
	 */
	function compileAspects(aspects) {
		var compile = function(asp) {
			if (asp.target) {
				asp.compiledTarget = getRegex(asp.target);
			}
			if (asp.pointCut) {
				asp.compiledPointCut = getRegex(asp.pointCut);
			}
			return asp;
		};
		h5.settings.aspects = $.map($.isArray(aspects) ? aspects : [aspects], function(n) {
			return compile(n);
		});
	}

	/**
	 * 関数を文字列化
	 *
	 * @param {Function} f
	 * @returns {string}
	 */
	function funcToStr(f) {
		if (!f) {
			return '' + f;
		}
		var str = f.toString();
		// タブが余分にあった場合は取り除く
		// フォーマットされている前提で、末尾の"}"の前にあるタブの数だけ他の行からも取り除く
		var match = str.match(/(\t+)\}$/);
		var tabs = match && match[1];
		if (tabs) {
			return str.replace(new RegExp('\n' + tabs, 'g'), '\n');
		}
		return str;
	}

	/**
	 * キャメルケースからハイフン区切りに変換する
	 *
	 * @param {String} str
	 * @returns 引数をハイフン区切りにした文字列
	 */
	function hyphenate(str) {
		return str.replace(/[A-Z]/g, function(s) {
			return '-' + s.toLowerCase();
		});
	}

	/**
	 * スタイルの設定
	 *
	 * @param styleDef
	 */
	function setCSS(styleDefs) {
		var style = document.createElement('style');
		$(style).addClass('h5devtool-style');
		document.getElementsByTagName('head')[0].appendChild(style);
		var sheet = document.styleSheets[document.styleSheets.length - 1];
		if (sheet.insertRule) {
			for (var i = 0, l = styleDefs.length; i < l; i++) {
				var def = styleDefs[i];
				var selector = def.selector;
				var rule = def.rule;
				var cssStr = selector + '{';
				for ( var p in rule) {
					var key = hyphenate(p);
					var val = rule[p];
					if ($.isArray(val)) {
						// マルチブラウザ対応で、同じキーに配列で値が設定されていた場合は全てcssStrに含める
						for (var j = 0, len = val.length; j < len; j++) {
							cssStr += key + ':' + val[j] + ';';
						}
					} else {
						cssStr += key + ':' + val + ';';
					}
				}
				cssStr += '}';
				sheet.insertRule(cssStr, sheet.cssRules.length);
			}
		} else {
			// カンマを含むセレクタがaddRuleで使用できるかどうか
			// (IE7-ならaddRuleでカンマを含むセレクタは使用できない)
			var isSupportCommmaSelector = !h5.env.ua.isIE || h5.env.ua.browserVersion > 7;
			for (var i = 0, l = styleDefs.length; i < l; i++) {
				var def = styleDefs[i];
				var selector = def.selector;
				var rule = def.rule;
				for ( var p in rule) {
					var key = hyphenate(p);
					var val = rule[p];
					if (isSupportCommmaSelector) {
						sheet.addRule(selector, key + ':' + val);
					} else {
						var selectors = selector.split(',');
						for (var j = 0, len = selectors.length; j < len; j++) {
							if ($.isArray(val)) {
								// マルチブラウザ対応で、同じキーに配列で値が設定されていた場合は全てaddRuleする
								for (var k = 0, len = val.length; k < len; k++) {
									sheet.addRule(selectors[j], key + ':' + val[k]);
								}
							} else {
								sheet.addRule(selectors[j], key + ':' + val);
							}
						}
					}
				}
			}
		}
	}

	/**
	 * コントローラまたはロジックがすでにdisposeされているかどうかを判定する
	 *
	 * @param {Controller|Logic} target
	 * @returns {Boolean}
	 */
	function isDisposed(target) {
		// コントローラとロジック共通で見たいので__nameがあるかどうかでチェックしている
		return !target.__name;
	}

	/**
	 * DOM要素を"div#id.cls1.cls2"の形式の文字列に変換
	 *
	 * @param {DOM|window|document} elm
	 * @returns {string}
	 */
	function stringifyElement(elm) {
		if (elm === window) {
			return 'window';
		} else if (elm.nodeType === 9) {
			return 'document';
		} else if (!elm.nodeType) {
			// ただのオブジェクトの場合など
			return elm.toString();
		}
		var tagName = elm.tagName;
		var id = elm.id;
		var cls = elm.className;
		return tagName.toLowerCase() + (id && '#' + id) + (cls && '.' + cls.replace(/\s/g, '.'));
	}

	/**
	 * ディベロッパウィンドウを開く
	 *
	 * @returns ディベロッパウィンドウが開くまで待機するpromiseオブジェクト
	 */
	function openDevtoolWindow() {
		var dfd = h5.async.deferred();
		var body = null;
		var w = null;
		// urlはwindow.__h5_devtool_pageに設定されたページ
		// window.__h5_devtool_pageが未設定の場合はh5-dev-tool.jsと同じディレクトリにあるh5-dev-tool.htmlを読み込む
		var url = window.__h5_devtool_page
				|| $('script[src$=h5-dev-tool.js]').attr('src').replace('h5-dev-tool.js',
						'h5-dev-tool.html');
		if (!url) {
			// urlが未指定でかつh5-dev-tool.jsのスクリプト要素が見つからない場合はエラー
			throw new Error(
					'ディベロッパウィンドウのパスが取得できませんでした。h5-dev-tool.htmlのwindow.__h5_h5devtool_pageに設定してください');
		}
		// ウィンドウ名はランダムにして、devtool(devtoolを読み込んだページ)を複数開けるようにしている
		w = window.open(url, '__h5devtool__' + new Date().getTime() + '_'
				+ parseInt(Math.random() * 1000),
				'resizable=1, menubar=no, width=910, height=700, toolbar=no, scrollbars=yes');
		if (!w) {
			// ポップアップがブロックされた場合
			return dfd.reject('block').promise();
		}
		if (w._h5devtool) {
			// 既に開いているものがあったら、それを閉じて別のものを開く
			w.close();
			return openDevtoolWindow();
		}
		try {
			// IEで、すでにディベロッパウィンドウが開かれているとき、そのディベロッパウィンドウのプロパティ_h5devtoolはundefinedになっている。
			// そのため、ディベロッパウィンドウが開かれているかどうかはdocumentオブジェクトにアクセスしたときにエラーが出るかで確認する
			// (戻り値を使用していないのでClosureCompileで警告が出ますが、問題ありません。)
			w.document;
		} catch (e) {
			w.close();
			return openDevtoolWindow();
		}

		function setupWindow() {
			w._h5devtool = true;

			body = w.document.body;
			$(body).addClass('h5devtool');
			$(w.document.getElementsByTagName('html')).addClass('h5devtoolHTML');

			// タイトルの設定
			w.document.title = h5.u.str.format('[devtool]{0} - hifive Developer Tool ver.{1}',
					window.document.title, H5_DEV_TOOL_VERSION);
		}


		// IE11の場合、非同期でウィンドウが開くことがある
		// openしたwindowの状態はスクリプトの実行中に変化することがある
		// (= else節を抜けた瞬間にcompleteになることもあり得る)
		// ので、イベントハンドラではなくsetIntervalで設定する
		if (w.document && w.document.readyState === 'complete') {
			setupWindow();
			dfd.resolve(w);
		} else {
			var timer = null;
			timer = setInterval(function() {
				if (w.document && w.document.readyState === 'complete') {
					clearInterval(timer);
					setupWindow();
					dfd.resolve(w);
				}
			}, 100);
		}
		return dfd.promise();
	}

	/**
	 * コントローラ及びロジックのIDを取得
	 *
	 * @private
	 * @param {Controller|Logic} instance
	 * @returns {string} id
	 */
	function getInstanceId(instance) {
		var context = instance.__controllerContext || instance.__logicContext;
		return context.devtoolId;
	}
	/**
	 * コントローラ及びロジックインスタンスからdevtoolコンテキストを取得
	 *
	 * @private
	 * @param {Controller|Logic} instance
	 * @returns {Object}
	 */
	function getDevtoolContextByInstance(instance) {
		return devtoolContextMap[getInstanceId(instance)];
	}

	/**
	 * コントローラ及びロジックのインスタンスをdevtoolの管理下に置く
	 *
	 * @private
	 * @param {Controller|Logic} instance
	 */
	function manageInstance(instance) {
		if (getInstanceId(instance)) {
			// 既にIDが振ってあったら何もしない
			return;
		}
		var isLogic = instance.__logicContext;
		var context = isLogic ? instance.__logicContext : instance.__controllerContext;
		var id = instanceIdSeq.next();
		context.devtoolId = id;
		var devtoolContext = devtoolContextMap[id] = {};
		var defObj = isLogic ? context.logicDef : context.controllerDef;
		var methodMap = {};
		devtoolContext.methodMap = methodMap;
		for ( var p in defObj) {
			var val = defObj[p];
			if (isFunction(val)) {
				// メソッドの列挙
				var methodObj = {};
				methodObj.count = 0;
				methodObj.str = funcToStr(val);
				var methodType;
				if (isLogic && $.inArray(p, LOGIC_LIFECYCLE_METHODS) !== -1 || !isLogic
						&& $.inArray(p, CONTROLLER_LIFECYCLE_METHODS) !== -1) {
					methodType = METHOD_TYPE_LIFECYCLE;
				} else if (!isLogic && p.indexOf(' ') !== -1) {
					methodType = METHOD_TYPE_EVENT_HANDLER;
				} else if (p[0] === '_') {
					// ライフサイクルでもイベントハンドラでもない場合はprivateかpublicの判定
					methodType = METHOD_TYPE_PRIVATE;
				} else {
					methodType = METHOD_TYPE_PUBLIC;
				}
				methodObj.methodType = methodType;
				methodMap[p] = methodObj;
				continue;
			}
		}
		devtoolContext.name = instance.__name;
		devtoolContext.instance = instance;
		devtoolContext.isRoot = context.isRoot;
		if (!isLogic) {
			devtoolContext.templates = instance.__templates;
		}
	}

	/**
	 * コントローラ及びロジックのインスタンスをdevtoolの管理下から外す
	 *
	 * @private
	 * @param {Controller|Logic} instance
	 */
	function unmanageInstance(instance) {
		var id = getInstanceId(instance);
		delete devttoolContextMap[id];
		var ctx = instance.__controllerContext || instance.__logicContext;
		delete ctx.devtooId;
	}

	/**
	 * タイムスタンプ生成
	 *
	 * @returns {number}
	 */
	function getTimeStamp() {
		return new Date().getTime();
	}

	/**
	 * 引数の概要表示を作成
	 *
	 * @param {Arguments} arg
	 * @returns {string}
	 */
	function createArgOutline(arg) {
		var args = h5.u.obj.argsToArray(arg);
		var outlineArray = [];
		for (var i = 0, l = args.length; i < l; i++) {
			var a = args[i];
			switch (typeof a) {
			case 'string':
				outlineArray.push("'" + a + "'");
				break;
			case 'number':
			case 'boolean':
				outlineArray.push(a);
				break;
			case 'function':
				outlineArray.push('[Function]');
				break;
			case 'object':
				if (a === null || a === undefined || a instanceof RegExp) {
					outlineArray.push(a);
				} else if ($.isArray(a)) {
					outlineArray.push('[Array]');
				} else {
					outlineArray.push('[Object]');
				}
			}
		}
		return outlineArray.join(',');
	}

	/**
	 * 引数が非同期オブジェクト(PromiseまたはDeferred)かどうか判定
	 *
	 * @param {Any} arg
	 * @returns {boolean}
	 */
	function isAsync(arg) {
		return !!(arg && isFunction(arg.done) && isFunction(arg.fail));
	}

	/**
	 * ロジックのプロパティが自分自身の子ロジックであるかどうかを返します。
	 *
	 * @private
	 * @param {Object} logic ロジックまたはコントローラ(コントローラを指定した時は、そのコントローラが持つロジックかどうかを返す)
	 * @param {String} prop プロパティ名
	 * @returns {Boolean} ロジックのプロパティが第1引数のロジックの子ロジックかどうか(true=子ロジックである)
	 */
	function isChildLogic(logic, prop) {
		// hasOwnPropertyがtrueで、"Logic"で終わっているプロパティ名のものは子ロジック。ロジック化の対象になる。
		return logic.hasOwnProperty(prop) && h5.u.str.endsWith(prop, SUFFIX_LOGIC);
	}

	// -------------------------------------------------
	// h5.core.logicでロジックインスタンスが作成された時の通知
	// -------------------------------------------------
	/**
	 * ロジックがバインドされたことを通知
	 *
	 * @private
	 * @param {Logic} logic
	 * @param {Controller|Logic} parent
	 * @param {Controller} root
	 */
	function dispatchLogicBound(logic, parent, root) {
		// TODO manageChild/unmanageChildでルートが変わった時は未対応
		root = root || logic;
		manageInstance(logic);
		var devtoolCtx = getDevtoolContextByInstance(logic);
		var isRoot = logic === root;
		var id = getInstanceId(logic);
		var message = {
			type: POST_MSG_TYPE_DIAG_LOGIC_BOUND,
			name: devtoolCtx.name,
			instanceId: id,
			parentId: parent ? getInstanceId(parent) : null,
			isRoot: isRoot,
			isControllerLogic: !!root.__controllerContext,
			rootId: getInstanceId(root),
			methodMap: devtoolCtx.methodMap,
			timeStamp: getTimeStamp()
		};
		h5.diag.dispatch(message);
		// 子ロジックについて探索
		for ( var p in logic) {
			if (isChildLogic(logic, p)) {
				dispatchLogicBound(logic[p], logic, root);
			}
		}
	}
	// -------------------------------------------------
	// コントローラ化された時の通知
	// -------------------------------------------------

	/**
	 * コントローラがバインドされたことを通知
	 *
	 * @private
	 * @param {Controller} controller
	 * @param {Controller} parent
	 * @param {Controller} root
	 */
	function dispatchControllerBound(controller, parent, root) {
		// TODO manageChild/unmanageChildで親及びルートが変わった時は未対応
		root = root || controller;
		manageInstance(controller);
		var devtoolCtx = getDevtoolContextByInstance(controller);
		// ルートエレメントを設定
		devtoolCtx.rootElement = stringifyElement(controller.rootElement);
		var id = getInstanceId(controller);

		// テンプレートパス
		var templates = controller.__templates || [];
		templates = $.isArray(templates) ? templates : [];

		// このコントローラビューに登録されているテンプレートの列挙
		var registedTemplates = [];
		for ( var p in controller.view.__view.__cachedTemplates) {
			if ($.inArray(p, registedTemplates) === -1) {
				registedTemplates.push(p);
			}
		}
		// コントローラで有効なすべてのテンプレート
		var availableTemplates = [];
		var ctrl = controller;
		var v = ctrl.view.__view;
		while (true) {
			for ( var p in v.__cachedTemplates) {
				if ($.inArray(p, availableTemplates) === -1) {
					availableTemplates.push(p);
				}
			}
			if (v === h5.core.view) {
				break;
			}
			if (ctrl.parentController) {
				ctrl = ctrl.parentController;
				v = ctrl.view.__view;
			} else {
				v = h5.core.view;
			}
		}

		// メッセージオブジェクトの送信
		var message = {
			type: POST_MSG_TYPE_DIAG_CONTROLLER_BOUND,
			name: devtoolCtx.name,
			instanceId: id,
			rootElement: devtoolCtx.rootElement,
			parentId: parent ? getInstanceId(parent) : null,
			isRoot: devtoolCtx.isRoot,
			rootId: getInstanceId(root),
			methodMap: devtoolCtx.methodMap,
			templates: templates,
			registedTemplates: registedTemplates,
			availableTemplates: availableTemplates,
			timeStamp: getTimeStamp()
		};
		h5.diag.dispatch(message);

		// 子コントローラについて探索
		var cache = controller.__controllerContext.cache;
		var controllerProps = cache.childControllerProperties;
		for (var i = 0, l = controllerProps.length; i < l; i++) {
			dispatchControllerBound(controller[controllerProps[i]], controller, root);
		}
		// 子ロジックについて探索
		var logicProps = cache.logicProperties;
		for (var i = 0, l = logicProps.length; i < l; i++) {
			dispatchLogicBound(controller[logicProps[i]], controller, root);
		}
	}

	/**
	 * コントローラのunbindを通知
	 *
	 * @private
	 * @param {Controller} controller
	 */
	function dispatchControllerUnbound(controller) {
		var ctx = controller.__controlelrContext;
		var id = getInstanceId(controller);
		var message = {
			type: POST_MSG_TYPE_DIAG_CONTROLLER_UNBOUND,
			name: controller.__name,
			instanceId: id,
			timeStamp: getTimeStamp()
		};
		h5.diag.dispatch(message);
		// 子コントローラについて探索
		var controllerProps = ctx.cache.chilcControllerProperties;
		for (var i = 0, l = controllerProps.length; i < l; i++) {
			dispatchControllerUnbound(controller[controllerProps[i]]);
		}
		unmanageInstance(controller);
	}

	/**
	 * h5.core.controller.jsから流用(ただし別ウィンドウは考慮していない)
	 *
	 * @private
	 * @param {String} selector セレクタ
	 * @param {Controller} [controller] セレクタがthis.で始まっているときにコントローラの持つオブジェクトをターゲットにする
	 * @returns {Object|String} パスで指定されたオブジェクト、もしくは未変換の文字列
	 */
	function getGlobalSelectorTarget(selector, controller) {
		if (controller && selector === 'rootElement') {
			return controller.rootElement;
		}
		var specialObj = ['window', 'document', 'navigator'];
		for (var i = 0, len = specialObj.length; i < len; i++) {
			var s = specialObj[i];
			if (selector === s || h5.u.str.startsWith(selector, s + '.')) {
				//特殊オブジェクトそのものを指定された場合またはwindow. などドット区切りで続いている場合
				return h5.u.obj.getByPath(selector);
			}
		}
		// selectorが'this.'で始まっていて、かつcontrollerが指定されている場合はコントローラから取得する
		var controllerObjectPrefix = 'this.';
		if (controller && h5.u.str.startsWith(selector, controllerObjectPrefix)) {
			return h5.u.obj.getByPath(selector.slice(controllerObjectPrefix.length), controller);
		}
		return selector;
	}

	/**
	 * コントローラのイベントハンドラのメソッド名から対象になる要素を取得
	 *
	 * @private
	 * @param {String} key
	 * @param {Controller} controller
	 * @returns {jQuery} イベントハンドラの対象になる要素
	 */
	function getTargetFromEventHandlerMethodName(controller, methodName) {
		var $rootElement = $(controller.rootElement);
		var lastIndex = methodName.lastIndexOf(' ');
		var selector = $.trim(methodName.substring(0, lastIndex));
		var isGlobalSelector = !!selector.match(/^\{.*\}$/);
		if (isGlobalSelector) {
			selector = $.trim(selector.substring(1, selector.length - 1));
			if (selector === 'rootElement') {
				return $rootElement;
			}
			return $(getGlobalSelectorTarget(selector));

		}
		return $rootElement.find(selector);
	}

	/**
	 * オーバレイを表示
	 *
	 * @private
	 */
	function showOverlay($target, overlayType, additionalClass, instanceId) {
		$('.h5devtool-overlay.' + overlayType).remove();
		$target.each(function() {
			var $overlay = $(devtoolView.get('overlay', {
				clsName: overlayType + (additionalClass ? additionalClass : '')
			}));
			var width, height;
			try {
				width = $(this).outerWidth();
				height = $(this).outerHeight();
			} catch (e) {
				// dom要素で無い場合は取得できないので、オーバレイは表示しない
				return;
			}
			// documentオブジェクトならoffset取得できないので、0,0にする
			var offset = $(this).offset() || {
				top: 0,
				left: 0
			};
			$overlay.css({
				width: width,
				height: height,
				top: offset.top,
				left: offset.left
			});
			var $borderTop = $overlay.find('.border.top');
			var $borderRight = $overlay.find('.border.right');
			var $borderBottom = $overlay.find('.border.bottom');
			var $borderLeft = $overlay.find('.border.left');

			$borderTop.css({
				top: 0,
				left: 0,
				width: width,
				height: OVERLAY_BORDER_WIDTH
			});
			$borderRight.css({
				top: 0,
				left: width,
				width: OVERLAY_BORDER_WIDTH,
				height: height
			});
			$borderBottom.css({
				top: height,
				left: 0,
				width: width,
				height: OVERLAY_BORDER_WIDTH
			});
			$borderLeft.css({
				top: 0,
				left: 0,
				width: OVERLAY_BORDER_WIDTH,
				height: height
			});

			$(document.body).append($overlay);
		});
	}

	/**
	 * オーバレイを削除
	 *
	 * @private
	 * @param {string} overlayType
	 * @param {Object} instanceId
	 */
	function removeOverlay(overlayType, instanceId) {
		// instanceIdが指定されていない場合はすべて削除
		if (!instanceId) {
			if (!overlayType) {
				$('.h5devtool-overlay').remove();
			} else {
				$('.h5devtool-overlay.' + overlayType).remove();
			}
			return;
		}
		$('.h5devtool-overlay.' + overlayType + '[data-instance-id="' + instanceId + '"]').remove();
	}

	/**
	 * オーバレイを設定
	 *
	 * @private
	 * @param {Object} arg
	 */
	function setOverlay(arg) {
		if (!arg) {
			// 全てのオーバレイを削除
			removeOverlay();
			currentOverlay = {};
			return;
		}
		var overlayTypes = ['controllerOverlay', 'selectedOverlay', 'eventHandlerOverlay'];
		for (var i = 0, l = overlayTypes.length; i < l; i++) {
			var overlayType = overlayTypes[i];
			var isEventHandler = overlayType === 'eventHandlerOverlay';
			if (currentOverlay[overlayType] === arg[overlayType]
					&& (!isEventHandler || currentOverlay.methodName === arg.methodName)) {
				// 変更無しの場合は何もしない
				continue;
			}
			var instanceId = arg[overlayType];
			if (!instanceId) {
				// 指定されていない場合は削除
				removeOverlay(overlayType);
				continue;
			}

			var devCtx = devtoolContextMap[instanceId];
			var instance = devCtx && devCtx.instance;
			if (!instance) {
				// 指定されたインスタンスが管理下にない(unbindされた)場合はオーバレイを削除
				removeOverlay(overlayType, instanceId);
				continue;
			}
			var additionalClass = '';
			var methodName = null;
			var $target = null;
			if (isEventHandler) {
				// イベントハンドラの場合はイベントハンドラのターゲットになっている要素を取得
				methodName = arg.methodName;
				$target = getTargetFromEventHandlerMethodName(instance, methodName);
			} else {
				$target = $(instance.rootElement);
				if (!isEventHandler && devCtx.isRoot) {
					// ルートならルートコントローラクラスも追加
					additionalClass += ' rootController';
				}
			}
			showOverlay($target, overlayType, additionalClass, instanceId, methodName);
		}
		currentOverlay = arg;
	}

	// =========================================================================
	//
	// Body
	//
	// =========================================================================
	// ログを出力する
	var devtoolLogger = h5.log.createLogger('hifive Developer Tool');
	devtoolLogger.info('hifive Developer Tool(ver.{0})の読み込みが完了しました。', H5_DEV_TOOL_VERSION);

	// オーバレイのビューを登録
	devtoolView
			.register(
					'overlay',
					'<div class="h5devtool-overlay [%= clsName %]"><div class="body"></div><div class="border top"></div><div class="border right"></div><div class="border bottom"></div><div class="border left"></div></div>');


	// -------------------------------------------------
	// ディベロッパツールウィンドウからメッセージを受け取る
	// -------------------------------------------------
	window.addEventListener('message', function(event) {
		if (event.origin !== TARGET_ORIGIN) {
			// オリジンが違う場合はreturn
			return;
		}
		var message = h5.u.obj.deserialize(event.data);
		switch (message.type) {
		case POST_MSG_TYPE_SET_OVERLAY:
			setOverlay(message.arg);
			break;
		case POST_MSG_TYPE_GET_EVENT_HANDLER_TARGETS:
			var arg = message.arg;
			var instanceId = arg.instanceId;
			var methodName = arg.methodName;
			var devCtx = devtoolContextMap[instanceId];
			var controller = devCtx && devCtx.instance;
			if (!controller) {
				// 指定されたインスタンスが管理下にない(unbindされた)場合は何もしない
				return;
			}
			var $targets = getTargetFromEventHandlerMethodName(controller, methodName);
			// 実行するときのために覚えておく
			currentSelectedEventHandlerTargets = {
				instanceId: instanceId,
				methodName: methodName,
				$targets: $targets
			};
			var eventHandlerTargets = [];
			$targets.each(function() {
				eventHandlerTargets.push(stringifyElement(this));
			});
			var message = {
				type: POST_MSG_TYPE_SET_EVENT_HANDLER_TARGETS,
				arg: {
					eventHandlerTargets: eventHandlerTargets
				}
			}
			devtoolWindow.postMessage(h5.u.obj.serialize(message), TARGET_ORIGIN);
			break;
		case POST_MSG_TYPE_GET_EXECUTE_EVENT_HANDLER:
			var arg = message.arg;
			var instanceId = arg.instanceId;
			var methodName = arg.methodName;
			if (currentSelectedEventHandlerTargets.instanceId === instanceId
					&& currentSelectedEventHandlerTargets.methodName === methodName) {
				// 指定されたイベントハンドラが前回取得したイベントハンドラターゲットのものであれば実行
				var $target = currentSelectedEventHandlerTargets.$targets.eq(arg.targetIndex);
				var eventName = $.trim(methodName.substring(methodName.lastIndexOf(' '),
						methodName.length));
				// triggerでイベントハンドラを実行
				$target.trigger(eventName);
			}
			break;
		}
	}, false);

	// -------------------------------------------------
	// ディベロッパツールウィンドウを開く
	// -------------------------------------------------
	openDevtoolWindow().done(function(w) {
		devtoolWindow = w;

		// ディベロッパツールウィンドウが閉じられたときのハンドラを追加
		function unloadFunc() {
		// オーバレイを削除
		// TODO

		// diagに登録したハンドラの削除
		// TODO

		}
		// unloadFuncのバインドを行う
		bindListener(w, 'unload', unloadFunc);

		// 親ウィンドウが閉じた時(または遷移した時)にディベロッパツールウィンドウを閉じる。
		// IEの場合、明示的にclose()を呼ばないと遷移先でwindow.open()した時に新しく開かずに閉じていないディベロッパツールウィンドウが取得されてしまうため。
		bindListener(window, 'unload', function() {
			w.close();
		});
	}).fail(function(reason) {
		// ポップアップブロックされると失敗する
		// アラートをだして何もしない
		if (reason === 'block') {
			alert('[hifive Developer Tool]\n別ウィンドウのオープンに失敗しました。ポップアップブロックを設定している場合は一時的に解除してください。');
		}
	});

	// -------------------------------------------------
	// スタイルの設定
	// -------------------------------------------------
	setCSS(STYLE_ORG_PAGE);

	// -------------------------------------------------
	// ログ出力の通知
	// -------------------------------------------------
	h5.settings.log = {
		target: {
			view: {
				type: {
					log: function(obj) {
						h5.diag.dispatch({
							type: POST_MSG_TYPE_DIAG_LOG,
							level: obj.level,
							levelString: obj.levelString,
							message: h5.u.str.format.apply(h5.u.str, obj.args),
							timeStamp: getTimeStamp()
						});
					}
				}
			}
		},
		out: [{
			category: '*',
			targets: ['view']
		}]
	};
	h5.log.configure();

	// -------------------------------------------------
	// ロジック化時の通知
	// -------------------------------------------------
	// h5.core.logicをフック
	var orgH5CoreLogic = h5.core.logic;
	h5.core.logic = function(logicDef) {
		var logic = orgH5CoreLogic(logicDef);
		dispatchLogicBound(logic);
		return logic;
	};

	// -------------------------------------------------
	// コントローラのバインドを通知
	// -------------------------------------------------
	// h5controllerboundを拾ってdiagにメッセージを送る
	$(document).bind('h5controllerbound', function(context, instance) {
		// すでにdispose済みだったら何もしない
		if (isDisposed(instance)) {
			return;
		}
		manageInstance(instance);
		// ルートエレメントを設定
		dispatchControllerBound(instance);
	});

	// -------------------------------------------------
	// コントローラのアンバインドを通知
	// -------------------------------------------------
	$(document).bind('h5controllerunbound', function(context, instance) {
		// すでにdispose済みだったら何もしない
		if (isDisposed(instance)) {
			return;
		}
		dispatchControllerUnbound(instance);
	});

	// -------------------------------------------------
	// エラー発生を通知
	// -------------------------------------------------
	$(window).bind('error', function(ev) {
		var orgEvent = ev.originalEvent;
		h5.diag.dispatch({
			type: POST_MSG_TYPE_DIAG_ERROR,
			levelString: 'EXCEPTION',
			level: 50, // エラーと同じレベル
			message: orgEvent.message,
			file: orgEvent.fileName || '',
			lineno: orgEvent.lineno || '',
			timeStamp: getTimeStamp()
		});
	});

	// -------------------------------------------------
	// アスペクトを設定してメソッド実行の通知
	// -------------------------------------------------
	var diagAspect = {
		target: '*',
		interceptors: h5.u.createInterceptor(function(invocation, data) {
			var target = invocation.target;
			if (isDisposed(target)) {
				// またはdisposeされたコントローラ、ロジックのメソッドなら何もしない
				return invocation.proceed();
			}

			// h5controllerbound前なら、devtoolContextが作成されていないので、このタイミングで設定する
			// (設定済みなら何もされない)
			manageInstance(target);
			var id = getInstanceId(target);
			var devtoolContext = getDevtoolContextByInstance(target);
			var name = devtoolContext.name;

			// 関数名を取得
			var fName = invocation.funcName;

			// メソッドの呼び出し回数をカウント
			var methodObj = devtoolContext.methodMap[fName];
			var methodCount = ++methodObj.count;
			var methodType = methodObj.methodType;

			// 引数の概要
			var argOutline = createArgOutline(invocation.args);

			// メソッド呼び出しをdiagに通知
			var beforeMessage = {
				type: POST_MSG_TYPE_DIAG_BEFORE_METHOD_INVOKE,
				name: name,
				method: fName,
				methodType: methodType,
				instanceId: id,
				arg: argOutline,
				count: methodCount,
				timeStamp: getTimeStamp()
			};
			h5.diag.dispatch(beforeMessage);

			var ret = invocation.proceed();

			// 呼び出し終了を通知
			var isPromise = isAsync(ret);
			var afterMessage = {
				type: POST_MSG_TYPE_DIAG_AFTER_METHOD_INVOKE,
				name: name,
				method: fName,
				methodType: methodType,
				instanceId: id,
				arg: argOutline,
				count: methodCount,
				timeStamp: getTimeStamp(),
				isPromise: isPromise
			};
			if (isPromise) {
				// プロミスにIDを振る
				var promiseId = promiseIdSeq.next();
				afterMessage.promiseId = promiseId;
				// dataに非同期メソッド完了通知用オブジェクトを持たせる
				data.asyncMethodCompleteMessage = {
					type: POST_MSG_TYPE_DIAG_ASYNC_METHOD_COMPLETE,
					promiseId: promiseId,
					timeStamp: getTimeStamp()
				};
			}
			// メソッド呼び出し終了の通知
			h5.diag.dispatch(afterMessage);
			return ret;
		}, function(invocation, data) {
			// メソッド呼び出し終了通知は完了しているので、ここでは非同期メソッドが完了したことの通知を行う
			var asyncMethodCompleteMessage = data.asyncMethodCompleteMessage;
			if (!asyncMethodCompleteMessage) {
				return;
			}
			asyncMethodCompleteMessage.state = invocation.result.state();
			h5.diag.dispatch(asyncMethodCompleteMessage);
		}),
		pointCut: '*'
	};
	compileAspects(diagAspect);
	h5.settings.aspects = [diagAspect];

	// -------------------------------------------------
	// diagモジュールに関数の登録
	// -------------------------------------------------
	var preMessages = [];
	function postDiagMessage(message) {
		if (!devtoolWindow || !devtoolWindow.h5devtool
				|| !devtoolWindow.h5devtool.messageListenerAdded) {
			// devtoolウィンドウのpostMessageのリスナが登録されるまで待機する
			if (message) {
				preMessages.push(message);
			}
			setTimeout(function() {
				postDiagMessage();
			}, 100);
			return;
		}
		// devtoolウィンドウが準備できる前のメッセージがあればそれを先に送る
		if (preMessages) {
			for (var i = 0, l = preMessages.length; i < l; i++) {
				devtoolWindow.postMessage(h5.u.obj.serialize(preMessages[i]), TARGET_ORIGIN);
			}
			preMessages = null;
		}
		if (message) {
			devtoolWindow.postMessage(h5.u.obj.serialize(message), TARGET_ORIGIN);
		}
	}
	var addHandlerTargetDiagEvents = [POST_MSG_TYPE_DIAG_CONTROLLER_BOUND,
			POST_MSG_TYPE_DIAG_CONTROLLER_UNBOUND, POST_MSG_TYPE_DIAG_LOGIC_BOUND,
			POST_MSG_TYPE_DIAG_BEFORE_METHOD_INVOKE, POST_MSG_TYPE_DIAG_AFTER_METHOD_INVOKE,
			POST_MSG_TYPE_DIAG_ASYNC_METHOD_COMPLETE, POST_MSG_TYPE_DIAG_LOG,
			POST_MSG_TYPE_DIAG_ERROR];
	for (var i = 0, l = addHandlerTargetDiagEvents.length; i < l; i++) {
		h5.diag.addHandler(addHandlerTargetDiagEvents[i], postDiagMessage);
	}

	// =============================
	// Expose to window
	// =============================

})();
