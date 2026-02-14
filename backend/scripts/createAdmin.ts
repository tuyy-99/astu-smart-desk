import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from '../models/User';

async function createAdminUser() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        // Admin user details
        const adminData = {
            name: 'Admin User',
            email: 'admin@astu.edu.et',
            universityId: 'ugr/00001/24',
            password: 'Admin123!',
            role: 'admin' as const,
            isActive: true
        };

        // If admin already exists, reset required fields and password.
        // Password is stored as plain text here so the User pre-save hook hashes it once.
        const existingAdmin = await User.findOne({ email: adminData.email }).select('+password');

        if (existingAdmin) {
            existingAdmin.name = adminData.name;
            existingAdmin.universityId = adminData.universityId;
            existingAdmin.password = adminData.password;
            existingAdmin.role = adminData.role;
            existingAdmin.isActive = true;
            await existingAdmin.save();

            console.log('Admin user already existed; credentials were reset.');
        } else {
            await User.create(adminData);
            console.log('Admin user created successfully.');
        }

        console.log('----------------------------------------');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('University ID:', adminData.universityId);
        console.log('Role:', adminData.role);
        console.log('----------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the script
createAdminUser();
