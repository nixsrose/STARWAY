# Quest flow — v0.346

Quest cards now show remaining goals and navigate to story selection, ship shop, or upgrades as appropriate. Claimable cards appear first, followed by progress and claimed cards. After a successful claim, the footer offers a direct route to ship upgrades. Navigation does not start a run or spend coins.

Goals, rewards, daily reset, eligibility, save rollback, and duplicate-claim protection are unchanged. Sorting retains original reward indexes.

Validation: quests, quest-claim-all, quest-flow, progress-localization, and ship-upgrades tests passed; build and git diff checks passed. Browser QA at 390×660 confirmed 757→807 coins after claiming a 50-coin reward and navigation to the equipped Scout upgrade screen. Physical-device touch testing remains outside this verification.

Screenshot: qa/quest-flow-20261024.jpg
