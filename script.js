// PIXI.JSアプリケーションを呼び出す (この数字はゲーム内の画面サイズ)
const app = new PIXI.Application({ width: 400, height: 600 });

// index.htmlのbodyにapp.viewを追加する (app.viewはcanvasのdom要素)
document.body.appendChild(app.view);

// ゲームcanvasのcssを定義する
// ここで定義した画面サイズ(width,height)は実際に画面に表示するサイズ
app.renderer.view.style.position = "relative";
app.renderer.view.style.width = "400px";
app.renderer.view.style.height = "600px";
app.renderer.view.style.display = "block";

// canvasの周りを点線枠で囲う (canvasの位置がわかりやすいので入れている)
app.renderer.view.style.border = "2px dashed black";

// canvasの背景色
app.renderer.backgroundColor = 0x333333;

// ゲームで使用する画像をあらかじめ読み込んでおく(プリロードという)
PIXI.loader.add("ball.png");

// プリロード処理が終わったら呼び出されるイベント
PIXI.loader.load((loader, resources) =>
{
    /**
     * 状態が変化する変数一覧
     */
    let gameLoops = []; // 毎フレーム毎に実行する関数たち
    let score = 0; // スコア
    let ballVx = 5; // ボールの毎フレーム動くx方向
    let ballVy = 0; // ボールの毎フレーム動くy方向

    /**
     * 毎フレーム処理を追加する関数
     */
    function addGameLoop(gameLoopFunction)
    {
        app.ticker.add(gameLoopFunction); // 毎フレーム処理として指定した関数を追加
        gameLoops.push(gameLoopFunction); // 追加した関数は配列に保存する（後で登録を解除する時に使う）
    }

    /**
     * 登録している毎フレーム処理を全部削除する関数
     */
    function removeAllGameLoops()
    {
        // gameLoopsに追加した関数を全部tickerから解除する
        for (const gameLoop of gameLoops)
        {
            app.ticker.remove(gameLoop);
        }
        gameLoops = []; // gameLoopsを空にする
    }
    /**
     * 全てのシーンを画面から取り除く関数
     */
    function removeAllScene()
    {
        // 既存のシーンを全部削除する
        for (const scene of app.stage.children)
        {
            app.stage.removeChild(scene);
        }
    }

    /**
     * ボタンを生成してオブジェクトを返す関数
     * @param text テキスト
     * @param width 横幅
     * @param height 縦幅
     */
    function createButton(text, width, height, color, onClick)
    {
        const fontSize = 20; // フォントサイズ
        const buttonAlpha = 0.6; // ボタン背景の透明度
        const buttonContainer = new PIXI.Container(); // ボタンコンテナ（ここにテキストと背景色を追加して返り値とする）

        // ボタン作成
        const backColor = new PIXI.Graphics(); // グラフィックオブジェクト（背景に半透明な四角を配置するために使用）
        backColor.beginFill(color, buttonAlpha); // 色、透明度を指定して描画開始
        backColor.drawRect(0, 0, width, height); // 位置(0,0)を左上にして、width,heghtの四角形を描画
        backColor.endFill(); // 描画完了
        backColor.interactive = true; // クリック可能にする
        backColor.on("pointerdown", onClick); // クリック時にonClickの関数を実行する
        buttonContainer.addChild(backColor); // 背景をボタンコンテナに追加

        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: fontSize,// フォントサイズ
            fill: 0xffffff, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 2, // ドロップシャドウの影の距離
        });

        const buttonText = new PIXI.Text(text, textStyle); // テキストオブジェクトをtextStyleのパラメータで定義
        buttonText.anchor.x = 0.5; // アンカーを中央に設置する(アンカーは0~1を指定する)
        buttonText.anchor.y = 0.5; // アンカーを中央に設置する(アンカーは0~1を指定する)
        buttonText.x = width / 2;　 // ボタン中央にテキストを設置するため、width/2の値をx値に指定
        buttonText.y = height / 2; // ボタン中央テキストを設置するため、height/2の値をy値に指定
        buttonContainer.addChild(buttonText); // ボタンテキストをボタンコンテナに追加
        return buttonContainer; // ボタンコンテナを返す
    }
    /**
     * ゲームのメインシーンを生成する関数
     */
    function createGameScene()
    {
        // 他に表示しているシーンがあれば削除
        removeAllScene();
        // 毎フレームイベントを削除
        removeAllGameLoops();

        // スコアを初期化する
        score = 0;

        // ゲーム用のシーンを生成
        const gameScene = new PIXI.Container();
        // ゲームシーンを画面に追加
        app.stage.addChild(gameScene);

        // ボール画像を表示するスプライトオブジェクトを実体化させる
        const ball = new PIXI.Sprite(resources["ball.png"].texture); //引数には、プリロードしたURLを追加する
        ball.x = 200; // x座標
        ball.y = 500; // y座標
        ball.interactive = true; // クリック可能にする
        ball.on("pointerdown", () =>      // クリック時に発動する関数
        {
            score++; // スコアを１増やす
            ballVy = -8; // ボールのＹ速度を-8にする(上に飛ぶようにしている)
        });
        gameScene.addChild(ball); // ボールをシーンに追加

        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: 20,// フォントサイズ
            fill: 0xffffff, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 2, // ドロップシャドウの影の距離
        });

        const text = new PIXI.Text("SCORE:0", textStyle); //スコア表示テキスト
        gameScene.addChild(text); // スコア表示テキストを画面に追加する

        function gameLoop() // 毎フレームごとに処理するゲームループ
        {
            // スコアテキストを毎フレームアップデートする
            text.text = `SCORE:${score}`;

            if (score === 0) return; // スコアが０の時(球に触っていないとき)はここで終了させる

            ball.x += ballVx; // ボールに速度を加算
            ball.y += ballVy; // ボールに速度を加算
            if (ball.x > 340) // ボールが右端に到達したら(画面横幅400,球横幅60、アンカーは左上なので400-60=340の位置で球が右端に触れる)
            {
                ball.x = 340; // xの値を340にする(次のフレームで反射処理させないために必要) 
                ballVx = -ballVx; // 速度を反転して反射の挙動にする
            }
            if (ball.x < 0) // ボールが左端に到達したら(アンカーは左上なので、0の位置で球が左端に触れる)
            {
                ball.x = 0; // xの値を0にする(次のフレームで反射処理させないために必要)
                ballVx = -ballVx; // 速度を反転して反射の挙動にする
            }
            ballVy += 0.1; // yの速度に0.1を足していくと、重力みたいな挙動になる
            if (ball.y >= 600) // 球が画面下に消えたら
            {
                createEndScene(); // 結果画面を表示する
            }
        }

        // ゲームループ関数を毎フレーム処理の関数として追加
        addGameLoop(gameLoop);
    }

    /**
     * ゲームの結果画面シーンを生成する関数
     */
    function createEndScene()
    {
        // 他に表示しているシーンがあれば削除
        removeAllScene();
        // 毎フレームイベントを削除
        removeAllGameLoops();

        // ゲーム用のシーン表示
        const endScene = new PIXI.Container();
        // シーンを画面に追加する
        app.stage.addChild(endScene);

        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: 32,// フォントサイズ
            fill: 0xfcbb08, // 色(16進数で定義する これはオレンジ色)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 2, // ドロップシャドウの影の距離
        });

        // テキストオブジェクトの定義
        const text = new PIXI.Text(`SCORE:${score}で力尽きた`, textStyle); // 結果画面のテキスト
        text.anchor.x = 0.5; // アンカーのxを中央に指定
        text.x = 200; // 座標指定 (xのアンカーが0.5で中央指定なので、テキストのx値を画面中央にすると真ん中にテキストが表示される)
        text.y = 200; // 座標指定 (yのアンカーはデフォルトの0なので、画面上から200の位置にテキスト表示)
        endScene.addChild(text); // 結果画面シーンにテキスト追加

        /**
         * 自作のボタン生成関数を使って、もう一度ボタンを生成
         * 引数の内容はcreateButton関数を参考に
         */
        const retryButton = createButton("もう一度", 100, 60, 0xff0000, () =>
        {
            // クリックした時の処理
            createGameScene(); // ゲームシーンを生成する
        });
        retryButton.x = 50; // ボタンの座標指定
        retryButton.y = 500; // ボタンの座標指定
        endScene.addChild(retryButton);　// ボタンを結果画面シーンに追加

        /**
         * 自作のボタン生成関数を使って、ツイートボタンを生成
         * 引数の内容はcreateButton関数を参考に
         */
        const tweetButton = createButton("ツイート", 100, 60, 0x0000ff, () =>
        {
            //ツイートＡＰＩに送信
            //結果ツイート時にURLを貼るため、このゲームのURLをここに記入してURLがツイート画面に反映されるようにエンコードする
            const url = encodeURI("https://hothukurou.com"); // ツイートに載せるURLを指定(文字はエンコードする必要がある)
            window.open(`http://twitter.com/intent/tweet?text=SCORE:${score}点で力尽きた&hashtags=sample&url=${url}`); //ハッシュタグをsampleにする
        });
        tweetButton.x = 250; // ボタンの座標指定
        tweetButton.y = 500; // ボタンの座標指定
        endScene.addChild(tweetButton); // ボタンを結果画面シーンに追加
    }

    // 起動直後はゲームシーンを追加する
    createGameScene();
});
