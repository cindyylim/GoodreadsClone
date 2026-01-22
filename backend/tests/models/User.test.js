import { User } from '../../src/models/User.js';
import * as dbHandler from '../setup.js';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('User Model Test', () => {
    it('should create & save user successfully', async () => {
        const userData = {
            name: 'Test user',
            email: 'test@example.com',
            password: 'password123'
        };
        const validUser = new User(userData);
        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should fail to create user without required fields', async () => {
        const userWithoutRequiredField = new User({ name: 'Test' });
        let err;
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.email).toBeDefined();
        expect(err.errors.password).toBeDefined();
    });

    it('should hash password on save', async () => {
        const user = new User({
            name: 'Test',
            email: 'hash@test.com',
            password: 'password123'
        });
        await user.save();
        expect(user.password).not.toBe('password123');
        expect(user.password.length).toBeGreaterThan(20);
    });

    it('should correctly compare password', async () => {
        const user = new User({
            name: 'Test',
            email: 'compare@test.com',
            password: 'password123'
        });
        await user.save();
        const isMatch = await user.comparePassword('password123');
        const isNotMatch = await user.comparePassword('wrongpassword');
        expect(isMatch).toBe(true);
        expect(isNotMatch).toBe(false);
    });

    it('should not re-hash password if not modified', async () => {
        const user = new User({
            name: 'Test',
            email: 'modify@test.com',
            password: 'password123'
        });
        await user.save();
        const hashed = user.password;
        user.name = 'Updated Name';
        await user.save();
        expect(user.password).toBe(hashed);
    });
});
