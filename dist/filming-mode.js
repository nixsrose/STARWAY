// Session-only capture loadout. Native storage is isolated before any game module loads.
if(starwayFilmingMode){
 data.unlocked=Math.max(data.unlocked,STORY_VISIBLE_COUNT-1);
 data.owned=skins.map((_,id)=>id);
 data.coins=Math.max(data.coins,999999);
 for(const id of data.owned)for(const key of shipUpgradeKeys)data.shipUpgrades[id][key]=5;
 for(const type of ['paint','flame','trail'])data.cosmetics[type].owned=cosmeticCatalog[type].map((_,id)=>id);
 // Reward cosmetics can be equipped without forging challenge stars or records.
 const filmingReconcile=reconcileChallengeCosmetics;
 reconcileChallengeCosmetics=function(game){if(game===data)return;return filmingReconcile(game);};
 challengeCosmeticLocked=function(){return false;};
 developerModeEnabled=true;syncDeveloperMode();
 save();
}
