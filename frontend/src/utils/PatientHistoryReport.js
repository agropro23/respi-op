import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

const clinicLogo = '/image_full_logo.png';

// Register Roboto font
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Roboto',
        fontSize: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        borderBottom: '1px solid #000',
        paddingBottom: 15,
    },
    headerLeft: {
        width: '15%',
    },
    headerMiddle: {
        width: '70%',
    },
    headerRight: {
        width: '15%',
        textAlign: 'right',
    },
    clinicTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
    },
    clinicSubtitle: {
        fontSize: 12,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 5,
    },
    clinicInfo: {
        fontSize: 10,
        color: '#000',
        textAlign: 'center',
        marginTop: 5,
    },
    patientInfoSection: {
        fontSize: 10,
        marginBottom: 25,
        border: '1px solid #000',
        padding: 15,
    },
    patientInfoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        borderBottom: '0.5px solid #e0e0e0',
        paddingBottom: 5,
    },
    patientInfoLabel: {
        width: '15%',
        color: '#666',
    },
    patientInfoLabelRight: {
        width: '25%',
        color: '#666',
    },
    patientInfoLabelBold: {
        fontWeight: 'bold',
        width: '15%',
        color: '#000',
    },
    patientInfoLabelRightBold: {
        fontWeight: 'bold',
        width: '25%',
        color: '#000',
    },
    patientInfoValue: {
        width: '35%',
        color: '#000',
    },
    patientInfoValueRight: {
        width: '25%',
        color: '#000',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3b82f6',
        textAlign: 'left',
        borderBottom: '1px solid #3b82f6',
        paddingBottom: 5,
    },
    sectionContainer: {
        marginBottom: 25,
        border: '1px solid #000',
        padding: 15,
    },
    sectionContent: {
        marginTop: 10,
    },
    sectionItem: {
        flexDirection: 'row',
        marginBottom: 8,
        borderBottom: '0.5px solid #e0e0e0',
        paddingBottom: 5,
    },
    sectionLabel: {
        fontWeight: 'bold',
        width: '30%',
        color: '#000',
    },
    sectionValue: {
        width: '70%',
        color: '#000',
    },
});

// Helper function to handle empty values
const getValue = (value) => {
    if (value === undefined || value === null || value === '' || value === 'N/A') return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
};

// Helper function to check if a section has meaningful data
const hasSectionData = (data) => {
    if (!data) return false;
    if (typeof data === 'string') return data.trim() !== '' && data !== 'N/A';
    if (typeof data === 'boolean') return true; // Booleans are valid if true
    if (Array.isArray(data)) return data.some(item => hasSectionData(item));
    if (typeof data === 'object') {
        return Object.entries(data).some(([_, value]) => {
            if (value === null || value === undefined || value === '' || value === 'N/A') return false;
            if (typeof value === 'object') return hasSectionData(value);
            if (typeof value === 'string') return value.trim() !== '';
            return true;
        });
    }
    return true;
};

// Helper function to format labels
const formatLabel = (label) =>
    label
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('Bmi', 'BMI')
        .replace('Other Addictions', 'Other Addictions')
        .replace('Occupational Hazards', 'Occupational Hazards')
        .replace('Post Nasal Discharge', 'Post-Nasal Discharge')
        .replace('Frequent Sore Throat', 'Frequent Sore Throat')
        .replace('Tightening From Eyes', 'Tightening from Eyes')
        .replace('Ear Infections', 'Ear Infections')
        .replace('Dizzy Spells', 'Dizzy Spells')
        .replace('Itching In Eyes', 'Itching in Eyes')
        .replace('Short Temperedness', 'Short-Temperedness')
        .replace('Crying Spells', 'Crying Spells')
        .replace('Mood Changes', 'Mood Changes')
        .replace('Maniacal Disorders', 'Maniacal Disorders')
        .replace('Excessive Sweating', 'Excessive Sweating')
        .replace('Abd Pain', 'Abdominal Pain')
        .replace('Bed Wetting', 'Bed Wetting')
        .replace('Weight Loss', 'Weight Loss')
        .replace('Unexplained Fever', 'Unexplained Fever')
        .replace('Vague Aches', 'Vague Aches')
        .replace('Excessive School Absences', 'Excessive School Absences')
        .replace('Dark Ocular Circles', 'Dark Ocular Circles')
        .replace('Periorbital Oedema', 'Periorbital Oedema')
        .replace('Cervical Adenopathy', 'Cervical Adenopathy')
        .replace('Duration Of Episodes', 'Duration of Episodes')
        .replace('Aggravating Factors', 'Aggravating Factors')
        .replace('Urinary Tract Infection', 'Urinary Tract Infection')
        .replace('Joint Pain', 'Joint Pain')
        .replace('Abdominal Pain', 'Abdominal Pain')
        .replace('Scratch Test', 'Scratch Test')
        .replace('Pressure Test', 'Pressure Test')
        .replace('Cold Test', 'Cold Test')
        .replace('Hives/swellings', 'Hives/Swellings');

// Helper function to render a section with key-value pairs and grouped boolean symptoms
const renderSection = (title, data, renderContent) => {
    const content = renderContent(data);
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
                {content}
            </View>
        </View>
    );
};

