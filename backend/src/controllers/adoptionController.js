import { Adoption, Comment } from '../models/index.js';

// Get all adoptions
export const getAdoptions = async (req, res) => {
    try {
        const adoptions = await Adoption.find()
            .populate('owner', 'username profile.avatar')
            .sort({ createdAt: -1 });
        res.json(adoptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create an adoption post
export const createAdoption = async (req, res) => {
    try {
        const { petName, petType, age, description, images, location, contactInfo } = req.body;

        const adoption = new Adoption({
            owner: req.user._id,
            petName,
            petType,
            age,
            description,
            images: images || [],
            location,
            contactInfo,
        });

        const createdAdoption = await adoption.save();
        await createdAdoption.populate('owner', 'username profile.avatar');

        res.status(201).json(createdAdoption);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an adoption post
export const deleteAdoption = async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id);

        if (!adoption) {
            return res.status(404).json({ message: 'Adoption not found' });
        }

        // Check if user is the owner or admin
        if (
            adoption.owner.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this adoption' });
        }

        await Adoption.deleteOne({ _id: adoption._id });
        await Comment.deleteMany({ adoptionId: adoption._id });

        res.json({ message: 'Adoption removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Express interest in adoption
export const expressInterest = async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id);

        if (!adoption) {
            return res.status(404).json({ message: 'Adoption not found' });
        }

        if (adoption.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot express interest in your own pet' });
        }

        if (adoption.adoptionRequests.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already expressed interest' });
        }

        adoption.adoptionRequests.push(req.user._id);
        await adoption.save();

        res.json({ message: 'Interest expressed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
