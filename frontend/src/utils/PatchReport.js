import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer';

// Use a direct path to the logo in public directory for PDF generation
const clinicLogo = '/image_full_logo.png';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// Register Gujarati font (use variable font to avoid fontkit GPOS crash)
Font.register({
  family: 'NotoSansGujarati',
  src: '/fonts/Noto_Sans_Gujarati/NotoSansGujarati-VariableFont_wdth,wght.ttf',
});

// Register Devanagari font (use variable font to avoid fontkit GPOS crash)
Font.register({
  family: 'NotoSansDevanagari',
  src: '/fonts/Noto_Sans_Devanagari/NotoSansDevanagari-VariableFont_wdth,wght.ttf',
});

// Register Times New Roman font
Font.register({
  family: 'TimesNewRoman',
  src: '/fonts/Times New Roman Regular/Times New Roman Regular.ttf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    width: '27%',
    textAlign: 'left',
  },
  headerMiddle: {
    textAlign: 'center',
    alignItems: 'center', 
    justifyContent: 'center',
    width: '40%',
  },
  headerRight: {
    width: '27%',
    height: '60px',
    textAlign: 'right',
  },
  docHeader: {
    fontSize: 15,
    fontWeight: 500,
  },
  clinicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f4c75',
    textAlign: 'center',
    marginBottom: 5,
  },
  clinicSubtitle: {
    fontSize: 11,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 2,
  },
  clinicRedText: {
    color: '#ff0000',
    fontSize: 11,
    textAlign: 'center',
  },
  clinicAddress: {
    fontSize: 9,
    color: '#000000',
    textAlign: 'center',
    marginTop: 15,
  },
  contactInfo: {
    fontSize: 8,
    color: '#000000',
  },
  contactLabel: {
    fontWeight: 'bold',
  },
  mainTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  patientInfo: {
    fontSize: 9,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientInfoItem: {
    width: '50%',
    marginBottom: 5,
  },
  controls: {
    fontSize: 9,
    color: '#ff0000',
    marginBottom: 15,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 2,
    backgroundColor: '#add8e6', 
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableCol: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 2,
    fontSize:10 ,
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableColRightBorderNone: {
    borderRightWidth: 0,
  },
  categoryHeader: {
    backgroundColor: '#d3d3d3',
    fontWeight: 'bold',
    fontSize: 12,
    padding: 5,
    textAlign: 'left',
  },
  gujaratiText: {
    fontFamily: 'NotoSansGujarati',
  },
  hindiText:{
    fontFamily: 'NotoSansDevanagari',
  },
  marathiText: {
    fontFamily: 'NotoSansDevanagari',
  },
  highlightedRow: {
    backgroundColor: '#fffacd', // Medium yellow (Lemon Chiffon) - between bright and light yellow
  },
  highlightedText: {
    color: '#ff0000', // Red text
  },
  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  patientInfoLabel: {
    width: '13%',
    fontWeight: 'bold',
  },
  patientInfoValue: {
    width: '37%',
  },
  patientInfoLabelRight: {
    width: '13%',
    fontWeight: 'bold',
  },
  patientInfoValueRight: {
    width: '37%',
  },
  vitalsSection: {
    marginTop: 20,
    marginBottom: 15,
  },
  vitalsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  vitalsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  vitalsColLeft: {
    width: '50%',
  },
  vitalsColRight: {
    width: '50%', // Adjust spacing as needed
  },
  vitalsItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  vitalsLabel: {
    width: '25%', // Adjust as needed
    fontWeight: 'bold',
  },
  vitalsValue: {
    width: '75%', // Adjust as needed
  },
  headerDoctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerDoctorDetails: {
    fontSize: 9,
    fontWeight: 'normal',
    marginBottom: 1,
    color: '#444',
  },
  timesNewRoman: {
    fontFamily: 'TimesNewRoman',
   // fontSize: 10,
  },
});

// Utility to safely extract a string from a translation object or return the string itself
const getLangString = (val, lang = 'english') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val[lang]) return val[lang];
  // fallback: return first string value
  const first = Object.values(val).find(v => typeof v === 'string' && v.trim());
  return first || '';
};

