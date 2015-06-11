(function() {
	var URL_COMMENTS = 'https://www.googleapis.com/youtube/v3/comments';

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
			var id = entry.id;
			var url = 'https://gdata.youtube.com/feeds/api/videos/' + id + '/comments';
			return h5.ajax(url, {
				dataType: 'xml',
				cache: true,
			});
		}
	};

	h5.core.expose(commentLogic);
})();