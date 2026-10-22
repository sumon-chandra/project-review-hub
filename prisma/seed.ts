import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";
import envConfigs from "../src/configs/env-configs.js";

async function main() {
	const mentorEmail = envConfigs.seedMentor.email;
	const mentorPassword = envConfigs.seedMentor.password;
	const mentorName = envConfigs.seedMentor.name;

	console.log(`Checking for existing mentor account: ${mentorEmail}...`);

	const existingMentor = await prisma.user.findUnique({
		where: { email: mentorEmail },
	});

	if (existingMentor) {
		console.log(`Mentor account (${mentorEmail}) already exists. Skipping creation.`);
		return;
	}

	const hashedPassword = await bcrypt.hash(mentorPassword, envConfigs.bcrypt.saltRounds);

	const createdMentor = await prisma.user.create({
		data: {
			name: mentorName,
			email: mentorEmail,
			password: hashedPassword,
			role: "MENTOR",
		},
	});

	console.log(`Mentor account created successfully with ID: ${createdMentor.id}`);
}

main()
	.catch((e) => {
		console.error("Error seeding mentor account:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