// Helper function to get Hindi and Gujarati names from populated allergenId or fallback
const getHindiName = (allergen) =>
  allergen?.allergenId?.name?.hindi || allergen?.hindi || '';
const getGujaratiName = (allergen) =>
  allergen?.allergenId?.name?.gujarati || allergen?.gujarati || '';

// Helper function to get Marathi name from populated allergenId or fallback
const getMarathiName = (allergen) =>
  allergen?.allergenId?.name?.marathi || allergen?.marathi || '';

// Helper function to check if a language value is from fallback (not from DB)
const isFallbackLang = (allergen, lang) => {
  if (!allergen?.allergenId?.name || !allergen?.allergenId?.name[lang]) {
    return !!allergen?.[lang];
  }
  return false;
};

// Helper function to detect script type in text
const detectScript = (text) => {
  if (!text) return 'english';
  
  // Check for Gujarati script (Unicode range: \u0A80-\u0AFF)
  const gujaratiPattern = /[\u0A80-\u0AFF]/;
  if (gujaratiPattern.test(text)) return 'gujarati';
  
  // Check for Devanagari script (used for Hindi and Marathi) (Unicode range: \u0900-\u097F)
  const devanagariPattern = /[\u0900-\u097F]/;
  if (devanagariPattern.test(text)) return 'hindi'; // or 'devanagari'
  
  return 'english';
};

// Helper function to get font family based on detected script
const getFontForScript = (text) => {
  const script = detectScript(text);
  if (script === 'gujarati') return 'NotoSansGujarati';
  if (script === 'hindi') return 'NotoSansDevanagari';
  return 'Roboto'; // default
};

// Helper function to render text with mixed scripts
const renderTextWithFont = (text) => {
  if (!text) return null;
  
  // Split text into segments by detecting script changes
  const segments = [];
  let currentSegment = '';
  let currentScript = null;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charScript = detectScript(char);
    
    if (currentScript === null) {
      currentScript = charScript;
      currentSegment = char;
    } else if (currentScript === charScript) {
      currentSegment += char;
    } else {
      // Script changed, save current segment
      segments.push({ text: currentSegment, script: currentScript });
      currentScript = charScript;
      currentSegment = char;
    }
  }
  
  // Add the last segment
  if (currentSegment) {
    segments.push({ text: currentSegment, script: currentScript });
  }
  
  // If only one script, return simple text with font
  if (segments.length === 1) {
    const fontFamily = getFontForScript(text);
    return <Text style={{ fontFamily }}>{text}</Text>;
  }
  
  // Multiple scripts, render each segment with its font
  return (
    <Text>
      {segments.map((seg, idx) => {
        const fontFamily = getFontForScript(seg.text);
        return <Text key={idx} style={{ fontFamily }}>{seg.text}</Text>;
      })}
    </Text>
  );
};