// Helper function to render key-value pairs and group boolean symptoms
const renderKeyValuePairs = (data, sectionName, prefix = '') => {
    if (!data || !hasSectionData(data)) return null;
    const items = [];
    const booleanFields = [];

    // Special handling for family.illnesses
    if (sectionName === 'Family' && data.illnesses) {
        Object.entries(data.illnesses).forEach(([illness, familyMembers]) => {
            if (!hasSectionData(familyMembers)) return;
            const members = [];
            Object.entries(familyMembers).forEach(([member, hasIllness]) => {
                if (hasIllness === true) {
                    members.push(formatLabel(member));
                }
            });
            if (members.length > 0) {
                items.push(
                    <View key={`${illness}`} style={styles.sectionItem}>
                        <Text style={styles.sectionLabel}>{formatLabel(illness)}:</Text>
                        <Text style={styles.sectionValue}>{members.join(', ')}</Text>
                    </View>
                );
            }
        });
        // Handle family.other
        if (hasSectionData(data.other)) {
            items.push(
                <View key="other" style={styles.sectionItem}>
                    <Text style={styles.sectionLabel}>Other:</Text>
                    <Text style={styles.sectionValue}>{getValue(data.other)}</Text>
                </View>
            );
        }
        return items.length > 0 ? items : null;
    }

    // General handling for other sections
    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === 'N/A') return;
        if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects
            const nestedItems = renderKeyValuePairs(value, sectionName, `${prefix}${formatLabel(key)}.`);
            if (nestedItems) {
                items.push(...nestedItems);
            }
        } else if (typeof value === 'boolean') {
            // Collect true booleans for symptoms
            if (value === true) {
                booleanFields.push(formatLabel(key));
            }
        } else if (hasSectionData(value)) {
            // Include non-boolean fields with valid data
            items.push(
                <View key={`${prefix}${key}`} style={styles.sectionItem}>
                    <Text style={styles.sectionLabel}>{formatLabel(key)}:</Text>
                    <Text style={styles.sectionValue}>{getValue(value)}</Text>
                </View>
            );
        }
    });

    // Add boolean symptoms as a single line if any exist
    if (booleanFields.length > 0) {
        items.unshift(
            <View key={`${sectionName}-symptoms`} style={styles.sectionItem}>
                <Text style={styles.sectionLabel}>{sectionName} Symptoms:</Text>
                <Text style={styles.sectionValue}>{booleanFields.join(', ')}</Text>
            </View>
        );
    }

    return items.length > 0 ? items : null;
};

