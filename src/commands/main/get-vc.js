const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const { getVcListPerJob, getVcStats, getJobGroups } = require(path.join(__dirname, '../../wotv/get-vc-list-per-job.js'));

const jobs = [
	'Sword (Red Mage etc.)',
	'Sword (Warrior etc.)',
	'Sword (Knight etc.)',
	'Greatsword',
	'Axe',
	'Spear',
	'Bow',
	'Gun',
	'Fists',
	'Dagger',
	'Ninja Blade',
	'Katana',
	'Staff (Black Mage etc.)',
	'Staff (Devout etc.)',
	'Mace',
	'Gloves',
	'Book'
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-vc')
		.setDescription('Get VCs for provided jobs or units')
		.addStringOption(option =>
			option.setName('team1')
				.setDescription('Unit/Job of teammate #1')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('team2')
				.setDescription('Unit/Job of teammate #2')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('team3')
				.setDescription('Unit/Job of teammate #3')
				.setAutocomplete(true)),
	async execute(interaction) {

		const searchList = [
			interaction.options.getString('team1'),
			interaction.options.getString('team2'),
			interaction.options.getString('team3')
		].filter(e => e);

		if (searchList.length <= 1) {

			await interaction.reply({
				content: 'Input invalid. Must provide more than one team member.',
				ephemeral: true
			});

		} else if (searchList.length === 2) {

			const vcOverlapReport = await getVcListPerJob(searchList);

			await interaction.reply({
				embeds: [buildResponse(vcOverlapReport)],
				ephemeral: true,
			});

		} else if (searchList.length === 3) {

			const vcOverlapReport = await getVcListPerJob(searchList);

			await interaction.reply({
				embeds: [ ...vcOverlapReport.map(e => buildResponse(e))	]
			});
			
		}

	},
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name.includes('team')) {
			const filtered = jobs.filter(e => e.startsWith(focusedOption.value));
			await interaction.respond(
				filtered.map(choice => ({ name: choice, value: choice })),
			);
		}

	},
};

function buildResponse (report) {

	const overlapReport = {
		color: 0x0099ff,
		title: report.jobs.join(', '),
		description: 'List of VCs:',
		fields: report.overlap.reduce((prev, vcName) => {

			prev.push({
				name: '',
				value: `[${vcName}](https://wotv-calc.com/cards/${vcName.toLowerCase().replaceAll(/[^a-zA-Z ]/g, '').replaceAll(' ', '-')})`
			});

			const vcStats = getVcStats(vcName);

			vcStats.partyEffects.forEach(e => {
				prev.push({
					name: e.name,
					value: e.value,
					inline: true
				});
			});

			return prev;
		}, [])
	}

	if (report.overlap.length == 0) {
		overlapReport.fields.push({
			name: '',
			value: ':x:'
		})
	}

	return overlapReport;

}