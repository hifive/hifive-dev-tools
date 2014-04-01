/**
 * PageLogic
 *
 * @class
 * @name PageLogic
 */
(function() {
	var pageLogic = {

		/**
		 * ロジック名
		 *
		 * @memberOf youtube.logic.PageLogic
		 */
		__name: 'youtube.logic.PageLogic',

		/**
		 * ロードされたデータ
		 *
		 * @memberOf youtube.logic.PageLogic
		 */
		_entry: null,

		/**
		 * ロードプロミス
		 *
		 * @memberOf youtube.logic.PageLogic
		 */
		_loadPromise: null,

		/**
		 * 指定されたidの動画の情報を取得する
		 *
		 * @memberOf youtube.logic.PageLogic
		 * @param {String} id 動画ID
		 * @returns Promiseオブジェクト
		 */
		loadEntry: function(id) {
			var dfd = h5.async.deferred();
			jQuery.support.cors = true;
			h5.ajax({
				dataType: 'jsonp',
				data: {
					// altパラメータに取得するフィールドのフォーマットを指定
					alt: 'json'
				},
				url: 'http://gdata.youtube.com/feeds/api/videos/' + id
			}).done(this.own(function(data) {
				// ロジックが取得したデータを覚えておく
				this._entry = data.entry;
				dfd.resolve(data.entry);
			})).fail(function() {
				// IEでは「ドメイン間でのデータソースのアクセス」を許可する必要があります
				// 無効になっていた場合はエラーになります
				if (h5.env.u)
					alert('動画の情報を取得できませんでした。IEの場合、セキュリティ設定の『ドメイン間でのデータソースのアクセス』を許可してください');
			});
			var promise = dfd.promise();
			this._loadPromise = promise;
			return promise;
		},

		/**
		 * 再生中の動画の詳細情報を取得する。
		 * <p>
		 * このメソッドはプロミスを返し、動画ロード時に取得したデータをdoneコールバックに渡す。
		 * </p>
		 * <p>
		 * 動画ロード時の問合せ処理がまだ終わっていなければ非同期でコールバックが呼ばれる。
		 * </p>
		 *
		 * @returns Promiseオブジェクト
		 */
		getEntry: function() {
			var dfd = h5.async.deferred();
			if (!this._loadPromise) {
				// 現在再生中の動画無し
				dfd.resolve(null);
			} else {
				// 取得済みの現在再生中の動画をコールバックに渡す
				// 取得中であれば、取得が終了したタイミングでresolve()する
				this._loadPromise.done(this.own(function() {
					dfd.resolve(this._entry);
				}));
			}
			return dfd.promise();
		}
	};
	h5.core.expose(pageLogic);
})();