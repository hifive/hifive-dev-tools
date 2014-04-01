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