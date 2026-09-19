# 公式・科学の図の参照資料

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

- 全8体験のカードと各知識マップとの往復、戻る操作。
- うなり・干渉の音量0、再生・停止、再生中に設定を変える／別画面に移る操作。
- 軌道の円・低速衝突・高速投射、ブランコの同周期／ずれた周期、熱のタップ／中央加熱。
- 画像の端末内読み込み・サンプル復帰・周波数1と32の比較。スマホ幅でのスライダー・図・説明文。

buildは既存の知識グラフに加えて、公式・科学図の参照先、日常への経路の連結、学校の知識との直接の関係を検査する。ブラウザ表示はオーナーがdev Pagesで確認する。特にスマートフォンでの長い式、図、入口からマップへの遷移、戻る操作を確認する。
