const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const { getVcListPerJob, getVcStats, getJobGroups, getVcSuggestion } = require(path.join(__dirname, '../../wotv/get-vc-list-per-job.js'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suggest-job-vc')
		.setDescription('Suggest job groups that have the most overlap of VCs for provided jobs')
		.addStringOption(option =>
			option.setName('job1')
				.setDescription('Job of teammate #1')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('job2')
				.setDescription('Job of teammate #2')
				.setAutocomplete(true))
		.addIntegerOption(option => 
			option.setName('num-of-results')
				.setDescription('Number of job groups returned. Defaults to 3.'))
		.addBooleanOption(option =>
			option.setName('show')
				.setDescription('Show results to channel. Defaults to false.')),
	async execute(interaction) {

		const searchList = [
			interaction.options.getString('job1'),
			interaction.options.getString('job2')
		].filter(e => e).filter((e, idx, arr) => arr.indexOf(e) == idx);

		const show = interaction.options.getBoolean('show');
		const numOfResults = interaction.options.getInteger('num-of-results');
		const vcOverlapReport = await getVcSuggestion(searchList, numOfResults ?? 3);

		if (searchList.length > 0) {
			await interaction.reply({
				embeds: buildResponse(vcOverlapReport),
				ephemeral: !show,
			});
		} else {
			await interaction.reply({
				content: 'Input invalid. Must provide at least one job.',
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

function buildResponse (reportList) {

	return reportList.reduce((prev, report) => {
		
		const overlapReport = {
			color: 0x0099ff,
			title: report.jobs.join(', '),
			description: `Overlapping VCs: ${report.overlap.length}`,
			fields: []
		};

		if (report.overlap.length == 0) {
			overlapReport.fields.push({
				name: '',
				value: ':x:'
			})

			prev.push(overlapReport);

		} else {

			const embedParts = parseInt(report.overlap.length / 6) + ( report.overlap.length % 6 > 0 ? 1 : 0 );
			let embedCounter = 0;

			report.overlap.forEach((vcName, idx) => {

				overlapReport.fields.push({
					name: '',
					value: `[${vcName}](https://wotv-calc.com/cards/${vcName.toLowerCase().replaceAll(/[^a-zA-Z ]/g, '').replaceAll(' ', '-')})`
				});

				const vcStats = getVcStats(vcName);
	
				vcStats.partyEffects.forEach(e => {
					overlapReport.fields.push({
						name: e.name,
						value: e.value,
						inline: true
					});
				});
				
				if (((idx+1) % 6 == 0 && idx >= 5) || idx+1 == report.overlap.length) {
					embedCounter++;
					prev.push({
						...overlapReport,
						title: embedParts > 1 ? overlapReport.title + ` ${embedCounter}/${embedParts}` : overlapReport.title
					})
					overlapReport.fields = []
				}

			})

		}

		return prev;

	}, []);

}