// Create Document Component
const PatchReport = ({ data, selectedDoctor }) => {
  // Debug logging
  console.log('PatchReport data:', data);
  
  // Helper function to handle empty values
  const getValue = (value) => {
    if (value === undefined || value === null || value === 'N/A') return '';
    return value;
  };

  // Extract allergies array from data
  const allergies = data.allergies || [];

  // Prepare doctor names view outside of JSX
  let doctorNamesView;
  if (selectedDoctor) {
    if (selectedDoctor === 'vipul') {
      doctorNamesView = (
        <View style={{ marginTop: 150, paddingHorizontal: 30, alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ff0000', textAlign: 'right', marginBottom: 4 }}>DR. VIPUL SHAH</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>MBSACI, DAAI (U.S.A.), Ph.D.</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>Certified allergologist by ICAAAI &</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>British society of Allergy, Asthma and Immunology.</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>Master Degree in Allergy WARWIC, U.K.</Text>
        </View>
      );
    } else if (selectedDoctor === 'eshita') {
      doctorNamesView = (
        <View style={{ marginTop: 150, paddingHorizontal: 30, alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ff0000', textAlign: 'right', marginBottom: 4 }}>DR. ESHITA SHAH</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>M.D (Pulmonary Medicine)</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>ERDM, FIP</Text>
        </View>
      );
    } else if (selectedDoctor === 'both') {
      doctorNamesView = (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 80, paddingHorizontal: 15 }}>
          {/* Dr. Eshita Shah - Left Side */}
          <View style={{ alignItems: 'flex-start', width: '48%', paddingLeft: 5 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ff0000', textAlign: 'left', marginBottom: 4 }}>DR. ESHITA SHAH</Text>
            <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'left', marginBottom: 2 }}>M.D (Pulmonary Medicine)</Text>
            <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'left', marginBottom: 2 }}>ERDM, FIP</Text>
          </View>
          {/* Dr. Vipul Shah - Right Side */}
          <View style={{ alignItems: 'flex-end', width: '50%', paddingRight: 5 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ff0000', textAlign: 'right', marginBottom: 4 }}>DR. VIPUL SHAH</Text>
            <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>MBSACI, DAAI (U.S.A.), Ph.D.</Text>
            <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>Certified allergologist by ICAAAI &</Text>
            <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>British society of Allergy, Asthma and Immunology.</Text>
            <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>Master Degree in Allergy WARWIC, U.K.</Text>
          </View>
        </View>
      );
    }
  }

  return (
    <Document title={`Patch Test Report - ${data.basicInfo?.name + ' ' +  data.patientID || ''}`}>
      <Page size="A4" style={styles.page}>
        {/* Centered Image at Top (match AllergyReport.js) */}
        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 18, marginTop: 0 }}>
          <Image src="/image_all.jpg" style={{ height: 300, width: 420, objectFit: 'contain' }} />
        </View>
        {/* Doctors Row (match AllergyReport.js) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <View style={{ width: '50%', marginLeft: 30 }}>
            <Text style={styles.headerDoctorName}>DR. ESHITA SHAH</Text>
            <Text style={styles.headerDoctorDetails}>M.D (Pulmonary Medicine)</Text>
            <Text style={styles.headerDoctorDetails}>ERDM, FIP</Text>
            <Text style={styles.headerDoctorDetails}>Interventional Pulmonology </Text>
            <Text style={styles.headerDoctorDetails}>& Thoracic Oncology (New Delhi)</Text>
          </View>
          <View style={{ width: '50%', alignItems: 'flex-end', marginRight: 30 }}>
            <Text style={styles.headerDoctorName}>DR. VIPUL SHAH</Text>
            <Text style={styles.headerDoctorDetails}>MBSACI, DAAI (USA), PHD (Allergy)</Text>
            <Text style={styles.headerDoctorDetails}>Specialist in Allergy & Asthma</Text>
            <Text style={styles.headerDoctorDetails}>Tel : 0261-2464747</Text>
            <Text style={styles.headerDoctorDetails}>Mo. 9824124747</Text>
          </View>
        </View>
        {/* Title centered */}
        <View style={{ alignItems: 'center', width: '100%', marginBottom: 10 }}>
          <Text style={styles.mainTitle}>ALLERGY PATCH TESTING REPORT</Text>
        </View>
        {/* Patient Details Title */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginTop: 20 }}>Patient Details</Text>
        </View>
        {/* Patient Info with two columns */}
        <View style={{ marginLeft: 40, marginRight: 0, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Left Column */}
            <View style={{ flexDirection: 'column', width: '48%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Pt's Name: </Text>{getValue(data.basicInfo?.name)}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>UID: </Text>{getValue(data.patientID || '')}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Referred By: </Text>{getValue(data.basicInfo.refBy)}</Text>
            </View>
            {/* Right Column */}
            <View style={{ flexDirection: 'column', width: '35%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Age/Sex: </Text>{getValue(data.basicInfo?.age)}/{getValue(data.basicInfo?.sex)}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Date: </Text>{getValue(new Date(data.createdAt).toLocaleDateString('en-GB'))}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Contact: </Text>{getValue(data.basicInfo?.tel1 || data.basicInfo?.tel2 || data.basicInfo?.tel3)}</Text>
            </View>
          </View>
        </View>
        {/* Vitals Title */}
        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginTop:15}}>Vitals</Text>
        {/* Vitals Section with two columns */}
        <View style={{ marginLeft: 40, marginRight: 0, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Left Column */}
            <View style={{ flexDirection: 'column', width: '48%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>SpO2: </Text>{getValue(data.examination?.spo2)} %</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>BP: </Text>{getValue(data.examination?.bp)} mmHg.</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Ht: </Text>{getValue(data.basicInfo?.height)} {getValue(data.basicInfo?.heightUnit)}</Text>
            </View>
            {/* Right Column */}
            <View style={{ flexDirection: 'column', width: '35%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>PR: </Text>{getValue(data.examination?.pulse)} / min</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>PEFR: </Text>{getValue(data.examination?.pefr)} litre / Se</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Wt: </Text>{getValue(data.basicInfo?.weight)} Kgs</Text>
            </View>
          </View>
        </View>
        {/* Footer (match AllergyReport.js) */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' }}>
          <View style={{ fontWeight: 500, fontSize: 10, backgroundColor: '#fff', padding: 5, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {/* Mail Icon */}
            <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
              <Path d="M2 4h20v16H2z" fill="#888" />
              <Path d="M22 4L12 14 2 4" stroke="#fff" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={{ marginRight: 12 }}>dr_vipul@hotmail.com</Text>
            {/* Internet/Globe Icon */}
            <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
              <Path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0c2.5 2.5 2.5 15.5 0 18m0-18C9.5 4.5 9.5 17.5 12 20m-8-8h16" stroke="#888" strokeWidth="1.5" fill="none" />
            </Svg>
            <Text>www.allergyasthmacure.com</Text>
          </View>
          <View style={{ backgroundColor: '#D8BFD8', padding: 10, textAlign: 'center', width: '100%' }}>
            <Text style={{ fontWeight: 500, fontSize: 10, margin: 0, textAlign: 'center' }}>
              FOR APPOINTMENT: +91 93166 33039
            </Text>
            <Text style={{ fontWeight: 500, fontSize: 10, margin: 0, textAlign: 'center', marginTop: 5 }}>
              102, VISHWAKARMA CHAMBER, NR. VISHWAKARMA MANDIR, MAJURA GATE RING ROAD, SURAT-395002
            </Text>
          </View>
        </View>
      </Page>
      {/* PAGE 2: Table, Advice, Doctor Name */}
      <Page size="A4" style={styles.page}>
        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '12%' }]}> <Text style={styles.timesNewRoman}>Sr. No</Text> </View>
            <View style={[styles.tableColHeader, { width: '70%' }]}> <Text style={styles.timesNewRoman}>Allergy</Text> </View>
            <View style={[styles.tableColHeader, { width: '18%', borderRightWidth: 0 }]}> <Text style={styles.timesNewRoman}>Result</Text> </View>
          </View>
          {/* Table Body */}
          {allergies.map((item, idx) => (
            <View
              key={item._id || idx}
              style={[
                styles.tableRow,
                item.check ? { backgroundColor: '#fffacd' } : null
              ]}
            >
              <View style={[styles.tableCol, { width: '12%' }]}> 
                <Text style={[styles.timesNewRoman, { fontSize: 10 }, item.check ? styles.highlightedText : {}]}>{idx + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: '70%' }]}> 
                <Text style={[styles.timesNewRoman, { fontSize: 10 }, item.check ? styles.highlightedText : {}]}>{item.allergy}</Text>
              </View>
              <View style={[styles.tableCol, { width: '18%', borderRightWidth: 0 }]}> 
                <Text style={[styles.timesNewRoman, { fontSize: 10 }, item.check ? styles.highlightedText : {}]}>{item.result}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* Advice Section */}
        {data.advice && (
          <View style={{ marginTop: 20, marginBottom: 12}}>
            <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 6}}>Advice</Text>
            <View style={{ fontSize: 11 }}>
              {renderTextWithFont(data.advice)}
            </View>
          </View>
        )}
        {/* Doctor Name at the end (single, styled) */}
        {doctorNamesView}
      </Page>
    </Document>
  );
};

export default PatchReport;