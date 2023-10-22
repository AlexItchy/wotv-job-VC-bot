const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const rawMappingUrl = {
    visionCardInfo: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/data/VisionCard.json',
    jobGrouping: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/data/VisionCardJobConditionGroup.json',
    visionCardName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/en/VisionCardName.json',
    jobName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/en/JobName.json',
    jobGroupName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/en/VisionCardJobCondGroup.json',
    unitName: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/en/UnitName.json',
    jobGroupCaption: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/en/CaptionLimitedCond.json',
    buffs: 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/01aa44d17e2795631b826b4cbd1e3614a411c13e/data/Buff.json',
};

let rawMappingJson;

const partyEffectLegend = {
    1: 'HP',
    2: 'TP',
    3: 'AP',
    4: 'CT',
    5: 'SP: Evocation',
    21: 'ATK',
    22: 'DEF',
    23: 'MAG',
    24: 'SPR',
    25: 'DEX',
    26: 'AGI',
    27: 'LUCK',
    28: 'MOVE',
    29: 'JUMP',
    42: 'Fire Element',
    43: 'Ice Element',
    44: 'Wind Element',
    45: 'Earth Element',
    46: 'Lightning Element',
    47: 'Water Element',
    48: 'Light Element',
    49: 'Dark Element',
    50: 'All Element',
    61: 'Slash Atk',
    62: 'Pierce Atk',
    63: 'Strike Atk',
    64: 'Missile Atk',
    65: 'Magic Atk',
    70: 'All Atk',
    81: 'CON HEAL HP',
    82: 'CON HEAL TP',
    83: 'CON HEAL AP',
    84: 'Poison',
    85: 'Blind',
    86: 'Sleep',
    87: 'Silence',
    88: 'Paralysis',
    89: 'Confusion',
    90: 'Charm',
    91: 'Petrify',
    92: 'Toad',
    95: 'Haste',
    96: 'Slow',
    97: 'Stop',
    98: 'Stun',
    99: 'Immobilize',
    100: 'Disable',
    101: 'Berserk',
    102: 'Doom',
    103: 'Revive',
    104: 'Reraise',
    105: 'Protect',
    106: 'Shell',
    110: 'Float',
    111: 'Death',
    112: 'Quicken',
    113: 'Courage',
    114: 'Evade Physical hit',
    115: 'Evade Magical hit',
    116: 'Perfect hit',
    117: 'Perfect critical',
    119: 'Element Killer',
    120: 'Species Killer',
    123: 'Inflict',
    124: 'Nullify CT',
    126: 'Phys Species Killer',
    130: 'Mag Species Killer',
    133: 'Flat Dmg Species Killer',
    140: 'Esuna',
    141: 'Dispel All',
    142: 'Resist All',
    143: 'Inflict',
    144: 'Nullify CT',
    151: 'Initial AP',
    152: 'Range',
    155: 'ACC',
    156: 'Evade',
    157: 'Crit Dmg',
    158: 'Crit Rate',
    159: 'Crit Evasion',
    180: 'Hate',
    181: 'Brave',
    182: 'Faith',
    183: 'Cast time',
    184: 'Cast time (attack)',
    190: 'Acquired AP',
    191: 'Evoc Gauge Boost',
    192: 'Brave Bonus',
    193: 'Faith Bonus',
    194: 'Acquired JP',
    200: 'Debuff Resist',
    201: 'HP Debuff Resist',
    202: 'ATK Debuff Resist',
    203: 'DEF Debuff Resist',
    204: 'MAG Debuff Resist',
    205: 'SPR Debuff Resist',
    207: 'AGI Debuff Resist',
    272: 'Slash Res Debuff Resist',
    273: 'Pierce Res Debuff Resist',
    274: 'Strike Res Debuff Resist',
    275: 'Missile Res Debuff Resist',
    276: 'Magic Res Debuff Resist',
    277: 'Unknown Debuff Resist',
    278: 'All Element Debuff Resist',
    310: 'Unit Attack Res',
    311: 'AoE Attack Res',
    312: 'Max Damage',
    313: 'Evocation Skill+',
    314: 'Def Penetration',
    316: 'AP Cost Reduction',
    317: 'Avoid TP Dmg',
    318: 'Avoid AP Dmg',
    319: 'SPR Penetration',
    321: 'Slash Res Pen',
    323: 'Pierce Res Pen',
    325: 'Strike Res Pen',
    327: 'Missile Res Pen',
    329: 'Magic Res Pen',
    331: 'Fire Res Pen',
    333: 'Ice Res Pen',
    335: 'Wind Res Pen',
    337: 'Earth Res Pen',
    339: 'Lightning Res Pen',
    341: 'Water Res Pen',
    343: 'Light Res Pen',
    345: 'Dark Res Pen',
    347: 'Healing Power',
    348: 'Reaction Pen',
    350: 'Reaction Block Rate',
    357: 'Chain Resistance',
    363: 'Debuff Effect Weakening'
}

