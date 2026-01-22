import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import { jest } from '@jest/globals';

describe('Database Connection', () => {
    let mockConnect;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConnect = jest.spyOn(mongoose, 'connect');
    });

    afterEach(() => {
        mockConnect.mockRestore();
    });

    it('should connect to MongoDB successfully', async () => {
        mockConnect.mockResolvedValue({
            connection: { host: 'localhost' }
        });

        // Ensure realreadyState is 0
        const originalReadyState = mongoose.connection.readyState;
        Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

        const conn = await connectDB();
        expect(mockConnect).toHaveBeenCalled();
        expect(conn.connection.host).toBe('localhost');

        Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    });

    it('should throw error if connection fails', async () => {
        mockConnect.mockRejectedValue(new Error('Connection failed'));

        const originalReadyState = mongoose.connection.readyState;
        Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

        await expect(connectDB()).rejects.toThrow('Connection failed');

        Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    });
});
