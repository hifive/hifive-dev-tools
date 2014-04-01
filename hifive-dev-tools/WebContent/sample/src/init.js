// youtubeプレイヤーオブジェクトを取得
// 参考 https://developers.google.com/youtube/iframe_api_reference?hl=ja
(function() {
	/**
	 * プレイヤーの設置場所を設定
	 */
	var PLAY_CONTAINER_SELECTOR = '.playerContainer';

	// Youtubeのスクリプトを取得
	var script = document.createElement('script');
	script.src = 'http://www.youtube.com/iframe_api';
	var firstScript = document.getElementsByTagName('script')[0];
	firstScript.parentNode.insertBefore(script, firstScript);

	// YoutubeAPIが準備できた時に呼ばれるハンドラ
	// YoutubeAPIから呼ばれるもので、グローバルに公開する必要がある
	window.onYouTubeIframeAPIReady = function() {
		new YT.Player('youtube-player', {
			// 適当な動画を指定しないとエラーになる
			videoId: 'rHZUPJji6w8',
			playerVars: {
				modestbranding: 1,
				autoplay: 1,
				showinfo: 0,
				iv_load_policy: 3
			},
			events: {
				onReady: function(event) {
					// プレイヤーの準備ができた時に1度だけ呼ばれる
					// playerオブジェクトを引数に格納してPlayerReadyのイベントをあげる
					$(PLAY_CONTAINER_SELECTOR).trigger('playerReady', {
						player: event.target
					});
				},
				onStateChange: function(event) {
					// プレイヤーの状態が変化した時に呼ばれる
					// (再生、一時停止、バッファリング、などの状態がある)
					// イベントをあげて、イベントを拾う必要のある各コントローラで処理を行う
					$(PLAY_CONTAINER_SELECTOR).trigger('stateChange', {
						player: event.target,
						state: event.data
					});
				}
			}
		});
	};

	$(function() {
		// コントローラをバインド
		h5.core.controller(PLAY_CONTAINER_SELECTOR, youtube.controller.PageController);
	});
})();