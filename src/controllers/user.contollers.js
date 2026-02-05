import asyncHandler from "express-async-handler";
import {
  User,
  generateAccessToken,
  generateRefreshToken,
} from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, address } =
    req.body;

  const findUser = await User.findOne({ email });
  if (findUser) {
    throw new Error("User already exists");
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    address,
  });
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken",
  );
  await createdUser.save();

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const accessToken = await generateAccessToken(findUser._id);
    const refreshToken = await generateRefreshToken(findUser._id);

    // save refresh token to database
    findUser.refreshToken = refreshToken;
    await findUser.save();

    const options = {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
    };

    const loggedInUser = await User.findById(findUser._id).select(
      "-password -refreshToken",
    );

    res
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully",
        ),
      );
  } else {
    throw new Error("Invalid credentials");
  }
});

// get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// logout user
export const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(
    _id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout Success"));
});
