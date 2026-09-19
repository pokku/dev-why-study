# 公式・科学の図の参照資料

確認日: 2026-09-19。説明文・MathML・SVGは自作。提供画像は見せ方の参考とし、転載していない。

- 質量とエネルギー、太陽の核融合: [CERNの教材](https://cds.cern.ch/record/2905272/files/4_Passport_E-mc2.pdf)、[Einstein Online](https://www.einstein-online.info/en/spotlights/sr/sr-sub03/)。Eは静止エネルギーと明記。太陽への経路は核融合を介する。
- 波動方程式: [MIT・The Wave Equation](https://ocw.mit.edu/ans7870/18/18.013a/textbook/HTML/chapter29/section04.html)。表示は一定速度の1次元の形。弦の変位yを例にし、音の空気振動や電磁場と同一の物理量と扱わない。
- マクスウェル方程式と電磁波: [MIT OCW Lecture 12](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages/part-ii-electromagnetic-waves/lecture-12/)。表示はD/Hを含む巨視的な形。ρ/Jは自由電荷・自由電流。図は直交する場を斜めから見た概念図。
- ナビエ–ストークス方程式と航空: [NASA Glenn](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/navier-strokes-equation/)。表示は一定密度・粘性の非圧縮性の形に限定し、∇·u=0を併記。fは単位質量あたりの外力。実際の気象計算は圧縮性や熱などを含むことを記載。
- シュレーディンガー方程式: [MIT Quantum Physics I](https://www.ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2013/)、[MIT 物質の電気・光学・磁気特性](https://www.ocw.mit.edu/courses/3-23-electrical-optical-and-magnetic-properties-of-materials-fall-2007/pages/lecture-notes/)。表示は非相対論的な1粒子・スカラーポテンシャルの形。半導体をこの式だけで設計できるとは説明しない。
- MathML: [MDN Getting started](https://developer.mozilla.org/en-US/docs/Web/MathML/Tutorials/For_beginners/Getting_started)。分数、上付き、ベクトル、複数行をブラウザで組版。外部CDNや数式画像に依存しない。

運動方程式は質量一定・慣性系、三平方は直角三角形、オームの法則は一定条件で電圧と電流が比例する抵抗、と適用条件を付記する。

## 表示確認

buildは既存の知識グラフに加えて、公式・科学図の参照先、日常への経路の連結、学校の知識との直接の関係を検査する。ブラウザ表示はオーナーがdev Pagesで確認する。特にスマートフォンでの長い式、図、入口からマップへの遷移、戻る操作を確認する。
