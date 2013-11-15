/*
 * Copyright (C) 2013 NS Solutions Corporation
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
	// =========================================================================
	//
	// Cache
	//
	// =========================================================================

	// =========================================================================
	//
	// Settings
	//
	// =========================================================================
	/**
	 * window.openで開くかどうか。 <br>
	 * window.openで開く場合はtrue、ページ上に表示するならfalse
	 */
	var useWindowOpen = h5.env.ua.isDesktop;
	//	useWindowOpen = true;
	//	useWindowOpen = false;

	// =========================================================================
	//
	// Constants
	//
	// =========================================================================
	var OLD_IE_BLANK_URL = 'blankForOldIE.html';
	var LOG_INDENT_WIDTH = 10;
	// ログ出力の遅延時間(ms)
	var LOG_DELAY = 100;
	// ログ出力の最大遅延時間(ms)
	var MAX_LOG_DELAY = 500;

	var LIFECYCLE_METHODS = ['__construct', '__init', '__ready', '__unbind', '__dispose'];

	/**
	 * デバッグツールのスタイル
	 */
	var H5DEBUG_STYLE = [{
		selector: '.h5debug',
		rule: {
			backgroundColor: 'rgba(255,255,255,0.8)', // iframe版を考慮して背景に透過指定
			height: '100%',
			width: '100%',
			margin: 0,
			padding: 0,
			zIndex: 20000
		}
	}, {
		selector: '.h5debugHTML', // IE8-用にHTML要素にもスタイルを当てる
		rule: {
			height: '100%',
			width: '100%',
			margin: 0,
			padding: 0
		}
	}, {
		selector: '.h5debug.posfix',
		rule: {
			position: 'fixed',
			top: 0,
			left: 0
		}
	}, {
		selector: '.h5debug .debug-tab',
		rule: {
			height: '100%'
		}
	}, {
		selector: '.h5debug-upper-right',
		rule: {
			position: 'fixed',
			zIndex: 20001,
			top: 0,
			left: '810px',
			width: '100px',
			textAlign: 'right'
		}
	}, {
		selector: '.h5debug .liststyle-none',
		rule: {
			listStyle: 'none'
		}
	}, {
		selector: '.h5debug .no-padding',
		rule: {
			padding: '0!important'
		}
	},
	/*
	 * 動作ログ
	 */
	{
		selector: '.h5debug .operation-log',
		rule: {
			paddingLeft: 0,
			margin: 0,
			height: '100%',
			paddingBottom: '49px',
			overflow: 'visible!important',
			boxSizing: 'border-box',
			'-moz-boxSizing': 'border-box'
		}
	}, {
		selector: '.h5debug .operation-log .fixedControlls',
		rule: {
			paddingLeft: 0,
			margin: 0,
			backgroundColor: '#fff',
			border: 'solid 1px gray',
			padding: '3px'

		}
	}, {
		selector: '.h5debug .operation-log .fixedControlls input.filter[disabled]',
		rule: {
			backgroundColor: '#fff',
			fontWeight: 'bold'
		}
	}, {
		selector: '.h5debug .operation-log-list',
		rule: {
			paddingLeft: 0,
			margin: 0,
			height: '100%',
			color: 'gray',
			whiteSpace: 'nowrap',
			overflow: 'auto'
		}
	}, {
		selector: '.h5debug .operation-log-list>li .time',
		rule: {
			marginRight: '1em'
		}
	}, {
		selector: '.h5debug .operation-log-list>li .tag',
		rule: {
			display: 'inline-block',
			minWidth: '3em'
		}
	}, {
		selector: '.h5debug .operation-log-list>li .promiseState',
		rule: {
			display: 'inline-block',
			marginRight: '0.5em'
		}
	}, {
		selector: '.h5debug .operation-log-list>li .message.lifecycle',
		rule: {
			color: '#2EB3EE'
		}
	}, {
		selector: '.h5debug .operation-log-list .message.event',
		rule: {
			color: '#008348'
		}
	}, {
		selector: '.h5debug .operation-log-list>li .message.private',
		rule: {
			color: '#B2532E'
		}
	}, {
		selector: '.h5debug .operation-log-list>li .message.public',
		rule: {
			color: '#006B89'
		}
	},
	/*
	 * コンソールログ
	 */
	{
		selector: '.h5debug .console-log p',
		rule: {
			margin: '4px 0 0 2px',
			borderTop: '1px solid #eee',
			fontSize: '12px'
		}
	}, {
		selector: '.h5debug .console-log p.TRACE',
		rule: {
			color: '#000000'
		}
	}, {
		selector: '.h5debug .console-log p.DEBUG',
		rule: {
			color: '#0000ff'
		}
	}, {
		selector: '.h5debug .console-log p.INFO',
		rule: {
			color: '#000000'
		}
	}, {
		selector: '.h5debug .console-log p.WARN',
		rule: {
			color: '#0000ff'
		}
	}, {
		selector: '.h5debug .console-log p.ERROR',
		rule: {
			color: '#ff0000'
		}
	},
	/*
	 * カラムレイアウトをコンテンツに持つタブコンテンツのラッパー
	 * 各カラムでスクロールできればいいので、外側はoverflow:hidden
	 */
	{
		selector: '.h5debug .columnLayoutWrapper',
		rule: {
			overflow: 'hidden!important'
		}
	},
	/*
	 * コントローラのデバッグ
	 */{
		selector: '.h5debug .debug-controller .controll',
		rule: {
			paddingLeft: '30px'
		}
	},
	/*
	 * コントローラのデバッグ
	 */{
		selector: '.h5debug .debug-controller .controller-detail',
		rule: {
			height: '100%'
		}
	},
	/*
	 * コントローラ・ロジックリスト
	 */
	{
		selector: '.h5debug .debug-controller .targetlist',
		rule: {
			paddingTop: 0,
			paddingLeft: '1.2em',
			// IE7用
			'*paddingLeft': 0,
			'*position': 'relative',
			'*left': '-1.2em'
		}
	}, {
		selector: '.h5debug .debug-controller .targetlist .target-name',
		rule: {
			cursor: 'default'
		}
	}, {
		selector: '.h5debug .debug-controller .targetlist .target-name.selected',
		rule: {
			background: 'rgb(170,237,255)!important'
		}
	}, {
		selector: '.h5debug .debug-controller .targetlist .target-name:hover',
		rule: {
			background: 'rgb(220,247,254)'
		}
	},

	/*
	 * イベントハンドラ
	 */
	{
		selector: '.h5debug .debug-controller .eventHandler ul',
		rule: {
			listStyle: 'none',
			margin: 0
		}
	}, {
		selector: '.h5debug .debug-controller .eventHandler li.selected',
		rule: {
			background: 'rgb(203,254,231)'
		}
	},
	/*
	 * メソッドリスト
	 */
	{
		selector: '.h5debug .debug-controller .method ul',
		rule: {
			listStyle: 'none',
			margin: 0
		}
	},
	/*
	 * その他情報
	 */
	{
		selector: '.h5debug .debug-controller .otherInfo ul',
		rule: {
			margin: 0
		}
	}, {
		selector: '.h5debug pre',
		rule: {
			margin: '0 0 10px',
			padding: '4px',
			wordBreak: 'break-all',
			wordWrap: 'break-word',
			whiteSpace: 'pre',
			whiteSpace: 'pre-wrap',
			background: 'rgb(250,250,250)',
			border: '1px solid rgb(213,213,213)',
			'-webkit-border-radius': '4px',
			'-moz-border-radius': '4px',
			borderRadius: '4px',
			fontFamily: 'Monaco,Menlo,Consolas,"Courier New",monospace',
			fontSize: '12px'
		}
	}, {
		selector: '.h5debug .selected pre',
		rule: {
			backgroundColor: 'rgb(226,252,240)'
		}
	}, {
		selector: '.h5debug .debug-controller .detail',
		rule: {
			overflow: 'auto'
		}
	}, {
		selector: '.h5debug .ovfAuto',
		rule: {
			overflow: 'auto'
		}
	}, {
		selector: '.h5debug .ovfHidden',
		rule: {
			overflow: 'hidden'
		}
	}, {
		selector: '.h5debug .left',
		rule: {
			float: 'left',
			height: '100%',
			maxWidth: '350px',
			border: '1px solid #20B5FF',
			boxSizing: 'border-box',
			'-moz-box-sizing': 'border-box',
			'-ms-box-sizing': 'border-box',
			'-o-box-sizing': 'border-box',
			// IE7用
			'*position': 'absolute',
			'*height': 'auto',
			'*top': 0,
			'*left': 0,
			'*bottom': 0,
			'*width': '350px'
		}
	}, {
		selector: '.h5debug .right',
		rule: {
			height: '100%',
			border: '1px solid #20B5FF',
			borderLeft: 'none',
			boxSizing: 'border-box',
			'-moz-box-sizing': 'border-box',
			'-ms-box-sizing': 'border-box',
			'-o-box-sizing': 'border-box',
			// IE7用
			'*position': 'absolute',
			'*height': 'auto',
			'*width': 'auto',
			'*top': 0,
			'*left': '350px',
			'*right': 0,
			'*bottom': 0
		}
	}, {
		selector: '.h5debug .eventHandler .menu',
		rule: {
			display: 'none'
		}
	}, {
		selector: '.h5debug .eventHandler .menu>*',
		rule: {
			display: 'inline-block'
		}
	}, {
		selector: '.h5debug .eventHandler .selected .menu',
		rule: {
			display: 'inline-block'
		}
	},
	/*
	 * タブ
	 */
	{
		selector: '.h5debug ul.nav-tabs',
		rule: {
			listStyle: 'none',
			width: '100%',
			margin: 0,
			padding: 0,
			float: 'left'

		}
	}, {
		selector: '.h5debug ul.nav-tabs>li',
		rule: {
			float: 'left',
			padding: '3px',
			border: '1px solid #ccc',
			color: '#20B5FF',
			marginLeft: '-1px',
			cursor: 'pointer'
		}
	}, {
		selector: '.h5debug ul.nav-tabs>li.active',
		rule: {
			color: '#000',
			borderBottom: 'none'
		}
	}, {
		selector: '.h5debug .tab-content',
		rule: {
			marginTop: '-1px',
			width: '100%',
			height: '100%',
			paddingBottom: '30px',
			boxSizing: 'border-box',
			'-moz-box-sizing': 'border-box',
			'-ms-box-sizing': 'border-box',
			'-o-box-sizing': 'border-box',
			// IE7用
			'*position': 'absolute',
			'*height': 'auto',
			'*top': '26px',
			'*left': 0,
			'*bottom': 0,
			'*right': '20px',
			'*paddingBottom': 0,
			'*overflow-y': 'auto',
			'*overflow-x': 'hidden'
		}
	}, {
		selector: '.h5debug .tab-content>*',
		rule: {
			overflow: 'auto',
			float: 'left',
			height: 'inherit',
			width: '100%'
		}
	}, {
		selector: '.h5debug .tab-content>*',
		rule: {
			display: 'none'
		}
	}, {
		selector: '.h5debug .tab-content>.active',
		rule: {
			display: 'block'
		}
	}];

	var SPECIAL_H5DEBUG_STYLE = {
	//		IE: [{
	//			// スタイルの調整(IE用)
	//			// IEだと、親要素とそのさらに親要素がpadding指定されているとき、height:100%の要素を置くと親の親のpadding分が無視されている？
	//			// その分を調整する。
	//			selector: '.h5debug .tab-content .tab-content',
	//			rule: {
	////				paddingBottom: '60px'
	//			}
	//		}]
	};
	/**
	 * デバッグ対象になるページ側のスタイル
	 */
	var H5PAGE_STYLE = [{
		selector: '.h5debug-overlay',
		rule: {
			position: 'absolute',
			zIndex: 10000,
			boxSizing: 'border-box',
			'-moz-box-sizing': 'border-box',
			'-ms-box-sizing': 'border-box',
			'-o-box-sizing': 'border-box'
		}
	}, {
		selector: '.h5debug-overlay.root',
		rule: {
			background: 'rgb(64, 214, 255)',
			opacity: '0.4',
			filter: 'alpha(opacity=40)',
			border: '5px solid rgb(64, 214, 255)'
		}
	}, {
		selector: '.h5debug-overlay.child',
		rule: {
			background: 'rgb(170,237,255)',
			opacity: '0.4',
			filter: 'alpha(opacity=40)',
			border: '5px dashed rgb(170, 237, 255)'
		}
	}, {
		selector: '.h5debug-overlay.event-target',
		rule: {
			background: 'rgb(128,255,198)',
			opacity: '0.3',
			filter: 'alpha(opacity=30)',
			border: '5px solid rgb(128,255,198)'
		}
	}, {
		selector: '.h5debug-overlay.borderOnly',
		rule: {
			backgroundColor: 'transparent!important',
			opacity: 1
		}
	}];

	// =========================================================================
	//
	// Scoped Privates
	//
	// =========================================================================
	// =============================
	// View
	// =============================
	/**
	 * デバッグツールで使用するview
	 */
	var view = h5.core.view.createView();
	// モバイル、タブレット用のラッパー。
	view
			.register(
					'wrapper',
					'<div class="h5debug-upper-right"><div class="h5debug-controllBtn showhideBtn hideTool">↑</div><div class="h5debug-controllBtn opencloseBtn closeTool">×</div></div><div class="h5debug posfix" style="position:fix; left:0; top:0;"></div>');

	// ルートのタブ
	view.register('debug-tab', '<div class="debug-tab"><ul class="nav nav-tabs">'
			+ '<li class="active" data-tab-page="debug-controller">コントローラ</li>'
			+ '<li data-tab-page="operation-log">動作ログ</li>'
			+ '<li data-tab-page="console-log">コンソールログ</li>'
			+ '<li data-tab-page="settings">デバッガ設定</li>' + '</ul><div class="tab-content">'
			+ '<div class="active debug-controller columnLayoutWrapper"></div>'
			+ '<div class="operation-log whole"></div>' + '<div class="console-log"></div>'
			+ '<div class="settings"></div>' + '</div>');

	// --------------------- コントローラ --------------------- //
	// コントローラデバッグ画面
	view.register('controllerDebugWrapper',
			'<div class="left ovfAuto"></div><div class="right ovfHidden"></div>');

	// コントローラリストul
	view.register('target-list', '<ul class="targetlist"></ul>');

	// コントローラリストli
	view.register('target-list-part',
			'<li><span class="target-name [%= cls %]">[%= name %]</span></li>');

	// 詳細情報画面
	view.register('controller-detail',
			'<div class="detail controller-detail"><ul class="nav nav-tabs">'
					+ '<li class="active" data-tab-page="eventHandler">イベントハンドラ</li>'
					+ '<li data-tab-page="method">メソッド</li>'
					+ '<li data-tab-page="operation-log">ログ</li>'
					+ '<li data-tab-page="otherInfo">その他情報</li></ul><div class="tab-content">'
					+ '<div class="active eventHandler"></div>' + '<div class="method"></div>'
					+ '<div class="operation-log"></div>' + '<div class="otherInfo"></div></div>');

	// イベントハンドラリスト
	view
			.register(
					'eventHandler-list',
					'<ul class="liststyle-none no-padding">[% for(var i = 0, l = eventHandlers.length; i < l; i++){ var p = eventHandlers[i]; %]'
							+ '<li><span class="menu">ターゲット:<select class="eventTarget"></select><button class="trigger">実行</button></span><span class="key">[%= p %]</span><pre class="value">[%= _funcToStr(controller[p]) %]</pre></li>'
							+ '[% } %]</ul>');

	// メソッドリスト(コントローラ、ロジック、共通)
	view
			.register(
					'method-list',
					'<ul class="liststyle-none no-padding">[% for(var i = 0, l = methods.length; i < l; i++){ var p = methods[i];%]'
							+ '<li><span class="name">[%= p %]</span><pre class="value">[%= _funcToStr(defObj[p]) %]</pre></li>'
							+ '[% } %]</ul>');
	// その他情報
	view
			.register(
					'controller-otherInfo',
					'<dl><dt>名前</dt><dd>[%= controller.__name %]</dd>'
							+ '<dt> ルートコントローラか</dt><dd>[%= controller.__controllerContext.isRoot %]</dd>'
							+ '<dt>ルート要素</dt><dd>[%= _formatDOM(controller.rootElement)  %]</dd>'
							+ '<dt>ルートコントローラ</dt><dd>[%= controller.rootController.__name %]</dd>'
							+ '<dt>親コントローラ</dt><dd>[%= controller.parentController && controller.parentController.__name || "なし" %]</dd>'
							+ '<dt>子コントローラ一覧</dt><dd>[% if(!childControllerNames.length){ %]なし'
							+ '[% }else{ %]<ul class="no-padding">[% for(var i = 0, l = childControllerNames.length; i < l; i++){ %]<li>[%= childControllerNames[i] %]</li>[% } %]</ul>[% } %]</dd>'
							+ '<dt>テンプレートパス一覧</dt><dd>[% if(!controller.__templates){ %]なし'
							+ '[% }else{ %]<ul class="no-padding">[% var templates = typeof controller.__templates === "string"? [controller.__templates]: controller.__templates; '
							+ 'for(var i = 0, l = templates.length; i < l; i++){ %]<li>[%= templates[i] %]</li>[% } %]</ul>[% } %]</dd>'
							+ '<dt>有効なテンプレートID一覧</dt><dd>[% if(!$.isEmptyObject(controller.view.__view.__cachedTemplates)){ %]なし'
							+ '[% }else{ %]<ul class="no-padding">[% for(var p in controller.view.__view.__cachedTemplates){ %]<li>[%= p %]p</li>[% } %]</ul>[% } %]</dd>'
							+ '</dl>');

	// --------------------- ロジック --------------------- //

	// 詳細情報画面
	view.register('logic-detail', '<div class="detail logic-detail"><ul class="nav nav-tabs">'
			+ '<li class="active" data-tab-page="method">メソッド</li>'
			+ '<li data-tab-page="operation-log">ログ</li>'
			+ '<li data-tab-page="otherInfo">その他情報</li></ul><div class="tab-content">'
			+ '<div class="active method"></div>' + '<div class="operation-log"></div>'
			+ '<div class="otherInfo"></div></div>');

	// その他情報
	view.register('logic-otherInfo', '<dl><dt>名前</dt><dd>[%= defObj.__name %]</dd>'
			+ '<dt>ロジックインスタンスの名前</dt><dd>[%= instanceName %]</dd>' + '</dl>');

	// 動作ログ(コントローラ、ロジック、全体、で共通)
	view
			.register(
					'operation-log',
					'<div class="fixedControlls">'
							+ '<label><input type="checkbox" checked name="event"/>イベント</label>'
							+ '<label><input type="checkbox" checked name="public" />パブリック</label>'
							+ '<label><input type="checkbox" checked name="private" />プライベート</label>'
							+ '<label><input type="checkbox" checked name="lifecycle"/>ライフサイクル</label>'
							+ '<br>'
							+ '<input type="text" class="filter"/><button class="filter-show">絞込み</button><button class="filter-hide">除外</button><button class="filter-clear" disabled>フィルタ解除</button>'
							+ '</div>'
							+ '<ul class="operation-log-list liststyle-none no-padding" data-h5-loop-context="logs"></ul>');

	// 動作ログのli
	view.register('operation-log-list-part', '<li class=[%= cls %]>'
			+ '<span class="time">[%= time %]</span>'
			+ '<span style="margin-left:[%= indentWidth %]" class="tag">[%= tag %]</span>'
			+ '<span class="promiseState">[%= promiseState %]</span>'
			+ '<span class="message [%= cls %]">[%= message %]</span></li>');


	// オーバレイ
	view.register('overlay', '<div class="h5debug-overlay [%= cls %]"></div>');

	// --------------------- デバッガ設定 --------------------- //
	view
			.register(
					'settings',
					'<label for="h5debug-setting-LogMaxNum">ログの最大表示件数</label>'
							+ '<input type="text" id="h5debug-setting-LogMaxNum" data-h5-bind="attr(value):LogMaxNum" name="LogMaxNum"/><button class="set">設定</button>');
	// =============================
	// Variables
	// =============================
	/**
	 * デバッグするウィンドウ。window.openなら開いたウィンドウで、そうじゃなければページのwindowオブジェクト。
	 */
	var debugWindow = null;

	var h5debugSettings = h5.core.data.createObservableItem({
		LogMaxNum: {
			type: 'integer',
			defaultValue: 1000,
			constraint: {
				notNull: true,
				min: 0
			}
		}
	});

	/**
	 * タッチイベントがあるか
	 */
	var hasTouchEvent = document.ontouchstart !== undefined;

	/**
	 * ログ用のObservableArrayの配列
	 */
	var logArrays = [];

	/**
	 * コントローラ、ロジック、全体のログ
	 */
	var wholeOperationLogs = createLogArray();
	var wholeOperationLogsIndentLevel = 0;

	/**
	 * コンソール出力のログ
	 */
	var consoleLogs = createLogArray();

	/**
	 * アスペクトが掛かっていて元の関数が見えない時に代用する関数
	 */
	var DUMMY_NO_VISIBLE_FUNCTION = function() {
	// ダミー
	};

	/**
	 * コントローラがコントローラ定義オブジェクトを持つか(hifive1.1.9以降かどうか)
	 */
	var CONTROLLER_HAS_CONTROLLER_DEF = true;

	/**
	 * アスペクトのかかった関数のtoString()結果を取得する。アスペクトが掛かっているかどうかの判定で使用する。
	 */
	var ASPECT_FUNCTION_STR = '';
	var dummyAspect = {
		target: 'h5.debug.dummyController',
		pointCut: 'f',
		interceptors: DUMMY_NO_VISIBLE_FUNCTION
	};
	compileAspects(dummyAspect);
	h5.settings.aspects = [dummyAspect];
	h5.core.controller(document, {
		__name: 'h5.debug.dummyController',
		__construct: function() {
			// hifive1.1.8以前かどうか(controllerDefがあるか)を判定する
			CONTROLLER_HAS_CONTROLLER_DEF = !!this.__controllerContext.controllerDef;
		},
		f: function() {
		// この関数にアスペクトを掛けた時のtoString()結果を利用する
		}
	}).initPromise.done(function() {
		ASPECT_FUNCTION_STR = this.f.toString();
		this.dispose();
	});
	h5.settings.aspects = null;

	// =============================
	// Functions
	// =============================
	/**
	 * h5.scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param value 値
	 * @returns 配列化された値、ただし引数がnullまたはundefinedの場合はそのまま
	 */
	function wrapInArray(value) {
		if (value == null) {
			return value;
		}
		return $.isArray(value) ? value : [value];
	}
	/**
	 * h5.core.__compileAspectsからコピペ
	 *
	 * @param {Object|Object[]} aspects アスペクト設定
	 */
	function compileAspects(aspects) {
		var compile = function(aspect) {
			if (aspect.target) {
				aspect.compiledTarget = getRegex(aspect.target);
			}
			if (aspect.pointCut) {
				aspect.compiledPointCut = getRegex(aspect.pointCut);
			}
			return aspect;
		};
		h5.settings.aspects = $.map(wrapInArray(aspects), function(n) {
			return compile(n);
		});
	}
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
	 * h5.core.controller.jsからコピペ
	 */
	function getGlobalSelectorTarget(selector) {
		var specialObj = ['window', 'document', 'navigator'];
		for ( var i = 0, len = specialObj.length; i < len; i++) {
			var s = specialObj[i];
			if (selector === s) {
				// 特殊オブジェクトそのものを指定された場合
				return h5.u.obj.getByPath(selector);
			}
			if (h5.u.str.startsWith(selector, s + '.')) {
				// window. などドット区切りで続いている場合
				return h5.u.obj.getByPath(selector);
			}
		}
		return selector;
	}

	/**
	 * h5.debug.jsが設置されているフォルダを取得 (古いIEのためのblankページを取得するために必要)
	 */
	function getThiScriptPath() {
		var ret = '';
		$('script').each(function() {
			var match = this.src.match(/(^|.*\/)h5\.debug\.js$/);
			if (match) {
				ret = match[1];
				return false;
			}
		});
		return ret;
	}

	/**
	 * デバッグウィンドウを開く
	 */
	function openDebugWindow() {
		var body = null;
		var w = null;
		if (useWindowOpen) {
			// Firefoxは'about:blank'で開くとDOM追加した後に要素が消されてしまう
			// IE9の場合はnullで開くとDocmodeがquirksになり、'about:blank'で開くとちゃんと9モードになる
			// chromeの場合はどちらでもいい
			// IE9の場合だけ'about:blank'を使うようにしている
			// IE7,8の場合は、about:blankでもnullや空文字でも、Docmodeがquirksになる
			// そのため、IE7,8はDocmode指定済みの空のhtmlを開く
			var url = h5.env.ua.isIE ? (h5.env.ua.browserVersion >= 9 ? 'about:blank'
					: getThiScriptPath() + OLD_IE_BLANK_URL) : null;
			w = window.open(url, '1',
					'resizable=1, menubar=no, width=910, height=700, toolbar=no, scrollbars=yes');
			if (w._h5debug) {
				// 既に開いているものがあったら、それを閉じて別のものを開く
				w.close();
				return openDebugWindow();
			}
			try {
				w._h5debug = true;
			} catch (e) {
				// IEの場合既に開いているウィンドウがあったら書き込もうとするとエラーになる
				w.close();
				return openDebugWindow();
			}

			body = w.document.body;
			$(body).addClass('h5debug');
			$(w.document.getElementsByTagName('html')).addClass('h5debugHTML');

			// タイトルの設定
			w.document.title = 'hifive Developer Tools';
		} else {
			// モバイル用の擬似ウィンドウを開く
			w = window;
			body = document.body;
			view.append(body, 'wrapper');
		}
		return w;
	}

	/**
	 * CSSの設定
	 */
	function hyphenate(str) {
		return str.replace(/[A-Z]/g, function(s) {
			return '-' + s.toLowerCase();
		});
	}
	function setCSS(devWindow, styleDef, specialStyleDef) {
		// ウィンドウが開きっぱなしの時はスタイル追加はしない
		var doc = devWindow.document;
		if ($(doc).find('style.h5debug-style').length && devWindow != window) {
			return;
		}
		var cssArray = styleDef;
		if (specialStyleDef) {
			for ( var p in specialStyleDef) {
				if (h5.env.ua['is' + p]) {
					cssArray = cssArray.concat(specialStyleDef[p]);
				}
			}
		}
		var style = doc.createElement('style');
		$(style).addClass('h5debug-style');
		doc.getElementsByTagName('head')[0].appendChild(style);
		var sheet = doc.styleSheets[doc.styleSheets.length - 1];
		if (sheet.insertRule) {
			for ( var i = 0, l = cssArray.length; i < l; i++) {
				var def = cssArray[i];
				var selector = def.selector;
				var rule = def.rule;
				var cssStr = selector + '{';
				for ( var p in rule) {
					var key = hyphenate(p);
					var val = rule[p];
					cssStr += key + ':' + val + ';';
				}
				cssStr += '}';
				sheet.insertRule(cssStr, sheet.cssRules.length);
			}
		} else {
			for ( var i = 0, l = cssArray.length; i < l; i++) {
				var def = cssArray[i];
				var selector = def.selector;
				var rule = def.rule;
				for ( var p in rule) {
					var key = hyphenate(p);
					var val = rule[p];
					sheet.addRule(selector, key + ':' + val);
				}
			}
		}
	}
	/**
	 * 関数を文字列化
	 */
	function funcToStr(f) {
		if (!f) {
			return '' + f;
		}
		if (f === DUMMY_NO_VISIBLE_FUNCTION) {
			// ダミーの関数なら表示できません
			return '関数の中身を表示できません';
		}
		var str = f.toString();
		// タブが余分にあった場合は取り除く
		// フォーマットされている前提で、末尾の"}"の前にあるタブの数分を他の行からも取り除く
		var match = str.match(/(\t+)\}$/);
		var tabs = match && match[1];
		if (tabs) {
			return str.replace(new RegExp('\n' + tabs, 'g'), '\n');
		}
		return str;
	}

	/**
	 * DOM要素を"div#id.cls1.cls2"の形式の文字列に変換
	 */
	function formatDOM(elm) {
		var tagName = elm.tagName;
		var id = elm.id;
		var cls = elm.className;
		return tagName.toLowerCase() + (id && '#' + id) + (cls && '.' + cls.replace(/\s/g, '.'));
	}

	/**
	 * コントローラが持つ子コントローラの定義されたプロパティキーのリストを返す
	 *
	 * @param {Controller} controller
	 * @returns {String[]}
	 */
	function getChildControllerProperties(controller) {
		var ret = [];
		for ( var prop in controller) {
			var target = controller[prop];
			if (h5.u.str.endsWith(prop, 'Controller') && prop !== 'rootController'
					&& prop !== 'parentController' && !$.isFunction(target)
					&& (target && !target.__controllerContext.isRoot)) {
				ret.push(prop);
			}
		}
		return ret;
	}

	/**
	 * イベントハンドラを指定しているキーから対象になる要素を取得
	 */
	function getTargetFromEventHandlerKey(key, controller) {
		var $rootElement = $(controller.rootElement);
		var lastIndex = key.lastIndexOf(' ');
		var selector = $.trim(key.substring(0, lastIndex));
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
	 * Dateをフォーマット
	 *
	 * @param {Date} date
	 */
	function timeFormat(date) {
		function formatDigit(val, digit) {
			var d = digit - ("" + val).length;
			for ( var i = 0; i < d; i++) {
				val = '0' + val;
			}
			return val;
		}
		var h = formatDigit(date.getHours(), 2);
		var m = formatDigit(date.getMinutes(), 2);
		var s = formatDigit(date.getSeconds(), 2);
		var ms = formatDigit(date.getMilliseconds(), 3);
		return h5.u.str.format('{0}:{1}:{2}.{3}', h, m, s, ms);
	}
	/**
	 * ログメッセージオブジェクトを作成
	 *
	 * @param message
	 * @param cls
	 */
	function createLogObject(message, cls, tag, promiseState, __name, indentLevel) {
		return {
			time: timeFormat(new Date()),
			cls: cls,
			message: message,
			tag: tag + ':',
			promiseState: promiseState,
			indentWidth: indentLevel * LOG_INDENT_WIDTH
		};
	}

	/**
	 * 第2引数のログメッセージオブジェクトを第1引数のObservableArrayに追加する。 最大数を超えないようにする
	 */
	function addLogObject(logArray, logObj) {
		// 追加
		logArray.push(logObj);
		// 最大保存件数を超えていたらshift
		if (logArray.length > h5debugSettings.get('LogMaxNum')) {
			logArray.shift();
		}
		// dispatchEventでログがアップデートされたことを通知
		// addLogObjectが呼ばれた時だけ更新したいので、カスタムイベントを使って通知している
		logArray.dispatchEvent({
			type: 'logUpdate'
		});
	}

	/**
	 * コントローラ定義オブジェクトを追加する(hifive1.1.8以前用)
	 */
	function addControllerDef(controller, defObj) {
		if (defObj.__controllerContext) {
			// defObjにコントローラインスタンスが渡されたら、
			// メソッドにアスペクトが掛かっているかどうか判定する
			// 掛かっていたら、『表示できません』にする
			defObj = $.extend(true, {}, defObj);
			for ( var p in defObj) {
				if ($.isFunction(defObj[p]) && defObj[p].toString() === ASPECT_FUNCTION_STR) {
					defObj[p] = DUMMY_NO_VISIBLE_FUNCTION;
				}
			}
		}
		controller.__controllerContext.controllerDef = defObj;
		// 子コントローラを探して再帰的に追加
		for ( var p in defObj) {
			if (h5.u.str.endsWith(p, 'Controller') && p !== 'rootController'
					&& p !== 'parentController' && defObj[p]) {
				addControllerDef(controller[p], defObj[p]);
			}
		}
	}

	/**
	 * ログ用のObservableArrayを作成する
	 */
	function createLogArray() {
		var ary = h5.core.data.createObservableArray();
		logArrays.push(ary);
		return ary;
	}

	// =========================================================================
	//
	// Controller
	//
	// =========================================================================

	/**
	 * コントローラデバッグコントローラ<br>
	 * デバッグコントローラの子コントローラ
	 *
	 * @name h5.debug.developer.ControllerDebugController
	 */
	var controllerDebugController = {
		/**
		 * @name h5.debug.developer.ControllerDebugController
		 */
		__name: 'h5.debug.developer.ControllerDebugController',
		/**
		 * @name h5.debug.developer.ControllerDebugController
		 */
		win: null,
		/**
		 * @name h5.debug.developer.ControllerDebugController
		 */
		$info: null,
		/**
		 * 選択中のコントローラまたはロジック
		 *
		 * @name h5.debug.developer.ControllerDebugController
		 */
		selectedTarget: null,

		__init: function() {
			// 既存のコントローラにコントローラ定義オブジェクトを持たせる(hifive1.1.8以前用)
			// このコントローラがコントローラ定義オブジェクトを持ってるかどうかでhifiveのバージョン判定
			if (!this.__controllerContext.controllerDef) {
				// コントローラを取得(__initの時点なので、このコントローラは含まれていない)。
				var controllers = h5.core.controllerManager.getAllControllers();
				for ( var i = 0, l = controllers.length; i < l; i++) {
					addControllerDef(controllers[i], controllers[i]);
				}
			}
		},
		/**
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param context
		 */
		__ready: function(context) {

			// 初期化処理
			this.win = context.args.win;
			setCSS(this.win, H5DEBUG_STYLE, SPECIAL_H5DEBUG_STYLE);
			setCSS(window, H5PAGE_STYLE);
			// コントローラの詳細表示エリア
			view.append(this.$find('.left'), 'target-list');
			view.append(this.$find('.right'), 'controller-detail');
			view.append(this.$find('.right'), 'logic-detail');
			this.$find('.right>.detail').css('display', 'none');

			// この時点ですでにバインドされているコントローラがあった場合、h5controllerboundイベントで拾えないので
			// コントローラリストの更新を行う
			// TODO すでにバインド済みのコントローラに対してはアスペクトを掛けられないので、ログが出ない。
			// コントローラ化済みのものに対してログを出すようにする機構が必要。
			// h5controllerboundが上がってくるのは__initの後、__readyの前なので、__initはその前に書き換える必要がある
			var controllers = h5.core.controllerManager.getAllControllers();
			for ( var i = 0, l = controllers.length; i < l; i++) {
				this._h5controllerbound(controllers[i]);
			}
		},
		/**
		 * クローズ時のイベント
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		'{.h5debug} close': function() {
			this.removeOverlay(true);
		},
		/**
		 * 左側の何もない箇所がクリックされたらコントローラの選択なしにする
		 */
		'{.h5debug} leftclick': function() {
			this.unfocus();
		},

		/**
		 * コントローラが新たにバインドされた
		 *
		 * @memberOf h5.debug.developer.DebugController
		 * @param context
		 */
		'{document} h5controllerbound': function(context) {
			this._h5controllerbound(context.evArg);
		},

		/**
		 * openerがあればそっちのdocumentにバインドする
		 */
		'{window.opener.document} h5controllerbound': function(context) {
			this._h5controllerbound(context.evArg);
		},
		_h5controllerbound: function(controller) {
			this.appendTargetToList(controller);
		},

		/**
		 * コントローラがアンバインドされた
		 *
		 * @memberOf h5.debug.developer.DebugController
		 * @param context
		 */
		'{document} h5controllerunbound': function(context) {
			this._h5controllerunbound(context.evArg);
		},
		/**
		 * openerがあればそっちのdocumentにバインドする
		 */
		'{window.opener.document} h5controllerunbound': function(context) {
			this._h5controllerunbound(context.evArg);
		},
		_h5controllerunbound: function(controller) {
			var $selected = this.$find('.selected');
			if (controller === this.getTargetFromElem($selected)) {
				this.unfocus();
			}
			this.removeControllerList(controller);
		},
		/**
		 * マウスオーバーでコントローラのバインド先オーバレイ表示(PC用)
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.targetlist .target-name mouseover': function(context, $el) {
			if (hasTouchEvent) {
				return;
			}
			var target = this.getTargetFromElem($el);
			this.removeOverlay();
			if (target.__controllerContext) {
				this.overlay(target.rootElement, target.__controllerContext.isRoot ? 'root'
						: 'child');
			}
		},
		/**
		 * マウスアウト
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.targetlist .target-name mouseout': function(context, $el) {
			if (hasTouchEvent) {
				return;
			}
			this.removeOverlay();
		},


		/**
		 * ロジックリスト上のロジックをクリック
		 *
		 * @memberOf h5.debug.developer.LogicDebugController
		 * @param context
		 * @param $el
		 */
		'.logiclist .logic-name click': function(context, $el) {
			if ($el.hasClass('selected')) {
				// 既に選択済み
				return;
			}
			var logic = this.getLogicFromElem($el);
			this.$find('.logic-name').removeClass('selected');
			$el.addClass('selected');
			this.selectedLogic = logic;

			this.setDetail(logic);
		},

		/**
		 * コントローラリスト上のコントローラをクリック
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.targetlist .target-name click': function(context, $el) {
			if ($el.hasClass('selected')) {
				// 既に選択済み
				return;
			}
			var target = this.getTargetFromElem($el);
			this.$find('.target-name').removeClass('selected');
			$el.addClass('selected');
			this.selectedTarget = target;

			this.setDetail(target);

			this.removeOverlay(true);
			if (target.__controllerContext) {
				// 選択したものがコントローラの場合、コントローラのルートエレメントについてボーダーだけのオーバレイを作成
				this.overlay(target.rootElement, [
						target.__controllerContext.isRoot ? 'root' : 'child', 'borderOnly']);
			}
		},
		/**
		 * イベントハンドラにマウスオーバーで選択(PC用)
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		' .eventHandler li:not(.selected) mouseover': function(context, $el) {
			this.selectEventHandler($el);
		},
		/**
		 * イベントハンドラをクリックで選択(タブレット用)
		 *
		 * @memberOf h5.debug.developer.DebugController
		 */
		'.eventHandler li:not(.selected) click': function(context, $el) {
			this.selectEventHandler($el);
		},
		/**
		 * イベントハンドラの選択
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param $el
		 */
		selectEventHandler: function($el) {
			this.$find('.eventHandler li').removeClass('selected');
			$el.addClass('selected');
			var controller = this.getTargetFromElem(this.$find('.target-name.selected'));
			var key = $.trim($el.find('.key').text());
			var $target = getTargetFromEventHandlerKey(key, controller);

			// 取得結果を保存。これはクリックしてイベントを発火させるとき用です。
			// 再度mosueoverされ場合は新しく取得しなおします。
			$el.data('h5debug-eventTarget', $target);
			this.removeOverlay();
			this.overlay($target, 'event-target');

			// 実行メニューの表示
			var $select = $el.closest('li').find('select.eventTarget').html('');
			$target.each(function() {
				var $option = $('<option>');
				$option.data('h5debug-eventTarget', this);
				$option.text(formatDOM(this));
				$select.append($option);
			});
		},
		/**
		 * イベントを実行
		 */
		' .eventHandler .trigger click': function(context, $el) {
			var evName = $.trim($el.closest('li').find('.key').text()).match(/ (\S+)$/)[1];
			var target = $el.closest('.menu').find('option:selected').data('h5debug-eventTarget');
			if (target) {
				// TODO evNameがmouse/keyboard/touch系ならネイティブのイベントでやる
				$(target).trigger(evName);
			} else {
				alert('イベントターゲットがありません');
			}
		},
		/**
		 * タブの切り替え
		 */
		'{.h5debug} tabChange': function(context) {
			var target = context.evArg;
			if (target !== 'eventHandler') {
				// イベントハンドラの選択状態を解除
				this.removeOverlay();
				this.$find('.eventHandler li').removeClass('selected');
			}
		},
		/**
		 * 詳細画面(右側画面)をコントローラまたはロジックを基に作成。nullが渡されたら空白にする
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param target
		 */
		setDetail: function(target) {
			if (target == null) {
				this.$find('.detail .tab-content>*').html('');
				return;
			}

			// 詳細ビューに表示されているコントローラをアンバインド
			var controllers = h5.core.controllerManager.getControllers(this.$find('.detail'), {
				deep: true
			});
			for ( var i = 0, l = controllers.length; i < l; i++) {
				controllers[i].dispose();
			}

			// コントローラの場合はコントローラの詳細ビューを表示
			if (target.__controllerContext) {
				this._showControllerDetail(target);
			} else {
				// ロジックの場合はロジックの詳細ビューを表示
				this._showLogicDetail(target);
			}
		},
		/**
		 * コントローラの詳細表示
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param controller
		 */
		_showControllerDetail: function(controller) {
			this.$find('.logic-detail').css('display', 'none');
			this.$find('.controller-detail').css('display', 'block');

			// イベントハンドラ、メソッドは、コントローラ定義オブジェクトから取得する。
			// hifive1.1.8以前では、コントローラ定義オブジェクトを持たないが、h5.core.controllerをフックしているので、
			// デバッグコントローラバインド後にコントローラ化されたものは定義オブジェクトを持っている。
			// また、デバッグコントローラがコントローラ化された時点でその前にバインドされていたコントローラにもコントローラ定義オブジェクトが無ければ持たせている

			// イベントハンドラリスト
			var eventHandlers = [];
			// メソッドリスト
			// lifecycle, public, privateの順でソート
			// lifecycleはライフサイクルの実行順、public、privateは辞書順
			var privateMethods = [];
			var publicMethods = [];
			var lifecycleMethods = [];
			for ( var p in controller.__controllerContext.controllerDef) {
				if ($.isFunction(controller.__controllerContext.controllerDef[p])) {
					if (p.indexOf(' ') !== -1) {
						// イベントハンドラ
						eventHandlers.push(p);
					} else {
						// メソッド
						// lifecycleかpublicかprivateかを判定する
						if ($.inArray(p, LIFECYCLE_METHODS) !== -1) {
							lifecycleMethods.push(p);
						} else if (h5.u.str.startsWith(p, '_')) {
							privateMethods.push(p);
						} else {
							publicMethods.push(p);
						}
					}
				}
			}
			// ソート
			eventHandlers.sort();
			lifecycleMethods.sort(function(a, b) {
				return $.inArray(a, LIFECYCLE_METHODS) > $.inArray(b, LIFECYCLE_METHODS);
			});
			privateMethods.sort();
			publicMethods.sort();
			var methods = lifecycleMethods.concat(publicMethods).concat(privateMethods);

			view.update(this.$find('.controller-detail .tab-content .eventHandler'),
					'eventHandler-list', {
						controller: controller.__controllerContext.controllerDef,
						eventHandlers: eventHandlers,
						_funcToStr: funcToStr
					});

			view.update(this.$find('.controller-detail .tab-content .method'), 'method-list', {
				defObj: controller.__controllerContext.controllerDef,
				methods: methods,
				_funcToStr: funcToStr
			});

			// ログ
			var logAry = controller._h5debugContext.debugLog;
			h5.core.controller(this.$find('.controller-detail .operation-log'),
					operationLogController, {
						operationLogs: logAry
					});

			// その他情報
			var childControllerProperties = getChildControllerProperties(controller);
			var childControllerNames = [];
			for ( var i = 0, l = childControllerProperties.length; i < l; i++) {
				childControllerNames.push(controller[childControllerProperties[i]].__name);
			}
			view.update(this.$find('.controller-detail .tab-content .otherInfo'),
					'controller-otherInfo', {
						controller: controller,
						childControllerNames: childControllerNames,
						_formatDOM: formatDOM
					});
		},

		/**
		 * ロジックの詳細表示
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param logic
		 */
		_showLogicDetail: function(logic) {
			this.$find('.logic-detail').css('display', 'block');
			this.$find('.controller-detail').css('display', 'none');

			// メソッドリスト
			// public, privateの順で辞書順ソート
			var privateMethods = [];
			var publicMethods = [];
			for ( var p in logic.__logicContext.logicDef) {
				if ($.isFunction(logic.__logicContext.logicDef[p])) {
					// メソッド
					// publicかprivateかを判定する
					if (h5.u.str.startsWith(p, '_')) {
						privateMethods.push(p);
					} else {
						publicMethods.push(p);
					}
				}
			}

			// ソート
			privateMethods.sort();
			publicMethods.sort();
			var methods = publicMethods.concat(privateMethods);

			view.update(this.$find('.logic-detail .tab-content .method'), 'method-list', {
				defObj: logic.__logicContext.logicDef,
				methods: methods,
				_funcToStr: funcToStr
			});

			// ログ
			var logAry = logic._h5debugContext.debugLog;
			h5.core.controller(this.$find('.logic-detail .operation-log'), operationLogController,
					{
						operationLogs: logAry
					});

			// その他情報
			view.update(this.$find('.logic-detail .tab-content .otherInfo'), 'logic-otherInfo', {
				defObj: logic.__logicContext.logicDef,
				instanceName: logic._h5debugContext.instanceName
			});
		},

		/**
		 * エレメントにコントローラまたはロジックを持たせる
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param el
		 * @param target
		 */
		setTargetToElem: function(el, target) {
			$(el).data('h5debug-target', target);
		},
		/**
		 * エレメントに覚えさせたコントローラまたはロジックを取得する
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param el
		 * @returns {Controller|Logic}
		 */
		getTargetFromElem: function(el) {
			return $(el).data('h5debug-target');
		},
		/**
		 * 選択を解除
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		unfocus: function() {
			this.setDetail(null);
			this.$find('.target-name').removeClass('selected');
			this.removeOverlay(true);
		},
		/**
		 * 引数に指定された要素にオーバレイ
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		overlay: function(elem, classNames) {
			var className = ($.isArray(classNames) ? classNames : [classNames]).join(' ');
			var $el = $(elem);
			$el.each(function() {
				view.append(window.document.body, 'overlay', {
					cls: className
				});
				// documentオブジェクトならoffset取得できないので、0,0にする
				var offset = $(this).offset() || {
					top: 0,
					left: 0
				};
				$('.h5debug-overlay:last').css({
					top: offset.top || 0,
					left: offset.left || 0,
					width: $(this).outerWidth(),
					height: $(this).outerHeight()
				});
			});
		},
		/**
		 * オーバレイの削除。deleteAllにtrueが指定された場合ボーダーだけのオーバーレイも削除
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		removeOverlay: function(deleteAll) {
			if (deleteAll) {
				$('.h5debug-overlay').remove();
			} else {
				$('.h5debug-overlay:not(.borderOnly)').remove();
			}
		},
		/**
		 * コントローラまたはロジックをコントローラリストに追加
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param target
		 */
		appendTargetToList: function(target, $ul) {
			if (h5.u.str.startsWith(target.__name, 'h5.debug.developer')) {
				// デバッグ用にバインドしたコントローラは無視
				return;
			}
			// _h5debugContextを持たせる
			target._h5debugContext = target._h5debugContext || {};

			$ul = $ul || this.$find('.targetlist:first');
			// ログ用のObservableArrayを持たせる
			if (!target._h5debugContext.debugLog) {
				target._h5debugContext.debugLog = createLogArray();
			}

			if (target.__controllerContext) {
				// コントローラの場合
				var isRoot = target.__controllerContext.isRoot;
				var $li = $(view.get('target-list-part', {
					name: target.__name,
					cls: isRoot ? 'root' : 'child'
				}), $ul[0].ownerDocument);
				// データにコントローラを持たせる
				this.setTargetToElem($li.children('.target-name'), target);
				$ul.append($li);
				// 子コントローラも追加
				var childControllerProperties = getChildControllerProperties(target);
				if (childControllerProperties.length) {
					for ( var i = 0, l = childControllerProperties.length; i < l; i++) {
						// 『コントローラ名#定義名』を覚えさせておく
						var p = childControllerProperties[i];
						var controller = target[p];
						controller._h5debugContext = controller._h5debugContext || {};
						controller._h5debugContext.instanceName = target.__name + '#' + p;
						view.append($li, 'target-list');
						this.appendTargetToList(controller, $li.find('ul:last'));
					}
				}
				// ロジックを列挙して追加
				var isAppendedLogiccUl = false;
				for ( var p in target) {
					if (h5.u.str.endsWith(p, 'Logic')) {
						// ロジックがある場合、ロジックのulを追加
						if (!isAppendedLogiccUl) {
							view.append($li, 'target-list');
							isAppendedLogiccUl = true;
						}
						// 『コントローラ名#定義名』を覚えさせておく
						target[p]._h5debugContext = target[p]._h5debugContext || {};
						target[p]._h5debugContext.instanceName = target.__name + '#' + p;
						this.appendTargetToList(target[p], $li.find('ul:last'));
					}
				}
			} else {
				// ロジックの場合
				// コントローラ名とログ用のObserbableArrayを持たせる
				target._h5debugContext = target._h5debugContext || {
					name: target.__name + '#' + p,
					debugLog: createLogArray()
				};
				var $li = $(view.get('target-list-part', {
					name: target.__name,
					cls: 'root'
				}), $ul[0].ownerDocument);

				// データにロジックを持たせる
				this.setTargetToElem($li.children('.target-name'), target);

				// 子コントローラの後にロジック追加
				$ul.append($li);
			}
		},
		/**
		 * コントローラをコントローラリストから削除
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param controller
		 */
		removeControllerList: function(controller) {
			var that = this;
			this.$find('.targetlist .target-name').each(function() {
				if (that.getTargetFromElem(this) === controller) {
					$(this).closest('li').remove();
					return false;
				}
			});
		}
	};
	//
	//	// TODO コントローラデバッグコントローラと共通化
	//	/**
	//	 * ロジックのデバッグコントローラ
	//	 *
	//	 * @name h5.debug.developer.LogicnDebugController
	//	 */
	//	var logicDebugController = {
	//
	//		/**
	//		 * ロジックリスト上のロジックをクリック
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 * @param context
	//		 * @param $el
	//		 */
	//		'.logiclist .logic-name click': function(context, $el) {
	//			if ($el.hasClass('selected')) {
	//				// 既に選択済み
	//				return;
	//			}
	//			var logic = this.getLogicFromElem($el);
	//			this.$find('.logic-name').removeClass('selected');
	//			$el.addClass('selected');
	//			this.selectedLogic = logic;
	//
	//			this.setDetail(logic);
	//		},
	//		/**
	//		 * オープン時のイベント
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 */
	//		'{.h5debug} open': function() {
	//			this.refreshLogicList();
	//		},
	//		/**
	//		 * 左側の何もない箇所がクリックされたらコントローラの選択なしにする
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 */
	//		'{.h5debug} leftclick': function() {
	//			this.unfocus();
	//		},
	//
	//		/**
	//		 * エレメントにロジックを持たせる
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 * @param el
	//		 * @param logic
	//		 */
	//		setLogicToElem: function(el, logic) {
	//			$(el).data('h5debug-logic', logic);
	//		},
	//		/**
	//		 * エレメントに覚えさせたロジックを取得する
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 * @param el
	//		 * @returns {Logic}
	//		 */
	//		getLogicFromElem: function(el) {
	//			return $(el).data('h5debug-logic');
	//		},
	//		/**
	//		 * 詳細画面(右側画面)をロジックを基に作成。nullが渡されたら空白にする
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 * @param controller
	//		 */
	//		setDetail: function(logic) {
	//			if (logic == null) {
	//				this.$find('.detail .tab-content>*').html('');
	//				return;
	//			}
	//
	//			// 詳細ビューに表示されているコントローラをアンバインド
	//			var controllers = h5.core.controllerManager.getControllers(this.$find('.detail'), {
	//				deep: true
	//			});
	//			for ( var i = 0, l = controllers.length; i < l; i++) {
	//				controllers[i].dispose();
	//			}
	//
	//			// メソッドリスト
	//			// public, privateの順でソート
	//			// lifecycleはライフサイクルの実行順、public、privateは辞書順
	//			var logicDef = logic.__logicContext.logicDef;
	//			var privateMethods = [];
	//			var publicMethods = [];
	//			for ( var p in logicDef) {
	//				if ($.isFunction(logicDef[p])) {
	//					// メソッド
	//					// lifecycleかpublicかprivateかを判定する
	//					if (h5.u.str.startsWith(p, '_')) {
	//						privateMethods.push(p);
	//					} else {
	//						publicMethods.push(p);
	//					}
	//				}
	//			}
	//			// ソート
	//			privateMethods.sort();
	//			publicMethods.sort();
	//			var methods = publicMethods.concat(privateMethods);
	//			view.update(this.$find('.detail .tab-content .method'), 'method-list', {
	//				defObj: logicDef,
	//				methods: methods,
	//				_funcToStr: funcToStr
	//			});
	//
	//			// ログ
	//			var logAry = logic._h5debugContext.debugLog;
	//			h5.core.controller(this.$find('.operation-log'), operationLogController, {
	//				logArray: logAry
	//			});
	//
	//			// その他情報
	//			view.update(this.$find('.detail .tab-content .otherInfo'), 'logic-otherInfo', {
	//				defObj: logicDef,
	//				instanceName: logic._h5debugContext.instanceName
	//			});
	//		},
	//
	//		/**
	//		 * ロジックの選択を解除
	//		 *
	//		 * @memberOf h5.debug.developer.LogicDebugController
	//		 */
	//		unfocus: function() {
	//			this.setDetail(null);
	//			this.$find('.logic-name').removeClass('selected');
	//		}
	//	};

	/**
	 * デバッガの設定を行うコントローラ
	 *
	 * @name h5.debug.developer.SettingController
	 */
	var settingController = {
		/**
		 * @memberOf h5.debug.developer.SettingController
		 */
		__name: 'h5.debug.developer.SettingController',

		/**
		 * @memberOf h5.debug.developer.SettingController
		 */
		__ready: function() {
			// settingsをバインドする
			view.bind(this.rootElement, h5debugSettings);
		},
		/**
		 * @memberOf h5.debug.developer.SettingController
		 */
		'.set click': function() {
			var setObj = {};
			this.$find('input').each(function() {
				setObj[this.name] = this.value;
			});
			try {
				h5debugSettings.set(setObj);
			} catch (e) {
				// TODO エラー処理
				debugWindow.alert(e.message);
			}
		}
	};

	/**
	 * 動作ログ、コンソールログの共通処理を抜き出したコントローラ
	 *
	 * @name h5.debug.developer.BaseLogConttoller
	 */
	var baseLogController = {
		/**
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		__name: 'h5.debug.developer.BaseLogController',

		/**
		 * ログリストが一番下までスクロールされているかどうか
		 *
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		_isScrollLast: false,

		/**
		 * ログ配列
		 *
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		_logArray: null,

		/**
		 * logArrayからHTMLに変換する関数 setCreateHTMLで登録する
		 *
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		_createLogHTML: function() {},

		/**
		 * ログ配列のセット
		 *
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		setLogArray: function(logArray, target) {
			logArray._viewBindTarget = target;
			this._logArray = logArray;
			// logArrayにハンドラを登録して、ログの更新があった時にdispatchEventしてもらう
			logArray.addEventListener('logUpdate', this.own(this._update));
			if (this._logArray.length) {
				this._updateView();
			}
			// scrollイベントはバブリングしないので、要素追加後にbindでイベントハンドラを追加
			$(target).bind('scroll', this.ownWithOrg(function(elm, ev) {
				// 一番下までスクロールされているか。30pxの余裕を持たせて判定
				this._isScrollLast = elm.scrollTop > elm.scrollHeight - elm.clientHeight - 30;
			}));
		},
		setCreateLogHTML: function(func) {
			this._createLogHTML = func;
		},
		_update: function() {
			// ログ出力箇所が表示されていなければ(タブがactiveになっていなければ)なにもしない
			if (!$(this.rootElement).hasClass('active')) {
				return;
			}

			// ログを更新する。
			// 前のlogUpdateがLOG_DELAYミリ秒以内であれば、前のログも合わせてLOG_DELAYミリ秒後に表示する
			// LOG_DELAYミリ秒の間隔をあけずに立て続けにlogUpdateが呼ばれた場合はログは出ない。
			// LOG_DELAYミリ秒の間にlogUpdateが呼ばれなかった時に今まで溜まっていたログを出力する。
			// ただし、MAX_LOG_DELAY経ったら、logUpdateの間隔に関わらずログを出力する

			// LOG_DELAYミリ秒後に出力するタイマーをセットする。
			// すでにタイマーがセット済みなら何もしない(セット済みのタイマーで出力する)
			var logArray = this._logArray;
			logArray._logUpdatedInMaxDelay = true;
			if (logArray._logDelayTimer) {
				clearTimeout(logArray._logDelayTimer);
			}
			logArray._logDelayTimer = setTimeout(this.own(function() {
				this._updateView();
			}), LOG_DELAY);
		},
		_updateView: function() {
			// コントローラがdisposeされていたら何もしない(非同期で呼ばれるメソッドなのであり得る)
			if (!this.__controllerContext) {
				// コントローラがdisposeされていたら何もしない(非同期で呼ばれるメソッドなのであり得る)
				return;
			}
			var logArray = this._logArray;
			clearTimeout(logArray._logDelayTimer);
			clearTimeout(logArray._logMaxDelayTimer);
			logArray._logDelayTimer = null;
			logArray._logMaxDelayTimer = null;

			// ポップアップウィンドウのDOM生成がIEだと重いのでinnerHTMLでやっている。
			// innerHTMLを更新(html()メソッドが重いので、innerHTMLでやっている)
			var logList = logArray._viewBindTarget;
			if (logList) {
				logList.innerHTML = this._createLogHTML(logArray);
			}

			// 元々一番下までスクロールされていたら、一番下までスクロールする
			if (this._isScrollLast) {
				logList.scrollTop = logList.scrollHeight - logList.clientHeight;
			}

			// MAX_LOG_DELAYのタイマーをセットする
			logArray._logUpdatedInMaxDelay = false;
			logArray._logMaxDelayTimer = setTimeout(this.own(function() {
				if (logArray._logUpdatedInMaxDelay) {
					this._updateView();

				}
			}), MAX_LOG_DELAY);
		},

		'{rootElement} tabSelect': function() {
			this._updateView();
		}
	};

	/**
	 * 動作ログコントローラ<br>
	 *
	 * @name h5.debug.developer.OperationLogController
	 */
	var operationLogController = {
		/**
		 * @memberOf h5.debug.developer.OperationLogController
		 */
		__name: 'h5.debug.developer.OperationLogController',
		/**
		 * 表示する条件を格納するオブジェクト
		 *
		 * @memberOf h5.debug.developer.OperationLogController
		 */
		_condition: {
			filterStr: '',
			exclude: false,
			hideCls: {}
		},

		/**
		 * ログ配列
		 *
		 * @memberOf h5.debug.developer.OperationLogContorller
		 */
		_logArray: null,

		/**
		 * ログ出力共通コントローラ
		 *
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		baseController: baseLogController,

		/**
		 * @memberOf h5.debug.developer.OperationLogController
		 * @param context.evArg.logArray logArray
		 */
		__ready: function(context) {
			view.update(this.rootElement, 'operation-log');
			this.baseController.setCreateLogHTML(this.own(this._createLogHTML));
			this.baseController.setLogArray(context.args.operationLogs, this
					.$find('.operation-log-list')[0]);
		},
		_createLogHTML: function(logArray) {
			var reg = this._condition.filterStr && getRegex(this._condition.filterStr);
			var hideCls = this._condition.hideCls;

			var html = '';
			// TODO view.getが重いので、文字列を直接操作する
			// (view.get, str.formatを1000件回してIE10で20msくらい。ただの文字列結合なら10msくらい)

			for ( var i = 0, l = logArray.length; i < l; i++) {
				//			var part = view.get('operation-log-list-part', logArray.get(i));
				var logObj = logArray.get(i);
				//			h5.u.str.format(operationLogListPart, logObj.cls, logObj.time,
				//					logObj.indentWidth, logObj.tag, logObj.promiseState, logObj.message);
				var part = '<li class=' + logObj.cls + '>' + '<span class="time">' + logObj.time
						+ '</span>' + '<span style="margin-left:' + logObj.indentWidth
						+ 'px" class="tag">' + logObj.tag + '</span>'
						+ '<span class="promiseState">' + logObj.promiseState + '</span>'
						+ '<span class="message ' + logObj.cls + '">' + logObj.message
						+ '</span></li>';
				// フィルタにマッチしているか
				if (reg && $('.message').text().match(reg)) {
					html += $(part).css('display', 'none')[0].outerHTML;
					continue;
				}

				// クラスのフィルタにマッチしているか
				if (hideCls) {
					for ( var cls in hideCls) {
						if (hideCls[cls]) {
							part = $(part).css('display', 'none')[0].outerHTML;
							break;
						}
					}
				}

				html += part;
			}
			return html;
		},
		'.fixedControlls input[type="checkbox"] change': function(context, $el) {
			var cls = $el.attr('name');
			if ($el.prop('checked')) {
				this._condition.hideCls[cls] = false;
			} else {
				this._condition.hideCls[cls] = true;
			}
			this.refresh();
		},
		/**
		 * フィルタを掛ける
		 *
		 * @memberOf h5.debug.developer.OperationLogController
		 */
		'button.filter-show click': function(context) {
			var val = this.$find('input.filter[type="text"]').val();
			if (!val) {
				return;
			}
			this._condition.filterStr = val;
			this._condition.exclude = false;
			this.refresh();
			this.$find('input.filter[type="text"],.filter-show,.filter-hide').attr('disabled',
					'disabled');
			this.$find('.filter-clear').removeAttr('disabled');
		},
		'button.filter-hide click': function(context) {
			var val = this.$find('input.filter[type="text"]').val();
			if (!val) {
				return;
			}
			this._condition.filterStr = val;
			this._condition.exclude = true;
			this.refresh();
			this.$find('input.filter[type="text"],.filter-show,.filter-hide').attr('disabled',
					'disabled');
			this.$find('.filter-clear').removeAttr('disabled');
		},
		'button.filter-clear click': function(context) {
			this._condition.filterStr = '';
			this.refresh();
			this.$find('input.filter[type="text"],.filter-show,.filter-hide')
					.removeAttr('disabled');
			this.$find('.filter-clear').attr('disabled', 'disabled');
		},
		refresh: function($li) {
			$li = $li || this.$find('li');
			$li.css('display', '');
			this._regFilter($li);
			this._clsFilter($li);
		},
		_regFilter: function($li) {
			var str = this._condition.filterStr;
			if (!str) {
				return;
			}
			var isExclude = this._condition.exclude;
			var reg = getRegex(str);
			// フィルタによって隠されてる要素を一度表示
			var $hiddenLi = $();
			$li.each(function() {
				var $this = $(this);
				if (isExclude !== !$this.find('.message').text().match(reg)) {
					$hiddenLi = $hiddenLi.add($this);
				}
			});
			// フィルタにマッチしたものを隠す
			$hiddenLi.css('display', 'none');
		},
		_clsFilter: function($li) {
			for ( var cls in this._condition.hideCls) {
				if (this._condition.hideCls[cls]) {
					$li.filter('.' + cls).css('display', 'none');
				}
			}
		}
	};

	/**
	 * コンソールログコントローラ
	 *
	 * @name h5.debug.developer.ConsoleLogController
	 */
	var consoleLogController = {
		/**
		 * @memberOf h5.debug.developer.ConsoleLogController
		 */
		__name: 'h5.debug.developer.ConsoleLogController',

		/**
		 * ログ出力共通コントローラ
		 *
		 * @memberOf h5.debug.developer.ConsoleLogController
		 */
		baseController: baseLogController,

		/**
		 * @memberOf h5.debug.developer.BaseLogController
		 */
		_logArray: null,

		/**
		 * @memberOf h5.debug.developer.ConsoleLogController
		 * @param context
		 */
		__ready: function(context) {
			this.baseController.setCreateLogHTML(this.own(this._createLogHTML));
			this.baseController.setLogArray(context.args.consoleLogs, this.rootElement);
		},
		_createLogHTML: function(logArray) {
			var html = '';
			for ( var i = 0, l = logArray.length; i < l; i++) {
				var obj = logArray.get(i);
				var msg = '[' + obj.levelString + ']' + timeFormat(obj.date) + ' '
						+ h5.u.str.format.apply(h5.u.str, obj.args);
				var cls = obj.levelString;
				html += '<p class="' + cls + '">' + msg + '</p>';

			}
			return html;
		}
	};

	/**
	 * タブコントローラ タブ表示切替をサポートする
	 *
	 * @name h5.debug.developer.TabController
	 */
	var tabController = {
		/**
		 * @memberOf h5.debug.developer.TabController
		 */
		__name: 'h5.debug.developer.TabController',
		/**
		 * @memberOf h5.debug.developer.TabController
		 */
		__ready: function() {
			// 非アクティブのものを非表示
			this.$find('tab-content').not('.active').css('display', 'none');
		},
		'.nav-tabs li click': function(contextn, $el) {
			if ($el.hasClass('active')) {
				return;
			}
			var $navTabs = $el.parent();
			$navTabs.find('>.active').removeClass('active');
			$el.addClass('active');
			var targetContent = $el.data('tab-page');
			var $tabContentsRoot = $el.closest('.nav-tabs').next();
			$tabContentsRoot.find('>.active').removeClass('active');
			var $selectedContents = $tabContentsRoot.find('>.' + targetContent);
			$selectedContents.addClass('active');
			this.trigger('tabChange', targetContent);
			$selectedContents.trigger('tabSelect');
		}
	};

	/**
	 * デバッグコントローラ
	 *
	 * @name h5.debug.developer.DebugController
	 */
	var debugController = {
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		__name: 'h5.debug.developer.DebugController',
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		win: null,
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		_controllerDebugController: controllerDebugController,

		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		_tabController: tabController,
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		_operationLogController: operationLogController,
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		_consoleLogController: consoleLogController,
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		_settingsController: settingController,
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		__meta: {
			_controllerDebugController: {
			// rootElementは__constructで追加してから設定している
			},
			_operationLogController: {},
			_settingsController: {},
			_consoleLogController: {}
		},
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		__construct: function(context) {
			this.win = context.args.win;
			// 必要な要素を追加

			// 全体を包むタブの中身を追加
			view.append(this.rootElement, 'debug-tab');
			view.append(this.$find('.debug-controller'), 'controllerDebugWrapper');
			view.append(this.$find('.settings'), 'settings');
			this.__meta._controllerDebugController.rootElement = this.$find('.debug-controller');
			this.__meta._operationLogController.rootElement = this.$find('.operation-log');
			this.__meta._consoleLogController.rootElement = this.$find('.console-log');
			this.__meta._settingsController.rootElement = this.$find('.settings');

			// -------------------------------------------------
			// ロガーをフックする
			// -------------------------------------------------
			h5.settings.log = {
				target: {
					view: {
						type: {
							log: function(obj) {
								if (obj.args[1] && obj.args[1].indexOf('h5.debug.developer.') === 0) {
									// デバッグツールが吐いてるログは出力しない
									return;
								}
								consoleLogs.push(obj);
								consoleLogs.dispatchEvent({
									type: 'logUpdate'
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
		},

		/**
		 * 何もない箇所をクリック
		 */
		'.left click': function(context, $el) {
			if (context.event.target !== $el[0]) {
				return;
			}
			this.trigger('leftclick');
		},
		/**
		 * 閉じるボタン(モバイル用) 閉じて、オーバレイも消える。
		 */
		'{.h5debug-controllBtn.opencloseBtn.closeTool} click': function(context, $el) {
			$el.text('▼').removeClass('closeTool').addClass('openTool');
			$('.h5debug-controllBtn').not($el).css('display', 'none');
			$(this.rootElement).css('display', 'none');
			this.trigger('close');
		},
		/**
		 * 開くボタン(モバイル用)
		 */
		'{.h5debug-controllBtn.opencloseBtn.openTool} click': function(context, $el) {
			$el.text('×').removeClass('openTool').addClass('closeTool');
			$('.h5debug-controllBtn').not($el).css('display', 'inline-block');
			$(this.rootElement).css('display', 'block');
			$('.h5debug-controllBtn.showhideBtn.showTool').trigger('click');
			this.trigger('open');
		},

		/**
		 * 隠すボタン
		 * <p>
		 * オーバレイを隠す。タブレット版の場合はデバッグツールも隠す。
		 * </p>
		 */
		'{.h5debug-controllBtn.showhideBtn.hideTool} click': function(context, $el) {
			$el.text('↓').removeClass('hideTool').addClass('showTool');
			if (!useWindowOpen) {
				$(this.rootElement).css({
					display: 'none'
				});
			}
		},
		/**
		 * 見るボタン
		 */
		'{.h5debug-controllBtn.showhideBtn.showTool} click': function(context, $el) {
			$el.text('↑').removeClass('showTool').addClass('hideTool');
			if (!useWindowOpen) {
				$(this.rootElement).css({
					display: ''
				});
			}
		}
	};
	// アスペクトを掛ける
	// TODO アスペクトでやるのをやめる。
	// アスペクトだと、メソッドがプロミスを返した時が分からない。(プロミスがresolve,rejectされた時に初めてpostに入るので。)
	var preTarget = null;
	var aspect = {
		target: '*',
		interceptors: h5.u.createInterceptor(function(invocation, data) {
			var target = invocation.target;
			if (!target.__name || h5.u.str.startsWith(target.__name, 'h5.debug.developer')) {
				// __nameがない(===disposeされた)またはデバッグコントローラなら何もしない
				return invocation.proceed();
			}

			// ControllerDebugControllerまたはLogicDebugControllerがバインドされる前にバインドされたコントローラの場合
			// _h5debugContextがないので追加
			target._h5debugContext = target._h5debugContext || {};
			// ログのインデントレベルを設定
			target._h5debugContext.indentLevel = target._h5debugContext.indentLevel || 0;
			var indentLevel = target._h5debugContext.indentLevel;
			// 関数名を取得して、種類を判別
			var fName = invocation.funcName;
			var cls = '';
			if (fName.indexOf(' ') !== -1 && target.__controllerContext) {
				// コントローラかつ空白を含むメソッドの場合はイベントハンドラ
				cls = ' event';
			} else if ($.inArray(fName, LIFECYCLE_METHODS) !== -1 && target.__controllerContext) {
				// ライフサイクルメソッド
				cls = 'lifecycle';
			} else if (fName.indexOf('_') === 0) {
				// '_'始まりならprivate
				cls = 'private';
			} else {
				// それ以外はpublic
				cls = 'public';
			}

			// BEGINを出力したターゲットのログを覚えておいてENDの出力場所が分かるようにする
			// 全体の動作ログ以外で、ログを出した場所を覚えさせておく
			data.beginLog = [];

			// ログを保持する配列をターゲットに持たせる
			if (!target._h5debugContext.debugLog) {
				target._h5debugContext.debugLog = createLogArray();
			}

			// 呼び出し元のターゲットにもログを出す
			if (preTarget && preTarget !== target) {
				var logObj = createLogObject(target.__name + '#' + fName, cls, 'BEGIN', '',
						target.__name, preTarget._h5debugContext.indentLevel);
				addLogObject(preTarget._h5debugContext.debugLog, logObj);
				preTarget._h5debugContext.indentLevel += 1;
				data.beginLog.push({
					target: preTarget,
					logObj: logObj
				});
			}

			// ターゲットのログ
			var logObj = createLogObject(fName, cls, 'BEGIN', '', target.__name, indentLevel);
			data.logObj = logObj;
			addLogObject(target._h5debugContext.debugLog, logObj);
			target._h5debugContext.indentLevel += 1;
			data.beginLog.push({
				target: target,
				logObj: logObj
			});

			// コントローラ全部、ロジック全部の横断動作ログ
			var wholeLog = createLogObject(target.__name + '#' + fName, cls, 'BEGIN', '',
					target.__name, wholeOperationLogsIndentLevel);
			wholeOperationLogsIndentLevel++;
			addLogObject(wholeOperationLogs, wholeLog);
			data.wholeLog = wholeLog;

			preTarget = target;
			return invocation.proceed();
		}, function(invocation, data) {
			var target = invocation.target;
			if (!target.__name) {
				// target.__nameがない(===disposeされた)場合は何もしない
				return;
			}
			if (h5.u.str.startsWith(target.__name, 'h5.debug.developer')) {
				return;
			}
			target._h5debugContext = target._h5debugContext || {};
			target._h5debugContext.indentLevel = target._h5debugContext.indentLevel || 0;
			var cls = '';
			var fName = invocation.funcName;

			// プロミスの判定
			// penddingのプロミスを返した時はPOSTに入ってこないので、RESOLVEDかREJECTEDのどっちかになる。
			var ret = invocation.result;
			var isPromise = ret && $.isFunction(ret.promise) && !h5.u.obj.isJQueryObject(ret)
					&& $.isFunction(ret.done) && $.isFunction(ret.fail);
			var promiseState = '';
			var tag = 'END';
			if (isPromise) {
				tag = 'DFD';
				// すでにresolve,rejectされていたら状態を表示
				if (ret.state() === 'resolved') {
					promiseState = '(RESOLVED)';
				} else if (ret.state() === 'rejected') {
					promiseState = '(REJECTED)';
				}
			}

			var time = timeFormat(new Date());

			// BEGINのログを出したターゲット(コントローラまたはロジック)にログを出す
			if (data.beginLog) {
				for ( var i = 0, l = data.beginLog.length; i < l; i++) {
					var t = data.beginLog[i].target;
					var logObj = $.extend({}, data.beginLog[i].logObj);
					logObj.tag = tag;
					logObj.promiseState = promiseState;
					logObj.time = time;
					// プロミスならインデントを現在のインデント箇所で表示
					logObj.indentWidth = isPromise ? 0 : logObj.indentWidth;
					addLogObject(t._h5debugContext.debugLog, logObj);
					t._h5debugContext.indentLevel -= 1;
				}
			}

			// コントローラ全部、ロジック全部の横断動作ログにログオブジェクトの登録
			var wholeLog = $.extend({}, data.wholeLog);
			wholeLog.tag = tag;
			wholeLog.promiseState = promiseState;
			wholeLog.time = time;
			wholeLog.indentWidth = isPromise ? 0 : wholeLog.indentWidth;
			addLogObject(wholeOperationLogs, wholeLog);
			wholeOperationLogsIndentLevel -= 1;
			preTarget = null;
		}),
		pointCut: '*'
	};
	compileAspects(aspect);
	h5.settings.aspects = [aspect];

	// コントローラのフック
	if (!CONTROLLER_HAS_CONTROLLER_DEF) {
		// controllerDefを持たせるためにh5.core.controllerをフック(hifive1.1.8以前用)
		var orgController = h5.core.controller;
		h5.core.controller = function(/* var_args */) {
			var defObj = $.extend({}, arguments[1]);
			var c = orgController.apply(this, arguments);
			if (defObj && h5.u.str.startsWith(defObj.__name, 'h5.debug.developer')) {
				return;
			}
			c.initPromise.done(function() {
				if (!this.__controllerContext.controllerDefObj) {
					// hifive1.1.8以前用
					addControllerDef(this, defObj);
				}
			});
			return c;
		};
	}

	// -------------------------------------------------
	// デバッガ設定変更時のイベント
	// -------------------------------------------------
	h5debugSettings.addEventListener('change', function(e) {
		for ( var p in e.props) {
			var val = e.props[p].newValue;
			switch (p) {
			case 'LogMaxNum':
				for ( var i = 0, l = logArrays.length; i < l; i++) {
					if (val >= logArrays[i].length) {
						continue;
					}
					logArrays[i].splice(0, logArrays[i].length - val);
				}
			}
		}
	});


	// -------------------------------------------------
	// コントローラのバインド
	// -------------------------------------------------
	$(function() {
		debugWindow = openDebugWindow();
		h5.core.controller($(debugWindow.document).find('.h5debug'), debugController, {
			win: debugWindow,
			// 全体の動作ログ
			operationLogs: wholeOperationLogs,
			// コンソールログ
			consoleLogs: consoleLogs

		});
	});
})();