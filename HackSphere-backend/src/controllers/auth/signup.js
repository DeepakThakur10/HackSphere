import User from "../../models/user.js";

import bcrypt from "bcrypt";

import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    try{

        const {
        firstName,
        lastName,
        username,
        email,
        password,
    } = req.body;

    if(!firstName || !lastName || !username || !email || !password){
        return res.status(400).json({
            success: false,
            message:"All Fields Required"
        });
    }
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({username});
    if(emailUser){
        return res.status(400).json({
            success: false,
            message:" Email Id ALready Exist"
        })
    }
    if(usernameUser){
        return res.status(400).json({
            success: false,
            message:"Username  ALready Exist"
        })
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: userWithoutPassword
    });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }

};