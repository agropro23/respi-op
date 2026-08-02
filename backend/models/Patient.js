const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true },
    basicInfo: {
        name: { type: String, required: true },
        birth: String,
        age: { type: Number, required: true },
        sex: { type: String, required: true },
        status: String,
        occupation: String,
        caste: String,
        nationality: String,
        height: String,
        weight: String,
        bmi: String,
        address: String,
        tel1: String,
        tel2: String,
        refBy: String,
        drAddress: String,
        drContact: String
    },

    // All history tabs wrapped in a single object
    patientHistory: {
        // Personal History
        personal: {
            diet: String,
            addictions: {
                smoker: { type: Boolean, default: false },
                alcoholic: { type: Boolean, default: false },
                details: String
            },
            otherAddictions: String,
        },

        // Mental History
        mental: {
            anxiety: Boolean,
            depressiveThoughts: Boolean,
            obsession: Boolean,
            cryingSpells: Boolean,
            moodChanges: Boolean,
            shortTemperedness: Boolean,
            hysterical: Boolean,
            violent: Boolean,
            maniacalDisorders: Boolean,
            schizophrenia: Boolean,
            otherMentals: String
        },

        // Past History
        past: {
            majorIllness: String,
            chronicIllness: String,
            investigations: String,
            surgicalHistory: String,
            developmentalHistory: String,
            obstGynHistory: String,
            currentTreatment: String
        },

        // Family History
        family: {
            illnesses: {
                Asthma: Object, // Store as Object to allow dynamic keys (family members)
                Rhinitis: Object,
                Sinusitis: Object,
                Urticaria: Object,
                Eczema: Object,
                'Hives/swellings': Object,
                Migraine: Object
            },
            other: String
        },

        // Environmental History
        environmental: {
            durationOfStay: String,
            commercialPlace: String,
            pets: String,
            pillowType: String,
            mattressType: String,
            carpetType: String,
            draperiesType: String,
            blanketType: String,
            indoorType: String,
            stuffedToys: String,
            usingAC: Boolean,
            occupationalHazards: String
        },

        // Allergy History
        allergy: {
            previousTests: String,
            testsByWhom: String,
            injectionsStarted: String,
            continuedInjections: String,
            anyResults: String,
            drugAllergies: String,
            foodAllergies: String,
            contactAllergy: String,
            // Optional field to track food category (veg, non-veg, jain)
            foodCategory: { type: String, enum: ['veg', 'non-veg', 'jain'], default: undefined }
        },
        patientHistory2: {
            rhinitis: {
                onset: String,
                worstSeason: String,
                sneezing: Boolean,
                runningNose: Boolean,
                discharge: Boolean,
                nasalCongestion: Boolean,
                nasalBleeding: Boolean,
                lossOfSmell: Boolean,
                nasalPolyps: Boolean,
                itchingInNose: Boolean,
                postNasalDischarge: Boolean,
                frequentSoreThroat: Boolean,
                tighteningFromEyes: Boolean,
                earache: Boolean,
                cough: Boolean,
                earInfections: Boolean,
                dizzySpells: Boolean,
                itchingInEyes: Boolean
            },
            headaches: {
                onset: String,
                durationOfEpisode: String,
                characterOfHeadache: String,
                location: String,
                frequency: String,
                aggravation: String,
                associatedSymptoms: {
                    nausea: Boolean,
                    vomiting: Boolean,
                    visualDisturbances: Boolean,
                    numbnessInExtremities: Boolean
                },
                possibleCauses: String
            },
            asthma: {
                onset: String,
                bronchitis: Boolean,
                pneumonia: Boolean,
                cough: Boolean,
                tightnessOfChest: Boolean,
                wheeze: Boolean,
                sputumColor: String,
                worstSeason: String,
                medicinesTaken: String,
                attacksDuring: String,
                hospitalVisitsAdmissions: String,
                freqOfAttacks: String,
                qualityOfLife: String,
                lastAttack: String,
                daysOfMissedWorkSchool: String
            },
            tensionFatigueSyndrome: {
                fatigue: Boolean,
                tension: Boolean,
                excessiveSweating: Boolean,
                headaches: Boolean,
                nausea: Boolean,
                vomiting: Boolean,
                abdPain: Boolean,
                diarrhoea: Boolean,
                constipation: Boolean,
                bedWetting: Boolean,
                pallor: Boolean,
                weightLoss: Boolean,
                unexplainedFever: Boolean,
                vagueAches: Boolean,
                excessiveSchoolAbsences: Boolean,
                darkOcularCircles: Boolean,
                periorbitalOedema: Boolean,
                cervicalAdenopathy: Boolean,
                sleep: String,
                otherSymptoms: String
            },
            urticariaAngioedema: {
                onset: String,
                durationOfEpisodes: String,
                location: String,
                aggravatingFactors: String,
                itching: Boolean,
                hives: Boolean,
                swelling: Boolean,
                fever: Boolean,
                urinaryTractInfection: Boolean,
                jointPain: Boolean,
                abdominalPain: Boolean,
                scratchTest: String,
                pressureTest: String,
                coldTest: String
            },
            dermatitisOrEczema: {
                onset: String,
                rashes: String,
                location: String,
                possibleCauses: String,
                itching: Boolean,
                scaling: Boolean,
                burning: Boolean,
                infection: Boolean
            },
            insectAllergy: {
                insect: String,
                whenBitten: String,
                reactions: {
                    itching: Boolean,
                    burning: Boolean,
                    redness: Boolean,
                    swelling: Boolean
                }
            },
            otherComplaints: {
                complaints: String
            }
        }
    },
    examination: {
        pulse: { type: String, default: '' },
        bp: { type: String, default: '' },
        spo2: { type: String, default: '' },
        pefr: { type: String, default: '' },
        nasal: { type: String, default: '' },
        respiratory: { type: String, default: '' },
        additionalNotes: { type: String, default: '' }
    },
    diagnosis: {
        bronchialAsthma: { type: Boolean, default: false },
        copd: { type: Boolean, default: false },
        bronchiectasis: { type: Boolean, default: false },
        rhinitis: { type: Boolean, default: false },
        sinusitis: { type: Boolean, default: false },
        drugAllergy: { type: Boolean, default: false },
        conjunctivitis: { type: Boolean, default: false },
        eczema: { type: Boolean, default: false },
        urticaria: { type: Boolean, default: false },
        other: { type: String, default: '' }
    }

}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);