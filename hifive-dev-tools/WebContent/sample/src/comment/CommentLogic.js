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