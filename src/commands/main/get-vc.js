const { SlashCommandBuilder } = require('discord.js');

const units = [
	'Mont',
	'Rain',
	'Lasswell'
];

const jobs = [
	'Axe',
	'Book',
	'Bow'
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-vc')
		.setDescription('Get VCs for provided jobs or units')
		.addStringOption(option =>
			option.setName('team1')
				.setDescription('Unit/Job of teammate #1')
				.setAutocomplete(true))
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether or not the echo should be ephemeral'))
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')),
	async execute(interaction) {

		const isEphemeral = interaction.options.getBoolean('ephemeral');

		await interaction.reply({
			content: interaction.options.getString('query') || "TEST",
			ephemeral: isEphemeral
		});



		//await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name.includes('team')) {
			const filtered = [
				...units,
				...jobs
			].filter(e => e.startsWith(focusedOption.value))

			await interaction.respond(
				filtered.map(choice => ({ name: choice, value: choice })),
			);
		}

	},
};
