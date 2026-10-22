import prisma from "../../lib/prisma";

const getAllUsers = async () => {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
			updatedAt: true,
		},
	});
	return users;
};

export const usersServices = {
  getAllUsers,
};
