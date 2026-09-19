# 公式・科学の図の参照資料

## 興味の入口の拡充

2026-09-19: 9分野に再編し36テーマを追加。各テーマは独自の要約と、基礎になる知識2本・具体的な利用場面1本の関係を持つ。動く体験の新規追加とは区別する。

- 医療画像の原理: [NIH/NIBIB MRI](https://www.nibib.nih.gov/science-education/science-topics/magnetic-resonance-imaging-mri)、[NIH/NIBIB Ultrasound](https://www.nibib.nih.gov/science-education/science-topics/ultrasound)。磁場・高周波信号と超音波の反射という原理の入口を説明。診断や検査選択の助言は扱わない。
- 降水確率の意味: [気象庁 天気予報・天気図のFAQ](https://www.jma.go.jp/jma/kishou/know/faq/faq4.html)。日本の予報は指定時間帯に1mm以上の降水がある確率で、雨量や時間割合とは区別する。
- 光学・電磁誘導・音響の新テーマは本資料の既存出典と対応。数学の比例・割合・座標・速度の説明は、各テーマのどの計算に使うかを具体化する。

確認日: 2026-09-19。説明文・MathML・SVGは自作。提供画像は見せ方の参考とし、転載していない。

- 質量とエネルギー、太陽の核融合: [CERNの教材](https://cds.cern.ch/record/2905272/files/4_Passport_E-mc2.pdf)、[Einstein Online](https://www.einstein-online.info/en/spotlights/sr/sr-sub03/)。Eは静止エネルギーと明記。太陽への経路は核融合を介する。
- 波動方程式: [MIT・The Wave Equation](https://ocw.mit.edu/ans7870/18/18.013a/textbook/HTML/chapter29/section04.html)。表示は一定速度の1次元の形。弦の変位yを例にし、音の空気振動や電磁場と同一の物理量と扱わない。
- マクスウェル方程式と電磁波: [MIT OCW Lecture 12](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages/part-ii-electromagnetic-waves/lecture-12/)。表示はD/Hを含む巨視的な形。ρ/Jは自由電荷・自由電流。図は直交する場を斜めから見た概念図。
- ナビエ–ストークス方程式と航空: [NASA Glenn](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/navier-strokes-equation/)。表示は一定密度・粘性の非圧縮性の形に限定し、∇·u=0を併記。fは単位質量あたりの外力。実際の気象計算は圧縮性や熱などを含むことを記載。
- シュレーディンガー方程式: [MIT Quantum Physics I](https://www.ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2013/)、[MIT 物質の電気・光学・磁気特性](https://www.ocw.mit.edu/courses/3-23-electrical-optical-and-magnetic-properties-of-materials-fall-2007/pages/lecture-notes/)。表示は非相対論的な1粒子・スカラーポテンシャルの形。半導体をこの式だけで設計できるとは説明しない。
- MathML: [MDN Getting started](https://developer.mozilla.org/en-US/docs/Web/MathML/Tutorials/For_beginners/Getting_started)。分数、上付き、ベクトル、複数行をブラウザで組版。外部CDNや数式画像に依存しない。

運動方程式は質量一定・慣性系、三平方は直角三角形、オームの法則は一定条件で電圧と電流が比例する抵抗、と適用条件を付記する。

## 弦を弾く体験（2026-09-19）

- [UNSW Strings, standing waves and harmonics](https://newt.phys.unsw.edu.au/jw/strings.html): 両端固定の基本振動、f=v/(2L)、張力・線密度が一定のときの長さと振動数の反比例を参照。
- [UNSW How a guitar works](https://newt.phys.unsw.edu.au/music/guitar/guitarintro.html): 弦の振動が駒・表板を通して空気へ伝わる説明を参照。
- [MDN createPeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave)、[AudioContext.resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume): 明示操作による音声開始、倍音付き合成音に使用。

図は理想弦の基本振動（200倍スロー）で、音は同じ基本周波数に倍音を加えた合成音。ギター音の実測・実物再現ではなく、長さと音の高さの関係を確かめるモデル。見た目・音の減衰は演出として追加する。

## 表示確認の補足

## 追加7体験（2026-09-19）

各モデルと図は自作。外部教材のコード・画像は転載していない。

- 屈折・分散: [OpenStax College Physics 25.5](https://openstax.org/books/college-physics/pages/25-5-dispersion-the-rainbow-and-prisms)、[IOP 色の分散](https://spark.iop.org/spectrum-colours-dispersion-light)。2面の屈折をスネルの法則で計算。屈折率は赤1.51から紫1.51+0.025×操作値の説明用モデル。
- うなり: [UNSW Physclips Beats](https://www.animations.physics.unsw.edu.au/jw/beats.htm)。うなりの周波数は2音の周波数差。220Hzの2音を同一出力に重ね、同じ位相から開始する。
- 軌道: [NASA Gravity & Mechanics](https://science.nasa.gov/learn/basics-of-space-flight/chapter3-4/)。中心天体を固定した重力のみの運動。中心天体の半径は初期距離の0.18倍で、衝突または距離6倍で計算停止。表示は軌跡の範囲に合わせて縮尺を変更する。
- 共振・干渉: [PhET Wave Interference](https://phet.colorado.edu/en/simulations/wave-interference)。波の重ね合わせを学ぶ体験の参考。振り子は小振幅近似・長さ1.5m・減衰比0.06・周期外力振幅0.25 rad/s²の自作モデル。押す周期と固有周期を合わせた応答の違いを示す。
- 熱: [MIT Heat Equation and Convection-Diffusion](https://ocw.mit.edu/courses/18-086-mathematical-methods-for-engineers-ii-spring-2006/5db29e69494eb09a26f7224d43adc6f6_am54.pdf)。2D陽解法の安定範囲を守り、外への流出がない境界で熱の総量を保存する。手動加熱は外部から熱を加える操作。
- 画像: [SciPy DCTの定義](https://docs.scipy.org/doc/scipy/reference/generated/scipy.fft.dct.html)。正規直交DCT-IIを自作実装。画像全体の32×32変換であり、JPEGの8×8ブロック化・量子化・符号化の再現ではない。

## 実機で確認すること

- 全12体験のカードと各知識マップとの往復、戻る操作。
- うなり・干渉の音量0、再生・停止、再生中に設定を変える／別画面に移る操作。
- 軌道の円・低速衝突・高速投射、ブランコの同周期／ずれた周期、熱のタップ／中央加熱。
- 画像の端末内読み込み・サンプル復帰・周波数1と32の比較。スマホ幅でのスライダー・図・説明文。

buildは既存の知識グラフに加えて、公式・科学図の参照先、日常への経路の連結、学校の知識との直接の関係を検査する。ブラウザ表示はオーナーがdev Pagesで確認する。特にスマートフォンでの長い式、図、入口からマップへの遷移、戻る操作を確認する。
# 電波シリーズ（2026-09-19追加）

## 探究6体験（追加）

- フーリエの巻き取りは既存のフーリエ分解を複素平面で図示。3Hzと振幅0.5の5Hzを4秒・800点で平均する。有限時間の窓による漏れを明記。
- 標本化: [DSP Guide, The Sampling Theorem](https://www.dspguide.com/ch3/2.htm3)。コサイン単音と、標本点が一致する折り返し周波数の候補を表示。点間の線は一般の信号の復元結果ではない。
- 二重スリット: [OpenStax, Young’s Double-Slit Interference](https://openstax.org/books/university-physics-volume-3/pages/3-1-youngs-double-slit-interference)。小角近似I/Imax=cos²(πdy/(λL))。スリット幅の回折包絡線を省略。
- 電磁誘導: [OpenStax, Faraday’s Law](https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law)。教材用の規格化磁束Φ=(1+x²)^(-3/2)を使い、ε=−N(dΦ/dx)v。実磁石の場の完全な解や電力・効率のモデルではない。
- レンズ: [OpenStax, Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses)。薄い凸レンズの近軸公式。実像・虚像・焦点上の無限遠を分ける。図は自動縮尺、スクリーンのぼけは模式表示。
- 円周率: 正方形内の一様疑似乱数と円の面積比を使う。最大5万点、描画は直近3000点、推定値には全点。点を増やすごとに誤差が減る保証はない。

実機確認: 6画面の全スライダーとプリセット、標本化の2倍境界、磁石の停止・反転・端での停止、レンズの実像/虚像/焦点上、点の追加/初期化/5万点停止、スマホの数式と図、戻る・非表示時の停止。計算テスト6件追加済み。配信反映・実機の表示操作は未確認。

## 音の分解・ドップラー効果（同日追加）

- [Basic Acoustics, Fundamentals of Sound](https://www.acousticslab.org/RECA220/PMFiles/Module02a.htm): 周期信号の倍音とフーリエ合成。体験では6本の正弦波を合成し、1周期512点の波形から正弦・余弦への射影で振幅を再計算する。正弦波、奇数倍音1/nの矩形波近似、全倍音1/nののこぎり波近似を用意。6成分のみなので理想的な角や不連続は再現しない。録音解析ではない。全成分0なら無音。
- [OpenStax, University Physics 17.7 The Doppler Effect](https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect): 静止した媒質・聞き手、同一直線上を動く音源のモデル。音速343m/s、接近速度vを正としてf聞こえる=f₀c/(c−v)。速度は−170〜170m/s。音源通過前または表示範囲端で停止。波面は放出位置を中心に音速で拡大し、5Hzに間引いた模式図。試聴は現在の速度での定常音で距離減衰や通過音は再現しない。

数式はMathMLで総和・下付き・分数を表示。図の読み取り結果は文章でも表示。実機ではプリセット、倍音0と全消去、選択成分だけの試聴、速度0/正/負の式と聞き比べ、停止・設定変更・画面非表示・戻る時の停止、スマホの数式と図を確認する。計算はNodeのテスト4件で確認済み、実機の発音と表示は未確認。

- AMと包絡線検波: [Analog Devices, Envelope Detector](https://wiki.analog.com/university/courses/alm1k/circuits1/alm-cir-envelope-detector)
- FM: [Analog Devices, FM Modulator](https://www.analog.com/en/resources/glossary/fm-modulator.html)、[FM detectors](https://www.analog.com/en/resources/analog-dialogue/studentzone/studentzone-november-2024.html)
- 電磁波・スペクトル: [NASA, Electromagnetic Spectrum](https://imagine.gsfc.nasa.gov/science/toolbox/emspectrum2.html)、[NASA, Basics of Space Flight](https://science.nasa.gov/learn/basics-of-space-flight/chapter6-2/)
- 偏光: [MIT OCW, Lecture 17: Polarization](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages/part-iii-optics/lecture-17/)

説明は独自に作成。外部画像や文章を転載せずCanvasで描画する。

`radio` は単音を複素ベースバンドで変調し、AMは絶対値、FMは隣接サンプルの位相差から復調する。音・図のサンプルレート96kHz、図は5msを描画、図に使う搬送波8kHz、FM周波数偏移2000μ Hz、AM変調度μ=0.1〜0.95。無雑音時の復調一致を操作範囲の端と代表値で検証。正の共通利得変動と独立I/Q加算雑音を分ける。「FMはいつでも雑音に強い」と一般化しない。図は復調直後、音は2500Hzを係数計算に使う前後方向の1次低域フィルターと±2の振幅制限、10msのフェードを適用。前後方向処理は比較用のオフライン処理で実受信機そのものではない。搬送波は再生せず、元の音か復調した音のみ3秒再生。

`em-wave` は真空中の同位相の直線偏光を斜め投影。EとBの図の振幅はそれぞれ正規化し、実単位で同じ大きさという意味ではない。`spectrum` はc=299792458m/s、λ=c/f。対数スライダーの帯域境界は概略、マイクロ波は電波の一部。下の波は常に1周期で実寸ではない。`polarization` は進行方向に垂直な面で受信アンテナを回し、電場成分のcosθから電力比cos²θを計算。指向性・反射・障害物による損失を同時に表すものではない。

実機確認: AM/FMの切り替えと波形、雑音0の聞き比べ、振幅雑音と加算雑音の違い、音量0と停止、設定変更・戻る・画面非表示で音が止まること。電磁波の開始/停止/1コマ、動きを減らす設定、スペクトルの各プリセット、偏波0°/45°/90°/180°、スマートフォン幅の図と操作・知識マップへの遷移を確認する。