// Create Document Component
const PatientHistoryReport = ({ patientData }) => {
    const basicInfo = patientData?.basicInfo || {};
    const examination = patientData?.examination || {};
    const diagnosis = patientData?.diagnosis || {};
    const patientHistory = patientData?.patientHistory || {};
    const patientHistory2 = patientData?.patientHistory?.patientHistory2 || {};

    // Helper function to determine patientInfoLabel style based on value
    const getLabelStyle = (value, isRight = false) => {
        const hasValue = hasSectionData(value);
        return hasValue
            ? (isRight ? styles.patientInfoLabelRightBold : styles.patientInfoLabelBold)
            : (isRight ? styles.patientInfoLabelRight : styles.patientInfoLabel);
    };

    // Check if patientInfo section has any data
    const hasPatientInfo = Object.values(basicInfo).some(value => hasSectionData(value));

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image src={clinicLogo} style={{ width: 60, height: 60 }} />
                    </View>
                    <View style={styles.headerMiddle}>
                        <Text style={styles.clinicTitle}>Dr. Vipul Shah</Text>
                        <Text style={styles.clinicSubtitle}>Allergy and Asthma Clinic + Research Centre</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {patientData?.patientId && (
                            <Text style={styles.clinicInfo}>Patient ID: {getValue(patientData?.patientId)}</Text>
                        )}
                    </View>
                </View>

                {/* Patient Information Section */}
                {hasPatientInfo && (
                    <View style={styles.patientInfoSection}>
                        {(basicInfo?.name || basicInfo?.age || basicInfo?.sex) && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.name)}>Name:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.name)}</Text>
                                <Text style={getLabelStyle(basicInfo?.age || basicInfo?.sex, true)}>Age / Sex:</Text>
                                <Text style={styles.patientInfoValueRight}>{getValue(basicInfo?.age)} {getValue(basicInfo?.sex)}</Text>
                            </View>
                        )}
                        {(basicInfo?.status || basicInfo?.occupation) && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.status)}>Status:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.status)}</Text>
                                <Text style={getLabelStyle(basicInfo?.occupation, true)}>Occupation:</Text>
                                <Text style={styles.patientInfoValueRight}>{getValue(basicInfo?.occupation)}</Text>
                            </View>
                        )}
                        {(basicInfo?.nationality || basicInfo?.refBy) && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.nationality)}>Nationality:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.nationality)}</Text>
                                <Text style={getLabelStyle(basicInfo?.refBy, true)}>Ref. By:</Text>
                                <Text style={styles.patientInfoValueRight}>{getValue(basicInfo?.refBy)}</Text>
                            </View>
                        )}
                        {(basicInfo?.height || basicInfo?.weight) && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.height)}>Height:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.height)}</Text>
                                <Text style={getLabelStyle(basicInfo?.weight, true)}>Weight:</Text>
                                <Text style={styles.patientInfoValueRight}>{getValue(basicInfo?.weight)} Kgs</Text>
                            </View>
                        )}
                        {(basicInfo?.bmi || basicInfo?.tel1 || basicInfo?.tel2) && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.bmi)}>BMI:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.bmi)}</Text>
                                <Text style={getLabelStyle(basicInfo?.tel1 || basicInfo?.tel2, true)}>Contact:</Text>
                                <Text style={styles.patientInfoValueRight}>{getValue(basicInfo?.tel1 || basicInfo?.tel2)}</Text>
                            </View>
                        )}
                        {(basicInfo?.drAddress || basicInfo?.drContact) && (
                            <View style={styles.patientInfoRow}>
                                {basicInfo?.drAddress && (
                                    <>
                                        <Text style={getLabelStyle(basicInfo?.drAddress)}>Doctor's Address:</Text>
                                        <Text style={styles.patientInfoValue}>{getValue(basicInfo?.drAddress)}</Text>
                                    </>
                                )}
                                {basicInfo?.drContact && (
                                    <>
                                        <Text style={getLabelStyle(basicInfo?.drContact, true)}>Doctor's Contact:</Text>
                                        <Text style={styles.patientInfoValueRight}>{getValue(basicInfo?.drContact)}</Text>
                                    </>
                                )}
                            </View>
                        )}
                        {basicInfo?.birth && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.birth)}>Birth:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.birth)}</Text>
                            </View>
                        )}
                        {basicInfo?.caste && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.caste)}>Caste:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.caste)}</Text>
                            </View>
                        )}
                        {basicInfo?.address && (
                            <View style={styles.patientInfoRow}>
                                <Text style={getLabelStyle(basicInfo?.address)}>Address:</Text>
                                <Text style={styles.patientInfoValue}>{getValue(basicInfo?.address)}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Personal History */}
                {renderSection('PERSONAL HISTORY', patientHistory?.personal, (data) => renderKeyValuePairs(data, 'Personal'))}

                {/* Mental History */}
                {renderSection('MENTAL HISTORY', patientHistory?.mental, (data) => renderKeyValuePairs(data, 'Mental'))}

                {/* Past History */}
                {renderSection('PAST HISTORY', patientHistory?.past, (data) => renderKeyValuePairs(data, 'Past'))}

                {/* Family History */}
                {renderSection('FAMILY HISTORY', patientHistory?.family, (data) => renderKeyValuePairs(data, 'Family'))}

                {/* Environmental History */}
                {renderSection('ENVIRONMENTAL HISTORY', patientHistory?.environmental, (data) => renderKeyValuePairs(data, 'Environmental'))}

                {/* Allergy History */}
                {renderSection('ALLERGY HISTORY', patientHistory?.allergy, (data) => renderKeyValuePairs(data, 'Allergy'))}

                {/* Rhinitis */}
                {renderSection('RHINITIS', patientHistory2?.rhinitis, (data) => renderKeyValuePairs(data, 'Rhinitis'))}

                {/* Headaches */}
                {renderSection('HEADACHES', patientHistory2?.headaches, (data) => renderKeyValuePairs(data, 'Headaches'))}

                {/* Asthma */}
                {renderSection('ASTHMA', patientHistory2?.asthma, (data) => renderKeyValuePairs(data, 'Asthma'))}

                {/* Tension/Fatigue Syndrome */}
                {renderSection('TENSION/FATIGUE SYNDROME', patientHistory2?.tensionFatigueSyndrome, (data) => renderKeyValuePairs(data, 'Tension/Fatigue Syndrome'))}

                {/* Urticaria/Angioedema */}
                {renderSection('URTICARIA/ANGIOEDEMA', patientHistory2?.urticariaAngioedema, (data) => renderKeyValuePairs(data, 'Urticaria/Angioedema'))}

                {/* Dermatitis/Eczema */}
                {renderSection('DERMATITIS/ECZEMA', patientHistory2?.dermatitisOrEczema, (data) => renderKeyValuePairs(data, 'Dermatitis/Eczema'))}

                {/* Insect Allergy */}
                {renderSection('INSECT ALLERGY', patientHistory2?.insectAllergy, (data) => renderKeyValuePairs(data, 'Insect Allergy'))}

                {/* Other Complaints */}
                {renderSection('OTHER COMPLAINTS', patientHistory2?.otherComplaints, (data) => renderKeyValuePairs(data, 'Other Complaints'))}

                {/* Doctor's Examination */}
                {renderSection('DOCTOR\'S EXAMINATION', examination, (data) => renderKeyValuePairs(data, 'Examination'))}

                {/* Diagnosis */}
                {renderSection('DIAGNOSIS', diagnosis, (data) => renderKeyValuePairs(data, 'Diagnosis'))}
            </Page>
        </Document>
    );
};

export default PatientHistoryReport;