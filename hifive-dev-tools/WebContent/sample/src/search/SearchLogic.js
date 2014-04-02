/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
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
 */
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