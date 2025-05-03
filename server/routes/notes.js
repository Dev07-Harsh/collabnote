import express from 'express';
import Joi from 'joi';
import Note from '../models/Note.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * Fetch geolocation data using ip‑api.com.
 * Falls back to a static list if the network call fails or is rate‑limited.
 */
async function fetchGeoData() {
  const staticLocations = [
    { ip: '0.0.0.0', city: 'Unknown', region: 'Unknown', country_name: 'Unknown' },
    { ip: '127.0.0.1', city: 'Localhost', region: 'Local', country_name: 'Local' }
  ];

  const url = 'http://ip-api.com/json/';
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const data = await resp.json();
    console.log('Geolocation response:', data);
    return {
      ip:           data.query,
      city:         data.city,
      region:       data.regionName,
      country_name: data.country
    };
  } catch (err) {
    console.error('Geolocation API error:', err.message);
    // pick a random fallback
    const fallback = staticLocations[Math.floor(Math.random() * staticLocations.length)];
    console.log('Falling back to static geo:', fallback);
    return fallback;
  }
}


const schema = Joi.object({
  title:    Joi.string().max(200).required(),
  content:  Joi.string().required(),
  isShared: Joi.boolean().optional(),
}).unknown(true);

// GET all notes (own + shared) 
router.get('/', auth, async (req, res) => {
  try {
    const { search, sort } = req.query;

    const baseFilter = {
      $or: [
        { owner: req.user },
        { isShared: true }
      ]
    };

    const filter = search
      ? {
          $and: [
            baseFilter,
            {
              $or: [
                { title:   { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
              ]
            }
          ]
        }
      : baseFilter;

    // Determine sort order
    let notes;
    if (sort === 'oldest') {
      notes = await Note.find(filter).sort({ createdAt: 1 });
    } else if (sort === 'ownership') {
      
      const all = await Note.find(filter).lean();
      notes = all.sort((a, b) => {
        const aMine = a.owner.toString() === req.user;
        const bMine = b.owner.toString() === req.user;
        if (aMine && !bMine) return -1;
        if (!aMine && bMine) return 1;
        // tie‑break: newest updated first
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    } else {
      // default: newest first
      notes = await Note.find(filter).sort({ createdAt: -1 });
    }

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// GET one note (must be owner or shared)
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.owner.toString() !== req.user && !note.isShared) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE note (attach geo data)
router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { title, content, isShared = false } = value;
    const geoData = await fetchGeoData();

    const note = new Note({
      title,
      content,
      apiData:  geoData,
      isShared,
      owner:    req.user
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE note (do not change apiData)
router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { title, content, isShared = false } = value;
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user },
      { title, content, isShared },
      { new: true }
    );
    if (!updated) 
      return res.status(404).json({ message: 'Note not found or not owner , If you  are not owner, you can edit note only with real time editor' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE note
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user
    });
    if (!deleted) 
      return res.status(404).json({ message: 'Note not found or not owner' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
