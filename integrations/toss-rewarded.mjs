// Bundle this module inside the Apps in Toss WebView build.
// Official SDK: https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/ads/showfullscreenad
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
export function createTossRewardedProvider(adGroupIds, track=()=>{}) {
  return {
    track,
    async showRewarded(placement) {
      const adGroupId=adGroupIds[placement];
      if(!adGroupId||!loadFullScreenAd.isSupported()||!showFullScreenAd.isSupported())throw new Error('ads_unavailable');
      await new Promise((resolve,reject)=>{
        let settled=false,cleanup=()=>{};
        const timer=setTimeout(()=>done(new Error('ad_load_timeout')),20000);
        function done(error){if(settled)return;settled=true;clearTimeout(timer);queueMicrotask(()=>cleanup());error?reject(error):resolve();}
        cleanup=loadFullScreenAd({options:{adGroupId},onEvent:e=>{if(e.type==='loaded')done()},onError:done});
      });
      return new Promise((resolve,reject)=>{
        let earned=false,settled=false,cleanup=()=>{};
        const timer=setTimeout(()=>done(new Error('ad_show_timeout')),180000);
        function done(error){if(settled)return;settled=true;clearTimeout(timer);queueMicrotask(()=>cleanup());error?reject(error):resolve({earned});}
        cleanup=showFullScreenAd({options:{adGroupId},onEvent:e=>{
          if(e.type==='userEarnedReward')earned=true;
          if(e.type==='impression')track('ad_impression',{placement});
          if(e.type==='dismissed')done();
          if(e.type==='failedToShow')done(new Error('ad_failed_to_show'));
        },onError:done});
      });
    }
  };
}
// Register after the client bundle loads:
// registerRevenueProvider(createTossRewardedProvider({revive:REAL_REWARD_AD_GROUP_ID,double:REAL_REWARD_AD_GROUP_ID}));
