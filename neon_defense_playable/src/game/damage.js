/* ============================================================================
   damage.js — 피해 출처별 집계 (2차 신규)

   레퍼런스 좌하단 "스킬 피해 현황" 패널(3.7k / 15.7k / 3.9k 형식)의 데이터원이다.

   ■ 스킬을 새로 만들지 않았다
     이 게임엔 이미 성격이 다른 피해 출처가 넷 있다 —
     부채꼴 사격 · 착탄 스플래시 · 360° 볼리 · 피날레 섬멸.
     여기에 이름과 색만 붙이면 "스킬 피해 현황"이 그대로 성립한다.
     레퍼런스를 흉내내려고 없는 스킬을 만들면 24초 안에 설명할 방법이 없다.

   ■ 표시값은 반드시 스무딩한다
     원본 수치는 볼리 한 방에 30~50마리가 죽으면서 계단처럼 튄다.
     그대로 그리면 "느린 박자로 덜컥덜컥 올라간다"로 보인다 — 1차에서 실제로
     받은 지적이고, 원인은 스무딩 부재였다. engine.js 의 Game.killShown
     지수수렴 패턴을 그대로 복제한다 (남은 차이에 비례 + 최소 속도).
   ========================================================================== */
var Damage = {
  /* 표시 순서 = 이 배열 순서. HUD 가 그대로 읽어 행을 만든다.
     icon 은 data/icons.js 의 도트 키, col 은 값 텍스트 색 */
  SRC: [
    { id:'basic',    name:'집중 사격',   icon:'dmg_fan',  col:'#8ef0ff' },
    { id:'splash',   name:'착탄 폭발',   icon:'dmg_burst',col:'#ff5fd6' },
    { id:'volley',   name:'전방위 난사', icon:'dmg_ring', col:'#a77bff' },
    { id:'ultimate', name:'섬멸',        icon:'dmg_ult',  col:'#ffd25f' }
  ],

  raw: null, shown: null, total: 0,

  reset: function () {
    this.raw = {}; this.shown = {}; this.total = 0;
    for (var i = 0; i < this.SRC.length; i++) {
      this.raw[this.SRC[i].id] = 0; this.shown[this.SRC[i].id] = 0;
    }
  },

  add: function (src, amt) {
    if (!this.raw) this.reset();
    if (!(amt > 0)) return;
    if (this.raw[src] === undefined) src = 'basic';   /* 미분류는 기본 사격으로 */
    this.raw[src] += amt;
    this.total += amt;
  },

  /* 지수수렴 — 남은 차이에 비례해 따라가되 최소 속도를 둬서
     작은 차이도 한 박자 안에 메운다 (killShown 과 같은 공식) */
  update: function (dt) {
    if (!this.raw) this.reset();
    for (var i = 0; i < this.SRC.length; i++) {
      var id = this.SRC[i].id, gap = this.raw[id] - this.shown[id];
      if (gap > 0) this.shown[id] = Math.min(this.raw[id],
                     this.shown[id] + Math.max(gap * 6.5, 40) * dt);
      else this.shown[id] = this.raw[id];
    }
  },

  /* ?t= 로 시간을 건너뛴 캡처에서 표시값이 0부터 기어오르지 않게 한다 */
  snap: function () {
    if (!this.raw) this.reset();
    for (var i = 0; i < this.SRC.length; i++) {
      var id = this.SRC[i].id; this.shown[id] = this.raw[id];
    }
  },

  /* 3.7k 형식 — 레퍼런스 표기. 네 자리를 그대로 쓰면 패널 폭이 흔들린다 */
  fmt: function (v) {
    v = v || 0;
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000)    return (v / 1000).toFixed(1) + 'k';
    return '' + (v | 0);
  }
};
