import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer';

// Use a direct path to the logo in public directory for PDF generation
// const clinicLogo = '/image_full_logo.png';

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
  contactInfo: {
    fontSize: 8,
    color: '#000000',
  },
  contactLabel: {
    fontWeight: 'bold',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
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
    borderWidth: 0.5,
    borderColor: '#bfbfbf',
    borderBottomWidth: 0,
    borderTopWidth: 0, // remove top border so first row's top border becomes the visible top rule
    borderLeftWidth: 0, // no border at table level
    borderRightWidth: 0, // no border at table level
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5, // thinner left border for all header cells
    padding: 0,
    backgroundColor: '#fff',
    // fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#ff0000',
  },
  tableColHeaderLast: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    padding: 0,
    backgroundColor: '#fff',
    fontSize: 10,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#ff0000',
  },
  tableCol: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5, // ensure a top rule exists for the row (collapses with previous row bottom within same page)
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5, // thinner left border for all data cells
    padding: 1,
    paddingLeft: 5,
    fontSize: 10,
    textAlign: 'left',
    justifyContent: 'left',
    color: '#0074d9',
  },
  tableCol2: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5, // ensure a top rule exists for the row (collapses with previous row bottom within same page)
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5, // thinner left border for all data cells
    padding: 1,
    fontSize: 9,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#0074d9',
  },
  // Collapse adjacent row borders into a single line; across pages they won't overlap, giving separate top/bottom rules
  rowCollapse: {
    marginTop: -1,
  },
  tableColRightBorderNone: {
    borderRightWidth: 0,
  },
  tableColFirstColumn: {
    borderLeftWidth: 0.5, // thinner left border for first column
  },
  tableColLastColumn: {
    borderRightWidth: 0.5, // thinner right border for last column
  },
  categoryHeader: {
    backgroundColor: '#d3d3d3',
    // fontWeight: 'bold',
    fontSize: 9,
    padding: 5,
    textAlign: 'left',
    color: '#ff0000',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
  },
  gujaratiText: {
    fontFamily: 'NotoSansGujarati',
  },
  hindiText: {
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerDoctorDetails: {
    fontSize: 10,
    fontWeight: 'normal',
    marginBottom: 1,
    color: '#444',
  },
  timesNewRoman: {
    fontFamily: 'TimesNewRoman',
    // fontSize: 10
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

// Add category translation mapping at the top:
const CATEGORY_TRANSLATIONS = {
  pollens: { hindi: 'परागराज', gujarati: 'પરાગરજ', marathi: 'परागकण' },
  fungi: { hindi: 'फफूंदी', gujarati: 'ફૂગ', marathi: 'बुरशी' },
  mites: { hindi: 'सूक्ष्म जन्तु', gujarati: 'સૂક્ષ્મ જંતુ', marathi: 'सूक्ष्मजंतू' },
  dusts: { hindi: 'धूल', gujarati: 'ધૂળ\રજ', marathi: 'धूळ' },
  insects: { hindi: 'कीड़े', gujarati: 'કીટકો', marathi: 'कीटक' },
  'dander/epithelia': { hindi: 'रोम/त्वचा', gujarati: 'વાળ/ચામડી', marathi: 'केस/त्वचा' },
  foods: { hindi: 'ख़ुराक', gujarati: 'ખોરાક (EXET PROTEIN)', marathi: 'अन्न' },
  miscellaneous: { hindi: 'विविध', gujarati: 'વિવિધ', marathi: 'विविध' },
};

// Utility style for unbreakable rows
const unbreakableRow = { breakInside: 'avoid' };

// Helper to strip zero-width characters that cause fontkit GPOS crash in @react-pdf/renderer
const cleanText = (str) => (typeof str === 'string' ? str.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '') : (str || ''));

const getFoodType = (allergen) => {
  if (!allergen) return 'Veg';
  if (allergen.foodCategory) {
    switch (allergen.foodCategory.toLowerCase()) {
      case 'veg': return 'Veg';
      case 'jain': return 'Non Jain';
      case 'non-veg': return 'Non-Veg';
    }
  }
  if (!allergen.name?.english) return 'Veg';
  const foodName = allergen.name.english.toLowerCase();
  const nonVegFoods = [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'crab', 'lobster',
    'oyster', 'clam', 'mussel', 'scallop', 'squid', 'octopus', 'duck',
    'turkey', 'goose', 'quail', 'pheasant', 'venison', 'rabbit', 'goat',
    'mutton', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'anchovy',
    'tuna', 'salmon', 'cod', 'halibut', 'mackerel', 'sardine', 'herring',
    'trout', 'catfish', 'tilapia', 'swordfish', 'mahi mahi', 'grouper',
    'red snapper', 'sea bass', 'egg', 'eggs', 'yolk', 'albumin',
    'ovalbumin', 'ovomucoid', 'lysozyme'
  ];
  const jainFoods = [
    'potato', 'onion', 'garlic', 'ginger', 'carrot', 'radish', 'turnip',
    'beetroot', 'sweet potato', 'yam', 'taro', 'cassava', 'parsnip',
    'rutabaga', 'celeriac', 'horseradish', 'wasabi', 'leek', 'shallot',
    'chive', 'scallion', 'spring onion', 'asafoetida', 'hing', 'mushroom',
    'truffle', 'morel', 'chanterelle', 'shiitake', 'oyster mushroom',
    'portobello', 'cremini', 'enoki', 'maitake', 'reishi'
  ];
  if (nonVegFoods.some(food => foodName.includes(food))) return 'Non-Veg';
  if (jainFoods.some(food => foodName.includes(food))) return 'Non Jain';
  return 'Veg';
};

// Create Document Component
const AllergyReport = (props) => {
  const { data, allAllergies = [], selectedDoctors } = props;
  // Debug logs
  console.log('AllergyReport props:', props);
  console.log('selectedDoctors:', selectedDoctors, 'type:', typeof selectedDoctors);

  // Helper function to handle empty values
  const getValue = (value) => {
    if (value === undefined || value === null || value === 'N/A') return '';
    return value;
  };

  // Destructure relevant data
  const { basicInfo, examination, patientID, reportType } = data;

  // Determine the title based on report type
  const getReportTitle = () => {
    if (reportType === 'Specific IgE') {
      return 'ALLERGY SPECIFIC IGE TEST REPORT (MODIFIED PRICK TEST METHOD)';
    } else {
      return 'ALLERGY SKIN TESTING REPORT (MODIFIED PRICK TEST METHOD)';
    }
  };

  // Helper function to render a separate table per category (continuous Sr No maintained)
  const renderCategoryTables = () => {
    let srNo = 1;
    const tables = [];
    const regLang = (props.selectedRegionalLanguage || data.regionalLanguage || 'gujarati').toLowerCase();
    const isMarathi = regLang === 'marathi';

    const getRegionalName = (dbA, userVal) => {
      const dbNameObj = (dbA && typeof dbA.name === 'object') ? dbA.name : {};
      const dbMarathi = dbNameObj.marathi || dbA?.marathi;
      const dbGujarati = dbNameObj.gujarati || dbA?.gujarati;
      const dbHindi = dbNameObj.hindi || dbA?.hindi;

      if (isMarathi) {
        if (dbMarathi && dbMarathi.trim() !== '') return dbMarathi;
        if (userVal?.marathi && userVal.marathi.trim() !== '') return userVal.marathi;
        if (dbHindi && dbHindi.trim() !== '') return dbHindi;
        if (userVal?.hindi && userVal.hindi.trim() !== '') return userVal.hindi;
        return typeof dbA?.name === 'string' ? dbA.name : (dbA?.name?.english || userVal?.name || '');
      } else {
        if (dbGujarati && dbGujarati.trim() !== '') return dbGujarati;
        if (userVal?.gujarati && userVal.gujarati.trim() !== '') return userVal.gujarati;
        return typeof dbA?.name === 'string' ? dbA.name : (dbA?.name?.english || userVal?.name || '');
      }
    };

    const getRegionalHeaderTitle = () => (isMarathi ? 'मराठी' : 'ગુજરાતી');
    const getRegionalFontFamily = () => (isMarathi ? 'NotoSansDevanagari' : 'NotoSansGujarati');
    const getRegionalTextStyle = () => (isMarathi ? styles.hindiText : styles.gujaratiText);
    const standardCategoryOrder = [
      'pollens',
      'fungi',
      'mites',
      'dusts',
      'insects',
      'dander/epithelia',
      'foods',
      'miscellaneous'
    ];

    const categories = Object.keys(data.allergens || {}).sort((a, b) => {
      const idxA = standardCategoryOrder.indexOf(a.toLowerCase());
      const idxB = standardCategoryOrder.indexOf(b.toLowerCase());
      const posA = idxA !== -1 ? idxA : 999;
      const posB = idxB !== -1 ? idxB : 999;
      return posA - posB;
    });

    categories.forEach(category => {
      let dbAlls = Array.isArray(allAllergies) ? allAllergies.filter(a => (a.category || '').toLowerCase() === category.toLowerCase()) : [];
      if (dbAlls.length === 0 && Array.isArray(data.allergens[category]) && data.allergens[category].length > 0) {
        dbAlls = data.allergens[category].map((u, idx) => ({
          _id: u.allergenId || `fallback-${idx}`,
          category: category,
          name: typeof u.name === 'object' ? u.name : { english: u.name || '', hindi: u.hindi || '', gujarati: u.gujarati || '' },
          foodCategory: u.foodCategory || 'veg',
          period: u.period || '',
          sourceof: u.sourceof || ''
        }));
      }
      dbAlls = dbAlls.map(item => ({
        ...item,
        name: item.name ? {
          ...item.name,
          english: cleanText(item.name.english),
          hindi: cleanText(item.name.hindi),
          gujarati: cleanText(item.name.gujarati),
          marathi: cleanText(item.name.marathi)
        } : {},
        period: cleanText(item.period),
        sourceof: cleanText(item.sourceof)
      }));
      const lowerCat = category.toLowerCase();
      if (dbAlls.length > 0) {
        // Build rows for this category
        const catRows = [];
        // Special handling for foods category
        if (lowerCat === 'foods') {
          // Add category header with translations (gray background)
          const rawCatTrans = CATEGORY_TRANSLATIONS[lowerCat] || { hindi: '', gujarati: '', marathi: '' };
          const catTrans = { hindi: cleanText(rawCatTrans.hindi), regional: cleanText(isMarathi ? rawCatTrans.marathi : rawCatTrans.gujarati) };
          catRows.push(
            <View key={category + '-cat'} style={styles.tableRow}>
              <View style={[styles.categoryHeader, { width: '100%' }]}>
                <Text style={{ color: '#ff0000' }}>
                  <Text style={styles.timesNewRoman}>{category}</Text> / {' '}
                  <Text style={[styles.hindiText, { color: '#ff0000' }]}>{catTrans.hindi}</Text> / {' '}
                  <Text style={[getRegionalTextStyle(), { color: '#ff0000' }]}>{catTrans.regional}</Text>
                </Text>
              </View>
            </View>
          );
          // Table header (once)
          let headerCols = [
            <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
            <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
            <View style={[styles.tableColHeader, { width: '31%' }]} key="hindi"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: 'NotoSansDevanagari' }]}>हिंदी</Text></View>,
            <View style={[styles.tableColHeader, { width: '20%' }]} key="regional"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: getRegionalFontFamily() }]}>{getRegionalHeaderTitle()}</Text></View>,
            <View style={[styles.tableColHeader, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
            <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
          ];
          catRows.push(<View style={styles.tableRow} key={category + '-header'}>{headerCols}</View>);

          // Map user-filled by name (case-insensitive)
          const userFilled = (data.allergens[category] || []);
          const userMap = {};
          userFilled.forEach(u => {
            userMap[(u.name || '').trim().toLowerCase()] = u;
          });

          // Split foods by foodCategory using getFoodType helper
          const jainFoods = dbAlls.filter(a => getFoodType(a) === 'Veg');
          const nonJainFoods = dbAlls.filter(a => getFoodType(a) === 'Non Jain');
          const nonVegFoods = dbAlls.filter(a => getFoodType(a) === 'Non-Veg');

          // Jain foods (no heading) - continue SR numbering
          jainFoods.forEach((dbA) => {
            const key = (dbA.name?.english || '').trim().toLowerCase();
            const userVal = userMap[key];
            let rowCols = [
              <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
              <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
              <View style={[styles.tableCol2, { width: '31%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
              <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA, userVal)}</Text></View>,
              <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
              <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                <Svg width="12" height="12" viewBox="0 0 24 24">
                  <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                </Svg>
              ) : null}</View>,
            ];
            const highlight = userVal && userVal.val >= 3;
            catRows.push(
              <View style={[styles.tableRow, styles.rowCollapse, highlight && styles.highlightedRow, unbreakableRow]} wrap={false} key={dbA._id}>
                {rowCols.map((col, idx) =>
                  React.cloneElement(col, {
                    key: col.key || idx,
                    children: React.Children.map(col.props.children, child =>
                      React.isValidElement(child)
                        ? React.cloneElement(child, { style: [child.props.style, highlight && styles.highlightedText] })
                        : child
                    )
                  })
                )}
              </View>
            );
          });

          // Non-Jain foods (with heading)
          if (nonJainFoods.length > 0) {
            catRows.push(
              <View key="non-jain-heading" style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: '5%' }]}>
                </View>
                <View style={[styles.tableColHeader, { width: '31%' }]}>
                  <Text style={{ color: '#ff0000', fontSize: 10 }}>NON JAIN FOOD</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '31%' }]}>
                  <Text style={{ color: '#ff0000', fontSize: 10, fontFamily: 'NotoSansDevanagari' }}>हिंदी</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '20%' }]}>
                  <Text style={{ color: '#ff0000', fontSize: 10, fontFamily: getRegionalFontFamily() }}>{getRegionalHeaderTitle()}</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '6%' }]}></View>
                <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]}></View>
              </View>
            );
            nonJainFoods.forEach((dbA) => {
              const key = (dbA.name?.english || '').trim().toLowerCase();
              const userVal = userMap[key];
              let rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '31%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA, userVal)}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
              const highlight = userVal && userVal.val >= 3;
              catRows.push(
                <View style={[styles.tableRow, styles.rowCollapse, highlight && styles.highlightedRow, unbreakableRow]} wrap={false} key={dbA._id}>
                  {rowCols.map((col, idx) =>
                    React.cloneElement(col, {
                      key: col.key || idx,
                      children: React.Children.map(col.props.children, child =>
                        React.isValidElement(child)
                          ? React.cloneElement(child, { style: [child.props.style, highlight && styles.highlightedText] })
                          : child
                      )
                    })
                  )}
                </View>
              );
            });
          }

          // Non-Veg foods (with heading)
          if (nonVegFoods.length > 0) {
            catRows.push(
              <View key="non-veg-heading" style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: '5%' }]}>
                </View>
                <View style={[styles.tableColHeader, { width: '31%' }]}>
                  <Text style={{ color: '#ff0000', fontSize: 10 }}>
                    <Text>NON VEG FOOD \</Text>
                    <Text style={[getRegionalTextStyle()]}>{isMarathi ? ' मांसाहारी' : ' માંસાહારી'}</Text>
                  </Text>
                </View>
                <View style={[styles.tableColHeader, { width: '31%' }]}>
                  <Text style={{ color: '#ff0000', fontSize: 10, fontFamily: 'NotoSansDevanagari' }}>हिंदी</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '20%' }]}>
                  <Text style={{ color: '#ff0000', fontSize: 10, fontFamily: getRegionalFontFamily() }}>{getRegionalHeaderTitle()}</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '6%' }]}></View>
                <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]}></View>
              </View>
            );
            nonVegFoods.forEach((dbA) => {
              const key = (dbA.name?.english || '').trim().toLowerCase();
              const userVal = userMap[key];
              let rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '31%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA, userVal)}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
              const highlight = userVal && userVal.val >= 3;
              catRows.push(
                <View style={[styles.tableRow, styles.rowCollapse, highlight && styles.highlightedRow, unbreakableRow]} wrap={false} key={dbA._id}>
                  {rowCols.map((col, idx) =>
                    React.cloneElement(col, {
                      key: col.key || idx,
                      children: React.Children.map(col.props.children, child =>
                        React.isValidElement(child)
                          ? React.cloneElement(child, { style: [child.props.style, highlight && styles.highlightedText] })
                          : child
                      )
                    })
                  )}
                </View>
              );
            });
          }
        } else {
          // Add category header with translations
          const lowerCat = category.toLowerCase();
          const rawCatTrans = CATEGORY_TRANSLATIONS[lowerCat] || { hindi: '', gujarati: '', marathi: '' };
          const catTrans = { hindi: cleanText(rawCatTrans.hindi), regional: cleanText(isMarathi ? rawCatTrans.marathi : rawCatTrans.gujarati) };
          catRows.push(
            <View key={category + '-cat'} style={styles.tableRow}>
              <View style={[styles.categoryHeader, { width: '100%' }]}>
                <Text style={{ color: '#ff0000' }}>
                  <Text style={styles.timesNewRoman}>{category}</Text> / {' '}
                  <Text style={[styles.hindiText, { color: '#ff0000' }]}>{catTrans.hindi}</Text> / {' '}
                  <Text style={[getRegionalTextStyle(), { color: '#ff0000' }]}>{catTrans.regional}</Text>
                </Text>
              </View>
            </View>
          );
          // Render category-specific table header
          let headerCols = [];
          if (lowerCat === 'pollens') {
            headerCols = [
              <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="hindi"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: 'NotoSansDevanagari' }]}>हिंदी</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="regional"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: getRegionalFontFamily() }]}>{getRegionalHeaderTitle()}</Text></View>,
              <View style={[styles.tableColHeader, { width: '14%' }]} key="period">
                <Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Pollination</Text>
                <Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Period</Text>
              </View>,
              <View style={[styles.tableColHeaderLast, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
              <View style={[styles.tableColHeaderLast, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
            ];
          } else if (lowerCat === 'fungi') {
            headerCols = [
              <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
              <View style={[styles.tableColHeader, { width: '46%' }]} key="source"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Source of Origin</Text></View>,
              <View style={[styles.tableColHeader, { width: '14%' }]} key="spor">
                <Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sporolation</Text>
                <Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Period</Text>
              </View>,
              <View style={[styles.tableColHeader, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
              <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
            ];
          } else if (lowerCat === 'dusts' || lowerCat === 'mites') {
            headerCols = [
              <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
              <View style={[styles.tableColHeader, { width: '60%' }]} key="source"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Source of Origin (Prevalance)</Text></View>,
              <View style={[styles.tableColHeader, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
              <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
            ];
          } else if (lowerCat === 'dander/epithelia') {
            headerCols = [
              <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="hindi"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: 'NotoSansDevanagari' }]}>हिंदी</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="regional"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: getRegionalFontFamily() }]}>{getRegionalHeaderTitle()}</Text></View>,
              <View style={[styles.tableColHeader, { width: '14%' }]} key="source"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Source</Text></View>,
              <View style={[styles.tableColHeader, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
              <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
            ];
          } else if (lowerCat === 'insects') {
            headerCols = [
              <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="hindi"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: 'NotoSansDevanagari' }]}>हिंदी</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="regional"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: getRegionalFontFamily() }]}>{getRegionalHeaderTitle()}</Text></View>,
              <View style={[styles.tableColHeader, { width: '14%' }]} key="blank"></View>,
              <View style={[styles.tableColHeader, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
              <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
            ];
          } else {
            headerCols = [
              <View style={[styles.tableColHeader, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Sr No.</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Name (English)</Text></View>,
              <View style={[styles.tableColHeader, { width: '31%' }]} key="hindi"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: 'NotoSansDevanagari' }]}>हिंदी</Text></View>,
              <View style={[styles.tableColHeader, { width: '20%' }]} key="regional"><Text style={[styles.timesNewRoman, { color: '#ff0000' }, { fontFamily: getRegionalFontFamily() }]}>{getRegionalHeaderTitle()}</Text></View>,
              <View style={[styles.tableColHeader, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Wheal Dia mm</Text></View>,
              <View style={[styles.tableColHeader, styles.tableColLastColumn, { width: '8%' }]} key="erythema"><Text style={[styles.timesNewRoman, { color: '#ff0000' }]}>Erythema D+d 2mm</Text></View>,
            ];
          }
          catRows.push(<View style={styles.tableRow} key={category + '-header'}>{headerCols}</View>);
          // Map user-filled by name (case-insensitive)
          const userFilled = (data.allergens[category] || []);
          const userMap = {};
          userFilled.forEach(u => {
            userMap[(u.name || '').trim().toLowerCase()] = u;
          });
          // Add all DB allergies for this category
          dbAlls.forEach((dbA) => {
            const key = (dbA.name?.english || '').trim().toLowerCase();
            const userVal = userMap[key];
            // Render category-specific row
            let rowCols = [];
            if (lowerCat === 'pollens') {
              rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA, userVal)}</Text></View>,
                <View style={[styles.tableCol2, { width: '14%' }]} key="period"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.period || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
            } else if (lowerCat === 'fungi') {
              rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '46%' }]} key="source"><Text style={[styles.timesNewRoman, { color: '#0074d9' }]}>{dbA.sourceof || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '14%' }]} key="spor"><Text style={[styles.timesNewRoman, { color: '#0074d9' }]}>{dbA.period || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
            } else if (lowerCat === 'dusts' || lowerCat === 'mites') {
              rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '60%' }]} key="source"><Text style={[styles.timesNewRoman, { color: '#0074d9' }]}>{dbA.sourceof || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
            } else if (lowerCat === 'dander/epithelia') {
              rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA, userVal)}</Text></View>,
                <View style={[styles.tableCol2, { width: '14%' }]} key="source"><Text style={[styles.timesNewRoman, { color: '#0074d9' }]}>{dbA.sourceof || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
            } else if (lowerCat === 'insects') {
              rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA, userVal)}</Text></View>,
                <View style={[styles.tableCol2, { width: '14%' }]} key="blank"></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
            } else {
              rowCols = [
                <View style={[styles.tableCol, { width: '5%' }]} key="sr"><Text style={[styles.timesNewRoman, userVal && userVal.val >= 3 && styles.highlightedText]}>{srNo++}</Text></View>,
                <View style={[styles.tableCol, { width: '31%' }]} key="eng"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.english || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '31%' }]} key="hindi"><Text style={[styles.hindiText, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{dbA.name?.hindi || ''}</Text></View>,
                <View style={[styles.tableCol2, { width: '20%' }]} key="regional"><Text style={[getRegionalTextStyle(), { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{getRegionalName(dbA.name)}</Text></View>,
                <View style={[styles.tableCol2, { width: '6%' }]} key="wheal"><Text style={[styles.timesNewRoman, { color: '#0074d9' }, userVal && userVal.val >= 3 && styles.highlightedText]}>{userVal ? userVal.val : ''}</Text></View>,
                <View style={[styles.tableCol2, styles.tableColLastColumn, { width: '8%', alignItems: 'center' }]} key="erythema">{userVal && userVal.isChecked ? (
                  <Svg width="12" height="12" viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={userVal.val >= 3 ? '#ff0000' : '#0074d9'} />
                  </Svg>
                ) : null}</View>,
              ];
            }
            const highlight = userVal && userVal.val >= 3;
            catRows.push(
              <View style={[styles.tableRow, styles.rowCollapse, highlight && styles.highlightedRow, unbreakableRow]} wrap={false} key={dbA._id}>
                {rowCols.map((col, idx) =>
                  React.cloneElement(col, {
                    key: col.key || idx,
                    children: React.Children.map(col.props.children, child =>
                      React.isValidElement(child)
                        ? React.cloneElement(child, { style: [child.props.style, highlight && styles.highlightedText] })
                        : child
                    )
                  })
                )}
              </View>
            );
          });
        }
        // Push completed category table
        tables.push(
          <View key={`table-${category}`} style={[styles.table, { marginBottom: 8 }]}>
            {catRows}
          </View>
        );
      }
    });
    return tables;
  };

  // Prepare doctor names view outside of JSX
  let doctorNamesView;
  if (props.selectedDoctor) {
    if (props.selectedDoctor === 'vipul') {
      doctorNamesView = (
        <View style={{ marginTop: 150, paddingHorizontal: 30, alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ff0000', textAlign: 'right', marginBottom: 4 }}>DR. VIPUL SHAH</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>MBSACI, DAAI (U.S.A.), Ph.D.</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>Certified allergologist by ICAAAI &</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>British society of Allergy, Asthma and Immunology.</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>Master Degree in Allergy WARWIC, U.K.</Text>
        </View>
      );
    } else if (props.selectedDoctor === 'eshita') {
      doctorNamesView = (
        <View style={{ marginTop: 150, paddingHorizontal: 30, alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ff0000', textAlign: 'right', marginBottom: 4 }}>DR. ESHITA SHAH</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>M.D (Pulmonary Medicine)</Text>
          <Text style={{ fontSize: 11, color: '#ff0000', textAlign: 'right', marginBottom: 2 }}>ERDM, FIP</Text>
        </View>
      );
    } else if (props.selectedDoctor === 'both') {
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
    } else {
      doctorNamesView = (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 70, paddingHorizontal: 30 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>DR. VIPUL SHAH</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>DR. ESHITA V. SHAH</Text>
        </View>
      );
    }
  } else {
    doctorNamesView = (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 70, paddingHorizontal: 30 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>DR. VIPUL SHAH</Text>
        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>DR. ESHITA V. SHAH</Text>
      </View>
    );
  }

  return (
    <Document title={`${getReportTitle()} - ${data.basicInfo?.name + ' ' + data.patientID || ''}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        {/* Centered Image at Top with reduced top margin */}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18, marginTop: 0 }}>
          <Image src="/image_all.jpg" style={{ height: 300, width: 420, objectFit: 'contain' }} />
        </View>
        {/* Address */}

        {/* Doctors Row */}
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

        {/* Title centered without lines or side elements */}
        <View style={{ alignItems: 'center', width: '100%', marginBottom: 10 }}>
          <Text style={styles.mainTitle}>{getReportTitle()}</Text>
        </View>
        {/* Patient Details Title */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginTop: 20 }}>Patient Details</Text>
        </View>
        {/* Patient Info with two columns: left (Pt's Name, UID, Referred By), right (Age/Sex, Date, Contact) */}
        <View style={{ marginLeft: 40, marginRight: 0, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Left Column */}
            <View style={{ flexDirection: 'column', width: '48%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Pt's Name: </Text>{getValue(basicInfo?.name)}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>UID: </Text>{getValue(patientID || '')}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Referred By: </Text>{getValue(basicInfo.refBy)}</Text>
            </View>
            <View style={{ flexDirection: 'column', width: '35%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Age/Sex: </Text>{getValue(basicInfo?.age)}/{getValue(basicInfo?.sex)}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Date: </Text>{getValue(new Date(data.createdAt).toLocaleDateString('en-GB'))}</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Contact: </Text>{getValue(basicInfo?.tel1 || basicInfo?.tel2 || basicInfo?.tel3)}</Text>
            </View>
          </View>
        </View>

        {/* Vitals Title */}
        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginTop: 15 }}>Vitals</Text>
        {/* Vitals Section with two columns: left (SpO2, BP, Ht), right (PR, PEFR, Wt) */}
        <View style={{ marginLeft: 40, marginRight: 0, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Left Column */}
            <View style={{ flexDirection: 'column', width: '48%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>SpO2: </Text>{getValue(examination?.spo2)} %</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>BP: </Text>{getValue(examination?.bp)} mmHg.</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Ht: </Text>{getValue(basicInfo?.height)} {getValue(basicInfo?.heightUnit)}</Text>
            </View>
            {/* Right Column */}
            <View style={{ flexDirection: 'column', width: '35%' }}>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>PR: </Text>{getValue(examination?.pulse)} / min</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>PEFR: </Text>{getValue(examination?.pefr)} litre / Se</Text>
              <Text style={{ fontSize: 11, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>Wt: </Text>{getValue(basicInfo?.weight)} Kgs</Text>
            </View>
          </View>
        </View>
        {/* <Text style={{ textAlign: 'center', fontSize: 10, marginBottom: 30, marginTop: 30 }}>
          101, Vishwakarma Chamber, Near Vishwakarma Mandir, Manek Gala, Surat- 305 002.
        </Text> */}
        {/* --- FOOTER (copied from prescription PDF) --- */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' }}>
          <View style={{ fontWeight: 500, fontSize: 10, backgroundColor: '#fff', padding: 5, textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {/* Mail Icon */}
            <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
              <Path d="M2 4h20v16H2z" fill="#888" />
              <Path d="M22 4L12 14 2 4" stroke="#fff" strokeWidth="2" fill="none" />
            </Svg>
            <Text style={{ marginRight: 12 }}>dr_vipul@hotmail.com</Text>
            {/* Internet/Globe Icon */}
            {/* <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
              <Path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0c2.5 2.5 2.5 15.5 0 18m0-18C9.5 4.5 9.5 17.5 12 20m-8-8h16" stroke="#888" strokeWidth="1.5" fill="none" />
            </Svg>
            <Text>www.dreshitashah.com</Text> */}
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
      {/* PAGE 2: Controls, Table, Remarks, Doctor Names */}
      <Page size="A4" style={styles.page}>
        {/* Controls in one line with space between */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginTop: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', color: 'red' }}>
            <Text >POSITIVE CONTROL :- (HISTAMINE 2HCL)&nbsp;&nbsp;</Text>
            <View style={{ borderBottom: '1px solid #FF0000', alignSelf: 'flex-end', paddingBottom: 1, color: 'red' }}>
              <Text>{data.positive} mm</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', color: 'red' }}>
            <Text>NEGATIVE CONTROL :- (GLYCERO-SALINE)&nbsp;&nbsp;</Text>
            <View style={{ borderBottom: '1px solid #FF0000', alignSelf: 'flex-end', paddingBottom: 1 }}>
              <Text>{data.negative} mm</Text>
            </View>
          </View>
        </View>

        {/* Tables per category */}
        {renderCategoryTables()}

        {/* Static Remarks Section */}
        {/* Static Remarks Section */}
        <View style={{ marginTop: 15, padding: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 6, color: '#ff0000' }}>Remarks:</Text>
          <Text style={{ fontSize: 9, marginBottom: 8, textAlign: 'justify', color: '#ff0000' }}>
            Diagnostic allergens are formulated to establish concentrations appropriate for testing for specific allergies involved. Substances which produce allergy are known as allergens. The first step in controlling allergy is to identify the allergens. Prick Skin Test can be very useful in immediate type allergy such as allergic rhinitis, asthma etc. Avoidance of exposure to allergens is the better way of management of allergic manifestations. Allergen immuno-therapy (desensitization) is recommended in cases (especially IgE mediated allergies) where avoidance is not practical. If possible, it is advisable to institute pre-seasonal immunotherapy especially in case of pollen allergens. Co-seasonal immunotherapy can be administered with some precautionary measures. Compliance of environmental control would be advantageous. Hypersensitivity to foods should be confirmed by a clinical trial. It is advised that patient should avoid the food which he / she is sensitive for better results.
          </Text>
          {/* Special Advises Section (dynamic) */}
          {data.specialAdvices && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 6, color: '#ff0000' }}>Special Advises:</Text>
              {[
                { key: 'immunotherapy', label: 'Allergen Immunotherapy' },
                { key: 'oralSublingual', label: 'Allergen Immunotherapy ORAL / Sublingual' },
                { key: 'srsInjections', label: 'Allergen Immunotherapy SRS Injections.' },
                { key: 'oralSrsSublingual', label: 'Allergen Immunotherapy ORAL SRS / Sublingual' }
              ].map(({ key, label }) => {
                const isChecked = data.specialAdvices[key] || false;
                return (
                  <View key={key} style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#ff0000', marginRight: 4 }}>•</Text>
                    <Text style={{ fontSize: 10, color: '#ff0000' }}>{label}</Text>
                    {isChecked && (
                      <Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginLeft: 4 }}>
                        <Path
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                          fill="#ff0000"
                        />
                      </Svg>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          <Text style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 6, color: '#ff0000' }}>Advises to the patient :</Text>
          <Text style={{ marginBottom: 2, color: '#ff0000' }}>Stop the medication only after consulting the doctor.</Text>
        </View>
        {doctorNamesView}
      </Page>
    </Document>
  );
};

export default AllergyReport;
