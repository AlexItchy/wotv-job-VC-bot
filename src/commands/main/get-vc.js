const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const { getVcListPerJob, getVcStats, getJobGroups } = require(path.join(__dirname, '../../wotv/get-vc-list-per-job.js'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-vc')
		.setDescription('Get VCs for provided jobs or units')
		.addStringOption(option =>
			option.setName('job1')
				.setDescription('Job of teammate #1')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('job2')
				.setDescription('Job of teammate #2')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('job3')
				.setDescription('Job of teammate #3')
				.setAutocomplete(true))
		.addBooleanOption(option =>
			option.setName('show')
				.setDescription('Show results to channel. Defaults to false.')),
	async execute(interaction) {

		const searchList = [
			interaction.options.getString('job1'),
			interaction.options.getString('job2'),
			interaction.options.getString('job3')
		].filter(e => e).filter((e, idx, arr) => arr.indexOf(e) == idx);

		const show = interaction.options.getBoolean('show');

		if (searchList.length <= 1) {

			await interaction.reply({
				content: 'Input invalid. Must provide more than one job.',
				ephemeral: true
			});

		} else if (searchList.length === 2) {

			const vcOverlapReport = await getVcListPerJob(searchList);

			await interaction.reply({
				embeds: [buildResponse(vcOverlapReport)],
				ephemeral: !show,
			});

		} else if (searchList.length === 3) {

			const vcOverlapReport = await getVcListPerJob(searchList);

			await interaction.reply({
				embeds: [ ...vcOverlapReport.map(e => buildResponse(e))	],
				ephemeral: !show,
			});
			
		}

	},
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name.includes('job')) {
			const filtered = getJobGroups().filter(e => e.startsWith(focusedOption.value));
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