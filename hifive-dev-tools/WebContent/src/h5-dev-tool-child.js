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
 *   version {version}
 *   gitCommitId : {gitCommitId}
 *   build at {timestamp}
 */

(function($) {
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
	/** ログのアップデートを行う際のディレイタイム(ms) */
	var LOG_DELAY = 100;
	/** ログのインデント幅 */
	var LOG_INDENT_WIDTH = 10;
	/** コントローラライフサイクルメソッド */
	var CONTROLLER_LIFECYCLE_METHODS = h5devtool.consts.CONTROLLER_LIFECYCLE_METHODS;
	/** ロジックライフサイクルメソッド */
	var LOGIC_LIFECYCLE_METHODS = h5devtool.consts.LOGIC_LIFECYCLE_METHODS;

	// ---------------------
	// メソッドタイプ
	// ---------------------
	var METHOD_TYPE_LIFECYCLE = h5devtool.consts.METHOD_TYPE_LIFECYCLE;
	var METHOD_TYPE_EVENT_HANDLER = h5devtool.consts.METHOD_TYPE_EVENT_HANDLER;
	var METHOD_TYPE_PUBLIC = h5devtool.consts.METHOD_TYPE_PUBLIC;
	var METHOD_TYPE_PRIVATE = h5devtool.consts.METHOD_TYPE_PRIVATE;

	// ---------------------
	// トレースログのタグ
	// ---------------------
	var TRACE_LOG_TAG_BEGIN = 'BEGIN';
	var TRACE_LOG_TAG_END = 'END&nbsp;&nbsp;';
	var TRACE_LOG_TAG_DFD = 'DFD&nbsp;&nbsp;';

	// ---------------------
	// diagイベント名
	// ---------------------
	/** diagイベント名 コントローラバインド時 */
	var DIAG_EVENT_CONTROLLER_BOUND = h5devtool.consts.DIAG_EVENT_CONTROLLER_BOUND;
	/** diagイベント名 コントローラアンバインド時 */
	var DIAG_EVENT_CONTROLLER_UNBOUND = h5devtool.consts.DIAG_EVENT_CONTROLLER_UNBOUND;
	/** diagイベント名 ロジック化時 */
	var DIAG_EVENT_LOGIC_BOUND = h5devtool.consts.DIAG_EVENT_LOGIC_BOUND;
	/** diagイベント名 メソッド実行直前 */
	var DIAG_EVENT_BEFORE_METHOD_INVOKE = h5devtool.consts.DIAG_EVENT_BEFORE_METHOD_INVOKE;
	/** diagイベント名 メソッド実行直後 */
	var DIAG_EVENT_AFTER_METHOD_INVOKE = h5devtool.consts.DIAG_EVENT_AFTER_METHOD_INVOKE;
	/** diagイベント名 非同期メソッド完了時 */
	var DIAG_EVENT_ASYNC_METHOD_COMPLETE = h5devtool.consts.DIAG_EVENT_ASYNC_METHOD_COMPLETE;
	/** diagイベント名 ログ出力時 */
	var DIAG_EVENT_LOG = h5devtool.consts.DIAG_EVENT_LOG;
	/** diagイベント名 エラー発生時 */
	var DIAG_EVENT_ERROR = h5devtool.consts.DIAG_EVENT_ERROR;

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
	var isDisposed = h5devtool.util.isDisposed;

	// =========================================================================
	//
	// Privates
	//
	// =========================================================================
	// =============================
	// Variables
	// =============================
	/**
	 * devtool設定オブジェクト
	 *
	 * @type {ObservableItem}
	 */
	var h5devtoolSettings = h5.core.data.createObservableItem({
		LogLengthLimit: {
			type: 'integer',
			defaultValue: 1000,
			constraint: {
				notNull: true,
				min: 0
			}
		}
	});

	/**
	 * devtoolコントローラバインド前に渡されたdiagメッセージを覚えておく配列
	 *
	 * @type {Object[]}
	 */
	var notProcessedMessages = [];

	/**
	 * devtoolコントローラインスタンス
	 *
	 * @type {Controller}
	 */
	var devtoolController = null;

	/**
	 * コントローラまたはロジックのインスタンスのidとバインド時のメッセージのマップ
	 *
	 * @type {Object}
	 */
	var instanceMap = {};

	// =============================
	// Functions
	// =============================
	/**
	 * LogManagerクラス
	 * <p>
	 * </p>
	 *
	 * @class
	 */
	function LogManager() {
		this._instanceLogMap = {};
		this._loggerLog = this._createLogObservableArray();
		this._wholeLog = this._createLogObservableArray();
		this._executingIdStack = [];
		this._lengthLimit = 1000;
	}
	$.extend(LogManager.prototype, {
		getInstanceLog: function(instanceId) {
			// 無ければ作る
			this._instanceLogMap[instanceId] = this._instanceLogMap[instanceId]
					|| this._createLogObservableArray(this._loggerLog);
			return this._instanceLogMap[instanceId];
		},
		getWholeLog: function() {
			return this._wholeLog;
		},
		getLoggerLog: function() {
			return this._loggerLog;
		},
		appendLog: function(logObj) {
			var id = logObj.instanceId;
			var targetLogArrays = [];
			if (!id) {
				this._pushLog(logObj, this._wholeLog);
				this._pushLog(logObj, this._loggerLog);
				targetLogArrays.push(this.loggerLog);
				for ( var p in this._instanceLogMap) {
					this._pushLog(logObj, this._instanceLogMap[p]);
				}
			} else {
				// 呼び出し側の取得
				var callerId = null;
				if (logObj.tag === TRACE_LOG_TAG_BEGIN) {
					callerId = this._executingIdStack[this._executingIdStack.length - 1];
					this._executingIdStack.push(id);
				} else if (logObj.tag === TRACE_LOG_TAG_END) {
					this._executingIdStack.pop();
					callerId = this._executingIdStack[this._executingIdStack.length - 1];
				}

				// 全体のトレースログに追加
				this._pushLog(this._createTraceLog(logObj), this._wholeLog);


				// メソッドを持つインスタンスのログと呼び出し側のログに追加
				// 無い場合は作成
				this.getInstanceLog(id);
				for ( var p in this._instanceLogMap) {
					// プロパティが"1"のような文字列だとfor-inループで取得した時に数値になってしまうため
					// ===ではなく==で比較
					if (p == id || (callerId && p == callerId)) {
						this._pushLog(this._createTraceLog(logObj, p == id),
								this._instanceLogMap[p]);
					}
				}
			}
		},

		setLogLengthLimit: function(limitLength) {
			this._lengthLimit = limitLength;
			var targets = [];
			for ( var id in this._instanceLogMap) {
				var logArray = this._instanceLogMap[i];
				targets.push(logArray);
			}
			targets.push(this._wholeLog);
			targets.push(this._loggerLog);

			// 最大数を超えているなら取り除く
			for (var i = 0, l = targets.length; i < l; i++) {
				if (length - limitLength + 1 > 0) {
					logArray.splice(length - limitLength + 1, length - 1);
				}
			}
		},
		_pushLog: function(logObj, targetArray) {
			var indentLevel = targetArray._nextIndentLevel;
			if (logObj.tag === TRACE_LOG_TAG_BEGIN) {
				targetArray._nextIndentLevel++;
			} else if (logObj.tag === TRACE_LOG_TAG_END) {
				indentLevel--;
				targetArray._nextIndentLevel--;
			}
			logObj.indentWidth = indentLevel < 0 ? 0 : indentLevel * LOG_INDENT_WIDTH;
			if (this._lengthLimit === targetArray.length) {
				targetArray.shift();
			}
			targetArray.push(logObj);
		},

		_createLogObservableArray: function(org) {
			var ary = h5.core.data.createObservableArray();
			ary._nextIndentLevel = 0;
			if (org) {
				ary.copyFrom(org);
			}
			return ary;
		},

		_createTraceLog: function(logObj, onlyMethodName) {
			var message = onlyMethodName ? logObj.method : logObj.name + '#' + logObj.method;
			return {
				promiseState: logObj.promiseState ? '(' + logObj.promiseState.toUpperCase() + ')'
						: '',
				message: message,
				instanceId: logObj.instanceId,
				method: logObj.method,
				methodType: logObj.methodType,
				tag: logObj.tag,
				time: logObj.time
			};
		}
	});

	/**
	 * タイムスタンプをフォーマット
	 *
	 * @param {number} time
	 * @returns {String} フォーマットした日付文字列
	 */
	function formatTime(time) {
		function formatDigit(val, digit) {
			var d = digit - ("" + val).length;
			for (var i = 0; i < d; i++) {
				val = '0' + val;
			}
			return val;
		}
		var date = new Date(time);
		var h = formatDigit(date.getHours(), 2);
		var m = formatDigit(date.getMinutes(), 2);
		var s = formatDigit(date.getSeconds(), 2);
		var ms = formatDigit(date.getMilliseconds(), 3);
		return h5.u.str.format('{0}:{1}:{2}.{3}', h, m, s, ms);
	}

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	// メッセージを受けるハンドラ
	// ディベロッパコントローラのバインド前のメッセージも受け取りたいので
	// コントローラバインド前にリスナを設定する
	window.addEventListener('message', function(event) {
		if (event.origin !== TARGET_ORIGIN) {
			// オリジンが違う場合はreturn
			return;
		}
		if (devtoolController) {
			// devtoolコントローラのバインドが完了しているならメソッド呼び出し
			devtoolController.messageListener(event.data);
			return;
		}
		// devtoolコントローラのバインドがまだされていないならメッセージを覚えておく
		notProcessedMessages.push(event.data);
	}, false);
	h5.u.obj.expose('h5devtool', {
		messageListenerAdded: true
	});

	// =============================
	// コントローラ定義
	// =============================
	(function() {
		/**
		 * コンテキストメニューコントローラ
		 *
		 * @class
		 * @name h5devtool.ui.ContextMenuController
		 */
		var contextMenuController = {

			/**
			 * @memberOf h5devtool.ui.ContextMenuController
			 */
			__name: 'h5devtool.ui.ContextMenuController',

			_contextMenu: null,

			contextMenuExp: '',

			targetAll: true,

			__construct: function(context) {
				if (context.args) {
					var targetAll = context.args.targetAll;
					if (targetAll != undefined) {
						this.targetAll = context.args.targetAll;
					}
					var contextMenuExp = context.args.contextMenuExp;
					if (contextMenuExp != undefined) {
						this.contextMenuExp = context.args.contextMenuExp;
					}
				}
			},

			__ready: function(context) {
				var root = $(this.rootElement);
				var targetAll = root.attr('data-targetall');
				if (targetAll != undefined) {
					if (/false/i.test(targetAll)) {
						targetAll = false;
					}
					this.targetAll = !!targetAll;
				}
				var contextMenuExp = root.attr('data-contextmenuexp');
				if (contextMenuExp != undefined) {
					this.contextMenuExp = context.args.contextMenuExp;
				}
				this.close();
			},

			_getContextMenu: function(exp) {
				return this.$find('> .contextMenu' + (exp || this.contextMenuExp));
			},

			close: function(selected) {
				var $contextMenu = this.$find('> .contextMenu');

				if (!$contextMenu.hasClass('open')) {
					// 既に閉じているなら何もしない(イベントもあげない)
					return;
				}
				// selectMenuItemイベントを上げる
				// 選択されたアイテムがあれば、それを引数に入れる
				// そもそもopenしていなかったらイベントは上げない
				this.trigger('selectMenuItem', {
					selected: selected ? selected : null
				});

				$contextMenu.css({
					display: 'none'
				});
				$contextMenu.removeClass('open');
				// イベントを上げる
				this.trigger('hideCustomMenu');
			},

			_open: function(context, exp) {
				var $contextMenu = this._getContextMenu(exp);

				// イベントを上げる
				// 既にopenしていたらイベントは上げない
				if (!$contextMenu.hasClass('open')) {
					var e = this.trigger('showCustomMenu', {
						orgContext: context
					});
					if (e.isDefaultPrevented()) {
						// preventDefaultされていたらメニューを出さない
						return;
					}
				}

				$contextMenu.css({
					display: 'block',
					visibility: 'hidden',
					left: 0,
					top: 0
				});
				// contextMenu要素のスタイルの取得、offsetParentの取得はjQueryを使わないようにしている
				// jQuery2.0.Xで、windowに属していない、別ウィンドウ内の要素についてwindow.getComputedStyle(elm)をしており、
				// IEだとそれが原因でエラーになるため。
				$contextMenu.addClass('open');
				var pageX, pageY;
				if (context.event.originalEvent.targetTouches) {
					// タッチイベントの場合
					var touch = context.event.originalEvent.targetTouches[0];
					pageX = touch.pageX;
					pageY = touch.pageY;
				} else {
					pageX = context.event.pageX;
					pageY = context.event.pageY;
				}
				var offsetParent = getOffsetParent($contextMenu);
				var offsetParentOffset = $(offsetParent).offset();
				var left = pageX - offsetParentOffset.left;
				var top = pageY - offsetParentOffset.top;
				var outerWidth = getOuterWidth($contextMenu);
				var outerHeight = getOuterHeight($contextMenu);
				var scrollLeft = scrollPosition('Left')();
				var scrollTop = scrollPosition('Top')();
				var windowWidth = getDisplayArea('Width');
				var windowHeight = getDisplayArea('Height');
				var windowRight = scrollLeft + windowWidth;
				var windowBottom = scrollTop + windowHeight;
				var right = left + outerWidth;
				if (right > windowRight) {
					left = windowRight - outerWidth;
					if (left < scrollLeft)
						left = scrollLeft;
				}
				var bottom = top + outerHeight;
				if (bottom > windowBottom) {
					top = top - outerHeight;
					if (top < scrollTop)
						top = scrollTop;
				}

				initSubMenu($contextMenu, right, top);

				$contextMenu.css({
					visibility: 'visible',
					left: left,
					top: top
				});

				function initSubMenu(menu, _right, _top) {
					menu.find('> .dropdown-submenu > .dropdown-menu').each(function() {
						var subMenu = $(this);
						var nextRight;
						var display = subMenu[0].style.display;
						subMenu.css({
							display: 'block'
						});
						var subMenuWidth = subMenu.outerWidth(true);
						if (subMenuWidth > windowRight - _right) {
							subMenu.parent().addClass('pull-left');
							nextRight = _right - subMenuWidth;
						} else {
							subMenu.parent().removeClass('pull-left');
							nextRight = _right + subMenuWidth;
						}

						var parent = subMenu.parent();
						var subMenuTop = _top + parent.position().top;
						var subMenuHeight = subMenu.outerHeight(true);
						if (subMenuHeight > windowBottom - subMenuTop) {
							subMenuTop = subMenuTop - subMenuHeight + parent.height();
							subMenu.css({
								top: 'auto',
								bottom: '0'
							});
						} else {
							subMenu.css({
								top: '0',
								bottom: 'auto'
							});
						}

						initSubMenu(subMenu, nextRight, subMenuTop);

						subMenu.css({
							display: display
						});
					});
				}

				//hifiveから流用(13470)
				function getDisplayArea(prop) {
					var compatMode = (document.compatMode !== 'CSS1Compat');
					var e = compatMode ? document.body : document.documentElement;
					return h5.env.ua.isiOS ? window['inner' + prop] : e['client' + prop];
				}

				//hifiveから流用(13455)
				function scrollPosition(propName) {
					var compatMode = (document.compatMode !== 'CSS1Compat');
					var prop = propName;

					return function() {
						// doctypeが「XHTML1.0 Transitional DTD」だと、document.documentElement.scrollTopが0を返すので、互換モードを判定する
						// http://mokumoku.mydns.jp/dok/88.html
						var elem = compatMode ? document.body : document.documentElement;
						var offsetProp = (prop === 'Top') ? 'Y' : 'X';
						return window['page' + offsetProp + 'Offset'] || elem['scroll' + prop];
					};
				}
			},

			/**
			 * コンテキストメニューを出す前に実行するフィルタ。 falseを返したらコンテキストメニューを出さない。
			 * 関数が指定された場合はその関数の実行結果、セレクタが指定された場合は右クリック時のセレクタとマッチするかどうかを返す。
			 */
			_filter: null,

			/**
			 * コンテキストメニューを出すかどうかを判定するフィルタを設定する。 引数には関数またはセレクタを指定できる。
			 * 指定する関数はcontextを引数に取り、falseを返したらコンテキストメニューを出さないような関数を指定する。
			 * セレクタを指定した場合は、右クリック時のevent.targetがセレクタにマッチする場合にコンテキストメニューを出さない。
			 *
			 * @memberOf ___anonymous46_5456
			 * @param selectorOrFunc
			 */
			setFilter: function(selectorOrFunc) {
				if (selectorOrFunc == null) {
					this._filter = null;
				} else if ($.isFunction(selectorOrFunc)) {
					// 渡された関数をthis._filterにセット
					this._filter = selectorOrFunc;
				} else if (typeof (selectorOrFunc) === 'string') {
					this._filter = function(context) {
						// targetがセレクタとマッチしたらreturn false;
						if ($(context.event.target).filter(selectorOrFunc).length) {
							return false;
						}
					};
				}
			},

			'.trace-list>li>* touchstart': function(context) {
				this._contextmenu(context);
			},

			'{rootElement} contextmenu': function(context) {
				this._contextmenu(context);
			},

			'{document.body} click': function(context) {
				this.close();
			},

			'{document.body} contextmenu': function(context) {
				this.close();
			},

			'.contextMenuBtn contextmenu': function(context) {
				context.event.preventDefault();
				context.event.stopPropagation();
				var current = context.event.currentTarget;
				var exp = $(current).attr('data-contextmenuexp');
				this._open(context, exp);
			},

			'> .contextMenu .dropdown-menu click': function(context) {
				context.event.stopPropagation();
				this.close();
			},
			//
			//		'> .contextMenu .dropdown-submenu click': function(context) {
			//			context.event.stopPropagation();
			//		},
			//
			//		'> .contextMenu contextmenu': function(context) {
			//			context.event.stopPropagation();
			//		},
			//
			//		'> .contextMenu click': function(context) {
			//			context.event.stopPropagation();
			//		},

			'> .contextMenu li a click': function(context) {
				context.event.stopPropagation();
				this.close(context.event.target);
			},

			_contextmenu: function(context) {
				this.close();
				// _filterがfalseを返したら何もしない
				if (this._filter && this._filter(context) === false) {
					return;
				}
				if (this.targetAll) {
					context.event.preventDefault();
					context.event.stopPropagation();
					this._open(context);
				}
			}
		};
		h5.core.expose(contextMenuController);
	})();

	(function() {
		/**
		 * タブコントローラ タブ表示切替をサポートする
		 *
		 * @name h5devtool.TabController
		 */
		var tabController = {
			/**
			 * @memberOf h5devtool.TabController
			 */
			__name: 'h5devtool.TabController',
			/**
			 * @memberOf h5devtool.TabController
			 */
			__ready: function() {
				// 非アクティブのものを非表示
				this.$find('tab-content').not('.active').css('display', 'none');
			},
			/**
			 * 指定されたクラスのタブへ切替
			 *
			 * @param {String} tabClass タブのクラス名
			 */
			selectTab: function(tabClass) {
				this.$find('.nav-tabs li.' + tabClass).trigger('click');
			},
			/**
			 * タブをクリック
			 *
			 * @memberOf h5devtool.TabController
			 * @param context
			 * @param $el
			 */
			'.nav-tabs li click': function(context, $el) {
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
		h5.core.expose(tabController);
	})();

	(function() {
		/**
		 * InstanceInfoController
		 * <p>
		 * コントローラ及びロジックの情報を表示するコントローラ
		 * </p>
		 *
		 * @name h5devtool.InstanceInfoController
		 */
		var InstanceInfoController = {
			/**
			 * @name h5devtool.InstanceInfoController
			 */
			__name: 'h5devtool.InstanceInfoController',

			/**
			 * @memberOf h5devtool.InstanceInfoController
			 */
			_parentWin: null,

			/**
			 * @memberOf h5devtool.InstanceInfoController
			 */
			_$detailView: null,

			/**
			 * @memberOf h5devtool.InstanceInfoController
			 */
			_instanceMap: null,

			/**
			 * @memberOf h5devtool.InstanceInfoController
			 */
			_logManager: null,

			/**
			 * 選択中のコントローラまたはロジック
			 *
			 * @name h5devtool.InstanceInfoController
			 */
			_selectedTarget: null,

			__construct: function(ctx) {
				this._parentWin = ctx.args.parentWindow;
				this._instanceMap = ctx.args.instanceMap;
				this._logManager = ctx.args.logManager;
			},

			__init: function() {
				// コントローラの詳細表示エリア
				this.$find('.right>.detail').css('display', 'none');
				this._$detailView = this.$find('.right');
			},

			/**
			 * クローズ時のイベント
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 */
			'{.h5devtool} close': function() {
				this.removeOverlay(true);
			},
			/**
			 * コントローラまたはロジックの選択を解除
			 */
			'{.h5devtool} unfocus': function() {
				this.unfocus();
			},

			/**
			 * マウスオーバーでコントローラのバインド先オーバレイ表示
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param context
			 * @param $el
			 */
			'.targetlist .target-name mouseover': function(context, $el) {
				var instanceId = $el.data('instance-id');
				this.showOverlay(instanceId);
			},
			/**
			 * マウスアウト
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param context
			 * @param $el
			 */
			'.targetlist .target-name mouseout': function(context, $el) {
				this.removeOverlay();
			},

			/**
			 * コントローラリスト上のコントローラをクリック
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param context
			 * @param $el
			 */
			'.targetlist .target-name click': function(context, $el) {
				if ($el.hasClass('selected')) {
					// 既に選択済み
					return;
				}

				this.$find('.target-name').removeClass('selected');
				$el.addClass('selected');

				var instanceId = $el.data('instance-id');
				var target = this._instanceMap[instanceId];
				this.setTarget(target);
				// ターゲットリストと紐づいているオーバレイ要素を取得
				//				var $overlay = $el.data('h5devtool-overlay');
				//				if ($overlay) {
				//					this.removeOverlay(true, $overlay);
				//					// ボーダーだけのオーバレイに変更
				//					$('.h5devtool-overlay').addClass('borderOnly');
				//				}
			},

			setTarget: function(target) {
				this._selectedTarget = target;
				this.setDetail(target);
			},

			/**
			 * イベントハンドラにマウスオーバーで選択(PC用)
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 */
			' .eventHandler li:not(.selected) mouseover': function(context, $el) {
				this.selectEventHandler($el);
			},
			/**
			 * イベントハンドラをクリックで選択(タブレット用)
			 *
			 * @memberOf h5devtool.DevtoolController
			 */
			'.eventHandler li:not(.selected) click': function(context, $el) {
				this.selectEventHandler($el);
			},
			/**
			 * イベントハンドラからカーソルを外した時(PC用)
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 */
			' .eventHandler li.selected mouseleave': function(context, $el) {
				this.selectEventHandler(null);
			},

			/**
			 * イベントを実行
			 */
			' .eventHandler .trigger click': function(context, $el) {
				var evName = $.trim($el.closest('li').find('.name').text()).match(/ (\S+)$/)[1];
				var target = $el.closest('.menu').find('option:selected').data(
						'h5devtool-eventTarget');
				if (target) {
					// TODO evNameがmouse/keyboard/touch系ならネイティブのイベントでやる
					$(target).trigger(evName);
				} else {
					alert('イベントターゲットがありません');
				}
			},

			/**
			 * メソッドにジャンプ
			 */
			'.method-select change': function(context, $el) {
				var method = $el.val();
				var $methodList = $el.parents('.active').eq(0).find('.method-list');
				scrollByMethodName($methodList, method, true);
			},

			/**
			 * タブの切り替え
			 */
			'{.h5devtool} tabChange': function(context) {
				var target = context.evArg;
				if (target !== 'eventHandler') {
					// イベントハンドラの選択状態を解除
					this.removeOverlay();
					this.$find('.eventHandler li').removeClass('selected');
				}
			},

			/**
			 * イベントハンドラの選択
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param $el
			 */
			selectEventHandler: function($el) {
				this.$find('.eventHandler li').removeClass('selected');
				this.removeOverlay();
				if ($el == null) {
					return;
				}
				$el.addClass('selected');
				var instanceId = $el.data('instance-id');
				var target = this._instanceMap[instanceId];
				var selector = $.trim($el.find('.name').text());
				var $target = this.selectEventHandlerTarget(selector, instanceId);

				// 取得結果を保存。これはクリックしてイベントを発火させるとき用です。
				// 再度mosueoverされ場合は新しく取得しなおします。
				$el.data('h5devtool-eventTarget', $target);
				this.overlay($target, 'event-target');

				// 実行メニューの表示
				var $select = $el.closest('li').find('select.eventTarget').html('');
				if (!$target.length) {
					var $option = $(devtoolWindow.document.createElement('option'));
					$option.text('該当なし');
					$select.append($option);
					$select.attr('disabled', 'disabled');
				} else {
					$target.each(function() {
						var $option = $(devtoolWindow.document.createElement('option'));
						$option.data('h5devtool-eventTarget', this);
						$option.text(formatDOM(this));
						$select.append($option);
					});
				}
			},

			/**
			 * 親ウィンドウのイベントハンドラのターゲットの選択を行う
			 * <p>
			 * 実行ボタン押下時に選択したイベントハンドラターゲットに対してイベントを実行できるようにする
			 * </p>
			 */
			selectEventHandlerTarget: function() {
			// TODO
			},


			/**
			 * 詳細画面をクリア(要素の削除とコントローラのdispose)
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param target
			 */
			_clearDetailView: function() {
				// 詳細ビューに表示されているコントローラを取得
				var controllers = h5.core.controllerManager.getControllers(this._$detailView, {
					deep: true
				});
				// 元々詳細ビューにバインドされていたコントローラをdispose
				for (var i = 0, l = controllers.length; i < l; i++) {
					controllers[i].dispose();
				}
				this.$find('.right').html('');
			},

			/**
			 * 詳細画面(右側画面)をコントローラまたはロジックを基に作成。nullが渡されたら空白にする
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param diagMessage
			 */
			setDetail: function(diagMessage) {
				this._clearDetailView();
				if (diagMessage == null) {
					return;
				}

				// methodCountオブジェクトを持たせる
				//				var devtoolContext = getDevtoolContext(target);
				//				if (!devtoolContext.methodCount._method) {
				//					devtoolContext.methodCount._method = new MethodCount(target);
				//				}

				// コントローラの場合はコントローラの詳細ビューを表示
				if (diagMessage.type === DIAG_EVENT_CONTROLLER_BOUND) {
					this._showControllerDetail(diagMessage);
				} else {
					// ロジックの場合はロジックの詳細ビューを表示
					this._showLogicDetail(diagMessage);
				}
			},

			/**
			 * コントローラの詳細表示
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param controller
			 */
			_showControllerDetail: function(diagMessage) {
				var instanceId = diagMessage.instanceId;
				this.view.update(this.$find('.right'), 'controller-detail');

				// メソッドを列挙
				var lifecycleMethods = [];
				var publicMethods = [];
				var privateMethods = [];
				var eventHandlers = [];
				var methodMap = diagMessage.methodMap;
				for ( var p in methodMap) {
					var methodInfo = methodMap[p];
					switch (methodInfo.methodType) {
					case METHOD_TYPE_LIFECYCLE:
						lifecycleMethods.push(p);
						break;
					case METHOD_TYPE_EVENT_HANDLER:
						eventHandlers.push(p);
						break;
					case METHOD_TYPE_PRIVATE:
						privateMethods.push(p);
						break;
					default:
						privateMethods.push(p);
						break;
					}
				}
				// ソート
				lifecycleMethods.sort(function(a, b) {
					return $.inArray(a, CONTROLLER_LIFECYCLE_METHODS)
							- $.inArray(b, CONTROLLER_LIFECYCLE_METHODS);
				});
				publicMethods.sort();
				privateMethods.sort();
				eventHandlers.sort();
				// ライフサイクル→public→privateの順に並べる
				var methods = lifecycleMethods.concat(publicMethods.concat(privateMethods));

				this._updateEventHandlerView({
					instanceId: instanceId,
					methodMap: methodMap,
					eventHandlers: eventHandlers
				});

				this._updateMethodView({
					instanceId: instanceId,
					methodMap: methodMap,
					methods: methods
				});

				// トレースログ
				var $logTab = this.$find('.instance-detail .trace');
				this.view.append($logTab, 'trace-log');
				h5.core.controller($logTab, h5devtool.LogController).setLogArray(
						this._logManager.getInstanceLog(instanceId));

				// その他情報
				// 子コントローラの列挙
				var childrenNames = [];
				for ( var p in this._instanceMap) {
					var tmp = this._instanceMap[p];
					if (tmp.parentId === instanceId) {
						childrenNames.push(tmp.name);
					}
				}
				var rootInstance = this._instanceMap[diagMessage.rootId];
				var rootName = rootInstance.name;

				var parentInstance = this._instanceMap[diagMessage.parentId];
				var parentName = parentInstance ? parentInstance.name : 'なし';

				this.view.update(this.$find('.instance-detail .tab-content .otherInfo'),
						'controller-otherInfo', {
							instanceName: diagMessage.name,
							isRoot: diagMessage.isRoot,
							rootElement: diagMessage.rootElement,
							parentName: parentName,
							rootName: rootName,
							childrenNames: childrenNames,
							templates: diagMessage.templates,
							availableTemplates: diagMessage.availableTemplates,
							registedTemplates: diagMessage.registedTemplates
						});
			},

			/**
			 * ロジックの詳細表示
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param logic
			 */
			_showLogicDetail: function(diagMessage) {
				var instanceId = diagMessage.instanceId;
				this.view.update(this.$find('.right'), 'logic-detail');

				// メソッドとイベントハンドラを列挙
				var lifecycleMethods = [];
				var publicMethods = [];
				var privateMethods = [];
				var methodMap = diagMessage.methodMap;
				for ( var p in methodMap) {
					var methodInfo = methodMap[p];
					switch (methodInfo.methodType) {
					case METHOD_TYPE_LIFECYCLE:
						lifecycleMethods.push(p);
						break;
					case METHOD_TYPE_PRIVATE:
						privateMethods.push(p);
						break;
					default:
						privateMethods.push(p);
						break;
					}
				}
				// ソート
				lifecycleMethods.sort(function(a, b) {
					return $.inArray(a, LOGIC_LIFECYCLE_METHODS)
							- $.inArray(b, LOGIC_LIFECYCLE_METHODS);
				});
				publicMethods.sort();
				privateMethods.sort();
				// ライフサイクル→public→privateの順に並べる
				var methods = lifecycleMethods.concat(publicMethods.concat(privateMethods));

				this._updateMethodView({
					instanceId: instanceId,
					methodMap: methodMap,
					methods: methods
				});

				// トレースログ
				var $logTab = this.$find('.instance-detail .trace');
				this.view.append($logTab, 'trace-log');
				h5.core.controller($logTab, h5devtool.LogController).setLogArray(
						this._logManager.getInstanceLog(instanceId));

				// その他情報
				// 子ロジックの列挙
				var childrenNames = [];
				for ( var p in this._instanceMap) {
					var tmp = this._instanceMap[p];
					if (tmp.parentId === instanceId) {
						childrenNames.push(tmp.name);
					}
				}
				var rootInstance = this._instanceMap[diagMessage.rootId];
				var rootName = rootInstance.name;

				var parentInstance = this._instanceMap[diagMessage.parentId];
				var parentName = parentInstance ? parentInstance.name : 'なし';

				this.view.update(this.$find('.instance-detail .tab-content .otherInfo'),
						'logic-otherInfo', {
							instanceName: diagMessage.name,
							isRoot: diagMessage.isRoot,
							parentName: parentName,
							rootName: rootName,
							childrenNames: childrenNames
						});
			},

			_updateEventHandlerView: function(obj) {
				var $target = this.$find('.instance-detail .tab-content .eventHandler');
				// viewの更新
				this.view.update($target, 'eventHandler-list', obj);
				// セレクトボックスを追加
				var $select = $target.find('.method-select');
				for (var i = 0, l = obj.eventHandlers.length; i < l; i++) {
					$select.append(h5.u.str.format('<option value="{0}">{0}</option>',
							obj.eventHandlers[i]));
				}
			},

			_updateMethodView: function(obj) {
				var $target = this.$find('.instance-detail .tab-content .method');
				// viewの更新
				this.view.update($target, 'method-list', obj);
				// セレクトボックスを追加
				var $select = $target.find('.method-select');
				for (var i = 0, l = obj.methods.length; i < l; i++) {
					$select.append(h5.u.str.format('<option value="{0}">{0}</option>',
							obj.methods[i]));
				}
			},

			/**
			 * メソッドの実行回数を更新
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param instanceId
			 * @param method メソッド名
			 * @param count 実行回数
			 */
			methodCount: function(instanceId, method, count) {
				if (!this._selectedTarget || this._selectedTarget.instanceId !== instanceId) {
					return;
				}
				this.$find(
						'.method-list [data-method-name="' + h5.u.str.escapeHtml(method)
								+ '"] .count').text(count);
			},

			/**
			 * エレメントにコントローラまたはロジックのIDを持たせる
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param el
			 * @param target
			 */
			setTargetToElem: function(el, target) {
				$(el).data('h5devtool-targetId', getDevtoolContext(target).id);
			},
			/**
			 * エレメントに覚えさせたコントローラまたはロジックを取得する
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param el
			 * @returns {Controller|Logic}
			 */
			getTargetFromElem: function(el) {
				return getDevtoolTarget($(el).data('h5devtool-targetId'));
			},
			/**
			 * 選択を解除
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 */
			unfocus: function() {
				this.setDetail(null);
				this.$find('.target-name').removeClass('selected');
				this.removeOverlay(true);
			},
			/**
			 * 引数に指定された要素にオーバレイ
			 *
			 * @param elem オーバレイ対象要素
			 * @param classNames オーバレイ要素に追加するクラス名
			 * @returns 追加したオーバレイ要素
			 * @memberOf h5devtool.InstanceInfoController
			 */
			overlay: function(elem, classNames) {
				var className = ($.isArray(classNames) ? classNames : [classNames]).join(' ');
				var $el = $(elem);
				var $ret = $();
				$el.each(function() {
					var $overlay = $(view.get('overlay', {
						cls: className
					}));

					var width = $(this).outerWidth();
					var height = $(this).outerHeight();
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

					$(window.document.body).append($overlay);
					$ret = $ret.add($overlay);
				});
				return $ret;
			},
			/**
			 * オーバレイの削除。deleteAllにtrueが指定された場合ボーダーだけのオーバーレイも削除
			 *
			 * @param {Boolean} [deleteAll=false] ボーダーだけのオーバレイも削除するかどうか
			 * @param {jQuery} $exclude 除外するオーバーレイ要素
			 * @memberOf h5devtool.InstanceInfoController
			 */
			removeOverlay: function(deleteAll, $exclude) {
			// TODO
			//				this.parentWin.postMessage({
			//					deleteAll: deleteAll,
			//					instanceId: instanceId
			//				}, TARGET_ORIGIN);
			},
			/**
			 * オーバレイの表示。
			 *
			 * @param {Boolean} [deleteAll=false] ボーダーだけのオーバレイも削除するかどうか
			 * @param {jQuery} $exclude 除外するオーバーレイ要素
			 * @memberOf h5devtool.InstanceInfoController
			 */
			showOverlay: function(deleteAll, $exclude) {
			// TODO
			//				this.parentWin.postMessage({
			//					deleteAll: deleteAll,
			//					instanceId: instanceId
			//				}, TARGET_ORIGIN);
			},
			/**
			 * コントローラまたはロジックをコントローラリストに追加
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param diagMessage
			 */
			appendToList: function(diagMessage) {
				var $ul;
				var parentId = diagMessage.parentId;
				if (parentId) {
					// 親のliを探してその中にulを作る
					var $parentLi = this
							.$find('.targetlist *[data-instance-id="' + parentId + '"]').closest(
									'li');
					$ul = $('<ul class="targetlist">');
					$parentLi.append($ul);
				} else {
					$ul = this.$find('.targetlist.root');
				}

				this.view.append($ul, 'instance-list', {
					name: diagMessage.name,
					instanceId: diagMessage.instanceId,
					cls: diagMessage.isRoot ? 'root' : 'child'
				});
			},
			/**
			 * コントローラまたはロジックをコントローラリストから削除
			 *
			 * @memberOf h5devtool.InstanceInfoController
			 * @param target
			 */
			removeTargetList: function(target) {
				var $selected = this.$find('.selected');
				if (target === this.getTargetFromElem($selected)) {
					this.unfocus();
				}
				var that = this;
				this.$find('.targetlist .target-name').each(function() {
					if (that.getTargetFromElem(this) === target) {
						$(this).closest('li').remove();
						return false;
					}
				});
				removeDevtoolTarget(getDevtoolContext(target).id);
			}
		};
		h5.core.expose(InstanceInfoController);
	})();

	(function() {
		/**
		 * デバッガの設定を行うコントローラ
		 *
		 * @name h5devtool.SettingsController
		 */
		var settingsController = {
			/**
			 * @memberOf h5devtool.SettingsController
			 */
			__name: 'h5devtool.SettingsController',

			/**
			 * @memberOf h5devtool.SettingsController
			 */
			__ready: function(ctx) {
				var logManager = ctx.args.logManager;
				// settingsをバインドする
				this.view.bind(this.rootElement, h5devtoolSettings);

				// 初期設定
				logManager.setLogLengthLimit(h5devtoolSettings.get('LogLengthLimit'));

				h5devtoolSettings.addEventListener('change', function(e) {
					// ログ最大保持数の設定
					for ( var p in e.props) {
						switch (p) {
						case 'LogLengthLimit':
							logManager.setLogLengthLimit(e.props.LogLengthLimit.newValue);
							break;
						}
					}
				});
			},
			/**
			 * @memberOf h5devtool.SettingsController
			 */
			'.set click': function() {
				var setObj = {};
				this.$find('input').each(function() {
					setObj[this.name] = this.value;
				});
				var error = h5devtoolSettings.validate(setObj);
				if (!error) {
					h5devtoolSettings.set(setObj);
					return;
				}
				// validateが通らない場合
				// 今はログ表示件数しか設定項目がないが、増えた場合はvalidateエラーメッセージを作成する
				devtoolWindow.alert('ログの最大表示件数は0以上の整数値で入力してください');
			}
		};
		h5.core.expose(settingsController);
	})();

	(function() {
		/**
		 * ログコントローラ
		 * <p>
		 * インスタンスのトレースログ、全体のトレースログ、ロガーログで共通
		 * </p>
		 *
		 * @name h5devtool.LogController
		 */
		var logController = {
			/**
			 * @memberOf h5devtool.LogController
			 */
			__name: 'h5devtool.LogController',
			/**
			 * 表示する条件を格納するオブジェクト
			 *
			 * @memberOf h5devtool.LogController
			 */
			_condition: {
				filterStr: '',
				exclude: false,
				hideCls: {}
			},

			/**
			 * ログ出力要素
			 *
			 * @memberOf h5devtool.LogController
			 */
			_$logList: null,

			/**
			 * 監視対象のログ配列
			 *
			 * @memberOf h5devtool.LogController
			 */
			_logArray: null,

			/**
			 * 遅延updateを行うためのタイマー
			 *
			 * @memberOf h5devtool.LogController
			 */
			_updateDelayTimer: null,

			/**
			 * @memberOf h5devtool.LogController
			 * @param context.evArg.logArray logArray
			 */
			__init: function(ctx) {
				this._$logList = this.$find('.log-list');
				this._updateView();
			},

			'{this._logArray} change': function() {
				// ログを更新する。
				// 前のlogUpdateがLOG_DELAYミリ秒以内であれば、前のログも合わせてLOG_DELAYミリ秒後に表示する
				// LOG_DELAYミリ秒の間隔をあけずに立て続けにlogUpdateが呼ばれた場合はログは出ない。
				// LOG_DELAYミリ秒の間にlogUpdateが呼ばれなかった時に今まで溜まっていたログを出力する。
				// ただし、MAX_LOG_DELAY経ったら、logUpdateの間隔に関わらずログを出力する

				// LOG_DELAYミリ秒後に出力するタイマーをセットする。
				// すでにタイマーがセット済みなら何もしない(セット済みのタイマーで出力する)
				var logArray = this._logArray;
				//				logArray._logUpdatedInMaxDelay = true;
				if (this._updateDelayTimer) {
					clearTimeout(this._updateDelayTimer);
				}
				this._updateDelayTimer = setTimeout(this.own(function() {
					// このコントローラがdisposeされていたら何もしない(非同期で呼ばれるメソッドなのであり得る
					if (isDisposed(this)) {
						return;
					}
					this._updateDelayTimer = null;
					this._updateView();
				}), LOG_DELAY);
			},

			'{rootElement} tabSelect': function() {
				this._updateView();
			},

			setLogArray: function(logArray) {
				this._logArray = logArray;
			},

			_updateView: function() {
				// ログ出力箇所が表示されていなければ(タブがactiveになっていなければ)なにもしない
				if (!$(this.rootElement).hasClass('active')) {
					return;
				}
				var logArray = this._logArray;
				//				clearTimeout(logArray._logDelayTimer);
				//				clearTimeout(logArray._logMaxDelayTimer);
				//				logArray._logDelayTimer = null;
				//				logArray._logMaxDelayTimer = null;

				// DOM生成がIEだと重いのでinnerHTMLでやっている
				// (TODO 要検証。ポップアップウィンドウを親から操作する場合は確かにinnerHTMLの方が速かった)
				// innerHTMLを更新(html()メソッドが重いので、innerHTMLでやっている)
				var logList = this._$logList[0];
				logList.innerHTML = this._createLogHTML(logArray);

				// 元々一番下までスクロールされていたら、一番下までスクロールする
				if (this._isScrollLast) {
					logList.scrollTop = logList.scrollHeight - logList.clientHeight;
				}

				// MAX_LOG_DELAYのタイマーをセットする
				//				logArray._logUpdatedInMaxDelay = false;
				//				logArray._logMaxDelayTimer = setTimeout(this.own(function() {
				//					if (logArray._logUpdatedInMaxDelay) {
				//						this._updateView();
				//
				//					}
				//				}), MAX_LOG_DELAY);
			},

			setInfoControllers: function(ctrls) {
				this.infoCtrls = ctrls;
			},


			_createLogHTML: function(logArray) {
				var str = this._condition.filterStr;
				var reg = this._condition.filterReg;
				var isExclude = this._condition.filterStr && this._condition.exclude;
				var hideCls = this._condition.hideCls;
				var logLevelThreshold = this.$find('.logLevelThreshold').val();

				var html = '';
				// TODO view.getが重いので、文字列を直接操作する
				// (view.get, str.formatを1000件回してIE10で20msくらい。ただの文字列結合なら10msくらい)

				for (var i = 0, l = logArray.length; i < l; i++) {
					var logObj = logArray.get(i);
					var part = '';
					if (logObj.tag) {
						// コントローラ・ロジックのトレースの場合
						part = this.view.get('trace-log-part', logObj);
					} else {
						part = this.view.get('logger-log-part', logObj);
					}
					// index番号を覚えさせる
					part = $(part).attr('data-h5devtool-logindex', i)[0].outerHTML;
					// フィルタにマッチしているか
					var msg = logObj.message;
					if (!isExclude === !(reg ? logObj.message.match(reg) : msg.indexOf(str) !== -1)) {
						html += $(part).css('display', 'none')[0].outerHTML;
						continue;
					} else if (hideCls && hideCls[logObj.methodType]) {
						// クラスのフィルタにマッチしているか
						part = $(part).css('display', 'none')[0].outerHTML;
					} else if (logObj.levelString
							&& (hideCls && hideCls['log'] || logObj.level < logLevelThreshold)) {
						// ログにフィルタが掛かっているまたは、ログレベルのフィルタが掛かっているか
						part = $(part).css('display', 'none')[0].outerHTML;
					}

					html += part;
				}
				return html;
			},

			'input[type="checkbox"] change': function(context, $el) {
				var cls = $el.attr('name');
				if ($el.prop('checked')) {
					this._condition.hideCls[cls] = false;
				} else {
					this._condition.hideCls[cls] = true;
				}
				if (cls === 'log') {
					$el.parent().find('select').prop('disabled', !$el.prop('checked'));
				}
				this.refresh();
			},
			'.logLevelThreshold change': function(context, $el) {
				this.refresh();
			},

			/**
			 * フィルタを掛ける
			 *
			 * @memberOf h5devtool.LogController
			 */
			'input.filter keydown': function(context) {
				// エンターキー
				if (context.event.keyCode === 13) {
					var val = this.$find('input.filter').val();
					if (!val) {
						return;
					}
					this._executeFilter(val);
				}
			},
			/**
			 * 入力欄が空になったらフィルタを解除
			 *
			 * @memberOf h5devtool.LogController
			 */
			'input.filter keyup': function(context) {
				// エンターキー
				var val = this.$find('input.filter').val();
				if (val === '') {
					this._executeFilter('');
				}
			},
			'button.filter-show click': function(context) {
				var val = this.$find('input.filter').val();
				if (!val) {
					return;
				}
				this._executeFilter(val);
				this.$find('.filter-clear').prop('disabled');
			},
			'button.filter-hide click': function(context) {
				var val = this.$find('input.filter').val();
				if (!val) {
					return;
				}
				this._executeFilter(val, true);
				this.$find('.filter-clear').prop('disabled');
			},
			'button.filter-clear click': function(context) {
				this._executeFilter('');
				this.$find('.filter-clear').prop('disabled', true);
			},
			_executeFilter: function(val, execlude) {
				this.$find('.filter-clear').prop('disabled', !val);
				this._condition.filterStr = val;
				this._condition.filterReg = val.indexOf('*') !== -1 ? getRegex(val) : null;
				this._condition.exclude = !!execlude;
				this.refresh();
			},

			/**
			 * 表示されているログについてフィルタを掛けなおす
			 *
			 * @memberOf h5devtool.LogController
			 */
			refresh: function() {
				this._$logList[0].innerHTML = this._createLogHTML(this._logArray);
			}
		};
		h5.core.expose(logController);

	})();

	(function() {
		/**
		 * ディベロッパツールコントローラ
		 * <p>
		 * ディベロッパ機能のメインとなるルートコントローラ
		 * </p>
		 *
		 * @name h5devtool.DevtoolController
		 */
		var devtoolController = {
			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			__name: 'h5devtool.DevtoolController',

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_instanceInfoController: h5devtool.InstanceInfoController,

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_logicInfoController: h5devtool.InstanceInfoController,

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_tabController: h5devtool.TabController,
			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_traceLogController: h5devtool.LogController,
			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_loggerController: h5devtool.LogController,
			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_settingsController: h5devtool.SettingsController,

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			__meta: {
				_instanceInfoController: {
					rootElement: '.controller-info'
				},
				_logicInfoController: {
					rootElement: '.logic-info'
				},
				_traceLogController: {
					rootElement: '.trace'
				},
				_settingsController: {
					rootElement: '.settings'
				},
				_loggerController: {
					rootElement: '.logger'
				}
			},

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_instanceMap: null,

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_logManager: null,

			/**
			 * @memberOf h5devtool.DevtoolController
			 */
			_promiseMap: {},

			__construct: function(ctx) {
				this._instanceMap = ctx.args.instanceMap;
				this._logManager = ctx.args.logManager;
			},

			__init: function(ctx) {
				this.view.append(this.$find('.trace'), 'trace-log');
				this._loggerController.setLogArray(ctx.args.logManager.getLoggerLog());
				this._traceLogController.setLogArray(ctx.args.logManager.getWholeLog());
			},

			__ready: function(ctx) {
				// DevtoolControllerがバインドされる前に受け取ったメッセージを処理
				for (var i = 0, l = notProcessedMessages.length; i < l; i++) {
					this.messageListener(notProcessedMessages[i]);
				}
				// もう使用しないのでnull代入しておく
				notProcessedMessages = null;
			},

			/**
			 * diagメッセージを受け取るリスナ
			 *
			 * @param message
			 */
			messageListener: function(messageData) {
				var message = h5.u.obj.deserialize(messageData);
				var id = message.instanceId;
				var traceLogObj = null;
				switch (message.type) {
				case DIAG_EVENT_CONTROLLER_BOUND:
					this._instanceMap[id] = message;
					this._instanceInfoController.appendToList(message);
					break;
				case DIAG_EVENT_CONTROLLER_UNBOUND:
					this._instanceInfoController.removeFromList(message);
					delete this._instanceMap[id];
					break;
				case DIAG_EVENT_LOGIC_BOUND:
					this._instanceMap[id] = message;
					if (message.isControllerLogic) {
						this._instanceInfoController.appendToList(message);
					} else {
						// h5.core.logicによるロジック化なら、
						// コントローラタブとは別のタブに表示するため、logicInfoControllerに通知する
						this._logicInfoController.appendToList(message);
					}
					break;
				case DIAG_EVENT_BEFORE_METHOD_INVOKE:
					traceLogObj = {
						tag: TRACE_LOG_TAG_BEGIN,
						instanceId: id,
						methodType: message.methodType,
						method: message.method,
						name: message.name,
						time: formatTime(message.timeStamp)
					};
					// メソッドのカウント
					if (this._instanceMap[id]) {
						this._instanceMap[id].methodMap[message.method].count = message.count;
						this._instanceInfoController.methodCount(id, message.method, message.count);
					}
					break;
				case DIAG_EVENT_AFTER_METHOD_INVOKE:
					traceLogObj = {
						tag: TRACE_LOG_TAG_END,
						instanceId: id,
						methodType: message.methodType,
						method: message.method,
						name: message.name,
						time: formatTime(message.timeStamp)
					};
					if (message.isPromise) {
						this._promiseMap[message.promiseId] = traceLogObj;
					}
					break;
				case DIAG_EVENT_ASYNC_METHOD_COMPLETE:
					var endLogObj = this._promiseMap[message.promiseId];
					traceLogObj = {
						tag: TRACE_LOG_TAG_DFD,
						promiseState: message.state,
						instanceId: endLogObj.instanceId,
						methodType: endLogObj.methodType,
						method: endLogObj.method,
						name: endLogObj.name,
						time: formatTime(message.timeStamp)
					};
					break;
				case DIAG_EVENT_LOG:
				case DIAG_EVENT_ERROR:
					var logObj = message;
					logObj.time = formatTime(message.timeStamp);
					this._logManager.appendLog(message);
					break;
				}
				if (traceLogObj) {
					// トレースログメッセージを追加
					this._logManager.appendLog(traceLogObj);
				}
			},

			/**
			 * キー操作
			 *
			 * @memberOf h5devtool.DevtoolController
			 */
			'{document} keydown': function(context) {
				var event = context.event;
				var key = event.keyCode;
				if (key === 116 && useWindowOpen) {
					// F5キーによる更新の防止
					context.event.preventDefault();
				}
			},

			/**
			 * 何もない箇所をクリック
			 *
			 * @memberOf h5devtool.DevtoolController
			 */
			'.left click': function(context, $el) {
				if (context.event.target !== $el[0]) {
					return;
				}
				// インスタンスの選択を解除
				this.trigger('unfocus');
			}
		};
		h5.core.expose(devtoolController);
	})();

	// =============================
	// expose
	// =============================
	h5.u.obj.expose('h5devtool', {
		LogManager: LogManager
	});

	// =============================
	// コントローラのバインド
	// =============================
	$(function() {
		var logManager = new h5devtool.LogManager();
		h5.core.controller('.h5devtool', h5devtool.DevtoolController, {
			logManager: logManager,
			instanceMap: instanceMap,
			parentWin: window.opener
		}).readyPromise.done(function() {
			devtoolController = this;
			// 閉じられたときにdevtoolControllerをdispose
			function unloadFunc() {
				// オーバレイを削除
				devtoolController._instanceInfoController.removeOverlay(true);
				// コントローラをdispose
				devtoolController.dispose();
			}
			// unloadFuncのバインドを行う
			bindListener(window, 'unload', unloadFunc);
			if (window.opener) {
				// 親ウィンドウが閉じた時(遷移した時)にDevtoolウィンドウを閉じる。
				// IEの場合、明示的にclose()を呼ばないと遷移先でwindow.open()した時に新しく開かずに閉じていないDevtoolウィンドウが取得されてしまうため。
				bindListener(window.opener, 'unload', function() {
					window.close();
				});
			}
		});
	});
})(jQuery);
