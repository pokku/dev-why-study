export const interestGroups = [
 {title:'音楽・音',nodes:['music','guitar','noise-cancelling','digital-audio','radio-receiver','speaker','microphone','piano','equalizer']},
 {title:'ゲーム・AI',nodes:['game','game-physics','ai','image-recognition','game-developer','software-engineer','data-scientist','game-pathfinding','game-collision','game-ranking','recommendation-system']},
 {title:'スマホ・通信',nodes:['smartphone','wifi','internet','ofdm','amplitude-modulation','frequency-modulation','demodulation','communication-engineer','semiconductor','electromagnetic-spectrum','polarization','qr-code','touchscreen','error-correction','data-encryption','search-engine']},
 {title:'写真・映像',nodes:['camera','compression','image-recognition','sensor','polarization','video-frames','image-pixels','camera-exposure','image-stabilization']},
 {title:'スポーツ・体の動き',nodes:['baseball','breaking-ball','soccer-curve','basketball-shot','sprint-record','swimming-drag']},
 {title:'料理・暮らし',nodes:['cooking','electric-generator','recipe-scaling','electric-kettle','refrigerator','ih-cooking']},
 {title:'宇宙・天気',nodes:['space','sun','weather','gps','artificial-satellite','moon-phases','rainbow','weather-probability']},
 {title:'乗り物・ロボット',nodes:['car','airplane','robot','sensor','electric-generator','car-braking','bicycle-gears','drone-control','electric-motor']},
 {title:'医療・生命',nodes:['medicine','medical-researcher','ultrasound-imaging','mri-imaging','eyeglasses','dna-identification','physician','pharmacist','radiological-technologist']},
 {title:'仕事・将来',nodes:['software-engineer','game-developer','data-scientist','ai-researcher','security-engineer','network-engineer','communication-engineer','electrical-engineer','mechanical-engineer','aerospace-engineer','architect','surveyor','optical-engineer','sound-engineer','astronomer','weather-forecaster','physician','pharmacist','radiological-technologist','medical-researcher','actuary','sports-analyst','chef']},
];
export function interestPaths(nodes){const map=new Map(nodes.map(n=>[n.id,n]));return interestGroups.flatMap(group=>group.nodes.filter(id=>map.has(id)).map(id=>({labels:[group.title],node:map.get(id)})));}
