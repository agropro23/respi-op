import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Noto Sans Gujarati font
Font.register({
  family: 'Noto Sans Gujarati',
  src: '/fonts/Noto_Sans_Gujarati/NotoSansGujarati-VariableFont_wdth,wght.ttf', // Updated path to variable font
});

// Register Noto Sans Devanagari font
Font.register({
  family: 'Noto Sans Devanagari',
  src: '/fonts/Noto_Sans_Devanagari/NotoSansDevanagari-VariableFont_wdth,wght.ttf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingLeft: 50,
    paddingRight: 50,
    paddingBottom: 30,
    paddingTop: 30
  },
  reportHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottom: '1px solid #000',
    paddingBottom: 10,
  },
  doctorInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  clinicName: {
    fontSize: 12,
    color: '#555',
  },
  reportDate: {
    fontSize: 12,
    color: '#555',
    textAlign: 'right',
  },
  sensitivityLine: {
    fontSize: 12,
    marginBottom: 20,
    color: '#ff0000',
    fontWeight: 'bold',
  },
  imageGrid: {
    flexDirection: 'column',
    marginBottom: 20,
    width: '100%',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  imageContainer: {
    width: '45%',
    alignItems: 'center',
  },
  singleImageContainer: {
    width: '90%',
    alignItems: 'center',
    margin: '0 auto',
  },
  singleAllergyImage: {
    width: '100%',
    height: 400,
    objectFit: 'contain',
    marginBottom: 5,
    border: '1px solid #eee',
  },
  allergyImage: {
    width: '100%',
    height: 150,
    objectFit: 'contain',
    marginBottom: 5,
    border: '1px solid #eee',
  },
  allergyName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0f4c75',
    textAlign: 'left',
    // fontFamily will be set dynamically
  },
  section: {
    margin: 0,
    padding: 0,
    flexGrow: 1
  },
  subHeader: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#ff0000',
    fontFamily: 'Noto Sans Gujarati', // Keep Gujarati for section headers
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
    // fontFamily will be set dynamically
  }
});

// Dynamic font selection for allergy names and instructions
const getFontFamily = (lang) => {
  if (lang === 'gujarati') return 'Noto Sans Gujarati';
  if (lang === 'hindi' || lang === 'marathi') return 'Noto Sans Devanagari';
  return undefined; // default
};

