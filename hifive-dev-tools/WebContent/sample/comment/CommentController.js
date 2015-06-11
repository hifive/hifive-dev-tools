(function() {
	/**
	 * @class youtube.controller.CommentController
	 */
	var commentController = {
		/**
		 * @memberOf youtube.controller.CommentController
		 */
		__name: 'youtube.controller.CommentController',

		/**
		 * ロジック
		 *
		 * @private
		 * @memberOf youtube.controller.CommentController
		 */
		_commentLogic: youtube.logic.CommentLogic,

		/**
		 * @memberOf youtube.controller.CommentController
		 */
		__ready: function() {
			// ウィンドウのサイズに合わせてコメント欄の高さを調整する
			this._adjustHeight();
		},

		/**
		 * windowリサイズ時
		 *
		 * @memberOf youtube.controller.CommentController
		 */
		'{window} resize': function() {
			// コメント欄の高さを調整
			this._adjustHeight();
		},

		/**
		 * 現在再生中の動画のコメントを取得して表示する
		 *
		 * @memberOf youtube.controller.CommentController
		 * @param entry
		 */
		update: function(entry) {
			this._commentLogic.getComment(entry).done(this.own(this._show));
		},

		/**
		 * コメントを削除
		 *
		 * @memberOf youtube.controller.CommentController
		 */
		clear: function() {
			$(this.rootElement).html('');
		},

		/**
		 * コメント欄の高さを調整する
		 *
		 * @private
		 * @memberOf youtube.controller.CommentController
		 */
		_adjustHeight: function() {
			var $root = $(this.rootElement);
			$root.height($(window).height() - $root.offset().top);
		},

		/**
		 * コメントを表示
		 *
		 * @private
		 * @memberOf youtube.controller.CommentController
		 * @param xml Youtubeのコメントデータ
		 */
		_show: function(xml) {
			var commentObj = this._parse(xml);
			this.view.update(this.rootElement, 'comment', commentObj);
		},

		/**
		 * Youtubeのコメントデータ(xml)をオブジェクトに変換する
		 * <p>
		 * 以下のようなオブジェクトの配列を返す
		 * </p>
		 *
		 * <pre>
		 * [{
		 * 	name: コメント者名
		 * 	comment: コメント内容
		 * },...]
		 * </pre>
		 *
		 * @private
		 * @memberOf youtube.controller.CommentController
		 * @param xml
		 * @returns Array[Object]
		 */
		_parse: function(xml) {
			var ret = {
				comments: []
			};
			$(xml).find('entry').each(function() {
				var $this = $(this);
				var name = $this.find('name').text();
				var comment = $this.find('content').text();
				ret.comments.push({
					name: name,
					comment: comment
				});
			});
			return ret;
		}
	};

	h5.core.expose(commentController);
})();