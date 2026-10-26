// Banner-only placement preview. No ad network requests, impressions or rewards are simulated.
function bannerPlacement(){if(editorTesting||creatorActive)return null;if(state==='menu'&&menuScreen==='main')return 'main';if(['win','dead'].includes(state)&&menuScreen==='result')return 'result';return null}
function syncBannerPlacement(){const placement=bannerPlacement(),words={ko:['배너 광고 영역 · 테스트','실제 광고는 아직 연결되지 않았습니다.'],en:['BANNER PLACEMENT · TEST','Live ads are not connected yet.'],ja:['バナー広告枠 · テスト','実際の広告は未接続です。'],zh:['横幅广告位 · 测试','尚未接入实际广告。']}[settings.language]||['BANNER · TEST','Live ads are not connected.'];for(const [id,key]of [['mainBanner','main'],['resultBanner','result']]){const box=$(id);box.classList.toggle('hidden',placement!==key);box.innerHTML='<small>'+words[0]+'</small><span>'+words[1]+'</span>';} $('overlay').setAttribute('data-banner-placement',placement||'none');}
// Opt out of legacy rewarded ad placements, even if a host registers a provider.
hasAds=function(){return false};
const bannerMenu=showMenu;showMenu=function(...args){const out=bannerMenu(...args);syncBannerPlacement();return out};
const bannerFinish=finish;finish=function(...args){const out=bannerFinish(...args);syncBannerPlacement();return out};result=finish;
const bannerFailure=showFailureFeedback;showFailureFeedback=function(...args){const out=bannerFailure(...args);syncBannerPlacement();return out};
const bannerBegin=beginRun;beginRun=function(...args){const out=bannerBegin(...args);syncBannerPlacement();return out};
const bannerPause=pause;pause=function(...args){const out=bannerPause(...args);syncBannerPlacement();return out};
syncBannerPlacement();
