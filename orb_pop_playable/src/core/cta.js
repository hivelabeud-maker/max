/* ============================================================================
   cta.js — 설치 유도(CTA). 자동 발동 금지, 1회만 호출. (사례분석 S8)

   ★ 광고망마다 요구 API 가 다르고 서로 배타적이다. 한 파일로 전부 못 낸다:
       Meta      FbPlayableAd.onCTAClick()   외부 요청 전면 금지
       Google    ExitApi.exit()              exitapi.js 를 "반드시 외부에서" 로드
       AppLovin  mraid.open(url)             외부 요청 금지. window.open 은
       Unity     mraid.open(url)             클릭스루 실패로 처리된다

   ★★ 아래 /*<<NET:xxx * / 블록은 build.py --net 이 **해당 망 것만 남기고 삭제**한다.
      런타임 분기로는 부족하다 — 쓰지 않는 코드가 파일에 남아 있으면
      Meta 의 "Uploaded File Contains Redirect to External Link" 같은 정적 검사에
      걸릴 여지를 준다. 실제로 코드가 사라져야 한다.
   ========================================================================== */
var CTA = {
  fired: false,

  /* 설치 버튼이 열 주소.
     빌드된 단일 HTML 맨 위의 `window.STORE_URL` 한 줄이 우선한다 —
     고객사가 소스 없이 압축본만 받아도 그 한 줄만 고쳐 바꿀 수 있게 하려는 것이다. */
  url: function () {
    try { if (window.STORE_URL) return window.STORE_URL; } catch (e) {}
    return THEME.storeUrl;
  },

  fire: function () {
    if (this.fired) return; this.fired = true;
    var u = CTA.url();
/*<<NET:meta*/
    try { if (window.FbPlayableAd && typeof window.FbPlayableAd.onCTAClick === 'function') {
      window.FbPlayableAd.onCTAClick(); return; } } catch (e) {}
/*NET:meta>>*/
/*<<NET:google*/
    try { if (typeof ExitApi !== 'undefined' && ExitApi.exit) { ExitApi.exit(); return; } } catch (e) {}
/*NET:google>>*/
/*<<NET:mraid*/
    try { if (window.mraid && typeof window.mraid.open === 'function') {
      window.mraid.open(u); return; } } catch (e) {}
/*NET:mraid>>*/
/*<<NET:universal*/
    /* 자사 도메인·미리보기·시연 전용. 광고망 입고에는 쓰지 말 것 —
       망별 빌드(--net meta|google|mraid)를 써야 한다. */
    try { if (window.FbPlayableAd && typeof window.FbPlayableAd.onCTAClick === 'function') { window.FbPlayableAd.onCTAClick(); return; } } catch (e) {}
    try { if (window.mraid && typeof window.mraid.open === 'function') { window.mraid.open(u); return; } } catch (e) {}
    try { if (typeof ExitApi !== 'undefined' && ExitApi.exit) { ExitApi.exit(); return; } } catch (e) {}
    try { window.open(u, '_blank'); return; } catch (e) {}
/*NET:universal>>*/
    this.fired = false;
  }
};
