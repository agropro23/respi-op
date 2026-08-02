const mongoose = require('mongoose');

const instructionSchema = new mongoose.Schema({
  english: { type: String, trim: true, default: '' },
  hindi: { type: String, trim: true, default: '' },
  gujarati: { type: String, trim: true, default: '' },
  marathi: { type: String, trim: true, default: '' }
}, { _id: false });

const allergySchema = new mongoose.Schema({
  name: {
    english: { type: String, required: [true, 'Allergy name (English) is required'], trim: true },
    hindi: { type: String, trim: true, default: '' },
    gujarati: { type: String, trim: true, default: '' },
    marathi: { type: String, trim: true, default: '' }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    enum: {
      values: [
        'pollens',
        'fungi',
        'mites',
        'dusts',
        'insects',
        'dander/epithelia',
        'foods',
        'miscellaneous'
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  period: {
    type: String,
    trim: true,
    default: ''
  },
  sourceof: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    data: String,
    contentType: String
  },
  instructions: [instructionSchema],
  foodCategory: {
    type: String,
    enum: ['veg', 'non-veg', 'jain'],
    default: undefined
  }
}, {
  timestamps: true
});

// Add index for faster queries
allergySchema.index({ 'name.english': 1, category: 1 }, { unique: true });

// Custom validation for instructions
// allergySchema.pre('save', function(next) {
//   // For non-food/miscellaneous categories, require at least one instruction with English text
//   if (!['foods', 'miscellaneous'].includes(this.category)) {
//     const hasValidInstruction = this.instructions && this.instructions.some(inst => 
//       inst.english && inst.english.trim()
//     );
//     if (!hasValidInstruction) {
//       return next(new Error('At least one instruction (English) is required for this category'));
//     }
//     // Check if ALL instructions have English text (if they have any other language text)
//     const invalidInstructions = this.instructions.filter(inst => {
//       const hasOtherLanguage = inst.hindi?.trim() || inst.gujarati?.trim() || inst.marathi?.trim();
//       const hasEnglish = inst.english && inst.english.trim();
//       return hasOtherLanguage && !hasEnglish;
//     });
//     if (invalidInstructions.length > 0) {
//       return next(new Error('All instructions must have English text if other languages are provided'));
//     }
//   }
//   next();
// });

// Custom validation for updates
// allergySchema.pre('findOneAndUpdate', function(next) {
//   const update = this.getUpdate();
//   if (update.category && !['foods', 'miscellaneous'].includes(update.category)) {
//     if (update.instructions) {
//       const hasValidInstruction = update.instructions.some(inst => 
//         inst.english && inst.english.trim()
//       );
//       if (!hasValidInstruction) {
//         return next(new Error('At least one instruction (English) is required for this category'));
//       }
//       // Check if ALL instructions have English text (if they have any other language text)
//       const invalidInstructions = update.instructions.filter(inst => {
//         const hasOtherLanguage = inst.hindi?.trim() || inst.gujarati?.trim() || inst.marathi?.trim();
//         const hasEnglish = inst.english && inst.english.trim();
//         return hasOtherLanguage && !hasEnglish;
//       });
//       if (invalidInstructions.length > 0) {
//         return next(new Error('All instructions must have English text if other languages are provided'));
//       }
//     }
//   }
//   next();
// });

module.exports = mongoose.model('Allergy', allergySchema);