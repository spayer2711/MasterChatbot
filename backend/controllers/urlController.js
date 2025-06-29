// controllers/urlController.js
const { ObjectId } = require('mongodb');
const connectToMongo = require('../utils/db');
const { initializeServices } = require('../utils/initService');

exports.handleUrlActions = async (req, res) => {
  const { action, url, id } = req.body;

  try {
    const db = await connectToMongo();
    const collection = db.collection('urls');

    switch (action) {
      case 'get': {
        const urls = await collection.find().toArray();
        return res.json({ data: urls });
      }

      case 'add': {
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const exists = await collection.findOne({ url });
        if (exists) return res.status(409).json({ error: 'URL already exists' });

        const result = await collection.insertOne({ url, createdAt: new Date() });
        await initializeServices()
        return res.status(201).json({ message: 'URL added', id: result.insertedId });
      }

      case 'delete': {
        if (!id) return res.status(400).json({ error: 'ID is required for deletion' });

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'URL not found' });
        }

        return res.json({ message: 'URL deleted successfully' });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in URL controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
