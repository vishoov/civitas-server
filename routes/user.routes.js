import express from 'express';
import {deactivateAccount, deleteUser, getAllUsers, getProfile, getUserById, loginUser, logoutUser, registerUser, updateById, updateUser } from '../controllers/userController.js';
import authMW from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/profile', authMW , getProfile);  //get logged in users profile
router.get('/', authMW , adminOnly, getAllUsers); //get all users
router.get('/:id',authMW, adminOnly, getUserById); //get all users by id

router.post('/register', registerUser);  //register the user
router.post('/login', loginUser);  // login the user
router.post('/logout',logoutUser); //logout user

router.patch('/update', authMW, adminOnly, updateUser); //update the ogged in user
router.patch('/update/:id', authMW, adminOnly, updateById); //update the user by id
router.patch('/deactivate', adminOnly, deactivateAccount); //deactivate the account

router.delete('/delete/:id', authMW, adminOnly, deleteUser); //delete the user

export default router;