async function getVcListPerJob (searchList) {

    const vcList = buildVcList(rawMappingJson);

    if (searchList.length === 2) {
        return getOverlappingVc(searchList, vcList);
    } else if (searchList.length === 3) {

        const overlap1_2 = getOverlappingVc([ searchList[0], searchList[1] ], vcList);
        const overlap1_3 = getOverlappingVc([ searchList[0], searchList[2] ], vcList);
        const overlap2_3 = getOverlappingVc([ searchList[1], searchList[2] ], vcList);
        const overlapAll = {
            jobs: searchList,
            overlap: getDuplicates([...overlap1_2.overlap, ...overlap1_3.overlap, ...overlap2_3.overlap])
        };

        return [ overlap1_2, overlap1_3, overlap2_3, overlapAll ];

    }


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

function getVcStats (vcName) {

    const vcList = buildVcList(rawMappingJson);

    return vcList.find(e => e.name === vcName);

}

function getOverlappingVc(jobSearchList, vcList) {

    const jobList = jobSearchList.map((job) => {
        return vcList.reduce((prev, vc) => {

            const found = vc.jobGroup.find(e => e.replace(/[^a-zA-Z ]/g, "") === job.replace(/[^a-zA-Z ]/g, ""));
    
            if (!found) return prev;
            return [
                ...prev,
                vc.name
            ]
    
        }, []);
    })

    return {
        jobs: jobSearchList,
        overlap: getDuplicates(jobList.flat())
    };

}

async function getRawJson (URL) {

    const response = await fetch(URL);
    return await response.json();

}

function buildUnitList (mappingJson) {

    const {
        jobGrouping,
        jobName,
        unitName
    } = mappingJson;

}

function buildVcList (mappingJson) {

    const {
        visionCardInfo,
        visionCardName,
        jobGroupCaption,
        buffs
     } = mappingJson;

    return visionCardInfo.items.reduce((prev, curr) => {

        if (!curr.card_buffs) return prev;
        if (curr.cost < 60) return prev;

        const currJobGroup = curr.card_buffs.find(e => e.cnds_iname);

        if (!currJobGroup) return prev;

        const {
            value: currJobGroupCaption
        } = jobGroupCaption.infos.find(e => e.key === currJobGroup.cnds_iname);

        if (currJobGroupCaption === '') return prev;

        const {
            value: vcName
        } = visionCardName.infos.find(e => e.key === curr.iname);

        const jobGroup = currJobGroupCaption.trim().split('/');

        const partyEffectRaw1 = buffs.items.find(e => e.iname === `BUFF_${curr.iname}_GS` || e.iname === `BUFF_GL_${curr.iname}_GS`);
        const partyEffectRaw2 = buffs.items.find(e => e.iname === `BUFF_${curr.iname}_GS_AW` || e.iname === `BUFF_GL_${curr.iname}_GS_AW`);
        const partyEffectRaw3 = buffs.items.find(e => e.iname === `BUFF_${curr.iname}_GSMAX` || e.iname === `BUFF_GL_${curr.iname}_GSMAX`);
        const partyEffectRaw4 = buffs.items.find(e => e.iname === `BUFF_${curr.iname}_GSMAX_2`|| e.iname === `BUFF_GL_${curr.iname}_GSMAX_2`);

        const partyEffect1 = {
            name: `${partyEffectRaw1.calc1 == 3 ? partyEffectLegend[partyEffectRaw1.type1] + ' Res' : partyEffectLegend[partyEffectRaw1.type1]}`,
            value: partyEffectRaw1.val11 + partyEffectRaw2.val11 + partyEffectRaw3.val11
        }

        const partyEffect2 = {
            name: `${partyEffectRaw1.calc2 == 3 ? partyEffectLegend[partyEffectRaw1.type2] + ' Res' : partyEffectLegend[partyEffectRaw1.type2]}`,
            value: partyEffectRaw1.val21 + partyEffectRaw2.val21 + partyEffectRaw3.val21
        }

        const partyEffect3 = {
            name: `${partyEffectRaw4.calc1 == 3 ? partyEffectLegend[partyEffectRaw4.type1] + ' Res' : partyEffectLegend[partyEffectRaw4.type1]}`,
            value: partyEffectRaw4.val11
        }

        return [
            ...prev,
            {
                name: vcName,
                jobGroup: jobGroup,
                partyEffects: [
                    partyEffect1,
                    partyEffect2,
                    partyEffect3
                ]
            }
        ]

    }, [])

}

function getJobGroups () {

    const {
        jobGroupName
    } = rawMappingJson;

    return jobGroupName.infos.map(e => e.value).filter(e => e == 'All')

}

function getDuplicates (arr) {

    return [...new Set(arr.filter((item, index) => arr.indexOf(item) != index))]

}

module.exports = {
    getVcListPerJob,
    getVcStats,
    getJobGroups
};

(async () => {

    rawMappingJson = await getRawMappingJson();

})()