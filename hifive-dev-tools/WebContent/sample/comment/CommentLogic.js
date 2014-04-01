(function() {
	/**
	 * @class youtube.logic.CommentLogic
	 */
	var commentLogic = {
		/**
		 * @memberOf youtube.logic.CommentLogic
		 */
		__name: 'youtube.logic.CommentLogic',

		/**
		 * エントリーデータからコメントのURLを取得して、コメントデータを取得する
		 *
		 * @memberOf youtube.logic.CommentLogic
		 * @param entry
		 * @returns Promise
		 */
		getComment: function(entry) {
			var url = entry.gd$comments.gd$feedLink.href;
			return h5.ajax(url, {
				dataType: 'jsonp'
			});
		}
	};

	h5.core.expose(commentLogic);
})();