// Create Document Component
const InstructionReport = ({ data }) => {
  const selectedLanguage = data.selectedLanguage || 'english';

  const getAllergyNameEnglish = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj.english && typeof obj.english === 'string' && obj.english.trim()) return obj.english;
    const first = Object.values(obj).find(v => typeof v === 'string' && v.trim());
    return first || '';
  };

  const getInstructionInSelectedLanguage = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') {
      return selectedLanguage === 'english' ? obj : '';
    }
    if (selectedLanguage === 'english') {
      return (obj.english && typeof obj.english === 'string' && obj.english.trim()) ? obj.english : '';
    }
    // If selected language is Hindi, Gujarati, or Marathi:
    if (obj[selectedLanguage] && typeof obj[selectedLanguage] === 'string' && obj[selectedLanguage].trim()) {
      return obj[selectedLanguage];
    }
    // No fallback to English if Hindi/Gujarati/Marathi is not available
    return '';
  };

  console.log('InstructionReport data:', data); // Debug the incoming data
  console.log('Selected Language:', selectedLanguage);
  console.log('All Instructions:', data?.allInstructions);
  console.log('Food Names:', data?.foodNames);
  console.log('Allergy Images:', data?.allergyImages);

  const allergyImages = (data?.allergyImages || []).map(img => ({
    ...img,
    name: getAllergyNameEnglish(img.name) // Allergy name is ALWAYS displayed in English only
  }));
  const isSingleImage = allergyImages.length === 1;

  const imageRows = [];
  if (!isSingleImage) {
    for (let i = 0; i < allergyImages.length; i += 2) {
      imageRows.push(allergyImages.slice(i, i + 2));
    }
  }

  // Instructions strictly in selected language (no English fallback for non-English)
  const instructions = (data?.allInstructions || [])
    .map(inst => getInstructionInSelectedLanguage(inst))
    .filter(inst => inst && typeof inst === 'string' && inst.trim() !== '');

  // Food allergen names are ALWAYS displayed in English only
  const foodNames = (data?.foodNames || [])
    .map(getAllergyNameEnglish)
    .filter(food => food && typeof food === 'string' && food.trim() !== '');

  // Format report date
  const reportDate = data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : '';

  // Custom header component matching prescription PDF (Small/A5 only, fixed overlap)
  const PDFHeader = (
    <View style={{ flexDirection: 'column', width: '100%', marginBottom: 10 }}>
      {/* Top Row: Logos and Doctor Info */}
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: -10, marginBottom: 0, width: '100%', minHeight: 90 }}>
        {/* Left Logo */}
        <View style={{ width: 95, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <Image src={'/image_logo.jpg'} style={{ width: 95, height: 60, marginLeft: -4 }} />
        </View>
        {/* Dr Eshita V Shah */}
        <View style={{ flex: 1, marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 100, paddingLeft: 11 }}>
          <Text style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textAlign: 'left' }}>DR. ESHITA V. SHAH</Text>
          <View style={{ textAlign: 'left', width: '100%' }}>
            <Text style={{ margin: '2px 0', fontSize: 9 }}>M.D (Pulmonary Medicine)</Text>
            <Text style={{ margin: '1px 0', fontSize: 9 }}>European Diploma in Respiratory Medicine</Text>
            <Text style={{ margin: '1px 0', fontSize: 9 }}>Fellowship - Interventional Pulmonology & Thoracic Oncology (New Delhi)</Text>
          </View>
        </View>
        {/* Dr Vipul Shah */}
        <View style={{ flex: 1, marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 165, paddingRight: 15 }}>
          <Text style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textAlign: 'center' }}>DR. VIPUL SHAH</Text>
          <View style={{ textAlign: 'right', width: '100%', marginRight: 115 }}>
            <Text style={{ margin: '1px 0', fontSize: 9 }}>MBSACI, DAAI, PHD (Allergy)</Text>
            <Text style={{ margin: '1px 0', fontSize: 9 }}>Specialist in Allergy & Asthma</Text>
            <Text style={{ margin: '1px 0', fontSize: 9 }}>Tel : 0261-2464747</Text>
            <Text style={{ margin: '1px 0', fontSize: 9 }}>Mo. 9824124747</Text>
          </View>
        </View>
        {/* Right Logo */}
        <View style={{ flex: 0, alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Image src={'/image_chest.jpg'} style={{ width: 70, height: 70, marginRight: -4 }} />
        </View>
      </View>
      {/* Divider */}
      <View style={{ height: 2, backgroundColor: '#8B0000', marginTop: 3, marginBottom: 6, width: '100%' }} />
      {/* Date */}
      {reportDate && (
        <View style={{ textAlign: 'right', width: '100%' }}>
          <Text style={{ fontSize: 9, marginTop: -3, paddingLeft: 0, paddingRight: 12 }}><Text style={{ fontWeight: 'bold' }}>Date:</Text> {reportDate}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Document>
      {/* First Page: Allergy Images */}
      <Page size="A4" style={styles.page}>
        {PDFHeader}
        {data?.patient?.basicInfo?.name && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sensitivityLine}>
              {data.patient.basicInfo.name} is sensitive to following elements.
            </Text>
          </View>
        )}
        {allergyImages.length > 0 && (
          <View style={styles.imageGrid}>
            {isSingleImage ? (
              <View style={styles.imageRow}>
                <View key={allergyImages[0].id} style={styles.singleImageContainer}>
                  {allergyImages[0].imageUrl && <Image style={styles.singleAllergyImage} src={allergyImages[0].imageUrl} />}
                  {/* Allergy name in English */}
                  <Text style={styles.allergyName}>{allergyImages[0].name}</Text>
                </View>
              </View>
            ) : (
              imageRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.imageRow}>
                  {row.map((img, colIndex) => (
                    <View key={img.id} style={styles.imageContainer}>
                      {img.imageUrl && <Image style={styles.allergyImage} src={img.imageUrl} />}
                      {/* Allergy name in English */}
                      <Text style={styles.allergyName}>{img.name}</Text>
                    </View>
                  ))}
                  {row.length === 1 && <View style={styles.imageContainer} />}
                </View>
              ))
            )}
          </View>
        )}
      </Page>

      {/* Second Page: Patient Photo and Instructions */}
      <Page size="A4" style={styles.page}>
        {PDFHeader}
        {data?.patient?.basicInfo?.name && (
          <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
            {/* Patient image should be passed as a base64 data URL in data.patient.photoUrl */}
            {data?.patient?.photoUrl ? (
              <Image
                style={{ width: 150, height: 150, border: '1px solid #ddd', borderRadius: 2, objectFit: 'cover' }}
                src={data.patient.photoUrl}
              />
            ) : (
            <View style={{ width: 150, height: 150, border: '1px solid #ddd', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Noto Sans Gujarati' }}>No Patient Image</Text>
            </View>
            )}
          </View>
        )}
        {instructions.filter(inst => inst && typeof inst === 'string' && inst.trim() !== '').length > 0 && (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>Instructions for the patient</Text>
            {instructions.filter(inst => inst && typeof inst === 'string' && inst.trim() !== '').map((inst, i) => (
              <View key={`instruction-${i}`} style={{ flexDirection: 'row', marginBottom: 5, width: 495 }}>
                <View style={{ width: 15, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 11, fontFamily: getFontFamily(selectedLanguage) }}>{'\u2022'}</Text>
                </View>
                <View style={{ width: 480 }}>
                  <Text style={{ fontSize: 11, lineHeight: 1.4, fontFamily: getFontFamily(selectedLanguage) }}>{inst}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {foodNames.filter(food => food && typeof food === 'string' && food.trim() !== '').length > 0 && (
          <View>
            <Text style={styles.subHeader}>Following food items should be avoided.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {foodNames.filter(food => food && typeof food === 'string' && food.trim() !== '').map((food, i) => (
                <View key={`food-avoid-${i}`} style={{ width: '32%', flexDirection: 'row', marginBottom: 4 }}>
                  <View style={{ width: 15, alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 11 }}>{'\u2022'}</Text>
                  </View>
                  <View style={{ width: 140 }}>
                    <Text style={{ fontSize: 11, lineHeight: 1.3 }}>{food}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default InstructionReport;