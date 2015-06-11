(function() {
	/**
	 * お気に入りコントローラ
	 *
	 * @class youtube.controller.FavoriteController
	 */
	var favoriteController = {
		/**
		 * @memberOf youtube.controller.FavoriteController
		 */
		__name: 'youtube.controller.FavoriteController',

		/**
		 * ロジック
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 */
		_favoriteLogic: youtube.logic.FavoriteLogic,

		/**
		 * 右クリックメニューのコントローラ
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 */
		_contextMenuController: h5.ui.ContextMenuController,

		/**
		 * カルーセル部品コントローラ
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 */
		_carouselController: h5.ui.container.LoopCarouselController,

		/**
		 * @memberOf youtube.controller.FavoriteController
		 */
		__meta: {
			_carouselController: {
				rootElement: '.carousel'
			}
		},

		/**
		 * お気に入りの配列
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 */
		_favList: null,

		/**
		 * 現在右クリックで選択中の要素
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 */
		_$currentSelect: null,

		/**
		 * ドラッグされたかどうかのフラグ。ドラッグなのかクリックなのかの判定で使用
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 */
		_isDragging: false,

		/**
		 * @memberOf youtube.controller.FavoriteController
		 */
		__ready: function() {
			// お気に入りリストを取得
			var favList = this._favoriteLogic.loadFavList();
			if (!favList) {
				favList = [];
			}
			this._favList = favList;
			// リストにあるものをお気に入りに表示
			this._add(favList);
		},

		/**
		 * ドラッグ開始
		 *
		 * @memberOf youtube.controller.FavoriteController
		 */
		'.favorite-item h5trackstart': function() {
			this._isDragging = false;
		},

		/**
		 * ドラッグ
		 *
		 * @memberOf youtube.controller.FavoriteController
		 */
		'.favorite-item h5trackmove': function() {
			this._isDragging = true;
		},

		/**
		 * ドラッグ終了
		 *
		 * @memberOf youtube.controller.FavoriteController
		 * @param context
		 * @param $el
		 */
		'.favorite-item h5trackend': function(context, $el) {
			// 動かした時のクリック、または右クリックなら何もしない
			if (this._isDragging || context.event.button === 2) {
				return;
			}
			this.trigger('loadById', {
				id: $el.data('videoid')
			});
		},

		/**
		 * 要素を右クリック
		 *
		 * @memberOf youtube.controller.FavoriteController
		 * @param context
		 * @param $el
		 */
		'.favorite-item contextmenu': function(context, $el) {
			this._$currentSelect = $el;
		},

		/**
		 * 右クリックメニューから[再生]をクリック
		 *
		 * @memberOf youtube.controller.FavoriteController
		 */
		'[href="#play"] click': function() {
			this.trigger('loadById', {
				id: this._$currentSelect.data('videoid')
			});
		},

		/**
		 * 右クリックメニューから[Youtubeで開く]をクリック
		 *
		 * @memberOf youtube.controller.FavoriteController
		 */
		'[href="#open"] click': function() {
			var id = this._$currentSelect.data('videoid');
			// 新しいタブ(ウィンドウ)でyoutubeのURLを開く
			window.open('https://www.youtube.com/watch?v=' + id, '');
			// 現在再生中の動画を一時停止
			this.trigger('pause');
		},

		/**
		 * 右クリックで削除
		 *
		 * @memberOf youtube.controller.FavoriteController
		 */
		'[href="#remove"] click': function() {
			var id = this._$currentSelect.data('videoid');
			// カルーセルから削除
			this._carouselController.removeItem(this._$currentSelect.parent()[0]);

			// お気に入りリストから削除
			for (var i = 0, l = this._favList.length; i < l; i++) {
				if (this._favList[i].id === id) {
					this._favList.splice(i, 1);
					break;
				}
			}

			// ストレージを更新
			this._favoriteLogic.saveFavList(this._favList);
		},

		/**
		 * idの動画をお気に入りに登録
		 *
		 * @memberOf youtube.controller.FavoriteController
		 * @param entry
		 */
		favorite: function(entry) {
			// 再生中の動画のデータを取得する
			if (!entry) {
				alert('再生中の動画がありません');
				return;
			}

			// お気に入りオブジェクトを作成
			var obj = this._createObjFromEntry(entry);
			var id = obj.id;

			// 既に登録済みかどうかチェック
			for (var i = 0, l = this._favList.length; i < l; i++) {
				if (this._favList[i].id === id) {
					// 登録済みであれば警告を出して何もしない
					alert('登録済みです');
					return;
				}
			}

			// お気に入りリストに追加
			this._favList.push(obj);
			this._favoriteLogic.saveFavList(this._favList);
			this._add(obj);

			// 追加した要素までスクロール
			this._carouselController.scrollToMatchElement('[data-videoid="' + id + '"]', true);
		},

		/**
		 * カルーセルにお気に入りを追加する
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 * @param {Object} obj お気に入りオブジェクト。title,img,idを持つオブジェクト
		 */
		_add: function(obj) {
			var $items = $();
			var ary = $.isArray(obj) ? obj : [obj];
			if (ary.length === 0) {
				// 空なら何もしない
				return;
			}
			for (var i = 0, l = ary.length; i < l; i++) {
				$items = $items.add(this.view.get('favorite-item', ary[i]));
			}
			this._carouselController.appendItem($items);
		},

		/**
		 * 動画のデータからお気に入りリストに追加するオブジェクトを作る
		 * <p>
		 * 以下のようなオブジェクトを返す。
		 * </p>
		 *
		 * <pre>
		 * {
		 * 	title: 動画タイトル,
		 * 	img: サムネイルURL,
		 * 	id: 動画ID
		 * }
		 * </pre>
		 *
		 * @private
		 * @memberOf youtube.controller.FavoriteController
		 * @param {Object} entry 動画のデータ
		 * @returns {Object} お気に入りオブジェクト
		 */
		_createObjFromEntry: function(entry) {
			return {
				title: entry.snippet.title,
				img: entry.snippet.thumbnails['default'].url,
				id: entry.id
			};
		}
	};

	h5.core.expose(favoriteController);
})();