const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const rawMappingUrl = {
    visionCardInfo: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/data/VisionCard.json',
    jobGrouping: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/data/VisionCardJobConditionGroup.json',
    visionCardName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/en/VisionCardName.json',
    jobName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/en/JobName.json',
    jobGroupName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/en/VisionCardJobCondGroup.json',
    unitName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/en/UnitName.json',
    jobGroupCaption: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/en/CaptionLimitedCond.json',
    buffs: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master/data/Buff.json',
};

async function getRawMappingJson () {

    const rawMappingJson = {};

    await Promise.all(
        Object.keys(rawMappingUrl).map(async (e) => {
            rawMappingJson[e] = await getRawJson(rawMappingUrl[e]);
        })
    );

    return rawMappingJson;

}

async function getRawJson (URL) {

    const response = await fetch(URL);
    return await response.json();

}

cron.schedule('* * * * *', async () => {
    console.log('running a task every minute');
    const rawMappingJson = await getRawMappingJson();

    fs.writeFileSync(path.join(__dirname, 'data-dump-raw', 'wotv_datamine_info.json'), JSON.stringify(rawMappingJson, '', '  '));
});
