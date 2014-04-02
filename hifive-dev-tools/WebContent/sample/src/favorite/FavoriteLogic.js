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
	 * お気に入りリストのキー名
	 */
	var FAVORITE_KEY = 'youtubeFavoriteList';

	/**
	 * お気に入りロジック
	 *
	 * @class youtube.logic.FavoriteLogic
	 */
	var favoriteLogic = {

		/**
		 * @memberOf youtube.logic.FavoriteLogic
		 */
		__name: 'youtube.logic.FavoriteLogic',

		/**
		 * ローカルに保存されているお気に入りリストを取得する
		 *
		 * @memberOf youtube.logic.FavoriteLogic
		 * @returns {Array[Object]} お気に入りリスト
		 */
		loadFavList: function() {
			if (h5.api.storage.isSupported) {
				return h5.api.storage.local.getItem(FAVORITE_KEY);
			}
			// ローカルストレージが使えないブラウザの場合はクッキーを使用
			var tmp = document.cookie.substring(document.cookie.indexOf(FAVORITE_KEY + '=')).split(
					';')[0];
			var val = tmp.substring(tmp.indexOf('=') + 1);
			try {
				return h5.u.obj.deserialize(val);
			} catch (e) {
				return null;
			}

		},

		/**
		 * ローカルにお気に入りリストを保存する
		 *
		 * @memberOf youtube.logic.FavoriteLogic
		 * @param {Array[Object]} list お気に入りリスト
		 */
		saveFavList: function(list) {
			if (h5.api.storage.isSupported) {
				h5.api.storage.local.setItem(FAVORITE_KEY, list);
			} else {
				document.cookie = FAVORITE_KEY + '=' + h5.u.obj.serialize(list);
			}
		}
	};

	h5.core.expose(favoriteLogic);
})();