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
		 * @param {Number} startIndex 開始インデックス
		 * @param {Number} maxResults 何件取得するか
		 * @returns {Promise} Promiseオブジェクト
		 */
		search: function(keyword, startIndex, maxResults) {
			var promise = h5.ajax({
				dataType: 'jsonp',
				data: {
					'vq': keyword,
					'max-results': maxResults,
					'alt': 'json-in-script',
					'start-index': startIndex
				},
				cache: true,
				url: 'http://gdata.youtube.com/feeds/api/videos'
			});
			return promise;
		}
	};
	h5.core.expose(searchLogic);
})();