const mongoose = require('mongoose');
const Allergy = require('./models/Allergy');

const allergens = [
    // Pollens
    { name: 'Grass Pollen', category: 'Pollens' },
    { name: 'Tree Pollen', category: 'Pollens' },
    { name: 'Weed Pollen', category: 'Pollens' },
    
    // Fungi
    { name: 'Alternaria', category: 'Fungi' },
    { name: 'Aspergillus', category: 'Fungi' },
    { name: 'Cladosporium', category: 'Fungi' },
    
    // Mites
    { name: 'Dust Mite', category: 'Mites' },
    { name: 'Storage Mite', category: 'Mites' },
    
    // Dusts
    { name: 'House Dust', category: 'Dusts' },
    { name: 'Cotton Dust', category: 'Dusts' },
    
    // Insects
    { name: 'Cockroach', category: 'Insects' },
    { name: 'Mosquito', category: 'Insects' },
    
    // Dander/Epithelia
    { name: 'Cat Dander', category: 'Dander/Epithelia' },
    { name: 'Dog Dander', category: 'Dander/Epithelia' },
    
    // Foods
    { name: 'Peanut', category: 'Foods' },
    { name: 'Milk', category: 'Foods' },
    { name: 'Egg', category: 'Foods' },
    
    // Miscellaneous
    { name: 'Latex', category: 'Miscellaneous' },
    { name: 'Penicillin', category: 'Miscellaneous' }
];

mongoose.connect('mongodb://localhost:27017/allergy_clinic', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    try {
        // Clear existing allergens
        await Allergy.deleteMany({});
        console.log('Cleared existing allergens');

        // Insert new allergens
        await Allergy.insertMany(allergens);
        console.log('Added new allergens');

        // Verify the data
        const count = await Allergy.countDocuments();
        console.log(`Total allergens in database: ${count}`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        mongoose.connection.close();
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
}); 