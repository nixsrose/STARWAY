# STARWAY 수익화 구현
## 1차 출시 모델
- 자발적 보상형 광고: 항해당 부활 1회. 안전한 이전 구간에서 재개, 연료 최소 50%.
- 자발적 보상형 광고: 해당 항해의 필드 코인만 2배. 첫 클리어 보너스 제외, 항해당 1회.
- 선택 구매: 120 / 400 / 1,000 코인 충전 상품. 가격은 토스 콘솔 등록 후 SDK의 표시 가격으로 노출.
- 스킨은 외형만 변경. 기존 무료 코인 스킨 유지.
- 자동 전면 광고와 플레이 화면 배너는 현재 적용하지 않음.

## 현재 상태
게임 화면 및 보상/구매 지급 로직은 구현됨. 일반 웹 게시 버전에는 실제 광고 SDK나 결제 사업자 연결이 없음.
광고·결제 미연동이면 버튼을 준비 중으로 표시하고 보상을 지급하지 않음.
광고 데모나 가짜 결제는 제공하지 않음.
토스 광고 SDK 어댑터 소스는 integrations/toss-rewarded.mjs. 토스 앱용 빌드에서 SDK와 실제 광고 그룹 ID를 연결해야 작동함.
구매 흐름은 purchase → verifyPurchase → grantPurchase. 검증 실패·취소 시 지급하지 않으며 동일 orderId를 다시 받아도 중복 지급하지 않음.
실제 현금 결제 활성화 전에 토스 IAP 연결, 서버 주문 검증, 계정별 재화 저장, 미결 주문 복구와 환불 동기화가 필요함.
현재 저장은 브라우저 로컬 저장이므로 여러 기기 간 구매 복원/재화 동기화를 보장하지 않음.

## 호스트 연동 계약
registerRevenueProvider({
 showRewarded: async placement => ({earned: true 또는 false}),
 products: {coins120:{priceLabel: SDK에서 받은 가격}, ...},
 purchase: async productId => ({orderId, ...}),
 verifyPurchase: async receipt => ({valid,orderId,productId}),
 restorePurchases: async () => 검증할 주문 배열,
 track: (event,details) => 분석 수집
});
showRewarded는 실제 userEarnedReward 이벤트 확인 후에만 earned:true를 반환.
결제 API는 신뢰 가능한 서버에서 orderId/sku/사용자/결제 상태를 검증.
서버 지급은 orderId를 유일 키로 원자 처리하고 재시도/미결 주문 복구를 구현.
실상품 가격은 콘솔과 SDK에서 가져와 표시하며 임의 가격을 하드코딩하지 않음.

## 공식 문서
- https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/ads/loadfullscreenad
- https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/ads/showfullscreenad
- https://developers-apps-in-toss.toss.im/guide/monetization/in-app-payment.md

## 지표
run_started, run_finished, reward_requested, reward_cancelled, revive_granted, double_granted, ad_impression, purchase_granted.
현재는 호스트 track에 이벤트 전달. 분석 서비스 미연동으로 서버 수집은 아직 없음.
