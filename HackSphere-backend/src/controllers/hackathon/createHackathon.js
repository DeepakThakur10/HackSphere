import Hackathon from "../../models/Hackathon.js";

export const createHackathon = async (req, res) => {
    try {

        const {
            title,
            description,
            mode,
            location,
            isPaid,
            entryFee,
            registrationStart,
            registrationEnd,
            hackathonStart,
            hackathonEnd,
            teamType,
            minTeamSize,
            maxTeamSize,
            maxTeams,
            prizePool,
            techStack,
        } = req.body;

        if ( !title || !description || !mode || !registrationStart || !registrationEnd || !hackathonStart || !hackathonEnd || !teamType || !maxTeams ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are required",
            });
        }

        const regStart = new Date(registrationStart);
        const regEnd = new Date(registrationEnd);
        const hackStart = new Date(hackathonStart);
        const hackEnd = new Date(hackathonEnd);

        if(regEnd <= regStart){
            return res.status(400).json({
                success: false,
                message: "Registration End Date must be after Registration Start date Only"
            })
        }

        if(regEnd >= hackStart){
            return res.status(400).json({
                success: false,
                message: "Hackathon Must Start Only After Registartion End"
            })
        }

        if(hackEnd <= hackStart){
            return res.status(400).json({
                success: false,
                message: "Hackathon End Date Must Be after hackathon Start date " 
            })
        }

        if (minTeamSize > maxTeamSize) {
            return res.status(400).json({
                success: false,
                message: "Minimum team size cannot be greater than maximum team size",
            });
        }
        if (!isPaid && entryFee > 0) {
            return res.status(400).json({
                success: false,
                message: "Entry fee must be 0 for free hackathons.",
            });
        }

        if (isPaid && entryFee <= 0) {
            return res.status(400).json({
                success: false,
                message: "Paid hackathons must have a valid entry fee.",
            });
        }

        if ( teamType === "individual" && (minTeamSize !== 1 || maxTeamSize !== 1 )) {
            return res.status(400).json({
                success: false,
                message: "Individual hackathons must have team size 1.",
            });
        }

        const hackathon = await Hackathon.create({
            title,
            description,
            mode,
            location,
            isPaid,
            entryFee,
            registrationStart,
            registrationEnd,
            hackathonStart,
            hackathonEnd,
            teamType,
            minTeamSize,
            maxTeamSize,
            maxTeams,
            prizePool,
            techStack,
            createdBy: req.user.id,

        });
        return res.status(201).json({
            success: true,
            message: "Hackathon Created Successfully",
            hackathon
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};