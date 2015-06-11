/**
 * SearchLogic
 *
 * @class
 * @name SearchLogic
 */
(function() {
	var searchLogic = {

		/**
		 * ロジック名
		 *
		 * @memberOf youtube.logic.SearchLogic
		 */
		__name: 'youtube.logic.SearchLogic',

		/**
		 * 指定された条件でyoutubeのフィードにリクエストを送る
		 *
		 * @memberOf youtube.logic.SearchLogic
		 * @param {String} keyword キーワード
		 * @returns {Promise} Promiseオブジェクト
		 */
		search: function(keyword) {
			var promise = h5.ajax({
				dataType: 'jsonp',
				data: {
					q: keyword,
					type: 'video',
					part: 'snippet',
					maxResults: 10,
					videoEmbeddable: true,
					key: youtube.common.API_KEY
				},
				cache: true,
				url: 'https://www.googleapis.com/youtube/v3/search'
			});
			return promise;
		},

		next: function(keyword, nextPageToken) {
			var promise = h5.ajax({
				dataType: 'jsonp',
				data: {
					q: keyword,
					type: 'video',
					part: 'snippet',
					videoEmbeddable: true,
					maxResults: 10,
					pageToken: nextPageToken,
					key: youtube.common.API_KEY
				},
				cache: true,
				url: 'https://www.googleapis.com/youtube/v3/search'
			});
			return promise;
		}
	};
	h5.core.expose(searchLogic);
})();