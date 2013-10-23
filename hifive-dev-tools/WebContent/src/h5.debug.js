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
	// useWindowOpen = true;
	//		 useWindowOpen = false;

	// =========================================================================
	//
	// Constants
	//
	// =========================================================================
	var LOG_INDENT_WIDTH = 10;

	var LIFECYCLE_METHODS = ['__construct', '__init', '__ready', '__unbind', '__dispose'];

	/**
	 * デバッグツールのスタイル
	 */
	var H5DEBUG_STYLE = [{
		selector: '.h5debug',
		rule: {
			backgroundColor: 'rgba(255,255,255,0.8)',
			height: '100%',
			width: '903px',
			margin: 0,
			padding: 0,
			zIndex: 20000
		}
	}, {
		selector: '.h5debug.posfix',
		rule: {
			position: 'fixed',
			top: 0,
			left: 0
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
		selector: '.h5debug-controllBtn',
		rule: {
			display: 'inline-block',
			cursor: 'pointer',
			fontSize: '30px',
			fontWeight: 'bold',
			textAlign: 'center',
			lineHeight: '30px',
			width: '32px',
			height: '32px',
			margin: 2,
			backgroundColor: 'rgba(128,255,198,0.4)'
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
	 * コントローラリスト
	 */
	{
		selector: '.h5debug .debug-controller .controllerlist',
		rule: {
			paddingTop: 0,
			paddingLeft: '1.2em'
		}
	}, {
		selector: '.h5debug .debug-controller .controllerlist .controller-name',
		rule: {
			cursor: 'default'
		}
	}, {
		selector: '.h5debug .debug-controller .controllerlist .controller-name.selected',
		rule: {
			backgroundColor: 'rgba(170,237,255,1)!important'
		}
	}, {
		selector: '.h5debug .debug-controller .controllerlist .controller-name:hover',
		rule: {
			backgroundColor: 'rgba(170,237,255,0.4)'
		}
	},
	/*
	 * イベントハンドラ
	 */
	{
		selector: '.h5debug .debug-controller .eventHandler ul',
		rule: {
			listStyle: 'none'
		}
	}, {
		selector: '.h5debug .debug-controller .eventHandler li.selected',
		rule: {
			backgroundColor: 'rgba(128,255,198,0.4)'
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
			backgroundColor: 'rgba(245,245,245,0.5)',
			border: '1px solid rgba(0,0,0,0.15)',
			'-webkit-border-radius': '4px',
			'-moz-border-radius': '4px',
			borderRadius: '4px',
			fontFamily: 'Monaco,Menlo,Consolas,"Courier New",monospace',
			fontSize: '12px'
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
			height: '100%',
			width: '350px',
			border: '1px solid #20B5FF',
			float: 'left',
			boxSizing: 'border-box',
			'-moz-box-sizing': 'border-box',
			'-ms-box-sizing': 'border-box',
			'-o-box-sizing': 'border-box'
		}
	}, {
		selector: '.h5debug .right',
		rule: {
			height: '100%',
			width: '550px',
			border: '1px solid #20B5FF',
			marginLeft: '-1px',
			float: 'left',
			boxSizing: 'border-box',
			'-moz-box-sizing': 'border-box',
			'-ms-box-sizing': 'border-box',
			'-o-box-sizing': 'border-box'
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
			'-o-box-sizing': 'border-box'
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
		IE: [{
			// スタイルの調整(IE用)
			// IEだと、親要素とそのさらに親要素がpadding指定されているとき、height:100%の要素を置くと親の親のpadding分が無視されている？
			// その分を調整する。
			selector: '.h5debug .tab-content .tab-content',
			rule: {
				paddingBottom: '60px'
			}
		}]
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
			backgroundColor: 'rgba(64, 214, 255,0.4)',
			border: '5px solid rgba(64, 214, 255, 1)'
		}
	}, {
		selector: '.h5debug-overlay.child',
		rule: {
			backgroundColor: 'rgba(170,237,255,0.4)',
			border: '5px dashed rgba(170, 237, 255, 1)'
		}
	}, {
		selector: '.h5debug-overlay.event-target',
		rule: {
			backgroundColor: 'rgba(128,255,198,0.3)',
			border: '5px solid rgba(128,255,198,1)'
		}
	}, {
		selector: '.h5debug-overlay.borderOnly',
		rule: {
			backgroundColor: 'transparent!important'
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
	view
			.register('debug-tab', '<div class="debug-tab"><ul class="nav nav-tabs">'
					+ '<li class="active" data-tab-page="debug-controller">コントローラ</li>'
					+ '<li data-tab-page="operation-log">動作ログ</li>'
					+ '<li data-tab-page="settings">デバッガ設定</li>' + '</ul><div class="tab-content">'
					+ '<div class="active debug-controller columnLayoutWrapper"></div>'
					+ '<div class="operation-log whole"></div>' + '<div class="settings"></div>'
					+ '</div>');

	// --------------------- コントローラ --------------------- //
	// コントローラデバッグ画面
	view.register('controllerDebugWrapper',
			'<div class="left ovfAuto"></div><div class="right ovfHidden"></div>');
	// 操作パネル
	view.register('controller-controll', '<div class="fixedControlls"></div>');

	// コントローラリストul
	view.register('controller-list', '<ul class="controllerlist"></ul>');

	// コントローラリストli
	view.register('controller-list-part',
			'<li><span class="controller-name [%= cls %]">[%= name %]</span></li>');

	// 詳細情報画面
	view.register('controller-detail', '<div class="detail"><ul class="nav nav-tabs">'
			+ '<li class="active" data-tab-page="eventHandler">イベントハンドラ</li>'
			+ '<li data-tab-page="method">メソッド</li>' + '<li data-tab-page="operation-log">ログ</li>'
			+ '<li data-tab-page="otherInfo">その他情報</li></ul><div class="tab-content">'
			+ '<div class="active eventHandler"></div>' + '<div class="method"></div>'
			+ '<div class="operation-log"></div>' + '<div class="otherInfo"></div></div>');

	// イベントハンドラリスト
	view
			.register(
					'controller-eventHandler',
					'<ul class="liststyle-none no-padding">[% for(var i = 0, l = eventHandlers.length; i < l; i++){ var p = eventHandlers[i]; %]'
							+ '<li><span class="menu">ターゲット:<select class="eventTarget"></select><button class="trigger">実行</button></span><span class="key">[%= p %]</span><pre class="value">[%= _funcToStr(controller[p]) %]</pre></li>'
							+ '[% } %]</ul>');

	// メソッドリスト
	view
			.register(
					'controller-method',
					'<ul class="liststyle-none no-padding">[% for(var i = 0, l = methods.length; i < l; i++){ var p = methods[i];%]'
							+ '<li><span class="name">[%= p %]</span><pre class="value">[%= _funcToStr(controller[p]) %]</pre></li>'
							+ '[% } %]</ul>');

	// 動作ログ(コントローラ、ロジック、全体、で共通)
	view
			.register(
					'operation-log',
					'<div class="fixedControlls">'
							+ '<input type="checkbox" id="operation-log-controlls-event"checked name="event"/><label for="operation-log-controlls-event">イベント</label>'
							+ '<input type="checkbox" id="operation-log-controlls-public" checked name="public" /><label for="operation-log-controlls-public">パブリック</label>'
							+ '<input type="checkbox" id="operation-log-controlls-private" checked name="private" /><label for="operation-log-controlls-private">プライベート</label>'
							+ '<input type="checkbox" id="operation-log-controlls-lifecycle" checked name="lifecycle"/><label for="operation-log-controlls-lifecycle">ライフサイクル</label>'
							+ '<br>'
							+ '<input type="text" class="filter"/><button class="filter-show">絞込み</button><button class="filter-hide">除外</button><button class="filter-clear" disabled>フィルタ解除</button>'
							+ '</div>'
							+ '<ul class="operation-log-list liststyle-none no-padding" data-h5-loop-context="logs"><li data-h5-bind="class:cls">'
							+ '<span data-h5-bind="time" class="time"></span>'
							+ '<span data-h5-bind="text:tag;style(margin-left):indentLevel" class="tag"></span>'
							+ '<span data-h5-bind="promiseState" class="promiseState"></span>'
							+ '<span class="message" data-h5-bind="text:message; class:cls"></span>'
							+ '</li></ul>');

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

	// オーバレイ
	view.register('overlay', '<div class="h5debug-overlay [%= cls %]"></div>');

	// --------------------- 動作ログ --------------------- //

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
			defaultValue: 10,
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
	 * デバッグウィンドウを開く
	 */
	function openDebugWindow() {
		var body = null;
		var w = null;
		if (useWindowOpen) {
			// Firefoxは'about:blank'で開くとDOM追加した後に要素が消されてしまう
			// IEの場合はnullで開くとDocmodeがquirksになり、'about:blank'で開くとちゃんと9モードになる
			// chromeの場合はどちらでもいい
			// IEの場合だけ'about:blank'を使うようにしている
			var url = h5.env.ua.isIE ? 'about:blank' : null;
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
					try {
						sheet.addRule(selector, key + ':' + val);
					} catch (e) {
						alert(selector);
						alert(key);
						alert(val)
					}
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
	 * DOM要素を"div#id.cls1 cls2"の形式の文字列に変換
	 */
	function formatDOM(elm) {
		var $elm = $(elm);
		var id = $elm.attr('id') || '';
		if (id) {
			id = '#' + id;
		}
		var cls = $elm.attr('class') || '';
		if (cls) {
			cls = '.' + cls;
		}
		var tagName = $elm[0].tagName.toLocaleLowerCase();
		return tagName + id + cls;
	}

	/**
	 * コントローラが持つ子コントローラを取得
	 */
	function getChildControllers(controller) {
		var ret = [];
		for ( var prop in controller) {
			var target = controller[prop];
			if (h5.u.str.endsWith(prop, 'Controller') && prop !== 'rootController'
					&& prop !== 'parentController' && !$.isFunction(target)
					&& (target && !target.__controllerContext.isRoot)) {
				ret.push(target);
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
		var ms = formatDigit(date.getMilliseconds(), 4);
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
			indentLevel: indentLevel * LOG_INDENT_WIDTH
		};
	}

	/**
	 * 第2引数のログメッセージオブジェクトを第1引数のObservableArrayに追加する。 最大数を超えないようにする
	 */
	function addLogObject(logArray, logObj) {
		var start = new Date().getTime();
		logArray.push(logObj);
		console.log(new Date().getTime() - start);
		// 一番下までスクロールされているか
		var scroll = false;
		//		// 余裕を持たせて判定
		var target = null;
		if (logArray._viewBindTarget && $(logArray._viewBindTarget)[0].style.display !== 'none') {
			target = $(logArray._viewBindTarget).find('.operation-log-list')[0];
		}
		if (target && target.scrollTop > target.scrollHeight - target.clientHeight - 30) {
			scroll = true;
		}

		if (logArray.length > h5debugSettings.get('LogMaxNum')) {
			logArray.shift();
			if (target) {
				// shift()で上に一つつづずれた分だけ、上にスクロールする
				target.scrollTop -= $(target).find('.operation-log>li:last').outerHeight();
			}
		}
		// 元々一番下までスクロールされていたら、追加後に一番下までスクロールする
		if (scroll) {
			target.scrollTop = target.scrollHeight - target.clientHeight;
		}
		// ターゲットに対してログが追加されたことをtriggerして通知
		$(target).trigger('logAppended');
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

	/**
	 * ログをバインドする。ログ配列にバインド先の要素を持たせる。
	 */
	function bindLogArray(view, target, logAry) {
		view.bind(target, {
			logs: logAry
		});
		logAry._viewBindTarget = $(target)[0];
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
		 * 選択中のコントローラ
		 *
		 * @name h5.debug.developer.ControllerDebugController
		 */
		selectedController: null,

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
			view.update(this.$find('.debug-controller .controll'), 'controller-controll');

			this.win = context.args.win;
			setCSS(this.win, H5DEBUG_STYLE, SPECIAL_H5DEBUG_STYLE);
			setCSS(window, H5PAGE_STYLE);
			// コントローラの詳細表示エリア
			view.append(this.$find('.left'), 'controller-controll');
			view.append(this.$find('.left'), 'controller-list');
			view.append(this.$find('.right'), 'controller-detail');

			// 1秒待ってからコントローラを取得する
			var that = this;
			setTimeout(function() {
				that.refreshControllerList();
			}, 1000);
		},
		/**
		 * オープン時のイベント
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		'{.h5debug} open': function() {
			this.refreshControllerList();
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
			this._h5controllerbound(context);
		},
		/**
		 * openerがあればそっちのdocumentnにバインドする
		 */
		'{window.opener.document} h5controllerbound': function(context) {
			this._h5controllerbound(context);
		},
		_h5controllerbound: function(context) {
			var controller = context.evArg;
			this.appendControllerList(controller);
		},

		/**
		 * コントローラがアンバインドされた
		 *
		 * @memberOf h5.debug.developer.DebugController
		 * @param context
		 */
		'{document} h5controllerunbound': function(context) {
			this._h5controllerunbound(context);
		},
		/**
		 * openerがあればそっちのdocumentnにバインドする
		 */
		'{window.opener.document} h5controllerunbound': function(context) {
			this._h5controllerunbound(context);
		},
		_h5controllerunbound: function(context) {
			var controller = context.evArg;
			var $selected = this.$find('.selected');
			if (context.evArg === this.getControllerFromElem($selected)) {
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
		'.controllerlist .controller-name mouseover': function(context, $el) {
			if (hasTouchEvent) {
				return;
			}
			var controller = this.getControllerFromElem($el);
			this.removeOverlay();
			this.overlay(controller.rootElement, controller.__controllerContext.isRoot ? 'root'
					: 'child');
		},
		/**
		 * マウスアウト
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.controllerlist .controller-name mouseout': function(context, $el) {
			if (hasTouchEvent) {
				return;
			}
			this.removeOverlay();
		},
		/**
		 * コントローラリスト上のコントローラをクリック
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.controllerlist .controller-name click': function(context, $el) {
			if ($el.hasClass('selected')) {
				// 既に選択済み
				return;
			}
			var controller = this.getControllerFromElem($el);
			this.$find('.controller-name').removeClass('selected');
			$el.addClass('selected');
			this.selectedController = controller;

			this.setDetail(controller);

			// 選択したコントローラのルートエレメントについてボーダーだけのオーバレイを作成
			this.removeOverlay(true);
			this.overlay(controller.rootElement, [
					controller.__controllerContext.isRoot ? 'root' : 'child', 'borderOnly']);
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
			var controller = this.getControllerFromElem(this.$find('.controller-name.selected'));
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
				// TODO outerHTML見せられても分からないので、どうするか考える
				$option.text(this.outerHTML != null ? this.outerHTML.substring(0, 20) : this);
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
		 * 詳細画面(右側画面)をコントローラを基に作成。nullが渡されたら空白にする
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param controller
		 */
		setDetail: function(controller) {
			if (controller == null) {
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
			var methods = [];
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

			view.update(this.$find('.detail .tab-content .eventHandler'),
					'controller-eventHandler', {
						controller: controller.__controllerContext.controllerDef,
						eventHandlers: eventHandlers,
						_funcToStr: funcToStr
					});

			view.update(this.$find('.detail .tab-content .method'), 'controller-method', {
				controller: controller.__controllerContext.controllerDef,
				methods: methods,
				_funcToStr: funcToStr
			});

			// ログ
			var logAry = controller._h5debugContext.debugLog;
			h5.core.controller(this.$find('.operation-log'), operationLogController, {
				logArray: logAry
			});

			// その他情報
			var childControllers = getChildControllers(controller);
			var childControllerNames = [];
			for ( var i = 0, l = childControllers.length; i < l; i++) {
				childControllerNames.push(childControllers[i].__name);
			}
			view.update(this.$find('.detail .tab-content .otherInfo'), 'controller-otherInfo', {
				controller: controller,
				childControllerNames: childControllerNames,
				_formatDOM: formatDOM
			});
		},
		/**
		 * エレメントにコントローラを持たせる
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param el
		 * @param controller
		 */
		setControllerToElem: function(el, controller) {
			$(el).data('h5debug-controller', controller);
		},
		/**
		 * エレメントに覚えさせたコントローラを取得する
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param el
		 * @returns {Controller}
		 */
		getControllerFromElem: function(el) {
			return $(el).data('h5debug-controller');
		},
		/**
		 * コントローラの選択を解除
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 */
		unfocus: function() {
			this.setDetail(null);
			this.$find('.controller-name').removeClass('selected');
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
		 * コントローラをコントローラリストに追加
		 *
		 * @memberOf h5.debug.developer.ControllerDebugController
		 * @param controller
		 */
		appendControllerList: function(controller, $ul) {
			if (h5.u.str.startsWith(controller.__name, 'h5.debug.developer')) {
				// デバッグ用にバインドしたコントローラは無視
				return;
			}
			// コントローラに_h5debugContextを持たせる
			controller._h5debugContext = controller._h5debugContext || {};

			$ul = $ul || this.$find('.controllerlist:first');
			// コントローラにログ用のObservableArrayを持たせる
			if (!controller._h5debugContext.debugLog) {
				controller._h5debugContext.debugLog = createLogArray();
			}

			var isRoot = controller.__controllerContext.isRoot;
			var $li = $(view.get('controller-list-part', {
				name: controller.__name,
				cls: isRoot ? 'root' : 'child'
			}), $ul[0].ownerDocument);
			// データにコントローラを持たせる
			this.setControllerToElem($li.children('.controller-name'), controller);
			$ul.append($li);

			// 子コントローラも追加
			var childControllers = getChildControllers(controller);
			if (childControllers.length) {
				for ( var i = 0, l = childControllers.length; i < l; i++) {
					view.append($li, 'controller-list');
					this.appendControllerList(childControllers[i], $li.find('ul:last'));
				}
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
			this.$find('.controllerlist .controller-name').each(function() {
				if (that.getControllerFromElem(this) === controller) {
					$(this).closest('li').remove();
					return false;
				}
			});
		},

		refreshControllerList: function() {
			// コントローラ全て(ルートコントローラのみ)を取得
			var controllers = h5.core.controllerManager.getAllControllers();
			this.$find('.controllerlist').remove();
			view.append(this.$find('.left'), 'controller-list');

			// li要素を追加してデータ属性にコントローラを持たせる
			for ( var i = 0, l = controllers.length; i < l; i++) {
				this.appendControllerList(controllers[i]);
			}

			// 詳細画面を空にする
			this.setDetail(null);
		}
	};

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
	 * 全体の動作ログコントローラ<br>
	 *
	 * @name h5.debug-developer.OperationLogController
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
		__ready: function(context) {
			view.update(this.rootElement, 'operation-log');
			var logArray = context.args && context.args.logArray;
			if (logArray) {
				bindLogArray(view, this.rootElement, logArray);
				logArray._viewBindTarget = this.rootElement;
			}
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
		'{rootElement} logAppended': function() {
			// 更新時は最後のliについてだけやればいい
			this.refresh(this.$find('li:last'));
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
			$navTabs.find('.active').removeClass('active');
			$el.addClass('active');
			var targetContent = $el.data('tab-page');
			var $tabContentsRoot = $el.closest('.nav-tabs').next();
			$tabContentsRoot.find('.active').removeClass('active');
			$tabContentsRoot.find('.' + targetContent).addClass('active');
			this.trigger('tabChange', targetContent);
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
		_settingsController: settingController,
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		__meta: {
			_controllerDebugController: {
			// rootElementは__constructで追加してから設定している
			},
			_operationLogController: {

			},
			_settingsController: {}
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
			this.__meta._settingsController.rootElement = this.$find('.settings');
		},
		/**
		 * @memberOf h5.debug.developer.DebugController
		 */
		__ready: function() {
			bindLogArray(this.view, this.$find('.operation-log.whole'), wholeOperationLogs);
			wholeOperationLogs._viewBindTarget = this.$find('.operation-log.whole')[0];
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
	var aspect = {
		target: '*',
		interceptors: h5.u
				.createInterceptor(
						function(invocation, data) {
							var ctrlOrLogic = invocation.target;
							if (h5.u.str.startsWith(ctrlOrLogic.__name, 'h5.debug.developer')) {
								return invocation.proceed();
							}
							ctrlOrLogic._h5debugContext = ctrlOrLogic._h5debugContext || {};
							ctrlOrLogic._h5debugContext.methodTreeIndentLevel = ctrlOrLogic._h5debugContext.methodTreeIndentLevel || 0;
							var indentLevel = ctrlOrLogic._h5debugContext.methodTreeIndentLevel;
							var fName = invocation.funcName;
							var cls = '';
							if (fName.indexOf(' ') !== -1) {
								cls = ' event';
							} else if ($.inArray(fName, LIFECYCLE_METHODS) !== -1) {
								cls = 'lifecycle';
							} else if (fName.indexOf('_') === 0) {
								cls = 'private';
							} else {
								cls = 'public';
							}
							if (!ctrlOrLogic._h5debugContext.debugLog) {
								ctrlOrLogic._h5debugContext.debugLog = createLogArray();
							}
							var logObj = createLogObject(fName, cls, 'BEGIN', '',
									ctrlOrLogic.__name, indentLevel);
							ctrlOrLogic._h5debugContext.methodTreeIndentLevel += 1;
							data.logObj = logObj;
							addLogObject(ctrlOrLogic._h5debugContext.debugLog, logObj);

							// コントローラ全部、ロジック全部の横断動作ログ
							addLogObject(wholeOperationLogs, createLogObject(ctrlOrLogic.__name
									+ '#' + fName, cls, 'BEGIN', '', ctrlOrLogic.__name,
									wholeOperationLogsIndentLevel));
							wholeOperationLogsIndentLevel += 1;

							return invocation.proceed();
						},
						function(invocation, data) {
							var ctrlOrLogic = invocation.target;
							if (!ctrlOrLogic.__controllerContext) {
								// メソッド内でdisposeされた場合は何もしない
								return;
							}
							if (h5.u.str.startsWith(ctrlOrLogic.__name, 'h5.debug.developer')) {
								return;
							}
							ctrlOrLogic._h5debugContext = ctrlOrLogic._h5debugContext || {};
							ctrlOrLogic._h5debugContext.methodTreeIndentLevel = ctrlOrLogic._h5debugContext.methodTreeIndentLevel || 0;
							var cls = '';
							var fName = invocation.funcName;
							if (data.logObj) {
								cls = data.logObj.cls;
							} else {
								if (fName.indexOf(' ') !== -1) {
									cls = ' event';
								} else if ($.inArray(fName, LIFECYCLE_METHODS) !== -1) {
									cls = 'lifecycle';
								} else if (fName.indexOf('_') === 0) {
									cls = 'private';
								} else {
									cls = 'public';
								}
							}
							// プロミスの判定
							var ret = invocation.result;
							var isPromise = ret && $.isFunction(ret.promise)
									&& !h5.u.obj.isJQueryObject(ret) && $.isFunction(ret.done)
									&& $.isFunction(ret.fail);
							var promiseState = '';
							var tag = 'END';
							if (isPromise) {
								tag = 'DFD';
								// すでにresolve,rejectされていたら状態を表示
								if (ret.state() === 'resolved') {
									promiseState = '(RESOLVED)'
								} else if (ret.state() === 'rejected') {
									promiseState = '(REJECTED)';
								}
							}

							// ログオブジェクトの登録
							ctrlOrLogic._h5debugContext.methodTreeIndentLevel -= 1;
							ctrlOrLogic._h5debugContext.debugLog = ctrlOrLogic._h5debugContext.debugLog
									|| createLogArray();
							addLogObject(ctrlOrLogic._h5debugContext.debugLog, createLogObject(
									fName, cls, tag, promiseState, ctrlOrLogic.__name,
									ctrlOrLogic._h5debugContext.methodTreeIndentLevel));

							// コントローラ全部、ロジック全部の横断動作ログにログオブジェクトの登録
							wholeOperationLogsIndentLevel -= 1;
							if (wholeOperationLogsIndentLevel < 0) {
								wholeOperationLogsIndentLevel = 0;
							}
							addLogObject(wholeOperationLogs, createLogObject(ctrlOrLogic.__name
									+ '#' + fName, cls, tag, promiseState, ctrlOrLogic.__name,
									wholeOperationLogsIndentLevel));

							// promiseが返されてかつpendingならハンドラを登録
							// TODO
							// pendingのプロミスをメソッドが返した時にはpostに入ってこない。ログの表示方法はそれで大丈夫かどうか確認
							if (isPromise && ret.state() === 'pending') {
								// pendingなら、resolve,rejectされたタイミングでログを出す
								function doneHandler() {
									addLogObject(
											ctrlOrLogic._h5debugContext.debugLog,
											createLogObject(
													fName,
													cls,
													tag,
													'(RESOLVED)',
													ctrlOrLogic.__name,
													ctrlOrLogic._h5debugContext.methodTreeIndentLevel));
									addLogObject(wholeOperationLogs, createLogObject(
											ctrlOrLogic.__name + '#' + fName, cls, tag,
											'(RESOLVED)', ctrlOrLogic.__name,
											wholeOperationLogsIndentLevel));
								}
								function failHandler() {
									addLogObject(
											ctrlOrLogic._h5debugContext.debugLog,
											createLogObject(
													fName,
													cls,
													tag,
													'(REJECTED)',
													ctrlOrLogic.__name,
													ctrlOrLogic._h5debugContext.methodTreeIndentLevel));
									addLogObject(wholeOperationLogs, createLogObject(
											ctrlOrLogic.__name + '#' + fName, cls, tag,
											'(REJECTED)', ctrlOrLogic.__name,
											wholeOperationLogsIndentLevel));
								}
								if ($.isFunction(promise._h5UnwrappedCall)) {
									// h5なdeferredなら_h5UnwrapepedCallを使って登録
									promise._h5UnwrappedCall('done', doneHandler);
									promise._h5UnwrappedCall('fail', failHandler);
								} else {
									promise.done(doneHandler);
									promise.fail(failHandler);
								}
							}
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

	$(function() {
		debugWindow = openDebugWindow();
		h5.core.controller($(debugWindow.document).find('.h5debug'), debugController, {
			win: debugWindow
		});
	});
})();