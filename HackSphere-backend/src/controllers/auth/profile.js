import User from "../../models/user.js";

const buildProfileResponse = (user) => {
	const { password: _, ...profile } = user.toObject();

	return profile;
};

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Profile fetched successfully",
			data: buildProfileResponse(user),
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

export const updateProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const updatableFields = [
			"firstName",
			"lastName",
			"username",
			"phone",
			"profilePicture",
			"bio",
			"collegeOrOrganization",
			"github",
			"linkedin",
			"portfolio",
			"skills",
		];

		updatableFields.forEach((field) => {
			if (req.body[field] !== undefined) {
				user[field] = field === "skills" && Array.isArray(req.body.skills)
					? req.body.skills.filter(Boolean)
					: req.body[field];
			}
		});

		await user.save();

		return res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: buildProfileResponse(user),
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal Server Error",
			error: error.message,
		});
	}
};