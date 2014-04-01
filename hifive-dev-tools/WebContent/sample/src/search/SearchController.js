(function() {
	/**
	 * コントローラオブジェクト
	 *
	 * @class youtube.controller.SearchController
	 */
	var searchController = {
		/**
		 * コントローラ名
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		__name: 'youtube.controller.SearchController',

		/**
		 * ロジック
		 *
		 * @private
		 * @memberOf youtube.controller.SearchController
		 */
		_searchLogic: youtube.logic.SearchLogic,

		/**
		 * 1度に読み込む件数
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		maxResults: 8,

		/**
		 * スクロールバーの最下部からどの位置にきたら次を読み込むか
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		scrollRemain: 150,

		/**
		 * 検索キーワード
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		keyword: '',

		/**
		 * 現在読み込んでいるインデックス
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		index: 0,

		/**
		 * キーワードにヒットする総件数
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		totalCount: 0,

		/**
		 * 検索したかどうか
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		searched: false,

		/**
		 * スクロール停止と判断するまでの間隔。単位はms。
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		delay: 500,

		/**
		 * タイマー登録用プロパティ
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		timer: null,

		/**
		 * @memberOf youtube.controller.SearchController
		 */
		__ready: function() {
			this._adjustHeight();
		},

		/**
		 * リサイズ時のイベント
		 *
		 * @memberOf youtube.controller.SearchController
		 */
		'{window} resize': function() {
			// 検索結果表示エリアの調整
			this._adjustHeight();
		},

		/**
		 * 「検索」時に実行するハンドラ
		 * <p>
		 * 検索結果・件数の表示部分をクリアし、youtubeからユーザが入力したキーワードが含まれる動画情報を取得します。
		 * </p>
		 * <p>
		 * 取得した情報からDOM要素生成し、検索結果として一覧表示します。
		 * </p>
		 *
		 * @memberOf youtube.controller.SearchController
		 * @param {Object} context コンテキスト
		 */
		'.form-search  submit': function(context) {
			context.event.preventDefault();
			this.$find('.search-count').html(0);
			this.$find('.search-result-lists').empty();

			var keyword = this.$find('.search-query').val();
			if (!keyword || $.trim(keyword).length === 0) {
				return;
			}

			this.keyword = keyword;
			this.index = 1 + this.maxResults;
			var promise = this._searchLogic.search(keyword, 1, this.maxResults);

			this.$find('.search-query').blur();

			promise.done(this.own(function(data) {
				this.totalCount = data.feed.openSearch$totalResults.$t;
				this.$find('.search-count').html(this.totalCount);
				this.view.update('.search-result-lists', 'list', {
					entry: data.feed.entry
				});
				// 初期表示時に可視範囲に入っているプレイヤーを埋め込むためにイベントをトリガ
				this.trigger('scroll');
				if (this.totalCount > this.maxResults) {
					this.view.append('.search-result-lists', 'empty_list');
				}
				this.searched = true;
			}));

			var indicator = this.indicator({
				message: '検索中…',
				promises: promise
			}).show({
				throbber: {
					size: 60
				}
			});
		},

		/**
		 * リストのscrollイベント時に実行するハンドラ
		 * <p>
		 * リストの末尾に新しい検索結果を追加します。
		 * </p>
		 *
		 * @memberOf youtube.controller.SearchController
		 * @param {Object} context コンテキスト
		 * @param {jQuery} $el イベントの起きた要素
		 */
		'.search-result-lists [scroll]': function(context, $el) {
			if (!this.searched) {
				return;
			}

			if ($el[0].scrollHeight - $el.scrollTop() - $el.innerHeight() > this.scrollRemain) {
				return;
			}

			var keyword = this.keyword;
			var index = this.index;
			this.index = index + this.maxResults;
			var promise = this._searchLogic.search(keyword, index, this.maxResults);


			promise.done(this.own(function(data) {
				this.$find('.search-count').html(data.feed.openSearch$totalResults.$t);
				this.$find('.emptyList').remove();
				if (data.feed.entry) {
					this.view.append($el, 'list', {
						entry: data.feed.entry
					});
					this.view.append('.search-result-lists', 'empty_list');
				}
			}));

			var indicator = this.indicator({
				target: '.emptyList',
				promises: promise
			}).show({
				showRound: false,
				throbber: {
					size: 48
				}
			});
		},

		/**
		 * サムネイルクリック時にイベントをあげます
		 *
		 * @memberOf youtube.controller.ListController
		 * @param {Object} context コンテキスト
		 * @param {jQuery} $el イベントの起きた要素
		 */
		'li click': function(context, $el) {
			var id = $el.data('videoid');
			this.trigger('loadById', {
				id: id
			});
		},

		/**
		 * 検索結果表示エリアの高さ調整
		 *
		 * @private
		 * @memberOf youtube.controller.SearchController
		 */
		_adjustHeight: function() {
			var $ul = this.$find('.search-result-lists');
			$ul.height($(window).height() - $ul.offset().top);
		}
	};

	h5.core.expose(searchController);
})();